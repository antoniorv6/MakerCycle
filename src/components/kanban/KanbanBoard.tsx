import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import toast, { Toaster } from 'react-hot-toast';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTeam } from '@/components/providers/TeamProvider';
import { projectService } from '@/services/projectService';
import { kanbanBoardService } from '@/services/kanbanBoardService';
import type { Project, KanbanCard, KanbanCardTodoInput, KanbanPriority, KanbanStatus } from '@/types';
import { Plus, FolderOpen } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { ColumnHeader } from './ColumnHeader';
import { AddCardModal } from './AddCardModal';
import ConfirmModal from '../cost-calculator/ConfirmModal';
import { OrganizacionIcon } from '@/components/icons/MenuIcons';

const columnOrder: KanbanStatus[] = ['pending', 'in_progress', 'completed'];
const columnTitles: Record<KanbanStatus, string> = {
  pending: 'Pendiente',
  in_progress: 'En desarrollo',
  completed: 'Completado',
};

export default function KanbanBoard() {
  const { user } = useAuth();
  const { currentTeam } = useTeam();
  const [projects, setProjects] = useState<Project[]>([]);
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCard, setEditingCard] = useState<KanbanCard | null>(null);

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await projectService.getProjects(user.id, currentTeam?.id);
      setProjects(data);
    } catch {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  }, [user, currentTeam?.id]);

  const fetchKanbanCards = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await kanbanBoardService.getKanbanCards(user.id, currentTeam?.id);
      setCards(data);
    } catch {
      setCards([]);
    } finally {
      setLoading(false);
    }
  }, [user, currentTeam?.id]);

  // Cargar proyectos y tarjetas Kanban
  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchKanbanCards();
    }
  }, [user, currentTeam, fetchProjects, fetchKanbanCards]);

  // Agrupar tarjetas por columna
  const columns = useMemo(() => {
    const result: Record<KanbanStatus, KanbanCard[]> = {
      pending: [],
      in_progress: [],
      completed: [],
    };
    cards.forEach(card => {
      result[card.status].push(card);
    });
    return result;
  }, [cards]);

  // Proyectos que se pueden añadir (no están ya en el tablero)
  const availableProjects = useMemo(() => {
    const usedProjectIds = new Set(cards.map(c => c.project_id));
    return projects.filter(p => !usedProjectIds.has(p.id));
  }, [cards, projects]);

  // Añadir tarjeta desde el modal
  const handleAddCard = async (data: {
    projectId: string;
    priority: KanbanPriority;
    deadline: string | null;
    todos: { phase: KanbanStatus; title: string }[];
  }) => {
    if (!user || !data.projectId) return;
    setLoading(true);
    try {
      const card = await kanbanBoardService.addKanbanCard(
        user.id,
        data.projectId,
        'pending',
        currentTeam?.id,
        data.priority,
        data.deadline
      );
      if (data.todos.length > 0) {
        const todoInputs: KanbanCardTodoInput[] = data.todos.map((t, i) => ({
          phase: t.phase,
          title: t.title,
          sort_order: i,
        }));
        await kanbanBoardService.addTodos(card.id, todoInputs);
      }
      setShowAddModal(false);
      fetchKanbanCards();
    } catch {
      toast.error('Error al añadir la tarjeta');
    } finally {
      setLoading(false);
    }
  };

  // Editar tarjeta existente
  const handleEditCard = (card: KanbanCard) => {
    setEditingCard(card);
  };

  const handleUpdateCard = async (data: {
    projectId: string;
    priority: KanbanPriority;
    deadline: string | null;
    todos: { phase: KanbanStatus; title: string }[];
  }) => {
    if (!editingCard) return;
    setLoading(true);
    try {
      await kanbanBoardService.updateKanbanCard(editingCard.id, {
        priority: data.priority,
        deadline: data.deadline,
      });
      const todoInputs: KanbanCardTodoInput[] = data.todos.map((t, i) => ({
        phase: t.phase,
        title: t.title,
        sort_order: i,
      }));
      await kanbanBoardService.updateTodos(editingCard.id, todoInputs);
      setEditingCard(null);
      fetchKanbanCards();
    } catch {
      toast.error('Error al guardar los cambios');
    } finally {
      setLoading(false);
    }
  };

  // Eliminar tarjeta
  const handleDeleteCard = (cardId: string) => {
    setCardToDelete(cardId);
    setShowDeleteModal(true);
  };

  const confirmDeleteCard = async () => {
    if (!cardToDelete) return;
    setLoading(true);
    try {
      await kanbanBoardService.deleteKanbanCard(cardToDelete);
      fetchKanbanCards();
    } catch {
      // error
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setCardToDelete(null);
    }
  };

  // Toggle TODO checkbox (optimistic UI)
  const handleToggleTodo = async (todoId: string, isCompleted: boolean) => {
    // Optimistic update
    setCards(prev =>
      prev.map(card => ({
        ...card,
        todos: card.todos?.map(t =>
          t.id === todoId ? { ...t, is_completed: isCompleted } : t
        ),
      }))
    );
    try {
      await kanbanBoardService.toggleTodo(todoId, isCompleted);
    } catch {
      fetchKanbanCards(); // Revert on error
    }
  };

  // Drag & drop con bloqueo por TODOs
  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;
    if (!destination) return;
    if (
      destination.droppableId === source.droppableId &&
      destination.index === source.index
    ) {
      return;
    }
    const card = cards.find(c => c.id === draggableId);
    if (!card) return;
    const newStatus = destination.droppableId as KanbanStatus;
    if (card.status === newStatus) return;

    // Check if current phase TODOs are all completed
    const currentPhaseTodos = (card.todos || []).filter(t => t.phase === card.status);
    if (currentPhaseTodos.length > 0) {
      const incompleteCount = currentPhaseTodos.filter(t => !t.is_completed).length;
      if (incompleteCount > 0) {
        toast.error(
          `No puedes mover esta tarjeta. Tienes ${incompleteCount} tarea${incompleteCount > 1 ? 's' : ''} pendiente${incompleteCount > 1 ? 's' : ''} en "${columnTitles[card.status]}".`,
          { duration: 4000 }
        );
        return; // Block the move
      }
    }

    // Optimistic UI: actualizar localmente
    setCards(prevCards =>
      prevCards.map(c =>
        c.id === card.id ? { ...c, status: newStatus } : c
      )
    );

    // Sincronizar con Supabase en background
    try {
      await kanbanBoardService.updateKanbanCardStatus(card.id, newStatus);
    } catch {
      // Si hay error, recargar desde Supabase
      fetchKanbanCards();
    }
  };

  return (
    <div className="min-h-screen w-full bg-cream-50 py-10 px-2 md:px-8">
      <Toaster position="top-center" />
      <div className="flex items-center justify-between mb-8 max-w-5xl mx-auto">
        <div className="flex items-center gap-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full">
            <OrganizacionIcon className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-extrabold text-dark-900 tracking-tight">Organización de proyectos</h1>
        </div>
        <button
          className="flex items-center gap-2 px-5 py-2.5 bg-brand-500 text-white rounded-xl shadow-brand hover:bg-brand-600 transition font-semibold text-base"
          onClick={() => setShowAddModal(true)}
        >
          <Plus className="w-5 h-5" /> Añadir a Organización
        </button>
      </div>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 px-2 md:px-8 overflow-visible">
          {columnOrder.map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`bg-white border border-cream-200 rounded-2xl shadow-md p-10 min-h-[420px] flex flex-col transition-all duration-300 overflow-visible ${snapshot.isDraggingOver ? 'ring-2 ring-brand-300 border-brand-300' : ''}`}
                >
                  <ColumnHeader status={status} count={columns[status].length} />
                  {columns[status].length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 animate-in fade-in-0 duration-300">
                      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-cream-50 border border-cream-200 mb-4">
                        <FolderOpen className="w-8 h-8 text-cream-400" />
                      </div>
                      <div className="text-lg font-semibold text-dark-400 mb-1">Sin proyectos</div>
                      <div className="text-xs text-dark-400">Arrastra o añade proyectos aquí para empezar</div>
                    </div>
                  )}
                  {columns[status].map((card, idx) => (
                    <Draggable draggableId={card.id} index={idx} key={card.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <ProjectCard
                            card={card}
                            onDelete={handleDeleteCard}
                            onToggleTodo={handleToggleTodo}
                            onEdit={handleEditCard}
                            isDragging={snapshot.isDragging}
                          />
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
      {loading && (
        <div className="fixed inset-0 bg-white/60 flex items-center justify-center z-50">
          <span className="text-dark-500 text-lg">Cargando...</span>
        </div>
      )}

      {/* Modal para añadir tarjeta */}
      <AddCardModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSubmit={handleAddCard}
        availableProjects={availableProjects}
      />

      {/* Modal para editar tarjeta */}
      <AddCardModal
        isOpen={!!editingCard}
        onClose={() => setEditingCard(null)}
        onSubmit={handleUpdateCard}
        availableProjects={availableProjects}
        isEditing
        initialData={editingCard ? {
          projectId: editingCard.project_id,
          projectName: editingCard.project?.name,
          priority: editingCard.priority || 'medium',
          deadline: editingCard.deadline,
          todos: editingCard.todos || [],
        } : undefined}
      />

      {/* Modal de confirmación para eliminar tarjeta */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setCardToDelete(null);
        }}
        onConfirm={confirmDeleteCard}
        title="Eliminar proyecto de la organización"
        message="¿Estás seguro de que quieres eliminar este proyecto de la organización? El proyecto no se borrará, solo se quitará del tablero Kanban."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}
