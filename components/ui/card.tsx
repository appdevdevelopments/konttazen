import React from 'react';

// Fix: Defined a shared props interface and used React.FC to ensure proper prop typing,
// resolving issues with 'children' and 'key' props.
interface CardComponentProps {
  className?: string;
  children: React.ReactNode;
}

export const Card: React.FC<CardComponentProps> = ({ className, children }) => (
  <div className={`rounded-xl border bg-white text-gray-900 shadow dark:bg-gray-800 dark:border-gray-700 dark:text-gray-50 ${className}`}>
    {children}
  </div>
);

export const CardHeader: React.FC<CardComponentProps> = ({ className, children }) => (
  <div className={`flex flex-col space-y-1.5 p-6 ${className}`}>
    {children}
  </div>
);

export const CardTitle: React.FC<CardComponentProps> = ({ className, children }) => (
  <h3 className={`text-xl font-semibold leading-none tracking-tight ${className}`}>
    {children}
  </h3>
);

export const CardContent: React.FC<CardComponentProps> = ({ className, children }) => (
  <div className={`p-6 pt-0 ${className}`}>
    {children}
  </div>
);