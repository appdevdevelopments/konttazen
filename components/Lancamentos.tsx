import React, { useState, useEffect } from "react";
import { Transaction } from "../types";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Plus, Search, Filter, Users } from "./icons";
// Fix: Removed parseISO from date-fns import as it was causing an error.
import { format, isValid } from "date-fns";
import ptBR from 'date-fns/locale/pt-BR';
import TransactionForm from "./lancamentos/TransactionForm";
import TransactionList from "./lancamentos/TransactionList";
import { getUserFamilyContext } from '../services/dataService';
import { Badge } from "./ui/Badge";
import { formatCurrency } from "../utils/formatters";
import { Transaction as TransactionService } from '../entities/all';

export default function Lancamentos() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [familyContext, setFamilyContext] = useState<any>(null);
  const [filters, setFilters] = useState({
    search: "",
    month: format(new Date(), "yyyy-MM"),
    type: "all",
    category: "all",
    payment_method: "all"
  });

  useEffect(() => {
    loadTransactions();
    
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('novo') === 'true') {
      setShowForm(true);
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, []);

  useEffect(() => {
    applyFilters();
  }, [transactions, filters]);

  const loadTransactions = async () => {
    const context = await getUserFamilyContext();
    setFamilyContext(context);

    if (!context.user) return;

    let allData: Transaction[] = [];
    const myData = await TransactionService.filter({ created_by: context.user.email });
    allData.push(...myData);
    
    if (context.hasFamily) {
      for (const email of context.authorizedEmails) {
        if (email !== context.user.email) {
          const memberData = await TransactionService.filter({ created_by: email });
          allData.push(...memberData);
        }
      }
    }
    
    // Sort by date descending
    allData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    setTransactions(allData);
  };

  const applyFilters = () => {
    let filtered = [...transactions];

    if (filters.search) {
      filtered = filtered.filter(t => 
        t.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.month !== "all") {
      filtered = filtered.filter(t => t.reference_month === filters.month);
    }

    if (filters.type !== "all") {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    if (filters.category !== "all") {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    if (filters.payment_method !== "all") {
      filtered = filtered.filter(t => t.payment_method === filters.payment_method);
    }

    setFilteredTransactions(filtered);
  };

  const handleSave = async (data: Partial<Transaction>) => {
    if (editingTransaction) {
      await TransactionService.update(editingTransaction.id, data);
    } else {
      await TransactionService.create(data);
    }
    
    setShowForm(false);
    setEditingTransaction(null);
    loadTransactions();
  };

  const handleEdit = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este lançamento?")) {
      await TransactionService.delete(id);
      loadTransactions();
    }
  };

  const getUniqueValues = (key: keyof Transaction) => {
    return [...new Set(transactions.map(t => t[key]).filter(Boolean))] as string[];
  };

  const getTotalStats = () => {
    const income = filteredTransactions
      .filter(t => t.type === "receita")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const expense = filteredTransactions
      .filter(t => t.type === "despesa")
      .reduce((sum, t) => sum + (t.amount || 0), 0);
    
    const pending = filteredTransactions
      .filter(t => t.payment_status === "pendente")
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    return { income, expense, pending, balance: income - expense };
  };

  const getAvailableMonths = () => {
    const months = getUniqueValues('reference_month');
    return months.sort((a, b) => b.localeCompare(a));
  };

  const formatMonthLabel = (monthString: string) => {
    if (!monthString) return "Mês inválido";
    
    try {
      // Fix: Replaced parseISO with new Date() to fix import error.
      const date = new Date(monthString + "-01T12:00:00Z");
      if (!isValid(date)) return monthString;
      
      return format(date, "MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return monthString;
    }
  };

  const stats = getTotalStats();
  const availableMonths = getAvailableMonths();

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Lançamentos</h1>
            {familyContext?.hasFamily && (
               <Badge className="bg-purple-100 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-700">
                <Users className="w-3 h-3 mr-1.5" />
                {familyContext.familyAccount?.name}
              </Badge>
            )}
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            {familyContext?.hasFamily 
              ? "Gerencie as receitas e despesas da família" 
              : "Gerencie suas receitas e despesas"}
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingTransaction(null);
            setShowForm(true);
          }}
          className="bg-blue-600 hover:bg-blue-700 shadow-md text-white shrink-0"
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Lançamento
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700 transition-shadow duration-300 hover:shadow-md">
          <p className="text-sm text-gray-500 dark:text-gray-400">Receitas no período</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-500">{formatCurrency(stats.income)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700 transition-shadow duration-300 hover:shadow-md">
          <p className="text-sm text-gray-500 dark:text-gray-400">Despesas no período</p>
          <p className="text-2xl font-bold text-red-600 dark:text-red-500">{formatCurrency(stats.expense)}</p>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-5 border border-gray-200 dark:border-gray-700 transition-shadow duration-300 hover:shadow-md">
          <p className="text-sm text-gray-500 dark:text-gray-400">Pendentes no período</p>
          <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-500">{formatCurrency(stats.pending)}</p>
        </div>
      </div>

      {showForm && (
        <TransactionForm
          transaction={editingTransaction}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingTransaction(null);
          }}
        />
      )}

      <div className="bg-white dark:bg-gray-800 rounded-xl p-4 shadow-sm border border-gray-200 dark:border-gray-700 space-y-4 transition-shadow duration-300 hover:shadow-md">
        <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300 font-semibold">
          <Filter className="w-5 h-5" />
          <h3>Filtros</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="relative lg:col-span-2">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <Input
              placeholder="Buscar por descrição..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="pl-9"
            />
          </div>

          <Select value={filters.month} onValueChange={(v) => setFilters({ ...filters, month: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os meses</SelectItem>
              {availableMonths.map(month => (
                <SelectItem key={month} value={month}>
                  {formatMonthLabel(month)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={filters.type} onValueChange={(v) => setFilters({ ...filters, type: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="receita">Receitas</SelectItem>
              <SelectItem value="despesa">Despesas</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filters.category} onValueChange={(v) => setFilters({ ...filters, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas categorias</SelectItem>
              {getUniqueValues('category').map(cat => (
                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <TransactionList
        transactions={filteredTransactions}
        onEdit={handleEdit}
        onDelete={handleDelete}
        onRefresh={loadTransactions}
      />
    </div>
  );
}