import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Calendar, Euro, FileText, Clock, Package, Layers, Zap, Eye, Pencil } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTeam } from '@/components/providers/TeamProvider';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import type { DatabaseProject, DatabasePiece, PieceMaterial } from '@/types';
import { toast } from 'react-hot-toast';
import ProjectInfo from './cost-calculator/forms/ProjectInfo';
import ProjectManagerSkeleton from './skeletons/ProjectManagerSkeleton';
import ConfirmModal from './cost-calculator/ConfirmModal';

interface ProjectManagerProps {
  onLoadProject: (project: DatabaseProject & { pieces?: DatabasePiece[] }) => void;
  onEditProject?: (project: DatabaseProject & { pieces?: DatabasePiece[] }) => void;
}

// Function to process pieces (solo sistema multi-material)
async function processPieces(
  pieces: (DatabasePiece & { piece_materials?: PieceMaterial[] })[], 
  supabase: any
): Promise<DatabasePiece[]> {
  
  const processedPieces = await Promise.all(
    pieces.map(async (piece) => {
      
      // Solo usar materiales del sistema multi-material
      if (piece.piece_materials && piece.piece_materials.length > 0) {
        return {
          ...piece,
          materials: piece.piece_materials
        };
      }
      
      // Pieza sin materiales
      return {
        ...piece,
        materials: []
      };
    })
  );
  
  return processedPieces;
}

export default function ProjectManager({ onLoadProject, onEditProject }: ProjectManagerProps) {
  const { user } = useAuth();
  const { currentTeam } = useTeam();
  const { formatCurrency, currencySymbol } = useFormatCurrency();
  const supabase = createClient();
  const [projects, setProjects] = useState<(DatabaseProject & { pieces?: DatabasePiece[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectType, setNewProjectType] = useState<'filament' | 'resin'>('filament');
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [projectToDelete, setProjectToDelete] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, currentTeam]);

  const fetchProjects = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      let query = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false });

      // Add team filter if a team is selected
      if (currentTeam) {
        query = query.eq('team_id', currentTeam.id);
      } else {
        query = query.is('team_id', null);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching projects:', error);
        toast.error('No se pudieron cargar los proyectos. Intenta de nuevo.');
        return;
      }

      // Fetch pieces for each project with their materials
      const projectsWithPieces = await Promise.all(
        (data || []).map(async (project: DatabaseProject) => {
          const { data: pieces } = await supabase
            .from('pieces')
            .select(`
              *,
              piece_materials (*)
            `)
            .eq('project_id', project.id);
          
          // Process pieces (handle both new system and legacy)
          const processedPieces = await processPieces(pieces || [], supabase);
          
          return { ...project, pieces: processedPieces };
        })
      );

      setProjects(projectsWithPieces);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('No se pudieron cargar los proyectos. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadProject = async (project: DatabaseProject) => {
    try {
      // Fetch pieces for the project with their materials
      const { data: pieces, error } = await supabase
        .from('pieces')
        .select(`
          *,
          piece_materials (*)
        `)
        .eq('project_id', project.id);

      if (error) {
        console.error('Error fetching pieces:', error);
        toast.error('No se pudieron cargar las piezas del proyecto. Intenta de nuevo.');
        return;
      }

      // Process pieces (handle both new system and legacy)
      const piecesWithMaterials = await processPieces(pieces || [], supabase);

      const projectWithPieces = { ...project, pieces: piecesWithMaterials };
      onLoadProject(projectWithPieces);
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('No se pudo cargar el proyecto. Intenta de nuevo.');
    }
  };

  const handleEditProject = async (project: DatabaseProject) => {
    if (!onEditProject) {
      // Fallback: si no hay onEditProject, usar el flujo normal
      handleLoadProject(project);
      return;
    }

    try {
      // Reload the complete project from database to ensure we have all fields including postprocessing_items
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .select('*')
        .eq('id', project.id)
        .single();

      if (projectError) {
        console.error('Error fetching project:', projectError);
        toast.error('No se pudo cargar el proyecto. Intenta de nuevo.');
        return;
      }

      // Fetch pieces for the project with their materials
      const { data: pieces, error: piecesError } = await supabase
        .from('pieces')
        .select(`
          *,
          piece_materials (*)
        `)
        .eq('project_id', project.id);

      if (piecesError) {
        console.error('Error fetching pieces:', piecesError);
        toast.error('No se pudieron cargar las piezas del proyecto. Intenta de nuevo.');
        return;
      }

      // Process pieces (handle both new system and legacy)
      const piecesWithMaterials = await processPieces(pieces || [], supabase);

      const projectWithPieces = { ...projectData, pieces: piecesWithMaterials };
      onEditProject(projectWithPieces);
    } catch (error) {
      console.error('Error loading project for edit:', error);
      toast.error('No se pudo cargar el proyecto para editar. Intenta de nuevo.');
    }
  };

  const handleCreateProject = async () => {
    if (!newProjectName.trim() || !user) return;

    try {
      const { data, error } = await supabase
        .from('projects')
        .insert([{
          name: newProjectName,
          user_id: user.id,
          team_id: currentTeam?.id || null,
          status: 'draft',
          total_cost: 0,
          filament_weight: 0,
          filament_price: 0,
          print_hours: 0,
          electricity_cost: 0,
          materials: [],
          vat_percentage: 21,
          profit_margin: 15,
          recommended_price: 0,
          created_at: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) {
        console.error('Error creating project:', error);
        toast.error('No se pudo crear el proyecto. Intenta de nuevo.');
        return;
      }

      setProjects([...projects, { ...data, pieces: [] }]);
      setNewProjectName('');
      setShowCreateModal(false);
      toast.success('Proyecto creado correctamente.');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('No se pudo crear el proyecto. Intenta de nuevo.');
    }
  };

  const handleDeleteProject = (id: string) => {
    setProjectToDelete(id);
    setShowDeleteModal(true);
  };

  const confirmDeleteProject = async () => {
    if (!projectToDelete) return;

    try {
      // Delete pieces first
      const { error: piecesError } = await supabase
        .from('pieces')
        .delete()
        .eq('project_id', projectToDelete);

      if (piecesError) {
        console.error('Error deleting pieces:', piecesError);
        toast.error('No se pudieron eliminar las piezas del proyecto. Intenta de nuevo.');
        return;
      }

      // Delete project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', projectToDelete);

      if (error) {
        console.error('Error deleting project:', error);
        toast.error('No se pudo eliminar el proyecto. Intenta de nuevo.');
        return;
      }

      // Update local state
      setProjects(projects.filter(p => p.id !== projectToDelete));
      toast.success('Proyecto eliminado correctamente.');
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('No se pudo eliminar el proyecto. Intenta de nuevo.');
    } finally {
      setShowDeleteModal(false);
      setProjectToDelete(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-700';
      case 'calculated': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'draft': return 'Borrador';
      case 'calculated': return 'Calculado';
      case 'completed': return 'Completado';
      default: return 'Desconocido';
    }
  };

  if (loading) {
    return <ProjectManagerSkeleton />;
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
          <FileText className="w-8 h-8 text-slate-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Gestión de Proyectos</h1>
        <p className="text-slate-600">Administra y reutiliza tus proyectos de impresión 3D</p>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-slate-100">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar proyectos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
            />
          </div>
          <button
            className="flex items-center justify-center space-x-2 px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-medium shadow-md hover:shadow-lg flex-shrink-0 w-full sm:w-auto"
            onClick={() => setShowCreateModal(true)}
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Proyecto</span>
          </button>
        </div>
      </div>

      {/* Lista de proyectos */}
      <div className="grid gap-6">
        {filteredProjects.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center border border-gray-100">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No hay proyectos</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm
                ? 'No se encontraron proyectos con la búsqueda realizada'
                : 'Comienza creando tu primer proyecto de impresión 3D'
              }
            </p>
            <button 
              onClick={() => setShowCreateModal(true)}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 font-medium shadow-md hover:shadow-lg"
            >
              Crear Proyecto
            </button>
          </div>
        ) : (
          filteredProjects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-lg p-6 border border-slate-100 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-slate-900">{project.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                      {getStatusText(project.status)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-slate-600">
                    <div className="flex items-center space-x-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(project.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Euro className="w-4 h-4" />
                      <span className="font-medium">{formatCurrency(project.total_cost)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleLoadProject(project)}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Ver detalles</span>
                  </button>
                  <button
                    onClick={() => handleEditProject(project)}
                    className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                  >
                    <Pencil className="w-4 h-4" />
                    <span>Editar</span>
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium shadow-sm hover:shadow-md"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              
              {/* Resumen del proyecto */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm mb-6">
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <div className="flex items-center gap-2 font-medium text-blue-700 mb-1">
                    <Package className="w-4 h-4" />
                    Peso Total
                  </div>
                  <div className="text-blue-900 font-bold text-lg">
                    {(() => {
                      if (project.pieces && project.pieces.length > 0) {
                        const totalWeight = project.pieces.reduce((sum, piece) => {
                          if (piece.materials && piece.materials.length > 0) {
                            const pieceWeight = piece.materials.reduce((materialSum, material) => {
                              const weightInGrams = material.unit === 'kg' ? material.weight * 1000 : material.weight;
                              return materialSum + weightInGrams;
                            }, 0);
                            return sum + (pieceWeight * piece.quantity);
                          } else {
                            return sum + (piece.filament_weight * piece.quantity);
                          }
                        }, 0);
                        return totalWeight >= 1000 ? `${(totalWeight / 1000).toFixed(1)}kg` : `${totalWeight.toFixed(1)}g`;
                      }
                      return `${project.filament_weight}g`;
                    })()}
                  </div>
                </div>
                <div className="bg-green-50 p-3 rounded-lg border border-green-100">
                  <div className="flex items-center gap-2 font-medium text-green-700 mb-1">
                    <Clock className="w-4 h-4" />
                    Tiempo Total
                  </div>
                  <div className="text-green-900 font-bold text-lg">
                    {(() => {
                      if (project.pieces && project.pieces.length > 0) {
                        const totalHours = project.pieces.reduce((sum, piece) => sum + (piece.print_hours * piece.quantity), 0);
                        return `${totalHours.toFixed(1)}h`;
                      }
                      return `${project.print_hours}h`;
                    })()}
                  </div>
                </div>
                <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                  <div className="flex items-center gap-2 font-medium text-purple-700 mb-1">
                    <Layers className="w-4 h-4" />
                    Piezas
                  </div>
                  <div className="text-purple-900 font-bold text-lg">
                    {project.pieces?.length || 0}
                  </div>
                </div>
                <div className="bg-orange-50 p-3 rounded-lg border border-orange-100">
                  <div className="flex items-center gap-2 font-medium text-orange-700 mb-1">
                    <Euro className="w-4 h-4" />
                    Coste Total
                  </div>
                  <div className="text-orange-900 font-bold text-lg">{formatCurrency(project.total_cost)}</div>
                </div>
              </div>

              {/* Desglose de piezas */}
              {project.pieces && project.pieces.length > 0 && (
                <div className="space-y-3">
                  <h4 className="flex items-center gap-2 font-semibold text-gray-900 text-sm mb-3">
                    <Layers className="w-4 h-4" />
                    Desglose por piezas
                  </h4>
                  <div className="space-y-2">
                    {project.pieces.map((piece, pieceIndex) => {
                      const pieceWeight = piece.materials && piece.materials.length > 0 
                        ? piece.materials.reduce((sum, material) => {
                            const weightInGrams = material.unit === 'kg' ? material.weight * 1000 : material.weight;
                            return sum + weightInGrams;
                          }, 0)
                        : piece.filament_weight;
                      
                      const pieceCost = piece.materials && piece.materials.length > 0
                        ? piece.materials.reduce((sum, material) => {
                            const weightInKg = material.unit === 'g' ? material.weight / 1000 : material.weight;
                            return sum + (weightInKg * material.price_per_kg);
                          }, 0)
                        : (piece.filament_weight * piece.filament_price) / 1000;

                      return (
                        <div key={piece.id} className="bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <div className="flex items-center justify-between mb-2">
                            <h5 className="font-medium text-gray-900">{piece.name}</h5>
                            <span className="text-sm text-gray-600">x{piece.quantity}</span>
                          </div>
                          
                          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-xs">
                            <div>
                              <div className="flex items-center gap-1 text-gray-600 mb-1">
                                <Package className="w-3 h-3" />
                                Peso
                              </div>
                              <div className="font-medium text-gray-900">
                                {pieceWeight >= 1000 ? `${(pieceWeight / 1000).toFixed(1)}kg` : `${pieceWeight.toFixed(1)}g`}
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center gap-1 text-gray-600 mb-1">
                                <Clock className="w-3 h-3" />
                                Tiempo
                              </div>
                              <div className="font-medium text-gray-900">{piece.print_hours.toFixed(1)}h</div>
                            </div>
                            <div>
                              <div className="flex items-center gap-1 text-gray-600 mb-1">
                                <Euro className="w-3 h-3" />
                                Coste
                              </div>
                              <div className="font-medium text-gray-900">{formatCurrency(pieceCost * piece.quantity)}</div>
                            </div>
                            <div>
                              <div className="flex items-center gap-1 text-gray-600 mb-1">
                                <Zap className="w-3 h-3" />
                                Materiales
                              </div>
                              <div className="font-medium text-gray-900">
                                {piece.materials?.length || 0} tipos
                              </div>
                            </div>
                          </div>

                          {/* Desglose de materiales de la pieza */}
                          {piece.materials && piece.materials.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-gray-200">
                              <div className="text-xs text-gray-600 mb-2">Materiales utilizados:</div>
                              <div className="space-y-1">
                                {piece.materials.map((material, materialIndex) => (
                                  <div key={material.id || materialIndex} className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-2">
                                      <div 
                                        className="w-3 h-3 rounded-full border border-gray-300" 
                                        style={{ backgroundColor: material.color || '#808080' }}
                                      />
                                      <span className="text-gray-700">
                                        {material.material_name || 'Material sin nombre'}
                                      </span>
                                      <span className="text-gray-500">
                                        ({material.material_type || 'PLA'})
                                      </span>
                                    </div>
                                    <div className="text-gray-600">
                                      {material.weight || 0}{material.unit || 'g'} • {formatCurrency((material.weight || 0) * (material.price_per_kg || 0) / (material.unit === 'kg' ? 1 : 1000))}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </motion.div>
          ))
        )}
      </div>
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-md relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowCreateModal(false)}
            >
              ×
            </button>
            <h2 className="text-xl font-semibold mb-4">Crear nuevo proyecto</h2>
            <ProjectInfo
              projectName={newProjectName}
              projectType={newProjectType}
              onProjectNameChange={setNewProjectName}
              onProjectTypeChange={setNewProjectType}
              onReset={() => {
                setNewProjectName('');
                setNewProjectType('filament');
              }}
              onSave={handleCreateProject}
            />
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Contexto actual</label>
              <div className="text-sm text-gray-600 p-2 bg-gray-50 rounded-lg">
                {currentTeam ? `Equipo: ${currentTeam.name}` : 'Vista Personal'}
              </div>
            </div>
            <button
              onClick={handleCreateProject}
              className="mt-6 w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Crear Proyecto
            </button>
          </div>
        </div>
      )}

      {/* Modal de confirmación para eliminar proyecto */}
      <ConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setProjectToDelete(null);
        }}
        onConfirm={confirmDeleteProject}
        title="Eliminar proyecto"
        message="¿Estás seguro de que quieres eliminar este proyecto? Esta acción no se puede deshacer y se eliminarán todas las piezas asociadas."
        confirmText="Eliminar"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
}