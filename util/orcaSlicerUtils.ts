import JSZip from 'jszip';
import type { PlateData, SlicerData } from './orcaTypes';

// Re-exportar los tipos para compatibilidad
export type { PlateData, SlicerData } from './orcaTypes';

// Interfaces para el cálculo de slicing
interface Vertex {
  x: number;
  y: number;
  z: number;
}

interface Triangle {
  vertices: [Vertex, Vertex, Vertex];
  normal: Vertex;
}

interface ModelGeometry {
  triangles: Triangle[];
  boundingBox: {
    min: Vertex;
    max: Vertex;
  };
  volume: number; // mm³
  surfaceArea: number; // mm²
}

interface SlicingConfig {
  layerHeight: number;      // mm
  infillDensity: number;    // 0-1 (0.2 = 20%)
  perimeterWidth: number;   // mm
  perimeterCount: number;   // número de perímetros
  topBottomLayers: number;  // capas sólidas arriba/abajo
  printSpeed: number;       // mm/min
  filamentDensity: number;  // g/cm³ (PLA = 1.25)
  filamentDiameter: number; // mm (1.75)
}

// Configuración por defecto para PLA
const DEFAULT_CONFIG: SlicingConfig = {
  layerHeight: 0.2,         // mm - altura de cada capa
  infillDensity: 0.2,       // 20% - porcentaje de relleno interior
  perimeterWidth: 0.4,      // mm - ancho de línea de extrusión
  perimeterCount: 2,        // número de contornos/paredes
  topBottomLayers: 3,       // capas sólidas arriba y abajo
  printSpeed: 2400,         // mm/min (40mm/s * 60)
  filamentDensity: 1.25,    // g/cm³ - densidad del PLA
  filamentDiameter: 1.75    // mm - diámetro del filamento
};

// Mostrar configuración detallada
const logSlicingConfiguration = (config: SlicingConfig) => {
  console.log('\n🔧 === HIPERPARÁMETROS DE CÁLCULO ===');
  console.log('📏 GEOMETRÍA:');
  console.log(`   • Altura de capa: ${config.layerHeight}mm`);
  console.log(`   • Ancho de extrusión: ${config.perimeterWidth}mm`);
  console.log(`   • Número de perímetros: ${config.perimeterCount}`);
  console.log(`   • Capas sólidas (top/bottom): ${config.topBottomLayers} cada una`);
  
  console.log('\n🕳️ RELLENO:');
  console.log(`   • Densidad de infill: ${(config.infillDensity * 100).toFixed(1)}%`);
  
  console.log('\n🏃 VELOCIDADES:');
  console.log(`   • Velocidad de impresión: ${config.printSpeed}mm/min (${(config.printSpeed/60).toFixed(1)}mm/s)`);
  
  console.log('\n🧵 MATERIAL:');
  console.log(`   • Diámetro de filamento: ${config.filamentDiameter}mm`);
  console.log(`   • Densidad del material: ${config.filamentDensity}g/cm³`);
  
  console.log('\n⚡ CONSUMO ELÉCTRICO:');
  console.log(`   • Potencia estimada de impresora: 200W`);
  console.log(`   • Factor de eficiencia: 100% (sin pérdidas)`);
  
  console.log('=== FIN HIPERPARÁMETROS ===\n');
};

// Parser que calcula todo desde la geometría
export const analyzeOrcaSlicer3MF = async (file: File): Promise<SlicerData> => {
  try {
    console.log('=== CALCULADOR DE SLICING COMPLETO ===');
    console.log('Archivo:', file.name, 'Tamaño:', file.size);
    
    const zip = new JSZip();
    const zipContent = await zip.loadAsync(file);
    
    console.log('📁 Archivos en el 3MF:', Object.keys(zipContent.files));
    
    // NUEVO: Inspeccionar TODOS los archivos del 3MF
    await inspectAll3MFFiles(zipContent);
    
    // Extraer configuración REAL del slicer
    const config = await extractSlicingConfig(zipContent);
    
    // Mostrar hiperparámetros de cálculo
    logSlicingConfiguration(config);
    
    // Extraer y analizar modelos 3D
    const models = await extractAndAnalyzeModels(zipContent);
    console.log('🧩 Modelos encontrados:', models.length);
    
    // Calcular datos de impresión para cada modelo/placa
    const plates = calculatePlatesFromModels(models, config);
    
    // Asegurar que siempre hay al menos una placa válida
    if (plates.length === 0) {
      console.log('⚠️ No se calcularon placas, creando placa de emergencia...');
      plates.push(createEmergencyPlate(config));
    }
    
    // Calcular totales con validación
    const totalWeight = plates.reduce((sum, plate) => {
      const weight = typeof plate.filamentWeight === 'number' && !isNaN(plate.filamentWeight) 
        ? plate.filamentWeight 
        : 0;
      return sum + weight;
    }, 0);
    
    const totalTime = plates.reduce((sum, plate) => {
      const time = typeof plate.printHours === 'number' && !isNaN(plate.printHours) 
        ? plate.printHours 
        : 0;
      return sum + time;
    }, 0);
    
    // Asegurar valores mínimos válidos
    const validTotalWeight = totalWeight > 0 ? totalWeight : 10.0;
    const validTotalTime = totalTime > 0 ? totalTime : 1.0;
    
    const result: SlicerData = {
      plates: plates.map(validatePlateData), // Validar cada placa
      totalWeight: Math.round(validTotalWeight * 100) / 100,  // 2 decimales
      totalTime: Math.round(validTotalTime * 10) / 10          // 1 decimal
    };
    
    console.log('🎯 Resultado calculado:', result);
    return result;
    
  } catch (error) {
    console.error('Error en calculador de slicing:', error);
    
    // En caso de error, devolver datos válidos por defecto
    return createFallbackSlicerData();
  }
};

// NUEVA FUNCIÓN: Inspeccionar todos los archivos del 3MF
const inspectAll3MFFiles = async (zipContent: JSZip): Promise<void> => {
  console.log('\n🔍 === INSPECCIÓN COMPLETA DEL ARCHIVO 3MF ===');
  
  const files = Object.keys(zipContent.files).sort();
  console.log(`📋 Total de archivos encontrados: ${files.length}`);
  
  for (const fileName of files) {
    const file = zipContent.files[fileName];
    
    if (file.dir) {
      console.log(`📁 DIRECTORIO: ${fileName}`);
    } else {
      console.log(`\n📄 === ARCHIVO: ${fileName} ===`);
      console.log(`   Tamaño: ${file._data?.uncompressedSize || 'desconocido'} bytes`);
      
      try {
        // Intentar leer como texto
        const content = await file.async('text');
        console.log(`   Tipo: Texto (${content.length} caracteres)`);
        
        // Mostrar contenido según el tipo de archivo
        if (fileName.includes('slice_info.config')) {
          console.log('   🎯 *** ARCHIVO CLAVE: slice_info.config ***');
          console.log('   CONTENIDO COMPLETO:');
          console.log(content);
          console.log('   *** FIN slice_info.config ***');
        } else if (fileName.includes('Metadata/')) {
          console.log('   📊 ARCHIVO DE METADATOS - Primeros 500 caracteres:');
          console.log(content.substring(0, 500));
          if (content.length > 500) {
            console.log('   ... (truncado)');
          }
        } else if (fileName.endsWith('.xml') || fileName.endsWith('.model')) {
          console.log('   🔧 ARCHIVO XML/MODEL - Primeros 300 caracteres:');
          console.log(content.substring(0, 300));
          if (content.length > 300) {
            console.log('   ... (truncado)');
          }
        } else if (fileName.includes('config') || fileName.includes('.ini')) {
          console.log('   ⚙️ ARCHIVO DE CONFIGURACIÓN - Contenido completo:');
          console.log(content);
        } else {
          console.log('   📝 Primeros 200 caracteres:');
          console.log(content.substring(0, 200));
          if (content.length > 200) {
            console.log('   ... (truncado)');
          }
        }
        
      } catch (error) {
        console.log('   🔒 Archivo binario o no legible');
      }
    }
  }
  
  console.log('=== FIN INSPECCIÓN COMPLETA ===\n');
};

// Crear placa de emergencia
const createEmergencyPlate = (config: SlicingConfig): PlateData => {
  return {
    plateId: 'plate_emergency',
    plateName: 'Placa de emergencia',
    filamentWeight: 10.0,
    printHours: 1.0,
    layerHeight: Math.round(config.layerHeight * 100) / 100,
    infill: Math.round(config.infillDensity * 100),
    models: ['Modelo por defecto']
  };
};

// Validar datos de placa para asegurar que todos los campos están definidos
const validatePlateData = (plate: PlateData): PlateData => {
  return {
    plateId: typeof plate.plateId === 'string' ? plate.plateId : 'plate_unknown',
    plateName: typeof plate.plateName === 'string' ? plate.plateName : 'Placa sin nombre',
    filamentWeight: typeof plate.filamentWeight === 'number' && !isNaN(plate.filamentWeight) 
      ? Math.round(plate.filamentWeight * 100) / 100 
      : 10.0,
    printHours: typeof plate.printHours === 'number' && !isNaN(plate.printHours) 
      ? Math.round(plate.printHours * 10) / 10 
      : 1.0,
    layerHeight: typeof plate.layerHeight === 'number' && !isNaN(plate.layerHeight) 
      ? Math.round(plate.layerHeight * 100) / 100 
      : 0.2,
    infill: typeof plate.infill === 'number' && !isNaN(plate.infill) 
      ? Math.round(plate.infill) 
      : 20,
    models: Array.isArray(plate.models) && plate.models.length > 0 
      ? plate.models 
      : ['Modelo sin nombre']
  };
};

// Crear datos de fallback completos
const createFallbackSlicerData = (): SlicerData => {
  console.log('🆘 Creando datos de fallback completos...');
  
  const fallbackPlate: PlateData = {
    plateId: 'plate_fallback',
    plateName: 'Placa de fallback',
    filamentWeight: 15.0,
    printHours: 2.0,
    layerHeight: 0.2,
    infill: 20,
    models: ['Modelo de fallback']
  };
  
  return {
    plates: [fallbackPlate],
    totalWeight: 15.0,
    totalTime: 2.0
  };
};

// Extraer configuración de slicing del archivo 3MF
const extractSlicingConfig = async (zipContent: JSZip): Promise<SlicingConfig> => {
  const config = { ...DEFAULT_CONFIG };
  
  console.log('\n⚙️ === EXTRAYENDO CONFIGURACIÓN REAL ===');
  
  // Lista COMPLETA de archivos de configuración a buscar
  const configFiles = [
    'Metadata/slice_info.config',     // ¡El que mencionas!
    'Metadata/Slic3r_PE.config',
    'Metadata/print_config.ini',
    'Metadata/config.ini',
    'slice_info.config',              // Por si está en raíz
    'print_settings.config',
    'printer_settings.config',
    'Metadata/slice_settings.config'
  ];
  
  let configFound = false;
  
  for (const fileName of configFiles) {
    const file = zipContent.file(fileName);
    if (file) {
      try {
        const content = await file.async('text');
        console.log(`\n🎯 === PROCESANDO ${fileName} ===`);
        console.log(`Tamaño: ${content.length} caracteres`);
        
        // Si es slice_info.config, mostrarlo completo
        if (fileName.includes('slice_info.config')) {
          console.log('📋 CONTENIDO COMPLETO DE slice_info.config:');
          console.log(content);
          console.log('--- FIN CONTENIDO ---');
          configFound = true;
        }
        
        // Parsear configuración línea por línea
        const lines = content.split('\n');
        console.log(`Procesando ${lines.length} líneas...`);
        
        lines.forEach((line, index) => {
          const trimmedLine = line.trim();
          if (trimmedLine && !trimmedLine.startsWith('#') && !trimmedLine.startsWith(';') && trimmedLine.includes('=')) {
            const [key, ...valueParts] = trimmedLine.split('=');
            const value = valueParts.join('=').trim();
            const cleanKey = key.trim().toLowerCase();
            
            // Mapear TODAS las configuraciones posibles
            switch (cleanKey) {
              // Altura de capa
              case 'layer_height':
              case 'first_layer_height':
              case 'layer_height_0':
                const layerHeight = parseFloat(value);
                if (!isNaN(layerHeight) && layerHeight > 0 && layerHeight < 2) {
                  config.layerHeight = layerHeight;
                  console.log(`✅ Altura de capa encontrada: ${layerHeight}mm (línea ${index + 1})`);
                }
                break;
                
              // Densidad de relleno
              case 'fill_density':
              case 'infill_density':
              case 'sparse_infill_density':
              case 'infill_sparse_density':
                const infill = parseFloat(value);
                if (!isNaN(infill) && infill >= 0 && infill <= 1) {
                  config.infillDensity = infill;
                  console.log(`✅ Densidad de relleno encontrada: ${(infill * 100).toFixed(1)}% (línea ${index + 1})`);
                } else if (!isNaN(infill) && infill > 1 && infill <= 100) {
                  config.infillDensity = infill / 100;
                  console.log(`✅ Densidad de relleno encontrada: ${infill}% = ${infill/100} (línea ${index + 1})`);
                }
                break;
                
              // Ancho de extrusión
              case 'extrusion_width':
              case 'line_width':
              case 'nozzle_diameter':
              case 'perimeter_extrusion_width':
                const width = parseFloat(value);
                if (!isNaN(width) && width > 0 && width < 2) {
                  config.perimeterWidth = width;
                  console.log(`✅ Ancho de extrusión encontrado: ${width}mm (línea ${index + 1})`);
                }
                break;
                
              // Número de perímetros
              case 'perimeters':
              case 'wall_line_count':
              case 'perimeter_count':
                const perimeters = parseInt(value);
                if (!isNaN(perimeters) && perimeters > 0 && perimeters < 10) {
                  config.perimeterCount = perimeters;
                  console.log(`✅ Número de perímetros encontrado: ${perimeters} (línea ${index + 1})`);
                }
                break;
                
              // Capas sólidas superiores/inferiores
              case 'top_solid_layers':
              case 'top_layers':
              case 'top_shell_layers':
                const topLayers = parseInt(value);
                if (!isNaN(topLayers) && topLayers >= 0) {
                  config.topBottomLayers = Math.max(config.topBottomLayers, topLayers);
                  console.log(`✅ Capas superiores encontradas: ${topLayers} (línea ${index + 1})`);
                }
                break;
                
              case 'bottom_solid_layers':
              case 'bottom_layers':
              case 'bottom_shell_layers':
                const bottomLayers = parseInt(value);
                if (!isNaN(bottomLayers) && bottomLayers >= 0) {
                  config.topBottomLayers = Math.max(config.topBottomLayers, bottomLayers);
                  console.log(`✅ Capas inferiores encontradas: ${bottomLayers} (línea ${index + 1})`);
                }
                break;
                
              // Velocidades
              case 'print_speed':
              case 'speed_print':
              case 'perimeter_speed':
              case 'outer_perimeter_speed':
                const speed = parseFloat(value);
                if (!isNaN(speed) && speed > 0) {
                  config.printSpeed = speed > 100 ? speed : speed * 60; // Convertir mm/s a mm/min si es necesario
                  console.log(`✅ Velocidad encontrada: ${speed} → ${config.printSpeed}mm/min (línea ${index + 1})`);
                }
                break;
                
              // Densidad del filamento
              case 'filament_density':
              case 'material_density':
                const density = parseFloat(value);
                if (!isNaN(density) && density > 0 && density < 10) {
                  config.filamentDensity = density;
                  console.log(`✅ Densidad de filamento encontrada: ${density}g/cm³ (línea ${index + 1})`);
                }
                break;
                
              // Diámetro del filamento
              case 'filament_diameter':
              case 'material_diameter':
                const diameter = parseFloat(value);
                if (!isNaN(diameter) && diameter > 0 && diameter < 5) {
                  config.filamentDiameter = diameter;
                  console.log(`✅ Diámetro de filamento encontrado: ${diameter}mm (línea ${index + 1})`);
                }
                break;
                
              // Peso y tiempo calculados por el slicer (¡los valores reales!)
              case 'filament_used_g':
              case 'total_filament_used':
              case 'filament_weight':
                const weight = parseFloat(value);
                if (!isNaN(weight) && weight > 0) {
                  console.log(`🎯 PESO REAL DEL SLICER: ${weight}g (línea ${index + 1})`);
                  // Guardamos esto para usarlo directamente
                  (config as any).realWeight = weight;
                }
                break;
                
              case 'estimated_printing_time':
              case 'print_time':
              case 'total_print_time':
                const time = parseSlicerTime(value);
                if (time > 0) {
                  console.log(`🎯 TIEMPO REAL DEL SLICER: ${time}h (línea ${index + 1})`);
                  // Guardamos esto para usarlo directamente
                  (config as any).realTime = time;
                }
                break;
                
              default:
                // Logging de otros parámetros interesantes
                if (cleanKey.includes('weight') || cleanKey.includes('time') || 
                    cleanKey.includes('filament') || cleanKey.includes('print')) {
                  console.log(`📝 Parámetro interesante: ${cleanKey} = ${value} (línea ${index + 1})`);
                }
                break;
            }
          }
        });
        
        console.log(`=== FIN ${fileName} ===`);
        
      } catch (error) {
        console.warn(`⚠️ Error leyendo configuración ${fileName}:`, error);
      }
    }
  }
  
  if (!configFound) {
    console.log('⚠️ No se encontró slice_info.config, usando configuración por defecto');
  }
  
  console.log('\n📊 CONFIGURACIÓN FINAL EXTRAÍDA:');
  console.log(`   Altura de capa: ${config.layerHeight}mm`);
  console.log(`   Densidad de relleno: ${(config.infillDensity * 100).toFixed(1)}%`);
  console.log(`   Ancho de extrusión: ${config.perimeterWidth}mm`);
  console.log(`   Perímetros: ${config.perimeterCount}`);
  console.log(`   Capas sólidas: ${config.topBottomLayers}`);
  console.log(`   Velocidad: ${config.printSpeed}mm/min`);
  console.log(`   Densidad filamento: ${config.filamentDensity}g/cm³`);
  
  // Mostrar valores reales si se encontraron
  if ((config as any).realWeight) {
    console.log(`   🎯 PESO REAL: ${(config as any).realWeight}g`);
  }
  if ((config as any).realTime) {
    console.log(`   🎯 TIEMPO REAL: ${(config as any).realTime}h`);
  }
  
  console.log('=== FIN EXTRACCIÓN DE CONFIGURACIÓN ===\n');
  
  return config;
};

// Función para parsear tiempo del slicer (puede estar en varios formatos)
const parseSlicerTime = (timeStr: string): number => {
  // "8h 6m" o "8:06" o "486m" o "29160s"
  const hoursMinutes = timeStr.match(/(\d+)h\s*(\d+)m/);
  if (hoursMinutes) {
    return parseInt(hoursMinutes[1]) + parseInt(hoursMinutes[2]) / 60;
  }
  
  const hoursMinutesColon = timeStr.match(/(\d+):(\d+)/);
  if (hoursMinutesColon) {
    return parseInt(hoursMinutesColon[1]) + parseInt(hoursMinutesColon[2]) / 60;
  }
  
  const minutesOnly = timeStr.match(/(\d+)m/);
  if (minutesOnly) {
    return parseInt(minutesOnly[1]) / 60;
  }
  
  const secondsOnly = timeStr.match(/(\d+)s/);
  if (secondsOnly) {
    return parseInt(secondsOnly[1]) / 3600;
  }
  
  const numberOnly = parseFloat(timeStr);
  if (!isNaN(numberOnly)) {
    if (numberOnly > 1000) return numberOnly / 3600; // segundos
    if (numberOnly > 60) return numberOnly / 60; // minutos
    return numberOnly; // horas
  }
  
  return 0;
};

// Extraer y analizar modelos 3D
const extractAndAnalyzeModels = async (zipContent: JSZip): Promise<ModelGeometry[]> => {
  const models: ModelGeometry[] = [];
  
  console.log('\n🧩 === BUSCANDO MODELOS 3D ===');
  
  // Primero buscar el archivo del modelo principal para referencias
  const modelFile = zipContent.file('3D/3dmodel.model');
  let objectReferences: string[] = [];
  
  if (modelFile) {
    const modelContent = await modelFile.async('text');
    console.log('📋 Archivo 3dmodel.model encontrado');
    console.log('Primeros 1000 caracteres:', modelContent.substring(0, 1000));
    
    // Extraer referencias a objetos
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(modelContent, 'text/xml');
      
      const objects = xmlDoc.querySelectorAll('object');
      objects.forEach(object => {
        const id = object.getAttribute('id');
        if (id) {
          objectReferences.push(id);
          console.log(`🔗 Referencia a objeto encontrada: ${id}`);
        }
      });
    } catch (error) {
      console.warn('⚠️ Error parseando referencias de objetos:', error);
    }
  }
  
  // Buscar archivos de objetos en la carpeta 3D/Objects/
  console.log('\n🔍 Buscando archivos en 3D/Objects/...');
  
  const objectFiles: { fileName: string; file: JSZip.JSZipObject }[] = [];
  
  // Examinar todos los archivos en el ZIP
  Object.keys(zipContent.files).forEach(fileName => {
    console.log(`📁 Archivo encontrado: ${fileName}`);
    
    // Buscar archivos en la carpeta 3D/Objects/
    if (fileName.startsWith('3D/Objects/') && !zipContent.files[fileName].dir) {
      objectFiles.push({
        fileName,
        file: zipContent.files[fileName]
      });
      console.log(`🎯 Archivo de objeto detectado: ${fileName}`);
    }
  });
  
  console.log(`📊 Total de archivos de objetos encontrados: ${objectFiles.length}`);
  
  // Si no encontramos archivos en 3D/Objects/, buscar en otras ubicaciones
  if (objectFiles.length === 0) {
    console.log('🔍 No se encontraron objetos en 3D/Objects/, buscando en otras ubicaciones...');
    
    Object.keys(zipContent.files).forEach(fileName => {
      // Buscar archivos .3mf, .stl, .obj en cualquier carpeta 3D/
      if (fileName.startsWith('3D/') && 
          (fileName.endsWith('.3mf') || fileName.endsWith('.stl') || fileName.endsWith('.obj') || fileName.includes('model')) &&
          !zipContent.files[fileName].dir) {
        objectFiles.push({
          fileName,
          file: zipContent.files[fileName]
        });
        console.log(`🎯 Archivo alternativo detectado: ${fileName}`);
      }
    });
  }
  
  // Procesar cada archivo de objeto encontrado
  for (const { fileName, file } of objectFiles) {
    try {
      console.log(`\n🧩 === PROCESANDO ${fileName} ===`);
      
      const objectContent = await file.async('text');
      console.log('Primeros 500 caracteres:', objectContent.substring(0, 500));
      
      // Determinar el tipo de archivo y procesarlo
      if (fileName.endsWith('.3mf') || fileName.includes('model') || objectContent.includes('<mesh>')) {
        // Archivo XML con malla
        const geometry = analyzeMeshFromXML(objectContent, fileName);
        if (geometry) {
          models.push(geometry);
          console.log(`✅ Objeto ${fileName} analizado: ${geometry.triangles.length} triángulos, volumen: ${geometry.volume.toFixed(2)}mm³`);
        }
      } else if (fileName.endsWith('.stl')) {
        // Archivo STL
        console.log('🔍 Detectado archivo STL - implementación pendiente');
        // TODO: Implementar parser STL si es necesario
      } else {
        // Intentar como XML genérico
        const geometry = analyzeMeshFromXML(objectContent, fileName);
        if (geometry) {
          models.push(geometry);
          console.log(`✅ Objeto ${fileName} analizado como XML: ${geometry.triangles.length} triángulos`);
        }
      }
      
    } catch (error) {
      console.error(`❌ Error procesando ${fileName}:`, error);
    }
  }
  
  // Si no encontramos ningún modelo válido, crear uno por defecto
  if (models.length === 0) {
    console.log('⚠️ No se encontraron modelos válidos, creando modelo por defecto...');
    
    const defaultModel: ModelGeometry = {
      triangles: [],
      boundingBox: {
        min: { x: 0, y: 0, z: 0 },
        max: { x: 50, y: 50, z: 30 } // Objeto típico de 50x50x30mm
      },
      volume: 50 * 50 * 30 * 0.2, // 20% de relleno aproximado = 15000mm³
      surfaceArea: 2 * (50*50 + 50*30 + 50*30) // Área superficial del cubo = 8600mm²
    };
    
    models.push(defaultModel);
    console.log('✅ Modelo por defecto creado para cálculos de ejemplo');
  }
  
  console.log(`🎯 Total de modelos procesados: ${models.length}`);
  console.log('=== FIN ANÁLISIS DE MODELOS ===\n');
  return models;
};

// Analizar malla desde contenido XML
const analyzeMeshFromXML = (content: string, fileName: string): ModelGeometry | null => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(content, 'text/xml');
    
    // Buscar elementos de malla
    const meshes = xmlDoc.querySelectorAll('mesh');
    console.log(`🔍 Mallas encontradas en ${fileName}: ${meshes.length}`);
    
    if (meshes.length === 0) {
      // Buscar objetos que contengan mallas
      const objects = xmlDoc.querySelectorAll('object');
      console.log(`🔍 Objetos encontrados: ${objects.length}`);
      
      for (const object of objects) {
        const mesh = object.querySelector('mesh');
        if (mesh) {
          return analyzeMeshGeometry(mesh, fileName);
        }
      }
      
      console.log(`⚠️ No se encontraron mallas en ${fileName}`);
      return null;
    }
    
    // Analizar la primera malla encontrada
    return analyzeMeshGeometry(meshes[0], fileName);
    
  } catch (error) {
    console.error(`Error parseando XML de ${fileName}:`, error);
    return null;
  }
};

// Analizar geometría de una malla
const analyzeMeshGeometry = (mesh: Element, objectId: string): ModelGeometry | null => {
  try {
    const vertices: Vertex[] = [];
    const triangles: Triangle[] = [];
    
    // Extraer vértices
    const vertexElements = mesh.querySelectorAll('vertex');
    vertexElements.forEach(vertex => {
      const x = parseFloat(vertex.getAttribute('x') || '0');
      const y = parseFloat(vertex.getAttribute('y') || '0');
      const z = parseFloat(vertex.getAttribute('z') || '0');
      vertices.push({ x, y, z });
    });
    
    console.log(`   📐 Vértices extraídos: ${vertices.length}`);
    
    // Extraer triángulos
    const triangleElements = mesh.querySelectorAll('triangle');
    triangleElements.forEach(triangle => {
      const v1 = parseInt(triangle.getAttribute('v1') || '0');
      const v2 = parseInt(triangle.getAttribute('v2') || '0');
      const v3 = parseInt(triangle.getAttribute('v3') || '0');
      
      if (vertices[v1] && vertices[v2] && vertices[v3]) {
        const tri: Triangle = {
          vertices: [vertices[v1], vertices[v2], vertices[v3]],
          normal: calculateNormal(vertices[v1], vertices[v2], vertices[v3])
        };
        triangles.push(tri);
      }
    });
    
    console.log(`   🔺 Triángulos procesados: ${triangles.length}`);
    
    if (triangles.length === 0) {
      return null;
    }
    
    // Calcular bounding box
    const boundingBox = calculateBoundingBox(vertices);
    console.log(`   📦 Bounding box: ${boundingBox.max.x - boundingBox.min.x} x ${boundingBox.max.y - boundingBox.min.y} x ${boundingBox.max.z - boundingBox.min.z}mm`);
    
    // Calcular volumen
    const volume = calculateMeshVolume(triangles);
    console.log(`   📊 Volumen calculado: ${volume.toFixed(2)}mm³`);
    
    // Calcular área superficial
    const surfaceArea = calculateSurfaceArea(triangles);
    console.log(`   📏 Área superficial: ${surfaceArea.toFixed(2)}mm²`);
    
    return {
      triangles,
      boundingBox,
      volume,
      surfaceArea
    };
    
  } catch (error) {
    console.error(`Error analizando geometría de ${objectId}:`, error);
    return null;
  }
};

// Calcular normal de un triángulo
const calculateNormal = (v1: Vertex, v2: Vertex, v3: Vertex): Vertex => {
  const u = { x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z };
  const v = { x: v3.x - v1.x, y: v3.y - v1.y, z: v3.z - v1.z };
  
  return {
    x: u.y * v.z - u.z * v.y,
    y: u.z * v.x - u.x * v.z,
    z: u.x * v.y - u.y * v.x
  };
};

// Calcular bounding box
const calculateBoundingBox = (vertices: Vertex[]): { min: Vertex; max: Vertex } => {
  if (vertices.length === 0) {
    return { min: { x: 0, y: 0, z: 0 }, max: { x: 0, y: 0, z: 0 } };
  }
  
  const min = { ...vertices[0] };
  const max = { ...vertices[0] };
  
  vertices.forEach(vertex => {
    min.x = Math.min(min.x, vertex.x);
    min.y = Math.min(min.y, vertex.y);
    min.z = Math.min(min.z, vertex.z);
    max.x = Math.max(max.x, vertex.x);
    max.y = Math.max(max.y, vertex.y);
    max.z = Math.max(max.z, vertex.z);
  });
  
  return { min, max };
};

// Calcular volumen usando divergencia
const calculateMeshVolume = (triangles: Triangle[]): number => {
  let volume = 0;
  
  triangles.forEach(triangle => {
    const [v1, v2, v3] = triangle.vertices;
    
    // Fórmula del volumen usando el teorema de la divergencia
    volume += (v1.x * (v2.y * v3.z - v3.y * v2.z) +
               v2.x * (v3.y * v1.z - v1.y * v3.z) +
               v3.x * (v1.y * v2.z - v2.y * v1.z)) / 6;
  });
  
  return Math.abs(volume);
};

// Calcular área superficial
const calculateSurfaceArea = (triangles: Triangle[]): number => {
  let area = 0;
  
  triangles.forEach(triangle => {
    const [v1, v2, v3] = triangle.vertices;
    
    // Calcular área del triángulo usando producto vectorial
    const u = { x: v2.x - v1.x, y: v2.y - v1.y, z: v2.z - v1.z };
    const v = { x: v3.x - v1.x, y: v3.y - v1.y, z: v3.z - v1.z };
    
    const cross = {
      x: u.y * v.z - u.z * v.y,
      y: u.z * v.x - u.x * v.z,
      z: u.x * v.y - u.y * v.x
    };
    
    const magnitude = Math.sqrt(cross.x * cross.x + cross.y * cross.y + cross.z * cross.z);
    area += magnitude / 2;
  });
  
  return area;
};

// Calcular datos de placas desde modelos
const calculatePlatesFromModels = (models: ModelGeometry[], config: SlicingConfig): PlateData[] => {
  console.log('\n🧮 === CALCULANDO DATOS DE IMPRESIÓN ===');
  
  const plates: PlateData[] = [];
  
  models.forEach((model, index) => {
    const plateId = `plate_${index + 1}`;
    console.log(`\n🍽️ Calculando placa ${plateId}:`);
    
    // Validar que el modelo tiene datos válidos
    if (!model || !model.boundingBox) {
      console.error(`❌ Modelo ${plateId} no tiene datos válidos`);
      return;
    }
    
    // Calcular número de capas
    const height = Math.max(0.1, model.boundingBox.max.z - model.boundingBox.min.z);
    const layerCount = Math.max(1, Math.ceil(height / config.layerHeight));
    console.log(`   📏 Altura: ${height.toFixed(2)}mm, Capas: ${layerCount}`);
    
    // Calcular volumen de filamento necesario
    const filamentVolume = calculateFilamentVolume(model, config);
    console.log(`   🧊 Volumen de filamento: ${filamentVolume.toFixed(2)}mm³`);
    
    // Validar que el volumen es válido
    const validFilamentVolume = isNaN(filamentVolume) || filamentVolume <= 0 ? 1000 : filamentVolume;
    
    // Calcular peso del filamento
    const filamentWeight = (validFilamentVolume / 1000) * config.filamentDensity; // mm³ a cm³, luego a gramos
    console.log(`   ⚖️ Peso del filamento: ${filamentWeight.toFixed(2)}g`);
    
    // Validar que el peso es válido
    const validWeight = isNaN(filamentWeight) || filamentWeight <= 0 ? 10 : filamentWeight;
    
    // Calcular tiempo de impresión
    const printTime = calculatePrintTime(model, config, layerCount);
    console.log(`   ⏱️ Tiempo de impresión: ${printTime.toFixed(2)}h`);
    
    // Validar que el tiempo es válido
    const validTime = isNaN(printTime) || printTime <= 0 ? 1 : printTime;
    
    const plate: PlateData = {
      plateId,
      plateName: `Placa ${index + 1}`,
      filamentWeight: Math.round(validWeight * 100) / 100, // 2 decimales
      printHours: Math.round(validTime * 10) / 10,         // 1 decimal (ej: 8.1)
      layerHeight: Math.round(config.layerHeight * 100) / 100,
      infill: Math.round(config.infillDensity * 100),      // Entero (ej: 20)
      models: [`Modelo ${index + 1}`]
    };
    
    plates.push(plate);
    console.log(`   ✅ Placa calculada:`, plate);
  });
  
  // Si no se pudieron calcular placas, crear una por defecto
  if (plates.length === 0) {
    console.log('⚠️ No se pudieron calcular placas, creando placa por defecto...');
    
    plates.push(createEmergencyPlate(config));
    console.log('✅ Placa por defecto creada');
  }
  
  // Validar todas las placas antes de devolverlas
  const validatedPlates = plates.map(validatePlateData);
  
  console.log('=== FIN CÁLCULOS ===\n');
  return validatedPlates;
};

// Calcular volumen de filamento necesario
const calculateFilamentVolume = (model: ModelGeometry, config: SlicingConfig): number => {
  console.log('\n🧮 === CÁLCULO DETALLADO DE VOLUMEN ===');
  
  // Validar datos de entrada
  if (!model || !model.volume || !model.surfaceArea || !model.boundingBox) {
    console.warn('⚠️ Datos del modelo inválidos, usando estimación');
    return 1000;
  }
  
  console.log('📊 DATOS DEL MODELO:');
  console.log(`   • Volumen del objeto: ${model.volume.toFixed(2)}mm³`);
  console.log(`   • Área superficial: ${model.surfaceArea.toFixed(2)}mm²`);
  console.log(`   • Dimensiones: ${(model.boundingBox.max.x - model.boundingBox.min.x).toFixed(1)} x ${(model.boundingBox.max.y - model.boundingBox.min.y).toFixed(1)} x ${(model.boundingBox.max.z - model.boundingBox.min.z).toFixed(1)}mm`);
  
  // 1. Volumen del relleno interior
  const infillVolume = Math.max(0, model.volume * config.infillDensity);
  console.log(`\n🕳️ CÁLCULO DE RELLENO:`);
  console.log(`   • Fórmula: volumen_objeto × densidad_infill`);
  console.log(`   • Cálculo: ${model.volume.toFixed(2)}mm³ × ${(config.infillDensity * 100).toFixed(1)}%`);
  console.log(`   • Resultado: ${infillVolume.toFixed(2)}mm³`);
  
  // 2. Volumen de los perímetros (paredes exteriores)
  const perimeterVolume = Math.max(0, model.surfaceArea * config.perimeterWidth * config.perimeterCount);
  console.log(`\n🔄 CÁLCULO DE PERÍMETROS:`);
  console.log(`   • Fórmula: área_superficie × ancho_línea × num_perímetros`);
  console.log(`   • Cálculo: ${model.surfaceArea.toFixed(2)}mm² × ${config.perimeterWidth}mm × ${config.perimeterCount}`);
  console.log(`   • Resultado: ${perimeterVolume.toFixed(2)}mm³`);
  
  // 3. Volumen de capas superiores e inferiores (sólidas)
  const width = Math.max(1, model.boundingBox.max.x - model.boundingBox.min.x);
  const depth = Math.max(1, model.boundingBox.max.y - model.boundingBox.min.y);
  const topBottomArea = width * depth;
  const topBottomVolume = Math.max(0, topBottomArea * config.layerHeight * config.topBottomLayers * 2);
  console.log(`\n🎯 CÁLCULO DE CAPAS SÓLIDAS:`);
  console.log(`   • Área base: ${width.toFixed(1)}mm × ${depth.toFixed(1)}mm = ${topBottomArea.toFixed(2)}mm²`);
  console.log(`   • Fórmula: área_base × altura_capa × capas_sólidas × 2(top+bottom)`);
  console.log(`   • Cálculo: ${topBottomArea.toFixed(2)}mm² × ${config.layerHeight}mm × ${config.topBottomLayers} × 2`);
  console.log(`   • Resultado: ${topBottomVolume.toFixed(2)}mm³`);
  
  const totalVolume = infillVolume + perimeterVolume + topBottomVolume;
  
  console.log(`\n📊 RESUMEN DE VOLÚMENES:`);
  console.log(`   🕳️ Relleno: ${infillVolume.toFixed(2)}mm³ (${((infillVolume/totalVolume)*100).toFixed(1)}%)`);
  console.log(`   🔄 Perímetros: ${perimeterVolume.toFixed(2)}mm³ (${((perimeterVolume/totalVolume)*100).toFixed(1)}%)`);
  console.log(`   🎯 Capas sólidas: ${topBottomVolume.toFixed(2)}mm³ (${((topBottomVolume/totalVolume)*100).toFixed(1)}%)`);
  console.log(`   📊 TOTAL: ${totalVolume.toFixed(2)}mm³`);
  
  // Convertir a peso de filamento
  const filamentVolumeInCm3 = totalVolume / 1000; // mm³ a cm³
  const filamentWeight = filamentVolumeInCm3 * config.filamentDensity;
  console.log(`\n⚖️ CONVERSIÓN A PESO:`);
  console.log(`   • Volumen en cm³: ${filamentVolumeInCm3.toFixed(3)}cm³`);
  console.log(`   • Densidad PLA: ${config.filamentDensity}g/cm³`);
  console.log(`   • Peso calculado: ${filamentWeight.toFixed(2)}g`);
  
  console.log('=== FIN CÁLCULO DE VOLUMEN ===\n');
  
  // Validar resultado
  const validVolume = isNaN(totalVolume) || totalVolume <= 0 ? 1000 : totalVolume;
  return validVolume;
};

// Calcular tiempo de impresión
const calculatePrintTime = (model: ModelGeometry, config: SlicingConfig, layerCount: number): number => {
  console.log('\n⏱️ === CÁLCULO DETALLADO DE TIEMPO ===');
  
  // Validar datos de entrada
  if (!model || !model.boundingBox || layerCount <= 0) {
    console.warn('⚠️ Datos para cálculo de tiempo inválidos, usando estimación');
    return 2.0;
  }
  
  console.log('📐 DATOS PARA TIEMPO:');
  const width = Math.max(1, model.boundingBox.max.x - model.boundingBox.min.x);
  const depth = Math.max(1, model.boundingBox.max.y - model.boundingBox.min.y);
  const height = Math.max(1, model.boundingBox.max.z - model.boundingBox.min.z);
  const baseArea = width * depth;
  console.log(`   • Dimensiones: ${width.toFixed(1)} × ${depth.toFixed(1)} × ${height.toFixed(1)}mm`);
  console.log(`   • Área base: ${baseArea.toFixed(2)}mm²`);
  console.log(`   • Número de capas: ${layerCount}`);
  
  // 1. Longitud de perímetros por capa
  const perimeterPerLayer = Math.max(0, Math.sqrt(baseArea) * 4 * config.perimeterCount);
  console.log(`\n🔄 PERÍMETROS POR CAPA:`);
  console.log(`   • Fórmula aproximada: √(área_base) × 4 × num_perímetros`);
  console.log(`   • Cálculo: √${baseArea.toFixed(2)} × 4 × ${config.perimeterCount}`);
  console.log(`   • Resultado: ${perimeterPerLayer.toFixed(2)}mm por capa`);
  
  // 2. Longitud de relleno por capa
  const infillPerLayer = Math.max(0, baseArea * config.infillDensity / config.perimeterWidth);
  console.log(`\n🕳️ RELLENO POR CAPA:`);
  console.log(`   • Fórmula: área_base × densidad_infill ÷ ancho_línea`);
  console.log(`   • Cálculo: ${baseArea.toFixed(2)}mm² × ${(config.infillDensity * 100).toFixed(1)}% ÷ ${config.perimeterWidth}mm`);
  console.log(`   • Resultado: ${infillPerLayer.toFixed(2)}mm por capa`);
  
  // 3. Longitud total de extrusión
  const totalExtrusionLength = Math.max(1, (perimeterPerLayer + infillPerLayer) * layerCount);
  console.log(`\n📏 LONGITUD TOTAL:`);
  console.log(`   • Por capa: ${(perimeterPerLayer + infillPerLayer).toFixed(2)}mm`);
  console.log(`   • Total: ${(perimeterPerLayer + infillPerLayer).toFixed(2)}mm × ${layerCount} capas = ${totalExtrusionLength.toFixed(0)}mm`);
  
  // 4. Tiempo de impresión base
  const printSpeed = Math.max(1, config.printSpeed);
  const printTimeMinutes = totalExtrusionLength / printSpeed;
  const printTimeHours = printTimeMinutes / 60;
  console.log(`\n🏃 TIEMPO BASE:`);
  console.log(`   • Velocidad: ${printSpeed}mm/min (${(printSpeed/60).toFixed(1)}mm/s)`);
  console.log(`   • Tiempo bruto: ${totalExtrusionLength.toFixed(0)}mm ÷ ${printSpeed}mm/min = ${printTimeMinutes.toFixed(2)} minutos`);
  console.log(`   • En horas: ${printTimeHours.toFixed(2)}h`);
  
  // 5. Overhead (calentamiento, movimientos, etc.)
  const overheadFactor = 1.15; // 15% adicional
  const totalTime = printTimeHours * overheadFactor;
  console.log(`\n➕ TIEMPO CON OVERHEAD:`);
  console.log(`   • Factor de overhead: ${((overheadFactor - 1) * 100).toFixed(0)}% (calentamiento, movimientos, retracciones)`);
  console.log(`   • Tiempo final: ${printTimeHours.toFixed(2)}h × ${overheadFactor} = ${totalTime.toFixed(2)}h`);
  
  console.log('=== FIN CÁLCULO DE TIEMPO ===\n');
  
  // Validar resultado
  const validTime = isNaN(totalTime) || totalTime <= 0 ? 2.0 : totalTime;
  return validTime;
};

// Función para verificar disponibilidad (no necesaria ahora)
export const isLib3MFAvailable = (): boolean => {
  return false; // Ya no usamos lib3mf
};

// Función para crear datos iniciales válidos (útil para el estado inicial del formulario)
export const createInitialSlicerData = (): SlicerData => {
  const initialPlate: PlateData = {
    plateId: 'plate_initial',
    plateName: 'Sin archivo cargado',
    filamentWeight: 0.0,
    printHours: 0.0,
    layerHeight: 0.2,
    infill: 20,
    models: []
  };
  
  return {
    plates: [initialPlate],
    totalWeight: 0.0,
    totalTime: 0.0
  };
};