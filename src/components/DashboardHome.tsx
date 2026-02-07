'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, Calculator, FileText, Euro, Clock, Package, Users, Activity,
  Target, BarChart3, Zap, Calendar, ArrowUpRight, ArrowDownRight, 
  DollarSign, PieChart, LineChart, Award, Star, TrendingDown, Receipt
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTeam } from '@/components/providers/TeamProvider';
import { createClient } from '@/lib/supabase';
import { kanbanBoardService } from '@/services/kanbanBoardService';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { DashboardStats, Sale, Expense, KanbanCard } from '@/types';
import TeamContextBanner from './TeamContextBanner';

interface DashboardHomeProps {
  stats: DashboardStats;
  onNavigate: (page: string) => void;
}

export default function DashboardHome({ stats, onNavigate }: DashboardHomeProps) {
  const { formatCurrency, currencySymbol } = useFormatCurrency();
  const { user } = useAuth();
  const { currentTeam, getEffectiveTeam } = useTeam();
  const supabase = createClient();
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [kanbanCards, setKanbanCards] = useState<KanbanCard[]>([]);
  const [loading, setLoading] = useState(true);
  
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  // Calcular métricas adicionales
  const avgRevenuePerProject = stats.totalProjects > 0 ? stats.totalRevenue / stats.totalProjects : 0;
  const avgProfitPerSale = stats.totalSales > 0 ? stats.totalProfit / stats.totalSales : 0;
  const efficiencyRatio = stats.totalPrintHours > 0 ? stats.totalRevenue / stats.totalPrintHours : 0;
  const profitMargin = stats.totalRevenue > 0 ? (stats.totalProfit / stats.totalRevenue) * 100 : 0;
  const netProfitMargin = stats.totalRevenue > 0 ? (stats.netProfit / stats.totalRevenue) * 100 : 0;

  // Obtener datos del mes actual
  useEffect(() => {
    if (!user) return;

    const fetchData = async () => {
      try {
        setLoading(true);
        const effectiveTeam = getEffectiveTeam();
        
        // Obtener ventas del mes actual
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
        
        let salesQuery = supabase
          .from('sales')
          .select('*, items:sale_items(*)')
          .gte('date', startOfMonth.toISOString().split('T')[0])
          .lte('date', endOfMonth.toISOString().split('T')[0])
          .eq('status', 'completed')
          .order('date', { ascending: true });

        let expensesQuery = supabase
          .from('expenses')
          .select('*')
          .gte('date', startOfMonth.toISOString().split('T')[0])
          .lte('date', endOfMonth.toISOString().split('T')[0])
          .eq('status', 'paid')
          .order('date', { ascending: true });

        if (effectiveTeam) {
          salesQuery = salesQuery.eq('team_id', effectiveTeam.id);
          expensesQuery = expensesQuery.eq('team_id', effectiveTeam.id);
        } else {
          salesQuery = salesQuery.eq('user_id', user.id).is('team_id', null);
          expensesQuery = expensesQuery.eq('user_id', user.id).is('team_id', null);
        }

        const [salesResult, expensesResult] = await Promise.all([
          salesQuery,
          expensesQuery
        ]);

        if (salesResult.data) setSales(salesResult.data);
        if (expensesResult.data) setExpenses(expensesResult.data);

        // Obtener tarjetas kanban que no estén completadas
        const kanbanData = await kanbanBoardService.getKanbanCards(
          user.id,
          effectiveTeam?.id
        );
        const activeCards = kanbanData.filter(card => card.status !== 'completed');
        setKanbanCards(activeCards);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user, currentTeam, getEffectiveTeam]);

  // Datos para gráfico de progresión de ventas del mes
  const salesChartData = useMemo(() => {
    const grouped = sales.reduce((acc, sale) => {
      const date = sale.date;
      if (!acc[date]) {
        acc[date] = { date, revenue: 0, sales: 0 };
      }
      acc[date].revenue += sale.total_amount;
      acc[date].sales += 1;
      return acc;
    }, {} as Record<string, { date: string; revenue: number; sales: number }>);

    // Generar todos los días del mes
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const chartData = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(now.getFullYear(), now.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = grouped[dateStr] || { date: dateStr, revenue: 0, sales: 0 };
      
      // Calcular acumulado
      const previousDay = chartData.length > 0 ? chartData[chartData.length - 1].revenue : 0;
      chartData.push({
        date: day.toString(),
        dateFormatted: date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        revenue: previousDay + dayData.revenue,
        dailyRevenue: dayData.revenue,
        sales: dayData.sales
      });
    }

    return chartData;
  }, [sales]);

  // Datos para gráfico de progresión de gastos del mes
  const expensesChartData = useMemo(() => {
    const grouped = expenses.reduce((acc, expense) => {
      const date = expense.date;
      if (!acc[date]) {
        acc[date] = { date, amount: 0, count: 0 };
      }
      acc[date].amount += expense.amount;
      acc[date].count += 1;
      return acc;
    }, {} as Record<string, { date: string; amount: number; count: number }>);

    // Generar todos los días del mes
    const now = new Date();
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const chartData = [];
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(now.getFullYear(), now.getMonth(), day);
      const dateStr = date.toISOString().split('T')[0];
      const dayData = grouped[dateStr] || { date: dateStr, amount: 0, count: 0 };
      
      // Calcular acumulado
      const previousDay = chartData.length > 0 ? chartData[chartData.length - 1].amount : 0;
      chartData.push({
        date: day.toString(),
        dateFormatted: date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        amount: previousDay + dayData.amount,
        dailyAmount: dayData.amount,
        count: dayData.count
      });
    }

    return chartData;
  }, [expenses]);

  const quickActions = [
    {
      id: 'calculator',
      title: 'Nuevo Proyecto',
      description: 'Crear un nuevo proyecto de impresión 3D',
      icon: Calculator,
      color: 'from-brand-500 to-coral-500',
      bgColor: 'bg-brand-50',
      iconColor: 'text-brand-600',
      onClick: () => onNavigate('calculator')
    },
    {
      id: 'accounting',
      title: 'Contabilidad',
      description: 'Gestionar ventas y gastos',
      icon: Euro,
      color: 'from-success-500 to-success-600',
      bgColor: 'bg-success-50',
      iconColor: 'text-success-600',
      onClick: () => onNavigate('accounting')
    },
    {
      id: 'projects',
      title: 'Proyectos',
      description: 'Ver y gestionar proyectos existentes',
      icon: FileText,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      iconColor: 'text-purple-600',
      onClick: () => onNavigate('projects')
    }
  ];

  const performanceMetrics = [
    {
      title: 'Eficiencia Operativa',
      value: formatCurrency(efficiencyRatio),
      subtitle: `${currencySymbol}/hora de impresión`,
      icon: Zap,
      color: 'from-warning-500 to-warning-600',
      bgColor: 'bg-warning-50',
      trend: null,
      trendUp: true
    },
    {
      title: 'Margen de Beneficio',
      value: formatPercentage(profitMargin),
      subtitle: 'Porcentaje sobre ventas',
      icon: Target,
      color: 'from-success-500 to-success-600',
      bgColor: 'bg-success-50',
      trend: null,
      trendUp: true
    },
    {
      title: 'Valor Promedio',
      value: formatCurrency(avgRevenuePerProject),
      subtitle: 'Por proyecto',
      icon: Award,
      color: 'from-purple-500 to-purple-600',
      bgColor: 'bg-purple-50',
      trend: null,
      trendUp: true
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-1 space-y-1.5 h-full flex flex-col">
      {/* Team Context Banner */}
      <div className="flex-shrink-0">
        <TeamContextBanner />
      </div>
      
      {/* Header Compacto */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center pb-1 flex-shrink-0"
      >
        <img src="/logo.svg" alt="Logo MakerCycle" className="w-32 h-auto mx-auto mb-1 object-contain" />
        <p className="text-xs text-dark-500 max-w-2xl mx-auto">
          Bienvenid@ {user?.user_metadata?.full_name || user?.email?.split('@')[0] || ''}
        </p>
      </motion.div>

      {/* KPIs Principales - Compactos */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-4 gap-1.5 flex-shrink-0"
      >
        <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-lg p-3 border border-brand-200 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <div className="w-8 h-8 bg-brand-gradient rounded-lg flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-brand-600 mb-0.5">Proyectos</p>
            <p className="text-lg font-bold text-brand-900">{stats.totalProjects}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-success-50 to-success-100 rounded-lg p-3 border border-success-200 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <div className="w-8 h-8 bg-success-500 rounded-lg flex items-center justify-center">
              <Euro className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-success-600 mb-0.5">Ventas</p>
            <p className="text-lg font-bold text-success-900">{stats.totalSales}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg p-3 border border-purple-200 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <DollarSign className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-purple-600 mb-0.5">Ingresos</p>
            <p className="text-lg font-bold text-purple-900">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-coral-50 to-coral-100 rounded-lg p-3 border border-coral-200 shadow-sm">
          <div className="flex items-center justify-between mb-1.5">
            <div className="w-8 h-8 bg-coral-500 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
          </div>
          <div>
            <p className="text-xs font-medium text-coral-600 mb-0.5">Horas</p>
            <p className="text-lg font-bold text-coral-900">{stats.totalPrintHours}h</p>
          </div>
        </div>
      </motion.div>

      {/* Sección: Cómo va tu negocio */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-2 flex-1 min-h-0 flex flex-col"
      >
        <h2 className="text-lg font-bold text-dark-900 font-display flex-shrink-0">Cómo va tu negocio</h2>
        
        <div className="grid grid-cols-2 gap-1.5 flex-1" style={{ minHeight: '280px' }}>
          {/* Gráfico de Progresión de Ventas */}
          <div className="bg-white rounded-lg p-3 border border-cream-200 shadow-sm flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <h3 className="text-xs font-semibold text-dark-900">Progresión de ventas</h3>
              <TrendingUp className="w-3.5 h-3.5 text-success-600" />
            </div>
            <div className="flex-1 min-h-[280px]">
              {salesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={salesChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10 }}
                      interval="auto"
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip
                      formatter={(value: any) => [formatCurrency(value), 'Ventas acumuladas']}
                      labelFormatter={(label) => `Día ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="revenue" 
                      stroke="#10b981" 
                      strokeWidth={2} 
                      dot={{ r: 2 }}
                      name="Ventas"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-dark-400 text-sm">
                  No hay datos de ventas este mes
                </div>
              )}
            </div>
          </div>

          {/* Gráfico de Progresión de Gastos */}
          <div className="bg-white rounded-lg p-3 border border-cream-200 shadow-sm flex flex-col min-h-0">
            <div className="flex items-center justify-between mb-2 flex-shrink-0">
              <h3 className="text-xs font-semibold text-dark-900">Progresión de gastos</h3>
              <Receipt className="w-3.5 h-3.5 text-red-600" />
            </div>
            <div className="flex-1 min-h-[280px]">
              {expensesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={expensesChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 10 }}
                      interval="auto"
                    />
                    <YAxis 
                      tick={{ fontSize: 10 }}
                      tickFormatter={(value) => formatCurrency(value)}
                    />
                    <Tooltip
                      formatter={(value: any) => [formatCurrency(value), 'Gastos acumulados']}
                      labelFormatter={(label) => `Día ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="amount" 
                      stroke="#ef4444" 
                      strokeWidth={2} 
                      dot={{ r: 2 }}
                      name="Gastos"
                    />
                  </RechartsLineChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-dark-400 text-sm">
                  No hay datos de gastos este mes
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Paneles de Resumen Compactos */}
        <div className="grid grid-cols-4 gap-1.5 flex-shrink-0">
          <div className="bg-white rounded-lg p-2 border border-cream-200 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5">
                <div className="w-7 h-7 bg-warning-100 rounded-lg flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-warning-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-dark-500">Eficiencia</p>
                  <p className="text-base font-bold text-dark-900">{formatCurrency(efficiencyRatio)}</p>
                </div>
              </div>
              <p className="text-xs text-dark-400">{currencySymbol}/h</p>
            </div>
          </div>

          <div className="bg-white rounded-lg p-2 border border-cream-200 shadow-sm">
            <div className="flex items-center space-x-1.5 mb-1">
              <div className="w-7 h-7 bg-success-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-3.5 h-3.5 text-success-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-dark-500">Beneficio</p>
                <p className="text-base font-bold text-dark-900">{formatCurrency(stats.totalProfit)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-2 border border-cream-200 shadow-sm">
            <div className="flex items-center space-x-1.5 mb-1">
              <div className="w-7 h-7 bg-brand-100 rounded-lg flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-brand-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-dark-500">Margen</p>
                <p className="text-base font-bold text-dark-900">{formatPercentage(stats.averageMargin)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg p-2 border border-cream-200 shadow-sm">
            <div className="flex items-center space-x-1.5 mb-1">
              <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="w-3.5 h-3.5 text-purple-600" />
              </div>
              <div>
                <p className="text-xs font-medium text-dark-500">Neto</p>
                <p className="text-base font-bold text-dark-900">{formatCurrency(stats.netProfit)}</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Sección: Qué queda por hacer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="space-y-2 flex-shrink-0"
      >
        <h2 className="text-lg font-bold text-dark-900 font-display">Qué queda por hacer</h2>
        
        <div className="bg-white rounded-lg p-3 border border-cream-200 shadow-sm max-h-40 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-dark-400 text-sm">Cargando proyectos...</div>
            </div>
          ) : kanbanCards.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <FileText className="w-12 h-12 text-dark-300 mx-auto mb-2" />
                <p className="text-dark-400 text-sm">No hay proyectos pendientes</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-2">
              {kanbanCards.map((card) => {
                const statusColors = {
                  pending: 'bg-coral-50 text-coral-700 border-coral-200',
                  in_progress: 'bg-brand-50 text-brand-700 border-brand-200',
                };
                const statusLabels = {
                  pending: 'Pendiente',
                  in_progress: 'En desarrollo',
                };
                return (
                  <div
                    key={card.id}
                    className="bg-cream-50 rounded-lg p-2 border border-cream-200 hover:border-brand-200 transition-colors cursor-pointer mb-1.5 last:mb-0"
                    onClick={() => onNavigate('kanban')}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-semibold text-dark-900 mb-0.5 truncate">
                          {card.project?.name || 'Proyecto sin nombre'}
                        </p>
                        <div className="flex items-center gap-1.5">
                          <span className={`text-xs px-1.5 py-0.5 rounded-full border ${statusColors[card.status]}`}>
                            {statusLabels[card.status]}
                          </span>
                          {card.project?.profit_margin && (
                            <span className="text-xs text-dark-500 truncate">
                              {formatPercentage(card.project.profit_margin)}
                            </span>
                          )}
                        </div>
                      </div>
                      <ArrowUpRight className="w-3.5 h-3.5 text-dark-400 flex-shrink-0 ml-2" />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
