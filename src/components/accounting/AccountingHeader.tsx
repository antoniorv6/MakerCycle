import React from 'react';
import { TrendingUp, Plus, Search, Calendar, Euro, BarChart3, PieChart, Clock, FileText, Activity, Receipt } from 'lucide-react';
import { motion } from 'framer-motion';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import type { AccountingStats } from '@/types';

interface AccountingHeaderProps {
  stats: AccountingStats;
  onShowAdvancedStats: () => void;
}

export function AccountingHeader({ 
  stats, 
  onShowAdvancedStats
}: AccountingHeaderProps) {
  const { formatCurrency, currencySymbol } = useFormatCurrency();
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
          <Receipt className="w-8 h-8 text-slate-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Contabilidad</h1>
        <p className="text-slate-600">Gestiona tus ventas, gastos y análisis financiero</p>
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
              <p className="text-sm font-medium text-orange-600">{currencySymbol}/Hora</p>
              <p className="text-2xl font-bold text-orange-900">{formatCurrency(stats.averageEurosPerHour)}</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </motion.div>

      {/* Discreet Advanced Stats Link */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex justify-center"
      >
        <button
          onClick={onShowAdvancedStats}
          className="flex items-center text-gray-600 hover:text-purple-600 transition-colors duration-200 text-sm"
        >
          <PieChart className="w-4 h-4 mr-2" />
          Ver estadísticas avanzadas
        </button>
      </motion.div>
    </div>
  );
} 