import React from 'react';
import { Transaction } from '../../types';
import { formatCurrency } from '../../utils/formatters';
// Fix: Removed parseISO from date-fns import as it was causing an error.
import { format } from 'date-fns';
// Fix: Changed import for ptBR locale to be a direct default import.
import ptBR from 'date-fns/locale/pt-BR';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/button';
import { Transaction as TransactionService } from '../../entities/all';
import { Pencil, Trash2 } from '../icons';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

const TransactionList: React.FC<TransactionListProps> = ({ transactions, onEdit, onDelete, onRefresh }) => {

  const handleStatusChange = async (tx: Transaction) => {
    const newStatus = tx.payment_status === 'pago' ? 'pendente' : 'pago';
    await TransactionService.updateStatus(tx.id, newStatus);
    onRefresh();
  };

  const typeClasses = (type: 'receita' | 'despesa') => 
    type === 'receita' ? 'text-green-600 dark:text-green-500' : 'text-red-600 dark:text-red-500';

  const statusBadge = (status: 'pago' | 'pendente') => {
    const classes = status === 'pago' 
      ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-700/50' 
      : 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-300 dark:border-yellow-700/50';
    return <Badge className={`cursor-pointer ${classes}`}>{status}</Badge>;
  }

  const paymentMethodLabel = {
      cartao: 'Cartão',
      pix: 'PIX',
      boleto: 'Boleto',
      dinheiro: 'Dinheiro',
      debito: 'Débito'
  }

  if (transactions.length === 0) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-8 text-center text-gray-500 dark:text-gray-400">
        <p>Nenhum lançamento encontrado para os filtros selecionados.</p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden transition-shadow duration-300 hover:shadow-md">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left text-gray-600 dark:text-gray-300">
          <thead className="bg-gray-50 dark:bg-gray-700/50 text-xs text-gray-700 dark:text-gray-400 uppercase tracking-wider">
            <tr>
              <th scope="col" className="px-6 py-3">Data</th>
              <th scope="col" className="px-6 py-3">Descrição</th>
              <th scope="col" className="px-6 py-3">Categoria</th>
              <th scope="col" className="px-6 py-3">Valor</th>
              <th scope="col" className="px-6 py-3 text-center">Status</th>
              <th scope="col" className="px-6 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {transactions.map(tx => (
              <tr key={tx.id} className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                {/* Fix: Replaced parseISO with new Date() to fix import error. Appending T00:00:00 to avoid timezone issues. */}
                <td className="px-6 py-4">{format(new Date(tx.date + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })}</td>
                <td className="px-6 py-4 font-medium text-gray-900 dark:text-gray-50">{tx.description}</td>
                <td className="px-6 py-4"><Badge className="bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200">{tx.category}</Badge></td>
                <td className={`px-6 py-4 font-bold ${typeClasses(tx.type)}`}>{formatCurrency(tx.amount)}</td>
                <td className="px-6 py-4 text-center">
                    <button onClick={() => handleStatusChange(tx)} title="Clique para alterar">
                        {statusBadge(tx.payment_status)}
                    </button>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Button onClick={() => onEdit(tx)} className="bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-gray-200 px-3 py-1.5 text-xs font-medium">
                      <Pencil className="w-3 h-3 mr-1.5" />
                      Editar
                    </Button>
                    <Button onClick={() => onDelete(tx.id)} className="bg-red-100 hover:bg-red-200 text-red-700 dark:bg-red-900/30 dark:hover:bg-red-900/50 dark:text-red-400 px-3 py-1.5 text-xs font-medium">
                      <Trash2 className="w-3 h-3 mr-1.5" />
                      Excluir
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionList;