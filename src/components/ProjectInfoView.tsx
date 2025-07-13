import React from 'react';
import { FileText, Info, Package, Weight, Clock, Euro, TrendingUp } from 'lucide-react';
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

const ProjectInfoView: React.FC<ProjectInfoViewProps> = ({ project, onEdit }) => {
  // Summary stats
  const totalPieces = project.pieces?.reduce((sum, piece) => sum + piece.quantity, 0) || 0;
  const uniquePieces = project.pieces?.length || 0;

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
          <FileText className="w-8 h-8 text-slate-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">{project.name}</h1>
        <div className="flex items-center justify-center gap-2">
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            project.status === 'draft'
              ? 'bg-slate-100 text-slate-700'
              : project.status === 'calculated'
              ? 'bg-slate-100 text-slate-700'
              : 'bg-emerald-100 text-emerald-700'
          }`}>{statusLabels[project.status]}</span>
          <span className="text-slate-500 text-sm">• Creado: {formatDate(project.createdAt)}</span>
        </div>
      </div>

      {/* Summary Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-lg p-6 border border-slate-200 flex items-center gap-4">
          <Package className="w-8 h-8 text-slate-600" />
          <div>
            <div className="text-2xl font-bold text-slate-900">{uniquePieces}</div>
            <div className="text-xs text-slate-600">Piezas únicas</div>
            <div className="text-xs text-slate-400">{totalPieces} unidades</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl shadow-lg p-6 border border-emerald-200 flex items-center gap-4">
          <Weight className="w-8 h-8 text-emerald-600" />
          <div>
            <div className="text-2xl font-bold text-emerald-900">{project.filamentWeight}g</div>
            <div className="text-xs text-emerald-600">Filamento total</div>
            <div className="text-xs text-emerald-400">Precio: {formatCurrency(project.filamentPrice)}</div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl shadow-lg p-6 border border-slate-200 flex items-center gap-4">
          <Euro className="w-8 h-8 text-slate-600" />
          <div>
            <div className="text-2xl font-bold text-slate-900">{formatCurrency(project.totalCost)}</div>
            <div className="text-xs text-slate-600">Coste total</div>
            <div className="text-xs text-slate-400">Recomendado: {formatCurrency(project.recommendedPrice)}</div>
          </div>
        </div>
      </div>

      {/* General Info Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center mb-4">
          <Info className="w-5 h-5 text-primary-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">General</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-medium text-gray-700">Nombre:</span> <span className="text-gray-900">{project.name}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Estado:</span> <span className="text-gray-900">{statusLabels[project.status]}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Creado:</span> <span className="text-gray-900">{formatDate(project.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Filament & Print Info Card */}
      <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl shadow-lg p-6 border border-green-200">
        <div className="flex items-center mb-4">
          <Weight className="w-5 h-5 text-green-600 mr-2" />
          <Clock className="w-5 h-5 text-orange-500 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Filamento y Impresión</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-medium text-gray-700">Filamento usado:</span> <span className="text-gray-900">{project.filamentWeight} g</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Precio filamento:</span> <span className="text-gray-900">{formatCurrency(project.filamentPrice)}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Horas de impresión:</span> <span className="text-gray-900">{project.printHours} h</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Coste electricidad:</span> <span className="text-gray-900">{formatCurrency(project.electricityCost)}</span>
          </div>
        </div>
      </div>

      {/* Pricing Info Card */}
      <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl shadow-lg p-6 border border-purple-200">
        <div className="flex items-center mb-4">
          <Euro className="w-5 h-5 text-purple-600 mr-2" />
          <TrendingUp className="w-5 h-5 text-purple-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Precios y Costes</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-medium text-gray-700">Coste total:</span> <span className="text-gray-900">{formatCurrency(project.totalCost)}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">IVA:</span> <span className="text-gray-900">{project.vatPercentage}%</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Margen beneficio:</span> <span className="text-gray-900">{project.profitMargin}%</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Precio recomendado:</span> <span className="text-gray-900 font-bold">{formatCurrency(project.recommendedPrice)}</span>
          </div>
        </div>
      </div>

      {/* Materials Info Card */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
        <div className="flex items-center mb-4">
          <Package className="w-5 h-5 text-blue-600 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Materiales Extra</h2>
        </div>
        {project.materials && project.materials.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Nombre</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Precio</th>
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
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <div className="flex items-center mb-4">
            <Package className="w-5 h-5 text-blue-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Piezas</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm border">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Nombre</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Filamento (g)</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Precio filamento</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Horas impresión</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Cantidad</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">Notas</th>
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

      {/* Edit Button */}
      <div className="mt-6 flex justify-end">
        <button
          className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium"
          onClick={onEdit}
        >
          Editar Proyecto
        </button>
      </div>
    </div>
  );
};

export default ProjectInfoView; 