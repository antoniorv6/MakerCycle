import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTeam } from '@/components/providers/TeamProvider';
import { salesService } from '@/services/salesService';
import type { Sale, SaleFormData } from '@/types';
import toast from 'react-hot-toast';

export function useSales() {
  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { currentTeam, isEditingMode, editingTeam } = useTeam();
  
  // Calcular el equipo efectivo directamente
  const effectiveTeamId = isEditingMode && editingTeam ? editingTeam.id : currentTeam?.id;
  
  // Usar ref para evitar llamadas duplicadas
  // Usamos un símbolo especial para indicar "nunca fetched" vs "fetched con undefined/null"
  const NEVER_FETCHED = useRef(Symbol('NEVER_FETCHED'));
  const lastFetchedTeamId = useRef<string | null | undefined | symbol>(NEVER_FETCHED.current);

  const fetchSales = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    
    // Evitar refetch si el equipo no ha cambiado (y ya se hizo un fetch)
    if (lastFetchedTeamId.current !== NEVER_FETCHED.current && lastFetchedTeamId.current === effectiveTeamId) {
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      const data = await salesService.getSales(user.id, effectiveTeamId);
      setSales(data);
      lastFetchedTeamId.current = effectiveTeamId;
    } catch (err) {
      console.error('Error fetching sales:', err);
      setError(err instanceof Error ? err.message : 'Error fetching sales');
      toast.error('Error loading sales');
    } finally {
      setLoading(false);
    }
  }, [user, effectiveTeamId]);

  useEffect(() => {
    if (user) {
      // Reset lastFetchedTeamId cuando cambia el equipo para forzar refetch
      if (lastFetchedTeamId.current !== NEVER_FETCHED.current && lastFetchedTeamId.current !== effectiveTeamId) {
        lastFetchedTeamId.current = NEVER_FETCHED.current;
      }
      fetchSales();
    }
  }, [user, effectiveTeamId, fetchSales]);

  const createSale = async (saleData: SaleFormData) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Usar el team_id del formData si está especificado, sino usar el equipo efectivo
      const teamIdToUse = saleData.team_id !== undefined ? saleData.team_id : effectiveTeamId;
      const newSale = await salesService.createSale(user.id, saleData, teamIdToUse);
      
      // Solo agregar a la lista si el equipo coincide con el contexto actual
      if ((teamIdToUse || null) === (effectiveTeamId || null)) {
        setSales(prev => [newSale, ...prev]);
      }
      
      toast.success('Venta creada correctamente');
      return newSale;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error creating sale';
      toast.error(message);
      throw err;
    }
  };

  const updateSale = async (id: string, updates: Partial<Sale>) => {
    try {
      const updatedSale = await salesService.updateSale(id, updates);
      setSales(prev => prev.map(s => s.id === id ? updatedSale : s));
      toast.success('Sale updated successfully');
      return updatedSale;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating sale';
      toast.error(message);
      throw err;
    }
  };

  const deleteSale = async (id: string) => {
    try {
      await salesService.deleteSale(id);
      setSales(prev => prev.filter(s => s.id !== id));
      toast.success('Sale deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error deleting sale';
      toast.error(message);
      throw err;
    }
  };

  const getSaleStats = () => {
    return salesService.calculateSaleStats(sales);
  };

  // Función de refetch que fuerza la actualización
  const refetch = useCallback(async () => {
    lastFetchedTeamId.current = NEVER_FETCHED.current;
    await fetchSales();
  }, [fetchSales]);

  return {
    sales,
    loading,
    error,
    createSale,
    updateSale,
    deleteSale,
    getSaleStats,
    refetch
  };
} 