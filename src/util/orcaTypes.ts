// Tipos para el análisis de archivos 3MF de OrcaSlicer

// Interfaz para los datos de una placa individual
export interface PlateData {
  plateId: string;
  plateName: string;
  filamentWeight: number;
  printHours: number;
  layerHeight: number;
  infill: number;
  models: string[];
}

// Interfaz para los datos completos del slicer
export interface SlicerData {
  plates: PlateData[];
  totalWeight: number;
  totalTime: number;
}

// Tipo para metadatos extraídos
export type ExtractedMetadata = Record<string, string>;

// Tipo para configuración de análisis
export interface AnalysisConfig {
  enableDebug?: boolean;
  defaultLayerHeight?: number;
  defaultInfill?: number;
}