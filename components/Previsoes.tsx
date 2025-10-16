import React, { useState, useEffect } from "react";
// Fix: Aliased service import to avoid name collision with type.
import { Transaction as TransactionService } from "../entities/all";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
// Fix: Corrected import path casing for Badge component.
import { Badge } from "./ui/Badge";
import { Calendar, TrendingDown, Users } from "./icons";
import { format, addMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getUserFamilyContext } from '../services/dataService';
import { formatCurrency } from "../utils/formatters";
// Fix: Imported Transaction type to strongly type state and functions.
import { FamilyContext, Transaction } from '../types';

// Fix: Added interfaces to strongly type the future commitments data structure.
interface CommitmentItem {
  id: string;
  description: string;
  amount: number;
  type: "Parcela" | "Conta Fixa";
  installmentInfo?: string;
  category: string;
}

interface MonthlyCommitment {
  month: string;
  monthName: string;
  items: CommitmentItem[];
  total: number;
}

interface FutureCommitments {
  [key: string]: MonthlyCommitment;
}

export default function Previsoes() {
  // Fix: Typed state for transactions.
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  // Fix: Typed state for future commitments.
  const [futureCommitments, setFutureCommitments] = useState<FutureCommitments>({});
  const [familyContext, setFamilyContext] = useState<FamilyContext | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const context = await getUserFamilyContext();
    setFamilyContext(context);

    if (!context.user) return;

    // Buscar apenas dados do usuário atual
    const myData = await TransactionService.filter({ created_by: context.user.email });
    
    // Se tem conta familiar, buscar dados dos membros também
    let allData: Transaction[] = [...myData];
    
    if (context.hasFamily) {
      for (const email of context.authorizedEmails) {
        if (email !== context.user.email) {
          const memberData = await TransactionService.filter({ created_by: email });
          allData.push(...memberData);
        }
      }
    }
    
    setTransactions(allData);
    calculateFutureCommitments(allData);
  };

  // Fix: Typed the txs parameter and the local commitments variable.
  const calculateFutureCommitments = (txs: Transaction[]) => {
    const commitments: FutureCommitments = {};

    // Get next 12 months
    for (let i = 0; i < 12; i++) {
      const monthDate = addMonths(new Date(), i);
      const monthKey = format(monthDate, "yyyy-MM");
      commitments[monthKey] = {
        month: monthKey,
        monthName: format(monthDate, "MMMM yyyy", { locale: ptBR }),
        items: [],
        total: 0
      };
    }

    // Add installments
    txs.forEach(tx => {
      if (tx.installments && tx.installments > 1) {
        const currentInstallment = tx.current_installment || 1;
        const remainingInstallments = tx.installments - currentInstallment;
        
        for (let i = 1; i <= remainingInstallments; i++) {
          const futureDate = addMonths(new Date(tx.date), i);
          const futureMonth = format(futureDate, "yyyy-MM");
          
          if (commitments[futureMonth]) {
            commitments[futureMonth].items.push({
              id: `${tx.id}-${i}`,
              description: tx.description,
              // Fix: Added fallback to 0 to prevent NaN if installment_amount is undefined.
              amount: tx.installment_amount || 0,
              type: "Parcela",
              installmentInfo: `${currentInstallment + i}/${tx.installments}`,
              category: tx.category
            });
            // Fix: Added fallback to 0 to prevent NaN if installment_amount is undefined.
            commitments[futureMonth].total += tx.installment_amount || 0;
          }
        }
      }

      // Add recurring expenses
      if (tx.is_recurring) {
        Object.keys(commitments).forEach(monthKey => {
          if (monthKey > tx.reference_month) { // Only add if the month is after the reference month of the recurring transaction
            const recurringAmount = tx.installment_amount || tx.amount;
            commitments[monthKey].items.push({
              id: `${tx.id}-recurring-${monthKey}`,
              description: tx.description,
              amount: recurringAmount,
              type: "Conta Fixa",
              category: tx.category
            });
            commitments[monthKey].total += recurringAmount;
          }
        });
      }
    });

    setFutureCommitments(commitments);
  };

  // Fix: Explicitly type `allMonths` to ensure `reduce` and `map` operations are type-safe.
  const allMonths: MonthlyCommitment[] = Object.values(futureCommitments);
  const monthsWithCommitments = allMonths
    .filter((month) => month.items.length > 0);

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Previsões Futuras</h1>
          {familyContext?.hasFamily && (
            <Badge className="bg-purple-500 text-white dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700">
              <Users className="w-3 h-3 mr-1" />
              Família
            </Badge>
          )}
        </div>
        <p className="text-gray-500 dark:text-gray-400">
          {familyContext?.hasFamily 
            ? "Parcelas e contas fixas da família" 
            : "Parcelas e contas fixas dos próximos meses"}
        </p>
      </div>

      {/* Summary Card */}
      <Card className="bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg transition-shadow duration-300 hover:shadow-xl">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 mb-1">Total Comprometido (12 meses)</p>
              <p className="text-3xl font-bold">
                {/* Fix: Use the correctly typed `allMonths` array to ensure type safety in reduce. */}
                {formatCurrency(allMonths.reduce((sum, m) => sum + m.total, 0))}
              </p>
            </div>
            <Calendar className="w-12 h-12 text-orange-200" />
          </div>
        </CardContent>
      </Card>

      {/* Monthly Breakdown */}
      <div className="space-y-4">
        {/* Fix: `monthsWithCommitments` is now correctly typed, resolving errors in the map function. */}
        {monthsWithCommitments.map((month) => (
          <Card key={month.month} className="shadow-md transition-shadow duration-300 hover:shadow-lg">
            <CardHeader className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
              <div className="flex justify-between items-center">
                <CardTitle className="text-lg capitalize">{month.monthName}</CardTitle>
                <Badge className="bg-orange-500 text-white">
                  {formatCurrency(month.total)}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y dark:divide-gray-700">
                {month.items.map((item) => (
                  <div key={item.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="bg-orange-100 dark:bg-orange-900/30 p-2 rounded-lg">
                          <TrendingDown className="w-5 h-5 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900 dark:text-gray-100">{item.description}</h4>
                          <div className="flex gap-2 mt-1 flex-wrap">
                            <Badge className="border-gray-300 text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
                              {item.type}
                            </Badge>
                            {item.installmentInfo && (
                              <Badge className="border-gray-300 text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
                                {item.installmentInfo}
                              </Badge>
                            )}
                            <Badge className="border-gray-300 text-gray-600 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300">
                              {item.category}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <p className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        {formatCurrency(item.amount)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {monthsWithCommitments.length === 0 && (
        <Card className="border-dashed dark:border-gray-700">
          <CardContent className="p-12 text-center">
            <Calendar className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">Nenhuma previsão futura</p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Adicione lançamentos parcelados ou contas fixas para ver as previsões
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}