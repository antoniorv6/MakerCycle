import { createClient } from '@/lib/supabase';
import type { DatabasePrinterPreset, PrinterPreset } from '@/types';

/**
 * Servicio para gestionar perfiles de impresoras 3D
 * Incluye información de consumo eléctrico y amortización
 */

// Función de diagnóstico para verificar la conexión a la base de datos
export async function testPrinterPresetsConnection(): Promise<{ success: boolean; error?: string }> {
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
      .from('printer_presets')
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

// Obtener todos los perfiles de impresora del usuario
export async function getPrinterPresets(userId: string, teamId?: string | null): Promise<PrinterPreset[]> {
  const supabase = createClient();

  try {
    // Primero verificar la conexión
    const connectionTest = await testPrinterPresetsConnection();
    if (!connectionTest.success) {
      console.error('Connection test failed:', connectionTest.error);
      return [];
    }

    let query = supabase
      .from('printer_presets')
      .select('*');

    // Si hay teamId, también traer los perfiles del equipo
    if (teamId) {
      query = query.or(`user_id.eq.${userId},team_id.eq.${teamId}`);
    } else {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query.order('is_default', { ascending: false }).order('name');

    if (error) {
      console.error('Error fetching printer presets:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPrinterPresets:', error);
    return [];
  }
}

// Obtener un perfil específico por ID
export async function getPrinterPresetById(presetId: string): Promise<PrinterPreset | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('printer_presets')
      .select('*')
      .eq('id', presetId)
      .single();

    if (error) {
      console.error('Error fetching printer preset:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in getPrinterPresetById:', error);
    return null;
  }
}

// Obtener el perfil por defecto del usuario
export async function getDefaultPrinterPreset(userId: string, teamId?: string | null): Promise<PrinterPreset | null> {
  const supabase = createClient();

  try {
    const { data, error } = await supabase
      .from('printer_presets')
      .select('*')
      .eq('user_id', userId)
      .eq('is_default', true)
      .limit(1);

    if (error) {
      console.error('Error fetching default printer preset:', error);
      return null;
    }

    // Si no hay datos o el array está vacío, devolver null
    if (!data || data.length === 0) {
      return null;
    }

    return data[0];
  } catch (error) {
    console.error('Error in getDefaultPrinterPreset:', error);
    return null;
  }
}

// Crear un nuevo perfil de impresora
export async function createPrinterPreset(
  preset: Omit<DatabasePrinterPreset, 'id' | 'created_at' | 'updated_at' | 'user_id' | 'team_id'>,
  userId: string,
  teamId?: string | null
): Promise<PrinterPreset | null> {
  const supabase = createClient();

  try {
    const presetData = {
      ...preset,
      user_id: userId,
      team_id: teamId || null
    };

    // Si el nuevo perfil es el predeterminado, desmarcar los demás
    if (preset.is_default) {
      await supabase
        .from('printer_presets')
        .update({ is_default: false })
        .eq('user_id', userId);
    }

    const { data, error } = await supabase
      .from('printer_presets')
      .insert([presetData])
      .select()
      .single();

    if (error) {
      console.error('Error creating printer preset:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in createPrinterPreset:', error);
    return null;
  }
}

// Actualizar un perfil existente
export async function updatePrinterPreset(
  presetId: string,
  updates: Partial<Omit<DatabasePrinterPreset, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<PrinterPreset | null> {
  const supabase = createClient();

  try {
    // Si el perfil actualizado se marca como predeterminado, desmarcar los demás
    if (updates.is_default) {
      // Primero obtenemos el preset para saber el user_id
      const { data: currentPreset } = await supabase
        .from('printer_presets')
        .select('user_id')
        .eq('id', presetId)
        .single();

      if (currentPreset) {
        await supabase
          .from('printer_presets')
          .update({ is_default: false })
          .eq('user_id', currentPreset.user_id)
          .neq('id', presetId);
      }
    }

    const { data, error } = await supabase
      .from('printer_presets')
      .update(updates)
      .eq('id', presetId)
      .select()
      .single();

    if (error) {
      console.error('Error updating printer preset:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updatePrinterPreset:', error);
    return null;
  }
}

// Eliminar un perfil de impresora
export async function deletePrinterPreset(presetId: string): Promise<boolean> {
  const supabase = createClient();

  try {
    const { error } = await supabase
      .from('printer_presets')
      .delete()
      .eq('id', presetId);

    if (error) {
      console.error('Error deleting printer preset:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in deletePrinterPreset:', error);
    return false;
  }
}

// Establecer un perfil como predeterminado
export async function setDefaultPrinterPreset(presetId: string, userId: string): Promise<boolean> {
  const supabase = createClient();

  try {
    // Desmarcar todos los perfiles del usuario
    await supabase
      .from('printer_presets')
      .update({ is_default: false })
      .eq('user_id', userId);

    // Marcar el perfil seleccionado como predeterminado
    const { error } = await supabase
      .from('printer_presets')
      .update({ is_default: true })
      .eq('id', presetId)
      .eq('user_id', userId);

    if (error) {
      console.error('Error setting default printer preset:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in setDefaultPrinterPreset:', error);
    return false;
  }
}

// Actualizar las horas de uso de una impresora
export async function updatePrinterUsageHours(presetId: string, hoursToAdd: number): Promise<PrinterPreset | null> {
  const supabase = createClient();

  try {
    // Primero obtenemos el valor actual
    const { data: currentPreset } = await supabase
      .from('printer_presets')
      .select('current_usage_hours')
      .eq('id', presetId)
      .single();

    if (!currentPreset) {
      throw new Error('Preset not found');
    }

    const newHours = currentPreset.current_usage_hours + hoursToAdd;

    const { data, error } = await supabase
      .from('printer_presets')
      .update({ current_usage_hours: newHours })
      .eq('id', presetId)
      .select()
      .single();

    if (error) {
      console.error('Error updating printer usage hours:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in updatePrinterUsageHours:', error);
    return null;
  }
}

// Calcular el coste de amortización por hora
export function calculateAmortizationCostPerHour(purchasePrice: number, amortizationHours: number): number {
  if (amortizationHours <= 0) return 0;
  return purchasePrice / amortizationHours;
}

// Calcular el progreso de amortización (porcentaje)
export function calculateAmortizationProgress(currentUsageHours: number, amortizationHours: number): number {
  if (amortizationHours <= 0) return 0;
  return Math.min((currentUsageHours / amortizationHours) * 100, 100);
}

// Calcular las horas restantes para amortizar
export function calculateRemainingAmortizationHours(currentUsageHours: number, amortizationHours: number): number {
  return Math.max(amortizationHours - currentUsageHours, 0);
}

// Calcular la cantidad restante por amortizar (en dinero)
export function calculateRemainingAmortizationAmount(
  purchasePrice: number,
  currentUsageHours: number,
  amortizationHours: number
): number {
  if (amortizationHours <= 0) return 0;
  const amortized = (currentUsageHours / amortizationHours) * purchasePrice;
  return Math.max(purchasePrice - amortized, 0);
}

// Obtener estadísticas de perfiles
export async function getPrinterPresetStats(userId: string, teamId?: string | null): Promise<{
  total: number;
  totalPurchaseValue: number;
  totalAmortized: number;
  totalRemaining: number;
}> {
  const supabase = createClient();

  try {
    let query = supabase
      .from('printer_presets')
      .select('purchase_price, current_usage_hours, amortization_hours');

    if (teamId) {
      query = query.or(`user_id.eq.${userId},team_id.eq.${teamId}`);
    } else {
      query = query.eq('user_id', userId);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Error fetching printer preset stats:', error);
      throw error;
    }

    const stats = {
      total: data?.length || 0,
      totalPurchaseValue: 0,
      totalAmortized: 0,
      totalRemaining: 0
    };

    data?.forEach((preset: { purchase_price: number | null; current_usage_hours: number | null; amortization_hours: number | null }) => {
      stats.totalPurchaseValue += preset.purchase_price || 0;
      const purchasePrice = preset.purchase_price || 0;
      const currentUsage = preset.current_usage_hours || 0;
      const amortizationHours = preset.amortization_hours || 0;
      const amortized = amortizationHours > 0 
        ? (currentUsage / amortizationHours) * purchasePrice 
        : 0;
      stats.totalAmortized += Math.min(amortized, purchasePrice);
      stats.totalRemaining += calculateRemainingAmortizationAmount(
        purchasePrice,
        currentUsage,
        amortizationHours
      );
    });

    return stats;
  } catch (error) {
    console.error('Error in getPrinterPresetStats:', error);
    return { total: 0, totalPurchaseValue: 0, totalAmortized: 0, totalRemaining: 0 };
  }
}
