import React from 'react';
import type { CostBreakdownPanelProps } from '@/types';

const CostBreakdownPanel: React.FC<CostBreakdownPanelProps> = ({ costs }) => {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-lg p-6 border border-slate-200">
      <h2 className="text-xl font-semibold text-slate-900 mb-6">Desglose de Costes</h2>
      <div className="space-y-4">
        <div className="flex justify-between items-center py-3 border-b border-slate-200">
          <span className="text-slate-700 font-medium">Filamento</span>
          <span className="text-xl font-semibold text-slate-900">€{costs.filament.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-slate-200">
          <span className="text-slate-700 font-medium">Electricidad</span>
          <span className="text-xl font-semibold text-slate-900">€{costs.electricity.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center py-3 border-b border-slate-200">
          <span className="text-slate-700 font-medium">Materiales adicionales</span>
          <span className="text-xl font-semibold text-slate-900">€{costs.materials.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center py-4 bg-white rounded-lg px-4 mt-6">
          <span className="text-lg font-bold text-slate-900">Coste Total</span>
          <span className="text-2xl font-bold text-slate-600">€{costs.total.toFixed(2)}</span>
        </div>
      </div>
    </div>
  );
};

export default CostBreakdownPanel;