import React, { useRef, useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
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
    color: 'bg-coral-50 text-coral-700 border-coral-200',
    icon: <PauseCircle className="w-4 h-4 mr-1 text-coral-500" />,
  },
  in_progress: {
    label: 'En desarrollo',
    color: 'bg-brand-50 text-brand-700 border-brand-200',
    icon: <PlayCircle className="w-4 h-4 mr-1 text-brand-500" />,
  },
  completed: {
    label: 'Completado',
    color: 'bg-brand-100 text-brand-800 border-brand-300',
    icon: <CheckCircle2 className="w-4 h-4 mr-1 text-brand-600" />,
  },
};

function getPriorityInfo(margin?: number) {
  if (typeof margin !== 'number') return { label: 'Baja', color: 'bg-cream-100 text-dark-500 border-cream-200' };
  if (margin >= 30) return { label: 'Alta', color: 'bg-brand-100 text-brand-700 border-brand-200' };
  if (margin >= 15) return { label: 'Media', color: 'bg-coral-100 text-coral-700 border-coral-200' };
  return { label: 'Baja', color: 'bg-cream-100 text-dark-500 border-cream-200' };
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ card, onDelete, onChangePriority, isDragging }) => {
  const [priorityOpen, setPriorityOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const { project } = card;
  const priority = getPriorityInfo(project?.profit_margin);
  const status = statusInfo[card.status];

  // Calcular posición del dropdown
  const updateDropdownPosition = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        left: rect.left + window.scrollX
      });
    }
  };

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    if (!priorityOpen) return;
    
    updateDropdownPosition();
    
    function handle(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setPriorityOpen(false);
    }
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [priorityOpen]);

  // Actualizar posición en scroll o resize
  useEffect(() => {
    if (!priorityOpen) return;
    
    const handleUpdate = () => updateDropdownPosition();
    window.addEventListener('scroll', handleUpdate);
    window.addEventListener('resize', handleUpdate);
    
    return () => {
      window.removeEventListener('scroll', handleUpdate);
      window.removeEventListener('resize', handleUpdate);
    };
  }, [priorityOpen]);

  return (
    <div
      className={`relative bg-white border border-cream-200 rounded-2xl shadow group mb-4 px-5 py-4 text-dark-900 font-medium flex flex-col gap-2 transition-all duration-300 ease-in-out
        ${isDragging ? 'ring-2 ring-brand-400 scale-105 z-10 shadow-2xl' : 'scale-100'}
        hover:shadow-xl hover:-translate-y-1 hover:border-brand-200
      `}
      tabIndex={0}
      aria-label={`Proyecto ${project?.name}`}
    >
      {/* Fila superior: nombre + eliminar */}
      <div className="flex items-center w-full">
        <span className="text-base font-semibold flex-1 group-hover:text-brand-600 transition-colors duration-200" style={{lineHeight: 1.2}} title={project?.name}>
          {project?.name || 'Proyecto'}
        </span>
        <button
          className="text-cream-400 hover:text-brand-500 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
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
            ref={buttonRef}
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
        </div>
        {/* Fecha de creación */}
        {project?.created_at && (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-cream-50 border-cream-200 text-dark-500 ml-1" title={`Creado el ${new Date(project.created_at).toLocaleDateString()}`}>
            <Calendar className="w-4 h-4 mr-1" />
            {new Date(project.created_at).toLocaleDateString()}
          </span>
        )}
      </div>
      
      {/* Portal del dropdown */}
      {priorityOpen && createPortal(
        <div 
          className="fixed z-[9999] w-28 bg-white border border-cream-200 rounded-lg shadow-lg py-1 text-xs animate-in fade-in-0 slide-in-from-top-2 duration-200" 
          style={{
            top: dropdownPosition.top,
            left: dropdownPosition.left
          }}
          role="listbox"
        >
          <button 
            className="w-full text-left px-3 py-2 hover:bg-brand-50 text-brand-700 font-semibold flex items-center gap-2" 
            onClick={() => { setPriorityOpen(false); onChangePriority(card.id, 30); }} 
            role="option"
          > 
            <Flag className="w-4 h-4" /> Alta
          </button>
          <button 
            className="w-full text-left px-3 py-2 hover:bg-coral-50 text-coral-700 font-semibold flex items-center gap-2" 
            onClick={() => { setPriorityOpen(false); onChangePriority(card.id, 15); }} 
            role="option"
          > 
            <Flag className="w-4 h-4" /> Media
          </button>
          <button 
            className="w-full text-left px-3 py-2 hover:bg-cream-100 text-dark-500 font-semibold flex items-center gap-2" 
            onClick={() => { setPriorityOpen(false); onChangePriority(card.id, 5); }} 
            role="option"
          > 
            <Flag className="w-4 h-4" /> Baja
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}; 