import React, { useState } from 'react';
import { Package } from 'lucide-react';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import type { FilamentSectionProps } from '../types';

const FilamentSection: React.FC<FilamentSectionProps> = ({
  weight,
  price,
  onWeightChange,
  onPriceChange
}) => {
  const [weightInput, setWeightInput] = useState<string>(weight?.toString() || '');
  const [priceInput, setPriceInput] = useState<string>(price?.toString() || '');
  const { currencySymbol } = useFormatCurrency();

  // Sync with props when they change externally
  React.useEffect(() => {
    setWeightInput(weight?.toString() || '');
  }, [weight]);

  React.useEffect(() => {
    setPriceInput(price?.toString() || '');
  }, [price]);

  const handleWeightChange = (value: string) => {
    // Allow any input while typing - empty, decimal point, negative sign, etc.
    setWeightInput(value);
    // Only update parent if we have a valid number
    if (value !== '' && value !== '-' && value !== '.') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        onWeightChange(numValue);
      }
    }
  };

  const handleWeightBlur = () => {
    // Normalize empty or incomplete values to 0
    if (weightInput === '' || weightInput === '-' || weightInput === '.') {
      setWeightInput('0');
      onWeightChange(0);
    } else {
      // Normalize values like ".5" to "0.5"
      const numValue = parseFloat(weightInput);
      if (!isNaN(numValue)) {
        setWeightInput(numValue.toString());
        onWeightChange(numValue);
      } else {
        setWeightInput('0');
        onWeightChange(0);
      }
    }
  };

  const handlePriceChange = (value: string) => {
    // Allow any input while typing - empty, decimal point, negative sign, etc.
    setPriceInput(value);
    // Only update parent if we have a valid number
    if (value !== '' && value !== '-' && value !== '.') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        onPriceChange(numValue);
      }
    }
  };

  const handlePriceBlur = () => {
    // Normalize empty or incomplete values to 0
    if (priceInput === '' || priceInput === '-' || priceInput === '.') {
      setPriceInput('0');
      onPriceChange(0);
    } else {
      // Normalize values like ".5" to "0.5"
      const numValue = parseFloat(priceInput);
      if (!isNaN(numValue)) {
        setPriceInput(numValue.toString());
        onPriceChange(numValue);
      } else {
        setPriceInput('0');
        onPriceChange(0);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center mb-4">
        <Package className="w-5 h-5 text-slate-600 mr-2" />
        <h2 className="text-xl font-semibold text-slate-900">Filamento</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Cantidad de filamento (gramos)
          </label>
          <input
            type="number"
            value={weightInput}
            onChange={(e) => handleWeightChange(e.target.value)}
            onBlur={handleWeightBlur}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
            min="0"
            step="0.01"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Precio por kilogramo ({currencySymbol})
          </label>
          <input
            type="number"
            value={priceInput}
            onChange={(e) => handlePriceChange(e.target.value)}
            onBlur={handlePriceBlur}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
            min="0"
            step="0.01"
          />
        </div>
      </div>
    </div>
  );
};

export default FilamentSection;