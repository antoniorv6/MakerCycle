import React from 'react';
import { RotateCcw, Save } from 'lucide-react';
import type { ProjectInfoProps } from '../types';

const ProjectInfo: React.FC<ProjectInfoProps> = ({ 
  projectName, 
  onProjectNameChange, 
  onReset, 
  onSave 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold text-gray-900">Información del Proyecto</h2>
        <div className="flex space-x-2">
          <button
            onClick={onReset}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors duration-200 text-sm font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Limpiar</span>
          </button>
          <button
            onClick={onSave}
            className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium"
          >
            <Save className="w-4 h-4" />
            <span>Guardar</span>
          </button>
        </div>
      </div>
      <input
        type="text"
        placeholder="Nombre del proyecto"
        value={projectName}
        onChange={(e) => onProjectNameChange(e.target.value)}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all duration-200"
      />
    </div>
  );
};

export default ProjectInfo;