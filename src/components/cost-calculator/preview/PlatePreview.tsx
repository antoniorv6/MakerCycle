'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Loader2, Box, Image as ImageIcon } from 'lucide-react';
import { useGcodePreview } from '../hooks/useGcodePreview';
import type { GcodeViewerProps } from './GcodeViewer';

const GcodeViewer = dynamic<GcodeViewerProps>(
  () => import('./GcodeViewer'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center bg-slate-100 rounded-lg w-full h-[200px]">
        <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
      </div>
    ),
  }
);

interface PlatePreviewProps {
  plateId: number;
  /** Contenido gcode raw para el visor 3D */
  gcodeContent?: string;
  /** Thumbnail extraido del 3MF como data URL */
  thumbnailDataUrl?: string;
  /** Color principal del filamento (monocolor fallback) */
  filamentColor?: string;
  /** Colores hex de todos los filamentos por indice de herramienta (T0, T1...) para multicolor */
  filamentColors?: string[];
}

type ViewMode = 'thumbnail' | '3d';

export default function PlatePreview({
  gcodeContent,
  thumbnailDataUrl,
  filamentColor,
  filamentColors,
}: PlatePreviewProps) {
  const hasThumbnail = !!thumbnailDataUrl;
  const hasGcode = !!gcodeContent;
  const [viewMode, setViewMode] = useState<ViewMode>(hasThumbnail ? 'thumbnail' : '3d');
  const [show3D, setShow3D] = useState(!hasThumbnail && hasGcode);

  const { toolpath, isLoading, error, progress } = useGcodePreview({
    gcodeContent: gcodeContent ?? null,
    enabled: show3D && viewMode === '3d',
    filamentColors,
  });

  // Sin thumbnail ni gcode (ej: .bgcode)
  if (!hasThumbnail && !hasGcode) {
    return (
      <div className="flex flex-col items-center justify-center bg-slate-100 rounded-lg w-full h-[200px] text-slate-400">
        <Box className="w-8 h-8 mb-2" />
        <p className="text-xs">Vista previa no disponible</p>
      </div>
    );
  }

  return (
    <div className="relative w-full">
      {/* Vista Thumbnail */}
      {viewMode === 'thumbnail' && hasThumbnail && (
        <div className="relative w-full h-[200px] rounded-lg overflow-hidden bg-slate-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailDataUrl}
            alt="Vista previa de la placa"
            className="w-full h-full object-contain"
          />
        </div>
      )}

      {/* Vista 3D */}
      {viewMode === '3d' && (
        <div className="relative w-full h-[200px]">
          {isLoading && (
            <div className="flex flex-col items-center justify-center bg-slate-100 rounded-lg w-full h-full">
              <Loader2 className="w-6 h-6 text-emerald-500 animate-spin mb-2" />
              <p className="text-xs text-slate-500">Procesando G-code... {progress}%</p>
              <div className="w-24 h-1.5 bg-slate-200 rounded-full mt-2">
                <div
                  className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
          )}
          {error && (
            <div className="flex flex-col items-center justify-center bg-red-50 rounded-lg w-full h-full">
              <p className="text-xs text-red-500">{error}</p>
            </div>
          )}
          {toolpath && !isLoading && !error && (
            <GcodeViewer
              toolpath={toolpath}
              filamentColor={filamentColor}
              height={200}
            />
          )}
          {!toolpath && !isLoading && !error && (
            <div className="flex flex-col items-center justify-center bg-slate-100 rounded-lg w-full h-full">
              <Loader2 className="w-6 h-6 text-slate-400 animate-spin" />
            </div>
          )}
        </div>
      )}

      {/* Botones de toggle */}
      {hasThumbnail && hasGcode && (
        <div className="absolute top-2 right-2 flex gap-1">
          {viewMode === 'thumbnail' ? (
            <button
              onClick={() => { setViewMode('3d'); setShow3D(true); }}
              className="flex items-center gap-1 px-2 py-1 bg-white/90 hover:bg-white text-slate-700 rounded text-xs font-medium shadow-sm border border-slate-200 transition-colors"
              title="Ver modelo 3D interactivo"
            >
              <Box className="w-3 h-3" />
              3D
            </button>
          ) : (
            <button
              onClick={() => setViewMode('thumbnail')}
              className="flex items-center gap-1 px-2 py-1 bg-white/90 hover:bg-white text-slate-700 rounded text-xs font-medium shadow-sm border border-slate-200 transition-colors"
              title="Ver imagen del slicer"
            >
              <ImageIcon className="w-3 h-3" />
              Imagen
            </button>
          )}
        </div>
      )}

      {/* Boton Ver en 3D cuando solo hay gcode y no se ha activado */}
      {!hasThumbnail && hasGcode && !show3D && (
        <button
          onClick={() => { setShow3D(true); setViewMode('3d'); }}
          className="absolute inset-0 flex flex-col items-center justify-center bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
        >
          <Box className="w-8 h-8 text-slate-500 mb-2" />
          <span className="text-xs font-medium text-slate-600">Ver en 3D</span>
        </button>
      )}
    </div>
  );
}
