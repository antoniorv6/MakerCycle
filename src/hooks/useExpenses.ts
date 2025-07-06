import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { expenseService } from '@/services/expenseService';
import type { Expense, ExpenseFormData } from '@/types';
import toast from 'react-hot-toast';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchExpenses();
    }
  }, [user]);

  const fetchExpenses = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      const data = await expenseService.getExpenses(user.id);
      setExpenses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching expenses');
      toast.error('Error loading expenses');
    } finally {
      setLoading(false);
    }
  };

  const createExpense = async (expenseData: ExpenseFormData) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const newExpense = await expenseService.createExpense(user.id, expenseData);
      setExpenses(prev => [newExpense, ...prev]);
      toast.success('Expense created successfully');
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

  return {
    expenses,
    loading,
    error,
    createExpense,
    updateExpense,
    deleteExpense,
    getExpenseStats,
    getExpenseCategories,
    refetch: fetchExpenses
  };
} 