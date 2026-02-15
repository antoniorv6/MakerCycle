'use client'

import React, { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import {
  TrendingUp, Calculator, FileText, Euro, Clock,
  Zap, Target, Star, ChevronRight, Receipt, FolderOpen,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import { useFormatCurrency } from '@/hooks/useFormatCurrency'
import { useAuth } from '@/components/providers/AuthProvider'
import { useTeam } from '@/components/providers/TeamProvider'
import { createClient } from '@/lib/supabase'
import { kanbanBoardService } from '@/services/kanbanBoardService'
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, Area, AreaChart } from 'recharts'
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
  const [chartMode, setChartMode] = useState<'ventas' | 'gastos'>('ventas')

  const formatPercentage = (value: number) => `${value.toFixed(1)}%`

  // Calculate metrics
  const efficiencyRatio = stats.totalPrintHours > 0 ? stats.totalRevenue / stats.totalPrintHours : 0

  // Fetch current month data
  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      try {
        setLoading(true)
        const effectiveTeam = getEffectiveTeam()

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

  // Chart data for sales progression
  const salesChartData = useMemo(() => {
    const grouped = sales.reduce((acc, sale) => {
      const date = sale.date
      if (!acc[date]) acc[date] = { date, revenue: 0 }
      acc[date].revenue += sale.total_amount
      return acc
    }, {} as Record<string, { date: string; revenue: number }>)

    const now = new Date()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const chartData = []

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(now.getFullYear(), now.getMonth(), day)
      const dateStr = date.toISOString().split('T')[0]
      const dayData = grouped[dateStr] || { revenue: 0 }
      const previousDay: number = chartData.length > 0 ? chartData[chartData.length - 1].revenue : 0
      chartData.push({
        date: day.toString(),
        revenue: previousDay + dayData.revenue,
      })
    }
    return chartData
  }, [sales])

  // Chart data for expenses progression
  const expensesChartData = useMemo(() => {
    const grouped = expenses.reduce((acc, expense) => {
      const date = expense.date
      if (!acc[date]) acc[date] = { date, amount: 0 }
      acc[date].amount += expense.amount
      return acc
    }, {} as Record<string, { date: string; amount: number }>)

    const now = new Date()
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const chartData = []

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(now.getFullYear(), now.getMonth(), day)
      const dateStr = date.toISOString().split('T')[0]
      const dayData = grouped[dateStr] || { amount: 0 }
      const previousDay: number = chartData.length > 0 ? chartData[chartData.length - 1].amount : 0
      chartData.push({
        date: day.toString(),
        amount: previousDay + dayData.amount,
      })
    }
    return chartData
  }, [expenses])

  // Recent activity: combine last sales and expenses
  const recentActivity = useMemo(() => {
    const salesItems = sales.slice(-5).map(s => ({
      id: s.id,
      type: 'sale' as const,
      description: s.items?.[0]?.project_name || 'Venta',
      amount: s.total_amount,
      date: s.date,
    }))
    const expenseItems = expenses.slice(-5).map(e => ({
      id: e.id,
      type: 'expense' as const,
      description: e.description,
      amount: e.amount,
      date: e.date,
    }))
    return [...salesItems, ...expenseItems]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5)
  }, [sales, expenses])

  // KPIs
  const kpis = [
    { title: 'Proyectos', value: stats.totalProjects.toString(), icon: FileText, gradient: 'from-blue-500 to-blue-600', iconBg: 'bg-blue-400/30' },
    { title: 'Ventas', value: stats.totalSales.toString(), icon: Euro, gradient: 'from-emerald-500 to-emerald-600', iconBg: 'bg-emerald-400/30' },
    { title: 'Ingresos', value: formatCurrency(stats.totalRevenue), icon: TrendingUp, gradient: 'from-purple-500 to-purple-600', iconBg: 'bg-purple-400/30' },
    { title: 'Horas', value: `${stats.totalPrintHours}h`, icon: Clock, gradient: 'from-orange-500 to-orange-600', iconBg: 'bg-orange-400/30' },
  ]

  const quickActions = [
    { id: 'calculator', title: 'Nuevo Proyecto', icon: Calculator, gradient: 'from-blue-500 to-blue-600' },
    { id: 'accounting', title: 'Contabilidad', icon: Euro, gradient: 'from-emerald-500 to-emerald-600' },
    { id: 'projects', title: 'Proyectos', icon: FolderOpen, gradient: 'from-purple-500 to-purple-600' },
  ]

  const handleActionClick = (actionId: string) => {
    triggerHaptic('light')
    onNavigate(actionId)
  }

  const firstName = user?.user_metadata?.full_name?.split(' ')[0] || 'Usuario'
  const todayFormatted = new Date().toLocaleDateString('es-ES', { day: 'numeric', month: 'short', year: 'numeric' })

  // Skeleton loading state
  if (loading) {
    return (
      <div className="space-y-5 pb-4">
        {/* Greeting skeleton */}
        <div className="px-4 pt-1">
          <div className="h-6 w-36 skeleton-shimmer-brand mb-2" />
          <div className="h-4 w-24 skeleton-shimmer-brand" />
        </div>
        {/* KPI grid skeleton */}
        <div className="grid grid-cols-2 gap-2.5 px-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-20 rounded-xl skeleton-shimmer-brand" />
          ))}
        </div>
        {/* Quick actions skeleton */}
        <div className="flex gap-2 px-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex-1 h-11 rounded-xl skeleton-shimmer-brand" />
          ))}
        </div>
        {/* Chart skeleton */}
        <div className="px-4">
          <div className="h-52 rounded-xl skeleton-shimmer-brand" />
        </div>
        {/* Metrics skeleton */}
        <div className="grid grid-cols-2 gap-2.5 px-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-14 rounded-xl skeleton-shimmer-brand" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-5 pb-4">
      {/* Compact Greeting */}
      <div className="flex items-center justify-between px-4 pt-1">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Hola, {firstName}</h1>
          <p className="text-xs text-slate-500">{todayFormatted}</p>
        </div>
      </div>

      {/* KPI Grid 2x2 */}
      <div className="grid grid-cols-2 gap-2.5 px-4">
        {kpis.map((kpi, index) => {
          const Icon = kpi.icon
          return (
            <motion.div
              key={kpi.title}
              layout={false}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.07 }}
              className={`bg-gradient-to-br ${kpi.gradient} rounded-xl p-3 text-white shadow-elevation-2`}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <div className={`w-7 h-7 ${kpi.iconBg} rounded-lg flex items-center justify-center`}>
                  <Icon className="w-3.5 h-3.5 text-white" />
                </div>
                <p className="text-white/80 text-xs font-medium">{kpi.title}</p>
              </div>
              <p className="text-lg font-bold">{kpi.value}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 px-4">
        {quickActions.map((action) => {
          const Icon = action.icon
          return (
            <button
              key={action.id}
              onClick={() => handleActionClick(action.id)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-3 min-h-touch bg-gradient-to-r ${action.gradient} rounded-xl text-white text-xs font-medium shadow-sm active:scale-[0.97] transition-transform md-ripple`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{action.title}</span>
            </button>
          )
        })}
      </div>

      {/* Single Chart with Toggle */}
      <div className="px-4">
        <div className="bg-white rounded-xl p-4 border border-slate-200 shadow-elevation-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-slate-900">Este mes</h3>
            <div className="flex bg-slate-100 rounded-lg p-1" role="tablist" aria-label="Tipo de gráfico">
              <button
                onClick={() => { setChartMode('ventas'); triggerHaptic('selection') }}
                className={`px-4 py-2 rounded-md text-xs font-medium transition-all md-ripple ${
                  chartMode === 'ventas' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                }`}
                role="tab"
                aria-selected={chartMode === 'ventas'}
              >
                Ventas
              </button>
              <button
                onClick={() => { setChartMode('gastos'); triggerHaptic('selection') }}
                className={`px-4 py-2 rounded-md text-xs font-medium transition-all md-ripple ${
                  chartMode === 'gastos' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'
                }`}
                role="tab"
                aria-selected={chartMode === 'gastos'}
              >
                Gastos
              </button>
            </div>
          </div>
          <div className="h-36">
            {chartMode === 'ventas' ? (
              salesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesChartData}>
                    <defs>
                      <linearGradient id="salesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatCurrency(v)} width={55} />
                    <Tooltip formatter={(value: number | undefined) => [formatCurrency(value ?? 0), 'Acumulado']} labelFormatter={(l) => `Día ${l}`} />
                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#salesGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm">No hay ventas este mes</div>
              )
            ) : (
              expensesChartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={expensesChartData}>
                    <defs>
                      <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} interval="preserveStartEnd" />
                    <YAxis tick={{ fontSize: 10 }} tickFormatter={(v) => formatCurrency(v)} width={55} />
                    <Tooltip formatter={(value: number | undefined) => [formatCurrency(value ?? 0), 'Acumulado']} labelFormatter={(l) => `Día ${l}`} />
                    <Area type="monotone" dataKey="amount" stroke="#ef4444" strokeWidth={2} fill="url(#expensesGradient)" />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex items-center justify-center h-full text-slate-400 text-sm">No hay gastos este mes</div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Performance Metrics 2x2 */}
      <div className="grid grid-cols-2 gap-2.5 px-4">
        <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-amber-100 rounded-lg flex items-center justify-center">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-slate-500">Eficiencia</p>
              <p className="text-sm font-bold text-slate-900 truncate">{formatCurrency(efficiencyRatio)}<span className="text-[11px] font-normal text-slate-400">/{currencySymbol}h</span></p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-slate-500">Beneficio</p>
              <p className="text-sm font-bold text-slate-900 truncate">{formatCurrency(stats.totalProfit)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Target className="w-3.5 h-3.5 text-indigo-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-slate-500">Margen</p>
              <p className="text-sm font-bold text-slate-900">{formatPercentage(stats.averageMargin)}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-2.5 border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-purple-100 rounded-lg flex items-center justify-center">
              <Star className="w-3.5 h-3.5 text-purple-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[11px] font-medium text-slate-500">Neto</p>
              <p className={`text-sm font-bold truncate ${stats.netProfit >= 0 ? 'text-slate-900' : 'text-red-600'}`}>{formatCurrency(stats.netProfit)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      {recentActivity.length > 0 && (
        <div className="px-4 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Actividad reciente</h2>
            <button
              onClick={() => handleActionClick('accounting')}
              className="text-xs text-slate-500 flex items-center gap-1"
            >
              Ver todo
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm divide-y divide-slate-100">
            {recentActivity.map((item) => (
              <div key={item.id} className="flex items-center justify-between px-3 py-2.5">
                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                  <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                    item.type === 'sale' ? 'bg-emerald-100' : 'bg-red-100'
                  }`}>
                    {item.type === 'sale'
                      ? <ArrowUpRight className="w-3.5 h-3.5 text-emerald-600" />
                      : <ArrowDownRight className="w-3.5 h-3.5 text-red-600" />
                    }
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{item.description}</p>
                    <p className="text-[11px] text-slate-400">{new Date(item.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}</p>
                  </div>
                </div>
                <p className={`text-sm font-semibold ml-2 ${item.type === 'sale' ? 'text-emerald-600' : 'text-red-600'}`}>
                  {item.type === 'sale' ? '+' : '-'}{formatCurrency(item.amount)}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Kanban Todos - Compact */}
      <div className="px-4 space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">Por hacer</h2>
          <button
            onClick={() => handleActionClick('kanban')}
            className="text-xs text-slate-500 flex items-center gap-1"
          >
            Kanban
            <ChevronRight className="w-3 h-3" />
          </button>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm max-h-48 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-6">
              <div className="text-slate-400 text-sm">Cargando...</div>
            </div>
          ) : kanbanCards.length === 0 ? (
            <div className="flex items-center justify-center py-6">
              <div className="text-center">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-1.5" />
                <p className="text-slate-400 text-xs">No hay proyectos pendientes</p>
              </div>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {kanbanCards.slice(0, 4).map((card) => {
                const statusColors: Record<string, string> = {
                  pending: 'bg-orange-50 text-orange-700 border-orange-200',
                  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
                }
                const statusLabels: Record<string, string> = {
                  pending: 'Pendiente',
                  in_progress: 'En desarrollo',
                }
                return (
                  <div
                    key={card.id}
                    className="flex items-center justify-between px-3 py-2.5 active:bg-slate-50 transition-colors"
                    onClick={() => { triggerHaptic('light'); onNavigate('kanban') }}
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {card.project?.name || 'Proyecto sin nombre'}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-2">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border ${statusColors[card.status] || ''}`}>
                        {statusLabels[card.status] || card.status}
                      </span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                    </div>
                  </div>
                )
              })}
              {kanbanCards.length > 4 && (
                <div className="text-center py-2">
                  <span className="text-xs text-slate-400">+{kanbanCards.length - 4} más</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
