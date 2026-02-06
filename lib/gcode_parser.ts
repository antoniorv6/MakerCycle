/**
 * Parser de coordenadas G-code para generar toolpaths 3D
 * Extrae segmentos de extrusion (G1 con E creciente) para visualizacion con Three.js
 * Soporta multicolor rastreando cambios de herramienta (T0, T1, T2...)
 */

export interface GcodeBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export interface GcodeToolpath {
  /** Vertices como Float32Array plano: [x1,y1,z1, x2,y2,z2, ...] en convencion Three.js (Y=arriba) */
  vertices: Float32Array;
  /** Colores por vertice como Float32Array plano: [r1,g1,b1, r2,g2,b2, ...] (0-1). Null si monocolor */
  colors: Float32Array | null;
  /** Limites del modelo en espacio Three.js */
  bounds: GcodeBounds;
  /** Numero de capas detectadas */
  layerCount: number;
  /** Numero de vertices en el array */
  vertexCount: number;
  /** True si se detectaron multiples herramientas/colores */
  isMultiColor: boolean;
}

export interface GcodeParserOptions {
  /** Maximo de vertices a generar (default: 80000) */
  maxVertices?: number;
  /** Callback de progreso (0-100) */
  onProgress?: (percent: number) => void;
  /** Senal de cancelacion */
  signal?: AbortSignal;
  /**
   * Colores hex de los filamentos indexados por herramienta (T0, T1, T2...).
   * Ej: ['#FF0000', '#00FF00', '#0000FF']
   * Si no se proporcionan, se usa un color por defecto.
   */
  filamentColors?: string[];
}

/** Color por defecto cuando no se proporcionan colores */
const DEFAULT_COLOR = '#4f9cf5';

/** Paleta de colores por defecto para multi-herramienta sin colores definidos */
const FALLBACK_PALETTE = [
  '#4f9cf5', // azul
  '#ef4444', // rojo
  '#22c55e', // verde
  '#f59e0b', // amarillo
  '#a855f7', // morado
  '#ec4899', // rosa
  '#06b6d4', // cyan
  '#f97316', // naranja
];

const DEFAULT_MAX_VERTICES = 80_000;
const YIELD_INTERVAL = 50_000;

/** Convierte color hex (#RRGGBB) a RGB normalizado (0-1) */
function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  const r = parseInt(clean.substring(0, 2), 16) / 255;
  const g = parseInt(clean.substring(2, 4), 16) / 255;
  const b = parseInt(clean.substring(4, 6), 16) / 255;
  return [r, g, b];
}

/**
 * Parsea el contenido gcode y extrae toolpath para visualizacion 3D
 * Solo procesa movimientos de extrusion (G1 con E creciente)
 * Rastreo de cambios de herramienta (T0, T1...) para soporte multicolor
 * Usa sampling adaptativo para limitar vertices
 */
export async function parseGcodeToolpath(
  gcodeContent: string,
  options: GcodeParserOptions = {}
): Promise<GcodeToolpath> {
  const maxVertices = options.maxVertices ?? DEFAULT_MAX_VERTICES;
  const onProgress = options.onProgress;
  const signal = options.signal;
  const filamentColors = options.filamentColors;

  const lines = gcodeContent.split('\n');
  const totalLines = lines.length;

  // Primera pasada rapida: contar movimientos y detectar si hay cambios de herramienta
  let moveCount = 0;
  const toolsUsed = new Set<number>();
  for (let i = 0; i < totalLines; i++) {
    const line = lines[i];
    const firstChar = line.charAt(0);
    if (firstChar === 'G' || firstChar === 'g') {
      const cmd = line.substring(0, 3).toUpperCase();
      if (cmd === 'G1 ' || cmd === 'G0 ' || cmd === 'G1\t' || cmd === 'G0\t') {
        moveCount++;
      }
    } else if (firstChar === 'T' || firstChar === 't') {
      // Detectar tool change: T0, T1, T2...
      const toolNum = parseInt(line.substring(1));
      if (!isNaN(toolNum) && toolNum >= 0 && toolNum < 20) {
        toolsUsed.add(toolNum);
      }
    }
  }

  const isMultiColor = toolsUsed.size > 1;

  // Construir tabla de colores RGB por herramienta
  const toolColorMap: Map<number, [number, number, number]> = new Map();
  if (isMultiColor) {
    const sortedTools = Array.from(toolsUsed).sort((a, b) => a - b);
    for (let idx = 0; idx < sortedTools.length; idx++) {
      const toolId = sortedTools[idx];
      let hex: string;
      if (filamentColors && filamentColors[toolId]) {
        hex = filamentColors[toolId];
      } else if (filamentColors && filamentColors[idx]) {
        // Fallback: usar el indice en el array si no coincide con toolId
        hex = filamentColors[idx];
      } else {
        hex = FALLBACK_PALETTE[idx % FALLBACK_PALETTE.length];
      }
      toolColorMap.set(toolId, hexToRgb(hex));
    }
  }

  // Calcular tasa de muestreo
  const maxSegments = Math.floor(maxVertices / 2);
  const sampleRate = moveCount > maxSegments ? Math.ceil(moveCount / maxSegments) : 1;

  // Buffers temporales
  const maxFloats = maxVertices * 3;
  const tempVertices = new Float32Array(maxFloats);
  const tempColors = isMultiColor ? new Float32Array(maxFloats) : null;

  let vertexCount = 0;
  let floatIndex = 0;
  let colorIndex = 0;

  // Estado del parser
  let curX = 0, curY = 0, curZ = 0, curE = 0;
  let prevX = 0, prevY = 0, prevZ = 0;
  let lastZ = -1;
  let layerCount = 0;
  let extrusionMoveIndex = 0;
  let activeTool = 0;

  // Bounds
  let minX = Infinity, maxBX = -Infinity;
  let minY = Infinity, maxBY = -Infinity;
  let minZ = Infinity, maxBZ = -Infinity;

  // Color activo (RGB 0-1)
  const defaultRgb = hexToRgb(DEFAULT_COLOR);
  let activeR = defaultRgb[0], activeG = defaultRgb[1], activeB = defaultRgb[2];

  for (let i = 0; i < totalLines; i++) {
    if (signal?.aborted) {
      throw new DOMException('Parsing cancelled', 'AbortError');
    }

    // Yield al main thread periodicamente
    if (i > 0 && i % YIELD_INTERVAL === 0) {
      if (onProgress) {
        onProgress(Math.round((i / totalLines) * 100));
      }
      await new Promise<void>(resolve => setTimeout(resolve, 0));
    }

    const line = lines[i];
    if (!line) continue;

    const trimmed = line.trimStart();
    if (trimmed.length === 0) continue;

    const firstChar = trimmed.charAt(0);

    // Detectar cambio de herramienta: T0, T1, T2...
    if (firstChar === 'T' || firstChar === 't') {
      const toolNum = parseInt(trimmed.substring(1));
      if (!isNaN(toolNum) && toolNum >= 0 && toolNum < 20) {
        activeTool = toolNum;
        if (isMultiColor) {
          const rgb = toolColorMap.get(activeTool) ?? defaultRgb;
          activeR = rgb[0];
          activeG = rgb[1];
          activeB = rgb[2];
        }
      }
      continue;
    }

    // Solo procesar G0/G1
    if (firstChar !== 'G' && firstChar !== 'g') continue;
    if (trimmed.length < 3) continue;
    const firstTwo = trimmed.substring(0, 2).toUpperCase();
    if (firstTwo !== 'G0' && firstTwo !== 'G1') continue;

    const thirdChar = trimmed.charAt(2);
    if (thirdChar !== ' ' && thirdChar !== '\t' && thirdChar !== '0' && thirdChar !== '1' && thirdChar !== ';') {
      if (thirdChar >= '2' && thirdChar <= '9') continue;
    }

    const isG1 = firstTwo === 'G1';

    // Parsear parametros
    let newX = curX, newY = curY, newZ = curZ, newE = curE;
    let hasZ = false, hasE = false;

    const len = trimmed.length;
    let j = 2;
    while (j < len) {
      const ch = trimmed.charAt(j);
      if (ch === ';') break;

      if (ch === 'X' || ch === 'x') {
        const val = parseNextFloat(trimmed, j + 1);
        if (val !== null) { newX = val.value; j = val.endIndex; continue; }
      } else if (ch === 'Y' || ch === 'y') {
        const val = parseNextFloat(trimmed, j + 1);
        if (val !== null) { newY = val.value; j = val.endIndex; continue; }
      } else if (ch === 'Z' || ch === 'z') {
        const val = parseNextFloat(trimmed, j + 1);
        if (val !== null) { newZ = val.value; hasZ = true; j = val.endIndex; continue; }
      } else if (ch === 'E' || ch === 'e') {
        const val = parseNextFloat(trimmed, j + 1);
        if (val !== null) { newE = val.value; hasE = true; j = val.endIndex; continue; }
      }
      j++;
    }

    // Detectar cambio de capa
    if (hasZ && newZ !== lastZ) {
      layerCount++;
      lastZ = newZ;
    }

    // Solo incluir segmentos de extrusion (G1 con E creciente)
    const isExtrusion = isG1 && hasE && newE > curE;

    if (isExtrusion) {
      extrusionMoveIndex++;

      if (extrusionMoveIndex % sampleRate === 0 && vertexCount < maxVertices - 1) {
        // Convertir a convencion Three.js: X=X, Y=Z(gcode), Z=-Y(gcode)
        const v1x = prevX;
        const v1y = prevZ;
        const v1z = -prevY;
        const v2x = newX;
        const v2y = newZ;
        const v2z = -newY;

        tempVertices[floatIndex++] = v1x;
        tempVertices[floatIndex++] = v1y;
        tempVertices[floatIndex++] = v1z;
        tempVertices[floatIndex++] = v2x;
        tempVertices[floatIndex++] = v2y;
        tempVertices[floatIndex++] = v2z;
        vertexCount += 2;

        // Colores por vertice (2 vertices por segmento, mismo color)
        if (tempColors) {
          tempColors[colorIndex++] = activeR;
          tempColors[colorIndex++] = activeG;
          tempColors[colorIndex++] = activeB;
          tempColors[colorIndex++] = activeR;
          tempColors[colorIndex++] = activeG;
          tempColors[colorIndex++] = activeB;
        }

        // Actualizar bounds
        if (v1x < minX) minX = v1x; if (v1x > maxBX) maxBX = v1x;
        if (v1y < minY) minY = v1y; if (v1y > maxBY) maxBY = v1y;
        if (v1z < minZ) minZ = v1z; if (v1z > maxBZ) maxBZ = v1z;
        if (v2x < minX) minX = v2x; if (v2x > maxBX) maxBX = v2x;
        if (v2y < minY) minY = v2y; if (v2y > maxBY) maxBY = v2y;
        if (v2z < minZ) minZ = v2z; if (v2z > maxBZ) maxBZ = v2z;
      }
    }

    // Actualizar posicion actual
    prevX = curX; prevY = curY; prevZ = curZ;
    curX = newX; curY = newY; curZ = newZ; curE = newE;
  }

  if (onProgress) {
    onProgress(100);
  }

  // Crear arrays finales con el tamano exacto
  const finalVertices = new Float32Array(floatIndex);
  finalVertices.set(tempVertices.subarray(0, floatIndex));

  let finalColors: Float32Array | null = null;
  if (tempColors && colorIndex > 0) {
    finalColors = new Float32Array(colorIndex);
    finalColors.set(tempColors.subarray(0, colorIndex));
  }

  // Manejar caso sin vertices
  if (vertexCount === 0) {
    return {
      vertices: new Float32Array(0),
      colors: null,
      bounds: { minX: 0, maxX: 0, minY: 0, maxY: 0, minZ: 0, maxZ: 0 },
      layerCount: 0,
      vertexCount: 0,
      isMultiColor: false,
    };
  }

  return {
    vertices: finalVertices,
    colors: finalColors,
    bounds: {
      minX, maxX: maxBX,
      minY, maxY: maxBY,
      minZ, maxZ: maxBZ,
    },
    layerCount,
    vertexCount,
    isMultiColor,
  };
}

/** Parsea un float empezando en la posicion dada */
function parseNextFloat(str: string, startIndex: number): { value: number; endIndex: number } | null {
  const len = str.length;
  let i = startIndex;

  // Saltar espacios
  while (i < len && str.charAt(i) === ' ') i++;

  const start = i;
  // Aceptar signo negativo
  if (i < len && (str.charAt(i) === '-' || str.charAt(i) === '+')) i++;

  let hasDigit = false;
  while (i < len) {
    const ch = str.charAt(i);
    if (ch >= '0' && ch <= '9') {
      hasDigit = true;
      i++;
    } else if (ch === '.') {
      i++;
    } else {
      break;
    }
  }

  if (!hasDigit) return null;

  const value = parseFloat(str.substring(start, i));
  if (isNaN(value)) return null;

  return { value, endIndex: i };
}
