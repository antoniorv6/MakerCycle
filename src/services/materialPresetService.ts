import { createClient } from '@/lib/supabase';
import type { DatabaseMaterialPreset, MaterialPreset } from '@/types';

/**
 * Servicio para gestionar presets de materiales (filamentos, resinas, etc.)
 */

// Obtener todos los presets del usuario
export async function getMaterialPresets(userId: string, teamId?: string | null, category?: 'filament' | 'resin' | 'other'): Promise<MaterialPreset[]> {
  const supabase = createClient();

  try {
    let query = supabase
      .from('material_presets')
      .select('*')
      .eq('user_id', userId);

    // Si hay teamId, también traer los presets del equipo
    if (teamId) {
      query = supabase
        .from('material_presets')
        .select('*')
        .or(`user_id.eq.${userId},team_id.eq.${teamId}`);
    }

    // Filtrar por categoría si se especifica
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.order('is_default', { ascending: false }).order('name');

    if (error) {
      console.error('Error fetching material presets:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getMaterialPresets:', error);
    return [];
  }
}

// Obtener un preset específico por ID
export async function getMaterialPresetById(presetId: string): Promise<MaterialPreset | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('material_presets')
      .select('*')
      .eq('id', presetId)
      .single();

    if (error) {
      console.error('Error fetching material preset:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getMaterialPresetById:', error);
    return null;
  }
}

// Obtener el preset por defecto del usuario
export async function getDefaultMaterialPreset(userId: string, teamId?: string | null, category?: 'filament' | 'resin' | 'other'): Promise<MaterialPreset | null> {
  const supabase = createClient();

  try {
    let query = supabase
      .from('material_presets')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.single();

    if (error) {
      // Si no hay preset por defecto, no es un error crítico
      if (error.code === 'PGRST116') {
        return null;
      }
      console.error('Error fetching default material preset:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getDefaultMaterialPreset:', error);
    return null;
  }
}

// Crear un nuevo preset
export async function createMaterialPreset(
  preset: Omit<DatabaseMaterialPreset, 'id' | 'created_at' | 'updated_at'>
): Promise<MaterialPreset | null> {
  const supabase = createClient();

  try {
    // Si el nuevo preset es el predeterminado, desmarcar los demás de la misma categoría
    if (preset.is_default) {
      await supabase
        .from('material_presets')
        .update({ is_default: false })
        .eq('user_id', preset.user_id)
        .eq('category', preset.category);
    }

    const { data, error } = await supabase
      .from('material_presets')
      .insert([preset])
      .select()
      .single();

    if (error) {
      console.error('Error creating material preset:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createMaterialPreset:', error);
    return null;
  }
}

// Actualizar un preset existente
export async function updateMaterialPreset(
  presetId: string,
  updates: Partial<Omit<DatabaseMaterialPreset, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<MaterialPreset | null> {
  const supabase = createClient();

  try {
    // Si el preset actualizado se marca como predeterminado, desmarcar los demás de la misma categoría
    if (updates.is_default) {
      // Primero obtenemos el preset para saber el user_id y category
      const { data: currentPreset } = await supabase
        .from('material_presets')
        .select('user_id, category')
        .eq('id', presetId)
        .single();

      if (currentPreset) {
        await supabase
          .from('material_presets')
          .update({ is_default: false })
          .eq('user_id', currentPreset.user_id)
          .eq('category', currentPreset.category)
          .neq('id', presetId);
      }
    }

    const { data, error } = await supabase
      .from('material_presets')
      .update(updates)
      .eq('id', presetId)
      .select()
      .single();

    if (error) {
      console.error('Error updating material preset:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateMaterialPreset:', error);
    return null;
  }
}

// Eliminar un preset
export async function deleteMaterialPreset(presetId: string): Promise<boolean> {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from('material_presets')
      .delete()
      .eq('id', presetId);

    if (error) {
      console.error('Error deleting material preset:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteMaterialPreset:', error);
    return false;
  }
}

// Establecer un preset como predeterminado
export async function setDefaultMaterialPreset(presetId: string, userId: string): Promise<boolean> {
  const supabase = createClient();

  try {
    // Primero obtenemos la categoría del preset
    const { data: preset } = await supabase
      .from('material_presets')
      .select('category')
      .eq('id', presetId)
      .eq('user_id', userId)
      .single();

    if (!preset) {
      throw new Error('Preset not found');
    }

    // Desmarcar todos los presets de la misma categoría del usuario
    await supabase
      .from('material_presets')
      .update({ is_default: false })
      .eq('user_id', userId)
      .eq('category', preset.category);

    // Marcar el preset seleccionado como predeterminado
    const { error } = await supabase
      .from('material_presets')
      .update({ is_default: true })
      .eq('id', presetId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error setting default material preset:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in setDefaultMaterialPreset:', error);
    return false;
  }
}

// Obtener estadísticas de presets por categoría
export async function getMaterialPresetStats(userId: string, teamId?: string | null): Promise<{
  total: number;
  byCategory: { [key: string]: number };
}> {
  const supabase = createClient();

  try {
    let query = supabase
      .from('material_presets')
      .select('category')
      .eq('user_id', userId);

    if (teamId) {
      query = supabase
        .from('material_presets')
        .select('category')
        .or(`user_id.eq.${userId},team_id.eq.${teamId}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching material preset stats:', error);
      throw error;
    }

    const stats = {
      total: data?.length || 0,
      byCategory: {} as { [key: string]: number }
    };

    data?.forEach(preset => {
      stats.byCategory[preset.category] = (stats.byCategory[preset.category] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Error in getMaterialPresetStats:', error);
    return { total: 0, byCategory: {} };
  }
}
