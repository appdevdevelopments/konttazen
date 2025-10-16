import React, { useState, useEffect } from "react";
// Fix: Aliased service imports to avoid name collision with type definitions.
import { CreditCard as CreditCardService, Transaction as TransactionService } from "../entities/all";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Badge } from "./ui/Badge";
import { Plus, CreditCard as CreditCardIcon, Trash2, Users, Landmark, Visa, Mastercard, Pencil } from "./icons";
import { format, subMonths } from "date-fns";
import { getUserFamilyContext } from "../services/dataService";
import { formatCurrency } from "../utils/formatters";
// Fix: Imported CreditCard and Transaction types from types.ts.
import { FamilyContext, CreditCard, Transaction } from "../types";

const ICONS: { [key: string]: React.FC<React.SVGProps<SVGSVGElement>> } = {
  Visa,
  Mastercard,
  Landmark,
  // Fix: Replaced the 'CreditCard' type with the 'CreditCardIcon' component aliased on import.
  CreditCard: CreditCardIcon,
};
const iconNames = Object.keys(ICONS);

const renderIcon = (iconName: string | undefined, props: React.SVGProps<SVGSVGElement> = {}) => {
  if (!iconName) iconName = 'CreditCard';
  const IconComponent = ICONS[iconName] || CreditCardIcon;
  return <IconComponent {...props} />;
};


export default function Cartoes() {
  const [cards, setCards] = useState<CreditCard[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editingCard, setEditingCard] = useState<CreditCard | null>(null);
  const [familyContext, setFamilyContext] = useState<FamilyContext | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    limit: "",
    due_day: "",
    closing_day: "",
    color: "#3B82F6",
    icon: "CreditCard"
  });

  const currentMonth = format(new Date(), "yyyy-MM");

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const context = await getUserFamilyContext();
    setFamilyContext(context);

    if (!context.user) return;

    // Buscar apenas dados do usuário atual
    const myCards = await CreditCardService.filter({ created_by: context.user.email });
    const myTx = await TransactionService.filter({ created_by: context.user.email });
    
    // Se tem conta familiar, buscar dados dos membros também
    if (context.hasFamily) {
      const allCards = [...myCards];
      const allTx = [...myTx];
      
      for (const email of context.authorizedEmails) {
        if (email !== context.user.email) { // Avoid fetching current user's data again
          const memberCards = await CreditCardService.filter({ created_by: email });
          const memberTx = await TransactionService.filter({ created_by: email });
          allCards.push(...memberCards);
          allTx.push(...memberTx);
        }
      }
      
      setCards(allCards);
      setTransactions(allTx);
    } else {
      setCards(myCards);
      setTransactions(myTx);
    }
  };

  const getCardStatus = (card: CreditCard, allTransactions: Transaction[]): { text: string; className: string } => {
    const today = new Date();
    const currentDay = today.getDate();

    // Determine if the last invoice is paid
    const previousMonthRef = format(subMonths(today, 1), "yyyy-MM");
    const isLastInvoiceUnpaid = allTransactions.some(t =>
        t.credit_card_id === card.id &&
        t.reference_month === previousMonthRef &&
        t.payment_status === 'pendente' &&
        t.type === 'despesa'
    );

    const isNormalCycle = card.closing_day < card.due_day;

    // --- Check "Em Atraso" ---
    if (isLastInvoiceUnpaid) {
        if (isNormalCycle) {
            // Overdue if past due date
            if (currentDay > card.due_day) {
                return { text: "Em Atraso", className: "bg-red-600/80 text-white border-red-500/50 shadow-sm" };
            }
        } else { // Cross-month cycle
            // Overdue if between due day and next closing day
            if (currentDay > card.due_day && currentDay <= card.closing_day) {
                return { text: "Em Atraso", className: "bg-red-600/80 text-white border-red-500/50 shadow-sm" };
            }
        }
    }

    // --- Check "Fechada" ---
    if (isNormalCycle) {
        // Closed if between closing day and due day
        if (currentDay > card.closing_day && currentDay <= card.due_day) {
            return { text: "Fechada", className: "bg-yellow-600/80 text-white border-yellow-500/50 shadow-sm" };
        }
    } else { // Cross-month cycle
        // Closed if after closing day OR before/on due day
        if (currentDay > card.closing_day || currentDay <= card.due_day) {
            return { text: "Fechada", className: "bg-yellow-600/80 text-white border-yellow-500/50 shadow-sm" };
        }
    }

    // --- Default "Aberta" ---
    return { text: "Aberta", className: "bg-slate-600/50 text-slate-200 border-slate-500/50 shadow-sm" };
  };

  const handleCancelForm = () => {
    setShowForm(false);
    setEditingCard(null);
    setFormData({ name: "", limit: "", due_day: "", closing_day: "", color: "#3B82F6", icon: "CreditCard" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cardData = {
      ...formData,
      limit: parseFloat(formData.limit),
      due_day: parseInt(formData.due_day, 10),
      closing_day: parseInt(formData.closing_day, 10),
    };

    if (editingCard) {
      await CreditCardService.update(editingCard.id, cardData);
    } else {
      await CreditCardService.create(cardData);
    }
    
    handleCancelForm();
    loadData();
  };

  const handleEdit = (card: CreditCard) => {
    setEditingCard(card);
    setFormData({
      name: card.name,
      limit: String(card.limit),
      due_day: String(card.due_day),
      closing_day: String(card.closing_day),
      color: card.color,
      icon: card.icon,
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir este cartão?")) {
      await CreditCardService.delete(id);
      loadData();
    }
  };
  
  const getCardValues = (cardId: string) => {
    const cardTransactionsThisMonth = transactions.filter(t =>
        t.credit_card_id === cardId &&
        t.type === "despesa" &&
        t.date.startsWith(currentMonth)
    );

    const gastos = cardTransactionsThisMonth
        .filter(t => t.payment_status === 'pendente')
        .reduce((sum, t) => sum + t.amount, 0);

    const pago = cardTransactionsThisMonth
        .filter(t => t.payment_status === 'pago')
        .reduce((sum, t) => sum + t.amount, 0);

    const fatura = gastos;

    return { gastos, pago, fatura };
  };

  const colors = [
    "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", 
    "#EC4899", "#14B8A6", "#F97316", "#6366F1"
  ];

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-start gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-3xl text-gray-900 dark:text-gray-50">
              <span className="font-normal">Meus</span>{' '}
              <span className="font-bold">Cartões</span>
            </h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400">
            Gerencie cartões de crédito
          </p>
        </div>
        <Button 
          onClick={() => {
            setEditingCard(null);
            setShowForm(!showForm);
          }}
          className="bg-blue-600 hover:bg-blue-700 shadow-md text-white"
        >
          <Plus className="w-4 h-4 mr-2" />
          {showForm && !editingCard ? 'Ocultar Formulário' : 'Novo Cartão'}
        </Button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md border dark:border-gray-700 transition-all duration-300 mt-4 mb-6 animate-in fade-in-0">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800 dark:text-gray-100">
             {editingCard ? <Pencil className="w-5 h-5" /> : <CreditCardIcon className="w-5 h-5" />}
             {editingCard ? 'Editar Cartão' : 'Adicionar Novo Cartão'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="cardName">Nome do Cartão *</Label>
              <Input
                id="cardName"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Ex: Nubank, Inter, Itaú..."
                required
              />
            </div>

            <div>
              <Label className="mb-2 block">Icone do Cartão</Label>
              <div className="flex flex-wrap gap-2">
                {iconNames.map(iconName => {
                    const isSelected = formData.icon === iconName;
                    return (
                        <button
                            key={iconName}
                            type="button"
                            onClick={() => setFormData({ ...formData, icon: iconName })}
                            className={`flex items-center justify-center p-2 rounded-md border transition-colors flex-shrink-0 w-12 h-12 ${
                                isSelected 
                                ? 'bg-blue-100 dark:bg-blue-900 border-blue-300 dark:border-blue-700' 
                                : 'bg-white dark:bg-gray-700 border-gray-200 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
                            }`}
                        >
                            {renderIcon(iconName, { className: 'w-8 h-8 text-gray-700 dark:text-gray-300' })}
                        </button>
                    );
                })}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cardLimit">Limite Total *</Label>
                <Input
                  id="cardLimit"
                  type="number"
                  step="0.01"
                  value={formData.limit}
                  onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
                  placeholder="0,00"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cardClosingDay">Fecha dia *</Label>
                 <Input
                  id="cardClosingDay"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.closing_day}
                  onChange={(e) => setFormData({ ...formData, closing_day: e.target.value })}
                  placeholder="Ex: 25"
                  required
                />
              </div>
              <div>
                <Label htmlFor="cardDueDate">Vence dia *</Label>
                <Input
                  id="cardDueDate"
                  type="number"
                  min="1"
                  max="31"
                  value={formData.due_day}
                  onChange={(e) => setFormData({ ...formData, due_day: e.target.value })}
                  placeholder="Ex: 5"
                  required
                />
              </div>
            </div>

            <div>
              <Label className="mb-2 block">Cor do Cartão</Label>
              <div className="flex flex-wrap gap-2">
                {colors.map(color => (
                  <button
                    key={color}
                    type="button"
                    aria-label={`Select ${color}`}
                    className={`w-8 h-8 rounded-full border-2 transition-transform ${
                      formData.color === color ? "border-gray-900 dark:border-gray-100 scale-110" : "border-transparent"
                    }`}
                    style={{ backgroundColor: color }}
                    onClick={() => setFormData({ ...formData, color })}
                  />
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <Button type="button" onClick={handleCancelForm} className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200">
                Cancelar
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                {editingCard ? 'Salvar Alterações' : 'Salvar Cartão'}
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => {
          const { gastos, pago, fatura } = getCardValues(card.id);
          const status = getCardStatus(card, transactions);

          const today = new Date();
          const { closing_day, due_day } = card;
          const currentDay = today.getDate();
          const currentMonth = today.getMonth(); // 0-11
          const currentYear = today.getFullYear();

          let closingDate: Date;
          let dueDate: Date;

          const isCrossMonthCycle = closing_day > due_day;

          if (isCrossMonthCycle) {
            // Se o vencimento é no próximo mês
            closingDate = new Date(currentYear, currentMonth, closing_day);
            dueDate = new Date(currentYear, currentMonth + 1, due_day);
          } else { // Ciclo normal (vencimento no mesmo mês)
            // Se já passamos do dia de vencimento deste mês, mostramos as datas do próximo ciclo
            if (currentDay > due_day) {
              closingDate = new Date(currentYear, currentMonth + 1, closing_day);
              dueDate = new Date(currentYear, currentMonth + 1, due_day);
            } else {
              closingDate = new Date(currentYear, currentMonth, closing_day);
              dueDate = new Date(currentYear, currentMonth, due_day);
            }
          }

          const closingMonth = closingDate.getMonth() + 1;
          const dueMonth = dueDate.getMonth() + 1;

          return (
            <div key={card.id} className="bg-slate-800 dark:bg-gray-900 rounded-2xl p-6 text-slate-100 shadow-xl hover:shadow-2xl transition-shadow relative space-y-4">

              {/* Top Section: Icon, Name, Status */}
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-4">
                  <div className="bg-white rounded-full w-12 h-12 flex items-center justify-center">
                     {renderIcon(card.icon, { className: 'w-10 h-10' })}
                  </div>
                  <span className="font-semibold text-lg tracking-wider text-slate-50 pt-2">{card.name.toUpperCase()}</span>
                </div>
                <div className="flex items-center gap-2">
                   <Badge className={status.className}>{status.text}</Badge>
                    <Button
                      onClick={() => handleEdit(card)}
                      className="text-slate-400 hover:text-white bg-transparent hover:bg-slate-700/50 p-2 h-auto rounded-full"
                      aria-label={`Editar cartão ${card.name}`}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                   <Button
                      onClick={() => handleDelete(card.id)}
                      className="text-slate-400 hover:text-white bg-transparent hover:bg-slate-700/50 p-2 h-auto rounded-full"
                      aria-label={`Excluir cartão ${card.name}`}
                    >
                      <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Middle Section: Dates */}
              <div className="flex justify-between items-end text-slate-200 pt-2">
                <div>
                  <p className="text-sm text-slate-400">Fecha em</p>
                  <p className="font-bold text-xl">{card.closing_day}<span className="font-normal text-base">/{closingMonth}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-slate-400">Vence em</p>
                  <p className="font-bold text-xl">{card.due_day}<span className="font-normal text-base">/{dueMonth}</span></p>
                </div>
              </div>

              {/* Color Stripe Separator */}
              <div
                className="h-1.5 rounded-full my-2"
                style={{ backgroundColor: card.color }}
              ></div>

              {/* Bottom Section: Values */}
              <div className="flex justify-between text-center pt-2">
                <div>
                  <p className="text-sm text-slate-400">Fatura</p>
                  <p className="font-semibold text-lg text-slate-50">{formatCurrency(fatura)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Gastos</p>
                  <p className="font-semibold text-lg text-red-400">{formatCurrency(gastos)}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-400">Pago</p>
                  <p className="font-semibold text-lg text-green-400">{formatCurrency(pago)}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {cards.length === 0 && !showForm && (
        <Card className="border-dashed dark:border-gray-700">
          <CardContent className="p-12 text-center">
            <CreditCardIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400 mb-2">Nenhum cartão cadastrado</p>
            <p className="text-sm text-gray-400 dark:text-gray-500 mb-4">Adicione seu primeiro cartão para começar</p>
            <Button onClick={() => setShowForm(true)} className="bg-white border-gray-300 text-gray-800 hover:bg-gray-100 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Cartão
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}