import React, { useState, useEffect, useMemo } from 'react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area
} from 'recharts';

import { 
  ArrowLeft, TrendingUp, Calendar, Target, DollarSign, Clock, 
  BarChart3, Activity, Filter, Receipt
} from 'lucide-react';
import { motion } from 'framer-motion';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTeam } from '@/components/providers/TeamProvider';
import { AdvancedStatisticsSkeleton } from '@/components/skeletons';

interface Sale {
  id: string;
  user_id: string;
  project_name: string;
  cost: number;
  unit_cost: number;
  quantity: number;
  sale_price: number;
  profit: number;
  margin: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  print_hours?: number;
  created_at: string;
  updated_at: string;
}

interface Expense {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: 'pending' | 'paid' | 'cancelled';
  notes?: string;
  created_at: string;
  updated_at: string;
}

interface AdvancedStatsProps {
  onBack: () => void;
}

export default function AdvancedStatistics({ onBack }: AdvancedStatsProps) {
  const [sales, setSales] = useState<Sale[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y' | 'all'>('30d');
  const [chartType, setChartType] = useState<'revenue' | 'profit' | 'margin' | 'expenses'>('revenue');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { currentTeam } = useTeam();
  const supabase = createClient();

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user, currentTeam]);

  const fetchData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Prepare queries based on team context
      let salesQuery = supabase
        .from('sales')
        .select('*')
        .order('created_at', { ascending: false });

      let expensesQuery = supabase
        .from('expenses')
        .select('*')
        .order('created_at', { ascending: false });

      // Apply team context filters
      if (currentTeam) {
        // Get team data
        salesQuery = salesQuery.eq('team_id', currentTeam.id);
        expensesQuery = expensesQuery.eq('team_id', currentTeam.id);
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
      acc[date].revenue += sale.sale_price;
      acc[date].cost += sale.cost;
      acc[date].profit += sale.profit;
      acc[date].sales += 1;
      acc[date].hours += sale.print_hours || 0;
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
    const projectStats = filteredSales.reduce((acc, sale) => {
      const name = sale.project_name;
      if (!acc[name]) {
        acc[name] = {
          name,
          revenue: 0,
          profit: 0,
          sales: 0,
          hours: 0
        };
      }
      acc[name].revenue += sale.sale_price;
      acc[name].profit += sale.profit;
      acc[name].sales += 1;
      acc[name].hours += sale.print_hours || 0;
      return acc;
    }, {} as Record<string, any>);

    return Object.values(projectStats)
      .sort((a: any, b: any) => b.revenue - a.revenue)
      .slice(0, 10); // Top 10 proyectos
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
      const range = ranges.find(r => sale.margin >= r.min && sale.margin < r.max);
      if (range) range.count++;
    });

    return ranges.filter(r => r.count > 0);
  }, [filteredSales]);

  // Estadísticas resumidas
  const stats = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, sale) => sum + sale.sale_price, 0);
    const totalCost = filteredSales.reduce((sum, sale) => sum + sale.cost, 0);
    const totalExpenses = filteredExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalProfit = totalRevenue - totalCost;
    const netProfit = totalProfit - totalExpenses;
    const totalHours = filteredSales.reduce((sum, sale) => sum + (sale.print_hours || 0), 0);
    const avgMargin = filteredSales.length > 0 
      ? filteredSales.reduce((sum, sale) => sum + sale.margin, 0) / filteredSales.length 
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

    const previousRevenue = previousSales.reduce((sum, sale) => sum + sale.sale_price, 0);
    const previousExpensesTotal = previousExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const previousProfit = previousSales.reduce((sum, sale) => sum + sale.profit, 0);
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

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  const formatCurrency = (value: number) => `€${value.toFixed(2)}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  if (loading) {
    return <AdvancedStatisticsSkeleton />;
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={onBack}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver a Contabilidad
          </button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Estadísticas Avanzadas</h1>
            <p className="text-gray-600">Análisis detallado de rentabilidad y tendencias</p>
          </div>
        </div>

        <div className="flex space-x-4">
          {/* Filtro de tiempo */}
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="7d">Últimos 7 días</option>
            <option value="30d">Últimos 30 días</option>
            <option value="90d">Últimos 90 días</option>
            <option value="1y">Último año</option>
            <option value="all">Todo el período</option>
          </select>

          {/* Filtro de métrica */}
          <select
            value={chartType}
            onChange={(e) => setChartType(e.target.value as any)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="revenue">Ingresos</option>
            <option value="profit">Beneficios</option>
            <option value="margin">Márgenes</option>
            <option value="expenses">Gastos</option>
          </select>
        </div>
      </div>

      {/* KPIs Resumidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Ingresos Período</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(stats.totalRevenue)}</p>
              <p className="text-blue-700 text-xs mt-1">
                {stats.revenueGrowth >= 0 ? '↗' : '↘'} {formatPercentage(Math.abs(stats.revenueGrowth))} vs anterior
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-blue-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">Beneficio Neto</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.netProfit)}</p>
              <p className="text-green-700 text-xs mt-1">
                {stats.netProfitGrowth >= 0 ? '↗' : '↘'} {formatPercentage(Math.abs(stats.netProfitGrowth))} vs anterior
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-green-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-red-600 text-sm font-medium">Gastos Período</p>
              <p className="text-2xl font-bold text-red-900">{formatCurrency(stats.totalExpenses)}</p>
              <p className="text-red-700 text-xs mt-1">
                {stats.expensesCount} gastos registrados
              </p>
            </div>
            <Receipt className="w-8 h-8 text-red-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">€/Hora Promedio</p>
              <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.eurosPerHour)}</p>
              <p className="text-purple-700 text-xs mt-1">
                {stats.totalHours.toFixed(1)}h totales
              </p>
            </div>
            <Clock className="w-8 h-8 text-purple-600" />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-600 text-sm font-medium">Valor Promedio Venta</p>
              <p className="text-2xl font-bold text-orange-900">{formatCurrency(stats.avgSaleValue)}</p>
              <p className="text-orange-700 text-xs mt-1">
                {stats.salesCount} ventas
              </p>
            </div>
            <Target className="w-8 h-8 text-orange-600" />
          </div>
        </motion.div>
      </div>

      {/* Gráficos principales */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Gráfico temporal */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Evolución Temporal</h3>
            <BarChart3 className="w-5 h-5 text-gray-500" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={timeSeriesData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dateFormatted" />
                <YAxis />
                <Tooltip 
                  formatter={(value: any, name: string) => {
                    if (name === 'margin') return [formatPercentage(value), 'Margen'];
                    if (name === 'eurosPerHour') return [formatCurrency(value), '€/Hora'];
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
          </div>
        </motion.div>

        {/* Gráfico de distribución de márgenes */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">Distribución de Márgenes</h3>
            <PieChart className="w-5 h-5 text-gray-500" />
          </div>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={marginDistribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, count }) => `${name}: ${count}`}
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
        </motion.div>
      </div>

      {/* Gráfico de proyectos más rentables */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="bg-white rounded-xl shadow-lg p-6 border border-gray-100"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Top 10 Proyectos por Ingresos</h3>
          <Activity className="w-5 h-5 text-gray-500" />
        </div>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={projectDistribution} layout="horizontal">
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" />
              <YAxis dataKey="name" type="category" width={100} />
              <Tooltip 
                formatter={(value: any, name: string) => [
                  name === 'revenue' ? formatCurrency(value) : value,
                  name === 'revenue' ? 'Ingresos' : name === 'profit' ? 'Beneficio' : name === 'sales' ? 'Ventas' : 'Horas'
                ]}
              />
              <Bar dataKey="revenue" fill="#3b82f6" name="Ingresos" />
              <Bar dataKey="profit" fill="#10b981" name="Beneficio" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Análisis detallado */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="grid md:grid-cols-2 gap-6"
      >
        {/* Métricas de rendimiento */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Métricas de Rendimiento</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Margen promedio</span>
              <span className="font-semibold text-gray-900">{formatPercentage(stats.avgMargin)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">ROI promedio</span>
              <span className="font-semibold text-gray-900">
                {stats.totalCost > 0 ? formatPercentage((stats.totalProfit / stats.totalCost) * 100) : '0%'}
              </span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Eficiencia (€/h)</span>
              <span className="font-semibold text-gray-900">{formatCurrency(stats.eurosPerHour)}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100">
              <span className="text-gray-600">Ventas por día</span>
              <span className="font-semibold text-gray-900">
                {timeRange !== 'all' ? 
                  (stats.salesCount / parseInt(timeRange.replace(/\D/g, ''))).toFixed(1) : 
                  (stats.salesCount / 365).toFixed(1)
                }
              </span>
            </div>
          </div>
        </div>

        {/* Top productos */}
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Productos Estrella</h3>
          <div className="space-y-3">
            {projectDistribution.slice(0, 5).map((project, index) => (
              <div key={project.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
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
    </div>
  );
}