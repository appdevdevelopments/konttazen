import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useTheme } from '../../contexts/ThemeProvider';

interface BalanceChartProps {
  data: { month: string; income: number; expense: number; balance: number }[];
}

const BalanceChart: React.FC<BalanceChartProps> = ({ data }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const tickColor = isDark ? '#f9fafb' : '#111827';
  const gridColor = isDark ? '#374151' : '#e5e7eb';


  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm transition-shadow duration-300 hover:shadow-md">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-50 mb-4">Balanço dos Últimos Meses</h3>
      <div style={{ width: '100%', height: 300 }}>
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridColor} />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: tickColor }} />
            <YAxis tickFormatter={(value: number) => `R$${value / 1000}k`} tick={{ fontSize: 12, fill: tickColor }} />
            <Tooltip
              formatter={(value: number) => new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value)}
              cursor={{ fill: isDark ? '#374151' : '#f3f4f6' }}
              contentStyle={{
                backgroundColor: isDark ? '#1f2937' : '#ffffff',
                borderColor: isDark ? '#374151' : '#e5e7eb',
              }}
              labelStyle={{ color: tickColor }}
            />
            <Legend wrapperStyle={{ color: tickColor }} />
            <Bar dataKey="income" name="Receitas" fill="#22c55e" radius={[4, 4, 0, 0]} />
            <Bar dataKey="expense" name="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default BalanceChart;