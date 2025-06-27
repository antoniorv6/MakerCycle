import React from 'react';
import type { ProjectInfoPanelProps } from '../types';

const ProjectInfoPanel: React.FC<ProjectInfoPanelProps> = ({ 
  filamentWeight, 
  printHours, 
  materials 
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Información del Proyecto</h3>
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="font-medium text-gray-700">Filamento usado</div>
          <div className="text-gray-900 font-semibold">{filamentWeight}g</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="font-medium text-gray-700">Tiempo impresión</div>
          <div className="text-gray-900 font-semibold">{printHours}h</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="font-medium text-gray-700">Consumo estimado</div>
          <div className="text-gray-900 font-semibold">{(printHours * 0.2).toFixed(2)} kWh</div>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <div className="font-medium text-gray-700">Materiales extra</div>
          <div className="text-gray-900 font-semibold">{materials.length}</div>
        </div>
      </div>
    </div>
  );
};

export default ProjectInfoPanel;