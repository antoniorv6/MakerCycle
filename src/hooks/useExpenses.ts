import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTeam } from '@/components/providers/TeamProvider';
import { expenseService } from '@/services/expenseService';
import type { Expense, ExpenseFormData } from '@/types';
import toast from 'react-hot-toast';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
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

  const fetchExpenses = useCallback(async () => {
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
      const data = await expenseService.getExpenses(user.id, effectiveTeamId);
      setExpenses(data);
      lastFetchedTeamId.current = effectiveTeamId;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching expenses');
      toast.error('Error loading expenses');
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
      fetchExpenses();
    }
  }, [user, effectiveTeamId, fetchExpenses]);

  const createExpense = async (expenseData: ExpenseFormData) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      // Usar el team_id del formData si está especificado, sino usar el equipo efectivo
      const teamIdToUse = expenseData.team_id !== undefined ? expenseData.team_id : effectiveTeamId;
      const newExpense = await expenseService.createExpense(user.id, expenseData, teamIdToUse);
      
      // Solo agregar a la lista si el equipo coincide con el contexto actual
      if ((teamIdToUse || null) === (effectiveTeamId || null)) {
        setExpenses(prev => [newExpense, ...prev]);
      }
      
      toast.success('Gasto creado correctamente');
      return newExpense;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error creating expense';
      toast.error(message);
      throw err;
    }
  };

  const updateExpense = async (id: string, updates: Partial<Expense>) => {
    try {
      const updatedExpense = await expenseService.updateExpense(id, updates);
      setExpenses(prev => prev.map(e => e.id === id ? updatedExpense : e));
      toast.success('Expense updated successfully');
      return updatedExpense;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error updating expense';
      toast.error(message);
      throw err;
    }
  };

  const deleteExpense = async (id: string) => {
    try {
      await expenseService.deleteExpense(id);
      setExpenses(prev => prev.filter(e => e.id !== id));
      toast.success('Expense deleted successfully');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error deleting expense';
      toast.error(message);
      throw err;
    }
  };

  const getExpenseStats = () => {
    return expenseService.calculateExpenseStats(expenses);
  };

  const getExpenseCategories = () => {
    return expenseService.getExpenseCategories();
  };

  // Función de refetch que fuerza la actualización
  const refetch = useCallback(async () => {
    lastFetchedTeamId.current = NEVER_FETCHED.current;
    await fetchExpenses();
  }, [fetchExpenses]);

  return {
    expenses,
    loading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
    getExpenseStats,
    getExpenseCategories,
    refetch
  };
} 