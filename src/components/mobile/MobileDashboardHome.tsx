'use client'

import React, { useRef, useState } from 'react'
import { motion, useMotionValue, useTransform, animate, PanInfo } from 'framer-motion'
import { 
  TrendingUp, Calculator, FileText, Euro, Clock, Package, 
  Target, Zap, ArrowUpRight, DollarSign, Star, ChevronRight 
} from 'lucide-react'
import { useFormatCurrency } from '@/hooks/useFormatCurrency'
import type { DashboardStats } from '@/types'
import { useHaptics } from '@/hooks/useCapacitor'

interface MobileDashboardHomeProps {
  stats: DashboardStats
  onNavigate: (page: string) => void
}

export default function MobileDashboardHome({ stats, onNavigate }: MobileDashboardHomeProps) {
  const { formatCurrency, currencySymbol } = useFormatCurrency()
  const { triggerHaptic } = useHaptics()
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`
  
  // Carousel state
  const [currentMetricIndex, setCurrentMetricIndex] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)

  // Calculate metrics
  const avgRevenuePerProject = stats.totalProjects > 0 ? stats.totalRevenue / stats.totalProjects : 0
  const profitMargin = stats.totalRevenue > 0 ? (stats.totalProfit / stats.totalRevenue) * 100 : 0
  const efficiencyRatio = stats.totalPrintHours > 0 ? stats.totalRevenue / stats.totalPrintHours : 0

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

      {/* Performance Metrics Grid */}
      <div className="px-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Rendimiento</h2>
        <div className="grid grid-cols-2 gap-3">
          {performanceMetrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <motion.div
                key={metric.title}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 + index * 0.05 }}
                className={`${metric.bg} rounded-xl p-4 border border-slate-100`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={`w-4 h-4 ${metric.color}`} />
                  <span className="text-xs font-medium text-slate-600">{metric.title}</span>
                </div>
                <p className={`text-lg font-bold ${metric.color}`}>{metric.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{metric.subtitle}</p>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="px-4">
        <h2 className="text-lg font-semibold text-slate-900 mb-3">Acciones Rápidas</h2>
        <div className="space-y-3">
          {quickActions.map((action, index) => {
            const Icon = action.icon
            return (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.1 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => handleActionClick(action.id)}
                className={`w-full bg-gradient-to-r ${action.gradient} rounded-2xl p-4 text-white shadow-lg flex items-center justify-between`}
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <div className="text-left">
                    <p className="font-semibold">{action.title}</p>
                    <p className="text-xs text-white/80">{action.description}</p>
                  </div>
                </div>
                <ArrowUpRight className="w-5 h-5 text-white/80" />
              </motion.button>
            )
          })}
        </div>
      </div>

      {/* Summary Stats Row */}
      <div className="px-4">
        <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-2xl p-4 border border-slate-200">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">Resumen General</h3>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div>
              <p className="text-lg font-bold text-slate-900">{stats.totalProducts}</p>
              <p className="text-[10px] text-slate-500">Productos</p>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">{formatPercentage(stats.averageMargin)}</p>
              <p className="text-[10px] text-slate-500">Margen Prom.</p>
            </div>
            <div>
              <p className="text-lg font-bold text-slate-900">{formatCurrency(stats.averageEurosPerHour)}</p>
              <p className="text-[10px] text-slate-500">{currencySymbol}/hora</p>
            </div>
          </div>
        </div>
      </div>

      {/* More Options Button */}
      <div className="px-4 pb-safe-bottom">
        <button
          onClick={() => handleActionClick('kanban')}
          className="w-full bg-white border border-slate-200 rounded-2xl p-4 flex items-center justify-between shadow-sm active:bg-slate-50"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
              <Package className="w-5 h-5 text-purple-600" />
            </div>
            <div className="text-left">
              <p className="font-medium text-slate-900">Organización Kanban</p>
              <p className="text-xs text-slate-500">Gestiona visualmente tus proyectos</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400" />
        </button>
      </div>
    </div>
  )
}
