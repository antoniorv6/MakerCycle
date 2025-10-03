import React from 'react';
import { Calculator, Edit3, Upload, FileText } from 'lucide-react';
import type { ModeSelectionProps} from '@/types';

const ModeSelection: React.FC<ModeSelectionProps> = ({ onModeSelect }) => {
  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
          <Calculator className="w-8 h-8 text-slate-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Calculadora de Costes 3D</h1>
        <p className="text-slate-600">Calcula el coste total de tus proyectos de impresión 3D</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {/* Modo Manual */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-100 hover:shadow-xl transition-shadow duration-300">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Edit3 className="w-8 h-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Inserción Manual</h2>
            <p className="text-slate-600">Introduce manualmente los datos de tu proyecto de impresión</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm text-slate-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Control total sobre los datos</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Ideal para proyectos personalizados</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-600">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              <span>Múltiples piezas y configuraciones</span>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => onModeSelect('manual-entry')}
              className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
            >
              Crear Proyecto Manual
            </button>
          </div>
        </div>

        {/* Modo Importación */}
        <div className="bg-white rounded-xl shadow-lg p-8 border border-slate-100 hover:shadow-xl transition-shadow duration-300">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
              <Upload className="w-8 h-8 text-emerald-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Importar desde Archivo</h2>
            <p className="text-slate-600">Sube un archivo .gcode.3mf de OrcaSlicer para importar automáticamente</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center space-x-3 text-sm text-slate-600">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span>Importación automática de datos</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-600">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span>Extrae peso, tiempo y configuraciones</span>
            </div>
            <div className="flex items-center space-x-3 text-sm text-slate-600">
              <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
              <span>Múltiples placas como piezas separadas</span>
            </div>
          </div>

          <div className="mt-8">
            <button
              onClick={() => onModeSelect('file-import')}
              className="w-full px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors font-medium"
            >
              Importar desde Archivo
            </button>
          </div>
        </div>
      </div>

      {/* Información adicional */}
      <div className="mt-8 bg-blue-50 rounded-xl p-6 border border-blue-200 max-w-4xl mx-auto">
        <div className="flex items-start gap-3">
          <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Sobre la importación de archivos</h4>
            <p className="text-sm text-blue-700">
              Los archivos .gcode.3mf de OrcaSlicer contienen toda la información necesaria para el cálculo de costes. 
              El sistema extraerá automáticamente el peso del filamento, tiempo de impresión, altura de capa y otras configuraciones. 
              Cada placa del archivo se convertirá en una pieza separada del proyecto.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModeSelection;