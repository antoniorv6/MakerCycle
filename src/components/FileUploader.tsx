import React, { useCallback, useState } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, Calculator } from 'lucide-react';
import { analyzeOrcaSlicer3MF } from '../util/orcaSlicerUtils';
import type { SlicerData } from '../util/orcaTypes';

interface FileUploaderProps {
  onFileAnalyzed: (data: {
    filamentWeight: number;
    printHours: number;
    layerHeight: number;
    infill: number;
  }) => void;
}

export default function FileUploader({ onFileAnalyzed }: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const analyze3MFFile = async (file: File) => {
    try {
      setIsProcessing(true);
      setStatus('idle');
      setMessage('');
      
      console.log('🚀 Iniciando análisis y cálculo completo:', file.name);
      
      // Analizar geometría y calcular datos de impresión
      const slicerData: SlicerData = await analyzeOrcaSlicer3MF(file);
      
      // Validar que obtuvimos datos válidos
      if (!slicerData || !slicerData.plates || slicerData.plates.length === 0) {
        throw new Error('No se pudo analizar la geometría del modelo 3D');
      }
      
      console.log('✅ Cálculos completados:', slicerData);
      
      // Convertir SlicerData al formato que espera el componente padre
      const simplifiedData = {
        filamentWeight: Number(slicerData.totalWeight) || 0,
        printHours: Number(slicerData.totalTime) || 0,
        layerHeight: Number(slicerData.plates[0]?.layerHeight) || 0.2,
        infill: Number(slicerData.plates[0]?.infill) || 20
      };
      
      // Validar que todos los valores son números válidos
      const validatedData = {
        filamentWeight: isNaN(simplifiedData.filamentWeight) ? 0 : Math.max(0, simplifiedData.filamentWeight),
        printHours: isNaN(simplifiedData.printHours) ? 0 : Math.max(0, simplifiedData.printHours),
        layerHeight: isNaN(simplifiedData.layerHeight) ? 0.2 : Math.max(0.1, simplifiedData.layerHeight),
        infill: isNaN(simplifiedData.infill) ? 20 : Math.max(0, Math.min(100, simplifiedData.infill))
      };
      
      console.log('📤 Enviando datos validados:', validatedData);
      onFileAnalyzed(validatedData);
      
      setStatus('success');
      setMessage(
        `Modelo analizado y calculado. ${slicerData.plates.length} objeto(s) procesado(s). Total: ${slicerData.totalWeight}g, ${slicerData.totalTime}h`
      );
      
    } catch (error) {
      setStatus('error');
      setMessage('Error analizando el modelo 3D. Verifica que sea un archivo 3MF válido con geometría.');
      console.error('Error en análisis/cálculo del modelo:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    const file3MF = files.find(file => file.name.toLowerCase().endsWith('.3mf'));
    
    if (file3MF) {
      analyze3MFFile(file3MF);
    } else {
      setStatus('error');
      setMessage('Por favor, sube un archivo .3mf válido');
    }
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.name.toLowerCase().endsWith('.3mf')) {
      analyze3MFFile(file);
    } else {
      setStatus('error');
      setMessage('Por favor, selecciona un archivo .3mf válido');
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center mb-4">
        <Calculator className="w-5 h-5 text-primary-600 mr-2" />
        <h2 className="text-xl font-semibold text-gray-900">Calculadora de Slicing 3D</h2>
      </div>

      {/* Información del sistema */}
      <div className="mb-4 p-3 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
        <div className="flex items-start">
          <Calculator className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <div className="font-medium mb-1">Análisis completo de geometría 3D</div>
            <div className="text-blue-600">
              • Calcula volumen y área superficial desde la malla de triángulos<br/>
              • Simula slicing real con configuración extraída del archivo<br/>
              • Determina peso exacto y tiempo de impresión por objeto
            </div>
          </div>
        </div>
      </div>
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200 ${
          isDragging
            ? 'border-primary-400 bg-primary-50'
            : 'border-gray-300 hover:border-primary-400 hover:bg-gray-50'
        }`}
      >
        {isProcessing ? (
          <div className="flex flex-col items-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
            <p className="text-gray-600 font-medium">Analizando geometría 3D...</p>
            <div className="text-sm text-gray-500 mt-2 space-y-1">
              <div>🔍 Extrayendo malla de triángulos</div>
              <div>📐 Calculando volumen y área superficial</div>
              <div>🧮 Simulando proceso de slicing</div>
              <div>⚖️ Determinando peso y tiempo exactos</div>
            </div>
          </div>
        ) : (
          <>
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Arrastra tu archivo .3mf aquí
            </h3>
            <p className="text-gray-600 mb-4">
              Se analizará la geometría 3D y calculará automáticamente peso, tiempo y costes de impresión
            </p>
            <input
              type="file"
              accept=".3mf"
              onChange={handleFileSelect}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 cursor-pointer"
            >
              <Upload className="w-4 h-4 mr-2" />
              Seleccionar archivo 3MF
            </label>
          </>
        )}
      </div>

      {status !== 'idle' && (
        <div className={`mt-4 p-4 rounded-lg flex items-center ${
          status === 'success' 
            ? 'bg-green-50 text-green-700 border border-green-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
          {status === 'success' ? (
            <CheckCircle className="w-5 h-5 mr-2" />
          ) : (
            <AlertCircle className="w-5 h-5 mr-2" />
          )}
          <span className="text-sm">{message}</span>
        </div>
      )}
    </div>
  );
}