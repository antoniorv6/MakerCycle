import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { createClient } from '@/lib/supabase';
import type { DatabaseProject, Sale, Expense } from '@/types';

// Cache for dashboard data
const dashboardCache = new Map<string, { 
  data: { projects: DatabaseProject[], sales: Sale[], expenses: Expense[] }, 
  timestamp: number 
}>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

interface DashboardStats {
  totalProjects: number;
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  averageMargin: number;
  totalPrintHours: number;
  averageEurosPerHour: number;
  totalProducts: number;
  totalExpenses: number;
  netProfit: number;
}

export function useDashboardData() {
  const [projects, setProjects] = useState<DatabaseProject[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const supabase = createClient();

  const cacheKey = user?.id || '';

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;
    
    // Check cache first
    const cached = dashboardCache.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      setProjects(cached.data.projects);
      setSales(cached.data.sales);
      setExpenses(cached.data.expenses);
      setLoading(false);
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Fetch all data in parallel
      const [projectsResult, salesResult, expensesResult] = await Promise.allSettled([
        supabase
          .from('projects')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('sales')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10),
        supabase
          .from('expenses')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })
          .limit(10)
      ]);

      // Handle projects
      if (projectsResult.status === 'fulfilled' && !projectsResult.value.error) {
        setProjects(projectsResult.value.data || []);
      } else {
        console.error('Error fetching projects:', projectsResult.status === 'rejected' ? projectsResult.reason : projectsResult.value?.error);
      }

      // Handle sales
      if (salesResult.status === 'fulfilled' && !salesResult.value.error) {
        setSales(salesResult.value.data || []);
      } else {
        console.error('Error fetching sales:', salesResult.status === 'rejected' ? salesResult.reason : salesResult.value?.error);
      }

      // Handle expenses
      if (expensesResult.status === 'fulfilled' && !expensesResult.value.error) {
        setExpenses(expensesResult.value.data || []);
      } else {
        console.error('Error fetching expenses:', expensesResult.status === 'rejected' ? expensesResult.reason : expensesResult.value?.error);
      }

      // Update cache
      dashboardCache.set(cacheKey, { 
        data: { 
          projects: projectsResult.status === 'fulfilled' ? (projectsResult.value.data || []) : [],
          sales: salesResult.status === 'fulfilled' ? (salesResult.value.data || []) : [],
          expenses: expensesResult.status === 'fulfilled' ? (expensesResult.value.data || []) : []
        }, 
        timestamp: Date.now() 
      });

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching dashboard data');
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  }, [user, cacheKey, supabase]);

  const invalidateCache = useCallback(() => {
    dashboardCache.delete(cacheKey);
  }, [cacheKey]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, fetchDashboardData]);

  const stats = useMemo((): DashboardStats => {
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.sale_price, 0);
    const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
    const totalPrintHours = sales.reduce((sum, sale) => sum + (sale.print_hours || 0), 0);
    const totalProducts = sales.reduce((sum, sale) => sum + (sale.quantity || 1), 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const averageMargin = sales.length > 0 
      ? sales.reduce((sum, sale) => sum + sale.margin, 0) / sales.length 
      : 0;
    
    const averageEurosPerHour = totalPrintHours > 0 ? totalProfit / totalPrintHours : 0;
    const netProfit = totalProfit - totalExpenses;

    return {
      totalProjects: projects.length,
      totalSales: sales.length,
      totalRevenue,
      totalProfit,
      averageMargin,
      totalPrintHours,
      averageEurosPerHour,
      totalProducts,
      totalExpenses,
      netProfit
    };
  }, [projects, sales, expenses]);

  return {
    projects,
    sales,
    expenses,
    stats,
    loading,
    error,
    refetch: fetchDashboardData,
    invalidateCache
  };
} 