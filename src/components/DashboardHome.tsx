'use client'

import React from 'react'
import { 
  TrendingUp, 
  Calculator, 
  FileText, 
  Euro, 
  Clock, 
  BarChart3, 
  Plus, 
  ArrowRight,
  Calendar,
  Target,
  Activity,
  Users,
  Package,
  Zap
} from 'lucide-react'
import { motion } from 'framer-motion'
import { useDashboardData } from '@/hooks/useDashboardData'
import { DashboardSkeleton } from '@/components/skeletons'

export default function DashboardHome() {
  const { projects, sales, stats, loading } = useDashboardData()

  const formatCurrency = (value: number) => `€${value.toFixed(2)}`
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-full mb-4">
          <Activity className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
        <p className="text-gray-600">Bienvenido a tu centro de control de impresión 3D</p>
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <button className="flex items-center justify-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200 hover:from-blue-100 hover:to-blue-200 transition-all duration-200 group">
          <Calculator className="w-8 h-8 text-blue-600 mr-3 group-hover:scale-110 transition-transform duration-200" />
          <div className="text-left">
            <h3 className="font-semibold text-blue-900">Nuevo Proyecto</h3>
            <p className="text-sm text-blue-700">Calcular costes</p>
          </div>
        </button>

        <button className="flex items-center justify-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200 hover:from-green-100 hover:to-green-200 transition-all duration-200 group">
          <FileText className="w-8 h-8 text-green-600 mr-3 group-hover:scale-110 transition-transform duration-200" />
          <div className="text-left">
            <h3 className="font-semibold text-green-900">Gestionar Proyectos</h3>
            <p className="text-sm text-green-700">Ver y editar</p>
          </div>
        </button>

        <button className="flex items-center justify-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200 hover:from-purple-100 hover:to-purple-200 transition-all duration-200 group">
          <TrendingUp className="w-8 h-8 text-purple-600 mr-3 group-hover:scale-110 transition-transform duration-200" />
          <div className="text-left">
            <h3 className="font-semibold text-purple-900">Contabilidad</h3>
            <p className="text-sm text-purple-700">Ver ventas</p>
          </div>
        </button>
      </motion.div>

      {/* Key Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-2 md:grid-cols-4 gap-6"
      >
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Ingresos Totales</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <Euro className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Beneficio Total</p>
              <p className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalProfit)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Proyectos</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalProjects}</p>
            </div>
            <Package className="w-8 h-8 text-orange-600" />
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Ventas</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalSales}</p>
            </div>
            <Target className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </motion.div>

      {/* Additional Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-600 text-sm font-medium">Margen Promedio</p>
              <p className="text-2xl font-bold text-blue-900">{formatPercentage(stats.averageMargin)}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-600 text-sm font-medium">€/Hora Promedio</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.averageEurosPerHour)}</p>
            </div>
            <Clock className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-600 text-sm font-medium">Horas Totales</p>
              <p className="text-2xl font-bold text-purple-900">{stats.totalPrintHours.toFixed(1)}h</p>
            </div>
            <Zap className="w-8 h-8 text-purple-600" />
          </div>
        </div>
      </motion.div>

      {/* Latest Projects and Sales */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Latest Projects */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Proyectos Recientes</h3>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Ver todos
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {projects.length === 0 ? (
              <div className="text-center py-8">
                <Package className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay proyectos aún</p>
                <button className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium">
                  Crear primer proyecto
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {projects.map((project, index) => (
                  <div key={project.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{project.name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span>{project.filament_weight}g</span>
                        <span>{project.print_hours}h</span>
                        <span>{formatCurrency(project.total_cost)}</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        project.status === 'completed' ? 'bg-green-100 text-green-700' :
                        project.status === 'calculated' ? 'bg-blue-100 text-blue-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {project.status === 'completed' ? 'Completado' :
                         project.status === 'calculated' ? 'Calculado' : 'Borrador'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>

        {/* Recent Sales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-lg border border-gray-100"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Ventas Recientes</h3>
              <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Ver todas
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {sales.length === 0 ? (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No hay ventas registradas</p>
                <button className="mt-2 text-primary-600 hover:text-primary-700 text-sm font-medium">
                  Registrar primera venta
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {sales.map((sale, index) => (
                  <div key={sale.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{sale.project_name}</h4>
                      <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                        <span>{sale.quantity} unidades</span>
                        <span>{formatCurrency(sale.sale_price)}</span>
                        <span>{formatPercentage(sale.margin)} margen</span>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        sale.status === 'completed' ? 'bg-green-100 text-green-700' :
                        sale.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-red-100 text-red-700'
                      }`}>
                        {sale.status === 'completed' ? 'Completado' :
                         sale.status === 'pending' ? 'Pendiente' : 'Cancelado'}
                      </span>
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Activity Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white rounded-xl shadow-lg border border-gray-100 p-6"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Resumen de Actividad</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold text-primary-600">{stats.totalProducts}</p>
            <p className="text-sm text-gray-600">Productos Vendidos</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-green-600">{formatPercentage(stats.averageMargin)}</p>
            <p className="text-sm text-gray-600">Margen Promedio</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(stats.averageEurosPerHour)}</p>
            <p className="text-sm text-gray-600">€/Hora Promedio</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-purple-600">{stats.totalPrintHours.toFixed(1)}h</p>
            <p className="text-sm text-gray-600">Horas de Impresión</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 