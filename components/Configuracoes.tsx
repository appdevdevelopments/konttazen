import React, { useState, useEffect } from "react";
import { MonthlyGoal, Category } from "../entities/all";
import { MonthlyGoal as MonthlyGoalType } from "../types";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/Badge";
import { Plus, Trash2, Target, Settings } from "./icons";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatCurrency } from "../utils/formatters";

export default function Configuracoes() {
  const [goals, setGoals] = useState<MonthlyGoalType[]>([]);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  
  const [goalForm, setGoalForm] = useState({
    month: format(new Date(), "yyyy-MM"),
    category: "",
    target_amount: ""
  });

  useEffect(() => {
    loadGoals();
    loadCategories();
  }, []);

  const loadGoals = async () => {
    const allGoals = await MonthlyGoal.list();
    setGoals(allGoals);
  };

  const loadCategories = async () => {
    const userCategories = await Category.list();
    const defaultCategories = [
        "Alimentação", "Moradia", "Transporte", "Lazer", "Saúde",
        "Educação", "Vestuário", "Salário", "Freelance", "Investimentos", "Outros"
    ];
    const allCategoryNames = [...new Set([...defaultCategories, ...userCategories.map(c => c.name)])];
    setCategories(allCategoryNames.sort());
  };

  const handleSaveGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goalForm.category) {
      alert("Por favor, selecione uma categoria.");
      return;
    }
    await MonthlyGoal.create({
      ...goalForm,
      target_amount: parseFloat(goalForm.target_amount)
    });
    setGoalForm({ month: format(new Date(), "yyyy-MM"), category: "", target_amount: "" });
    setShowGoalForm(false);
    loadGoals();
  };

  const handleDeleteGoal = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir esta meta?")) {
      await MonthlyGoal.delete(id);
      loadGoals();
    }
  };
  
  const formatMonthForDisplay = (month: string) => {
      const date = new Date(month + "-01T12:00:00Z");
      return format(date, "MMMM yyyy", { locale: ptBR });
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3 mb-2">
          <Settings className="w-8 h-8 text-blue-600" />
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-50">Configurações</h1>
        </div>
        <p className="text-gray-500 dark:text-gray-400">Personalize categorias e defina metas financeiras</p>
      </div>

      {/* Goals Section */}
      <Card className="shadow-md transition-shadow duration-300 hover:shadow-lg">
        <CardHeader className="bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center gap-2">
              <Target className="w-5 h-5" />
              Metas Mensais
            </CardTitle>
            <Button 
              onClick={() => setShowGoalForm(!showGoalForm)}
              className="bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600 px-3 py-1.5"
            >
              <Plus className="w-4 h-4 mr-2" />
              Nova Meta
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/50 rounded-lg p-4">
            <p className="text-sm text-gray-700 dark:text-blue-200">
              💡 Defina metas de gasto máximo por categoria para ter mais controle financeiro.
            </p>
          </div>

          {/* Goal Form */}
          {showGoalForm && (
            <form onSubmit={handleSaveGoal} className="border dark:border-gray-700 rounded-lg p-4 space-y-4 bg-gray-50 dark:bg-gray-800/50">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="goalMonth">Mês *</Label>
                  <Input
                    id="goalMonth"
                    type="month"
                    value={goalForm.month}
                    onChange={(e) => setGoalForm({ ...goalForm, month: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="goalCategory">Categoria *</Label>
                   <Select
                    value={goalForm.category}
                    onValueChange={(value) => setGoalForm({ ...goalForm, category: value })}
                  >
                    <SelectTrigger id="goalCategory">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="goalAmount">Valor Máximo *</Label>
                <Input
                  id="goalAmount"
                  type="number"
                  step="0.01"
                  value={goalForm.target_amount}
                  onChange={(e) => setGoalForm({ ...goalForm, target_amount: e.target.value })}
                  placeholder="0,00"
                  required
                />
              </div>

              <div className="flex gap-2">
                <Button type="button" onClick={() => setShowGoalForm(false)} className="flex-1 bg-white border border-gray-300 text-gray-800 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600">
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                  Salvar Meta
                </Button>
              </div>
            </form>
          )}

          {/* Goals List */}
          {goals.length > 0 ? (
            <div className="space-y-2">
              {goals.map(goal => (
                <div key={goal.id} className="flex items-center justify-between p-3 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50">
                  <div>
                    <p className="font-medium">{goal.category}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {formatMonthForDisplay(goal.month)}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className="bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/50">
                      {formatCurrency(goal.target_amount)}
                    </Badge>
                    <Button
                      onClick={() => handleDeleteGoal(goal.id)}
                      className="text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300 h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <Target className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
              <p>Nenhuma meta definida ainda</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}