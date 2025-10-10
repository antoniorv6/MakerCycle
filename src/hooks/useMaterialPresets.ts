import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTeam } from '@/components/providers/TeamProvider';
import {
  getMaterialPresets,
  getDefaultMaterialPreset,
  createMaterialPreset,
  updateMaterialPreset,
  deleteMaterialPreset,
  setDefaultMaterialPreset,
  getMaterialPresetStats,
} from '@/services/materialPresetService';
import type { MaterialPreset, DatabaseMaterialPreset } from '@/types';
import { toast } from 'react-hot-toast';

export function useMaterialPresets(category?: 'filament' | 'resin') {
  const { user } = useAuth();
  const { getEffectiveTeam } = useTeam();
  const [presets, setPresets] = useState<MaterialPreset[]>([]);
  const [defaultPreset, setDefaultPreset] = useState<MaterialPreset | null>(null);
  const [stats, setStats] = useState<{ total: number; byCategory: { [key: string]: number } }>({ total: 0, byCategory: {} });
  const [loading, setLoading] = useState(true);

  // Cargar presets al montar el componente
  useEffect(() => {
    loadPresets();
  }, [user, getEffectiveTeam(), category]);

  const loadPresets = async () => {
    if (!user) {
      setPresets([]);
      setDefaultPreset(null);
      setStats({ total: 0, byCategory: {} });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const teamId = getEffectiveTeam()?.id;
      const [presetsData, defaultPresetData, statsData] = await Promise.all([
        getMaterialPresets(user.id, teamId, category),
        getDefaultMaterialPreset(user.id, teamId, category),
        getMaterialPresetStats(user.id, teamId),
      ]);

      setPresets(presetsData);
      setDefaultPreset(defaultPresetData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading material presets:', error);
      toast.error('Error al cargar los perfiles de materiales');
    } finally {
      setLoading(false);
    }
  };

  // Crear un nuevo preset
  const addPreset = async (
    preset: Omit<DatabaseMaterialPreset, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<MaterialPreset | null> => {
    if (!user) {
      toast.error('Debes iniciar sesión para crear perfiles');
      return null;
    }

    try {
      const newPreset = await createMaterialPreset(
        preset,
        user.id,
        getEffectiveTeam()?.id
      );

      if (newPreset) {
        await loadPresets();
        toast.success('Perfil de material creado correctamente');
        return newPreset;
      }

      toast.error('Error al crear el perfil');
      return null;
    } catch (error) {
      console.error('Error creating preset:', error);
      toast.error('Error al crear el perfil de material');
      return null;
    }
  };

  // Actualizar un preset existente
  const updatePreset = async (
    presetId: string,
    updates: Partial<Omit<DatabaseMaterialPreset, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<boolean> => {
    try {
      const updatedPreset = await updateMaterialPreset(presetId, updates);

      if (updatedPreset) {
        await loadPresets();
        toast.success('Perfil actualizado correctamente');
        return true;
      }

      toast.error('Error al actualizar el perfil');
      return false;
    } catch (error) {
      console.error('Error updating preset:', error);
      toast.error('Error al actualizar el perfil de material');
      return false;
    }
  };

  // Eliminar un preset
  const removePreset = async (presetId: string): Promise<boolean> => {
    try {
      const success = await deleteMaterialPreset(presetId);

      if (success) {
        await loadPresets();
        toast.success('Perfil eliminado correctamente');
        return true;
      }

      toast.error('Error al eliminar el perfil');
      return false;
    } catch (error) {
      console.error('Error deleting preset:', error);
      toast.error('Error al eliminar el perfil de material');
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
      const success = await setDefaultMaterialPreset(presetId, user.id);

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
  const getPresetById = (presetId: string): MaterialPreset | undefined => {
    return presets.find((preset) => preset.id === presetId);
  };

  // Obtener presets filtrados por categoría
  const getPresetsByCategory = (cat: 'filament' | 'resin'): MaterialPreset[] => {
    return presets.filter(preset => preset.category === cat);
  };

  // Obtener el precio por unidad de un preset
  const getPricePerUnit = (presetId: string): number | null => {
    const preset = getPresetById(presetId);
    return preset ? preset.price_per_unit : null;
  };

  // Convertir precio entre unidades
  const convertPrice = (price: number, fromUnit: string, toUnit: string): number => {
    const conversions: { [key: string]: { [key: string]: number } } = {
      'g': { 'kg': 1000, 'ml': 1, 'l': 1000 },
      'kg': { 'g': 0.001, 'ml': 1000, 'l': 1 },
      'ml': { 'g': 1, 'kg': 0.001, 'l': 0.001 },
      'l': { 'g': 1000, 'kg': 1, 'ml': 1000 },
    };

    if (fromUnit === toUnit) return price;
    if (!conversions[fromUnit] || !conversions[fromUnit][toUnit]) return price;

    return price * conversions[fromUnit][toUnit];
  };

  const createPresetFromMaterial = async (material: {
    materialName: string;
    materialType: string;
    weight: number;
    pricePerKg: number;
    unit: string;
    category: 'filament' | 'resin';
    color?: string;
    brand?: string;
    notes?: string;
  }) => {
    if (!user) {
      toast.error('Debes estar autenticado para crear presets');
      return null;
    }

    try {
      setLoading(true);
      
      // Convertir precio a la unidad estándar (kg para filamentos, ml para resinas)
      const standardUnit = material.category === 'filament' ? 'kg' : 'ml';
      const standardPrice = convertPrice(material.pricePerKg, 'kg', standardUnit);
      
      // Manejar el color correctamente - si es vacío o undefined, usar gris por defecto
      const colorValue = material.color && 
                        material.color.trim() !== '' 
                        ? material.color : '#808080';
      
      const newPreset = await createMaterialPreset({
        name: material.materialName,
        price_per_unit: standardPrice,
        unit: standardUnit,
        material_type: material.materialType,
        category: material.category,
        color: colorValue,
        brand: material.brand,
        notes: material.notes || `Creado desde material: ${material.materialName}`,
        is_default: false
      }, user.id, getEffectiveTeam()?.id);
      

      if (!newPreset) {
        throw new Error('No se pudo crear el preset');
      }

      // Recargar presets
      await loadPresets();
      
      toast.success('Preset creado exitosamente');
      return newPreset;
    } catch (error) {
      console.error('Error creating preset from material:', error);
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
    getPricePerUnit,
    convertPrice,
    createPresetFromMaterial,
    refreshPresets: loadPresets,
  };
}
