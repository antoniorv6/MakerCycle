import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTeam } from '@/components/providers/TeamProvider';
import { salesService } from '@/services/salesService';
import type { Sale, SaleFormData } from '@/types';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

export function useSales() {
  const { user } = useAuth();
  const { currentTeam, isEditingMode, editingTeam } = useTeam();
  const queryClient = useQueryClient();

  const effectiveTeamId = (isEditingMode && editingTeam) ? editingTeam.id : currentTeam?.id;

  // Query para obtener ventas
  const { data: sales = [], isLoading, error, refetch } = useQuery({
    queryKey: ['sales', user?.id, effectiveTeamId],
    queryFn: async () => {
      if (!user) return [];
      try {
        return await salesService.getSales(user.id, effectiveTeamId);
      } catch (err) {
        logger.error('Error fetching sales:', err);
        throw err;
      }
    },
    enabled: !!user,
  });

  // Mutation para crear venta
  const createSaleMutation = useMutation({
    mutationFn: async (saleData: SaleFormData) => {
      if (!user) throw new Error('User not authenticated');
      const teamIdToUse = saleData.team_id !== undefined ? saleData.team_id : effectiveTeamId;
      return await salesService.createSale(user.id, saleData, teamIdToUse);
    },
    onSuccess: (_, variables) => {
      const teamIdToUse = variables.team_id !== undefined ? variables.team_id : effectiveTeamId;
      // Invalidar queries relevantes
      queryClient.invalidateQueries({ queryKey: ['sales', user?.id, teamIdToUse] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id, teamIdToUse] });
      toast.success('Venta creada correctamente');
    },
    onError: (err: Error) => {
      logger.error('Error creating sale:', err);
      toast.error(err.message || 'Error creating sale');
    },
  });

  // Mutation para actualizar venta
  const updateSaleMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Sale> }) => {
      return await salesService.updateSale(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales', user?.id, effectiveTeamId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id, effectiveTeamId] });
      toast.success('Sale updated successfully');
    },
    onError: (err: Error) => {
      logger.error('Error updating sale:', err);
      toast.error(err.message || 'Error updating sale');
    },
  });

  // Mutation para eliminar venta
  const deleteSaleMutation = useMutation({
    mutationFn: async (id: string) => {
      return await salesService.deleteSale(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales', user?.id, effectiveTeamId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id, effectiveTeamId] });
      toast.success('Sale deleted successfully');
    },
    onError: (err: Error) => {
      logger.error('Error deleting sale:', err);
      toast.error(err.message || 'Error deleting sale');
    },
  });

  const getSaleStats = () => {
    return salesService.calculateSaleStats(sales);
  };

  return {
    sales,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    createSale: createSaleMutation.mutateAsync,
    updateSale: updateSaleMutation.mutateAsync,
    deleteSale: deleteSaleMutation.mutateAsync,
    isCreating: createSaleMutation.isPending,
    isUpdating: updateSaleMutation.isPending,
    isDeleting: deleteSaleMutation.isPending,
    getSaleStats,
    refetch,
  };
}
