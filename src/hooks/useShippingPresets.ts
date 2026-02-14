import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTeam } from '@/components/providers/TeamProvider';
import {
  getShippingPresets,
  getDefaultShippingPreset,
  createShippingPreset,
  updateShippingPreset,
  deleteShippingPreset,
  setDefaultShippingPreset,
  getShippingPresetStats,
  testShippingPresetsConnection,
} from '@/services/shippingPresetService';
import type { ShippingPreset } from '@/types';
import { toast } from 'react-hot-toast';

export function useShippingPresets() {
  const { user } = useAuth();
  const { currentTeam, isEditingMode, editingTeam } = useTeam();
  const [presets, setPresets] = useState<ShippingPreset[]>([]);
  const [defaultPreset, setDefaultPreset] = useState<ShippingPreset | null>(null);
  const [stats, setStats] = useState<{ total: number }>({ total: 0 });
  const [loading, setLoading] = useState(true);

  const effectiveTeamId = isEditingMode && editingTeam ? editingTeam.id : currentTeam?.id;

  const loadPresets = useCallback(async () => {
    if (!user) {
      setPresets([]);
      setDefaultPreset(null);
      setStats({ total: 0 });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const connectionTest = await testShippingPresetsConnection();
      if (!connectionTest.success) {
        toast.error(`Error de conexión: ${connectionTest.error}`);
        setPresets([]);
        setDefaultPreset(null);
        setStats({ total: 0 });
        return;
      }

      const [presetsData, defaultPresetData, statsData] = await Promise.all([
        getShippingPresets(user.id, effectiveTeamId),
        getDefaultShippingPreset(user.id, effectiveTeamId),
        getShippingPresetStats(user.id, effectiveTeamId),
      ]);

      setPresets(presetsData);
      setDefaultPreset(defaultPresetData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading shipping presets:', error);
      toast.error('Error al cargar los perfiles de envío');
    } finally {
      setLoading(false);
    }
  }, [user, effectiveTeamId]);

  useEffect(() => {
    loadPresets();
  }, [loadPresets]);

  const addPreset = async (
    preset: Omit<ShippingPreset, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<ShippingPreset | null> => {
    if (!user) {
      toast.error('Debes iniciar sesión para crear perfiles');
      return null;
    }

    try {
      const newPreset = await createShippingPreset(
        preset,
        user.id,
        effectiveTeamId
      );

      if (newPreset) {
        await loadPresets();
        toast.success('Perfil de envío creado correctamente');
        return newPreset;
      }

      toast.error('Error al crear el perfil');
      return null;
    } catch (error) {
      console.error('Error creating preset:', error);
      toast.error('Error al crear el perfil de envío');
      return null;
    }
  };

  const updatePresetData = async (
    presetId: string,
    updates: Partial<Omit<ShippingPreset, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<boolean> => {
    try {
      const updatedPreset = await updateShippingPreset(presetId, updates);

      if (updatedPreset) {
        await loadPresets();
        toast.success('Perfil actualizado correctamente');
        return true;
      }

      toast.error('Error al actualizar el perfil');
      return false;
    } catch (error) {
      console.error('Error updating preset:', error);
      toast.error('Error al actualizar el perfil de envío');
      return false;
    }
  };

  const removePreset = async (presetId: string): Promise<boolean> => {
    try {
      const success = await deleteShippingPreset(presetId);

      if (success) {
        await loadPresets();
        toast.success('Perfil eliminado correctamente');
        return true;
      }

      toast.error('Error al eliminar el perfil');
      return false;
    } catch (error) {
      console.error('Error deleting preset:', error);
      toast.error('Error al eliminar el perfil de envío');
      return false;
    }
  };

  const setAsDefault = async (presetId: string): Promise<boolean> => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      return false;
    }

    try {
      const success = await setDefaultShippingPreset(presetId, user.id);

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

  const getPresetById = (presetId: string): ShippingPreset | undefined => {
    return presets.find((preset) => preset.id === presetId);
  };

  return {
    presets,
    defaultPreset,
    stats,
    loading,
    addPreset,
    updatePreset: updatePresetData,
    removePreset,
    setAsDefault,
    getPresetById,
    refreshPresets: loadPresets,
  };
}
