import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Calendar, Euro, FileText } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTeam } from '@/components/providers/TeamProvider';
import type { DatabaseProject, DatabasePiece } from '@/types';
import { toast } from 'react-hot-toast';
import ProjectInfo from './cost-calculator/forms/ProjectInfo';
import ProjectManagerSkeleton from './skeletons/ProjectManagerSkeleton';

interface ProjectManagerProps {
  onLoadProject: (project: DatabaseProject & { pieces?: DatabasePiece[] }) => void;
}

export default function ProjectManager({ onLoadProject }: ProjectManagerProps) {
  const { user } = useAuth();
  const { currentTeam } = useTeam();
  const supabase = createClient();
  const [projects, setProjects] = useState<(DatabaseProject & { pieces?: DatabasePiece[] })[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

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
        toast.error('Error al cargar los proyectos');
        return;
      }

      // Fetch pieces for each project
      const projectsWithPieces = await Promise.all(
        (data || []).map(async (project) => {
          const { data: pieces } = await supabase
            .from('pieces')
            .select('*')
            .eq('project_id', project.id);
          return { ...project, pieces: pieces || [] };
        })
      );

      setProjects(projectsWithPieces);
    } catch (error) {
      console.error('Error fetching projects:', error);
      toast.error('Error al cargar los proyectos');
    } finally {
      setLoading(false);
    }
  };

  const handleLoadProject = async (project: DatabaseProject) => {
    try {
      // Fetch pieces for the project
      const { data: pieces, error } = await supabase
        .from('pieces')
        .select('*')
        .eq('project_id', project.id);

      if (error) {
        console.error('Error fetching pieces:', error);
        toast.error('Error al cargar las piezas del proyecto');
        return;
      }

      onLoadProject({ ...project, pieces: pieces || [] });
    } catch (error) {
      console.error('Error loading project:', error);
      toast.error('Error al cargar el proyecto');
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
        toast.error('Error al crear el proyecto');
        return;
      }

      setProjects([...projects, { ...data, pieces: [] }]);
      setNewProjectName('');
      setShowCreateModal(false);
      toast.success('Proyecto creado exitosamente');
    } catch (error) {
      console.error('Error creating project:', error);
      toast.error('Error al crear el proyecto');
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      // Delete pieces first
      const { error: piecesError } = await supabase
        .from('pieces')
        .delete()
        .eq('project_id', id);

      if (piecesError) {
        console.error('Error deleting pieces:', piecesError);
        toast.error('Error al eliminar las piezas del proyecto');
        return;
      }

      // Delete project
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting project:', error);
        toast.error('Error al eliminar el proyecto');
        return;
      }

      // Update local state
      setProjects(projects.filter(p => p.id !== id));
    } catch (error) {
      console.error('Error deleting project:', error);
      toast.error('Error al eliminar el proyecto');
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
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
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
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar proyectos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="pl-10 pr-8 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent appearance-none bg-white"
              >
                <option value="all">Todos</option>
                <option value="draft">Borradores</option>
                <option value="calculated">Calculados</option>
                <option value="completed">Completados</option>
              </select>
            </div>
          </div>
          <button
            className="flex items-center space-x-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium"
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
              {searchTerm || filterStatus !== 'all' 
                ? 'No se encontraron proyectos con los filtros aplicados'
                : 'Comienza creando tu primer proyecto de impresión 3D'
              }
            </p>
            <button className="px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 font-medium">
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
                      <span className="font-medium">€{project.total_cost.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleLoadProject(project)}
                    className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 text-sm font-medium"
                  >
                    Cargar
                  </button>
                  <button
                    onClick={() => handleDeleteProject(project.id)}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors duration-200 text-sm font-medium"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
              
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-gray-700">Filamento</div>
                  <div className="text-gray-900">{project.filament_weight}g</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-gray-700">Tiempo</div>
                  <div className="text-gray-900">{project.print_hours}h</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-gray-700">Materiales</div>
                  <div className="text-gray-900">{project.materials.length}</div>
                </div>
                <div className="bg-gray-50 p-3 rounded-lg">
                  <div className="font-medium text-gray-700">Coste Total</div>
                  <div className="text-gray-900 font-semibold">€{project.total_cost.toFixed(2)}</div>
                </div>
              </div>
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
              onProjectNameChange={setNewProjectName}
              onReset={() => setNewProjectName('')}
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
    </div>
  );
}