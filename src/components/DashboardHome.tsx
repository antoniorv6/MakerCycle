'use client'

import React from 'react';
import { 
  TrendingUp, Calculator, FileText, Euro, Clock, Package, Users, Activity,
  Target, BarChart3, Zap, Calendar, ArrowUpRight, ArrowDownRight, 
  DollarSign, PieChart, LineChart, Award, Star, TrendingDown
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import type { DashboardStats } from '@/types';
import TeamContextBanner from './TeamContextBanner';

interface DashboardHomeProps {
  stats: DashboardStats;
  onNavigate: (page: string) => void;
}

export default function DashboardHome({ stats, onNavigate }: DashboardHomeProps) {
  const { formatCurrency, currencySymbol } = useFormatCurrency();
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  // Calcular métricas adicionales
  const avgRevenuePerProject = stats.totalProjects > 0 ? stats.totalRevenue / stats.totalProjects : 0;
  const avgProfitPerSale = stats.totalSales > 0 ? stats.totalProfit / stats.totalSales : 0;
  const efficiencyRatio = stats.totalPrintHours > 0 ? stats.totalRevenue / stats.totalPrintHours : 0;
  const profitMargin = stats.totalRevenue > 0 ? (stats.totalProfit / stats.totalRevenue) * 100 : 0;
  const netProfitMargin = stats.totalRevenue > 0 ? (stats.netProfit / stats.totalRevenue) * 100 : 0;

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
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Team Context Banner */}
      <TeamContextBanner />
      
      {/* Header Mejorado */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <img src="/logo.svg" alt="Logo MakerCycle" className="w-64 h-auto mx-auto mb-6 object-contain" />
        <h1 className="text-4xl font-bold text-dark-900 mb-3 font-display">Dashboard</h1>
        <p className="text-lg text-dark-500 max-w-2xl mx-auto">
          Resumen completo de tu actividad de impresión 3D. Analiza tu rendimiento, 
          optimiza tus procesos y maximiza tu rentabilidad.
        </p>
      </motion.div>

      {/* KPIs Principales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl p-6 border border-brand-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-brand-gradient rounded-xl flex items-center justify-center shadow-md">
              <FileText className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-brand-600 mb-1">Proyectos Totales</p>
            <p className="text-3xl font-bold text-brand-900">{stats.totalProjects}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-success-50 to-success-100 rounded-2xl p-6 border border-success-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-success-500 rounded-xl flex items-center justify-center shadow-md">
              <Euro className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-success-600 mb-1">Ventas Totales</p>
            <p className="text-3xl font-bold text-success-900">{stats.totalSales}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-6 border border-purple-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-purple-500 rounded-xl flex items-center justify-center shadow-md">
              <DollarSign className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-purple-600 mb-1">Ingresos Totales</p>
            <p className="text-3xl font-bold text-purple-900">{formatCurrency(stats.totalRevenue)}</p>
          </div>
        </div>

        <div className="bg-gradient-to-br from-coral-50 to-coral-100 rounded-2xl p-6 border border-coral-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
          <div className="flex items-center justify-between mb-4">
            <div className="w-12 h-12 bg-coral-500 rounded-xl flex items-center justify-center shadow-md">
              <Clock className="w-6 h-6 text-white" />
            </div>
          </div>
          <div>
            <p className="text-sm font-medium text-coral-600 mb-1">Horas de Impresión</p>
            <p className="text-3xl font-bold text-coral-900">{stats.totalPrintHours}h</p>
          </div>
        </div>
      </motion.div>

      {/* Métricas de Rendimiento */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        {performanceMetrics.map((metric, index) => {
          const Icon = metric.icon;
          return (
            <div key={metric.title} className="bg-white rounded-2xl p-6 border border-cream-200 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-br ${metric.color} rounded-xl flex items-center justify-center shadow-md`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                {metric.trend && (
                  <div className="flex items-center space-x-1">
                    {metric.trendUp ? (
                      <ArrowUpRight className="w-4 h-4 text-success-600" />
                    ) : (
                      <ArrowDownRight className="w-4 h-4 text-error-600" />
                    )}
                    <span className={`text-xs font-medium ${metric.trendUp ? 'text-success-600' : 'text-error-600'}`}>
                      {metric.trend}
                    </span>
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm font-medium text-dark-500 mb-1">{metric.title}</p>
                <p className="text-2xl font-bold text-dark-900">{metric.value}</p>
                <p className="text-xs text-dark-400 mt-2">{metric.subtitle}</p>
              </div>
            </div>
          );
        })}
      </motion.div>

      {/* Estadísticas Adicionales */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="bg-white rounded-2xl p-6 border border-cream-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-warning-100 rounded-xl flex items-center justify-center">
              <Package className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-dark-500">Productos Vendidos</p>
              <p className="text-2xl font-bold text-dark-900">{stats.totalProducts}</p>
              <p className="text-xs text-dark-400">Unidades totales</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-cream-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-success-100 rounded-xl flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-dark-500">Beneficio Total</p>
              <p className="text-2xl font-bold text-dark-900">{formatCurrency(stats.totalProfit)}</p>
              <p className="text-xs text-dark-400">Bruto</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-cream-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center">
              <Users className="w-6 h-6 text-brand-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-dark-500">Margen Promedio</p>
              <p className="text-2xl font-bold text-dark-900">{formatPercentage(stats.averageMargin)}</p>
              <p className="text-xs text-dark-400">Por venta</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-cream-200 shadow-sm hover:shadow-md transition-all duration-300">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
              <Star className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-dark-500">Beneficio Neto</p>
              <p className="text-2xl font-bold text-dark-900">{formatCurrency(stats.netProfit)}</p>
              <p className="text-xs text-dark-400">Después de gastos</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Acciones Rápidas Mejoradas */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-6"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-dark-900 font-display">Acciones Rápidas</h2>
          <div className="flex items-center space-x-2 text-sm text-dark-500">
            <Calendar className="w-4 h-4" />
            <span>Acceso directo a funciones principales</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                onClick={action.onClick}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`bg-gradient-to-br ${action.color} text-white rounded-2xl p-8 text-left transition-all duration-300 shadow-lg hover:shadow-xl group`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className="w-7 h-7 text-white" />
                  </div>
                  <ArrowUpRight className="w-5 h-5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>
                <h3 className="text-xl font-bold mb-2">{action.title}</h3>
                <p className="text-sm opacity-90 leading-relaxed">{action.description}</p>
              </motion.button>
            );
          })}
        </div>
      </motion.div>

      {/* Resumen de Rendimiento */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-gradient-to-br from-cream-50 to-cream-100 rounded-2xl p-8 border border-cream-200"
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-dark-900 mb-2 font-display">Resumen de Rendimiento</h3>
            <p className="text-dark-500">Métricas clave para optimizar tu negocio</p>
          </div>
          <div className="flex items-center space-x-2">
            <BarChart3 className="w-5 h-5 text-brand-500" />
            <span className="text-sm text-dark-500">Análisis</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="text-center p-4 bg-white/60 rounded-xl">
            <p className="text-2xl font-bold text-dark-900">{formatCurrency(avgProfitPerSale)}</p>
            <p className="text-sm text-dark-500">Beneficio promedio por venta</p>
          </div>
          <div className="text-center p-4 bg-white/60 rounded-xl">
            <p className="text-2xl font-bold text-dark-900">{formatPercentage(netProfitMargin)}</p>
            <p className="text-sm text-dark-500">Margen neto</p>
          </div>
          <div className="text-center p-4 bg-white/60 rounded-xl">
            <p className="text-2xl font-bold text-dark-900">{formatCurrency(stats.averageEurosPerHour)}</p>
            <p className="text-sm text-dark-500">{currencySymbol}/hora promedio</p>
          </div>
          <div className="text-center p-4 bg-white/60 rounded-xl">
            <p className="text-2xl font-bold text-dark-900">{stats.totalExpenses}</p>
            <p className="text-sm text-dark-500">Gastos registrados</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
