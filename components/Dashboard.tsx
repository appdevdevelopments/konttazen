import React, { useState, useEffect } from "react";
import { Transaction, CreditCard, FamilyContext } from "../types";
import { Plus, TrendingUp, TrendingDown, Wallet, CreditCard as CreditCardIcon, AlertCircle, Users } from "./icons";
import { format, isValid } from "date-fns";
// Fix: Changed import for ptBR locale to be a direct default import to fix module resolution issue.
import ptBR from "date-fns/locale/pt-BR";
import StatCard from "./dashboard/StatCard";
import ExpenseChart from "./dashboard/ExpenseChart";
import BalanceChart from "./dashboard/BalanceChart";
import { Alert, AlertDescription } from "./ui/Alert";
import { Badge } from "./ui/Badge";
import { formatCurrency, formatPercent } from "../utils/formatters";
import { filterTransactions, filterCreditCards, getUserFamilyContext } from '../services/dataService';

export default function Dashboard() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [familyContext, setFamilyContext] = useState<FamilyContext | null>(null);

  const currentMonth = format(new Date(), "yyyy-MM");
  const currentMonthName = format(new Date(), "MMMM yyyy", { locale: ptBR });

  useEffect(() => {
    const loadData = async () => {
        setLoading(true);
        
        const context = await getUserFamilyContext();
        setFamilyContext(context);

        if (!context.user) {
        setLoading(false);
        return;
        }

        const myTransactions = await filterTransactions({ created_by: context.user.email });
        const myCards = await filterCreditCards({ created_by: context.user.email });
        
        if (context.hasFamily) {
        const allTransactions = [...myTransactions];
        const allCards = [...myCards];
        
        for (const email of context.authorizedEmails) {
            if (email !== context.user.email) {
            const memberTx = await filterTransactions({ created_by: email });
            const memberCards = await filterCreditCards({ created_by: email });
            allTransactions.push(...memberTx);
            allCards.push(...memberCards);
            }
        }
        
        setTransactions(allTransactions);
        setCards(allCards);
        } else {
        setTransactions(myTransactions);
        setCards(myCards);
        }
        
        setLoading(false);
    };

    loadData();
  }, []);

  const getCurrentMonthTransactions = (): Transaction[] => {
    return transactions.filter(t => t.reference_month === currentMonth);
  };

  const calculateStats = () => {
    const currentMonthTx = getCurrentMonthTransactions();
    
    const income = currentMonthTx
      .filter(t => t.type === "receita")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const expense = currentMonthTx
      .filter(t => t.type === "despesa")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const balance = income - expense;

    const futureCommitments = transactions
      .filter(t => {
        if (!t.installments || t.installments <= 1) return false;
        const currentInstallment = t.current_installment || 1;
        return currentInstallment < t.installments;
      })
      .reduce((sum, t) => {
        const remaining = t.installments! - (t.current_installment || 1);
        return sum + ((t.amount || 0) * remaining);
      }, 0);

    return { income, expense, balance, futureCommitments };
  };

  const getCategoryData = () => {
    const currentMonthTx = getCurrentMonthTransactions();
    const categoryTotals: { [key: string]: number } = {};
    
    currentMonthTx
      .filter(t => t.type === "despesa")
      .forEach(t => {
        const amount = t.amount || 0;
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amount;
      });

    return Object.entries(categoryTotals).map(([name, value]) => ({
      name,
      value
    }));
  };

  const getBalanceHistory = () => {
    const monthlyData: { [key: string]: { income: number; expense: number } } = {};
    
    transactions.forEach(t => {
      const month = t.reference_month;
      if (!month) return;
      
      if (!monthlyData[month]) {
        monthlyData[month] = { income: 0, expense: 0 };
      }
      
      const amount = t.amount || 0;
      if (t.type === "receita") {
        monthlyData[month].income += amount;
      } else {
        monthlyData[month].expense += amount;
      }
    });

    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-6)
      .map(([month, data]) => {
          const date = new Date(`${month}-02`); // Use day 2 to avoid timezone issues
          const monthName = isValid(date) ? format(date, "MMM", { locale: ptBR }) : month;
          return {
            month: monthName,
            income: data.income,
            expense: data.expense,
            balance: data.income - data.expense
          };
      });
  };

  const getCreditCardUsage = () => {
    const currentMonthTx = getCurrentMonthTransactions();
    const cardExpenses = currentMonthTx
      .filter(t => t.type === "despesa" && t.payment_method === "cartao")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const totalLimit = cards.reduce((sum, card) => sum + (card.limit || 0), 0);
    const percentage = totalLimit > 0 ? (cardExpenses / totalLimit) * 100 : 0;
    
    return { used: cardExpenses, total: totalLimit, percentage };
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = calculateStats();
  const categoryData = getCategoryData();
  const balanceHistory = getBalanceHistory();
  const cardUsage = getCreditCardUsage();

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50 capitalize">
              {currentMonthName}
            </h1>
            {familyContext?.hasFamily && (
              <Badge className="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700">
                <Users className="w-3 h-3 mr-1.5" />
                {familyContext.familyAccount?.name}
              </Badge>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            {familyContext?.hasFamily 
              ? "Visão geral das finanças da família." 
              : "Visão geral das suas finanças."}
          </p>
        </div>
      </div>

      {stats.expense > stats.income && (
        <Alert variant="destructive" className="border-red-200 bg-red-50 dark:bg-red-900/20 dark:text-red-400 dark:border-red-500/50">
          <AlertCircle className="h-5 w-5" />
          <AlertDescription>
            Atenção! Suas despesas ({formatCurrency(stats.expense)}) estão maiores que suas receitas ({formatCurrency(stats.income)}) este mês.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Receitas do Mês"
          value={formatCurrency(stats.income)}
          icon={TrendingUp}
          type="success"
        />
        <StatCard
          title="Despesas do Mês"
          value={formatCurrency(stats.expense)}
          icon={TrendingDown}
          type="danger"
        />
        <StatCard
          title="Saldo Mensal"
          value={formatCurrency(stats.balance)}
          icon={Wallet}
          type={stats.balance >= 0 ? "success" : "info"}
        />
        <StatCard
          title="Comprometido Futuro"
          value={formatCurrency(stats.futureCommitments)}
          icon={CreditCardIcon}
          type="warning"
        />
      </div>

      {cards.length > 0 && (
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl p-6 text-white shadow-lg">
          <div className="flex justify-between items-start mb-4">
            <div>
              <p className="text-indigo-100 text-sm">Uso do Cartão de Crédito</p>
              <p className="text-3xl font-bold mt-1">
                {formatCurrency(cardUsage.used)}
              </p>
              <p className="text-indigo-100 text-sm mt-1">
                de {formatCurrency(cardUsage.total)} disponível
              </p>
            </div>
            <div className="text-right">
              <p className="text-4xl font-bold">{formatPercent(cardUsage.percentage)}</p>
              <p className="text-indigo-100 text-sm">utilizado</p>
            </div>
          </div>
          <div className="w-full bg-blue-400 rounded-full h-2.5 mt-2">
            <div 
              className="bg-white rounded-full h-2.5 transition-all duration-500 ease-out"
              style={{ width: `${Math.min(cardUsage.percentage, 100)}%` }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3">
            {balanceHistory.length > 0 && <BalanceChart data={balanceHistory} />}
        </div>
        <div className="lg:col-span-2">
            {categoryData.length > 0 ? <ExpenseChart data={categoryData} /> : <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm h-full flex items-center justify-center text-gray-500 dark:text-gray-400">Nenhuma despesa registrada este mês.</div>}
        </div>
      </div>
    </div>
  );
}