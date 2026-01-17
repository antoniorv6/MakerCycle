import React from 'react';
import { Package, Clock, Weight, Euro, Zap, Info, Layers, Settings, Palette } from 'lucide-react';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import type { ProjectInfoPanelProps } from '../types';

const ProjectInfoPanel: React.FC<ProjectInfoPanelProps> = ({ 
  pieces,
  totalFilamentWeight, 
  totalPrintHours,
  totalFilamentCost,
  totalElectricityCost,
  materials 
}) => {
  const { formatCurrency, currencySymbol } = useFormatCurrency();
  // Calcular estadísticas de materiales
  const totalMaterials = pieces.reduce((sum, piece) => {
    return sum + (piece.materials?.length || 0);
  }, 0);

  const uniqueMaterials = new Set();
  pieces.forEach(piece => {
    piece.materials?.forEach(material => {
      uniqueMaterials.add(material.materialName || 'Material sin nombre');
    });
  });

  const totalPieces = pieces.reduce((sum, piece) => sum + piece.quantity, 0);
  const uniquePieces = pieces.length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center gap-2 mb-6">
        <Info className="w-6 h-6 text-blue-600" />
        <h3 className="text-lg font-semibold text-gray-900">Desglose Detallado de Materiales</h3>
      </div>

      {/* Estadísticas principales */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
          <div className="flex items-center gap-2 mb-2">
            <Layers className="w-4 h-4 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Piezas</span>
          </div>
          <div className="text-2xl font-bold text-blue-900">{uniquePieces}</div>
          <div className="text-xs text-blue-600">{totalPieces} unidades totales</div>
        </div>

        <div className="bg-green-50 rounded-lg p-4 border border-green-100">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="w-4 h-4 text-green-600" />
            <span className="text-sm font-medium text-green-700">Materiales únicos</span>
          </div>
          <div className="text-2xl font-bold text-green-900">{uniqueMaterials.size}</div>
          <div className="text-xs text-green-600">{totalMaterials} usos totales</div>
        </div>

        <div className="bg-orange-50 rounded-lg p-4 border border-orange-100">
          <div className="flex items-center gap-2 mb-2">
            <Weight className="w-4 h-4 text-orange-600" />
            <span className="text-sm font-medium text-orange-700">Peso total</span>
          </div>
          <div className="text-2xl font-bold text-orange-900">
            {totalFilamentWeight >= 1000 ? `${(totalFilamentWeight / 1000).toFixed(1)}kg` : `${totalFilamentWeight.toFixed(1)}g`}
          </div>
          <div className="text-xs text-orange-600">Material necesario</div>
        </div>

        <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-purple-600" />
            <span className="text-sm font-medium text-purple-700">Tiempo total</span>
          </div>
          <div className="text-2xl font-bold text-purple-900">{totalPrintHours.toFixed(1)}h</div>
          <div className="text-xs text-purple-600">Tiempo de impresión</div>
        </div>
      </div>

      {/* Desglose detallado por piezas */}
      <div className="space-y-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Package className="w-5 h-5" />
          Desglose por piezas y materiales
        </h4>
        
        {pieces.map((piece, index) => {
          const pieceWeight = piece.materials && piece.materials.length > 0 
            ? piece.materials.reduce((sum, material) => {
                const weightInGrams = material.unit === 'kg' ? material.weight * 1000 : material.weight;
                return sum + weightInGrams;
              }, 0)
            : piece.filamentWeight;
          
          const pieceCost = piece.materials && piece.materials.length > 0
            ? piece.materials.reduce((sum, material) => {
                const weightInKg = material.unit === 'g' ? material.weight / 1000 : material.weight;
                return sum + (weightInKg * material.pricePerKg);
              }, 0)
            : (piece.filamentWeight * piece.filamentPrice) / 1000;

          return (
            <div key={piece.id} className="bg-gray-50 rounded-lg p-5 border border-gray-200">
              {/* Header de la pieza */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-sm font-bold text-blue-700">{index + 1}</span>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 text-lg">{piece.name}</div>
                    <div className="text-sm text-gray-600">
                      {piece.quantity} {piece.quantity === 1 ? 'unidad' : 'unidades'} • {(piece.printHours * piece.quantity).toFixed(1)}h de impresión
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-bold text-gray-900">{formatCurrency(pieceCost * piece.quantity)}</div>
                  <div className="text-sm text-gray-600">
                    {pieceWeight >= 1000 ? `${(pieceWeight / 1000).toFixed(1)}kg` : `${pieceWeight.toFixed(1)}g`} totales
                  </div>
                </div>
              </div>

              {/* Desglose de materiales de la pieza */}
              {piece.materials && piece.materials.length > 0 ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 mb-3">
                    <Settings className="w-4 h-4 text-gray-600" />
                    <span className="font-medium text-gray-700">Materiales utilizados ({piece.materials.length} tipos):</span>
                  </div>
                  
                  <div className="grid gap-3">
                    {piece.materials.map((material, materialIndex) => (
                      <div key={material.id || materialIndex} className="bg-white rounded-lg p-4 border border-gray-100 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-6 h-6 rounded-full border-2 border-gray-300 shadow-sm" 
                              style={{ backgroundColor: material.color || '#808080' }}
                              title={`Color: ${material.color || '#808080'}`}
                            />
                            <div>
                              <div className="font-semibold text-gray-900">
                                {material.materialName || 'Material sin nombre'}
                              </div>
                              <div className="text-sm text-gray-500">
                                {material.materialType || 'PLA'} • {material.brand || 'Sin marca'}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              {formatCurrency((material.weight || 0) * (material.pricePerKg || 0) / (material.unit === 'kg' ? 1 : 1000))}
                            </div>
                            <div className="text-sm text-gray-600">
                              {material.weight || 0}{material.unit || 'g'} • {currencySymbol}{material.pricePerKg || 0}/kg
                            </div>
                          </div>
                        </div>
                        
                        {/* Detalles técnicos del material */}
                        <div className="grid grid-cols-2 gap-4 text-xs">
                          <div className="bg-gray-50 rounded p-2">
                            <div className="text-gray-600">Peso utilizado</div>
                            <div className="font-medium text-gray-900">
                              {material.weight || 0}{material.unit || 'g'}
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded p-2">
                            <div className="text-gray-600">Precio por kg</div>
                            <div className="font-medium text-gray-900">
                              {currencySymbol}{material.pricePerKg || 0}
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded p-2">
                            <div className="text-gray-600">Categoría</div>
                            <div className="font-medium text-gray-900 capitalize">
                              {material.category || 'filament'}
                            </div>
                          </div>
                          <div className="bg-gray-50 rounded p-2">
                            <div className="text-gray-600">Unidad</div>
                            <div className="font-medium text-gray-900">
                              {material.unit || 'g'}
                            </div>
                          </div>
                        </div>
                        
                        {/* Notas del material */}
                        {material.notes && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <div className="text-xs text-gray-600">Notas:</div>
                            <div className="text-sm text-gray-700 italic">{material.notes}</div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  
                  {/* Resumen de la pieza */}
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-100 mt-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Palette className="w-4 h-4 text-blue-600" />
                        <span className="font-medium text-blue-700">Resumen de la pieza</span>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-blue-900">
                          {formatCurrency(pieceCost * piece.quantity)}
                        </div>
                        <div className="text-sm text-blue-600">
                          {pieceWeight >= 1000 ? `${(pieceWeight / 1000).toFixed(1)}kg` : `${pieceWeight.toFixed(1)}g`} • {(piece.printHours * piece.quantity).toFixed(1)}h
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                  <div className="flex items-center gap-2">
                    <Info className="w-4 h-4 text-yellow-600" />
                    <div>
                      <div className="font-medium text-yellow-800">Sistema Legacy</div>
                      <div className="text-sm text-yellow-700">
                        Usando filamento único: {piece.filamentWeight}g a {currencySymbol}{piece.filamentPrice}/kg
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Materiales adicionales del proyecto */}
      {materials.length > 0 && (
        <div className="mt-6 pt-6 border-t border-gray-200">
          <h4 className="text-md font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Materiales adicionales del proyecto
          </h4>
          <div className="space-y-2">
            {materials.map((material, index) => (
              <div key={material.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="font-medium text-gray-900">{material.name}</div>
                <div className="text-sm font-semibold text-gray-700">{formatCurrency(material.price)}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Totales finales */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-lg font-semibold text-gray-900">Coste total del proyecto</div>
              <div className="text-sm text-gray-600">
                Materiales: {formatCurrency(totalFilamentCost)} • Electricidad: {formatCurrency(totalElectricityCost)}
                {materials.length > 0 && ` • Adicionales: ${formatCurrency(materials.reduce((sum, m) => sum + m.price, 0))}`}
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-gray-900">
                {formatCurrency(totalFilamentCost + totalElectricityCost + materials.reduce((sum, m) => sum + m.price, 0))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoPanel;