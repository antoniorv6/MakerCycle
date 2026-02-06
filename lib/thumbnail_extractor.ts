/**
 * Extractor de thumbnails desde archivos .gcode.3mf
 * Los slicers como OrcaSlicer y BambuStudio embeben imagenes PNG por placa
 */

export interface PlateThumbnail {
  plateId: number;
  imageDataUrl: string;
}

/**
 * Extrae thumbnails de un archivo .gcode.3mf
 * Busca imagenes PNG en las rutas conocidas de los slicers
 */
export async function extractThumbnails(file: File): Promise<Map<number, string>> {
  const thumbnails = new Map<number, string>();

  if (!file.name.toLowerCase().endsWith('.gcode.3mf')) {
    return thumbnails;
  }

  try {
    const JSZip = (await import('jszip')).default;
    const zip = await JSZip.loadAsync(file);

    // Rutas conocidas de thumbnails por slicer
    // OrcaSlicer/BambuStudio: Metadata/plate_N.png, Metadata/top_N.png
    // Tambien puede estar en: Thumbnails/, thumbnails/
    const allFiles = Object.keys(zip.files);

    // Buscar thumbnails por placa con patrones conocidos
    const thumbnailPatterns = [
      /^Metadata\/plate_(\d+)\.png$/i,
      /^Metadata\/top_(\d+)\.png$/i,
      /^Metadata\/plate_(\d+)_thumbnail\.png$/i,
      /^Thumbnails\/plate_(\d+)\.png$/i,
      /^thumbnails\/plate_(\d+)\.png$/i,
    ];

    // Mapa para rastrear que thumbnails ya encontramos (prioridad al primer match)
    const foundPlates = new Set<number>();

    for (const pattern of thumbnailPatterns) {
      for (const filePath of allFiles) {
        const match = filePath.match(pattern);
        if (match) {
          const plateId = parseInt(match[1]);
          if (!foundPlates.has(plateId)) {
            const data = await zip.files[filePath].async('uint8array');
            const base64 = uint8ArrayToBase64(data);
            thumbnails.set(plateId, `data:image/png;base64,${base64}`);
            foundPlates.add(plateId);
          }
        }
      }
    }

    // Si no se encontraron thumbnails por placa, buscar thumbnail generico
    if (thumbnails.size === 0) {
      const genericPatterns = [
        /^Metadata\/thumbnail[^/]*\.png$/i,
        /^Thumbnails\/[^/]+\.png$/i,
        /^thumbnails\/[^/]+\.png$/i,
      ];

      for (const pattern of genericPatterns) {
        for (const filePath of allFiles) {
          if (pattern.test(filePath)) {
            const data = await zip.files[filePath].async('uint8array');
            const base64 = uint8ArrayToBase64(data);
            // Asignar al plate 1 como fallback
            thumbnails.set(1, `data:image/png;base64,${base64}`);
            return thumbnails;
          }
        }
      }
    }
  } catch (err) {
    console.warn('Error extrayendo thumbnails del archivo 3MF:', err);
  }

  return thumbnails;
}

function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}
