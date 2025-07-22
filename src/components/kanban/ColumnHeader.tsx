import React from 'react';
import { PauseCircle, PlayCircle, CheckCircle2 } from 'lucide-react';
import type { KanbanStatus } from '@/types';

const statusInfo: Record<KanbanStatus, { label: string; color: string; icon: React.ReactNode; tooltip: string }> = {
  pending: {
    label: 'Pendiente',
    color: 'text-yellow-500',
    icon: <PauseCircle className="w-7 h-7 text-yellow-400" />,
    tooltip: 'Proyectos aún no iniciados',
  },
  in_progress: {
    label: 'En desarrollo',
    color: 'text-blue-600',
    icon: <PlayCircle className="w-7 h-7 text-blue-500" />,
    tooltip: 'Proyectos en curso',
  },
  completed: {
    label: 'Completado',
    color: 'text-green-600',
    icon: <CheckCircle2 className="w-7 h-7 text-green-500" />,
    tooltip: 'Proyectos finalizados',
  },
};

interface ColumnHeaderProps {
  status: KanbanStatus;
  count: number;
}

export const ColumnHeader: React.FC<ColumnHeaderProps> = ({ status, count }) => {
  const info = statusInfo[status];
  return (
    <div className="flex items-center gap-3 mb-4" title={info.tooltip} aria-label={info.label}>
      <span>{info.icon}</span>
      <h2 className={`text-xl font-bold ${info.color}`}>{info.label}</h2>
      <span className="ml-2 inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200" title={`Proyectos en esta columna`}>{count}</span>
    </div>
  );
}; 