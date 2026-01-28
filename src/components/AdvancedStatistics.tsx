import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ComposedChart
} from 'recharts';

import { 
  ArrowLeft, TrendingUp, Calendar, Target, DollarSign, Clock, 
  BarChart3, Activity, Filter, Receipt, Zap, Award, Star, 
  ArrowUpRight, ArrowDownRight, PieChart as PieChartIcon, 
  LineChart as LineChartIcon, TrendingDown, Eye, Download,
  RefreshCw, Settings, Lightbulb, AlertCircle, CheckCircle, User
} from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTeam } from '@/components/providers/TeamProvider';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { AdvancedStatisticsSkeleton } from '@/components/skeletons';
import type { Sale, Expense, Client } from '@/types';

interface AdvancedStatsProps {
  onBack: () => void;
}

export default function AdvancedStatistics({ onBack }: AdvancedStatsProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [chartType, setChartType] = useState<'revenue' | 'profit' | 'margin' | 'expenses'>('revenue');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'trends' | 'insights'>('overview');
  const { user } = useAuth();
  const { currentTeam, getEffectiveTeam } = useTeam();
  const supabase = createClient();
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    if (user) {
      fetchData();
      fetchClients();
    }
  }, [user, getEffectiveTeam]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Prepare queries based on team context
      let salesQuery = supabase
        .from('sales')
        .select('*, items:sale_items(*)')
        .order('created_at', { ascending: false });

      let expensesQuery = supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply team context filters
      const effectiveTeam = getEffectiveTeam();
      if (effectiveTeam) {
        // Get team data
        salesQuery = salesQuery.eq('team_id', effectiveTeam.id);
        expensesQuery = expensesQuery.eq('team_id', effectiveTeam.id);
      } else {
        // Get personal data (where team_id is null)
        salesQuery = salesQuery.eq('user_id', user.id).is('team_id', null);
        expensesQuery = expensesQuery.eq('user_id', user.id).is('team_id', null);
      }

      // Fetch sales
      const { data: salesData, error: salesError } = await salesQuery;

      if (salesError) {
        console.error('Error fetching sales:', salesError);
      } else {
        setSales(salesData || []);
      }

      // Fetch expenses
      const { data: expensesData, error: expensesError } = await expensesQuery;

      if (expensesError) {
        console.error('Error fetching expenses:', expensesError);
      } else {
        setExpenses(expensesData || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Nueva función para obtener clientes
  const fetchClients = async () => {
    if (!user) return;
    try {
      let clientsQuery = supabase
        .from('clients')
        .select('*')
        .order('created_at', { ascending: true });
      const effectiveTeam = getEffectiveTeam();
      if (effectiveTeam) {
        clientsQuery = clientsQuery.eq('team_id', effectiveTeam.id);
      } else {
        clientsQuery = clientsQuery.eq('user_id', user.id).is('team_id', null);
      }
      const { data: clientsData, error: clientsError } = await clientsQuery;
      if (clientsError) {
        console.error('Error fetching clients:', clientsError);
      } else {
        setClients(clientsData || []);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    }
  };

  // Filtrar ventas por rango de tiempo
  const filteredSales = useMemo(() => {
    const now = new Date();
    const completedSales = sales.filter(sale => sale.status === 'completed');
    
    if (timeRange === 'all') return completedSales;

    const days = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    }[timeRange];

    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return completedSales.filter(sale => new Date(sale.date) >= cutoffDate);
  }, [sales, timeRange]);

  // Filtrar gastos por rango de tiempo
  const filteredExpenses = useMemo(() => {
    const now = new Date();
    const paidExpenses = expenses.filter(expense => expense.status === 'paid');
    
    if (timeRange === 'all') return paidExpenses;

    const days = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '1y': 365
    }[timeRange];

    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return paidExpenses.filter(expense => new Date(expense.date) >= cutoffDate);
  }, [expenses, timeRange]);

  // Datos para gráfico temporal
  const timeSeriesData = useMemo(() => {
    const grouped = filteredSales.reduce((acc, sale) => {
      const date = sale.date;
      if (!acc[date]) {
        acc[date] = {
          date,
          revenue: 0,
          cost: 0,
          profit: 0,
          sales: 0,
          hours: 0,
          expenses: 0
        };
      }
      acc[date].revenue += sale.total_amount;
      acc[date].cost += sale.total_cost;
      acc[date].profit += sale.total_profit;
      acc[date].sales += 1;
      acc[date].hours += sale.total_print_hours;
      return acc;
    }, {} as Record<string, any>);

    // Add expenses to the grouped data
    filteredExpenses.forEach(expense => {
      const date = expense.date;
      if (!grouped[date]) {
        grouped[date] = {
          date,
          revenue: 0,
          cost: 0,
          profit: 0,
          sales: 0,
          hours: 0,
          expenses: 0
        };
      }
      grouped[date].expenses += expense.amount;
    });

    return Object.values(grouped)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((item: any) => ({
        ...item,
        margin: item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0,
        netProfit: item.profit - item.expenses,
        eurosPerHour: item.hours > 0 ? (item.profit - item.expenses) / item.hours : 0,
        dateFormatted: new Date(item.date).toLocaleDateString('es-ES', { 
          month: 'short', 
          day: 'numeric' 
        })
      }));
  }, [filteredSales, filteredExpenses]);

  // Datos para gráfico de distribución de proyectos
  const projectDistribution = useMemo(() => {
    const projectStats: Record<string, { name: string; revenue: number; profit: number; sales: number; hours: number }> = {};
    filteredSales.forEach(sale => {
      if (sale.items && sale.items.length > 0) {
        sale.items.forEach(item => {
          const name = item.project_name || 'Sin proyecto';
          if (!projectStats[name]) {
            projectStats[name] = {
              name,
              revenue: 0,
              profit: 0,
              sales: 0,
              hours: 0
            };
          }
          // Sumar los importes proporcionales del item
          projectStats[name].revenue += item.sale_price * item.quantity;
          projectStats[name].profit += (item.sale_price - item.unit_cost) * item.quantity;
          projectStats[name].sales += item.quantity;
          projectStats[name].hours += item.print_hours * item.quantity;
        });
      } else {
        // Venta sin items (caso raro o legacy)
        const name = 'Sin proyecto';
        if (!projectStats[name]) {
          projectStats[name] = {
            name,
            revenue: 0,
            profit: 0,
            sales: 0,
            hours: 0
          };
        }
        projectStats[name].revenue += sale.total_amount;
        projectStats[name].profit += sale.total_profit;
        projectStats[name].sales += 1;
        projectStats[name].hours += sale.total_print_hours;
      }
    });
    return Object.values(projectStats)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filteredSales]);

  // Datos para gráfico de márgenes
  const marginDistribution = useMemo(() => {
    const ranges = [
      { name: '< 0%', min: -Infinity, max: 0, count: 0, color: '#ef4444' },
      { name: '0-10%', min: 0, max: 10, count: 0, color: '#f97316' },
      { name: '10-25%', min: 10, max: 25, count: 0, color: '#eab308' },
      { name: '25-50%', min: 25, max: 50, count: 0, color: '#22c55e' },
      { name: '> 50%', min: 50, max: Infinity, count: 0, color: '#10b981' }
    ];

    filteredSales.forEach(sale => {
      const margin = sale.total_amount > 0 ? (sale.total_profit / sale.total_amount) * 100 : 0;
      const range = ranges.find(r => margin >= r.min && margin < r.max);
      if (range) range.count++;
    });

    return ranges.filter(r => r.count > 0);
  }, [filteredSales]);

  // Breakdown de gastos por categoría
  const expenseCategoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    filteredExpenses.forEach(expense => {
      if (!breakdown[expense.category]) breakdown[expense.category] = 0;
      breakdown[expense.category] += expense.amount;
    });
    return Object.entries(breakdown).map(([category, amount]) => ({ category, amount }));
  }, [filteredExpenses]);

  // Evolución de clientes
  const clientEvolution = useMemo(() => {
    // Agrupar por mes/año
    const grouped: Record<string, number> = {};
    clients.forEach(client => {
      const date = new Date(client.created_at);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!grouped[key]) grouped[key] = 0;
      grouped[key]++;
    });
    // Acumulado
    let total = 0;
    const sorted = Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => {
        total += count;
        return { month: key, count: total };
      });
    return sorted;
  }, [clients]);

  // Estadísticas resumidas
  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const totalCost = filteredSales.reduce((sum, sale) => sum + sale.total_cost, 0);
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalProfit = totalRevenue - totalCost;
    const netProfit = totalProfit - totalExpenses;
    const totalHours = filteredSales.reduce((sum, sale) => sum + sale.total_print_hours, 0);
    const avgMargin = filteredSales.length > 0 
      ? filteredSales.reduce((sum, sale) => {
          const margin = sale.total_amount > 0 ? (sale.total_profit / sale.total_amount) * 100 : 0;
          return sum + margin;
        }, 0) / filteredSales.length 
      : 0;
    const avgSaleValue = filteredSales.length > 0 ? totalRevenue / filteredSales.length : 0;
    const eurosPerHour = totalHours > 0 ? netProfit / totalHours : 0;

    // Tendencias (comparar con período anterior)
    const periodDays = timeRange === 'all' ? 365 : parseInt(timeRange.replace(/\D/g, ''));
    const previousPeriodStart = new Date();
    previousPeriodStart.setDate(previousPeriodStart.getDate() - (periodDays * 2));
    const previousPeriodEnd = new Date();
    previousPeriodEnd.setDate(previousPeriodEnd.getDate() - periodDays);

    const previousSales = sales.filter(sale => {
      const saleDate = new Date(sale.date);
      return sale.status === 'completed' && 
             saleDate >= previousPeriodStart && 
             saleDate <= previousPeriodEnd;
    });

    const previousExpenses = expenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expense.status === 'paid' && 
             expenseDate >= previousPeriodStart && 
             expenseDate <= previousPeriodEnd;
    });

    const previousRevenue = previousSales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const previousExpensesTotal = previousExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const previousProfit = previousSales.reduce((sum, sale) => sum + sale.total_profit, 0);
    const previousNetProfit = previousProfit - previousExpensesTotal;
    
    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const netProfitGrowth = previousNetProfit !== 0 ? ((netProfit - previousNetProfit) / Math.abs(previousNetProfit)) * 100 : 0;

    return {
      totalRevenue,
      totalCost,
      totalExpenses,
      totalProfit,
      netProfit,
      totalHours,
      avgMargin,
      avgSaleValue,
      eurosPerHour,
      revenueGrowth,
      netProfitGrowth,
      salesCount: filteredSales.length,
      expensesCount: filteredExpenses.length,
      profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
      netProfitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0
    };
  }, [filteredSales, filteredExpenses, sales, expenses, timeRange]);

  const { formatCurrency, currencySymbol } = useFormatCurrency();

  // Análisis de insights
  const insights = useMemo(() => {
    const insights = [];
    
    if (stats.avgMargin < 20) {
      insights.push({
        type: 'warning',
        title: 'Margen bajo detectado',
        description: 'Tu margen promedio está por debajo del umbral recomendado. Considera revisar tus precios.',
        icon: AlertCircle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      });
    }
    
    if (stats.eurosPerHour < 5) {
      insights.push({
        type: 'warning',
        title: 'Baja rentabilidad por hora',
        description: `Tu ${currencySymbol}/hora está por debajo de ${currencySymbol}5. Optimiza tus procesos.`,
        icon: TrendingDown,
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      });
    }
    
    if (stats.revenueGrowth > 10) {
      insights.push({
        type: 'success',
        title: 'Crecimiento excelente',
        description: 'Tus ingresos han crecido significativamente. ¡Sigue así!',
        icon: TrendingUp,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      });
    }
    
    if (projectDistribution.length > 0) {
      const topProject = projectDistribution[0];
      if (topProject.revenue > stats.totalRevenue * 0.3) {
        insights.push({
          type: 'info',
          title: 'Producto estrella',
          description: `${topProject.name} representa una gran parte de tus ingresos.`,
          icon: Star,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        });
      }
    }
    
    return insights;
  }, [stats, projectDistribution, currencySymbol]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  // Utilidad para mensajes vacíos
  const EmptyChartMessage = ({ message }: { message: string }) => (
    <div className="flex items-center justify-center h-full text-slate-400 text-lg font-medium">
      {message}
    </div>
  );

  if (loading) {
    return <AdvancedStatisticsSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header Mejorado */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mb-6 shadow-lg">
          <BarChart3 className="w-10 h-10 text-slate-700" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-3">Estadísticas Avanzadas</h1>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
          Análisis profundo de rentabilidad, tendencias y oportunidades de optimización 
          para maximizar el rendimiento de tu negocio de impresión 3D.
        </p>
      </motion.div>

      {/* Controles Mejorados */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col lg:flex-row items-center justify-between gap-4"
      >
        <button
          onClick={onBack}
          className="flex items-center text-slate-600 hover:text-slate-800 transition-colors duration-200 px-4 py-2 rounded-lg hover:bg-slate-100"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Volver a Contabilidad
        </button>

        <div className="flex items-center space-x-4">
          {/* Filtro de tiempo */}
          <div className="flex items-center space-x-2">
            <Calendar className="w-4 h-4 text-slate-500" />
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as any)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
            >
              <option value="7d">Últimos 7 días</option>
              <option value="30d">Últimos 30 días</option>
              <option value="90d">Últimos 90 días</option>
              <option value="1y">Último año</option>
              <option value="all">Todo el período</option>
            </select>
          </div>

          {/* Filtro de métrica */}
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-4 h-4 text-slate-500" />
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value as any)}
              className="px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-500 focus:border-transparent bg-white"
            >
              <option value="revenue">Ingresos</option>
              <option value="profit">Beneficios</option>
              <option value="margin">Márgenes</option>
              <option value="expenses">Gastos</option>
            </select>
          </div>

          <button
            onClick={fetchData}
            className="flex items-center space-x-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors duration-200"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Actualizar</span>
          </button>
        </div>
      </motion.div>

      {/* Tabs de Navegación */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex space-x-1 bg-slate-100 rounded-xl p-1"
      >
        {[
          { id: 'overview', label: 'Vista General', icon: BarChart3 },
          { id: 'performance', label: 'Rendimiento', icon: Target },
          { id: 'trends', label: 'Tendencias', icon: TrendingUp },
          { id: 'insights', label: 'Insights', icon: Lightbulb }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium">{tab.label}</span>
            </button>
          );
        })}
      </motion.div>

      {/* KPIs Principales Mejorados */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6"
      >
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center space-x-1">
              {stats.revenueGrowth >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-green-600" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-xs font-medium ${stats.revenueGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(Math.abs(stats.revenueGrowth))}
              </span>
            </div>
          </div>
          <div>
            <p className="text-blue-600 text-sm font-medium mb-1">Ingresos Período</p>
            <p className="text-2xl font-bold text-blue-900">{formatCurrency(stats.totalRevenue)}</p>
            <p className="text-blue-700 text-xs mt-2">
              {stats.salesCount} ventas realizadas
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-6 border border-green-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center space-x-1">
              {stats.netProfitGrowth >= 0 ? (
                <ArrowUpRight className="w-4 h-4 text-green-600" />
              ) : (
                <ArrowDownRight className="w-4 h-4 text-red-600" />
              )}
              <span className={`text-xs font-medium ${stats.netProfitGrowth >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatPercentage(Math.abs(stats.netProfitGrowth))}
              </span>
            </div>
          </div>
          <div>
            <p className="text-green-600 text-sm font-medium mb-1">Beneficio Neto</p>
            <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.netProfit)}</p>
            <p className="text-green-700 text-xs mt-2">
              {formatPercentage(stats.netProfitMargin)} margen neto
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs font-medium text-red-600">
                {stats.expensesCount}
              </span>
            </div>
          </div>
          <div>
            <p className="text-red-600 text-sm font-medium mb-1">Gastos Período</p>
            <p className="text-2xl font-bold text-red-900">{formatCurrency(stats.totalExpenses)}</p>
            <p className="text-red-700 text-xs mt-2">
              {stats.expensesCount} gastos registrados
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs font-medium text-purple-600">
                {stats.totalHours.toFixed(1)}h
              </span>
            </div>
          </div>
          <div>
            <p className="text-purple-600 text-sm font-medium mb-1">{currencySymbol}/Hora Promedio</p>
            <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.eurosPerHour)}</p>
            <p className="text-purple-700 text-xs mt-2">
              {stats.totalHours.toFixed(1)}h totales
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-2xl p-6 border border-orange-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-orange-500 rounded-xl flex items-center justify-center">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div className="flex items-center space-x-1">
              <span className="text-xs font-medium text-orange-600">
                {formatPercentage(stats.avgMargin)}
              </span>
            </div>
          </div>
          <div>
            <p className="text-orange-600 text-sm font-medium mb-1">Valor Promedio Venta</p>
            <p className="text-2xl font-bold text-orange-900">{formatCurrency(stats.avgSaleValue)}</p>
            <p className="text-orange-700 text-xs mt-2">
              {stats.salesCount} ventas
            </p>
          </div>
        </div>
      </motion.div>

      {/* Contenido según Tab Activo */}
      {activeTab === 'overview' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-8"
        >
          {/* Gráficos principales */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Gráfico temporal */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Evolución Temporal</h3>
                  <p className="text-sm text-gray-500">Análisis de tendencias en el tiempo</p>
                </div>
                <LineChartIcon className="w-5 h-5 text-gray-500" />
              </div>
              <div className="h-80">
                {timeSeriesData.length === 0 ? (
                  <EmptyChartMessage message="No hay datos suficientes para mostrar la evolución temporal." />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={timeSeriesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="dateFormatted" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: any, name?: string) => {
                          if (name === 'margin') return [formatPercentage(value), 'Margen'];
                          if (name === 'eurosPerHour') return [formatCurrency(value), `${currencySymbol}/Hora`];
                          if (name === 'netProfit') return [formatCurrency(value), 'Beneficio Neto'];
                          if (name === 'expenses') return [formatCurrency(value), 'Gastos'];
                          return [formatCurrency(value), name === 'revenue' ? 'Ingresos' : name === 'profit' ? 'Beneficio Bruto' : 'Coste'];
                        }}
                      />
                      <Legend />
                      {chartType === 'revenue' && (
                        <>
                          <Line type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={3} name="Ingresos" />
                          <Line type="monotone" dataKey="cost" stroke="#ef4444" strokeWidth={2} name="Costes" />
                          <Line type="monotone" dataKey="expenses" stroke="#f59e0b" strokeWidth={2} name="Gastos" />
                        </>
                      )}
                      {chartType === 'profit' && (
                        <>
                          <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} name="Beneficio Bruto" />
                          <Line type="monotone" dataKey="netProfit" stroke="#059669" strokeWidth={3} name="Beneficio Neto" />
                        </>
                      )}
                      {chartType === 'margin' && (
                        <Line type="monotone" dataKey="margin" stroke="#8b5cf6" strokeWidth={3} name="Margen %" />
                      )}
                      {chartType === 'expenses' && (
                        <Line type="monotone" dataKey="expenses" stroke="#f59e0b" strokeWidth={3} name="Gastos" />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>

            {/* Gráfico de distribución de márgenes */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Distribución de Márgenes</h3>
                  <p className="text-sm text-gray-500">Análisis de rentabilidad por rangos</p>
                </div>
                <PieChartIcon className="w-5 h-5 text-gray-500" />
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={marginDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {marginDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [value, 'Ventas']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Gráfico de proyectos más rentables */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Gráfico de pastel de ingresos por proyecto */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Proporción de Ingresos por Proyecto</h3>
                  <p className="text-sm text-gray-500">Visualiza qué proyectos generan más ingresos</p>
                </div>
                <PieChartIcon className="w-5 h-5 text-gray-500" />
              </div>
              <div className="h-72">
                {projectDistribution.length === 0 ? (
                  <EmptyChartMessage message="No hay datos de proyectos para mostrar." />
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={projectDistribution}
                        dataKey="revenue"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        label={({ name, percent }) => percent !== undefined ? `${name}: ${(percent * 100).toFixed(1)}%` : name}
                      >
                        {projectDistribution.map((entry, index) => (
                          <Cell key={`cell-pie-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: any) => [formatCurrency(value), 'Ingresos']} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
            {/* Tabla de proyectos destacados */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 overflow-x-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Top 10 Proyectos Detallados</h3>
                  <p className="text-sm text-gray-500">Ranking de proyectos más rentables</p>
                </div>
                <Activity className="w-5 h-5 text-gray-500" />
              </div>
              {projectDistribution.length === 0 ? (
                <EmptyChartMessage message="No hay datos de proyectos para mostrar." />
              ) : (
                <table className="min-w-full text-left text-sm">
                  <thead>
                    <tr className="text-slate-500 border-b">
                      <th className="py-2 pr-4">Proyecto</th>
                      <th className="py-2 pr-4">Ingresos</th>
                      <th className="py-2 pr-4">Beneficio</th>
                      <th className="py-2 pr-4">Ventas</th>
                      <th className="py-2 pr-4">Horas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectDistribution.map((project, idx) => (
                      <tr key={project.name} className={idx % 2 === 0 ? 'bg-slate-50' : ''}>
                        <td className="py-2 pr-4 font-medium text-slate-900">{project.name}</td>
                        <td className="py-2 pr-4">{formatCurrency(project.revenue)}</td>
                        <td className="py-2 pr-4 text-green-700">{formatCurrency(project.profit)}</td>
                        <td className="py-2 pr-4">{project.sales}</td>
                        <td className="py-2 pr-4">{project.hours.toFixed(1)}h</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Breakdown de gastos por categoría */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Gastos por Categoría</h3>
                <p className="text-sm text-gray-500">Distribución de gastos en el período</p>
              </div>
              <PieChartIcon className="w-5 h-5 text-gray-500" />
            </div>
            <div className="h-72">
              {expenseCategoryBreakdown.length === 0 ? (
                <EmptyChartMessage message="No hay gastos registrados en este período." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={expenseCategoryBreakdown}
                      dataKey="amount"
                      nameKey="category"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label={({ name, percent }) => percent !== undefined ? `${name}: ${(percent * 100).toFixed(1)}%` : name}
                    >
                      {expenseCategoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-expense-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [formatCurrency(value), 'Gasto']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'performance' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid md:grid-cols-2 gap-6"
        >
          {/* Métricas de rendimiento */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Métricas de Rendimiento</h3>
                <p className="text-sm text-gray-500">Indicadores clave de rentabilidad</p>
              </div>
              <Target className="w-5 h-5 text-gray-500" />
            </div>
            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Margen promedio</span>
                <span className="font-semibold text-gray-900">{formatPercentage(stats.avgMargin)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">ROI promedio</span>
                <span className="font-semibold text-gray-900">
                  {stats.totalCost > 0 ? formatPercentage((stats.totalProfit / stats.totalCost) * 100) : '0%'}
                </span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Eficiencia ({currencySymbol}/h)</span>
                <span className="font-semibold text-gray-900">{formatCurrency(stats.eurosPerHour)}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-b border-gray-100">
                <span className="text-gray-600">Ventas por día</span>
                <span className="font-semibold text-gray-900">
                  {timeRange !== 'all' ? 
                    (stats.salesCount / parseInt(timeRange.replace(/\D/g, ''))).toFixed(1) : 
                    (stats.salesCount / 365).toFixed(1)
                  }
                </span>
              </div>
              <div className="flex justify-between items-center py-3">
                <span className="text-gray-600">Margen neto</span>
                <span className="font-semibold text-gray-900">{formatPercentage(stats.netProfitMargin)}</span>
              </div>
            </div>
          </div>

          {/* Top productos */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Productos Estrella</h3>
                <p className="text-sm text-gray-500">Top 5 productos más rentables</p>
              </div>
              <Award className="w-5 h-5 text-gray-500" />
            </div>
            <div className="space-y-3">
              {projectDistribution.slice(0, 5).map((project, index) => (
                <div key={project.name} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors duration-200">
                  <div className="flex items-center space-x-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold ${
                      index === 0 ? 'bg-yellow-500' : 
                      index === 1 ? 'bg-gray-400' : 
                      index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{project.name}</p>
                      <p className="text-sm text-gray-500">{project.sales} ventas</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">{formatCurrency(project.revenue)}</p>
                    <p className="text-sm text-green-600">{formatCurrency(project.profit)} beneficio</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'trends' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Análisis de tendencias */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Análisis de Tendencias</h3>
                <p className="text-sm text-gray-500">Evolución temporal de métricas clave</p>
              </div>
              <TrendingUp className="w-5 h-5 text-gray-500" />
            </div>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={timeSeriesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="dateFormatted" />
                  <YAxis />
                  <Tooltip
                    formatter={(value: any, name?: string) => [
                      name === 'margin' ? formatPercentage(value) : formatCurrency(value),
                      name === 'revenue' ? 'Ingresos' : name === 'profit' ? 'Beneficio' : name === 'expenses' ? 'Gastos' : 'Margen'
                    ]}
                  />
                  <Legend />
                  <Area type="monotone" dataKey="revenue" fill="#3b82f6" stroke="#3b82f6" fillOpacity={0.3} name="Ingresos" />
                  <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} name="Beneficio" />
                  <Line type="monotone" dataKey="expenses" stroke="#f59e0b" strokeWidth={2} name="Gastos" />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Evolución de clientes */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Evolución de Clientes</h3>
                <p className="text-sm text-gray-500">Clientes acumulados por mes</p>
              </div>
              <User className="w-5 h-5 text-gray-500" />
            </div>
            <div className="h-72">
              {clientEvolution.length === 0 ? (
                <EmptyChartMessage message="No hay clientes registrados aún." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={clientEvolution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis allowDecimals={false} />
                    <Tooltip formatter={(value: any) => [value, 'Clientes acumulados']} />
                    <Legend />
                    <Line type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} name="Clientes acumulados" />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {activeTab === 'insights' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Insights */}
          <div className="grid md:grid-cols-2 gap-6">
            {insights.map((insight, index) => {
              const Icon = insight.icon;
              return (
                <div key={index} className={`${insight.bgColor} rounded-2xl p-6 border border-gray-200`}>
                  <div className="flex items-start space-x-3">
                    <div className={`w-10 h-10 ${insight.bgColor} rounded-xl flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${insight.color}`} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{insight.title}</h4>
                      <p className="text-sm text-gray-600">{insight.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Recomendaciones */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Recomendaciones</h3>
                <p className="text-sm text-blue-700">Acciones sugeridas para mejorar tu rendimiento</p>
              </div>
              <Lightbulb className="w-5 h-5 text-blue-600" />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl p-4">
                <h4 className="font-medium text-gray-900 mb-2">Optimizar Precios</h4>
                <p className="text-sm text-gray-600">Considera aumentar los precios de productos con bajo margen para mejorar la rentabilidad.</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <h4 className="font-medium text-gray-900 mb-2">Reducir Costes</h4>
                <p className="text-sm text-gray-600">Analiza tus gastos y busca oportunidades para reducir costes operativos.</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <h4 className="font-medium text-gray-900 mb-2">Mejorar Eficiencia</h4>
                <p className="text-sm text-gray-600">Optimiza tus procesos de impresión para aumentar la producción por hora.</p>
              </div>
              <div className="bg-white rounded-xl p-4">
                <h4 className="font-medium text-gray-900 mb-2">Diversificar Productos</h4>
                <p className="text-sm text-gray-600">Desarrolla nuevos productos para reducir la dependencia de productos estrella.</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}