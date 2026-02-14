import { createClient } from '@/lib/supabase';
import type { ShippingPreset } from '@/types';

/**
 * Servicio para gestionar presets de proveedores de envío
 */

// Función de diagnóstico para verificar la conexión a la base de datos
export async function testShippingPresetsConnection(): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError) {
      return { success: false, error: `Authentication error: ${authError.message}` };
    }

    if (!user) {
      return { success: false, error: 'No authenticated user' };
    }

    const { error } = await supabase
      .from('shipping_presets')
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
export async function getShippingPresets(userId: string, teamId?: string | null): Promise<ShippingPreset[]> {
  const supabase = createClient();

  try {
    const connectionTest = await testShippingPresetsConnection();
    if (!connectionTest.success) {
      return [];
    }

    let query = supabase
      .from('shipping_presets')
      .select('*');

    if (teamId) {
      query = query.or(`user_id.eq.${userId},team_id.eq.${teamId}`);
    } else {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.order('is_default', { ascending: false }).order('name');

    if (error) {
      console.error('Error fetching shipping presets:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getShippingPresets:', error);
    return [];
  }
}

// Obtener un preset específico por ID
export async function getShippingPresetById(presetId: string): Promise<ShippingPreset | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('shipping_presets')
      .select('*')
      .eq('id', presetId)
      .single();

    if (error) {
      console.error('Error fetching shipping preset:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getShippingPresetById:', error);
    return null;
  }
}

// Obtener el preset por defecto del usuario
export async function getDefaultShippingPreset(userId: string, _teamId?: string | null): Promise<ShippingPreset | null> {
  const supabase = createClient();

  try {
    const query = supabase
      .from('shipping_presets')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true);

    const { data, error } = await query.limit(1);

    if (error) {
      console.error('Error fetching default shipping preset:', error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    return data[0];
  } catch (error) {
    console.error('Error in getDefaultShippingPreset:', error);
    return null;
  }
}

// Crear un nuevo preset
export async function createShippingPreset(
  preset: Omit<ShippingPreset, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'team_id'>,
  userId: string,
  teamId?: string | null
): Promise<ShippingPreset | null> {
  const supabase = createClient();

  try {
    const presetData = {
      ...preset,
      user_id: userId,
      team_id: teamId || null
    };

    // Si el nuevo preset es el predeterminado, desmarcar los demás
    if (preset.is_default) {
      await supabase
        .from('shipping_presets')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await supabase
      .from('shipping_presets')
      .insert([presetData])
      .select()
      .single();

    if (error) {
      console.error('Error creating shipping preset:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createShippingPreset:', error);
    return null;
  }
}

// Actualizar un preset existente
export async function updateShippingPreset(
  presetId: string,
  updates: Partial<Omit<ShippingPreset, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<ShippingPreset | null> {
  const supabase = createClient();

  try {
    if (updates.is_default) {
      const { data: currentPreset } = await supabase
        .from('shipping_presets')
        .select('user_id')
        .eq('id', presetId)
        .single();

      if (currentPreset) {
        await supabase
          .from('shipping_presets')
          .update({ is_default: false })
          .eq('user_id', currentPreset.user_id)
          .neq('id', presetId);
      }
    }

    const { data, error } = await supabase
      .from('shipping_presets')
      .update(updates)
      .eq('id', presetId)
      .select()
      .single();

    if (error) {
      console.error('Error updating shipping preset:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updateShippingPreset:', error);
    return null;
  }
}

// Eliminar un preset
export async function deleteShippingPreset(presetId: string): Promise<boolean> {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from('shipping_presets')
      .delete()
      .eq('id', presetId);

    if (error) {
      console.error('Error deleting shipping preset:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteShippingPreset:', error);
    return false;
  }
}

// Establecer un preset como predeterminado
export async function setDefaultShippingPreset(presetId: string, userId: string): Promise<boolean> {
  const supabase = createClient();

  try {
    // Desmarcar todos los presets del usuario
    await supabase
      .from('shipping_presets')
      .update({ is_default: false })
      .eq('user_id', userId);

    // Marcar el preset seleccionado como predeterminado
    const { error } = await supabase
      .from('shipping_presets')
      .update({ is_default: true })
      .eq('id', presetId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error setting default shipping preset:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in setDefaultShippingPreset:', error);
    return false;
  }
}

// Obtener estadísticas de presets
export async function getShippingPresetStats(userId: string, teamId?: string | null): Promise<{
  total: number;
}> {
  const supabase = createClient();

  try {
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return { total: 0 };
    }

    let query = supabase
      .from('shipping_presets')
      .select('id');

    if (teamId) {
      query = query.or(`user_id.eq.${userId},team_id.eq.${teamId}`);
    } else {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching shipping preset stats:', error);
      throw error;
    }

    return { total: data?.length || 0 };
  } catch (error) {
    console.error('Error in getShippingPresetStats:', error);
    return { total: 0 };
  }
}
