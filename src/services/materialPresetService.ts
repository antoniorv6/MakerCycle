import { createClient } from '@/lib/supabase';
import type { DatabaseMaterialPreset, MaterialPreset } from '@/types';

/**
 * Servicio para gestionar presets de materiales (filamentos, resinas, etc.)
 */

// Función de diagnóstico para verificar la conexión a la base de datos
export async function testMaterialPresetsConnection(): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  try {
    // Verificar autenticación primero
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      return { success: false, error: `Authentication error: ${authError.message}` };
    }
    
    if (!user) {
      return { success: false, error: 'No authenticated user' };
    }
    
    // Intentar hacer una consulta simple para verificar que la tabla existe
    const { data, error } = await supabase
      .from('material_presets')
      .select('count')
      .limit(1);
    
    if (error) {
      return { success: false, error: `Table access error: ${error.message} (Code: ${error.code})` };
    }
    return { success: true };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

// Obtener todos los presets del usuario
export async function getMaterialPresets(userId: string, teamId?: string | null, category?: 'filament' | 'resin'): Promise<MaterialPreset[]> {
  const supabase = createClient();

  try {
    // Primero verificar la conexión
    const connectionTest = await testMaterialPresetsConnection();
    if (!connectionTest.success) {
      return [];
    }

    let query = supabase
      .from('material_presets')
      .select('*');

    // Si hay teamId, también traer los presets del equipo
    if (teamId) {
      query = query.or(`user_id.eq.${userId},team_id.eq.${teamId}`);
    } else {
      query = query.eq('user_id', userId);
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
export async function getDefaultMaterialPreset(userId: string, teamId?: string | null, category?: 'filament' | 'resin'): Promise<MaterialPreset | null> {
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

    const { data, error } = await query.limit(1);

    if (error) {
      console.error('Error fetching default material preset:', error);
      return null;
    }

    // Si no hay datos o el array está vacío, devolver null
    if (!data || data.length === 0) {
      return null;
    }

    return data[0];
  } catch (error) {
    console.error('Error in getDefaultMaterialPreset:', error);
    return null;
  }
}

// Crear un nuevo preset
export async function createMaterialPreset(
  preset: Omit<DatabaseMaterialPreset, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'team_id'>,
  userId: string,
  teamId?: string | null
): Promise<MaterialPreset | null> {
  const supabase = createClient();

  try {
    const presetData = {
      ...preset,
      user_id: userId,
      team_id: teamId || null
    };

    // Si el nuevo preset es el predeterminado, desmarcar los demás de la misma categoría
    if (preset.is_default) {
      await supabase
        .from('material_presets')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('category', preset.category);
    }

    const { data, error } = await supabase
      .from('material_presets')
      .insert([presetData])
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

// Crear múltiples presets en lote
export async function createMaterialPresetsBatch(
  presets: Omit<DatabaseMaterialPreset, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'team_id'>[],
  userId: string,
  teamId?: string | null
): Promise<MaterialPreset[]> {
  const supabase = createClient();

  try {
    if (presets.length === 0) {
      return [];
    }

    // Preparar los datos para inserción en lote
    const presetsData = presets.map(preset => ({
      ...preset,
      user_id: userId,
      team_id: teamId || null
    }));


    // Si algún preset es predeterminado, primero desmarcar los demás de la misma categoría
    const defaultPresets = presets.filter(p => p.is_default);
    if (defaultPresets.length > 0) {
      const categories = Array.from(new Set(defaultPresets.map(p => p.category)));
      for (const category of categories) {
        await supabase
          .from('material_presets')
          .update({ is_default: false })
          .eq('user_id', userId)
          .eq('category', category);
      }
    }

    // Insertar todos los presets en una sola operación
    const { data, error } = await supabase
      .from('material_presets')
      .insert(presetsData)
      .select();

    if (error) {
      console.error('Error creating material presets batch:', error);
      throw error;
    }


    return data || [];
  } catch (error) {
    console.error('Error in createMaterialPresetsBatch:', error);
    return [];
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
    // Verificar que el usuario esté autenticado
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      console.error('User not authenticated:', authError);
      return { total: 0, byCategory: {} };
    }


    let query = supabase
      .from('material_presets')
      .select('category');

    if (teamId) {
      query = query.or(`user_id.eq.${userId},team_id.eq.${teamId}`);
    } else {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching material preset stats:', {
        error,
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
        userId,
        teamId
      });
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
    console.error('Error in getMaterialPresetStats:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId,
      teamId
    });
    return { total: 0, byCategory: {} };
  }
}
