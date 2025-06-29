import React from 'react';
import { Package, Clock, Weight, Euro, TrendingUp, Info } from 'lucide-react';
import type { ProjectSummaryProps } from '../types';

const ProjectSummaryPanel: React.FC<ProjectSummaryProps> = ({
  pieces,
  totalFilamentWeight,
  totalPrintHours,
  totalFilamentCost,
  totalElectricityCost
}) => {
  const totalPieces = pieces.reduce((sum, piece) => sum + piece.quantity, 0);
  const uniquePieces = pieces.length;
  const totalCost = totalFilamentCost + totalElectricityCost;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <Package className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Resumen del proyecto</h3>
      </div>

      {/* Stats principales en filas */}
      <div className="space-y-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium text-blue-700">Piezas únicas</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-900">{uniquePieces}</div>
              <div className="text-xs text-blue-600">{totalPieces} unidades totales</div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Weight className="w-5 h-5 text-green-600" />
              <span className="text-sm font-medium text-green-700">Peso total</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-green-900">{totalFilamentWeight.toFixed(1)}g</div>
              <div className="text-xs text-green-600">Filamento necesario</div>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-orange-600" />
              <span className="text-sm font-medium text-orange-700">Tiempo total</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-orange-900">{totalPrintHours.toFixed(1)}h</div>
              <div className="text-xs text-orange-600">Tiempo de impresión</div>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Euro className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-medium text-purple-700">Coste filamento</span>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-purple-900">{totalFilamentCost.toFixed(2)}€</div>
              <div className="text-xs text-purple-600">Coste total del material</div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista detallada de piezas */}
      <div className="border-t border-gray-200 pt-6">
        <h4 className="text-md font-semibold text-gray-900 mb-4">Detalle por pieza</h4>
        <div className="space-y-3">
          {pieces.map((piece, index) => (
            <div key={piece.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-blue-700">{index + 1}</span>
                </div>
                <div>
                  <div className="font-medium text-gray-900">{piece.name}</div>
                  <div className="text-sm text-gray-600">
                    {piece.quantity} {piece.quantity === 1 ? 'unidad' : 'unidades'}
                    {piece.notes && ` • ${piece.notes}`}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">
                  {((piece.filamentWeight * piece.quantity * piece.filamentPrice) / 1000).toFixed(2)}€
                </div>
                <div className="text-sm text-gray-600">
                  {(piece.filamentWeight * piece.quantity).toFixed(1)}g • {(piece.printHours * piece.quantity).toFixed(1)}h
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Totales finales */}
      <div className="border-t border-gray-200 pt-6 mt-6">
        <div className="flex justify-between items-center">
          <span className="text-lg font-semibold text-gray-900">Total del proyecto</span>
          <div className="text-right">
            <div className="text-2xl font-bold text-gray-900">€{totalCost.toFixed(2)}</div>
            <div className="text-sm text-gray-600">
              Filamento: {totalFilamentCost.toFixed(2)}€ • Electricidad: {totalElectricityCost.toFixed(2)}€
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectSummaryPanel; 