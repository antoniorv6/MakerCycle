/**
 * Calculadora de costes de impresión 3D para archivos .gcode.3mf de OrcaSlicer
 * Librería TypeScript para NextJS con soporte multi-filamento
 */

// ============================================================================
// TIPOS
// ============================================================================

export interface FilamentInfo {
    filamentId: number;
    profileName: string;      // 👈 Nombre del perfil de OrcaSlicer
    filamentType: string;
    color?: string;           // 👈 Color del filamento (hex)
    weightG: number;
    weightKg: number;
    costPerKg: number;
    cost: number;
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
    plates: PlateInfo[];
  }
  
  export interface CostSummary {
    fileName: string;
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
         color?: string;
         weightG: number;
         weightKg: number;
         costPerKg: number;
         cost: number;
       }>;
    };
  }
  
  export interface CalculatorConfig {
    costPerHour?: number;           // €/h - default: 0.1
    defaultFilamentCost?: number;   // €/kg - default: 20.0
  }
  
  // ============================================================================
  // CLASE PRINCIPAL
  // ============================================================================
  
  export class PrintCostCalculator {
    private costPerHour: number;
    private defaultFilamentCost: number;
  
    constructor(config: CalculatorConfig = {}) {
      this.costPerHour = config.costPerHour ?? 0.1;
      this.defaultFilamentCost = config.defaultFilamentCost ?? 20.0;
    }
  
    /**
     * Parsea un archivo .gcode.3mf de OrcaSlicer
     * @param file - El archivo como File o Blob
     * @returns Información de las placas extraídas
     */
    async parseFile(file: File | Blob): Promise<ParseResult> {
      const fileName = file instanceof File ? file.name : 'unknown.3mf';
      
      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(file);
  
      const plates: PlateInfo[] = [];
  
      // Buscar archivos de G-code por placa
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
        plates,
      };
    }
  
    /**
     * Parsea directamente desde el contenido de un archivo G-code (string)
     */
    parseGcodeContent(gcodeContent: string, fileName: string = 'plate_1.gcode'): PlateInfo | null {
      return this.extractFromGcode(gcodeContent, fileName);
    }
  
    /**
     * Extrae información de un archivo G-code de OrcaSlicer
     */
    private extractFromGcode(gcodeContent: string, fileName: string): PlateInfo | null {
      // Extraer número de placa
      const plateMatch = fileName.match(/plate_(\d+)/);
      const plateId = plateMatch ? parseInt(plateMatch[1]) : 1;
  
      // ========================================================================
      // EXTRAER INFORMACIÓN DE FILAMENTOS
      // ========================================================================
  
      // Peso de filamentos: ; filament used [g] = 10.08, 0.0, 0.0, 0.0
      const filamentWeightsMatch = gcodeContent.match(/;\s*filament used \[g\]\s*=\s*([\d.,\s]+)/i);
      let filamentWeights: number[] = [];
      
      if (filamentWeightsMatch) {
        const weightsStr = filamentWeightsMatch[1];
        filamentWeights = weightsStr.split(',').map(w => parseFloat(w.trim())).filter(w => !isNaN(w));
      }
  
      // Tipos de filamento: ; filament_type = PLA; PLA; PETG
      const filamentTypesMatch = gcodeContent.match(/;\s*filament_type\s*=\s*([^\n]+)/i);
      let filamentTypes: string[] = [];
      
      if (filamentTypesMatch) {
        const typesStr = filamentTypesMatch[1];
        filamentTypes = typesStr.split(';').map(t => t.trim());
      }
  
       // Nombres de perfiles: ; filament_settings_id = "Bambu PLA Basic @BBL X1C"; "Generic PLA"
       const filamentNamesMatch = gcodeContent.match(/;\s*filament_settings_id\s*=\s*([^\n]+)/i);
       let filamentNames: string[] = [];
       
       if (filamentNamesMatch) {
         const namesStr = filamentNamesMatch[1];
         filamentNames = namesStr.split(';').map(n => n.trim().replace(/^"|"$/g, ''));
       }

       // Colores de filamentos: ; filament_colour = #FF0000; #00FF00; #0000FF
       const filamentColorsMatch = gcodeContent.match(/;\s*filament_colour\s*=\s*([^\n]+)/i);
       let filamentColors: string[] = [];
       
       if (filamentColorsMatch) {
         const colorsStr = filamentColorsMatch[1];
         filamentColors = colorsStr.split(';').map(c => c.trim());
       }
  
      // Costes de filamentos: ; filament_cost = 20.5,25.0,30.0 o ; filament_cost = 20.5; 25.0; 30.0
      const filamentCostsMatch = gcodeContent.match(/;\s*filament_cost\s*=\s*([\d.,;\s]+)/i);
      let filamentCosts: number[] = [];
      
      if (filamentCostsMatch) {
        const costsStr = filamentCostsMatch[1].trim();
        // Detectar separador (punto y coma o coma)
        const separator = costsStr.includes(';') ? ';' : ',';
        
        filamentCosts = costsStr.split(separator)
          .map(c => c.trim())
          .filter(c => c !== '')
          .map(c => parseFloat(c))
          .filter(c => !isNaN(c));
      }
  
      // Asegurar que tenemos el mismo número de costes que de pesos
      if (filamentWeights.length > 0) {
        // Si no hay costes o no coinciden las cantidades, rellenar con valores por defecto
        if (filamentCosts.length === 0 || filamentCosts.length !== filamentWeights.length) {
          filamentCosts = Array(filamentWeights.length).fill(this.defaultFilamentCost);
        }
      }
  
      // ========================================================================
      // EXTRAER TIEMPO DE IMPRESIÓN
      // ========================================================================
  
      const timePatterns = [
        /;\s*model printing time:\s*(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+)s)?/i,
        /;\s*total estimated time:\s*(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+)s)?/i,
        /;\s*estimated printing time.*?=\s*(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+)s)?/i,
        /;\s*total print time.*?:\s*(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+)s)?/i,
        /;\s*print_time\s*=\s*(\d+)/i,
        /;\s*time cost\s*=\s*(\d+):(\d+):(\d+)/i,
      ];
  
      let printTimeMin: number | null = null;
      
      for (const pattern of timePatterns) {
        const match = gcodeContent.match(pattern);
        if (match) {
          const groups = match.slice(1);
          
          if (groups.length === 1 && groups[0]) {
            // Formato: segundos totales
            printTimeMin = parseFloat(groups[0]) / 60;
          } else {
            // Formato: horas, minutos, segundos
            const hours = groups[0] ? parseFloat(groups[0]) : 0;
            const minutes = groups[1] ? parseFloat(groups[1]) : 0;
            const seconds = groups[2] ? parseFloat(groups[2]) : 0;
            printTimeMin = hours * 60 + minutes + seconds / 60;
          }
  
          if (printTimeMin && printTimeMin > 0) {
            break;
          }
        }
      }
  
      // ========================================================================
      // INFORMACIÓN ADICIONAL
      // ========================================================================
  
      const layerHeightMatch = gcodeContent.match(/;\s*layer_height\s*=\s*(\d+\.?\d*)/i);
      const nozzleDiameterMatch = gcodeContent.match(/;\s*nozzle_diameter\s*=\s*(\d+\.?\d*)/i);
  
      // ========================================================================
      // CREAR OBJETO PlateInfo
      // ========================================================================
  
      if (filamentWeights.length === 0 || printTimeMin === null) {
        return null;
      }
  
      // Crear información de filamentos (solo los que tienen peso > 0)
      const filaments: FilamentInfo[] = [];
      
      for (let i = 0; i < filamentWeights.length; i++) {
        const weight = filamentWeights[i];
        
        // Ignorar filamentos con peso 0 (slots no usados)
        if (weight <= 0) continue;
  
         const profileName = filamentNames[i] || `Filamento ${i + 1}`;
         const filamentType = filamentTypes[i] || '';
         const color = filamentColors[i] || undefined;
         const costPerKg = filamentCosts[i] || this.defaultFilamentCost;
         const weightKg = weight / 1000;
         const cost = weightKg * costPerKg;

         filaments.push({
           filamentId: i + 1,
           profileName,
           filamentType,
           color,
           weightG: weight,
           weightKg: Math.round(weightKg * 1000) / 1000,
           costPerKg,
           cost: Math.round(cost * 100) / 100,
         });
      }
  
      // Validar que haya al menos un filamento
      if (filaments.length === 0) {
        return null;
      }
  
      // Calcular totales
      const totalFilamentWeightG = filaments.reduce((sum, f) => sum + f.weightG, 0);
      const materialCost = filaments.reduce((sum, f) => sum + f.cost, 0);
      const printHours = printTimeMin / 60;
      const machineCost = printHours * this.costPerHour;
  
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
  
      if (layerHeightMatch) {
        plateInfo.layerHeight = parseFloat(layerHeightMatch[1]);
      }
      if (nozzleDiameterMatch) {
        plateInfo.nozzleDiameter = parseFloat(nozzleDiameterMatch[1]);
      }
  
      return plateInfo;
    }
  
    /**
     * Procesa un archivo completo y devuelve el resumen de costes
     */
    async processFile(file: File | Blob): Promise<CostSummary> {
      const parseResult = await this.parseFile(file);
  
      if (parseResult.plates.length === 0) {
        throw new Error('No se pudo extraer información de slicing del archivo');
      }
  
       // Consolidar filamentos
       const allFilamentsMap = new Map<string, {
         profileName: string;
         type: string;
         color?: string;
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
               color: filament.color,
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
  
       // Convertir a array y agregar weightKg
       const filamentsUsed = Array.from(allFilamentsMap.values()).map(f => ({
         profileName: f.profileName,
         type: f.type,
         color: f.color,
         weightG: Math.round(f.weightG * 100) / 100,
         weightKg: Math.round((f.weightG / 1000) * 1000) / 1000,
         costPerKg: f.costPerKg,
         cost: Math.round(f.cost * 100) / 100,
       }));
  
      // Calcular totales
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
  
      // Redondear totales
      totals.totalFilamentWeightKg = Math.round(totals.totalFilamentWeightKg * 1000) / 1000;
      totals.totalPrintTimeHours = Math.round(totals.totalPrintTimeHours * 100) / 100;
      totals.totalMaterialCost = Math.round(totals.totalMaterialCost * 100) / 100;
      totals.totalMachineCost = Math.round(totals.totalMachineCost * 100) / 100;
      totals.totalCost = Math.round(totals.totalCost * 100) / 100;
  
      return {
        fileName: parseResult.fileName,
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
     * Actualiza los costes configurados
     */
    updateConfig(config: CalculatorConfig): void {
      if (config.costPerHour !== undefined) this.costPerHour = config.costPerHour;
      if (config.defaultFilamentCost !== undefined) this.defaultFilamentCost = config.defaultFilamentCost;
    }
  
    /**
     * Obtiene la configuración actual
     */
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
  
  /**
   * Formatea el tiempo en un formato legible
   */
  export function formatPrintTime(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
  
    if (hours === 0) {
      return `${mins}m`;
    } else if (mins === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${mins}m`;
    }
  }
  
  /**
   * Formatea el peso en un formato legible
   */
  export function formatWeight(grams: number): string {
    if (grams < 1000) {
      return `${grams}g`;
    } else {
      const kg = (grams / 1000).toFixed(2);
      return `${kg}kg`;
    }
  }
  
  /**
   * Formatea el coste en euros
   */
  export function formatCost(euros: number): string {
    return `${euros.toFixed(2)}€`;
  }
  
  /**
   * Genera un resumen de texto del presupuesto
   */
  export function generateTextSummary(summary: CostSummary): string {
    let text = `PRESUPUESTO DE IMPRESIÓN 3D\n`;
    text += `=${'='.repeat(70)}\n\n`;
    text += `Archivo: ${summary.fileName}\n`;
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
  
  // ============================================================================
  // EXPORTACIÓN POR DEFECTO
  // ============================================================================
  
  export default PrintCostCalculator;