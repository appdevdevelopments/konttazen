import React, { useState, useEffect } from 'react';
import { Transaction } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Pencil, Plus } from '../icons';

interface TransactionFormProps {
  transaction: Transaction | null;
  onSave: (data: Partial<Transaction>) => void;
  onCancel: () => void;
}

const TransactionForm: React.FC<TransactionFormProps> = ({ transaction, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Transaction>>({
    type: 'despesa',
    payment_status: 'pendente',
    payment_method: 'pix',
    ...transaction
  });
  
  useEffect(() => {
    setFormData({
      type: 'despesa',
      payment_status: 'pendente',
      payment_method: 'pix',
      ...transaction
    });
  }, [transaction]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'number' ? parseFloat(value) || 0 : value }));
  };

  const handleSelectChange = (name: keyof Transaction, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-md border border-gray-200 dark:border-gray-700 space-y-4 mb-6 animate-in fade-in-0 transition-shadow duration-300 hover:shadow-lg">
      <h3 className="flex items-center gap-2 text-xl font-semibold text-gray-800 dark:text-gray-100">
        {transaction ? <Pencil className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
        {transaction ? 'Editar Lançamento' : 'Novo Lançamento'}
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Type and Description */}
        <Select value={formData.type} onValueChange={(v) => handleSelectChange('type', v)}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
                <SelectItem value="receita">Receita</SelectItem>
                <SelectItem value="despesa">Despesa</SelectItem>
            </SelectContent>
        </Select>
        <Input name="description" placeholder="Descrição" value={formData.description || ''} onChange={handleChange} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Amount, Category, Due Date */}
        <Input name="amount" type="number" placeholder="Valor" value={formData.amount || ''} onChange={handleChange} required />
        <Input name="category" placeholder="Categoria" value={formData.category || ''} onChange={handleChange} required />
        <Input name="date" type="date" placeholder="Data" value={formData.date || ''} onChange={handleChange} required />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Payment Method and Status */}
        <Select value={formData.payment_method} onValueChange={(v) => handleSelectChange('payment_method', v)}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
                <SelectItem value="cartao">Cartão</SelectItem>
                <SelectItem value="pix">PIX</SelectItem>
                <SelectItem value="boleto">Boleto</SelectItem>
                <SelectItem value="dinheiro">Dinheiro</SelectItem>
                <SelectItem value="debito">Débito</SelectItem>
            </SelectContent>
        </Select>
        <Select value={formData.payment_status} onValueChange={(v) => handleSelectChange('payment_status', v)}>
            <SelectTrigger><SelectValue/></SelectTrigger>
            <SelectContent>
                <SelectItem value="pago">Pago</SelectItem>
                <SelectItem value="pendente">Pendente</SelectItem>
            </SelectContent>
        </Select>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="button" onClick={onCancel} className="bg-gray-200 hover:bg-gray-300 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200">Cancelar</Button>
        <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-shadow">Salvar</Button>
      </div>
    </form>
  );
};

export default TransactionForm;