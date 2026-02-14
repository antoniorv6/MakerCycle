import React, { useState } from 'react';
import { Truck, Package, Percent, Weight } from 'lucide-react';
import { useShippingPresets } from '@/hooks/useShippingPresets';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useShippingCost } from '../hooks/useShippingCost';
import type { ShippingPreset } from '@/types';

interface ShippingSectionProps {
  shippingEnabled: boolean;
  selectedPresetId: string | null;
  packagingWeightMode: 'percentage' | 'fixed';
  packagingWeightValue: number;
  productionWeightGrams: number;
  onToggleShipping: (enabled: boolean) => void;
  onSelectPreset: (presetId: string | null) => void;
  onUpdatePackagingMode: (mode: 'percentage' | 'fixed') => void;
  onUpdatePackagingValue: (value: number) => void;
  onShippingCostChange: (cost: number) => void;
}

const ShippingSection: React.FC<ShippingSectionProps> = ({
  shippingEnabled,
  selectedPresetId,
  packagingWeightMode,
  packagingWeightValue,
  productionWeightGrams,
  onToggleShipping,
  onSelectPreset,
  onUpdatePackagingMode,
  onUpdatePackagingValue,
  onShippingCostChange,
}) => {
  const { presets, loading } = useShippingPresets();
  const { formatCurrency } = useFormatCurrency();
  const [packagingInput, setPackagingInput] = useState<string>(packagingWeightValue.toString());

  const selectedPreset: ShippingPreset | null = selectedPresetId
    ? presets.find(p => p.id === selectedPresetId) || null
    : null;

  const { shippingCost, totalWeight, packagingWeight, applicableTier } = useShippingCost({
    shippingEnabled,
    selectedPreset,
    packagingWeightMode,
    packagingWeightValue,
    productionWeightGrams,
  });

  // Notificar cambio de coste al padre
  React.useEffect(() => {
    onShippingCostChange(shippingCost);
  }, [shippingCost, onShippingCostChange]);

  const handlePackagingValueChange = (value: string) => {
    setPackagingInput(value);
    const numValue = parseFloat(value);
    if (!isNaN(numValue) && numValue >= 0) {
      onUpdatePackagingValue(numValue);
    }
  };

  const handlePackagingBlur = () => {
    const numValue = parseFloat(packagingInput);
    if (isNaN(numValue) || numValue < 0) {
      setPackagingInput('0');
      onUpdatePackagingValue(0);
    } else {
      setPackagingInput(numValue.toString());
    }
  };

  const handleModeChange = (mode: 'percentage' | 'fixed') => {
    onUpdatePackagingMode(mode);
    // Valores por defecto al cambiar de modo
    if (mode === 'percentage') {
      setPackagingInput('10');
      onUpdatePackagingValue(10);
    } else {
      setPackagingInput('250');
      onUpdatePackagingValue(250);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-200">
      {/* Header con toggle */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
          <Truck className="w-6 h-6 text-blue-600" />
          Costes de Envío
        </h2>
        <label className="flex items-center gap-2 cursor-pointer">
          <span className="text-sm text-slate-600">Incluir envío</span>
          <div className="relative">
            <input
              type="checkbox"
              checked={shippingEnabled}
              onChange={(e) => onToggleShipping(e.target.checked)}
              className="sr-only"
            />
            <div className={`w-11 h-6 rounded-full transition-colors ${shippingEnabled ? 'bg-blue-600' : 'bg-gray-300'}`}>
              <div className={`w-5 h-5 bg-white rounded-full shadow transform transition-transform ${shippingEnabled ? 'translate-x-5' : 'translate-x-0.5'} mt-0.5`}></div>
            </div>
          </div>
        </label>
      </div>

      {shippingEnabled && (
        <div className="space-y-4">
          {/* Selector de proveedor */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Proveedor de envío
            </label>
            {loading ? (
              <div className="h-10 bg-gray-100 rounded-lg animate-pulse"></div>
            ) : presets.length === 0 ? (
              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-sm text-yellow-800">
                No tienes proveedores de envío configurados. Ve a{' '}
                <span className="font-semibold">Configuración &gt; Envíos</span> para crear uno.
              </div>
            ) : (
              <select
                value={selectedPresetId || ''}
                onChange={(e) => onSelectPreset(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Seleccionar proveedor --</option>
                {presets.map(preset => (
                  <option key={preset.id} value={preset.id}>
                    {preset.name} ({preset.provider_name})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Configuración de embalaje */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Peso del embalaje
            </label>
            <div className="flex gap-2 mb-2">
              <button
                type="button"
                onClick={() => handleModeChange('percentage')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                  packagingWeightMode === 'percentage'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Percent className="w-4 h-4" />
                Porcentaje
              </button>
              <button
                type="button"
                onClick={() => handleModeChange('fixed')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors border ${
                  packagingWeightMode === 'fixed'
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Weight className="w-4 h-4" />
                Peso fijo
              </button>
            </div>
            <div className="relative">
              <input
                type="number"
                step={packagingWeightMode === 'percentage' ? '1' : '10'}
                min="0"
                value={packagingInput}
                onChange={(e) => handlePackagingValueChange(e.target.value)}
                onBlur={handlePackagingBlur}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent pr-12"
                placeholder={packagingWeightMode === 'percentage' ? 'Ej: 10' : 'Ej: 250'}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-gray-500">
                {packagingWeightMode === 'percentage' ? '%' : 'g'}
              </span>
            </div>
          </div>

          {/* Resumen de cálculo */}
          {selectedPreset && (
            <div className="bg-slate-50 p-4 rounded-lg space-y-2">
              <div className="flex justify-between text-sm text-slate-600">
                <span className="flex items-center gap-1">
                  <Package className="w-4 h-4" />
                  Peso de producción
                </span>
                <span className="font-medium">{(productionWeightGrams / 1000).toFixed(2)} kg</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Peso del embalaje ({packagingWeightMode === 'percentage' ? `${packagingWeightValue}%` : `fijo`})</span>
                <span className="font-medium">+ {(packagingWeight / 1000).toFixed(2)} kg</span>
              </div>
              <div className="flex justify-between font-semibold text-slate-900 border-t border-slate-200 pt-2">
                <span>Peso total</span>
                <span>{(totalWeight / 1000).toFixed(2)} kg</span>
              </div>
              {applicableTier && (
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Tramo aplicado</span>
                  <span>{(applicableTier.min_weight / 1000).toFixed(0)}-{(applicableTier.max_weight / 1000).toFixed(0)} kg</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-bold text-blue-600 border-t border-slate-200 pt-2">
                <span>Coste de envío</span>
                <span>{formatCurrency(shippingCost)}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ShippingSection;
