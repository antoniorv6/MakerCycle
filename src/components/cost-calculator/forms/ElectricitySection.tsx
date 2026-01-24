import React, { useState } from 'react';
import { Zap, Info } from 'lucide-react';
import type { ElectricitySectionProps } from '../types';

const ElectricitySection: React.FC<ElectricitySectionProps> = ({
  printHours,
  electricityCost,
  printerPower,
  onElectricityCostChange,
  onPrinterPowerChange
}) => {
  const [powerInput, setPowerInput] = useState<string>(printerPower?.toString() || '');
  const [costInput, setCostInput] = useState<string>(electricityCost?.toString() || '');

  // Sync with props when they change externally
  React.useEffect(() => {
    setPowerInput(printerPower?.toString() || '');
  }, [printerPower]);

  React.useEffect(() => {
    setCostInput(electricityCost?.toString() || '');
  }, [electricityCost]);

  const handlePowerChange = (value: string) => {
    // Allow any input while typing - empty, decimal point, negative sign, etc.
    setPowerInput(value);
    // Only update parent if we have a valid number
    if (value !== '' && value !== '-' && value !== '.') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        onPrinterPowerChange(numValue);
      }
    }
  };

  const handlePowerBlur = () => {
    // Normalize empty or incomplete values to 0
    if (powerInput === '' || powerInput === '-' || powerInput === '.') {
      setPowerInput('0');
      onPrinterPowerChange(0);
    } else {
      // Normalize values like ".5" to "0.5"
      const numValue = parseFloat(powerInput);
      if (!isNaN(numValue)) {
        setPowerInput(numValue.toString());
        onPrinterPowerChange(numValue);
      } else {
        setPowerInput('0');
        onPrinterPowerChange(0);
      }
    }
  };

  const handleCostChange = (value: string) => {
    // Allow any input while typing - empty, decimal point, negative sign, etc.
    setCostInput(value);
    // Only update parent if we have a valid number
    if (value !== '' && value !== '-' && value !== '.') {
      const numValue = parseFloat(value);
      if (!isNaN(numValue)) {
        onElectricityCostChange(numValue);
      }
    }
  };

  const handleCostBlur = () => {
    // Normalize empty or incomplete values to 0
    if (costInput === '' || costInput === '-' || costInput === '.') {
      setCostInput('0');
      onElectricityCostChange(0);
    } else {
      // Normalize values like ".5" to "0.5"
      const numValue = parseFloat(costInput);
      if (!isNaN(numValue)) {
        setCostInput(numValue.toString());
        onElectricityCostChange(numValue);
      } else {
        setCostInput('0');
        onElectricityCostChange(0);
      }
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center mb-4">
        <Zap className="w-5 h-5 text-yellow-500 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Electricidad</h2>
      </div>
      <div className="grid md:grid-cols-3 gap-4">
        <div>
          <div className="flex items-center mb-2">
            <span className="text-sm font-medium text-gray-700">
              Tiempo total de impresión
            </span>
            <div className="group relative ml-2">
              <Info className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                Calculado automáticamente sumando las horas de todas las piezas
              </div>
            </div>
          </div>
          <div className="text-lg font-semibold text-gray-900">
            {printHours.toFixed(1)} horas
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Potencia impresora (kW)
          </label>
          <input
            type="number"
            value={powerInput}
            onChange={(e) => handlePowerChange(e.target.value)}
            onBlur={handlePowerBlur}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            min="0"
            step="0.01"
            placeholder="0.35"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Coste electricidad (€/kWh)
          </label>
          <input
            type="number"
            value={costInput}
            onChange={(e) => handleCostChange(e.target.value)}
            onBlur={handleCostBlur}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            min="0"
            step="0.01"
          />
        </div>
      </div>
    </div>
  );
};

export default ElectricitySection;