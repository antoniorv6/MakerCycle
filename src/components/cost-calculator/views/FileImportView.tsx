import React, { useState, useCallback, useEffect } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, ArrowLeft, Loader2, Save, Bookmark } from 'lucide-react';
import { PrintCostCalculator, type CostSummary } from '@/lib/from_3mf';
import { useMaterialPresets } from '@/hooks/useMaterialPresets';
import { SlicerLogoDisplay } from '../SlicerLogos';
import type { Piece, MaterialPreset } from '@/types';

interface FileImportViewProps {
  onBack: () => void;
  onImportComplete: (pieces: Piece[], projectName: string) => void;
}

interface DetectedFilamentProfile {
  profileName: string;
  filamentType: string;
  color?: string;
  costPerKg: number;
  weightG: number;
  willSave: boolean;
  platesCount: number; // Número de placas que usan este perfil
  alreadyExists: boolean; // Si ya existe en la biblioteca
}

const FileImportView: React.FC<FileImportViewProps> = ({ onBack, onImportComplete }) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSavingProfiles, setIsSavingProfiles] = useState(false);
  const [savingProgress, setSavingProgress] = useState<{ current: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importedData, setImportedData] = useState<CostSummary | null>(null);
  const [detectedProfiles, setDetectedProfiles] = useState<DetectedFilamentProfile[]>([]);
  const [fileSelected, setFileSelected] = useState(false);
  const [isLoadingProfiles, setIsLoadingProfiles] = useState(false);
  const [calculator] = useState(() => new PrintCostCalculator());
  const { addPreset, addPresetsBatch, presets, refreshPresets } = useMaterialPresets();

  // Cargar perfiles al montar el componente
  useEffect(() => {
    refreshPresets();
  }, [refreshPresets]);

  const handleFileSelect = useCallback(async (file: File) => {
    if (!file.name.toLowerCase().endsWith('.gcode.3mf')) {
      setError('Por favor, selecciona un archivo .gcode.3mf válido de OrcaSlicer o BambuStudio');
      return;
    }

    setIsProcessing(true);
    setError(null);
    setImportedData(null);
    setDetectedProfiles([]);
    setFileSelected(true);
    setIsLoadingProfiles(true);

    try {
      const result = await calculator.processFile(file);
      setImportedData(result);
      
      // Cargar perfiles de forma asíncrona sin bloquear la UI
      refreshPresets().then(() => {
        const currentPresets = presets;
        
        // Consolidar perfiles únicos (mismo nombre + mismo precio = mismo perfil)
        const uniqueProfilesMap = new Map<string, DetectedFilamentProfile>();
        const profilePlateCount = new Map<string, Set<number>>(); // Para contar placas únicas
        
        // Primero, procesar cada placa para contar cuántas placas usan cada perfil
        for (const plate of result.plates) {
          for (const filament of plate.filaments) {
            const key = `${filament.profileName}__${filament.costPerKg}`;
            
            if (!profilePlateCount.has(key)) {
              profilePlateCount.set(key, new Set());
            }
            profilePlateCount.get(key)!.add(plate.plateId);
          }
        }
        
        // Luego, consolidar los perfiles con el peso total y conteo de placas
        for (const filament of result.summary.filamentsUsed) {
          const key = `${filament.profileName}__${filament.costPerKg}`;
          
          if (!uniqueProfilesMap.has(key)) {
            // Verificar si ya existe un perfil con el mismo nombre y precio
            const existingPreset = currentPresets.find(p => {
              const nameMatch = p.name.trim().toLowerCase() === filament.profileName.trim().toLowerCase();
              const priceMatch = Math.abs(p.price_per_unit - filament.costPerKg) < 0.01; // Tolerancia para decimales
              const categoryMatch = p.category === 'filament';
              
              return nameMatch && priceMatch && categoryMatch;
            });
            
            uniqueProfilesMap.set(key, {
              profileName: filament.profileName,
              filamentType: filament.type,
              color: '#808080', // Default color since filament.color doesn't exist
              costPerKg: filament.costPerKg,
              weightG: 0, // Se sumará el peso total
              willSave: !existingPreset, // Solo seleccionar para guardar si no existe
              platesCount: profilePlateCount.get(key)?.size || 0,
              alreadyExists: !!existingPreset, // Marcar si ya existe
            });
          }
          
          // Sumar el peso total de este filamento
          const existingProfile = uniqueProfilesMap.get(key)!;
          existingProfile.weightG += filament.weightG;
        }
        
        const profiles = Array.from(uniqueProfilesMap.values());
        
        
        setDetectedProfiles(profiles);
        setIsLoadingProfiles(false);
      });
      
    } catch (err) {
      console.error('Error processing file:', err);
      setError('Error al procesar el archivo. Asegúrate de que es un archivo .gcode.3mf válido de OrcaSlicer o BambuStudio.');
      setIsLoadingProfiles(false);
    } finally {
      setIsProcessing(false);
    }
  }, [calculator, presets, refreshPresets]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  }, [handleFileSelect]);

  const handleProfileToggle = useCallback((index: number) => {
    setDetectedProfiles(prev => 
      prev.map((profile, i) => 
        i === index ? { ...profile, willSave: !profile.willSave } : profile
      )
    );
  }, []);

  const handleResetFile = useCallback(() => {
    setFileSelected(false);
    setImportedData(null);
    setDetectedProfiles([]);
    setError(null);
    setIsProcessing(false);
    setIsLoadingProfiles(false);
    // Resetear el input de archivo
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }, []);

  const handleConfirmImport = useCallback(async () => {
    if (!importedData) return;

    // Convertir las placas a piezas del proyecto con la nueva estructura de materiales
    const pieces: Piece[] = importedData.plates.map((plate, index) => {
      // Crear materiales para cada filamento de la placa
      const materials = plate.filaments.map((filament, materialIndex) => ({
        id: `imported-${plate.plateId}-material-${materialIndex}`,
        piece_id: `imported-${plate.plateId}`,
        material_preset_id: undefined,
        material_name: filament.profileName,
        material_type: filament.filamentType,
        weight: filament.weightG,
        price_per_kg: filament.costPerKg,
        unit: 'g',
        category: 'filament' as const,
        brand: filament.profileName.split(' ')[0] || 'Unknown',
        color: filament.color,
        notes: `Importado desde archivo .gcode.3mf - Placa ${plate.plateId}`,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }));

      // Calcular precio promedio para compatibilidad con campos legacy
      const avgFilamentPrice = plate.filaments.length > 0 
        ? plate.filaments.reduce((sum, f) => sum + f.costPerKg, 0) / plate.filaments.length
        : 25;

      return {
        id: `imported-${plate.plateId}`,
        name: `Pieza ${plate.plateId}`,
        filamentWeight: plate.totalFilamentWeightG, // Mantener para compatibilidad
        filamentPrice: avgFilamentPrice, // Mantener para compatibilidad
        printHours: plate.printTimeHours,
        quantity: 1,
        notes: plate.filaments.length > 1 
          ? `Múltiples filamentos: ${plate.filaments.map(f => f.filamentType).join(', ')}`
          : plate.filaments[0]?.filamentType ? `Tipo: ${plate.filaments[0].filamentType}` : undefined,
        materials: materials, // Nueva estructura de materiales
      };
    });

    // Extraer el nombre del proyecto del nombre del archivo
    const projectName = importedData.fileName.replace('.gcode.3mf', '');

    onImportComplete(pieces, projectName);
  }, [importedData, detectedProfiles, addPreset, onImportComplete]);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver
        </button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Importar desde Archivo</h1>
          <p className="text-slate-600">Sube un archivo .gcode.3mf de OrcaSlicer o BambuStudio para importar automáticamente</p>
        </div>
      </div>

      <div className="space-y-6">
        {/* Contenedor con transición slide */}
        <div className="relative overflow-hidden min-h-[400px]">
          {/* Zona de subida de archivos */}
          <div
            className={`absolute inset-0 transition-transform duration-500 ease-in-out ${
              fileSelected ? '-translate-x-full' : 'translate-x-0'
            }`}
          >
            <div
              className={`border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200 ${
                isDragOver
                  ? 'border-emerald-400 bg-emerald-50'
                  : 'border-slate-300 hover:border-slate-400'
              } ${isProcessing ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".gcode.3mf"
                onChange={handleFileInputChange}
                className="hidden"
                disabled={isProcessing}
              />

              {isProcessing ? (
                <div className="space-y-4">
                  <Loader2 className="w-16 h-16 text-emerald-600 mx-auto animate-spin" />
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">Procesando archivo...</h3>
                    <p className="text-slate-600">Extrayendo información del archivo .gcode.3mf</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full">
                    <Upload className="w-8 h-8 text-slate-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Arrastra y suelta tu archivo aquí
                    </h3>
                    <p className="text-slate-600 mb-4">
                      O haz clic para seleccionar un archivo .gcode.3mf
                    </p>
                    <div className="flex items-center justify-center gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <SlicerLogoDisplay slicer="OrcaSlicer" size={20} />
                        <span>OrcaSlicer</span>
                      </div>
                      <div className="text-slate-300">•</div>
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <SlicerLogoDisplay slicer="BambuStudio" size={20} />
                        <span>BambuStudio</span>
                      </div>
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-slate-600 text-white rounded-lg text-sm font-medium">
                      <FileText className="w-4 h-4" />
                      Seleccionar archivo
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Sección de información de importación */}
          <div
            className={`transition-transform duration-500 ease-in-out ${
              fileSelected ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Error message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-medium text-red-900 mb-1">Error al procesar el archivo</h4>
                    <p className="text-sm text-red-700">{error}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Preview de datos importados */}
            {importedData && (
              <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6">
                <div className="flex items-center gap-3 mb-6">
                  <CheckCircle className="w-6 h-6 text-emerald-600" />
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-slate-900">Archivo procesado correctamente</h3>
                    <p className="text-slate-600">Se encontraron {importedData.plates.length} placa(s) en el archivo</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-3 bg-slate-50 rounded-lg px-4 py-2 border border-slate-200">
                      <div className="text-sm text-slate-500">Slicer detectado:</div>
                      <div className="flex items-center gap-2">
                        <SlicerLogoDisplay slicer={importedData.slicer} size={32} />
                        <span className="text-sm font-semibold text-slate-700">{importedData.slicer}</span>
                      </div>
                    </div>
                    <button
                      onClick={handleResetFile}
                      className="px-4 py-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium text-sm"
                    >
                      Cambiar archivo
                    </button>
                  </div>
                </div>

                {/* Perfiles de filamentos detectados - Solo información */}
                {isLoadingProfiles ? (
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-900">Analizando perfiles de filamentos...</h4>
                </div>
                <div className="bg-slate-50 rounded-lg p-6 border border-slate-200">
                  <div className="flex items-center justify-center space-y-4">
                    <div className="text-center">
                      <Loader2 className="w-8 h-8 text-emerald-600 mx-auto animate-spin mb-3" />
                      <p className="text-slate-600 text-sm">
                        Detectando perfiles de filamentos y verificando biblioteca de materiales...
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : detectedProfiles.length > 0 ? (
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-slate-900">Perfiles de filamentos detectados:</h4>
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Bookmark className="w-4 h-4" />
                    <span>Información de los filamentos encontrados</span>
                  </div>
                </div>
                <div className="space-y-3">
                  {detectedProfiles.map((profile, index) => (
                    <div key={index} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h5 className="font-medium text-slate-900">{profile.profileName}</h5>
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {profile.filamentType}
                            </span>
                            {profile.color && (
                              <div className="flex items-center gap-1">
                                <div 
                                  className="w-3 h-3 rounded-full border border-gray-300" 
                                  style={{ backgroundColor: profile.color }}
                                  title={`Color: ${profile.color}`}
                                />
                                <span className="text-xs text-gray-600">{profile.color}</span>
                              </div>
                            )}
                            <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                              {profile.platesCount} placa{profile.platesCount > 1 ? 's' : ''}
                            </span>
                            {profile.alreadyExists && (
                              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                                Ya existe en biblioteca
                              </span>
                            )}
                          </div>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm text-slate-600">
                            <div>Peso total: {profile.weightG.toFixed(1)}g</div>
                            <div>Precio: {profile.costPerKg.toFixed(2)}€/kg</div>
                            <div>Coste total: {(profile.weightG * profile.costPerKg / 1000).toFixed(2)}€</div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                  <div className="flex items-start gap-3">
                    <Bookmark className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h5 className="font-medium text-blue-900 mb-1">¿Quieres guardar estos perfiles?</h5>
                      <p className="text-sm text-blue-700">
                        Puedes guardar estos perfiles de filamentos como presets desde la calculadora principal 
                        después de importar el proyecto. Esto te permitirá reutilizarlos en futuros proyectos.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Resumen de placas */}
            <div className="space-y-4 mb-6">
              <h4 className="font-medium text-slate-900">Resumen de placas encontradas:</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {importedData.plates.map((plate) => (
                  <div key={plate.plateId} className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <h5 className="font-medium text-slate-900">Placa {plate.plateId}</h5>
                      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                        {plate.filaments.length} filamento{plate.filaments.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-slate-600">
                      <div>Peso total: {plate.totalFilamentWeightG.toFixed(1)}g</div>
                      <div>Tiempo: {plate.printTimeHours.toFixed(1)}h</div>
                      {plate.layerHeight && <div>Altura capa: {plate.layerHeight}mm</div>}
                      {plate.nozzleDiameter && <div>Nozzle: {plate.nozzleDiameter}mm</div>}
                    </div>
                    {plate.filaments.length > 1 && (
                      <div className="mt-2 pt-2 border-t border-slate-200">
                        <div className="text-xs text-slate-500">Filamentos:</div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {plate.filaments.map((filament, idx) => (
                            <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                              {filament.filamentType}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

                {/* Totales */}
                <div className="bg-emerald-50 rounded-lg p-4 border border-emerald-200 mb-6">
                  <h4 className="font-medium text-emerald-900 mb-3">Totales del proyecto:</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <div className="text-emerald-700 font-medium">Peso total</div>
                      <div className="text-emerald-900 font-semibold">{importedData.summary.totalFilamentWeightKg.toFixed(2)}kg</div>
                    </div>
                    <div>
                      <div className="text-emerald-700 font-medium">Tiempo total</div>
                      <div className="text-emerald-900 font-semibold">{importedData.summary.totalPrintTimeHours.toFixed(1)}h</div>
                    </div>
                    <div>
                      <div className="text-emerald-700 font-medium">Coste material</div>
                      <div className="text-emerald-900 font-semibold">{importedData.summary.totalMaterialCost.toFixed(2)}€</div>
                    </div>
                    <div>
                      <div className="text-emerald-700 font-medium">Coste máquina</div>
                      <div className="text-emerald-900 font-semibold">{importedData.summary.totalMachineCost.toFixed(2)}€</div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-emerald-200">
                    <div className="flex justify-between items-center">
                      <span className="text-emerald-700 font-medium">Coste total:</span>
                      <span className="text-emerald-900 font-bold text-lg">{importedData.summary.totalCost.toFixed(2)}€</span>
                    </div>
                  </div>
                </div>

                {/* Botones de acción */}
                <div className="flex items-center justify-between">
                  <button
                    onClick={onBack}
                    className="px-6 py-3 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleConfirmImport}
                    disabled={isSavingProfiles}
                    className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSavingProfiles ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        {savingProgress ? (
                          <span>
                            Guardando perfiles... ({savingProgress.current}/{savingProgress.total})
                          </span>
                        ) : (
                          'Guardando perfiles...'
                        )}
                      </div>
                    ) : (
                      'Importar Proyecto'
                    )}
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>

        {/* Información adicional - Siempre visible */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Información sobre la importación</h4>
              <p className="text-sm text-blue-700 mb-2">
                El sistema extraerá automáticamente el peso del filamento, tiempo de impresión, altura de capa, 
                diámetro del nozzle y tipo de filamento de cada placa. Cada placa se convertirá en una pieza 
                separada del proyecto que podrás editar después de la importación.
              </p>
              <p className="text-sm text-blue-700 mb-2">
                <strong>Soporte:</strong> Compatible con archivos .gcode.3mf de OrcaSlicer y BambuStudio. 
                El sistema detectará automáticamente el slicer utilizado y mostrará el logo correspondiente.
              </p>
              <p className="text-sm text-blue-700">
                <strong>Nota:</strong> Los perfiles de filamentos detectados se mostrarán en la calculadora principal 
                donde podrás guardarlos como presets si lo deseas. Esto te permitirá reutilizarlos en futuros proyectos.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileImportView;
