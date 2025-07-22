import React, { useRef, useState, useEffect } from 'react';
import { Trash2, Flag, Calendar, PauseCircle, PlayCircle, CheckCircle2 } from 'lucide-react';
import type { KanbanCard, KanbanStatus } from '@/types';

interface ProjectCardProps {
  card: KanbanCard;
  onDelete: (id: string) => void;
  onChangePriority: (id: string, newValue: number) => void;
  isDragging: boolean;
}

const statusInfo: Record<KanbanStatus, { label: string; color: string; icon: React.ReactNode }> = {
  pending: {
    label: 'Pendiente',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: <PauseCircle className="w-4 h-4 mr-1 text-yellow-400" />,
  },
  in_progress: {
    label: 'En desarrollo',
    color: 'bg-blue-100 text-blue-800 border-blue-200',
    icon: <PlayCircle className="w-4 h-4 mr-1 text-blue-500" />,
  },
  completed: {
    label: 'Completado',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: <CheckCircle2 className="w-4 h-4 mr-1 text-green-500" />,
  },
};

function getPriorityInfo(margin?: number) {
  if (typeof margin !== 'number') return { label: 'Baja', color: 'bg-slate-100 text-slate-500 border-slate-200' };
  if (margin >= 30) return { label: 'Alta', color: 'bg-red-100 text-red-700 border-red-200' };
  if (margin >= 15) return { label: 'Media', color: 'bg-orange-100 text-orange-700 border-orange-200' };
  return { label: 'Baja', color: 'bg-slate-100 text-slate-500 border-slate-200' };
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ card, onDelete, onChangePriority, isDragging }) => {
  const [priorityOpen, setPriorityOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { project } = card;
  const priority = getPriorityInfo(project?.profit_margin);
  const status = statusInfo[card.status];

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    if (!priorityOpen) return;
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setPriorityOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [priorityOpen]);

  return (
    <div
      className={`relative bg-white border border-slate-100 rounded-2xl shadow group mb-4 px-5 py-4 text-slate-900 font-medium flex flex-col gap-2 transition-all duration-300 ease-in-out
        ${isDragging ? 'ring-2 ring-blue-400 scale-105 z-10 shadow-2xl' : 'scale-100'}
        hover:shadow-xl hover:-translate-y-1
      `}
      tabIndex={0}
      aria-label={`Proyecto ${project?.name}`}
    >
      {/* Fila superior: nombre + eliminar */}
      <div className="flex items-center w-full">
        <span className="text-base font-semibold flex-1 group-hover:text-blue-700 transition-colors duration-200" style={{lineHeight: 1.2}} title={project?.name}>
          {project?.name || 'Proyecto'}
        </span>
        <button
          className="text-slate-400 hover:text-red-500 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          onClick={() => onDelete(card.id)}
          tabIndex={-1}
          aria-label="Eliminar proyecto"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>
      {/* Fila badges */}
      <div className="flex flex-row gap-2 items-center mt-1">
        {/* Estado */}
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${status.color}`}
          title={status.label}
        >
          {status.icon}
          {status.label}
        </span>
        {/* Prioridad (dropdown) */}
        <div className="relative" ref={ref}>
          <button
            type="button"
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${priority.color} cursor-pointer select-none`}
            title={priority.label + ' prioridad'}
            onClick={() => setPriorityOpen(o => !o)}
            aria-haspopup="listbox"
            aria-expanded={priorityOpen}
          >
            <Flag className="w-4 h-4 mr-1" />
            {priority.label}
            <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
          </button>
          {priorityOpen && (
            <div className="absolute z-10 mt-2 w-28 bg-white border border-slate-200 rounded-lg shadow-lg py-1 text-xs animate-fade-in" role="listbox">
              <button className="w-full text-left px-3 py-2 hover:bg-red-100 text-red-700 font-semibold flex items-center gap-2" onClick={() => { setPriorityOpen(false); onChangePriority(card.id, 30); }} role="option"> <Flag className="w-4 h-4" /> Alta</button>
              <button className="w-full text-left px-3 py-2 hover:bg-orange-100 text-orange-700 font-semibold flex items-center gap-2" onClick={() => { setPriorityOpen(false); onChangePriority(card.id, 15); }} role="option"> <Flag className="w-4 h-4" /> Media</button>
              <button className="w-full text-left px-3 py-2 hover:bg-slate-100 text-slate-500 font-semibold flex items-center gap-2" onClick={() => { setPriorityOpen(false); onChangePriority(card.id, 5); }} role="option"> <Flag className="w-4 h-4" /> Baja</button>
            </div>
          )}
        </div>
        {/* Fecha de creación */}
        {project?.created_at && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-slate-50 border-slate-200 text-slate-500 ml-1" title={`Creado el ${new Date(project.created_at).toLocaleDateString()}`}>
            <Calendar className="w-4 h-4 mr-1" />
            {new Date(project.created_at).toLocaleDateString()}
          </span>
        )}
      </div>
    </div>
  );
}; 