import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, ChevronDown, ChevronUp, Flag, Calendar, ListTodo } from 'lucide-react';
import type { Project, KanbanPriority, KanbanStatus, KanbanCardTodo } from '@/types';

interface TodosByPhase {
  pending: string[];
  in_progress: string[];
  completed: string[];
}

interface AddCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: {
    projectId: string;
    priority: KanbanPriority;
    deadline: string | null;
    todos: { phase: KanbanStatus; title: string }[];
  }) => void;
  availableProjects: Project[];
  isEditing?: boolean;
  initialData?: {
    projectId: string;
    projectName?: string;
    priority: KanbanPriority;
    deadline: string | null;
    todos: KanbanCardTodo[];
  };
}

const phaseLabels: Record<KanbanStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En desarrollo',
  completed: 'Completado',
};

const phaseOrder: KanbanStatus[] = ['pending', 'in_progress', 'completed'];

const priorityOptions: { value: KanbanPriority; label: string; color: string; activeColor: string }[] = [
  { value: 'high', label: 'Alta', color: 'border-brand-200 text-dark-500', activeColor: 'bg-brand-100 border-brand-400 text-brand-700' },
  { value: 'medium', label: 'Media', color: 'border-coral-200 text-dark-500', activeColor: 'bg-coral-100 border-coral-400 text-coral-700' },
  { value: 'low', label: 'Baja', color: 'border-cream-200 text-dark-500', activeColor: 'bg-cream-200 border-cream-400 text-dark-700' },
];

export const AddCardModal: React.FC<AddCardModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  availableProjects,
  isEditing = false,
  initialData,
}) => {
  const [projectId, setProjectId] = useState('');
  const [priority, setPriority] = useState<KanbanPriority>('medium');
  const [deadline, setDeadline] = useState('');
  const [todosByPhase, setTodosByPhase] = useState<TodosByPhase>({
    pending: [],
    in_progress: [],
    completed: [],
  });
  const [expandedPhases, setExpandedPhases] = useState<Record<KanbanStatus, boolean>>({
    pending: false,
    in_progress: false,
    completed: false,
  });

  // Initialize state when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setProjectId(initialData.projectId);
        setPriority(initialData.priority);
        setDeadline(initialData.deadline || '');
        const grouped: TodosByPhase = { pending: [], in_progress: [], completed: [] };
        initialData.todos.forEach(t => {
          grouped[t.phase].push(t.title);
        });
        setTodosByPhase(grouped);
        // Expand phases that have TODOs
        setExpandedPhases({
          pending: grouped.pending.length > 0,
          in_progress: grouped.in_progress.length > 0,
          completed: grouped.completed.length > 0,
        });
      } else {
        setProjectId('');
        setPriority('medium');
        setDeadline('');
        setTodosByPhase({ pending: [], in_progress: [], completed: [] });
        setExpandedPhases({ pending: false, in_progress: false, completed: false });
      }
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) onClose();
  };

  const addTodoToPhase = (phase: KanbanStatus) => {
    setTodosByPhase(prev => ({
      ...prev,
      [phase]: [...prev[phase], ''],
    }));
  };

  const updateTodo = (phase: KanbanStatus, index: number, value: string) => {
    setTodosByPhase(prev => ({
      ...prev,
      [phase]: prev[phase].map((t, i) => (i === index ? value : t)),
    }));
  };

  const removeTodo = (phase: KanbanStatus, index: number) => {
    setTodosByPhase(prev => ({
      ...prev,
      [phase]: prev[phase].filter((_, i) => i !== index),
    }));
  };

  const togglePhase = (phase: KanbanStatus) => {
    setExpandedPhases(prev => ({ ...prev, [phase]: !prev[phase] }));
  };

  const handleSubmit = () => {
    if (!projectId && !isEditing) return;

    // Collect non-empty TODOs
    const todos: { phase: KanbanStatus; title: string }[] = [];
    for (const phase of phaseOrder) {
      todosByPhase[phase].forEach(title => {
        const trimmed = title.trim();
        if (trimmed) {
          todos.push({ phase, title: trimmed });
        }
      });
    }

    onSubmit({
      projectId,
      priority,
      deadline: deadline || null,
      todos,
    });
  };

  const totalTodos = phaseOrder.reduce((acc, p) => acc + todosByPhase[p].filter(t => t.trim()).length, 0);

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"
      onClick={handleBackdropClick}
      style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, width: '100vw', height: '100vh' }}
    >
      <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full mx-4 transform transition-all relative z-10 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-cream-200">
          <h3 className="text-lg font-bold text-dark-900">
            {isEditing ? 'Editar tarjeta' : 'Configurar tarjeta'}
          </h3>
          <button
            onClick={onClose}
            className="text-dark-400 hover:text-dark-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1">
          {/* Project selector */}
          <div>
            <label className="block text-sm font-semibold text-dark-700 mb-1.5">Proyecto</label>
            {isEditing ? (
              <div className="px-4 py-2.5 bg-cream-50 border border-cream-200 rounded-lg text-dark-700 text-sm">
                {initialData?.projectName || 'Proyecto'}
              </div>
            ) : (
              <select
                className="w-full border border-cream-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-cream-50 text-dark-900"
                value={projectId}
                onChange={e => setProjectId(e.target.value)}
              >
                <option value="">Selecciona un proyecto...</option>
                {availableProjects.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            )}
          </div>

          {/* Priority selector */}
          <div>
            <label className="block text-sm font-semibold text-dark-700 mb-1.5">
              <Flag className="w-4 h-4 inline mr-1" />
              Prioridad
            </label>
            <div className="flex gap-2">
              {priorityOptions.map(opt => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setPriority(opt.value)}
                  className={`flex-1 px-3 py-2 rounded-lg border text-sm font-semibold transition-all duration-200 ${
                    priority === opt.value ? opt.activeColor : opt.color
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          {/* Deadline */}
          <div>
            <label className="block text-sm font-semibold text-dark-700 mb-1.5">
              <Calendar className="w-4 h-4 inline mr-1" />
              Fecha l&iacute;mite <span className="text-dark-400 font-normal">(opcional)</span>
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                className="flex-1 border border-cream-300 rounded-lg px-4 py-2.5 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-cream-50 text-dark-900"
                value={deadline}
                onChange={e => setDeadline(e.target.value)}
              />
              {deadline && (
                <button
                  type="button"
                  onClick={() => setDeadline('')}
                  className="px-3 py-2 text-dark-400 hover:text-brand-500 transition-colors"
                  title="Quitar fecha"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* TODOs by phase */}
          <div>
            <label className="block text-sm font-semibold text-dark-700 mb-1.5">
              <ListTodo className="w-4 h-4 inline mr-1" />
              Tareas por fase <span className="text-dark-400 font-normal">(opcional)</span>
              {totalTodos > 0 && (
                <span className="ml-2 text-xs bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                  {totalTodos} tarea{totalTodos !== 1 ? 's' : ''}
                </span>
              )}
            </label>
            <div className="space-y-2 mt-2">
              {phaseOrder.map(phase => (
                <div key={phase} className="border border-cream-200 rounded-lg overflow-hidden">
                  {/* Phase header */}
                  <button
                    type="button"
                    onClick={() => togglePhase(phase)}
                    className="w-full flex items-center justify-between px-4 py-2.5 bg-cream-50 hover:bg-cream-100 transition-colors text-sm font-semibold text-dark-700"
                  >
                    <span>
                      {phaseLabels[phase]}
                      {todosByPhase[phase].filter(t => t.trim()).length > 0 && (
                        <span className="ml-2 text-xs bg-cream-200 text-dark-500 px-1.5 py-0.5 rounded-full">
                          {todosByPhase[phase].filter(t => t.trim()).length}
                        </span>
                      )}
                    </span>
                    {expandedPhases[phase] ? (
                      <ChevronUp className="w-4 h-4 text-dark-400" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-dark-400" />
                    )}
                  </button>

                  {/* Phase TODO list */}
                  {expandedPhases[phase] && (
                    <div className="p-3 space-y-2">
                      {todosByPhase[phase].map((todo, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <input
                            type="text"
                            className="flex-1 border border-cream-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white text-dark-900"
                            placeholder={`Tarea ${idx + 1}...`}
                            value={todo}
                            onChange={e => updateTodo(phase, idx, e.target.value)}
                          />
                          <button
                            type="button"
                            onClick={() => removeTodo(phase, idx)}
                            className="text-dark-400 hover:text-brand-500 transition-colors p-1"
                            title="Eliminar tarea"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addTodoToPhase(phase)}
                        className="flex items-center gap-1.5 text-sm text-brand-600 hover:text-brand-700 font-medium transition-colors"
                      >
                        <Plus className="w-4 h-4" />
                        A&ntilde;adir tarea
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-cream-200">
          <button
            onClick={onClose}
            className="px-5 py-2.5 text-dark-600 hover:text-dark-800 font-semibold transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={!projectId && !isEditing}
            className="px-5 py-2.5 bg-brand-500 text-white rounded-lg font-semibold hover:bg-brand-600 transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isEditing ? 'Guardar' : 'A\u00f1adir'}
          </button>
        </div>
      </div>
    </div>
  );
};
