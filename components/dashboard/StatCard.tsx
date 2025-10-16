import React from 'react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  type: 'success' | 'danger' | 'warning' | 'info';
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon: Icon, type }) => {
  const typeClasses = {
    success: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
    danger: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    warning: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-xl shadow-sm flex items-center space-x-4 transition-all duration-300 hover:scale-105 hover:shadow-md">
      <div className={`p-3 rounded-full ${typeClasses[type]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-50">{value}</p>
      </div>
    </div>
  );
};

export default StatCard;