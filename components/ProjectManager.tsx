import React, { useState, useEffect } from 'react';
import { Plus, Search, Filter, Upload, FileText, Calendar, Euro } from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import type { DatabaseProject, DatabasePiece, Team } from '@/components/cost-calculator/types';
import toast from 'react-hot-toast';
import { ProjectManagerSkeleton } from '@/components/skeletons';
import ProjectInfo from './cost-calculator/forms/ProjectInfo';

interface ProjectManagerProps {
  onLoadProject: (project: DatabaseProject & { pieces?: DatabasePiece[] }) => void;
}

export default function ProjectManager({ onLoadProject }: ProjectManagerProps) {
  const [projects, setProjects] = useState<DatabaseProject[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      fetchProjects();
      fetchTeams();
    }
  }, [user]);

  const fetchProjects = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching projects:', error);
        return;
      }

      setProjects(data || []);
    } catch (error) {
      console.error('Error fetching projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('team_members')
      .select('team_id, teams(*)')
      .eq('user_id', user.id);
    if (!error && data) {
      setTeams(data.map((tm: any) => tm.teams));
    }
  };

  const handleLoadProject = async (project: DatabaseProject) => {
    try {
      // Fetch pieces for this project
      const { data: pieces, error: piecesError } = await supabase
        .from('pieces')
        .select('*')
        .eq('project_id', project.id)
        .order('created_at', { ascending: true });

      if (piecesError) {
        console.error('Error fetching pieces:', piecesError);
        // Load project without pieces
        onLoadProject(project);
        return;
      }

      // Load project with pieces
      onLoadProject({
        ...project,
        pieces: pieces || []
      });
    } catch (error) {
      console.error('Error loading project with pieces:', error);
      // Load project without pieces as fallback
      onLoadProject(project);
    }
  };

  const handleCreateProject = async () => {
    if (!user || !newProjectName.trim()) return;
    const { data, error } = await supabase
      .from('projects')
      .insert([{
        name: newProjectName,
        user_id: user.id,
        team_id: selectedTeamId,
        filament_weight: 0,
        filament_price: 0,
        print_hours: 0,
        electricity_cost: 0,
        materials: [],
        total_cost: 0,
        vat_percentage: 21,
        profit_margin: 15,
        recommended_price: 0,
        status: 'draft',
      }])
      .select()
      .single();
    if (!error && data) {
      setProjects([data, ...projects]);
      setShowCreateModal(false);
      setNewProjectName('');
      setSelectedTeamId(null);
      toast.success('Proyecto creado');
    } else {
      toast.error('Error al crear el proyecto');
    }
  };

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || project.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleDeleteProject = async (id: string) => {
    try {
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Proyectos</h1>
        <p className="text-gray-600">Administra y reutiliza tus proyectos de impresión 3D</p>
      </div>

      {/* Controles */}
      <div className="bg-white rounded-xl shadow-lg p-6 mb-8 border border-gray-100">
        <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
          <div className="flex flex-1 gap-4 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar proyectos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
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
              className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-xl font-semibold text-gray-900">{project.name}</h3>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                      {getStatusText(project.status)}
                    </span>
                  </div>
                  <div className="flex items-center space-x-4 text-sm text-gray-600">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipo</label>
              <select
                value={selectedTeamId || ''}
                onChange={e => setSelectedTeamId(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Personal (sin equipo)</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
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