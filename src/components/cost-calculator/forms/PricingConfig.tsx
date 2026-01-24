import React, { useState } from 'react';
import { TrendingUp, Percent } from 'lucide-react';
import type { PricingConfigProps } from '../types';

const PricingConfig: React.FC<PricingConfigProps> = ({
  vatPercentage,
  profitMargin,
  onVatChange,
  onMarginChange
}) => {
  const [vatInput, setVatInput] = useState<string>(vatPercentage?.toString() || '');
  const [marginInput, setMarginInput] = useState<string>(profitMargin?.toString() || '');

  // Sync with props when they change externally
  React.useEffect(() => {
    setVatInput(vatPercentage?.toString() || '');
  }, [vatPercentage]);

  React.useEffect(() => {
    setMarginInput(profitMargin?.toString() || '');
  }, [profitMargin]);

  const handleVatChange = (value: string) => {
    // Allow any input while typing - empty, decimal point, negative sign, etc.
    setVatInput(value);
    // Only update parent if we have a valid number
    if (value !== '' && value !== '-' && value !== '.') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        onVatChange(numValue);
      }
    }
  };

  const handleVatBlur = () => {
    // Normalize empty or incomplete values to 0
    if (vatInput === '' || vatInput === '-' || vatInput === '.') {
      setVatInput('0');
      onVatChange(0);
    } else {
      // Normalize values like ".5" to "0.5"
      const numValue = parseFloat(vatInput);
      if (!isNaN(numValue)) {
        setVatInput(numValue.toString());
        onVatChange(numValue);
      } else {
        setVatInput('0');
        onVatChange(0);
      }
    }
  };

  const handleMarginChange = (value: string) => {
    // Allow any input while typing - empty, decimal point, negative sign, etc.
    setMarginInput(value);
    // Only update parent if we have a valid number
    if (value !== '' && value !== '-' && value !== '.') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        onMarginChange(numValue);
      }
    }
  };

  const handleMarginBlur = () => {
    // Normalize empty or incomplete values to 0
    if (marginInput === '' || marginInput === '-' || marginInput === '.') {
      setMarginInput('0');
      onMarginChange(0);
    } else {
      // Normalize values like ".5" to "0.5"
      const numValue = parseFloat(marginInput);
      if (!isNaN(numValue)) {
        setMarginInput(numValue.toString());
        onMarginChange(numValue);
      } else {
        setMarginInput('0');
        onMarginChange(0);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center mb-4">
        <TrendingUp className="w-5 h-5 text-slate-600 mr-2" />
        <h2 className="text-xl font-semibold text-slate-900">Configuración de Precio de Venta</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            IVA (%)
          </label>
          <div className="relative">
            <input
              type="number"
              value={vatInput}
              onChange={(e) => handleVatChange(e.target.value)}
              onBlur={handleVatBlur}
              className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
              min="0"
              max="100"
              step="0.1"
              placeholder="21"
            />
            <Percent className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Margen de beneficio (%)
          </label>
          <div className="relative">
            <input
              type="number"
              value={marginInput}
              onChange={(e) => handleMarginChange(e.target.value)}
              onBlur={handleMarginBlur}
              className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
              min="0"
              max="1000"
              step="0.1"
              placeholder="15"
            />
            <Percent className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 transform -translate-y-1/2" />
          </div>
        </div>
      </div>
      
      {/* Información adicional */}
      <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-200">
        <div className="text-sm text-slate-700">
          <div className="font-medium mb-1">💡 Información:</div>
          <ul className="text-xs space-y-1">
            <li>• El IVA se aplica sobre el precio con margen</li>
            <li>• El precio final se redondea a 0.50€ más cercano</li>
            <li>• Margen típico para impresión 3D: 15-30% (recomendado)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PricingConfig;