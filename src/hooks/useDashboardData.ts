import { useQuery } from '@tanstack/react-query';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTeam } from '@/components/providers/TeamProvider';
import { createClient } from '@/lib/supabase';
import { useMemo } from 'react';
import type { DatabaseProject, Sale, Expense, DashboardStats } from '@/types';
import { logger } from '@/lib/logger';

export function useDashboardData() {
  const { user } = useAuth();
  const { currentTeam, isEditingMode, editingTeam } = useTeam();
  const supabase = createClient();

  const effectiveTeamId = (isEditingMode && editingTeam) ? editingTeam.id : currentTeam?.id;

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard', user?.id, effectiveTeamId],
    queryFn: async () => {
      if (!user) return null;

      // Construir queries base
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

      // Aplicar filtros de equipo
      if (effectiveTeamId) {
        projectsQuery = projectsQuery.eq('team_id', effectiveTeamId);
        salesQuery = salesQuery.eq('team_id', effectiveTeamId);
        expensesQuery = expensesQuery.eq('team_id', effectiveTeamId);
      } else {
        projectsQuery = projectsQuery.eq('user_id', user.id).is('team_id', null);
        salesQuery = salesQuery.eq('user_id', user.id).is('team_id', null);
        expensesQuery = expensesQuery.eq('user_id', user.id).is('team_id', null);
      }

      // Ejecutar en paralelo
      const [projectsResult, salesResult, expensesResult] = await Promise.allSettled([
        projectsQuery,
        salesQuery,
        expensesQuery,
      ]);

      // Procesar resultados
      const projects: DatabaseProject[] = [];
      const sales: Sale[] = [];
      const expenses: Expense[] = [];

      if (projectsResult.status === 'fulfilled' && !projectsResult.value.error) {
        projects.push(...(projectsResult.value.data || []));
      } else {
        logger.error('Error fetching projects:', projectsResult.status === 'rejected' ? projectsResult.reason : projectsResult.value?.error);
      }

      if (salesResult.status === 'fulfilled' && !salesResult.value.error) {
        sales.push(...(salesResult.value.data || []));
      } else {
        logger.error('Error fetching sales:', salesResult.status === 'rejected' ? salesResult.reason : salesResult.value?.error);
      }

      if (expensesResult.status === 'fulfilled' && !expensesResult.value.error) {
        expenses.push(...(expensesResult.value.data || []));
      } else {
        logger.error('Error fetching expenses:', expensesResult.status === 'rejected' ? expensesResult.reason : expensesResult.value?.error);
      }

      return { projects, sales, expenses };
    },
    enabled: !!user,
  });

  // Calcular estadísticas con useMemo
  const stats = useMemo((): DashboardStats => {
    if (!data) {
      return {
        totalProjects: 0,
        totalSales: 0,
        totalRevenue: 0,
        totalProfit: 0,
        averageMargin: 0,
        totalPrintHours: 0,
        averageEurosPerHour: 0,
        totalProducts: 0,
        totalExpenses: 0,
        netProfit: 0,
      };
    }

    const totalRevenue = data.sales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const totalProfit = data.sales.reduce((sum, sale) => sum + sale.total_profit, 0);
    const totalPrintHours = data.sales.reduce((sum, sale) => sum + sale.total_print_hours, 0);
    const totalProducts = data.sales.reduce((sum, sale) => sum + sale.items_count, 0);
    const totalExpenses = data.expenses.reduce((sum, expense) => sum + expense.amount, 0);

    const averageMargin = data.sales.length > 0
      ? data.sales.reduce((sum, sale) => sum + sale.total_margin, 0) / data.sales.length
      : 0;

    const averageEurosPerHour = totalPrintHours > 0 ? totalProfit / totalPrintHours : 0;
    const netProfit = totalProfit - totalExpenses;

    return {
      totalProjects: data.projects.length,
      totalSales: data.sales.length,
      totalRevenue,
      totalProfit,
      averageMargin,
      totalPrintHours,
      averageEurosPerHour,
      totalProducts,
      totalExpenses,
      netProfit,
    };
  }, [data]);

  return {
    projects: data?.projects || [],
    sales: data?.sales || [],
    expenses: data?.expenses || [],
    stats,
    loading: isLoading,
    error: error ? (error as Error).message : null,
    refetch,
  };
}
