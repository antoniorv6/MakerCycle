import React from 'react';
import { CheckCircle, Edit3, Plus, Calculator, DollarSign, Clock, Package } from 'lucide-react';
import type { DatabaseProject, DatabasePiece } from '@/types';

interface ProjectSavedSummaryProps {
  project: DatabaseProject & { pieces?: DatabasePiece[] };
  onEdit: () => void;
  onNewProject: () => void;
}

const ProjectSavedSummary: React.FC<ProjectSavedSummaryProps> = ({ 
  project, 
  onEdit, 
  onNewProject 
}) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatTime = (hours: number) => {
    if (hours < 1) {
      return `${Math.round(hours * 60)} min`;
    }
    return `${hours.toFixed(1)}h`;
  };

  const totalPieces = project.pieces?.reduce((sum, piece) => sum + piece.quantity, 0) || 0;
  const totalPrintTime = project.pieces?.reduce((sum, piece) => sum + (piece.print_hours * piece.quantity), 0) || 0;

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Success Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">¡Proyecto Guardado!</h1>
        <p className="text-slate-600">Tu proyecto se ha guardado correctamente en la base de datos</p>
      </div>

      {/* Project Summary Card */}
      <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-slate-900">{project.name}</h2>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            project.status === 'calculated' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-blue-100 text-blue-800'
          }`}>
            {project.status === 'calculated' ? 'Calculado' : 'Borrador'}
          </span>
        </div>

        {/* Project Stats Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-slate-600" />
              <div>
                <p className="text-sm text-slate-600">Coste Total</p>
                <p className="text-xl font-semibold text-slate-900">
                  {formatCurrency(project.total_cost)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Package className="w-5 h-5 text-slate-600" />
              <div>
                <p className="text-sm text-slate-600">Piezas</p>
                <p className="text-xl font-semibold text-slate-900">{totalPieces}</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-slate-600" />
              <div>
                <p className="text-sm text-slate-600">Tiempo Total</p>
                <p className="text-xl font-semibold text-slate-900">
                  {formatTime(totalPrintTime)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <DollarSign className="w-5 h-5 text-slate-600" />
              <div>
                <p className="text-sm text-slate-600">Precio Recomendado</p>
                <p className="text-xl font-semibold text-slate-900">
                  {formatCurrency(project.recommended_price)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Pieces List */}
        {project.pieces && project.pieces.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-slate-900 mb-4">Piezas del Proyecto</h3>
            <div className="space-y-3">
              {project.pieces.map((piece, index) => (
                <div key={piece.id} className="flex items-center justify-between bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-8 h-8 bg-slate-200 rounded-full flex items-center justify-center text-sm font-medium text-slate-600">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">{piece.name}</p>
                      <p className="text-sm text-slate-600">
                        Cantidad: {piece.quantity} • Tiempo: {formatTime(piece.print_hours)}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-600">Peso filamento</p>
                    <p className="font-medium text-slate-900">
                      {(() => {
                        // Calcular peso del filamento igual que en ProjectInfoView y ProjectManager
                        if (piece.materials && piece.materials.length > 0) {
                          // Usar la nueva estructura de materiales
                          const pieceWeight = piece.materials.reduce((sum: number, material: any) => {
                            const weightInGrams = material.unit === 'kg' ? material.weight * 1000 : material.weight;
                            return sum + weightInGrams;
                          }, 0);
                          return `${pieceWeight.toFixed(1)}g`;
                        } else {
                          // Fallback a la estructura antigua para compatibilidad
                          return `${piece.filament_weight.toFixed(1)}g`;
                        }
                      })()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cost Breakdown */}
        <div className="bg-slate-50 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Desglose de Costes</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">Filamento:</span>
                <span className="font-medium">{formatCurrency(project.filament_price)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Electricidad:</span>
                <span className="font-medium">{formatCurrency(project.electricity_cost)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Materiales:</span>
                <span className="font-medium">
                  {formatCurrency(project.materials?.reduce((sum, mat) => sum + mat.price, 0) || 0)}
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-600">IVA ({project.vat_percentage}%):</span>
                <span className="font-medium">
                  {formatCurrency(project.total_cost * (project.vat_percentage / 100))}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-600">Margen ({project.profit_margin}%):</span>
                <span className="font-medium">
                  {formatCurrency(project.total_cost * (project.profit_margin / 100))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={onEdit}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-medium"
        >
          <Edit3 className="w-5 h-5" />
          <span>Editar Proyecto</span>
        </button>
        
        <button
          onClick={onNewProject}
          className="flex items-center justify-center space-x-2 px-6 py-3 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors duration-200 font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Añadir Nuevo Proyecto</span>
        </button>
      </div>
    </div>
  );
};

export default ProjectSavedSummary;
