import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input: React.FC<InputProps> = ({ className, ...props }) => {
  const baseClasses = "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <input className={`${baseClasses} border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-900/50 dark:border-gray-600 dark:text-gray-50 dark:placeholder:text-gray-400 dark:focus:ring-blue-500 dark:focus:border-blue-500 ${className}`} {...props} />
  );
};