import React from 'react';
import { FileText } from 'lucide-react';
import type { MaterialsSectionProps } from '../types';

const MaterialsSection: React.FC<MaterialsSectionProps> = ({
  materials,
  onAddMaterial,
  onUpdateMaterial,
  onRemoveMaterial
}) => {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileText className="w-5 h-5 text-green-500 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Materiales Adicionales</h2>
        </div>
        <button
          onClick={onAddMaterial}
          className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 text-sm font-medium"
        >
          Añadir
        </button>
      </div>
      <div className="space-y-3">
        {materials.map((material) => (
          <div key={material.id} className="flex gap-3 items-center">
            <input
              type="text"
              placeholder="Nombre del material"
              value={material.name}
              onChange={(e) => onUpdateMaterial(material.id, 'name', e.target.value)}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
            <input
              type="number"
              placeholder="Precio (€)"
              value={material.price?.toString() || ''}
              onChange={(e) => {
                const value = e.target.value;
                // Allow any input while typing
                if (value !== '' && value !== '-' && value !== '.') {
                  const numValue = parseFloat(value);
                  if (!isNaN(numValue)) {
                    onUpdateMaterial(material.id, 'price', numValue);
                  }
                }
              }}
              onBlur={(e) => {
                const value = e.target.value;
                if (value === '' || value === '-' || value === '.') {
                  onUpdateMaterial(material.id, 'price', 0);
                } else {
                  const numValue = parseFloat(value);
                  if (!isNaN(numValue)) {
                    onUpdateMaterial(material.id, 'price', numValue);
                  } else {
                    onUpdateMaterial(material.id, 'price', 0);
                  }
                }
              }}
              className="w-32 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              min="0"
              step="0.01"
            />
            <button
              onClick={() => onRemoveMaterial(material.id)}
              className="px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm"
            >
              ✕
            </button>
          </div>
        ))}
        {materials.length === 0 && (
          <p className="text-gray-500 text-sm">No hay materiales adicionales añadidos</p>
        )}
      </div>
    </div>
  );
};

export default MaterialsSection;