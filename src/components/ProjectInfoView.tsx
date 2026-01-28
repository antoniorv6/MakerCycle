import React from 'react';
import { Package, Clock, Euro, Weight, Zap, Layers, Settings, Palette, Info, ArrowLeft, Edit3 } from 'lucide-react';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import type { AppProject } from '@/types';

interface ProjectInfoViewProps {
  project: AppProject;
  onEdit: () => void;
  onBack?: () => void;
}

const ProjectInfoView: React.FC<ProjectInfoViewProps> = ({ project, onEdit, onBack }) => {
  const { formatCurrency, currencySymbol } = useFormatCurrency();
  // Calcular totales del proyecto
  const totalFilamentCost = project.pieces?.reduce((sum, piece) => {
    if ((piece as any).materials && (piece as any).materials.length > 0) {
      // Usar la nueva estructura de materiales
      const pieceCost = (piece as any).materials.reduce((materialSum: number, material: any) => {
        const weightInKg = material.unit === 'g' ? material.weight / 1000 : material.weight;
        const pricePerKg = material.pricePerKg || material.price_per_kg || 0;
        return materialSum + (weightInKg * pricePerKg);
      }, 0);
      return sum + (pieceCost * piece.quantity);
    } else {
      // Fallback a la estructura antigua para compatibilidad
      return sum + (piece.filamentWeight * piece.quantity * piece.filamentPrice) / 1000;
    }
  }, 0) || 0;

  const totalFilamentWeight = project.pieces?.reduce((sum, piece) => {
    if ((piece as any).materials && (piece as any).materials.length > 0) {
      // Usar la nueva estructura de materiales
      const pieceWeight = (piece as any).materials.reduce((materialSum: number, material: any) => {
        const weightInGrams = material.unit === 'kg' ? material.weight * 1000 : material.weight;
        return materialSum + weightInGrams;
      }, 0);
      return sum + (pieceWeight * piece.quantity);
    } else {
      // Fallback a la estructura antigua para compatibilidad
      return sum + (piece.filamentWeight * piece.quantity);
    }
  }, 0) || 0;

  const totalPrintHours = project.pieces?.reduce((sum, piece) => sum + (piece.printHours * piece.quantity), 0) || 0;
  const totalMaterials = project.materials?.length || 0;
  
  // Calcular materiales únicos
  const uniqueMaterials = new Set<string>();
  project.pieces?.forEach(piece => {
    if ((piece as any).materials && (piece as any).materials.length > 0) {
      (piece as any).materials.forEach((material: any) => {
        uniqueMaterials.add(material.materialName || 'Material sin nombre');
      });
    }
  });

  const totalElectricityCost = totalPrintHours * (project.printerPower || 0.35) * project.electricityCost;

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header con navegación */}
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-8">
            {onBack && (
              <button
                onClick={onBack}
                className="p-2 bg-gray-50 hover:bg-gray-200 active:bg-gray-300 border border-gray-200 rounded-lg transition-colors group"
              >
                <ArrowLeft className="w-5 h-5 text-gray-700 group-hover:text-gray-900" />
              </button>
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-1">{project.name}</h1>
              <p className="text-gray-500">Proyecto de impresión 3D</p>
            </div>
            <button
              onClick={onEdit}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2"
            >
              <Edit3 className="w-4 h-4" />
              Editar Proyecto
            </button>
          </div>

          {/* Estadísticas principales */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-6 border border-primary-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-primary-100 rounded-lg">
                  <Layers className="w-5 h-5 text-primary-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Piezas</h3>
                  <p className="text-sm text-gray-500">Total de piezas</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-primary-700">{project.pieces?.length || 0}</div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-success-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-success-100 rounded-lg">
                  <Zap className="w-5 h-5 text-success-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Materiales</h3>
                  <p className="text-sm text-gray-500">Tipos únicos</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-success-700">{uniqueMaterials.size}</div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-warning-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-warning-100 rounded-lg">
                  <Weight className="w-5 h-5 text-warning-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Peso Total</h3>
                  <p className="text-sm text-gray-500">Material utilizado</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-warning-700">
                {totalFilamentWeight >= 1000 ? `${(totalFilamentWeight / 1000).toFixed(1)}kg` : `${totalFilamentWeight.toFixed(1)}g`}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 border border-error-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 bg-error-100 rounded-lg">
                  <Clock className="w-5 h-5 text-error-600" />
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Tiempo</h3>
                  <p className="text-sm text-gray-500">Horas de impresión</p>
                </div>
              </div>
              <div className="text-2xl font-bold text-error-700">{totalPrintHours.toFixed(1)}h</div>
            </div>
          </div>
        </div>

        {/* Desglose detallado por piezas */}
        {project.pieces && project.pieces.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8">
            <div className="px-6 py-4 border-b border-primary-200 bg-primary-50">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-primary-600" />
                <h2 className="text-xl font-semibold text-primary-900">Desglose por Piezas</h2>
              </div>
              <p className="text-primary-600 text-sm mt-1">Análisis detallado de cada pieza y sus materiales</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-6">
                {project.pieces.map((piece, index) => {
                  const pieceWeight = (piece as any).materials && (piece as any).materials.length > 0
                    ? (piece as any).materials.reduce((sum: number, material: any) => {
                        const weightInGrams = material.unit === 'kg' ? material.weight * 1000 : material.weight;
                        return sum + weightInGrams;
                      }, 0)
                    : piece.filamentWeight;

                  const pieceCost = (piece as any).materials && (piece as any).materials.length > 0
                    ? (piece as any).materials.reduce((sum: number, material: any) => {
                        const weightInKg = material.unit === 'g' ? material.weight / 1000 : material.weight;
                        const pricePerKg = material.pricePerKg || material.price_per_kg || 0;
                        return sum + (weightInKg * pricePerKg);
                      }, 0)
                    : (piece.filamentWeight * piece.filamentPrice) / 1000;

                  return (
                    <div key={piece.id} className="bg-primary-50 rounded-lg p-6 border border-primary-200">
                      {/* Header de la pieza */}
                      <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                            <span className="text-sm font-bold text-white">{index + 1}</span>
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900">{piece.name}</h3>
                            <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                              <span className="flex items-center gap-1">
                                <Package className="w-4 h-4" />
                                {piece.quantity} {piece.quantity === 1 ? 'unidad' : 'unidades'}
                              </span>
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {(piece.printHours * piece.quantity).toFixed(1)}h
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-gray-900">{formatCurrency(pieceCost * piece.quantity)}</div>
                          <div className="text-sm text-gray-500">
                            {pieceWeight >= 1000 ? `${(pieceWeight / 1000).toFixed(1)}kg` : `${pieceWeight.toFixed(1)}g`} totales
                          </div>
                        </div>
                      </div>

                      {/* Materiales de la pieza */}
                      {(piece as any).materials && (piece as any).materials.length > 0 ? (
                        <div className="space-y-4">
                          <div className="flex items-center gap-2 mb-4">
                            <Settings className="w-5 h-5 text-gray-600" />
                            <span className="text-lg font-semibold text-gray-800">
                              Materiales utilizados ({(piece as any).materials.length} tipos)
                            </span>
                          </div>

                          <div className="space-y-3">
                            {(piece as any).materials.map((material: any, materialIndex: number) => (
                              <div key={material.id || materialIndex} className="bg-white rounded-lg p-4 border border-gray-200">
                                <div className="flex items-center justify-between mb-3">
                                  <div className="flex items-center gap-3">
                                    <div
                                      className="w-6 h-6 rounded-full border border-gray-300"
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
                                      {formatCurrency((material.weight || 0) * (material.pricePerKg || material.price_per_kg || 0) / (material.unit === 'kg' ? 1 : 1000))}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {material.weight || 0}{material.unit || 'g'} • {currencySymbol}{material.pricePerKg || material.price_per_kg || 0}/kg
                                    </div>
                                  </div>
                                </div>

                                {/* Detalles técnicos del material */}
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                  <div className="bg-gray-50 rounded p-2">
                                    <div className="text-xs text-gray-500 mb-1">Peso</div>
                                    <div className="font-medium text-gray-900 text-sm">
                                      {material.weight || 0}{material.unit || 'g'}
                                    </div>
                                  </div>
                                  <div className="bg-gray-50 rounded p-2">
                                    <div className="text-xs text-gray-500 mb-1">Precio/kg</div>
                                    <div className="font-medium text-gray-900 text-sm">
                                      {currencySymbol}{material.pricePerKg || material.price_per_kg || 0}
                                    </div>
                                  </div>
                                  <div className="bg-gray-50 rounded p-2">
                                    <div className="text-xs text-gray-500 mb-1">Categoría</div>
                                    <div className="font-medium text-gray-900 text-sm capitalize">
                                      {material.category || 'filament'}
                                    </div>
                                  </div>
                                  <div className="bg-gray-50 rounded p-2">
                                    <div className="text-xs text-gray-500 mb-1">Unidad</div>
                                    <div className="font-medium text-gray-900 text-sm">
                                      {material.unit || 'g'}
                                    </div>
                                  </div>
                                </div>

                                {/* Notas del material */}
                                {material.notes && (
                                  <div className="mt-3 pt-3 border-t border-gray-100">
                                    <div className="text-xs text-gray-500 mb-1">Notas:</div>
                                    <div className="text-sm text-gray-700 italic">
                                      {material.notes}
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        // Mostrar datos legacy como si fuera un material
                        <div className="space-y-3">
                          <div className="flex items-center gap-2 mb-3">
                            <Info className="w-4 h-4 text-gray-500" />
                            <span className="font-medium text-gray-700">
                              Material Legacy (Sistema anterior)
                            </span>
                          </div>

                          <div className="bg-gray-100 rounded-lg p-4 border border-gray-200">
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3">
                                <div className="w-6 h-6 rounded-full border border-gray-400 bg-gray-200 flex items-center justify-center">
                                  <Package className="w-3 h-3 text-gray-600" />
                                </div>
                                <div>
                                  <div className="font-semibold text-gray-900">
                                    Filamento Principal
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    PLA • Sistema Legacy
                                  </div>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="text-lg font-bold text-gray-900">
                                  {formatCurrency((piece.filamentWeight * piece.filamentPrice) / 1000)}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {piece.filamentWeight}g • {currencySymbol}{piece.filamentPrice}/kg
                                </div>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              <div className="bg-white rounded p-2">
                                <div className="text-xs text-gray-500 mb-1">Peso</div>
                                <div className="font-medium text-gray-900 text-sm">
                                  {piece.filamentWeight}g
                                </div>
                              </div>
                              <div className="bg-white rounded p-2">
                                <div className="text-xs text-gray-500 mb-1">Precio/kg</div>
                                <div className="font-medium text-gray-900 text-sm">
                                  {currencySymbol}{piece.filamentPrice}
                                </div>
                              </div>
                              <div className="bg-white rounded p-2">
                                <div className="text-xs text-gray-500 mb-1">Categoría</div>
                                <div className="font-medium text-gray-900 text-sm">
                                  Filament
                                </div>
                              </div>
                              <div className="bg-white rounded p-2">
                                <div className="text-xs text-gray-500 mb-1">Unidad</div>
                                <div className="font-medium text-gray-900 text-sm">
                                  g
                                </div>
                              </div>
                            </div>

                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="text-xs text-gray-500 mb-1">Nota:</div>
                              <div className="text-sm text-gray-600 italic">
                                Esta pieza usa el sistema anterior de filamento único. Considera migrar al nuevo sistema multi-material para mayor flexibilidad.
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Resumen de la pieza */}
                      <div className="mt-4 bg-gray-100 rounded-lg p-4 border border-gray-200">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Palette className="w-4 h-4 text-gray-600" />
                            <span className="font-medium text-gray-700">Resumen de la pieza</span>
                          </div>
                          <div className="text-right">
                            <div className="text-lg font-bold text-gray-900">
                              {formatCurrency(pieceCost * piece.quantity)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {pieceWeight >= 1000 ? `${(pieceWeight / 1000).toFixed(1)}kg` : `${pieceWeight.toFixed(1)}g`} • {(piece.printHours * piece.quantity).toFixed(1)}h
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Resumen de costes */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm mb-8">
            <div className="px-6 py-4 border-b border-success-200 bg-success-50">
              <div className="flex items-center gap-3">
                <Euro className="w-5 h-5 text-success-600" />
                <h2 className="text-xl font-semibold text-success-900">Resumen de Costes</h2>
              </div>
              <p className="text-success-600 text-sm mt-1">Desglose detallado de todos los costes del proyecto</p>
            </div>
          
          <div className="p-6">
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-700">Coste de materiales:</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(totalFilamentCost)}</span>
              </div>
              
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-700">Coste de electricidad:</span>
                <span className="text-lg font-bold text-gray-900">{formatCurrency(totalElectricityCost)}</span>
              </div>
              
              {project.materials && project.materials.length > 0 && (
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-700">Materiales adicionales:</span>
                  <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(project.materials.reduce((sum, material) => sum + material.price, 0))}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-center py-4 bg-gray-50 rounded-lg px-4">
                <span className="text-lg font-bold text-gray-900">Coste total:</span>
                <span className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalFilamentCost + totalElectricityCost + (project.materials?.reduce((sum, material) => sum + material.price, 0) || 0))}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Materiales adicionales del proyecto */}
        {project.materials && project.materials.length > 0 && (
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="px-6 py-4 border-b border-warning-200 bg-warning-50">
              <div className="flex items-center gap-3">
                <Package className="w-5 h-5 text-warning-600" />
                <h2 className="text-xl font-semibold text-warning-900">Materiales Adicionales</h2>
              </div>
              <p className="text-warning-600 text-sm mt-1">Materiales extra del proyecto</p>
            </div>
            
            <div className="p-6">
              <div className="space-y-3">
                {project.materials.map((material, index) => (
                  <div key={index} className="flex justify-between items-center py-3 border-b border-gray-100 last:border-b-0">
                    <span className="text-gray-700">{material.name}</span>
                    <span className="text-lg font-bold text-gray-900">{formatCurrency(material.price)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProjectInfoView;