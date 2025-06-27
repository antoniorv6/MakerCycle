import React from 'react';
import { TrendingUp } from 'lucide-react';
import type { SalePricePanelProps } from '../types';

const SalePricePanel: React.FC<SalePricePanelProps> = ({ 
  salePrice, 
  costs, 
  vatPercentage, 
  profitMargin 
}) => {
  return (
    <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 border border-purple-200">
      <div className="flex items-center mb-6">
        <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Precio de Venta Recomendado</h2>
      </div>
      <div className="space-y-4">
        <div className="flex justify-between items-center py-2 text-sm">
          <span className="text-gray-700">Coste base</span>
          <span className="text-gray-900 font-medium">€{salePrice.basePrice.toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center py-2 text-sm">
          <span className="text-gray-700">+ Margen ({profitMargin}%)</span>
          <span className="text-gray-900 font-medium">€{(salePrice.priceWithMargin - salePrice.basePrice).toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center py-2 text-sm border-b border-purple-200">
          <span className="text-gray-700">+ IVA ({vatPercentage}%)</span>
          <span className="text-gray-900 font-medium">€{(salePrice.priceWithTax - salePrice.priceWithMargin).toFixed(2)}</span>
        </div>
        <div className="flex justify-between items-center py-4 bg-white rounded-lg px-4 mt-6">
          <span className="text-lg font-bold text-gray-900">Precio Final</span>
          <span className="text-2xl font-bold text-purple-600">€{salePrice.recommendedPrice.toFixed(2)}</span>
        </div>
      </div>
      <div className="mt-4 p-3 bg-purple-50 rounded-lg border border-purple-200">
        <div className="text-sm text-purple-700">
          <strong>Margen real:</strong> €{(salePrice.recommendedPrice - costs.total).toFixed(2)} 
          ({costs.total > 0 ? ((salePrice.recommendedPrice - costs.total) / costs.total * 100).toFixed(1) : '0'}%)
        </div>
      </div>
    </div>
  );
};

export default SalePricePanel;