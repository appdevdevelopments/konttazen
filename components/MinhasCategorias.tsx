import React from 'react';
import { CategoryManager } from './categories/CategoryManager';

export default function MinhasCategorias() {
  return (
    <div className="p-4 md:p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-3xl text-gray-900 dark:text-gray-50">
          <span className="font-normal">Minhas</span>{' '}
          <span className="font-bold">Categorias</span>
        </h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Gerencie categorias e subcategorias</p>
      </div>

      <div className="space-y-4">
        {/* Categories Section */}
        <CategoryManager />
      </div>
    </div>
  );
}