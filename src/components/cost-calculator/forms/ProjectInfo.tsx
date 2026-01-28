import React from 'react';
import { RotateCcw, Save, Package, Droplet } from 'lucide-react';
import type { ProjectInfoProps } from '../types';

const ProjectInfo: React.FC<ProjectInfoProps> = ({ 
  projectName,
  projectType,
  onProjectNameChange,
  onProjectTypeChange,
  onReset, 
  onSave,
  isSaving = false
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-slate-900">Información del Proyecto</h2>
        <div className="flex space-x-2">
          <button
            onClick={onReset}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Limpiar</span>
          </button>
          <button
            onClick={onSave}
            disabled={isSaving}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200 text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Guardando...' : 'Guardar'}</span>
          </button>
        </div>
      </div>
      
      <div className="space-y-4">
        {/* Selector de tipo de proyecto */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Tipo de proyecto
          </label>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => onProjectTypeChange('filament')}
              disabled={isSaving}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                projectType === 'filament'
                  ? 'border-blue-500 bg-blue-50 text-blue-700 shadow-md'
                  : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Package className="w-5 h-5" />
              <span className="font-medium">Filamento</span>
            </button>
            <button
              type="button"
              onClick={() => onProjectTypeChange('resin')}
              disabled={isSaving}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-lg border-2 transition-all duration-200 ${
                projectType === 'resin'
                  ? 'border-purple-500 bg-purple-50 text-purple-700 shadow-md'
                  : 'border-slate-300 bg-white text-slate-600 hover:border-slate-400 hover:bg-slate-50'
              } disabled:opacity-50 disabled:cursor-not-allowed`}
            >
              <Droplet className="w-5 h-5" />
              <span className="font-medium">Resina</span>
            </button>
          </div>
          <p className="text-xs text-slate-500 mt-2">
            {projectType === 'filament' 
              ? 'Unidades: gramos (g) y kilogramos (kg)' 
              : 'Unidades: mililitros (ml) y litros (L)'}
          </p>
        </div>

        {/* Nombre del proyecto */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Nombre del proyecto
          </label>
          <input
            type="text"
            placeholder="Nombre del proyecto"
            value={projectName}
            onChange={(e) => onProjectNameChange(e.target.value)}
            className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent transition-all duration-200"
          />
        </div>
      </div>
    </div>
  );
};

export default ProjectInfo;