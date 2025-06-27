import React from 'react';
import { Package } from 'lucide-react';
import type { FilamentSectionProps } from '../types';

const FilamentSection: React.FC<FilamentSectionProps> = ({
  weight,
  price,
  onWeightChange,
  onPriceChange
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center mb-4">
        <Package className="w-5 h-5 text-primary-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Filamento</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cantidad de filamento (gramos)
          </label>
          <input
            type="number"
            value={weight || ''}
            onChange={(e) => onWeightChange(Number(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio por kilogramo (€)
          </label>
          <input
            type="number"
            value={price || ''}
            onChange={(e) => onPriceChange(Number(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            min="0"
            step="0.01"
          />
        </div>
      </div>
    </div>
  );
};

export default FilamentSection;