'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { GcodeToolpath } from '@/lib/gcode_parser';

const GcodeViewerCanvas = dynamic(
  () => import('./GcodeViewerCanvas'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center bg-slate-100 w-full h-full">
        <p className="text-sm text-slate-400">Cargando visor 3D...</p>
      </div>
    ),
  }
);

export interface GcodeViewerProps {
  toolpath: GcodeToolpath;
  filamentColor?: string;
  width?: number | string;
  height?: number | string;
  className?: string;
}

export default function GcodeViewer({
  toolpath,
  filamentColor,
  width = '100%',
  height = 200,
  className,
}: GcodeViewerProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (toolpath.vertexCount === 0) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 rounded-lg ${className || ''}`}
        style={{ width, height }}
      >
        <p className="text-sm text-slate-400">Sin datos de toolpath</p>
      </div>
    );
  }

  if (!isMounted) {
    return (
      <div
        className={`flex items-center justify-center bg-slate-100 rounded-lg ${className || ''}`}
        style={{ width, height }}
      >
        <p className="text-sm text-slate-400">Cargando visor 3D...</p>
      </div>
    );
  }

  return (
    <div className={`rounded-lg overflow-hidden ${className || ''}`} style={{ width, height }}>
      <GcodeViewerCanvas toolpath={toolpath} filamentColor={filamentColor} />
    </div>
  );
}
