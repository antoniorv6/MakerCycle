import React, { useEffect, useState, useRef } from 'react';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTeam } from '@/components/providers/TeamProvider';
import { projectService } from '@/services/projectService';
import { kanbanBoardService } from '@/services/kanbanBoardService';
import type { Project, KanbanCard, KanbanStatus } from '@/types';
import { Plus, Trash2, PauseCircle, PlayCircle, CheckCircle2 } from 'lucide-react';

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
  const handleDeleteCard = async (cardId: string) => {
    setLoading(true);
    try {
      await kanbanBoardService.deleteKanbanCard(cardId);
      fetchKanbanCards();
    } catch (e) {
      // error
    } finally {
      setLoading(false);
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

  return (
    <div className="min-h-screen w-full bg-slate-100 py-10 px-2 md:px-8">
      <div className="flex items-center justify-between mb-8 max-w-5xl mx-auto">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Tablero Kanban</h1>
        <button
          className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-xl shadow-lg hover:bg-slate-800 transition font-semibold text-base"
          onClick={() => setAdding(true)}
        >
          <Plus className="w-5 h-5" /> Añadir Proyecto
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
        <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-4 px-2 md:px-8">
          {columnOrder.map((status) => (
            <Droppable droppableId={status} key={status}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`bg-white border border-slate-200 rounded-2xl shadow-md p-10 min-h-[420px] flex flex-col transition-all duration-300 ${snapshot.isDraggingOver ? 'ring-2 ring-blue-300' : ''}`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    {status === 'pending' && <PauseCircle className="w-6 h-6 text-yellow-400" />}
                    {status === 'in_progress' && <PlayCircle className="w-6 h-6 text-blue-500" />}
                    {status === 'completed' && <CheckCircle2 className="w-6 h-6 text-green-500" />}
                    <h2 className="text-xl font-bold text-slate-800">{columnTitles[status]}</h2>
                  </div>
                  {columns[status].length === 0 && (
                    <div className="text-slate-400 text-center py-8">Sin proyectos</div>
                  )}
                  {columns[status].map((card, idx) => (
                    <Draggable draggableId={card.id} index={idx} key={card.id}>
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-white border border-slate-100 rounded-xl shadow group mb-4 px-4 py-3 text-slate-900 font-medium flex flex-col gap-1 transition-all duration-300 ease-in-out
                            ${snapshot.isDragging ? 'ring-2 ring-blue-400 scale-105 z-10 shadow-2xl' : 'scale-100'}
                            hover:shadow-xl hover:-translate-y-1
                          `}
                        >
                          <div className="flex items-center w-full">
                            <span className="text-base font-semibold flex-1 group-hover:text-blue-700 transition-colors duration-200" style={{lineHeight: 1.2}}>
                              {card.project?.name || 'Proyecto'}
                            </span>
                            <button
                              className="text-slate-400 hover:text-red-500 ml-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                              onClick={() => handleDeleteCard(card.id)}
                              tabIndex={-1}
                            >
                              <Trash2 className="w-5 h-5" />
                            </button>
                          </div>
                          <div className="flex flex-row gap-2 mt-1">
                            <span
                              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border
                                ${card.project?.status === 'draft' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
                                  card.project?.status === 'calculated' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                                  'bg-green-100 text-green-800 border-green-200'}
                              `}
                              title={card.project?.status === 'draft' ? 'Borrador' : card.project?.status === 'calculated' ? 'Calculado' : 'Completado'}
                            >
                              {card.project?.status === 'draft' ? 'Borrador' : card.project?.status === 'calculated' ? 'Calculado' : 'Completado'}
                            </span>
                            {(() => {
                              const margin = card.project?.profit_margin;
                              let badgeClass = 'bg-slate-100 text-slate-500 border-slate-200';
                              let label = 'Baja';
                              let value = 5;
                              if (typeof margin === 'number') {
                                if (margin >= 30) {
                                  badgeClass = 'bg-red-100 text-red-700 border-red-200';
                                  label = 'Alta';
                                  value = 30;
                                } else if (margin >= 15) {
                                  badgeClass = 'bg-orange-100 text-orange-700 border-orange-200';
                                  label = 'Media';
                                  value = 15;
                                }
                              }
                              // Dropdown para cambiar prioridad
                              const [open, setOpen] = React.useState(false);
                              const ref = useRef<HTMLDivElement>(null);
                              // Cerrar el dropdown al hacer click fuera
                              React.useEffect(() => {
                                if (!open) return;
                                function handle(e: MouseEvent) {
                                  if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
                                }
                                document.addEventListener('mousedown', handle);
                                return () => document.removeEventListener('mousedown', handle);
                              }, [open]);
                              const handleChange = async (newValue: number) => {
                                setOpen(false);
                                // Optimistic UI: actualiza localmente
                                setCards(prevCards => prevCards.map(c =>
                                  c.id === card.id ? { ...c, project: { ...c.project!, profit_margin: newValue } } : c
                                ));
                                // Persistencia
                                try {
                                  await projectService.updateProject(card.project!.id, { profit_margin: newValue });
                                } catch {
                                  fetchKanbanCards();
                                }
                              };
                              return (
                                <div className="relative" ref={ref}>
                                  <button
                                    type="button"
                                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold border ${badgeClass} cursor-pointer select-none`}
                                    title={label + ' prioridad'}
                                    onClick={() => setOpen(o => !o)}
                                  >
                                    {label}
                                    <svg className="ml-1 w-3 h-3" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                                  </button>
                                  {open && (
                                    <div className="absolute z-10 mt-2 w-28 bg-white border border-slate-200 rounded-lg shadow-lg py-1 text-xs">
                                      <button className="w-full text-left px-3 py-2 hover:bg-red-100 text-red-700 font-semibold" onClick={() => handleChange(30)}>Alta</button>
                                      <button className="w-full text-left px-3 py-2 hover:bg-orange-100 text-orange-700 font-semibold" onClick={() => handleChange(15)}>Media</button>
                                      <button className="w-full text-left px-3 py-2 hover:bg-slate-100 text-slate-500 font-semibold" onClick={() => handleChange(5)}>Baja</button>
                                    </div>
                                  )}
                                </div>
                              );
                            })()}
                          </div>
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
    </div>
  );
} 