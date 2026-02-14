import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTeam } from '@/components/providers/TeamProvider';
import { expenseService } from '@/services/expenseService';
import type { Expense, ExpenseFormData } from '@/types';
import toast from 'react-hot-toast';
import { logger } from '@/lib/logger';

export function useExpenses() {
  const { user } = useAuth();
  const { currentTeam, isEditingMode, editingTeam } = useTeam();
  const queryClient = useQueryClient();

  const effectiveTeamId = (isEditingMode && editingTeam) ? editingTeam.id : currentTeam?.id;

  // Query para obtener gastos
  const { data: expenses = [], isLoading, error, refetch } = useQuery({
    queryKey: ['expenses', user?.id, effectiveTeamId],
    queryFn: async () => {
      if (!user) return [];
      try {
        return await expenseService.getExpenses(user.id, effectiveTeamId);
      } catch (err) {
        logger.error('Error fetching expenses:', err);
        throw err;
      }
    },
    enabled: !!user,
  });

  // Mutation para crear gasto
  const createExpenseMutation = useMutation({
    mutationFn: async (expenseData: ExpenseFormData) => {
      if (!user) throw new Error('User not authenticated');
      const teamIdToUse = expenseData.team_id !== undefined ? expenseData.team_id : effectiveTeamId;
      return await expenseService.createExpense(user.id, expenseData, teamIdToUse);
    },
    onSuccess: (_, variables) => {
      const teamIdToUse = variables.team_id !== undefined ? variables.team_id : effectiveTeamId;
      queryClient.invalidateQueries({ queryKey: ['expenses', user?.id, teamIdToUse] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id, teamIdToUse] });
      toast.success('Gasto creado correctamente');
    },
    onError: (err: Error) => {
      logger.error('Error creating expense:', err);
      toast.error(err.message || 'Error creating expense');
    },
  });

  // Mutation para actualizar gasto
  const updateExpenseMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Expense> }) => {
      return await expenseService.updateExpense(id, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', user?.id, effectiveTeamId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id, effectiveTeamId] });
      toast.success('Expense updated successfully');
    },
    onError: (err: Error) => {
      logger.error('Error updating expense:', err);
      toast.error(err.message || 'Error updating expense');
    },
  });

  // Mutation para eliminar gasto
  const deleteExpenseMutation = useMutation({
    mutationFn: async (id: string) => {
      return await expenseService.deleteExpense(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['expenses', user?.id, effectiveTeamId] });
      queryClient.invalidateQueries({ queryKey: ['dashboard', user?.id, effectiveTeamId] });
      toast.success('Expense deleted successfully');
    },
    onError: (err: Error) => {
      logger.error('Error deleting expense:', err);
      toast.error(err.message || 'Error deleting expense');
    },
  });

  const getExpenseStats = () => {
    return expenseService.calculateExpenseStats(expenses);
  };

  const getExpenseCategories = () => {
    return expenseService.getExpenseCategories();
  };

  return {
    expenses,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    createExpense: createExpenseMutation.mutateAsync,
    updateExpense: updateExpenseMutation.mutateAsync,
    deleteExpense: deleteExpenseMutation.mutateAsync,
    isCreating: createExpenseMutation.isPending,
    isUpdating: updateExpenseMutation.isPending,
    isDeleting: deleteExpenseMutation.isPending,
    getExpenseStats,
    getExpenseCategories,
    refetch,
  };
}
