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
  RefreshCw, Settings, Lightbulb, AlertCircle, CheckCircle, User,
  Users, Percent, ShieldAlert, PackagePlus, Printer
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
      
      // Prepare queries based on team context — include printer amortizations
      let salesQuery = supabase
        .from('sales')
        .select('*, items:sale_items(*), printer_amortizations:sales_printer_amortizations(*)')
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

  // Fetch clients
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

  // ─── Helpers para periodo ───────────────────────────────────
  const periodDays = useMemo(() => {
    if (timeRange === 'all') return 365;
    return parseInt(timeRange.replace(/\D/g, ''));
  }, [timeRange]);

  // ─── Filtrar ventas por rango de tiempo ─────────────────────
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

  // ─── Filtrar gastos por rango de tiempo ─────────────────────
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

  // ─── Datos para gráfico temporal (diario) ───────────────────
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
          expenses: 0,
          amortization: 0
        };
      }
      acc[date].revenue += sale.total_amount;
      acc[date].cost += sale.total_cost;
      acc[date].profit += sale.total_profit;
      acc[date].sales += 1;
      acc[date].hours += sale.total_print_hours;
      // Sumar amortizaciones de impresoras
      if (sale.printer_amortizations && sale.printer_amortizations.length > 0) {
        acc[date].amortization += sale.printer_amortizations.reduce(
          (sum, a) => sum + (a.amortization_amount || 0), 0
        );
      }
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
          expenses: 0,
          amortization: 0
        };
      }
      grouped[date].expenses += expense.amount;
    });

    return Object.values(grouped)
      .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .map((item: any) => ({
        ...item,
        margin: item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0,
        netProfit: item.profit - item.expenses - item.amortization,
        eurosPerHour: item.hours > 0 ? (item.profit - item.expenses - item.amortization) / item.hours : 0,
        dateFormatted: new Date(item.date).toLocaleDateString('es-ES', { 
          month: 'short', 
          day: 'numeric' 
        })
      }));
  }, [filteredSales, filteredExpenses]);

  // ─── Datos mensuales agregados ──────────────────────────────
  const monthlyData = useMemo(() => {
    const grouped: Record<string, { 
      month: string; revenue: number; cost: number; profit: number; 
      expenses: number; amortization: number; hours: number; salesCount: number 
    }> = {};

    filteredSales.forEach(sale => {
      const d = new Date(sale.date);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!grouped[key]) {
        grouped[key] = { month: key, revenue: 0, cost: 0, profit: 0, expenses: 0, amortization: 0, hours: 0, salesCount: 0 };
      }
      grouped[key].revenue += sale.total_amount;
      grouped[key].cost += sale.total_cost;
      grouped[key].profit += sale.total_profit;
      grouped[key].hours += sale.total_print_hours;
      grouped[key].salesCount += 1;
      if (sale.printer_amortizations && sale.printer_amortizations.length > 0) {
        grouped[key].amortization += sale.printer_amortizations.reduce(
          (sum, a) => sum + (a.amortization_amount || 0), 0
        );
      }
    });

    filteredExpenses.forEach(expense => {
      const d = new Date(expense.date);
      const key = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!grouped[key]) {
        grouped[key] = { month: key, revenue: 0, cost: 0, profit: 0, expenses: 0, amortization: 0, hours: 0, salesCount: 0 };
      }
      grouped[key].expenses += expense.amount;
    });

    return Object.values(grouped)
      .sort((a, b) => a.month.localeCompare(b.month))
      .map(item => ({
        ...item,
        netProfit: item.profit - item.expenses - item.amortization,
        margin: item.revenue > 0 ? (item.profit / item.revenue) * 100 : 0,
        expenseRevenueRatio: item.revenue > 0 ? (item.expenses / item.revenue) * 100 : 0,
        monthFormatted: new Date(item.month + '-01').toLocaleDateString('es-ES', { month: 'short', year: '2-digit' })
      }));
  }, [filteredSales, filteredExpenses]);

  // ─── Datos para gráfico de distribución de proyectos ────────
  const projectDistribution = useMemo(() => {
    const projectStats: Record<string, { name: string; revenue: number; profit: number; sales: number; hours: number }> = {};
    filteredSales.forEach(sale => {
      if (sale.items && sale.items.length > 0) {
        sale.items.forEach(item => {
          const name = item.project_name || 'Sin proyecto';
          if (!projectStats[name]) {
            projectStats[name] = { name, revenue: 0, profit: 0, sales: 0, hours: 0 };
          }
          projectStats[name].revenue += item.sale_price * item.quantity;
          projectStats[name].profit += (item.sale_price - item.unit_cost) * item.quantity;
          projectStats[name].sales += item.quantity;
          projectStats[name].hours += item.print_hours * item.quantity;
        });
      } else {
        const name = 'Sin proyecto';
        if (!projectStats[name]) {
          projectStats[name] = { name, revenue: 0, profit: 0, sales: 0, hours: 0 };
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

  // ─── Datos para gráfico de márgenes ─────────────────────────
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

  // ─── Breakdown de gastos por categoría ──────────────────────
  const expenseCategoryBreakdown = useMemo(() => {
    const breakdown: Record<string, number> = {};
    filteredExpenses.forEach(expense => {
      if (!breakdown[expense.category]) breakdown[expense.category] = 0;
      breakdown[expense.category] += expense.amount;
    });
    return Object.entries(breakdown).map(([category, amount]) => ({ category, amount }));
  }, [filteredExpenses]);

  // ─── Evolución de clientes ──────────────────────────────────
  const clientEvolution = useMemo(() => {
    const grouped: Record<string, number> = {};
    clients.forEach(client => {
      const date = new Date(client.created_at);
      const key = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
      if (!grouped[key]) grouped[key] = 0;
      grouped[key]++;
    });
    let total = 0;
    const sorted = Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([key, count]) => {
        total += count;
        return { month: key, count: total };
      });
    return sorted;
  }, [clients]);

  // ─── Ranking de ingresos por cliente ────────────────────────
  const clientRevenueRanking = useMemo(() => {
    const clientMap: Record<string, { id: string; name: string; revenue: number; profit: number; salesCount: number }> = {};

    filteredSales.forEach(sale => {
      const clientId = sale.client_id || '__no_client__';
      const client = clients.find(c => c.id === clientId);
      const clientName = client ? client.name : 'Sin cliente';

      if (!clientMap[clientId]) {
        clientMap[clientId] = { id: clientId, name: clientName, revenue: 0, profit: 0, salesCount: 0 };
      }
      clientMap[clientId].revenue += sale.total_amount;
      clientMap[clientId].profit += sale.total_profit;
      clientMap[clientId].salesCount += 1;
    });

    return Object.values(clientMap)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 10);
  }, [filteredSales, clients]);

  // ─── Ratio gastos / ingresos en el tiempo ───────────────────
  const expenseRevenueRatioData = useMemo(() => {
    return monthlyData.map(m => ({
      month: m.monthFormatted,
      ratio: m.expenseRevenueRatio,
      revenue: m.revenue,
      expenses: m.expenses
    }));
  }, [monthlyData]);

  // ─── Estadísticas resumidas (con amortizaciones) ────────────
  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const totalCost = filteredSales.reduce((sum, sale) => sum + sale.total_cost, 0);
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalAmortization = filteredSales.reduce((sum, sale) => {
      if (sale.printer_amortizations && sale.printer_amortizations.length > 0) {
        return sum + sale.printer_amortizations.reduce((a, am) => a + (am.amortization_amount || 0), 0);
      }
      return sum;
    }, 0);
    const totalProfit = totalRevenue - totalCost;
    const netProfit = totalProfit - totalExpenses - totalAmortization;
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
    const previousCost = previousSales.reduce((sum, sale) => sum + sale.total_cost, 0);
    const previousExpensesTotal = previousExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const previousAmortization = previousSales.reduce((sum, sale) => {
      if (sale.printer_amortizations && sale.printer_amortizations.length > 0) {
        return sum + sale.printer_amortizations.reduce((a, am) => a + (am.amortization_amount || 0), 0);
      }
      return sum;
    }, 0);
    const previousProfit = previousRevenue - previousCost;
    const previousNetProfit = previousProfit - previousExpensesTotal - previousAmortization;
    const previousHours = previousSales.reduce((sum, sale) => sum + sale.total_print_hours, 0);
    const previousAvgMargin = previousSales.length > 0 
      ? previousSales.reduce((sum, sale) => {
          const margin = sale.total_amount > 0 ? (sale.total_profit / sale.total_amount) * 100 : 0;
          return sum + margin;
        }, 0) / previousSales.length 
      : 0;
    
    const revenueGrowth = previousRevenue > 0 ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 : 0;
    const netProfitGrowth = previousNetProfit !== 0 ? ((netProfit - previousNetProfit) / Math.abs(previousNetProfit)) * 100 : 0;
    const expenseGrowth = previousExpensesTotal > 0 ? ((totalExpenses - previousExpensesTotal) / previousExpensesTotal) * 100 : 0;

    return {
      totalRevenue,
      totalCost,
      totalExpenses,
      totalAmortization,
      totalProfit,
      netProfit,
      totalHours,
      avgMargin,
      avgSaleValue,
      eurosPerHour,
      revenueGrowth,
      netProfitGrowth,
      expenseGrowth,
      salesCount: filteredSales.length,
      expensesCount: filteredExpenses.length,
      profitMargin: totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0,
      netProfitMargin: totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0,
      expenseRevenueRatio: totalRevenue > 0 ? (totalExpenses / totalRevenue) * 100 : 0,
      // Datos del período anterior para tabla comparativa
      previous: {
        revenue: previousRevenue,
        cost: previousCost,
        expenses: previousExpensesTotal,
        amortization: previousAmortization,
        profit: previousProfit,
        netProfit: previousNetProfit,
        hours: previousHours,
        avgMargin: previousAvgMargin,
        salesCount: previousSales.length,
        expensesCount: previousExpenses.length
      }
    };
  }, [filteredSales, filteredExpenses, sales, expenses, periodDays]);

  const { formatCurrency, currencySymbol } = useFormatCurrency();

  // ─── Insights inteligentes ampliados ────────────────────────
  const insights = useMemo(() => {
    const result: Array<{
      type: string; title: string; description: string;
      icon: React.ElementType; color: string; bgColor: string;
    }> = [];
    
    // Margen bajo
    if (stats.avgMargin > 0 && stats.avgMargin < 20) {
      result.push({
        type: 'warning',
        title: 'Margen bajo detectado',
        description: `Tu margen promedio es ${stats.avgMargin.toFixed(1)}%, por debajo del 20% recomendado. Revisa tus precios de venta.`,
        icon: AlertCircle,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      });
    }
    
    // Baja rentabilidad por hora
    if (stats.eurosPerHour > 0 && stats.eurosPerHour < 5) {
      result.push({
        type: 'warning',
        title: 'Baja rentabilidad por hora',
        description: `Estás ganando ${formatCurrency(stats.eurosPerHour)}/h. Considera optimizar tiempos de impresión o subir precios.`,
        icon: TrendingDown,
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      });
    }

    // Beneficio neto negativo
    if (stats.netProfit < 0 && stats.salesCount > 0) {
      result.push({
        type: 'critical',
        title: 'Beneficio neto negativo',
        description: `Estás perdiendo ${formatCurrency(Math.abs(stats.netProfit))} en este período. Los gastos y costes superan los ingresos.`,
        icon: ShieldAlert,
        color: 'text-red-700',
        bgColor: 'bg-red-50'
      });
    }
    
    // Crecimiento de ingresos
    if (stats.revenueGrowth > 10) {
      result.push({
        type: 'success',
        title: 'Crecimiento excelente',
        description: `Tus ingresos han crecido un ${stats.revenueGrowth.toFixed(1)}% respecto al período anterior.`,
        icon: TrendingUp,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      });
    }

    // Caída de ingresos
    if (stats.revenueGrowth < -10) {
      result.push({
        type: 'warning',
        title: 'Caída de ingresos',
        description: `Tus ingresos han caído un ${Math.abs(stats.revenueGrowth).toFixed(1)}% respecto al período anterior.`,
        icon: TrendingDown,
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      });
    }

    // Gastos crecientes
    if (stats.expenseGrowth > 25) {
      result.push({
        type: 'warning',
        title: 'Gastos en aumento',
        description: `Tus gastos han crecido un ${stats.expenseGrowth.toFixed(1)}% respecto al período anterior. Revisa tus partidas.`,
        icon: Receipt,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      });
    }

    // Ratio gastos/ingresos alto
    if (stats.expenseRevenueRatio > 30 && stats.salesCount > 0) {
      result.push({
        type: 'warning',
        title: 'Ratio gastos/ingresos elevado',
        description: `Tus gastos representan el ${stats.expenseRevenueRatio.toFixed(1)}% de tus ingresos (>30%). Busca formas de reducir costes.`,
        icon: Percent,
        color: 'text-orange-600',
        bgColor: 'bg-orange-50'
      });
    }
    
    // Producto estrella
    if (projectDistribution.length > 0) {
      const topProject = projectDistribution[0];
      if (topProject.revenue > stats.totalRevenue * 0.5) {
        result.push({
          type: 'info',
          title: 'Alta dependencia de un producto',
          description: `"${topProject.name}" representa el ${((topProject.revenue / stats.totalRevenue) * 100).toFixed(0)}% de tus ingresos. Diversificar reduciría el riesgo.`,
          icon: Star,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        });
      } else if (topProject.revenue > stats.totalRevenue * 0.3) {
        result.push({
          type: 'info',
          title: 'Producto estrella',
          description: `"${topProject.name}" es tu producto más vendido con ${formatCurrency(topProject.revenue)} en ingresos.`,
          icon: Star,
          color: 'text-blue-600',
          bgColor: 'bg-blue-50'
        });
      }
    }

    // Proyectos con margen negativo
    const negativeMarginProjects = projectDistribution.filter(p => p.profit < 0);
    if (negativeMarginProjects.length > 0) {
      result.push({
        type: 'critical',
        title: `${negativeMarginProjects.length} proyecto(s) con pérdidas`,
        description: `${negativeMarginProjects.map(p => `"${p.name}"`).join(', ')} tienen margen negativo. Revisa sus precios o costes.`,
        icon: AlertCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-50'
      });
    }

    // Amortizaciones significativas
    if (stats.totalAmortization > 0 && stats.totalAmortization > stats.totalProfit * 0.1) {
      result.push({
        type: 'info',
        title: 'Amortizaciones significativas',
        description: `Las amortizaciones de impresoras (${formatCurrency(stats.totalAmortization)}) representan el ${((stats.totalAmortization / stats.totalProfit) * 100).toFixed(1)}% de tu beneficio bruto.`,
        icon: Printer,
        color: 'text-purple-600',
        bgColor: 'bg-purple-50'
      });
    }

    // Buen margen
    if (stats.avgMargin >= 40) {
      result.push({
        type: 'success',
        title: 'Márgenes saludables',
        description: `Tu margen promedio del ${stats.avgMargin.toFixed(1)}% es excelente. Sigue con esta estrategia de precios.`,
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-50'
      });
    }

    // Diversificación de clientes
    if (clientRevenueRanking.length > 0) {
      const topClient = clientRevenueRanking[0];
      if (topClient.revenue > stats.totalRevenue * 0.5 && clientRevenueRanking.length > 1) {
        result.push({
          type: 'warning',
          title: 'Dependencia de un cliente',
          description: `"${topClient.name}" supone el ${((topClient.revenue / stats.totalRevenue) * 100).toFixed(0)}% de tus ingresos. Diversificar clientes reduciría el riesgo.`,
          icon: Users,
          color: 'text-orange-600',
          bgColor: 'bg-orange-50'
        });
      }
    }

    // Sin ventas en el período
    if (stats.salesCount === 0 && filteredSales.length === 0) {
      result.push({
        type: 'info',
        title: 'Sin ventas en este período',
        description: 'No se han registrado ventas completadas en el rango seleccionado. Prueba con un rango más amplio.',
        icon: PackagePlus,
        color: 'text-slate-600',
        bgColor: 'bg-slate-50'
      });
    }
    
    return result;
  }, [stats, projectDistribution, clientRevenueRanking, filteredSales, formatCurrency, currencySymbol]);

  // ─── Recomendaciones dinámicas basadas en datos ─────────────
  const dynamicRecommendations = useMemo(() => {
    const recs: Array<{ title: string; description: string; priority: 'high' | 'medium' | 'low'; icon: React.ElementType }> = [];

    // Recomendaciones basadas en margen
    if (stats.avgMargin < 20 && stats.salesCount > 0) {
      recs.push({
        title: 'Revisar precios de venta',
        description: `Tu margen promedio (${stats.avgMargin.toFixed(1)}%) está por debajo del 20%. Incrementar precios un 10-15% podría añadir ${formatCurrency(stats.totalRevenue * 0.1)} a tus ingresos.`,
        priority: 'high',
        icon: DollarSign
      });
    }

    // Gastos excesivos por categoría
    const sortedCategories = [...expenseCategoryBreakdown].sort((a, b) => b.amount - a.amount);
    if (sortedCategories.length > 0) {
      const topCategory = sortedCategories[0];
      if (topCategory.amount > stats.totalExpenses * 0.4) {
        recs.push({
          title: `Optimizar gastos en ${topCategory.category}`,
          description: `"${topCategory.category}" supone el ${((topCategory.amount / stats.totalExpenses) * 100).toFixed(0)}% de tus gastos (${formatCurrency(topCategory.amount)}). Busca alternativas o negocia mejores precios.`,
          priority: 'high',
          icon: Receipt
        });
      }
    }

    // Eficiencia por hora
    if (stats.eurosPerHour < 5 && stats.totalHours > 0) {
      recs.push({
        title: 'Mejorar eficiencia de impresión',
        description: `Tu rentabilidad es de ${formatCurrency(stats.eurosPerHour)}/h. Optimiza velocidades de impresión o prioriza proyectos con mayor margen por hora.`,
        priority: 'high',
        icon: Clock
      });
    }

    // Diversificación de productos
    if (projectDistribution.length > 0 && projectDistribution[0].revenue > stats.totalRevenue * 0.5) {
      recs.push({
        title: 'Diversificar catálogo',
        description: `Un solo producto genera más del 50% de tus ingresos. Desarrollar más productos reduce el riesgo comercial.`,
        priority: 'medium',
        icon: PackagePlus
      });
    }

    // Diversificación de clientes
    if (clientRevenueRanking.length >= 1 && clientRevenueRanking[0].revenue > stats.totalRevenue * 0.5) {
      recs.push({
        title: 'Diversificar cartera de clientes',
        description: `Un solo cliente aporta más del 50% de facturación. Busca nuevos canales de venta o marketing para captar más clientes.`,
        priority: 'medium',
        icon: Users
      });
    }

    // Proyectos con pérdida
    const negativeProjects = projectDistribution.filter(p => p.profit < 0);
    if (negativeProjects.length > 0) {
      recs.push({
        title: 'Eliminar o ajustar productos no rentables',
        description: `${negativeProjects.length} proyecto(s) generan pérdidas: ${negativeProjects.map(p => `"${p.name}"`).join(', ')}. Sube su precio o deja de ofrecerlos.`,
        priority: 'high',
        icon: AlertCircle
      });
    }

    // Crecimiento positivo
    if (stats.revenueGrowth > 20) {
      recs.push({
        title: 'Capitalizar el crecimiento',
        description: `Tus ingresos crecen un ${stats.revenueGrowth.toFixed(0)}%. Considera invertir en capacidad (nueva impresora, materiales en bulk) para mantener el ritmo.`,
        priority: 'low',
        icon: TrendingUp
      });
    }

    // Ratio gastos/ingresos
    if (stats.expenseRevenueRatio > 30) {
      recs.push({
        title: 'Controlar ratio de gastos',
        description: `Tus gastos son el ${stats.expenseRevenueRatio.toFixed(0)}% de tus ingresos. Intenta mantenerlo por debajo del 20-25% para un negocio más saludable.`,
        priority: 'medium',
        icon: Percent
      });
    }

    // Si no hay recomendaciones específicas y hay datos
    if (recs.length === 0 && stats.salesCount > 0) {
      recs.push({
        title: 'Tu negocio va bien',
        description: 'No se detectan problemas críticos. Sigue monitorizando tus métricas para mantener el buen rendimiento.',
        priority: 'low',
        icon: CheckCircle
      });
    }

    return recs.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [stats, projectDistribution, clientRevenueRanking, expenseCategoryBreakdown, formatCurrency]);

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899', '#84cc16'];

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  // Utilidad para mensajes vacíos
  const EmptyChartMessage = ({ message }: { message: string }) => (
    <div className="flex items-center justify-center h-full text-slate-400 text-lg font-medium">
      {message}
    </div>
  );

  // Utilidad para calcular cambio porcentual con color
  const GrowthBadge = ({ value, suffix = '' }: { value: number; suffix?: string }) => {
    if (value === 0) return <span className="text-xs text-slate-400">—</span>;
    const isPositive = value > 0;
    return (
      <span className={`inline-flex items-center text-xs font-medium ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
        {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
        {Math.abs(value).toFixed(1)}%{suffix}
      </span>
    );
  };

  if (loading) {
    return <AdvancedStatisticsSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mb-6 shadow-lg">
          <BarChart3 className="w-10 h-10 text-slate-700" />
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-3">Estadísticas avanzadas</h1>
        <p className="text-lg text-slate-600 max-w-3xl mx-auto">
          Análisis profundo de rentabilidad, tendencias y oportunidades de optimización 
          para maximizar el rendimiento de tu negocio de impresión 3D.
        </p>
      </motion.div>

      {/* Controles */}
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
          { id: 'overview', label: 'Vista general', icon: BarChart3 },
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

      {/* KPIs Principales (con amortizaciones) */}
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
            <GrowthBadge value={stats.revenueGrowth} />
          </div>
          <div>
            <p className="text-blue-600 text-sm font-medium mb-1">Ingresos período</p>
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
            <GrowthBadge value={stats.netProfitGrowth} />
          </div>
          <div>
            <p className="text-green-600 text-sm font-medium mb-1">Beneficio neto</p>
            <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.netProfit)}</p>
            <p className="text-green-700 text-xs mt-2">
              {formatPercentage(stats.netProfitMargin)} margen neto
              {stats.totalAmortization > 0 && ` (incl. ${formatCurrency(stats.totalAmortization)} amort.)`}
            </p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-2xl p-6 border border-red-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <Receipt className="w-6 h-6 text-white" />
            </div>
            <GrowthBadge value={stats.expenseGrowth} />
          </div>
          <div>
            <p className="text-red-600 text-sm font-medium mb-1">Gastos período</p>
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
            <p className="text-orange-600 text-sm font-medium mb-1">Valor promedio venta</p>
            <p className="text-2xl font-bold text-orange-900">{formatCurrency(stats.avgSaleValue)}</p>
            <p className="text-orange-700 text-xs mt-2">
              {stats.salesCount} ventas
            </p>
          </div>
        </div>
      </motion.div>

      {/* ═══════════════════════ TAB: OVERVIEW ═══════════════════════ */}
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
                  <h3 className="text-lg font-semibold text-gray-900">Evolución temporal</h3>
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
                          if (name === 'netProfit') return [formatCurrency(value), 'Beneficio neto'];
                          if (name === 'expenses') return [formatCurrency(value), 'Gastos'];
                          return [formatCurrency(value), name === 'revenue' ? 'Ingresos' : name === 'profit' ? 'Beneficio bruto' : 'Coste'];
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
                          <Line type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} name="Beneficio bruto" />
                          <Line type="monotone" dataKey="netProfit" stroke="#059669" strokeWidth={3} name="Beneficio neto" />
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
                  <h3 className="text-lg font-semibold text-gray-900">Distribución de márgenes</h3>
                  <p className="text-sm text-gray-500">Análisis de rentabilidad por rangos</p>
                </div>
                <PieChartIcon className="w-5 h-5 text-gray-500" />
              </div>
              <div className="h-80">
                {marginDistribution.length === 0 ? (
                  <EmptyChartMessage message="No hay ventas en este período para analizar márgenes." />
                ) : (
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
                )}
              </div>
            </div>
          </div>

          {/* Gráfico de proyectos más rentables */}
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Pie chart de ingresos por proyecto */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Proporción de ingresos por proyecto</h3>
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
                  <h3 className="text-lg font-semibold text-gray-900">Top 10 proyectos detallados</h3>
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
                      <th className="py-2 pr-4">Margen</th>
                      <th className="py-2 pr-4">Uds.</th>
                      <th className="py-2 pr-4">Horas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {projectDistribution.map((project, idx) => {
                      const projectMargin = project.revenue > 0 ? (project.profit / project.revenue) * 100 : 0;
                      return (
                        <tr key={project.name} className={idx % 2 === 0 ? 'bg-slate-50' : ''}>
                          <td className="py-2 pr-4 font-medium text-slate-900">{project.name}</td>
                          <td className="py-2 pr-4">{formatCurrency(project.revenue)}</td>
                          <td className={`py-2 pr-4 ${project.profit >= 0 ? 'text-green-700' : 'text-red-600'}`}>{formatCurrency(project.profit)}</td>
                          <td className={`py-2 pr-4 ${projectMargin >= 20 ? 'text-green-700' : projectMargin >= 0 ? 'text-orange-600' : 'text-red-600'}`}>
                            {formatPercentage(projectMargin)}
                          </td>
                          <td className="py-2 pr-4">{project.sales}</td>
                          <td className="py-2 pr-4">{project.hours.toFixed(1)}h</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Breakdown de gastos por categoría */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100 mt-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Gastos por categoría</h3>
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

      {/* ═══════════════════ TAB: PERFORMANCE ═══════════════════ */}
      {activeTab === 'performance' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-8"
        >
          <div className="grid md:grid-cols-2 gap-6">
            {/* Métricas de rendimiento */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Métricas de rendimiento</h3>
                  <p className="text-sm text-gray-500">Indicadores clave de rentabilidad</p>
                </div>
                <Target className="w-5 h-5 text-gray-500" />
              </div>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Margen bruto promedio</span>
                  <span className="font-semibold text-gray-900">{formatPercentage(stats.avgMargin)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Margen neto</span>
                  <span className="font-semibold text-gray-900">{formatPercentage(stats.netProfitMargin)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">ROI sobre coste</span>
                  <span className="font-semibold text-gray-900">
                    {stats.totalCost > 0 ? formatPercentage((stats.totalProfit / stats.totalCost) * 100) : '—'}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Eficiencia ({currencySymbol}/h)</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(stats.eurosPerHour)}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Ventas por día</span>
                  <span className="font-semibold text-gray-900">
                    {(stats.salesCount / periodDays).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <span className="text-gray-600">Ratio gastos / ingresos</span>
                  <span className={`font-semibold ${stats.expenseRevenueRatio > 30 ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatPercentage(stats.expenseRevenueRatio)}
                  </span>
                </div>
                <div className="flex justify-between items-center py-3">
                  <span className="text-gray-600">Amortizaciones período</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(stats.totalAmortization)}</span>
                </div>
              </div>
            </div>

            {/* Top productos */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Productos estrella</h3>
                  <p className="text-sm text-gray-500">Top 5 productos más rentables</p>
                </div>
                <Award className="w-5 h-5 text-gray-500" />
              </div>
              <div className="space-y-3">
                {projectDistribution.length === 0 ? (
                  <EmptyChartMessage message="No hay datos de productos." />
                ) : (
                  projectDistribution.slice(0, 5).map((project, index) => (
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
                          <p className="text-sm text-gray-500">{project.sales} uds. vendidas</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-gray-900">{formatCurrency(project.revenue)}</p>
                        <p className={`text-sm ${project.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(project.profit)} beneficio
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Ranking de clientes por facturación */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Top clientes por facturación</h3>
                <p className="text-sm text-gray-500">Ranking de clientes que más ingresos generan</p>
              </div>
              <Users className="w-5 h-5 text-gray-500" />
            </div>
            {clientRevenueRanking.length === 0 ? (
              <EmptyChartMessage message="No hay datos de clientes para mostrar." />
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {clientRevenueRanking.map((client, index) => {
                  const clientMargin = client.revenue > 0 ? (client.profit / client.revenue) * 100 : 0;
                  const revenueShare = stats.totalRevenue > 0 ? (client.revenue / stats.totalRevenue) * 100 : 0;
                  return (
                    <div key={client.id} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-colors">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shrink-0 ${
                        index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-slate-500'
                      }`}>
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 truncate">{client.name}</p>
                        <p className="text-xs text-gray-500">{client.salesCount} ventas · {formatPercentage(revenueShare)} del total</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-semibold text-gray-900">{formatCurrency(client.revenue)}</p>
                        <p className={`text-xs ${clientMargin >= 20 ? 'text-green-600' : 'text-orange-600'}`}>
                          {formatPercentage(clientMargin)} margen
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Tabla comparativa de períodos */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Comparativa de períodos</h3>
                <p className="text-sm text-gray-500">Período actual vs. anterior ({timeRange === 'all' ? '365d' : timeRange})</p>
              </div>
              <Activity className="w-5 h-5 text-gray-500" />
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-slate-500 border-b">
                    <th className="py-2 pr-6 text-left">Métrica</th>
                    <th className="py-2 pr-6 text-right">Anterior</th>
                    <th className="py-2 pr-6 text-right">Actual</th>
                    <th className="py-2 text-right">Cambio</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { label: 'Ingresos', current: stats.totalRevenue, previous: stats.previous.revenue, format: 'currency' },
                    { label: 'Beneficio bruto', current: stats.totalProfit, previous: stats.previous.profit, format: 'currency' },
                    { label: 'Gastos', current: stats.totalExpenses, previous: stats.previous.expenses, format: 'currency', invertColor: true },
                    { label: 'Amortizaciones', current: stats.totalAmortization, previous: stats.previous.amortization, format: 'currency', invertColor: true },
                    { label: 'Beneficio neto', current: stats.netProfit, previous: stats.previous.netProfit, format: 'currency' },
                    { label: 'N.º Ventas', current: stats.salesCount, previous: stats.previous.salesCount, format: 'number' },
                    { label: 'Horas impr.', current: stats.totalHours, previous: stats.previous.hours, format: 'hours' },
                    { label: 'Margen prom.', current: stats.avgMargin, previous: stats.previous.avgMargin, format: 'percent' },
                  ].map((row, idx) => {
                    const change = row.previous > 0
                      ? ((row.current - row.previous) / row.previous) * 100
                      : row.current > 0 ? 100 : 0;
                    const isPositiveGood = !row.invertColor;
                    const changeColor = change === 0 ? 'text-slate-400' :
                      (change > 0 ? (isPositiveGood ? 'text-green-600' : 'text-red-600') : (isPositiveGood ? 'text-red-600' : 'text-green-600'));

                    const formatValue = (v: number) => {
                      if (row.format === 'currency') return formatCurrency(v);
                      if (row.format === 'percent') return formatPercentage(v);
                      if (row.format === 'hours') return `${v.toFixed(1)}h`;
                      return v.toString();
                    };

                    return (
                      <tr key={row.label} className={idx % 2 === 0 ? 'bg-slate-50' : ''}>
                        <td className="py-3 pr-6 font-medium text-slate-700">{row.label}</td>
                        <td className="py-3 pr-6 text-right text-slate-500">{formatValue(row.previous)}</td>
                        <td className="py-3 pr-6 text-right font-semibold text-slate-900">{formatValue(row.current)}</td>
                        <td className={`py-3 text-right font-medium ${changeColor}`}>
                          {change === 0 ? '—' : `${change > 0 ? '+' : ''}${change.toFixed(1)}%`}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* ═══════════════════ TAB: TRENDS ═══════════════════════ */}
      {activeTab === 'trends' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Análisis de tendencias diario */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Análisis de tendencias</h3>
                <p className="text-sm text-gray-500">Evolución diaria de métricas clave</p>
              </div>
              <TrendingUp className="w-5 h-5 text-gray-500" />
            </div>
            <div className="h-96">
              {timeSeriesData.length === 0 ? (
                <EmptyChartMessage message="No hay datos suficientes para mostrar tendencias." />
              ) : (
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
              )}
            </div>
          </div>

          {/* Vista mensual agregada */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Resumen mensual</h3>
                <p className="text-sm text-gray-500">Ingresos, beneficio neto y gastos agregados por mes</p>
              </div>
              <BarChart3 className="w-5 h-5 text-gray-500" />
            </div>
            <div className="h-80">
              {monthlyData.length === 0 ? (
                <EmptyChartMessage message="No hay datos mensuales para mostrar." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="monthFormatted" />
                    <YAxis />
                    <Tooltip
                      formatter={(value: any, name?: string) => [
                        formatCurrency(value),
                        name === 'revenue' ? 'Ingresos' : name === 'netProfit' ? 'Beneficio neto' : 'Gastos'
                      ]}
                    />
                    <Legend />
                    <Bar dataKey="revenue" fill="#3b82f6" name="Ingresos" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="netProfit" fill="#10b981" name="Beneficio neto" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="expenses" fill="#f59e0b" name="Gastos" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Ratio gastos / ingresos en el tiempo */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Ratio gastos / ingresos</h3>
                <p className="text-sm text-gray-500">Evolución mensual del % de gastos sobre ingresos</p>
              </div>
              <Percent className="w-5 h-5 text-gray-500" />
            </div>
            <div className="h-72">
              {expenseRevenueRatioData.length === 0 ? (
                <EmptyChartMessage message="No hay datos para mostrar el ratio gastos/ingresos." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={expenseRevenueRatioData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(v) => `${v.toFixed(0)}%`} />
                    <Tooltip formatter={(value: any) => [`${Number(value).toFixed(1)}%`, 'Ratio G/I']} />
                    <Legend />
                    <Area type="monotone" dataKey="ratio" fill="#f59e0b" stroke="#f59e0b" fillOpacity={0.3} name="Ratio Gastos/Ingresos %" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* Evolución de clientes */}
          <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Evolución de clientes</h3>
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

      {/* ═══════════════════ TAB: INSIGHTS ═══════════════════════ */}
      {activeTab === 'insights' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="space-y-6"
        >
          {/* Insights inteligentes */}
          {insights.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-100 text-center">
              <Lightbulb className="w-12 h-12 text-slate-300 mx-auto mb-4" />
              <p className="text-slate-500 text-lg">No hay insights para mostrar en este período. Registra más ventas y gastos para obtener análisis.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {insights.map((insight, index) => {
                const Icon = insight.icon;
                return (
                  <div key={index} className={`${insight.bgColor} rounded-2xl p-6 border border-gray-200`}>
                    <div className="flex items-start space-x-3">
                      <div className={`w-10 h-10 ${insight.bgColor} rounded-xl flex items-center justify-center shrink-0`}>
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
          )}

          {/* Recomendaciones dinámicas */}
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-6 border border-blue-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-blue-900">Recomendaciones</h3>
                <p className="text-sm text-blue-700">Acciones sugeridas basadas en tus datos reales</p>
              </div>
              <Lightbulb className="w-5 h-5 text-blue-600" />
            </div>
            {dynamicRecommendations.length === 0 ? (
              <div className="bg-white rounded-xl p-6 text-center">
                <p className="text-slate-500">Registra más datos para obtener recomendaciones personalizadas.</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {dynamicRecommendations.map((rec, idx) => {
                  const Icon = rec.icon;
                  return (
                    <div key={idx} className="bg-white rounded-xl p-4">
                      <div className="flex items-start space-x-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          rec.priority === 'high' ? 'bg-red-100' : rec.priority === 'medium' ? 'bg-orange-100' : 'bg-green-100'
                        }`}>
                          <Icon className={`w-4 h-4 ${
                            rec.priority === 'high' ? 'text-red-600' : rec.priority === 'medium' ? 'text-orange-600' : 'text-green-600'
                          }`} />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2 mb-1">
                            <h4 className="font-medium text-gray-900">{rec.title}</h4>
                            <span className={`text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded ${
                              rec.priority === 'high' ? 'bg-red-100 text-red-700' : 
                              rec.priority === 'medium' ? 'bg-orange-100 text-orange-700' : 
                              'bg-green-100 text-green-700'
                            }`}>
                              {rec.priority === 'high' ? 'Alta' : rec.priority === 'medium' ? 'Media' : 'Baja'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{rec.description}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
