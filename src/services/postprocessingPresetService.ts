import { createClient } from '@/lib/supabase';
import type { DatabasePostprocessingPreset, PostprocessingPreset } from '@/types';

/**
 * Servicio para gestionar presets de postproducción (pintura, uso de máquinas, etc.)
 */

// Función de diagnóstico para verificar la conexión a la base de datos
export async function testPostprocessingPresetsConnection(): Promise<{ success: boolean; error?: string }> {
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
      .from('postprocessing_presets')
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
export async function getPostprocessingPresets(userId: string, teamId?: string | null, category?: string): Promise<PostprocessingPreset[]> {
  const supabase = createClient();

  try {
    // Primero verificar la conexión
    const connectionTest = await testPostprocessingPresetsConnection();
    if (!connectionTest.success) {
      return [];
    }

    let query = supabase
      .from('postprocessing_presets')
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
      console.error('Error fetching postprocessing presets:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPostprocessingPresets:', error);
    return [];
  }
}

// Obtener un preset específico por ID
export async function getPostprocessingPresetById(presetId: string): Promise<PostprocessingPreset | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('postprocessing_presets')
      .select('*')
      .eq('id', presetId)
      .single();

    if (error) {
      console.error('Error fetching postprocessing preset:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getPostprocessingPresetById:', error);
    return null;
  }
}

// Obtener el preset por defecto del usuario
export async function getDefaultPostprocessingPreset(userId: string, teamId?: string | null, category?: string): Promise<PostprocessingPreset | null> {
  const supabase = createClient();

  try {
    let query = supabase
      .from('postprocessing_presets')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true);

    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query.limit(1);

    if (error) {
      console.error('Error fetching default postprocessing preset:', error);
      return null;
    }

    // Si no hay datos o el array está vacío, devolver null
    if (!data || data.length === 0) {
      return null;
    }

    return data[0];
  } catch (error) {
    console.error('Error in getDefaultPostprocessingPreset:', error);
    return null;
  }
}

// Crear un nuevo preset
export async function createPostprocessingPreset(
  preset: Omit<DatabasePostprocessingPreset, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'team_id'>,
  userId: string,
  teamId?: string | null
): Promise<PostprocessingPreset | null> {
  const supabase = createClient();

  try {
    const presetData = {
      ...preset,
      user_id: userId,
      team_id: teamId || null
    };

    // Si el nuevo preset es el predeterminado, desmarcar los demás de la misma categoría (si existe)
    if (preset.is_default && preset.category) {
      await supabase
        .from('postprocessing_presets')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('category', preset.category);
    } else if (preset.is_default) {
      // Si no tiene categoría, desmarcar todos los demás sin categoría
      await supabase
        .from('postprocessing_presets')
        .update({ is_default: false })
        .eq('user_id', userId)
        .is('category', null);
    }

    const { data, error } = await supabase
      .from('postprocessing_presets')
      .insert([presetData])
      .select()
      .single();

    if (error) {
      console.error('Error creating postprocessing preset:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createPostprocessingPreset:', error);
    return null;
  }
}

// Actualizar un preset existente
export async function updatePostprocessingPreset(
  presetId: string,
  updates: Partial<Omit<DatabasePostprocessingPreset, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<PostprocessingPreset | null> {
  const supabase = createClient();

  try {
    // Si el preset actualizado se marca como predeterminado, desmarcar los demás de la misma categoría
    if (updates.is_default) {
      // Primero obtenemos el preset para saber el user_id y category
      const { data: currentPreset } = await supabase
        .from('postprocessing_presets')
        .select('user_id, category')
        .eq('id', presetId)
        .single();

      if (currentPreset) {
        if (currentPreset.category) {
          await supabase
            .from('postprocessing_presets')
            .update({ is_default: false })
            .eq('user_id', currentPreset.user_id)
            .eq('category', currentPreset.category)
            .neq('id', presetId);
        } else {
          await supabase
            .from('postprocessing_presets')
            .update({ is_default: false })
            .eq('user_id', currentPreset.user_id)
            .is('category', null)
            .neq('id', presetId);
        }
      }
    }

    const { data, error } = await supabase
      .from('postprocessing_presets')
      .update(updates)
      .eq('id', presetId)
      .select()
      .single();

    if (error) {
      console.error('Error updating postprocessing preset:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updatePostprocessingPreset:', error);
    return null;
  }
}

// Eliminar un preset
export async function deletePostprocessingPreset(presetId: string): Promise<boolean> {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from('postprocessing_presets')
      .delete()
      .eq('id', presetId);

    if (error) {
      console.error('Error deleting postprocessing preset:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deletePostprocessingPreset:', error);
    return false;
  }
}

// Establecer un preset como predeterminado
export async function setDefaultPostprocessingPreset(presetId: string, userId: string): Promise<boolean> {
  const supabase = createClient();

  try {
    // Primero obtenemos la categoría del preset
    const { data: preset } = await supabase
      .from('postprocessing_presets')
      .select('category')
      .eq('id', presetId)
      .eq('user_id', userId)
      .single();

    if (!preset) {
      throw new Error('Preset not found');
    }

    // Desmarcar todos los presets de la misma categoría del usuario
    if (preset.category) {
      await supabase
        .from('postprocessing_presets')
        .update({ is_default: false })
        .eq('user_id', userId)
        .eq('category', preset.category);
    } else {
      await supabase
        .from('postprocessing_presets')
        .update({ is_default: false })
        .eq('user_id', userId)
        .is('category', null);
    }

    // Marcar el preset seleccionado como predeterminado
    const { error } = await supabase
      .from('postprocessing_presets')
      .update({ is_default: true })
      .eq('id', presetId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error setting default postprocessing preset:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in setDefaultPostprocessingPreset:', error);
    return false;
  }
}

// Obtener estadísticas de presets por categoría
export async function getPostprocessingPresetStats(userId: string, teamId?: string | null): Promise<{
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
      .from('postprocessing_presets')
      .select('category');

    if (teamId) {
      query = query.or(`user_id.eq.${userId},team_id.eq.${teamId}`);
    } else {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching postprocessing preset stats:', {
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
      const category = preset.category || 'Sin categoría';
      stats.byCategory[category] = (stats.byCategory[category] || 0) + 1;
    });

    return stats;
  } catch (error) {
    console.error('Error in getPostprocessingPresetStats:', {
      error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      userId,
      teamId
    });
    return { total: 0, byCategory: {} };
  }
}
