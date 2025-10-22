import React, { useEffect, useState, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTeam } from '@/components/providers/TeamProvider';
import { projectService } from '@/services/projectService';
import { kanbanBoardService } from '@/services/kanbanBoardService';
import type { Project, KanbanCard, KanbanStatus } from '@/types';
import { Plus, Trash2, PauseCircle, PlayCircle, CheckCircle2, FolderOpen } from 'lucide-react';
import { ProjectCard } from './ProjectCard';
import { ColumnHeader } from './ColumnHeader';
import ConfirmModal from '../cost-calculator/ConfirmModal';

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
  const [adding, setAdding] = useState(false);
  const [selectedProject, setSelectedProject] = useState('');
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [cardToDelete, setCardToDelete] = useState<string | null>(null);

  // Cargar proyectos y tarjetas Kanban
  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchKanbanCards();
    }
    // eslint-disable-next-line
  }, [user, currentTeam]);

  const fetchProjects = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await projectService.getProjects(user.id, currentTeam?.id);
      setProjects(data);
    } catch (e) {
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchKanbanCards = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const data = await kanbanBoardService.getKanbanCards(user.id, currentTeam?.id);
      setCards(data);
    } catch (e) {
      setCards([]);
    } finally {
      setLoading(false);
    }
  };

  // Agrupar tarjetas por columna
  const columns: Record<KanbanStatus, KanbanCard[]> = {
    pending: [],
    in_progress: [],
    completed: [],
  };
  cards.forEach(card => {
    columns[card.status].push(card);
  });

  // Proyectos que se pueden añadir (no están ya en el tablero)
  const usedProjectIds = new Set(cards.map(c => c.project_id));
  const availableProjects = projects.filter(p => !usedProjectIds.has(p.id));

  // Añadir tarjeta
  const handleAddCard = async () => {
    if (!user || !selectedProject) return;
    setLoading(true);
    try {
      await kanbanBoardService.addKanbanCard(user.id, selectedProject, 'pending', currentTeam?.id);
      setSelectedProject('');
      setAdding(false);
      fetchKanbanCards();
    } catch (e) {
      // error
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
    } catch (e) {
      // error
    } finally {
      setLoading(false);
      setShowDeleteModal(false);
      setCardToDelete(null);
    }
  };

  // Drag & drop
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

    // Optimistic UI: actualizar localmente
    setCards(prevCards =>
      prevCards.map(c =>
        c.id === card.id ? { ...c, status: newStatus } : c
      )
    );

    // Sincronizar con Supabase en background
    try {
      await kanbanBoardService.updateKanbanCardStatus(card.id, newStatus);
      // Opcional: fetchKanbanCards(); // para asegurar consistencia
    } catch (e) {
      // Si hay error, recargar desde Supabase
      fetchKanbanCards();
    }
  };

  // Cambiar prioridad (optimistic UI + persistencia)
  const handleChangePriority = async (cardId: string, newValue: number) => {
    setCards(prevCards => prevCards.map(c =>
      c.id === cardId ? { ...c, project: { ...c.project!, profit_margin: newValue } } : c
    ));
    const card = cards.find(c => c.id === cardId);
    if (!card || !card.project) return;
    try {
      await projectService.updateProject(card.project.id, { profit_margin: newValue });
    } catch {
      fetchKanbanCards();
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 py-10 px-2 md:px-8">
      <div className="flex items-center justify-between mb-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Organización de proyectos</h1>
        <button
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition font-semibold text-base"
          onClick={() => setAdding(true)}
        >
          <Plus className="w-5 h-5" /> Añadir a Organización
        </button>
      </div>
      {adding && (
        <div className="mb-8 flex gap-3 items-center max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-4 border border-slate-100">
          <select
            className="border border-slate-300 rounded-lg px-4 py-2 text-base focus:ring-2 focus:ring-slate-400"
            value={selectedProject}
            onChange={e => setSelectedProject(e.target.value)}
          >
            <option value="">Selecciona un proyecto...</option>
            {availableProjects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button
            className="px-5 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-semibold transition"
            onClick={handleAddCard}
          >Añadir</button>
          <button
            className="px-5 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition"
            onClick={() => setAdding(false)}
          >Cancelar</button>
        </div>
      )}
      <DragDropContext onDragEnd={onDragEnd}>
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 px-2 md:px-8 overflow-visible">
          {columnOrder.map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`bg-white border border-slate-200 rounded-2xl shadow-md p-10 min-h-[420px] flex flex-col transition-all duration-300 overflow-visible ${snapshot.isDraggingOver ? 'ring-2 ring-blue-300' : ''}`}
                >
                  <ColumnHeader status={status} count={columns[status].length} />
                  {columns[status].length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 animate-in fade-in-0 duration-300">
                      <div className="w-16 h-16 flex items-center justify-center rounded-full bg-slate-50 border border-slate-200 mb-4">
                        <FolderOpen className="w-8 h-8 text-slate-300" />
                      </div>
                      <div className="text-lg font-semibold text-slate-400 mb-1">Sin proyectos</div>
                      <div className="text-xs text-slate-400">Arrastra o añade proyectos aquí para empezar</div>
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
                            onChangePriority={handleChangePriority}
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
          <span className="text-slate-500 text-lg">Cargando...</span>
        </div>
      )}

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