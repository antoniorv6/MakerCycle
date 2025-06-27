import React from 'react';
import { Zap } from 'lucide-react';
import type { ElectricitySectionProps } from '../types';

const ElectricitySection: React.FC<ElectricitySectionProps> = ({
  printHours,
  electricityCost,
  onPrintHoursChange,
  onElectricityCostChange
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center mb-4">
        <Zap className="w-5 h-5 text-yellow-500 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Electricidad</h2>
      </div>
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tiempo de impresión (horas)
          </label>
          <input
            type="number"
            value={printHours || ''}
            onChange={(e) => onPrintHoursChange(Number(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
            min="0"
            step="0.1"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Coste electricidad (€/kWh)
          </label>
          <input
            type="number"
            value={electricityCost || ''}
            onChange={(e) => onElectricityCostChange(Number(e.target.value) || 0)}
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