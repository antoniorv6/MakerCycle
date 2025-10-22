import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTeam } from '@/components/providers/TeamProvider';
import { projectService } from '@/services/projectService';
import type { Project, DatabaseProject } from '@/types';
import toast from 'react-hot-toast';

// Cache for projects data
const projectsCache = new Map<string, { data: Project[], timestamp: number }>();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { currentTeam } = useTeam();

  const cacheKey = `${user?.id || ''}-${currentTeam?.id || 'personal'}`;

  const fetchProjects = useCallback(async () => {
    if (!user) return;
    
    // Check cache first
    const cached = projectsCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setProjects(cached.data);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await projectService.getProjects(user.id, currentTeam?.id);
      
      // Update cache
      projectsCache.set(cacheKey, { data, timestamp: Date.now() });
      setProjects(data);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setError(err instanceof Error ? err.message : 'Error fetching projects');
      toast.error('Error loading projects');
    } finally {
      setLoading(false);
    }
  }, [user, currentTeam, cacheKey]);

  const invalidateCache = useCallback(() => {
    projectsCache.delete(cacheKey);
  }, [cacheKey]);

  useEffect(() => {
    if (user) {
      fetchProjects();
    }
  }, [user, currentTeam, fetchProjects]);

  const createProject = useCallback(async (projectData: Omit<DatabaseProject, 'id' | 'created_at' | 'updated_at'>) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const newProject = await projectService.createProject(projectData);
      setProjects(prev => [newProject, ...prev]);
      invalidateCache();
      toast.success('Project created successfully');
      return newProject;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error creating project';
      toast.error(message);
      throw err;
    }
  }, [user, invalidateCache]);

  const updateProject = useCallback(async (id: string, updates: Partial<DatabaseProject>) => {
    try {
      const updatedProject = await projectService.updateProject(id, updates);
      setProjects(prev => prev.map(p => p.id === id ? updatedProject : p));
      invalidateCache();
      toast.success('Project updated successfully');
      return updatedProject;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating project';
      toast.error(message);
      throw err;
    }
  }, [invalidateCache]);

  const deleteProject = useCallback(async (id: string) => {
    try {
      await projectService.deleteProject(id);
      setProjects(prev => prev.filter(p => p.id !== id));
      invalidateCache();
      toast.success('Project deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error deleting project';
      toast.error(message);
      throw err;
    }
  }, [invalidateCache]);

  const getProjectStats = useMemo(() => {
    return {
      totalProjects: projects.length,
      totalCost: projects.reduce((sum, p) => sum + p.total_cost, 0),
      averageCost: projects.length > 0 ? projects.reduce((sum, p) => sum + p.total_cost, 0) / projects.length : 0
    };
  }, [projects]);

  return {
    projects,
    loading,
    error,
    createProject,
    updateProject,
    deleteProject,
    getProjectStats,
    refetch: fetchProjects,
    invalidateCache
  };
} 