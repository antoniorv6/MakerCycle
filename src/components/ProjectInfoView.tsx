import React, { useState } from 'react';
import { FileText, Info, Package, Weight, Clock, Euro, TrendingUp, Zap } from 'lucide-react';
import type { AppProject } from '@/types';

interface ProjectInfoViewProps {
  project: AppProject;
  onEdit: () => void;
}

const statusLabels: Record<string, string> = {
  draft: 'Borrador',
  calculated: 'Calculado',
  completed: 'Completado',
};
const formatCurrency = (value: number) => `€${value.toFixed(2)}`;
const formatDate = (date: string) => new Date(date).toLocaleString();

const getPieceElectricityCost = (piece: any, electricityCost: number) => {
  return piece.printHours * piece.quantity * 0.2 * electricityCost;
};

const badgeClass = 'inline-block px-2 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 mr-2';

const ProjectInfoView: React.FC<ProjectInfoViewProps> = ({ project, onEdit }) => {
  const [showDetails, setShowDetails] = useState(false);
  const totalPieces = project.pieces?.reduce((sum, piece) => sum + piece.quantity, 0) || 0;
  const uniquePieces = project.pieces?.length || 0;
  const totalFilamentCost = project.pieces?.reduce((sum, piece) => sum + ((piece.filamentWeight * piece.quantity * piece.filamentPrice) / 1000), 0) || 0;
  const totalElectricityCost = project.pieces?.reduce((sum, piece) => sum + getPieceElectricityCost(piece, project.electricityCost), 0) || 0;
  const totalMaterialsCost = project.materials?.reduce((sum, m) => sum + (m.price || 0), 0) || 0;
  const totalCost = totalFilamentCost + totalElectricityCost + totalMaterialsCost;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-10">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full mb-4 shadow-lg">
          <FileText className="w-10 h-10 text-blue-700" />
        </div>
        <h1 className="text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">{project.name}</h1>
        <div className="flex items-center justify-center gap-3 mt-2">
          <span className={badgeClass + ' border border-slate-200'}>{statusLabels[project.status]}</span>
          <span className="text-slate-400 text-xs">Creado: {formatDate(project.createdAt)}</span>
        </div>
      </div>

      {/* Summary Panel */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div className="bg-gradient-to-br from-slate-50 to-slate-200 rounded-2xl shadow-lg p-6 border border-slate-200 flex flex-col items-center gap-2 hover:shadow-xl transition-shadow">
          <Package className="w-10 h-10 text-blue-700 mb-2" />
          <div className="text-3xl font-extrabold text-blue-900">{uniquePieces}</div>
          <div className="text-sm text-blue-700 font-medium">Piezas únicas</div>
          <div className="text-xs text-blue-400">{totalPieces} unidades</div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-200 rounded-2xl shadow-lg p-6 border border-emerald-200 flex flex-col items-center gap-2 hover:shadow-xl transition-shadow">
          <Weight className="w-10 h-10 text-emerald-700 mb-2" />
          <div className="text-3xl font-extrabold text-emerald-900">{project.filamentWeight}g</div>
          <div className="text-sm text-emerald-700 font-medium">Filamento total</div>
          <div className="text-xs text-emerald-400">Precio: {formatCurrency(project.filamentPrice)}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-purple-200 rounded-2xl shadow-lg p-6 border border-purple-200 flex flex-col items-center gap-2 hover:shadow-xl transition-shadow">
          <Euro className="w-10 h-10 text-purple-700 mb-2" />
          <div className="text-3xl font-extrabold text-purple-900">{formatCurrency(totalFilamentCost)}</div>
          <div className="text-sm text-purple-700 font-medium">Coste filamento</div>
        </div>
        <div className="bg-gradient-to-br from-yellow-50 to-yellow-200 rounded-2xl shadow-lg p-6 border border-yellow-200 flex flex-col items-center gap-2 hover:shadow-xl transition-shadow">
          <Zap className="w-10 h-10 text-yellow-500 mb-2" />
          <div className="text-3xl font-extrabold text-yellow-700">{formatCurrency(totalElectricityCost)}</div>
          <div className="text-sm text-yellow-600 font-medium">Coste electricidad</div>
        </div>
        <div className="bg-gradient-to-br from-slate-50 to-slate-200 rounded-2xl shadow-lg p-6 border border-slate-200 flex flex-col items-center gap-2 hover:shadow-xl transition-shadow">
          <Euro className="w-10 h-10 text-slate-700 mb-2" />
          <div className="text-3xl font-extrabold text-slate-900">{formatCurrency(project.totalCost)}</div>
          <div className="text-sm text-slate-700 font-medium">Coste total</div>
          <div className="text-xs text-slate-400">Recomendado: {formatCurrency(project.recommendedPrice)}</div>
        </div>
      </div>

      {/* General Info Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-8">
        <div className="flex items-center mb-6">
          <Info className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Información General</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
          <div><span className="font-semibold text-gray-700">Nombre:</span> <span className="text-gray-900">{project.name}</span></div>
          <div><span className="font-semibold text-gray-700">Estado:</span> <span className="text-gray-900">{statusLabels[project.status]}</span></div>
          <div><span className="font-semibold text-gray-700">Creado:</span> <span className="text-gray-900">{formatDate(project.createdAt)}</span></div>
        </div>
      </div>

      {/* Filament & Print Info Card */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl shadow-lg p-8 border border-green-200 mb-8">
        <div className="flex items-center mb-6">
          <Weight className="w-6 h-6 text-green-600 mr-3" />
          <Clock className="w-6 h-6 text-orange-500 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Filamento y Impresión</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
          <div><span className="font-semibold text-gray-700">Filamento usado:</span> <span className="text-gray-900">{project.filamentWeight} g</span></div>
          <div><span className="font-semibold text-gray-700">Precio filamento:</span> <span className="text-gray-900">{formatCurrency(project.filamentPrice)}</span></div>
          <div><span className="font-semibold text-gray-700">Horas de impresión:</span> <span className="text-gray-900">{project.printHours} h</span></div>
          <div><span className="font-semibold text-gray-700">Coste electricidad:</span> <span className="text-gray-900">{formatCurrency(project.electricityCost)}</span></div>
        </div>
      </div>

      {/* Pricing Info Card */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl shadow-lg p-8 border border-purple-200 mb-8">
        <div className="flex items-center mb-6">
          <Euro className="w-6 h-6 text-purple-600 mr-3" />
          <TrendingUp className="w-6 h-6 text-purple-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Precios y Costes</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-base">
          <div><span className="font-semibold text-gray-700">Coste total:</span> <span className="text-gray-900">{formatCurrency(project.totalCost)}</span></div>
          <div><span className="font-semibold text-gray-700">IVA:</span> <span className="text-gray-900">{project.vatPercentage}%</span></div>
          <div><span className="font-semibold text-gray-700">Margen beneficio:</span> <span className="text-gray-900">{project.profitMargin}%</span></div>
          <div><span className="font-semibold text-gray-700">Precio recomendado:</span> <span className="text-gray-900 font-bold">{formatCurrency(project.recommendedPrice)}</span></div>
        </div>
      </div>

      {/* Materials Info Card */}
      <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-8">
        <div className="flex items-center mb-6">
          <Package className="w-6 h-6 text-blue-600 mr-3" />
          <h2 className="text-2xl font-bold text-gray-900">Materiales Extra</h2>
        </div>
        {project.materials && project.materials.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-base border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Nombre</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Precio</th>
                </tr>
              </thead>
              <tbody>
                {project.materials.map((mat) => (
                  <tr key={mat.id} className="border-t">
                    <td className="px-4 py-2">{mat.name}</td>
                    <td className="px-4 py-2">{formatCurrency(mat.price)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-gray-500">No hay materiales extra.</div>
        )}
      </div>

      {/* Pieces Info Card */}
      {project.pieces && project.pieces.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 mb-8">
          <div className="flex items-center mb-6">
            <Package className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Piezas</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-base border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Nombre</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Filamento (g)</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Precio filamento</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Horas impresión</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Cantidad</th>
                  <th className="px-4 py-2 text-left font-semibold text-gray-700">Notas</th>
                </tr>
              </thead>
              <tbody>
                {project.pieces.map((piece) => (
                  <tr key={piece.id} className="border-t">
                    <td className="px-4 py-2">{piece.name}</td>
                    <td className="px-4 py-2">{piece.filamentWeight}</td>
                    <td className="px-4 py-2">{formatCurrency(piece.filamentPrice)}</td>
                    <td className="px-4 py-2">{piece.printHours}</td>
                    <td className="px-4 py-2">{piece.quantity}</td>
                    <td className="px-4 py-2">{piece.notes || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Bloque de detalles avanzados */}
      <div className="mt-6 flex justify-end">
        <button
          className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium border border-slate-200 transition-colors"
          onClick={() => setShowDetails((v) => !v)}
          aria-expanded={showDetails}
        >
          {showDetails ? 'Ocultar detalles' : 'Mostrar más detalles'}
        </button>
      </div>
      {showDetails && (
        <div className="mt-8 bg-slate-50 border border-slate-200 rounded-2xl p-8">
          <h5 className="text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Info className="w-6 h-6 text-slate-400" /> Desglose avanzado de costes
          </h5>
          <ul className="space-y-6">
            {project.pieces?.map((piece, idx) => {
              const filamentCost = ((piece.filamentWeight * piece.quantity * piece.filamentPrice) / 1000);
              const electricity = getPieceElectricityCost(piece, project.electricityCost);
              return (
                <li key={piece.id} className="bg-white rounded-xl border border-slate-100 p-6 shadow-sm">
                  <div className="font-semibold text-slate-900 mb-2 text-lg">{idx + 1}. {piece.name}</div>
                  <div className="text-xs text-slate-500 mb-3">{piece.quantity} {piece.quantity === 1 ? 'unidad' : 'unidades'}{piece.notes && ` • ${piece.notes}`}</div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-base">
                    <div className="flex flex-col">
                      <span className="font-medium text-purple-700">Filamento</span>
                      <span>{piece.filamentWeight}g x {piece.quantity} x {piece.filamentPrice}€/kg / 1000 = <b>{filamentCost.toFixed(2)}€</b></span>
                    </div>
                    <div className="flex flex-col">
                      <span className="font-medium text-yellow-700">Electricidad</span>
                      <span>{piece.printHours}h x {piece.quantity} x 0.2kWh x {project.electricityCost}€/kWh = <b>{electricity.toFixed(2)}€</b></span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          {project.materials && project.materials.length > 0 && (
            <div className="mt-8">
              <h6 className="font-semibold text-slate-800 mb-3 text-lg">Materiales adicionales</h6>
              <ul className="list-disc list-inside text-base text-slate-700">
                {project.materials.map((mat) => (
                  <li key={mat.id}>{mat.name}: <b>{mat.price.toFixed(2)}€</b></li>
                ))}
              </ul>
            </div>
          )}
          <div className="mt-8 text-right text-slate-700 text-base">
            <b>Total filamento:</b> {formatCurrency(totalFilamentCost)} &nbsp;|&nbsp; <b>Total electricidad:</b> {formatCurrency(totalElectricityCost)} &nbsp;|&nbsp; <b>Total materiales:</b> {formatCurrency(totalMaterialsCost)} &nbsp;|&nbsp; <b>Total proyecto:</b> {formatCurrency(totalCost)}
          </div>
        </div>
      )}

      {/* Edit Button */}
      <div className="mt-10 flex justify-end">
        <button
          className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 transition-colors duration-200 font-semibold text-lg shadow-md"
          onClick={onEdit}
        >
          Editar Proyecto
        </button>
      </div>
    </div>
  );
};

export default ProjectInfoView; 