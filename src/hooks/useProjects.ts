import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTeam } from '@/components/providers/TeamProvider';
import { projectService } from '@/services/projectService';
import type { Project, DatabaseProject } from '@/types';
import toast from 'react-hot-toast';
import { useMemo } from 'react';
import { logger } from '@/lib/logger';

export function useProjects() {
  const { user } = useAuth();
  const { currentTeam, isEditingMode, editingTeam } = useTeam();
  const queryClient = useQueryClient();

  const effectiveTeamId = (isEditingMode && editingTeam) ? editingTeam.id : currentTeam?.id;

  // Query para obtener proyectos
  const { data: projects = [], isLoading, error, refetch } = useQuery({
    queryKey: ['projects', user?.id, effectiveTeamId],
    queryFn: async () => {
      if (!user) return [];
      try {
        return await projectService.getProjects(user.id, effectiveTeamId);
      } catch (err) {
        logger.error('Error fetching projects:', err);
        throw err;
      }
    },
    enabled: !!user,
  });

  // Mutation para crear proyecto
  const createProjectMutation = useMutation({
    mutationFn: async (projectData: Omit<DatabaseProject, 'id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');
      return await projectService.createProject(projectData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id, effectiveTeamId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id, effectiveTeamId] });
      toast.success('Project created successfully');
    },
    onError: (err: Error) => {
      logger.error('Error creating project:', err);
      toast.error(err.message || 'Error creating project');
    },
  });

  // Mutation para actualizar proyecto
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<DatabaseProject> }) => {
      return await projectService.updateProject(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id, effectiveTeamId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id, effectiveTeamId] });
      toast.success('Project updated successfully');
    },
    onError: (err: Error) => {
      logger.error('Error updating project:', err);
      toast.error(err.message || 'Error updating project');
    },
  });

  // Mutation para eliminar proyecto
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: string) => {
      return await projectService.deleteProject(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', user?.id, effectiveTeamId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id, effectiveTeamId] });
      toast.success('Project deleted successfully');
    },
    onError: (err: Error) => {
      logger.error('Error deleting project:', err);
      toast.error(err.message || 'Error deleting project');
    },
  });

  const getProjectStats = useMemo(() => {
    return {
      totalProjects: projects.length,
      totalCost: projects.reduce((sum, p) => sum + p.total_cost, 0),
      averageCost: projects.length > 0 ? projects.reduce((sum, p) => sum + p.total_cost, 0) / projects.length : 0
    };
  }, [projects]);

  return {
    projects,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    createProject: createProjectMutation.mutateAsync,
    updateProject: updateProjectMutation.mutateAsync,
    deleteProject: deleteProjectMutation.mutateAsync,
    isCreating: createProjectMutation.isPending,
    isUpdating: updateProjectMutation.isPending,
    isDeleting: deleteProjectMutation.isPending,
    getProjectStats,
    refetch,
  };
}
