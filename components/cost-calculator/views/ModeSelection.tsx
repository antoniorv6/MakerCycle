import React from 'react';
import { Calculator, Upload, Edit3, AlertTriangle } from 'lucide-react';
import type { ModeSelectionProps} from '../types';

const ModeSelection: React.FC<ModeSelectionProps> = ({ onModeSelect }) => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-full mb-4">
          <Calculator className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Calculadora de Costes 3D</h1>
        <p className="text-gray-600">Calcula el coste total de tus proyectos de impresión 3D</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-100 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">¿Cómo quieres introducir los datos?</h2>
          <p className="text-gray-600">Elige el método que prefieras para calcular los costes de impresión</p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <div 
            onClick={() => onModeSelect('file-upload')}
            className="group cursor-pointer bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300 relative"
          >
            <div className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 shadow-lg">
              <AlertTriangle className="w-3 h-3" />
              BETA
            </div>
            
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-500 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                <Upload className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Subir archivo 3MF</h3>
              <p className="text-gray-700 text-sm mb-4">
                Analiza automáticamente tu archivo de OrcaSlicer para obtener datos precisos
              </p>
              <div className="text-xs text-orange-700 bg-orange-100 rounded-lg px-3 py-2 mb-3 border border-orange-200">
                <div className="flex items-center gap-1 mb-1">
                  <AlertTriangle className="w-3 h-3" />
                  <span className="font-semibold">Función experimental</span>
                </div>
                <span className="text-orange-600">Puede contener errores. Usa con precaución.</span>
              </div>
            </div>
          </div>

          <div 
            onClick={() => onModeSelect('manual-entry')}
            className="group cursor-pointer bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-300"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 bg-green-500 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                <Edit3 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Inserción manual</h3>
              <p className="text-gray-700 text-sm mb-4">
                Introduce manualmente el peso del filamento y tiempo de impresión
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeSelection;