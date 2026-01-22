import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTeam } from '@/components/providers/TeamProvider';
import {
  getPostprocessingPresets,
  getDefaultPostprocessingPreset,
  createPostprocessingPreset,
  updatePostprocessingPreset,
  deletePostprocessingPreset,
  setDefaultPostprocessingPreset,
  getPostprocessingPresetStats,
  testPostprocessingPresetsConnection,
} from '@/services/postprocessingPresetService';
import type { PostprocessingPreset, DatabasePostprocessingPreset } from '@/types';
import { toast } from 'react-hot-toast';

export function usePostprocessingPresets(category?: string) {
  const { user } = useAuth();
  const { currentTeam, isEditingMode, editingTeam } = useTeam();
  const [presets, setPresets] = useState<PostprocessingPreset[]>([]);
  const [defaultPreset, setDefaultPreset] = useState<PostprocessingPreset | null>(null);
  const [stats, setStats] = useState<{ total: number; byCategory: { [key: string]: number } }>({ total: 0, byCategory: {} });
  const [loading, setLoading] = useState(true);
  
  // Calcular el equipo efectivo directamente
  const effectiveTeamId = isEditingMode && editingTeam ? editingTeam.id : currentTeam?.id;

  const loadPresets = useCallback(async () => {
    if (!user) {
      setPresets([]);
      setDefaultPreset(null);
      setStats({ total: 0, byCategory: {} });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Primero verificar la conexión a la base de datos
      const connectionTest = await testPostprocessingPresetsConnection();
      if (!connectionTest.success) {
        toast.error(`Error de conexión: ${connectionTest.error}`);
        setPresets([]);
        setDefaultPreset(null);
        setStats({ total: 0, byCategory: {} });
        return;
      }
      
      const [presetsData, defaultPresetData, statsData] = await Promise.all([
        getPostprocessingPresets(user.id, effectiveTeamId, category),
        getDefaultPostprocessingPreset(user.id, effectiveTeamId, category),
        getPostprocessingPresetStats(user.id, effectiveTeamId),
      ]);

      setPresets(presetsData);
      setDefaultPreset(defaultPresetData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading postprocessing presets:', error);
      toast.error('Error al cargar los perfiles de postproducción');
    } finally {
      setLoading(false);
    }
  }, [user, effectiveTeamId, category]);

  // Cargar presets al montar el componente
  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  // Crear un nuevo preset
  const addPreset = async (
    preset: Omit<DatabasePostprocessingPreset, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<PostprocessingPreset | null> => {
    if (!user) {
      toast.error('Debes iniciar sesión para crear perfiles');
      return null;
    }

    try {
      const newPreset = await createPostprocessingPreset(
        preset,
        user.id,
        effectiveTeamId
      );

      if (newPreset) {
        await loadPresets();
        toast.success('Perfil de postproducción creado correctamente');
        return newPreset;
      }

      toast.error('Error al crear el perfil');
      return null;
    } catch (error) {
      console.error('Error creating preset:', error);
      toast.error('Error al crear el perfil de postproducción');
      return null;
    }
  };

  // Actualizar un preset existente
  const updatePreset = async (
    presetId: string,
    updates: Partial<Omit<DatabasePostprocessingPreset, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<boolean> => {
    try {
      const updatedPreset = await updatePostprocessingPreset(presetId, updates);

      if (updatedPreset) {
        await loadPresets();
        toast.success('Perfil actualizado correctamente');
        return true;
      }

      toast.error('Error al actualizar el perfil');
      return false;
    } catch (error) {
      console.error('Error updating preset:', error);
      toast.error('Error al actualizar el perfil de postproducción');
      return false;
    }
  };

  // Eliminar un preset
  const removePreset = async (presetId: string): Promise<boolean> => {
    try {
      const success = await deletePostprocessingPreset(presetId);

      if (success) {
        await loadPresets();
        toast.success('Perfil eliminado correctamente');
        return true;
      }

      toast.error('Error al eliminar el perfil');
      return false;
    } catch (error) {
      console.error('Error deleting preset:', error);
      toast.error('Error al eliminar el perfil de postproducción');
      return false;
    }
  };

  // Establecer un preset como predeterminado
  const setAsDefault = async (presetId: string): Promise<boolean> => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      return false;
    }

    try {
      const success = await setDefaultPostprocessingPreset(presetId, user.id);

      if (success) {
        await loadPresets();
        toast.success('Perfil establecido como favorito');
        return true;
      }

      toast.error('Error al establecer el perfil como favorito');
      return false;
    } catch (error) {
      console.error('Error setting default preset:', error);
      toast.error('Error al establecer el perfil como favorito');
      return false;
    }
  };

  // Obtener un preset específico por ID
  const getPresetById = (presetId: string): PostprocessingPreset | undefined => {
    return presets.find((preset) => preset.id === presetId);
  };

  // Obtener presets filtrados por categoría
  const getPresetsByCategory = (cat: string): PostprocessingPreset[] => {
    return presets.filter(preset => preset.category === cat);
  };

  // Obtener el coste por unidad de un preset
  const getCostPerUnit = (presetId: string): number | null => {
    const preset = getPresetById(presetId);
    return preset ? preset.cost_per_unit : null;
  };

  // Crear un preset desde un item de postproducción
  const createPresetFromItem = async (item: {
    name: string;
    cost_per_unit: number;
    quantity: number;
    unit: string;
    description?: string;
    category?: string;
  }) => {
    if (!user) {
      toast.error('Debes estar autenticado para crear presets');
      return null;
    }

    try {
      setLoading(true);
      
      const newPreset = await createPostprocessingPreset({
        name: item.name,
        description: item.description,
        cost_per_unit: item.cost_per_unit, // Ya es coste por unidad
        unit: item.unit,
        category: item.category,
        notes: `Creado desde item: ${item.name}`,
        is_default: false
      }, user.id, effectiveTeamId);
      
      if (!newPreset) {
        throw new Error('No se pudo crear el preset');
      }

      // Recargar presets
      await loadPresets();
      
      toast.success('Preset creado exitosamente');
      return newPreset;
    } catch (error) {
      console.error('Error creating preset from item:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      toast.error(`Error al crear el preset: ${errorMessage}`);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return {
    presets,
    defaultPreset,
    stats,
    loading,
    addPreset,
    updatePreset,
    removePreset,
    setAsDefault,
    getPresetById,
    getPresetsByCategory,
    getCostPerUnit,
    createPresetFromItem,
    refreshPresets: loadPresets,
  };
}
