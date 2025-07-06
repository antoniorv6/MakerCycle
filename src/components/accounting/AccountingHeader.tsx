import React from 'react';
import { TrendingUp, Plus, Search, Calendar, Euro, BarChart3, PieChart, Clock, FileText, Activity, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';
import type { AccountingStats } from '@/types';

interface AccountingHeaderProps {
  stats: AccountingStats;
  onShowAdvancedStats: () => void;
  onShowAddForm: () => void;
  onShowAddExpenseForm: () => void;
}

export function AccountingHeader({ 
  stats, 
  onShowAdvancedStats, 
  onShowAddForm, 
  onShowAddExpenseForm 
}: AccountingHeaderProps) {
  const formatCurrency = (value: number) => `€${value.toFixed(2)}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-full mb-4">
          <Receipt className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Contabilidad</h1>
        <p className="text-gray-600">Gestiona tus ventas, gastos y análisis financiero</p>
      </div>

      {/* Key Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <Euro className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Beneficio Neto</p>
              <p className="text-2xl font-bold text-blue-900">{formatCurrency(stats.netProfit)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Margen Promedio</p>
              <p className="text-2xl font-bold text-purple-900">{formatPercentage(stats.averageMargin)}</p>
            </div>
            <BarChart3 className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">€/Hora</p>
              <p className="text-2xl font-bold text-orange-900">{formatCurrency(stats.averageEurosPerHour)}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </motion.div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-wrap gap-3 justify-center"
      >
        <button
          onClick={onShowAddForm}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Venta
        </button>

        <button
          onClick={onShowAddExpenseForm}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nuevo Gasto
        </button>

        <button
          onClick={onShowAdvancedStats}
          className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
        >
          <PieChart className="w-4 h-4 mr-2" />
          Estadísticas Avanzadas
        </button>
      </motion.div>
    </div>
  );
} 