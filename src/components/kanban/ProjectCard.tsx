import React from 'react';
import { Trash2, Flag, Calendar, Clock, PauseCircle, PlayCircle, CheckCircle2, Lock, Edit3 } from 'lucide-react';
import type { KanbanCard, KanbanPriority, KanbanStatus } from '@/types';

interface ProjectCardProps {
  card: KanbanCard;
  onDelete: (id: string) => void;
  onToggleTodo: (todoId: string, isCompleted: boolean) => void;
  onEdit: (card: KanbanCard) => void;
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

const priorityInfo: Record<KanbanPriority, { label: string; color: string }> = {
  high: { label: 'Alta', color: 'bg-brand-100 text-brand-700 border-brand-200' },
  medium: { label: 'Media', color: 'bg-coral-100 text-coral-700 border-coral-200' },
  low: { label: 'Baja', color: 'bg-cream-100 text-dark-500 border-cream-200' },
};

function getDeadlineStyle(deadline: string): { color: string; label: string } {
  const d = new Date(deadline);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return { color: 'bg-brand-100 text-brand-700 border-brand-200', label: 'Vencida' };
  if (diffDays <= 2) return { color: 'bg-coral-100 text-coral-700 border-coral-200', label: `${diffDays}d` };
  return { color: 'bg-cream-50 border-cream-200 text-dark-500', label: '' };
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ card, onDelete, onToggleTodo, onEdit, isDragging }) => {
  const { project } = card;
  const priority = priorityInfo[card.priority || 'medium'];
  const status = statusInfo[card.status];

  // Filter TODOs for current phase
  const currentPhaseTodos = (card.todos || [])
    .filter(t => t.phase === card.status)
    .sort((a, b) => a.sort_order - b.sort_order);
  const completedCount = currentPhaseTodos.filter(t => t.is_completed).length;
  const totalCount = currentPhaseTodos.length;
  const hasPendingTodos = totalCount > 0 && completedCount < totalCount;

  return (
    <div
      className={`relative bg-white border border-cream-200 rounded-2xl shadow group mb-4 px-5 py-4 text-dark-900 font-medium flex flex-col gap-2 transition-all duration-300 ease-in-out
        ${isDragging ? 'ring-2 ring-brand-400 scale-105 z-10 shadow-2xl' : 'scale-100'}
        hover:shadow-xl hover:-translate-y-1 hover:border-brand-200
      `}
      tabIndex={0}
      aria-label={`Proyecto ${project?.name}`}
    >
      {/* Top row: name + actions */}
      <div className="flex items-center w-full">
        <button
          className="text-base font-semibold flex-1 text-left group-hover:text-brand-600 transition-colors duration-200 cursor-pointer hover:underline"
          style={{ lineHeight: 1.2 }}
          title={`Editar ${project?.name}`}
          onClick={() => onEdit(card)}
        >
          {project?.name || 'Proyecto'}
        </button>
        <button
          className="text-cream-400 hover:text-brand-500 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1"
          onClick={() => onEdit(card)}
          tabIndex={-1}
          aria-label="Editar tarjeta"
          title="Editar tarjeta"
        >
          <Edit3 className="w-4 h-4" />
        </button>
        <button
          className="text-cream-400 hover:text-brand-500 ml-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 p-1"
          onClick={() => onDelete(card.id)}
          tabIndex={-1}
          aria-label="Eliminar proyecto"
        >
          <Trash2 className="w-5 h-5" />
        </button>
      </div>

      {/* Badges row */}
      <div className="flex flex-row flex-wrap gap-2 items-center mt-1">
        {/* Status */}
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${status.color}`}
          title={status.label}
        >
          {status.icon}
          {status.label}
        </span>

        {/* Priority */}
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${priority.color}`}
          title={`Prioridad ${priority.label}`}
        >
          <Flag className="w-4 h-4 mr-1" />
          {priority.label}
        </span>

        {/* Deadline */}
        {card.deadline && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${getDeadlineStyle(card.deadline).color}`}
            title={`Fecha l\u00edmite: ${new Date(card.deadline).toLocaleDateString()}`}
          >
            <Clock className="w-4 h-4 mr-1" />
            {new Date(card.deadline).toLocaleDateString()}
            {getDeadlineStyle(card.deadline).label && (
              <span className="ml-1 font-semibold">({getDeadlineStyle(card.deadline).label})</span>
            )}
          </span>
        )}

        {/* Creation date */}
        {project?.created_at && (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border bg-cream-50 border-cream-200 text-dark-500"
            title={`Creado el ${new Date(project.created_at).toLocaleDateString()}`}
          >
            <Calendar className="w-4 h-4 mr-1" />
            {new Date(project.created_at).toLocaleDateString()}
          </span>
        )}

        {/* TODO progress indicator */}
        {totalCount > 0 && (
          <span
            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${
              hasPendingTodos
                ? 'bg-coral-50 text-coral-700 border-coral-200'
                : 'bg-brand-50 text-brand-700 border-brand-200'
            }`}
            title={`${completedCount}/${totalCount} tareas completadas`}
          >
            {hasPendingTodos ? (
              <Lock className="w-3.5 h-3.5 mr-1" />
            ) : (
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
            )}
            {completedCount}/{totalCount}
          </span>
        )}
      </div>

      {/* TODO checklist for current phase */}
      {currentPhaseTodos.length > 0 && (
        <div className="mt-2 pt-2 border-t border-cream-100">
          <div className="text-xs text-dark-400 mb-1.5 font-semibold">Tareas</div>
          <div className="space-y-1">
            {currentPhaseTodos.map(todo => (
              <label
                key={todo.id}
                className="flex items-start gap-2 text-sm py-0.5 cursor-pointer group/todo"
              >
                <input
                  type="checkbox"
                  checked={todo.is_completed}
                  onChange={() => onToggleTodo(todo.id, !todo.is_completed)}
                  className="mt-0.5 rounded border-cream-300 text-brand-500 focus:ring-brand-500 cursor-pointer"
                />
                <span
                  className={`flex-1 ${
                    todo.is_completed
                      ? 'line-through text-dark-400'
                      : 'text-dark-700'
                  }`}
                >
                  {todo.title}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
