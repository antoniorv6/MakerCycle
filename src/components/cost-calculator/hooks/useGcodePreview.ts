import { useState, useEffect, useRef, useCallback } from 'react';
import type { GcodeToolpath } from '@/lib/gcode_parser';

interface UseGcodePreviewOptions {
  /** Contenido gcode raw para parsear */
  gcodeContent: string | null;
  /** Solo parsear cuando enabled es true (default: false) */
  enabled?: boolean;
  /** Maximo de vertices (default: 80000, 50000 en movil) */
  maxVertices?: number;
  /** Colores hex de los filamentos por indice de herramienta para multicolor */
  filamentColors?: string[];
}

interface UseGcodePreviewResult {
  toolpath: GcodeToolpath | null;
  isLoading: boolean;
  error: string | null;
  progress: number;
}

export function useGcodePreview(options: UseGcodePreviewOptions): UseGcodePreviewResult {
  const { gcodeContent, enabled = false, maxVertices, filamentColors } = options;
  const [toolpath, setToolpath] = useState<GcodeToolpath | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const abortRef = useRef<AbortController | null>(null);
  const parsedContentRef = useRef<string | null>(null);

  const reset = useCallback(() => {
    setToolpath(null);
    setIsLoading(false);
    setError(null);
    setProgress(0);
    parsedContentRef.current = null;
  }, []);

  useEffect(() => {
    // Si no esta habilitado o no hay contenido, no hacer nada
    if (!enabled || !gcodeContent) {
      return;
    }

    // Si ya parseamos este contenido, no re-parsear
    if (parsedContentRef.current === gcodeContent && toolpath) {
      return;
    }

    // Cancelar parsing anterior si existe
    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;

    setIsLoading(true);
    setError(null);
    setProgress(0);

    // Detectar movil para reducir vertices
    const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
    const effectiveMaxVertices = maxVertices ?? (isMobile ? 50_000 : 80_000);

    // Import dinamico del parser para no cargarlo si no se usa
    import('@/lib/gcode_parser')
      .then(({ parseGcodeToolpath }) =>
        parseGcodeToolpath(gcodeContent, {
          maxVertices: effectiveMaxVertices,
          onProgress: setProgress,
          signal: controller.signal,
          filamentColors,
        })
      )
      .then((result) => {
        if (!controller.signal.aborted) {
          setToolpath(result);
          setIsLoading(false);
          setProgress(100);
          parsedContentRef.current = gcodeContent;
        }
      })
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.error('Error parseando gcode para preview:', err);
          setError('Error al procesar el G-code para vista 3D');
          setIsLoading(false);
        }
      });

    return () => {
      controller.abort();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, gcodeContent, maxVertices]);

  // Reset cuando cambia el contenido
  useEffect(() => {
    if (gcodeContent !== parsedContentRef.current) {
      reset();
    }
  }, [gcodeContent, reset]);

  return { toolpath, isLoading, error, progress };
}
