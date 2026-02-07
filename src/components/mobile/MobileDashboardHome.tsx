'use client'

import React, { useRef, useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, Calculator, FileText, Euro, Clock, Package, 
  Target, Zap, ArrowUpRight, DollarSign, Star, ChevronRight, Receipt, Users
} from 'lucide-react'
import { useFormatCurrency } from '@/hooks/useFormatCurrency'
import { useAuth } from '@/components/providers/AuthProvider'
import { useTeam } from '@/components/providers/TeamProvider'
import { createClient } from '@/lib/supabase'
import { kanbanBoardService } from '@/services/kanbanBoardService'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import type { DashboardStats, Sale, Expense, KanbanCard } from '@/types'
import { useHaptics } from '@/hooks/useCapacitor'

interface MobileDashboardHomeProps {
  stats: DashboardStats
  onNavigate: (page: string) => void
}

export default function MobileDashboardHome({ stats, onNavigate }: MobileDashboardHomeProps) {
  const { formatCurrency, currencySymbol } = useFormatCurrency()
  const { triggerHaptic } = useHaptics()
  const { user } = useAuth()
  const { currentTeam, getEffectiveTeam } = useTeam()
  const supabase = createClient()
  const [sales, setSales] = useState<Sale[]>([])
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [kanbanCards, setKanbanCards] = useState<KanbanCard[]>([])
  const [loading, setLoading] = useState(true)
  
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`
  
  // Carousel state
  const [currentMetricIndex, setCurrentMetricIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Calculate metrics
  const avgRevenuePerProject = stats.totalProjects > 0 ? stats.totalRevenue / stats.totalProjects : 0
  const profitMargin = stats.totalRevenue > 0 ? (stats.totalProfit / stats.totalRevenue) * 100 : 0
  const efficiencyRatio = stats.totalPrintHours > 0 ? stats.totalRevenue / stats.totalPrintHours : 0

  // Obtener datos del mes actual
  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const effectiveTeam = getEffectiveTeam()
        
        // Obtener ventas del mes actual
        const now = new Date()
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)
        
        let salesQuery = supabase
          .from('sales')
          .select('*, items:sale_items(*)')
          .gte('date', startOfMonth.toISOString().split('T')[0])
          .lte('date', endOfMonth.toISOString().split('T')[0])
          .eq('status', 'completed')
          .order('date', { ascending: true })

        let expensesQuery = supabase
          .from('expenses')
          .select('*')
          .gte('date', startOfMonth.toISOString().split('T')[0])
          .lte('date', endOfMonth.toISOString().split('T')[0])
          .eq('status', 'paid')
          .order('date', { ascending: true })

        if (effectiveTeam) {
          salesQuery = salesQuery.eq('team_id', effectiveTeam.id)
          expensesQuery = expensesQuery.eq('team_id', effectiveTeam.id)
        } else {
          salesQuery = salesQuery.eq('user_id', user.id).is('team_id', null)
          expensesQuery = expensesQuery.eq('user_id', user.id).is('team_id', null)
        }

        const [salesResult, expensesResult] = await Promise.all([
          salesQuery,
          expensesQuery
        ])

        if (salesResult.data) setSales(salesResult.data)
        if (expensesResult.data) setExpenses(expensesResult.data)

        // Obtener tarjetas kanban que no estén completadas
        const kanbanData = await kanbanBoardService.getKanbanCards(
          user.id,
          effectiveTeam?.id
        )
        const activeCards = kanbanData.filter(card => card.status !== 'completed')
        setKanbanCards(activeCards)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [user, currentTeam, getEffectiveTeam])

  // Datos para gráfico de progresión de ventas del mes
  const salesChartData = useMemo(() => {
    const grouped = sales.reduce((acc, sale) => {
      const date = sale.date
      if (!acc[date]) {
        acc[date] = { date, revenue: 0, sales: 0 }
      }
      acc[date].revenue += sale.total_amount
      acc[date].sales += 1
      return acc
    }, {} as Record<string, { date: string; revenue: number; sales: number }>)

    // Generar todos los días del mes
    const now = new Date()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const chartData = []
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(now.getFullYear(), now.getMonth(), day)
      const dateStr = date.toISOString().split('T')[0]
      const dayData = grouped[dateStr] || { date: dateStr, revenue: 0, sales: 0 }
      
      // Calcular acumulado
      const previousDay = chartData.length > 0 ? chartData[chartData.length - 1].revenue : 0
      chartData.push({
        date: day.toString(),
        dateFormatted: date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        revenue: previousDay + dayData.revenue,
        dailyRevenue: dayData.revenue,
        sales: dayData.sales
      })
    }

    return chartData
  }, [sales])

  // Datos para gráfico de progresión de gastos del mes
  const expensesChartData = useMemo(() => {
    const grouped = expenses.reduce((acc, expense) => {
      const date = expense.date
      if (!acc[date]) {
        acc[date] = { date, amount: 0, count: 0 }
      }
      acc[date].amount += expense.amount
      acc[date].count += 1
      return acc
    }, {} as Record<string, { date: string; amount: number; count: number }>)

    // Generar todos los días del mes
    const now = new Date()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const chartData = []
    
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(now.getFullYear(), now.getMonth(), day)
      const dateStr = date.toISOString().split('T')[0]
      const dayData = grouped[dateStr] || { date: dateStr, amount: 0, count: 0 }
      
      // Calcular acumulado
      const previousDay = chartData.length > 0 ? chartData[chartData.length - 1].amount : 0
      chartData.push({
        date: day.toString(),
        dateFormatted: date.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
        amount: previousDay + dayData.amount,
        dailyAmount: dayData.amount,
        count: dayData.count
      })
    }

    return chartData
  }, [expenses])

  // Main KPIs for horizontal scroll
  const mainKPIs = [
    {
      title: 'Proyectos',
      value: stats.totalProjects.toString(),
      icon: FileText,
      gradient: 'from-blue-500 to-blue-600',
      iconBg: 'bg-blue-400/30',
    },
    {
      title: 'Ventas',
      value: stats.totalSales.toString(),
      icon: Euro,
      gradient: 'from-emerald-500 to-emerald-600',
      iconBg: 'bg-emerald-400/30',
    },
    {
      title: 'Ingresos',
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      gradient: 'from-purple-500 to-purple-600',
      iconBg: 'bg-purple-400/30',
    },
    {
      title: 'Horas',
      value: `${stats.totalPrintHours}h`,
      icon: Clock,
      gradient: 'from-orange-500 to-orange-600',
      iconBg: 'bg-orange-400/30',
    },
  ]

  // Performance metrics for second carousel
  const performanceMetrics = [
    {
      title: 'Eficiencia',
      value: formatCurrency(efficiencyRatio),
      subtitle: `${currencySymbol}/hora`,
      icon: Zap,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Margen',
      value: formatPercentage(profitMargin),
      subtitle: 'Beneficio',
      icon: Target,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Promedio',
      value: formatCurrency(avgRevenuePerProject),
      subtitle: 'Por proyecto',
      icon: Star,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
    },
    {
      title: 'Beneficio',
      value: formatCurrency(stats.netProfit),
      subtitle: 'Neto',
      icon: TrendingUp,
      color: 'text-green-600',
      bg: 'bg-green-50',
    },
  ]

  // Quick actions
  const quickActions = [
    {
      id: 'calculator',
      title: 'Nuevo Proyecto',
      description: 'Calcular costes',
      icon: Calculator,
      gradient: 'from-blue-500 to-blue-600',
    },
    {
      id: 'accounting',
      title: 'Contabilidad',
      description: 'Ventas y gastos',
      icon: Euro,
      gradient: 'from-emerald-500 to-emerald-600',
    },
    {
      id: 'projects',
      title: 'Proyectos',
      description: 'Ver historial',
      icon: FileText,
      gradient: 'from-purple-500 to-purple-600',
    },
  ]

  const handleActionClick = (actionId: string) => {
    triggerHaptic('light')
    onNavigate(actionId)
  }

  const handleMetricChange = (index: number) => {
    setCurrentMetricIndex(index)
    triggerHaptic('selection')
  }

  return (
    <div className="space-y-6 pb-4">
      {/* Welcome Section */}
      <div className="text-center pt-2">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-200 rounded-2xl mb-3 shadow-lg"
        >
          <img src="/logo.svg" alt="Logo" className="w-20 h-20 object-contain" />
        </motion.div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-500 mt-1">Resumen de tu actividad</p>
      </div>

      {/* KPIs Horizontal Scroll */}
      <div className="relative">
        <div 
          ref={carouselRef}
          className="flex gap-3 overflow-x-auto px-4 pb-2 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {mainKPIs.map((kpi, index) => {
            const Icon = kpi.icon
            return (
              <motion.div
                key={kpi.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`flex-shrink-0 w-[140px] snap-center bg-gradient-to-br ${kpi.gradient} rounded-2xl p-4 text-white shadow-lg`}
              >
                <div className={`w-10 h-10 ${kpi.iconBg} rounded-xl flex items-center justify-center mb-3`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-white/80 text-xs font-medium">{kpi.title}</p>
                <p className="text-xl font-bold mt-1">{kpi.value}</p>
              </motion.div>
            )
          })}
        </div>
        
        {/* Scroll indicator dots */}
        <div className="flex justify-center gap-1.5 mt-3">
          {mainKPIs.map((_, index) => (
            <div
              key={index}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                index === currentMetricIndex ? 'w-4 bg-slate-600' : 'w-1.5 bg-slate-300'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Sección: Cómo va tu negocio */}
      <div className="px-4 space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Cómo va tu negocio</h2>
        
        {/* Gráficos apilados verticalmente para móvil */}
        <div className="space-y-3">
          {/* Gráfico de Progresión de Ventas */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Progresión de ventas</h3>
              <TrendingUp className="w-4 h-4 text-emerald-600" />
            </div>
            <div className="h-48">
              {salesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={salesChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 9 }}
                      interval="auto"
                    />
                    <YAxis 
                      tick={{ fontSize: 9 }}
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
                <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                  No hay datos de ventas este mes
                </div>
              )}
            </div>
          </div>

          {/* Gráfico de Progresión de Gastos */}
          <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-slate-900">Progresión de gastos</h3>
              <Receipt className="w-4 h-4 text-red-600" />
            </div>
            <div className="h-48">
              {expensesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsLineChart data={expensesChartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 9 }}
                      interval="auto"
                    />
                    <YAxis 
                      tick={{ fontSize: 9 }}
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
                <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                  No hay datos de gastos este mes
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Paneles de Resumen */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-500">Eficiencia</p>
                <p className="text-base font-bold text-slate-900">{formatCurrency(efficiencyRatio)}</p>
              </div>
              <p className="text-xs text-slate-400">{currencySymbol}/h</p>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-500">Beneficio</p>
                <p className="text-base font-bold text-slate-900">{formatCurrency(stats.totalProfit)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-indigo-100 rounded-lg flex items-center justify-center">
                <Users className="w-4 h-4 text-indigo-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-500">Margen</p>
                <p className="text-base font-bold text-slate-900">{formatPercentage(stats.averageMargin)}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl p-3 border border-slate-200 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-purple-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-slate-500">Neto</p>
                <p className="text-base font-bold text-slate-900">{formatCurrency(stats.netProfit)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Sección: Qué queda por hacer */}
      <div className="px-4 space-y-3">
        <h2 className="text-lg font-semibold text-slate-900">Qué queda por hacer</h2>
        
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm max-h-64 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-slate-400 text-sm">Cargando proyectos...</div>
            </div>
          ) : kanbanCards.length === 0 ? (
            <div className="flex items-center justify-center py-8">
              <div className="text-center">
                <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <p className="text-slate-400 text-sm">No hay proyectos pendientes</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {kanbanCards.map((card) => {
                const statusColors = {
                  pending: 'bg-orange-50 text-orange-700 border-orange-200',
                  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
                }
                const statusLabels = {
                  pending: 'Pendiente',
                  in_progress: 'En desarrollo',
                }
                return (
                  <div
                    key={card.id}
                    className="bg-slate-50 rounded-lg p-3 border border-slate-200 active:bg-slate-100 transition-colors"
                    onClick={() => {
                      triggerHaptic('light')
                      onNavigate('kanban')
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900 mb-1 truncate">
                          {card.project?.name || 'Proyecto sin nombre'}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full border ${statusColors[card.status]}`}>
                            {statusLabels[card.status]}
                          </span>
                          {card.project?.profit_margin && (
                            <span className="text-xs text-slate-500">
                              {formatPercentage(card.project.profit_margin)}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-slate-400 flex-shrink-0 ml-2" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
