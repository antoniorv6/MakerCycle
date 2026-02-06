/**
 * Calculadora de costes de impresión 3D para archivos .gcode.3mf, .gcode y .bgcode
 * Compatible con OrcaSlicer, BambuStudio, Creality Print, AnycubicSlicerNext y PrusaSlicer
 * Librería TypeScript para NextJS
 */

// ============================================================================
// TIPOS
// ============================================================================

export type SlicerType = 'OrcaSlicer' | 'BambuStudio' | 'CrealityPrint' | 'AnycubicSlicerNext' | 'PrusaSlicer' | 'Unknown';

export interface FilamentInfo {
  filamentId: number;
  profileName: string;
  filamentType: string;
  weightG: number;
  weightKg: number;
  costPerKg: number;
  cost: number;
  color?: string;
}

export interface PlateInfo {
  plateId: number;
  filaments: FilamentInfo[];
  totalFilamentWeightG: number;
  totalFilamentWeightKg: number;
  printTimeMin: number;
  printTimeHours: number;
  materialCost: number;
  machineCost: number;
  totalCost: number;
  layerHeight?: number;
  nozzleDiameter?: number;
}

export interface ParseResult {
  fileName: string;
  slicer: SlicerType;
  plates: PlateInfo[];
}

export interface ParseResultWithContent extends ParseResult {
  /** Contenido gcode raw por placa (plateId -> gcode string) */
  gcodeContents: Map<number, string>;
}

export interface CostSummary {
  fileName: string;
  slicer: SlicerType;
  calculationConfig: {
    costPerHour: number;
    defaultFilamentCost: number;
  };
  plates: PlateInfo[];
  summary: {
    totalFilamentWeightKg: number;
    totalPrintTimeHours: number;
    totalMaterialCost: number;
    totalMachineCost: number;
    totalCost: number;
    filamentsUsed: Array<{
      profileName: string;
      type: string;
      weightG: number;
      weightKg: number;
      costPerKg: number;
      cost: number;
    }>;
  };
}

export interface CalculatorConfig {
  costPerHour?: number;
  defaultFilamentCost?: number;
}

// ============================================================================
// CLASE PRINCIPAL
// ============================================================================

export class PrintCostCalculator {
  private costPerHour: number;
  private defaultFilamentCost: number;
  private slicerType: SlicerType = 'Unknown';

  constructor(config: CalculatorConfig = {}) {
    this.costPerHour = config.costPerHour ?? 0.1;
    this.defaultFilamentCost = config.defaultFilamentCost ?? 20.0;
  }

  /**
   * Parsea un archivo .gcode.3mf de OrcaSlicer, BambuStudio, Creality Print
   * o un archivo .gcode de AnycubicSlicerNext
   * o un archivo .bgcode de PrusaSlicer
   */
  async parseFile(file: File | Blob): Promise<ParseResult> {
    const fileName = file instanceof File ? file.name : 'unknown';
    
    // Si es un archivo .bgcode de PrusaSlicer (binario comprimido)
    if (fileName.toLowerCase().endsWith('.bgcode')) {
      const buffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      // Leer los primeros 2000 bytes como texto para extraer metadatos
      let textContent = '';
      for (let i = 0; i < Math.min(2000, uint8Array.length); i++) {
        const char = String.fromCharCode(uint8Array[i]);
        if (char >= ' ' && char <= '~') {
          textContent += char;
        } else if (char === '\n' || char === '\r') {
          textContent += '\n';
        }
      }
      const plateInfo = this.extractFromGcode(textContent, fileName);
      return {
        fileName,
        slicer: this.slicerType,
        plates: plateInfo ? [plateInfo] : [],
      };
    }
    
    // Si es un archivo .gcode directo (AnycubicSlicerNext)
    if (fileName.toLowerCase().endsWith('.gcode')) {
      const content = await file.text();
      const plateInfo = this.extractFromGcode(content, fileName);
      return {
        fileName,
        slicer: this.slicerType,
        plates: plateInfo ? [plateInfo] : [],
      };
    }
    
    // Si es un archivo .gcode.3mf (OrcaSlicer, BambuStudio, Creality Print)
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(file);

    const plates: PlateInfo[] = [];

    const gcodeFiles = Object.keys(zip.files).filter(
      (name) => name.endsWith('.gcode') && name.includes('plate_')
    );

    if (gcodeFiles.length > 0) {
      for (const gcodeFile of gcodeFiles.sort()) {
        const content = await zip.files[gcodeFile].async('string');
        const plateInfo = this.extractFromGcode(content, gcodeFile);
        if (plateInfo) {
          plates.push(plateInfo);
        }
      }
    }

    return {
      fileName,
      slicer: this.slicerType,
      plates,
    };
  }

  /**
   * Parsea un archivo y retorna tanto los metadatos como el contenido gcode raw por placa.
   * Util para la previsualizacion 3D donde se necesita acceso al gcode completo.
   */
  async parseFileWithContent(file: File | Blob): Promise<ParseResultWithContent> {
    const fileName = file instanceof File ? file.name : 'unknown';
    const gcodeContents = new Map<number, string>();

    // .bgcode: formato binario, no se puede parsear para 3D
    if (fileName.toLowerCase().endsWith('.bgcode')) {
      const buffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(buffer);
      let textContent = '';
      for (let i = 0; i < Math.min(2000, uint8Array.length); i++) {
        const char = String.fromCharCode(uint8Array[i]);
        if (char >= ' ' && char <= '~') {
          textContent += char;
        } else if (char === '\n' || char === '\r') {
          textContent += '\n';
        }
      }
      const plateInfo = this.extractFromGcode(textContent, fileName);
      // No se puede extraer gcode parseable de .bgcode
      return {
        fileName,
        slicer: this.slicerType,
        plates: plateInfo ? [plateInfo] : [],
        gcodeContents,
      };
    }

    // .gcode directo
    if (fileName.toLowerCase().endsWith('.gcode')) {
      const content = await file.text();
      const plateInfo = this.extractFromGcode(content, fileName);
      if (plateInfo) {
        gcodeContents.set(plateInfo.plateId, content);
      }
      return {
        fileName,
        slicer: this.slicerType,
        plates: plateInfo ? [plateInfo] : [],
        gcodeContents,
      };
    }

    // .gcode.3mf
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(file);
    const plates: PlateInfo[] = [];

    const gcodeFiles = Object.keys(zip.files).filter(
      (name) => name.endsWith('.gcode') && name.includes('plate_')
    );

    if (gcodeFiles.length > 0) {
      for (const gcodeFile of gcodeFiles.sort()) {
        const content = await zip.files[gcodeFile].async('string');
        const plateInfo = this.extractFromGcode(content, gcodeFile);
        if (plateInfo) {
          plates.push(plateInfo);
          gcodeContents.set(plateInfo.plateId, content);
        }
      }
    }

    return {
      fileName,
      slicer: this.slicerType,
      plates,
      gcodeContents,
    };
  }

  /**
   * Parsea directamente desde contenido G-code
   */
  parseGcodeContent(gcodeContent: string, fileName: string = 'plate_1.gcode'): PlateInfo | null {
    return this.extractFromGcode(gcodeContent, fileName);
  }

  /**
   * Detecta qué slicer generó el archivo
   */
  private detectSlicer(gcodeContent: string): SlicerType {
    // Patrones para PrusaSlicer
    const prusaPatterns = [
      /Producer=PrusaSlicer/i,
      /;\s*generated by PrusaSlicer/i,
      /PrusaSlicer\s+[\d.]+/i,
    ];
    
    // Patrones para AnycubicSlicerNext
    const anycubicPatterns = [
      /;\s*generated by AnycubicSlicerNext/i,
      /;\s*app_full_name\s*=\s*AnycubicSlicerNext/i,
      /;\s*AnycubicSlicer_config\s*=/i,
    ];
    
    // Patrones para Creality Print (debe ir primero porque puede contener "Creality" en otros contextos)
    const crealityPatterns = [
      /;\s*creality_flush_time\s*=/i,
      /;\s*printer_model\s*=\s*Creality/i,
      /;\s*printer_settings_id\s*=\s*.*Creality/i,
      /;\s*Creality\s+Print/i,
      /;\s*generated by Creality Print/i,
    ];
    
    // Patrones para BambuStudio
    const bambuPatterns = [
      /;\s*BambuStudio\s+[\d.]+/i,
      /;\s*BambuStudio/i,
      /;\s*generated by BambuStudio/i,
      /;\s*Bambu Studio/i,
      /;\s*Bambu/i
    ];
    
    // Patrones para OrcaSlicer
    const orcaPatterns = [
      /;\s*generated by OrcaSlicer/i,
      /;\s*OrcaSlicer\s+[\d.]+/i,
      /;\s*OrcaSlicer/i,
      /;\s*Orca Slicer/i,
      /;\s*Orca/i
    ];
    
    // Buscar patrones de PrusaSlicer
    for (const pattern of prusaPatterns) {
      if (pattern.test(gcodeContent)) {
        return 'PrusaSlicer';
      }
    }
    
    // Buscar patrones de AnycubicSlicerNext
    for (const pattern of anycubicPatterns) {
      if (pattern.test(gcodeContent)) {
        return 'AnycubicSlicerNext';
      }
    }
    
    // Buscar patrones de Creality Print
    for (const pattern of crealityPatterns) {
      if (pattern.test(gcodeContent)) {
        return 'CrealityPrint';
      }
    }
    
    // Buscar patrones de BambuStudio
    for (const pattern of bambuPatterns) {
      if (pattern.test(gcodeContent)) {
        return 'BambuStudio';
      }
    }
    
    // Buscar patrones de OrcaSlicer
    for (const pattern of orcaPatterns) {
      if (pattern.test(gcodeContent)) {
        return 'OrcaSlicer';
      }
    }
    
    return 'Unknown';
  }

  /**
   * Extrae información del G-code
   */
  private extractFromGcode(gcodeContent: string, fileName: string): PlateInfo | null {
    this.slicerType = this.detectSlicer(gcodeContent);
    
    const plateMatch = fileName.match(/plate[_\s(]*(\d+)/i) || fileName.match(/(\d+)/);
    const plateId = plateMatch ? parseInt(plateMatch[1]) : 1;

    if (this.slicerType === 'BambuStudio') {
      return this.extractBambuStudio(gcodeContent, plateId);
    } else if (this.slicerType === 'CrealityPrint') {
      return this.extractCrealityPrint(gcodeContent, plateId);
    } else if (this.slicerType === 'AnycubicSlicerNext') {
      return this.extractAnycubicSlicerNext(gcodeContent, plateId);
    } else if (this.slicerType === 'PrusaSlicer') {
      return this.extractPrusaSlicer(gcodeContent, plateId);
    } else {
      return this.extractOrcaSlicer(gcodeContent, plateId);
    }
  }

  /**
   * Extrae información de BambuStudio
   */
  private extractBambuStudio(gcodeContent: string, plateId: number): PlateInfo | null {
    // BambuStudio: ; filament: 1 (slot del AMS usado, base 1)
    const filamentSlotMatch = gcodeContent.match(/;\s*filament:\s*(\d+)/i);
    const filamentSlot = filamentSlotMatch ? parseInt(filamentSlotMatch[1]) : 1;

    // Peso total: ; total filament weight [g] : 12.75
    const totalWeightMatch = gcodeContent.match(/;\s*total filament weight \[g\]\s*:\s*(\d+\.?\d*)/i);
    const filamentWeight = totalWeightMatch ? parseFloat(totalWeightMatch[1]) : null;

    if (!filamentWeight) return null;

    // Nombres de perfiles
    const filamentNamesMatch = gcodeContent.match(/;\s*filament_settings_id\s*=\s*([^\n]+)/i);
    let filamentNames: string[] = [];
    if (filamentNamesMatch) {
      filamentNames = filamentNamesMatch[1].split(';').map(n => n.trim().replace(/^"|"$/g, ''));
    }

    // Tipos de filamento
    const filamentTypesMatch = gcodeContent.match(/;\s*filament_type\s*=\s*([^\n]+)/i);
    let filamentTypes: string[] = [];
    if (filamentTypesMatch) {
      filamentTypes = filamentTypesMatch[1].split(';').map(t => t.trim());
    }

    // Costes
    const filamentCostsMatch = gcodeContent.match(/;\s*filament_cost\s*=\s*([\d.,;\s]+?)(?:\n|$)/i);
    let filamentCosts: number[] = [];
    if (filamentCostsMatch) {
      const costsStr = filamentCostsMatch[1].trim();
      const separator = costsStr.includes(';') ? ';' : ',';
      filamentCosts = costsStr.split(separator)
        .map(c => c.trim())
        .filter(c => c !== '' && c !== ';')
        .map(c => parseFloat(c))
        .filter(c => !isNaN(c));
    }

    // Colores de filamento
    const filamentColorsMatch = gcodeContent.match(/;\s*filament_colour\s*=\s*([^\n]+)/i);
    let filamentColors: string[] = [];
    if (filamentColorsMatch) {
      filamentColors = filamentColorsMatch[1].split(';').map(c => c.trim().replace(/^"|"$/g, ''));
    }

    const printTimeMin = this.extractPrintTime(gcodeContent);
    if (!printTimeMin) return null;

    // BambuStudio usa un solo slot del AMS (índice base-1)
    const slotIndex = filamentSlot - 1;
    const profileName = filamentNames[slotIndex] || `Filamento ${filamentSlot}`;
    const filamentType = filamentTypes[slotIndex] || '';
    const costPerKg = filamentCosts[slotIndex] || this.defaultFilamentCost;
    const color = filamentColors[slotIndex] || undefined;

    const filament: FilamentInfo = {
      filamentId: filamentSlot,
      profileName,
      filamentType,
      weightG: filamentWeight,
      weightKg: Math.round((filamentWeight / 1000) * 1000) / 1000,
      costPerKg,
      cost: Math.round((filamentWeight / 1000) * costPerKg * 100) / 100,
      color,
    };

    const printHours = printTimeMin / 60;
    const materialCost = filament.cost;
    const machineCost = printHours * this.costPerHour;

    const layerHeightMatch = gcodeContent.match(/;\s*layer_height\s*=\s*(\d+\.?\d*)/i);
    const nozzleDiameterMatch = gcodeContent.match(/;\s*nozzle_diameter\s*=\s*(\d+\.?\d*)/i);

    const plateInfo: PlateInfo = {
      plateId,
      filaments: [filament],
      totalFilamentWeightG: filamentWeight,
      totalFilamentWeightKg: Math.round((filamentWeight / 1000) * 1000) / 1000,
      printTimeMin: Math.round(printTimeMin),
      printTimeHours: Math.round(printHours * 100) / 100,
      materialCost: Math.round(materialCost * 100) / 100,
      machineCost: Math.round(machineCost * 100) / 100,
      totalCost: Math.round((materialCost + machineCost) * 100) / 100,
    };

    if (layerHeightMatch) plateInfo.layerHeight = parseFloat(layerHeightMatch[1]);
    if (nozzleDiameterMatch) plateInfo.nozzleDiameter = parseFloat(nozzleDiameterMatch[1]);

    return plateInfo;
  }

  /**
   * Extrae información de OrcaSlicer
   */
  private extractOrcaSlicer(gcodeContent: string, plateId: number): PlateInfo | null {
    // OrcaSlicer: ; filament used [g] = 10.08, 0.0, 0.0, 0.0
    const filamentWeightsMatch = gcodeContent.match(/;\s*filament used \[g\]\s*=\s*([\d.,\s]+)/i);
    let filamentWeights: number[] = [];
    
    if (filamentWeightsMatch) {
      filamentWeights = filamentWeightsMatch[1]
        .split(',')
        .map(w => parseFloat(w.trim()))
        .filter(w => !isNaN(w));
    }

    if (filamentWeights.length === 0) return null;

    // Nombres de perfiles
    const filamentNamesMatch = gcodeContent.match(/;\s*filament_settings_id\s*=\s*([^\n]+)/i);
    let filamentNames: string[] = [];
    if (filamentNamesMatch) {
      filamentNames = filamentNamesMatch[1].split(';').map(n => n.trim().replace(/^"|"$/g, ''));
    }

    // Tipos
    const filamentTypesMatch = gcodeContent.match(/;\s*filament_type\s*=\s*([^\n]+)/i);
    let filamentTypes: string[] = [];
    if (filamentTypesMatch) {
      filamentTypes = filamentTypesMatch[1].split(';').map(t => t.trim());
    }

    // Costes
    const filamentCostsMatch = gcodeContent.match(/;\s*filament_cost\s*=\s*([\d.,;\s]+?)(?:\n|$)/i);
    let filamentCosts: number[] = [];
    if (filamentCostsMatch) {
      const costsStr = filamentCostsMatch[1].trim();
      const separator = costsStr.includes(';') ? ';' : ',';
      filamentCosts = costsStr.split(separator)
        .map(c => c.trim())
        .filter(c => c !== '' && c !== ';')
        .map(c => parseFloat(c))
        .filter(c => !isNaN(c));
    }

    if (filamentCosts.length === 0) {
      filamentCosts = Array(filamentWeights.length).fill(this.defaultFilamentCost);
    }

    // Colores de filamento
    const filamentColorsMatch = gcodeContent.match(/;\s*filament_colour\s*=\s*([^\n]+)/i);
    let filamentColors: string[] = [];
    if (filamentColorsMatch) {
      filamentColors = filamentColorsMatch[1].split(';').map(c => c.trim().replace(/^"|"$/g, ''));
    }

    const printTimeMin = this.extractPrintTime(gcodeContent);
    if (!printTimeMin) return null;

    // Crear lista de filamentos (solo los que tienen peso > 0)
    const filaments: FilamentInfo[] = [];
    for (let i = 0; i < filamentWeights.length; i++) {
      const weight = filamentWeights[i];
      if (weight <= 0) continue;

      const profileName = filamentNames[i] || `Filamento ${i + 1}`;
      const filamentType = filamentTypes[i] || '';
      const costPerKg = filamentCosts[i] || this.defaultFilamentCost;
      const color = filamentColors[i] || undefined;
      const weightKg = weight / 1000;
      const cost = weightKg * costPerKg;

      filaments.push({
        filamentId: i + 1,
        profileName,
        filamentType,
        weightG: weight,
        weightKg: Math.round(weightKg * 1000) / 1000,
        costPerKg,
        cost: Math.round(cost * 100) / 100,
        color,
      });
    }

    if (filaments.length === 0) return null;

    const totalFilamentWeightG = filaments.reduce((sum, f) => sum + f.weightG, 0);
    const materialCost = filaments.reduce((sum, f) => sum + f.cost, 0);
    const printHours = printTimeMin / 60;
    const machineCost = printHours * this.costPerHour;

    const layerHeightMatch = gcodeContent.match(/;\s*layer_height\s*=\s*(\d+\.?\d*)/i);
    const nozzleDiameterMatch = gcodeContent.match(/;\s*nozzle_diameter\s*=\s*(\d+\.?\d*)/i);

    const plateInfo: PlateInfo = {
      plateId,
      filaments,
      totalFilamentWeightG,
      totalFilamentWeightKg: Math.round((totalFilamentWeightG / 1000) * 1000) / 1000,
      printTimeMin: Math.round(printTimeMin),
      printTimeHours: Math.round(printHours * 100) / 100,
      materialCost: Math.round(materialCost * 100) / 100,
      machineCost: Math.round(machineCost * 100) / 100,
      totalCost: Math.round((materialCost + machineCost) * 100) / 100,
    };

    if (layerHeightMatch) plateInfo.layerHeight = parseFloat(layerHeightMatch[1]);
    if (nozzleDiameterMatch) plateInfo.nozzleDiameter = parseFloat(nozzleDiameterMatch[1]);

    return plateInfo;
  }

  /**
   * Extrae información de Creality Print
   */
  private extractCrealityPrint(gcodeContent: string, plateId: number): PlateInfo | null {
    // Creality Print: ; filament used [g] = 10.97
    const filamentWeightMatch = gcodeContent.match(/;\s*filament used \[g\]\s*=\s*(\d+\.?\d*)/i);
    const filamentWeight = filamentWeightMatch ? parseFloat(filamentWeightMatch[1]) : null;

    if (!filamentWeight || filamentWeight <= 0) return null;

    // Perfil de filamento
    const filamentNamesMatch = gcodeContent.match(/;\s*filament_settings_id\s*=\s*"([^"]+)"/i);
    const profileName = filamentNamesMatch ? filamentNamesMatch[1] : 'Filamento desconocido';

    // Tipo de filamento
    const filamentTypesMatch = gcodeContent.match(/;\s*filament_type\s*=\s*(\w+)/i);
    const filamentType = filamentTypesMatch ? filamentTypesMatch[1] : '';

    // Coste por kg (en el bloque de configuración)
    const filamentCostMatch = gcodeContent.match(/;\s*filament_cost\s*=\s*(\d+\.?\d*)/i);
    const costPerKg = filamentCostMatch ? parseFloat(filamentCostMatch[1]) : this.defaultFilamentCost;

    // Color del filamento
    const filamentColorsMatch = gcodeContent.match(/;\s*filament_colour\s*=\s*([^\n]+)/i);
    let color: string | undefined;
    if (filamentColorsMatch) {
      const colorStr = filamentColorsMatch[1].trim();
      // Puede venir como #56DF3D o como "color"
      if (colorStr.startsWith('#')) {
        color = colorStr;
      } else {
        color = colorStr.replace(/^"|"$/g, '');
      }
    }

    const printTimeMin = this.extractPrintTime(gcodeContent);
    if (!printTimeMin) return null;

    const filament: FilamentInfo = {
      filamentId: 1,
      profileName,
      filamentType,
      weightG: filamentWeight,
      weightKg: Math.round((filamentWeight / 1000) * 1000) / 1000,
      costPerKg,
      cost: Math.round((filamentWeight / 1000) * costPerKg * 100) / 100,
      color,
    };

    const printHours = printTimeMin / 60;
    const materialCost = filament.cost;
    const machineCost = printHours * this.costPerHour;

    const layerHeightMatch = gcodeContent.match(/;\s*layer_height\s*=\s*(\d+\.?\d*)/i);
    const nozzleDiameterMatch = gcodeContent.match(/;\s*nozzle_diameter\s*=\s*(\d+\.?\d*)/i);

    const plateInfo: PlateInfo = {
      plateId,
      filaments: [filament],
      totalFilamentWeightG: filamentWeight,
      totalFilamentWeightKg: Math.round((filamentWeight / 1000) * 1000) / 1000,
      printTimeMin: Math.round(printTimeMin),
      printTimeHours: Math.round(printHours * 100) / 100,
      materialCost: Math.round(materialCost * 100) / 100,
      machineCost: Math.round(machineCost * 100) / 100,
      totalCost: Math.round((materialCost + machineCost) * 100) / 100,
    };

    if (layerHeightMatch) plateInfo.layerHeight = parseFloat(layerHeightMatch[1]);
    if (nozzleDiameterMatch) plateInfo.nozzleDiameter = parseFloat(nozzleDiameterMatch[1]);

    return plateInfo;
  }

  /**
   * Extrae información de AnycubicSlicerNext
   */
  private extractAnycubicSlicerNext(gcodeContent: string, plateId: number): PlateInfo | null {
    // AnycubicSlicerNext: ; filament used [g] = 12.58
    const filamentWeightMatch = gcodeContent.match(/;\s*filament used \[g\]\s*=\s*(\d+\.?\d*)/i);
    const filamentWeight = filamentWeightMatch ? parseFloat(filamentWeightMatch[1]) : null;

    if (!filamentWeight || filamentWeight <= 0) return null;

    // Perfil de filamento
    const filamentNamesMatch = gcodeContent.match(/;\s*filament_settings_id\s*=\s*"([^"]+)"/i);
    const profileName = filamentNamesMatch ? filamentNamesMatch[1] : 'Filamento desconocido';

    // Tipo de filamento
    const filamentTypesMatch = gcodeContent.match(/;\s*filament_type\s*=\s*(\w+)/i);
    const filamentType = filamentTypesMatch ? filamentTypesMatch[1] : '';

    // Coste por kg (en el bloque de configuración)
    const filamentCostMatch = gcodeContent.match(/;\s*filament_cost\s*=\s*(\d+\.?\d*)/i);
    const costPerKg = filamentCostMatch ? parseFloat(filamentCostMatch[1]) : this.defaultFilamentCost;

    // Color del filamento - puede venir como hex o RGB en paint_info
    let color: string | undefined;
    const filamentColorsMatch = gcodeContent.match(/;\s*filament_colour\s*=\s*([^\n]+)/i);
    if (filamentColorsMatch) {
      const colorStr = filamentColorsMatch[1].trim();
      if (colorStr.startsWith('#')) {
        color = colorStr;
      } else {
        color = colorStr.replace(/^"|"$/g, '');
      }
    } else {
      // Intentar extraer de paint_info como RGB
      const paintInfoMatch = gcodeContent.match(/;\s*paint_info\s*=\s*\[.*?"paint_color":\[(\d+),(\d+),(\d+)\]/i);
      if (paintInfoMatch) {
        const r = parseInt(paintInfoMatch[1]);
        const g = parseInt(paintInfoMatch[2]);
        const b = parseInt(paintInfoMatch[3]);
        color = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      }
    }

    const printTimeMin = this.extractPrintTime(gcodeContent);
    if (!printTimeMin) return null;

    const filament: FilamentInfo = {
      filamentId: 1,
      profileName,
      filamentType,
      weightG: filamentWeight,
      weightKg: Math.round((filamentWeight / 1000) * 1000) / 1000,
      costPerKg,
      cost: Math.round((filamentWeight / 1000) * costPerKg * 100) / 100,
      color,
    };

    const printHours = printTimeMin / 60;
    const materialCost = filament.cost;
    const machineCost = printHours * this.costPerHour;

    const layerHeightMatch = gcodeContent.match(/;\s*layer_height\s*=\s*(\d+\.?\d*)/i);
    const nozzleDiameterMatch = gcodeContent.match(/;\s*nozzle_diameter\s*=\s*(\d+\.?\d*)/i);

    const plateInfo: PlateInfo = {
      plateId,
      filaments: [filament],
      totalFilamentWeightG: filamentWeight,
      totalFilamentWeightKg: Math.round((filamentWeight / 1000) * 1000) / 1000,
      printTimeMin: Math.round(printTimeMin),
      printTimeHours: Math.round(printHours * 100) / 100,
      materialCost: Math.round(materialCost * 100) / 100,
      machineCost: Math.round(machineCost * 100) / 100,
      totalCost: Math.round((materialCost + machineCost) * 100) / 100,
    };

    if (layerHeightMatch) plateInfo.layerHeight = parseFloat(layerHeightMatch[1]);
    if (nozzleDiameterMatch) plateInfo.nozzleDiameter = parseFloat(nozzleDiameterMatch[1]);

    return plateInfo;
  }

  /**
   * Extrae información de PrusaSlicer
   */
  private extractPrusaSlicer(gcodeContent: string, plateId: number): PlateInfo | null {
    // PrusaSlicer: filament used [g]=22.78 (sin punto y coma al inicio)
    const filamentWeightMatch = gcodeContent.match(/filament used \[g\]\s*=\s*(\d+\.?\d*)/i);
    const filamentWeight = filamentWeightMatch ? parseFloat(filamentWeightMatch[1]) : null;

    if (!filamentWeight || filamentWeight <= 0) return null;

    // Tipo de filamento
    const filamentTypesMatch = gcodeContent.match(/filament_type\s*=\s*(\w+)/i);
    const filamentType = filamentTypesMatch ? filamentTypesMatch[1] : '';

    // Coste total: filament cost=0.63
    // Calcular coste por kg desde el coste total
    const filamentCostTotalMatch = gcodeContent.match(/filament cost\s*=\s*(\d+\.?\d*)/i);
    const costPerKg = filamentCostTotalMatch && filamentWeight
      ? (parseFloat(filamentCostTotalMatch[1]) / filamentWeight) * 1000
      : this.defaultFilamentCost;

    // Color del filamento (extruder_colour puede estar vacío)
    let color: string | undefined;
    const extruderColourMatch = gcodeContent.match(/extruder_colour\s*=\s*"([^"]*)"/i);
    if (extruderColourMatch && extruderColourMatch[1] && extruderColourMatch[1].trim() !== '') {
      color = extruderColourMatch[1].trim();
    }

    // Perfil - usar el nombre del modelo o un nombre por defecto
    const objectsInfoMatch = gcodeContent.match(/objects_info\s*=\s*\{[^}]*"name"\s*:\s*"([^"]+)"/i);
    const profileName = objectsInfoMatch ? objectsInfoMatch[1] : `PrusaSlicer ${filamentType || 'Filamento'}`;

    const printTimeMin = this.extractPrintTime(gcodeContent);
    if (!printTimeMin) return null;

    const filament: FilamentInfo = {
      filamentId: 1,
      profileName,
      filamentType,
      weightG: filamentWeight,
      weightKg: Math.round((filamentWeight / 1000) * 1000) / 1000,
      costPerKg,
      cost: Math.round((filamentWeight / 1000) * costPerKg * 100) / 100,
      color,
    };

    const printHours = printTimeMin / 60;
    const materialCost = filament.cost;
    const machineCost = printHours * this.costPerHour;

    const layerHeightMatch = gcodeContent.match(/layer_height\s*=\s*(\d+\.?\d*)/i);
    const nozzleDiameterMatch = gcodeContent.match(/nozzle_diameter\s*=\s*(\d+\.?\d*)/i);

    const plateInfo: PlateInfo = {
      plateId,
      filaments: [filament],
      totalFilamentWeightG: filamentWeight,
      totalFilamentWeightKg: Math.round((filamentWeight / 1000) * 1000) / 1000,
      printTimeMin: Math.round(printTimeMin),
      printTimeHours: Math.round(printHours * 100) / 100,
      materialCost: Math.round(materialCost * 100) / 100,
      machineCost: Math.round(machineCost * 100) / 100,
      totalCost: Math.round((materialCost + machineCost) * 100) / 100,
    };

    if (layerHeightMatch) plateInfo.layerHeight = parseFloat(layerHeightMatch[1]);
    if (nozzleDiameterMatch) plateInfo.nozzleDiameter = parseFloat(nozzleDiameterMatch[1]);

    return plateInfo;
  }

  /**
   * Extrae el tiempo de impresión (común para todos los slicers)
   */
  private extractPrintTime(gcodeContent: string): number | null {
    // Patrones con soporte para días (d), horas (h), minutos (m) y segundos (s)
    const timePatterns = [
      /;\s*model printing time:\s*(?:(\d+)d\s*)?(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+)s)?/i,
      /;\s*total estimated time:\s*(?:(\d+)d\s*)?(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+)s)?/i,
      /;\s*estimated printing time.*?=\s*(?:(\d+)d\s*)?(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+)s)?/i,
      /estimated printing time.*?=\s*(?:(\d+)d\s*)?(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+)s)?/i,
      /;\s*total print time.*?:\s*(?:(\d+)d\s*)?(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+)s)?/i,
      /;\s*print_time\s*=\s*(\d+)/i,
      /;\s*time cost\s*=\s*(\d+):(\d+):(\d+)/i,
    ];

    for (const pattern of timePatterns) {
      const match = gcodeContent.match(pattern);
      if (match) {
        const groups = match.slice(1);

        if (groups.length === 1 && groups[0]) {
          // print_time en segundos
          return parseFloat(groups[0]) / 60;
        } else if (groups.length === 3 && pattern.source.includes(':')) {
          // Formato HH:MM:SS (time cost)
          const hours = groups[0] ? parseFloat(groups[0]) : 0;
          const minutes = groups[1] ? parseFloat(groups[1]) : 0;
          const seconds = groups[2] ? parseFloat(groups[2]) : 0;
          const printTimeMin = hours * 60 + minutes + seconds / 60;
          if (printTimeMin > 0) return printTimeMin;
        } else if ((groups.length === 2 || groups.length === 3) && pattern.source.includes('estimated printing time')) {
          // Formato Creality Print: 42m 13s (2 grupos: minutos y segundos)
          // Formato AnycubicSlicerNext: 1h 21m 10s (3 grupos: horas, minutos y segundos)
          // Formato PrusaSlicer: 35m 56s (2 grupos: minutos y segundos)
          const hours = groups[0] ? parseFloat(groups[0]) : 0;
          const minutes = groups[1] ? parseFloat(groups[1]) : 0;
          const seconds = groups[2] ? parseFloat(groups[2]) : 0;
          const printTimeMin = hours * 60 + minutes + seconds / 60;
          if (printTimeMin > 0) return printTimeMin;
        } else {
          // Formato con d/h/m/s (4 grupos)
          const days = groups[0] ? parseFloat(groups[0]) : 0;
          const hours = groups[1] ? parseFloat(groups[1]) : 0;
          const minutes = groups[2] ? parseFloat(groups[2]) : 0;
          const seconds = groups[3] ? parseFloat(groups[3]) : 0;
          const printTimeMin = days * 24 * 60 + hours * 60 + minutes + seconds / 60;

          if (printTimeMin > 0) return printTimeMin;
        }
      }
    }

    return null;
  }

  /**
   * Construye CostSummary a partir de un ParseResult
   */
  private buildCostSummary(parseResult: ParseResult): CostSummary {
    if (parseResult.plates.length === 0) {
      throw new Error('No se pudo extraer información de slicing del archivo');
    }

    const allFilamentsMap = new Map<string, {
      profileName: string;
      type: string;
      weightG: number;
      costPerKg: number;
      cost: number;
    }>();

    for (const plate of parseResult.plates) {
      for (const filament of plate.filaments) {
        const key = `${filament.profileName}__${filament.costPerKg}`;

        if (!allFilamentsMap.has(key)) {
          allFilamentsMap.set(key, {
            profileName: filament.profileName,
            type: filament.filamentType,
            weightG: 0,
            costPerKg: filament.costPerKg,
            cost: 0,
          });
        }

        const existing = allFilamentsMap.get(key)!;
        existing.weightG += filament.weightG;
        existing.cost += filament.cost;
      }
    }

    const filamentsUsed = Array.from(allFilamentsMap.values()).map(f => ({
      profileName: f.profileName,
      type: f.type,
      weightG: Math.round(f.weightG * 100) / 100,
      weightKg: Math.round((f.weightG / 1000) * 1000) / 1000,
      costPerKg: f.costPerKg,
      cost: Math.round(f.cost * 100) / 100,
    }));

    const totals = parseResult.plates.reduce(
      (acc, plate) => ({
        totalFilamentWeightKg: acc.totalFilamentWeightKg + plate.totalFilamentWeightKg,
        totalPrintTimeHours: acc.totalPrintTimeHours + plate.printTimeHours,
        totalMaterialCost: acc.totalMaterialCost + plate.materialCost,
        totalMachineCost: acc.totalMachineCost + plate.machineCost,
        totalCost: acc.totalCost + plate.totalCost,
      }),
      {
        totalFilamentWeightKg: 0,
        totalPrintTimeHours: 0,
        totalMaterialCost: 0,
        totalMachineCost: 0,
        totalCost: 0,
      }
    );

    totals.totalFilamentWeightKg = Math.round(totals.totalFilamentWeightKg * 1000) / 1000;
    totals.totalPrintTimeHours = Math.round(totals.totalPrintTimeHours * 100) / 100;
    totals.totalMaterialCost = Math.round(totals.totalMaterialCost * 100) / 100;
    totals.totalMachineCost = Math.round(totals.totalMachineCost * 100) / 100;
    totals.totalCost = Math.round(totals.totalCost * 100) / 100;

    return {
      fileName: parseResult.fileName,
      slicer: parseResult.slicer,
      calculationConfig: {
        costPerHour: this.costPerHour,
        defaultFilamentCost: this.defaultFilamentCost,
      },
      plates: parseResult.plates,
      summary: {
        ...totals,
        filamentsUsed,
      },
    };
  }

  /**
   * Procesa un archivo completo
   */
  async processFile(file: File | Blob): Promise<CostSummary> {
    const parseResult = await this.parseFile(file);
    return this.buildCostSummary(parseResult);
  }

  /**
   * Procesa un archivo y retorna CostSummary + contenido gcode raw por placa.
   * Evita parsear el archivo dos veces cuando se necesita preview 3D.
   */
  async processFileWithContent(file: File | Blob): Promise<CostSummary & { gcodeContents: Map<number, string> }> {
    const parseResult = await this.parseFileWithContent(file);
    const costSummary = this.buildCostSummary(parseResult);
    return { ...costSummary, gcodeContents: parseResult.gcodeContents };
  }

  updateConfig(config: CalculatorConfig): void {
    if (config.costPerHour !== undefined) this.costPerHour = config.costPerHour;
    if (config.defaultFilamentCost !== undefined) this.defaultFilamentCost = config.defaultFilamentCost;
  }

  getConfig(): Required<CalculatorConfig> {
    return {
      costPerHour: this.costPerHour,
      defaultFilamentCost: this.defaultFilamentCost,
    };
  }
}

// ============================================================================
// FUNCIONES DE UTILIDAD
// ============================================================================

export function formatPrintTime(minutes: number): string {
  const totalHours = Math.floor(minutes / 60);
  const mins = Math.round(minutes % 60);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;

  if (days > 0) {
    if (hours === 0 && mins === 0) return `${days}d`;
    if (mins === 0) return `${days}d ${hours}h`;
    if (hours === 0) return `${days}d ${mins}m`;
    return `${days}d ${hours}h ${mins}m`;
  }

  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatWeight(grams: number): string {
  if (grams < 1000) return `${grams}g`;
  return `${(grams / 1000).toFixed(2)}kg`;
}

export function formatCost(euros: number): string {
  return `${euros.toFixed(2)}€`;
}

export function generateTextSummary(summary: CostSummary): string {
  let text = `PRESUPUESTO DE IMPRESIÓN 3D\n`;
  text += `=${'='.repeat(70)}\n\n`;
  text += `Archivo: ${summary.fileName}\n`;
  text += `Slicer: ${summary.slicer}\n`;
  text += `Placas: ${summary.plates.length}\n\n`;

  for (const plate of summary.plates) {
    text += `PLACA ${plate.plateId}:\n`;
    text += `-${'-'.repeat(70)}\n`;
    
    if (plate.filaments.length > 1) {
      text += `Filamentos (${plate.filaments.length} tipos):\n`;
      for (const filament of plate.filaments) {
        text += `  • ${filament.profileName} (${filament.filamentType})\n`;
        text += `    Peso: ${filament.weightG}g - Coste: ${formatCost(filament.cost)}\n`;
      }
    } else {
      const filament = plate.filaments[0];
      text += `Filamento: ${filament.profileName} (${filament.filamentType})\n`;
      text += `Peso: ${filament.weightG}g\n`;
    }
    
    text += `Tiempo: ${formatPrintTime(plate.printTimeMin)}\n`;
    text += `Coste material: ${formatCost(plate.materialCost)}\n`;
    text += `Coste máquina: ${formatCost(plate.machineCost)}\n`;
    text += `TOTAL PLACA: ${formatCost(plate.totalCost)}\n\n`;
  }

  text += `RESUMEN TOTAL:\n`;
  text += `=${'='.repeat(70)}\n`;
  
  if (summary.summary.filamentsUsed.length > 1) {
    text += `Filamentos usados:\n`;
    for (const filament of summary.summary.filamentsUsed) {
      text += `  • ${filament.profileName}: ${filament.weightG}g - ${formatCost(filament.cost)}\n`;
    }
  } else {
    const filament = summary.summary.filamentsUsed[0];
    text += `Filamento: ${filament.profileName} (${filament.weightKg}kg)\n`;
  }
  
  text += `\nTiempo total: ${formatPrintTime(summary.summary.totalPrintTimeHours * 60)}\n`;
  text += `Coste material: ${formatCost(summary.summary.totalMaterialCost)}\n`;
  text += `Coste máquina: ${formatCost(summary.summary.totalMachineCost)}\n`;
  text += `COSTE TOTAL: ${formatCost(summary.summary.totalCost)}\n`;

  return text;
}

export default PrintCostCalculator;
