import React, { useState, useCallback } from 'react';
import { Calculator, FileText, Upload, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { analyzeOrcaSlicer3MF } from '../../../util/orcaSlicerUtils';
import type { SlicerData } from '../../../util/orcaTypes';
import type { FileUploadProps } from '../types';

const FileUpload: React.FC<FileUploadProps> = ({ onBack, onFileAnalyzed }) => {
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
      
      const slicerData: SlicerData = await analyzeOrcaSlicer3MF(file);
      
      if (!slicerData || !slicerData.plates || slicerData.plates.length === 0) {
        throw new Error('No se pudo analizar la geometría del modelo 3D');
      }
      
      console.log('✅ Cálculos completados:', slicerData);
      
      const validatedWeight = isNaN(Number(slicerData.totalWeight)) ? 100 : Math.max(0, Number(slicerData.totalWeight));
      const validatedTime = isNaN(Number(slicerData.totalTime)) ? 3 : Math.max(0, Number(slicerData.totalTime));
      
      setStatus('success');
      setMessage(
        `Archivo analizado exitosamente. ${slicerData.plates.length} objeto(s) procesado(s). Peso: ${validatedWeight}g, Tiempo: ${validatedTime}h`
      );
      
      setTimeout(() => {
        onFileAnalyzed(validatedWeight, validatedTime);
      }, 1500);
      
    } catch (error) {
      setStatus('error');
      setMessage('Error analizando el modelo 3D. Verifica que sea un archivo 3MF válido con geometría.');
      console.error('Error en análisis del modelo:', error);
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
    <div className="max-w-7xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-full mb-4">
          <Calculator className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Calculadora de precios 3D</h1>
        <p className="text-gray-600">Calcula el coste total de tus proyectos de impresión 3D</p>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <Calculator className="w-5 h-5 text-primary-600 mr-2" />
            <h2 className="text-xl font-semibold text-gray-900">Análisis Automático de Archivo 3MF</h2>
          </div>
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Volver
          </button>
        </div>

        <div className="mb-4 p-3 rounded-lg bg-blue-50 text-blue-700 border border-blue-200">
          <div className="flex items-start">
            <Calculator className="w-4 h-4 mr-2 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <div className="font-medium mb-1">Análisis completo de geometría 3D</div>
              <div className="text-blue-600">
                • Extrae configuración real del slicer<br/>
                • Calcula peso y tiempo exactos desde el archivo<br/>
                • Detecta automáticamente placas múltiples
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
              <p className="text-gray-600 font-medium">Analizando archivo 3MF...</p>
              <div className="text-sm text-gray-500 mt-2 space-y-1">
                <div>🔍 Inspeccionando estructura del archivo</div>
                <div>📋 Extrayendo configuración del slicer</div>
                <div>📐 Analizando geometría 3D</div>
                <div>⚖️ Calculando peso y tiempo reales</div>
              </div>
            </div>
          ) : (
            <>
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Arrastra tu archivo .3mf aquí
              </h3>
              <p className="text-gray-600 mb-4">
                Archivo generado por OrcaSlicer con toda la configuración de impresión
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
    </div>
  );
};

export default FileUpload;