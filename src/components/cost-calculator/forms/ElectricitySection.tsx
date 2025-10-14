import React from 'react';
import { Zap, Info } from 'lucide-react';
import type { ElectricitySectionProps } from '../types';

const ElectricitySection: React.FC<ElectricitySectionProps> = ({
  printHours,
  electricityCost,
  printerPower,
  onElectricityCostChange,
  onPrinterPowerChange
}) => {
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
            value={printerPower || ''}
            onChange={(e) => onPrinterPowerChange(Number(e.target.value) || 0)}
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