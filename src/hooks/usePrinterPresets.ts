import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTeam } from '@/components/providers/TeamProvider';
import {
  getPrinterPresets,
  getDefaultPrinterPreset,
  createPrinterPreset,
  updatePrinterPreset,
  deletePrinterPreset,
  setDefaultPrinterPreset,
  getPrinterPresetStats,
  testPrinterPresetsConnection,
  updatePrinterUsageHours,
  calculateAmortizationCostPerHour,
  calculateAmortizationProgress,
  calculateRemainingAmortizationHours,
  calculateRemainingAmortizationAmount,
} from '@/services/printerPresetService';
import type { PrinterPreset, DatabasePrinterPreset } from '@/types';
import { toast } from 'react-hot-toast';

export function usePrinterPresets() {
  const { user } = useAuth();
  const { getEffectiveTeam } = useTeam();
  const [presets, setPresets] = useState<PrinterPreset[]>([]);
  const [defaultPreset, setDefaultPreset] = useState<PrinterPreset | null>(null);
  const [stats, setStats] = useState<{ 
    total: number; 
    totalPurchaseValue: number; 
    totalAmortized: number;
    totalRemaining: number;
  }>({ total: 0, totalPurchaseValue: 0, totalAmortized: 0, totalRemaining: 0 });
  const [loading, setLoading] = useState(true);

  const loadPresets = async () => {
    if (!user) {
      setPresets([]);
      setDefaultPreset(null);
      setStats({ total: 0, totalPurchaseValue: 0, totalAmortized: 0, totalRemaining: 0 });
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Primero verificar la conexión a la base de datos
      const connectionTest = await testPrinterPresetsConnection();
      if (!connectionTest.success) {
        // Si la tabla no existe, no mostrar error (puede ser que aún no se ha ejecutado la migración)
        if (connectionTest.error?.includes('does not exist')) {
          console.log('Printer presets table not yet created');
        } else {
          console.error(`Error de conexión: ${connectionTest.error}`);
        }
        setPresets([]);
        setDefaultPreset(null);
        setStats({ total: 0, totalPurchaseValue: 0, totalAmortized: 0, totalRemaining: 0 });
        return;
      }

      const teamId = getEffectiveTeam()?.id;
      
      const [presetsData, defaultPresetData, statsData] = await Promise.all([
        getPrinterPresets(user.id, teamId),
        getDefaultPrinterPreset(user.id, teamId),
        getPrinterPresetStats(user.id, teamId),
      ]);

      setPresets(presetsData);
      setDefaultPreset(defaultPresetData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading printer presets:', error);
      // No mostrar toast de error aquí para no molestar al usuario si la tabla no existe
    } finally {
      setLoading(false);
    }
  };

  // Cargar presets al montar el componente
  useEffect(() => {
    loadPresets();
  }, [user?.id]);

  // Crear un nuevo perfil de impresora
  const addPreset = async (
    preset: Omit<DatabasePrinterPreset, 'id' | 'user_id' | 'created_at' | 'updated_at'>
  ): Promise<PrinterPreset | null> => {
    if (!user) {
      toast.error('Debes iniciar sesión para crear perfiles');
      return null;
    }

    try {
      const newPreset = await createPrinterPreset(
        preset,
        user.id,
        getEffectiveTeam()?.id
      );

      if (newPreset) {
        await loadPresets();
        toast.success('Perfil de impresora creado correctamente');
        return newPreset;
      }

      toast.error('Error al crear el perfil');
      return null;
    } catch (error) {
      console.error('Error creating preset:', error);
      toast.error('Error al crear el perfil de impresora');
      return null;
    }
  };

  // Actualizar un perfil existente
  const updatePreset = async (
    presetId: string,
    updates: Partial<Omit<DatabasePrinterPreset, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ): Promise<boolean> => {
    try {
      const updatedPreset = await updatePrinterPreset(presetId, updates);

      if (updatedPreset) {
        await loadPresets();
        toast.success('Perfil actualizado correctamente');
        return true;
      }

      toast.error('Error al actualizar el perfil');
      return false;
    } catch (error) {
      console.error('Error updating preset:', error);
      toast.error('Error al actualizar el perfil de impresora');
      return false;
    }
  };

  // Eliminar un perfil
  const removePreset = async (presetId: string): Promise<boolean> => {
    try {
      const success = await deletePrinterPreset(presetId);

      if (success) {
        await loadPresets();
        toast.success('Perfil eliminado correctamente');
        return true;
      }

      toast.error('Error al eliminar el perfil');
      return false;
    } catch (error) {
      console.error('Error deleting preset:', error);
      toast.error('Error al eliminar el perfil de impresora');
      return false;
    }
  };

  // Establecer un perfil como predeterminado
  const setAsDefault = async (presetId: string): Promise<boolean> => {
    if (!user) {
      toast.error('Debes iniciar sesión');
      return false;
    }

    try {
      const success = await setDefaultPrinterPreset(presetId, user.id);

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

  // Actualizar horas de uso
  const addUsageHours = async (presetId: string, hours: number): Promise<boolean> => {
    try {
      const updatedPreset = await updatePrinterUsageHours(presetId, hours);

      if (updatedPreset) {
        await loadPresets();
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error updating usage hours:', error);
      return false;
    }
  };

  // Obtener un perfil específico por ID
  const getPresetById = (presetId: string): PrinterPreset | undefined => {
    return presets.find((preset) => preset.id === presetId);
  };

  // Obtener datos calculados de amortización para un perfil
  const getAmortizationData = (preset: PrinterPreset) => {
    return {
      costPerHour: calculateAmortizationCostPerHour(preset.purchase_price, preset.amortization_hours),
      progress: calculateAmortizationProgress(preset.current_usage_hours, preset.amortization_hours),
      remainingHours: calculateRemainingAmortizationHours(preset.current_usage_hours, preset.amortization_hours),
      remainingAmount: calculateRemainingAmortizationAmount(
        preset.purchase_price,
        preset.current_usage_hours,
        preset.amortization_hours
      ),
      isFullyAmortized: preset.current_usage_hours >= preset.amortization_hours
    };
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
    addUsageHours,
    getPresetById,
    getAmortizationData,
    refreshPresets: loadPresets,
  };
}
