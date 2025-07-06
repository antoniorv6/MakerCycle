import React from 'react';
import { Calculator, Edit3 } from 'lucide-react';
import type { ModeSelectionProps} from '@/types';

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
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Inserción Manual de Datos</h2>
          <p className="text-gray-600">Introduce manualmente los datos de tu proyecto de impresión</p>
        </div>

        <div className="text-center">
          <div 
            onClick={() => onModeSelect('manual-entry')}
            className="group cursor-pointer bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-8 border-2 border-green-200 hover:border-green-400 hover:shadow-lg transition-all duration-300 max-w-md mx-auto"
          >
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500 rounded-full mb-6 group-hover:scale-110 transition-transform duration-300">
                <Edit3 className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-semibold text-gray-900 mb-4">Inserción manual</h3>
              <p className="text-gray-700 text-lg mb-6">
                Introduce manualmente el peso del filamento, tiempo de impresión y otros costes
              </p>
              <button className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 font-semibold">
                Comenzar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeSelection;