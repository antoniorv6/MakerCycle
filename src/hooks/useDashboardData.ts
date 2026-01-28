import { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTeam } from '@/components/providers/TeamProvider';
import { createClient } from '@/lib/supabase';
import type { DatabaseProject, Sale, Expense, DashboardStats } from '@/types';

// Cache for dashboard data
const dashboardCache = new Map<string, { 
  data: { projects: DatabaseProject[], sales: Sale[], expenses: Expense[] }, 
  timestamp: number 
}>();
const CACHE_DURATION = 2 * 60 * 1000; // 2 minutes

// Remove local interface and use the one from types

export function useDashboardData() {
  const [projects, setProjects] = useState<DatabaseProject[]>([]);
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();
  const { currentTeam, isEditingMode, editingTeam } = useTeam();
  const supabase = createClient();
  
  // Calcular el equipo efectivo directamente
  const effectiveTeamId = isEditingMode && editingTeam ? editingTeam.id : currentTeam?.id;

  // Create cache key that includes team context
  const cacheKey = `${user?.id || ''}-${effectiveTeamId || 'personal'}`;

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
      
      // Prepare queries based on team context
      let projectsQuery = supabase
        .from('projects')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      let salesQuery = supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      let expensesQuery = supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      // Apply team context filters
      if (effectiveTeamId) {
        // Get team data
        projectsQuery = projectsQuery.eq('team_id', effectiveTeamId);
        salesQuery = salesQuery.eq('team_id', effectiveTeamId);
        expensesQuery = expensesQuery.eq('team_id', effectiveTeamId);
      } else {
        // Get personal data (where team_id is null)
        projectsQuery = projectsQuery.eq('user_id', user.id).is('team_id', null);
        salesQuery = salesQuery.eq('user_id', user.id).is('team_id', null);
        expensesQuery = expensesQuery.eq('user_id', user.id).is('team_id', null);
      }

      // Fetch all data in parallel
      const [projectsResult, salesResult, expensesResult] = await Promise.allSettled([
        projectsQuery,
        salesQuery,
        expensesQuery
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
  }, [user, effectiveTeamId, cacheKey, supabase]);

  const invalidateCache = useCallback(() => {
    dashboardCache.delete(cacheKey);
  }, [cacheKey]);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user, effectiveTeamId, fetchDashboardData]);

  const stats = useMemo((): DashboardStats => {
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const totalProfit = sales.reduce((sum, sale) => sum + sale.total_profit, 0);
    const totalPrintHours = sales.reduce((sum, sale) => sum + sale.total_print_hours, 0);
    const totalProducts = sales.reduce((sum, sale) => sum + sale.items_count, 0);
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    
    const averageMargin = sales.length > 0 
      ? sales.reduce((sum, sale) => sum + sale.total_margin, 0) / sales.length 
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