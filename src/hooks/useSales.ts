import { useState, useEffect } from 'react';
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
  const { currentTeam } = useTeam();

  useEffect(() => {
    if (user) {
      fetchSales();
    }
  }, [user, currentTeam]);

  const fetchSales = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await salesService.getSales(user.id, currentTeam?.id);
      setSales(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching sales');
      toast.error('Error loading sales');
    } finally {
      setLoading(false);
    }
  };

  const createSale = async (saleData: SaleFormData) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const newSale = await salesService.createSale(user.id, saleData, currentTeam?.id);
      setSales(prev => [newSale, ...prev]);
      toast.success('Sale created successfully');
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

  return {
    sales,
    loading,
    error,
    createSale,
    updateSale,
    deleteSale,
    getSaleStats,
    refetch: fetchSales
  };
} 