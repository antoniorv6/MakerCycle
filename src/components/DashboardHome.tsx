'use client'

import React from 'react';
import { TrendingUp, Calculator, FileText, Euro, Clock, Package, Users, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import type { DashboardStats } from '@/types';
import TeamContextBanner from './TeamContextBanner';

interface DashboardHomeProps {
  stats: DashboardStats;
  onNavigate: (page: string) => void;
}

export default function DashboardHome({ stats, onNavigate }: DashboardHomeProps) {
  const formatCurrency = (value: number) => `€${value.toFixed(2)}`;
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`;

  const quickActions = [
    {
      id: 'calculator',
      title: 'Nuevo Proyecto',
      description: 'Crear un nuevo proyecto de impresión 3D',
      icon: Calculator,
      color: 'bg-blue-500 hover:bg-blue-600',
      onClick: () => onNavigate('calculator')
    },
    {
      id: 'accounting',
      title: 'Contabilidad',
      description: 'Gestionar ventas y gastos',
      icon: Euro,
      color: 'bg-green-500 hover:bg-green-600',
      onClick: () => onNavigate('accounting')
    },
    {
      id: 'projects',
      title: 'Proyectos',
      description: 'Ver y gestionar proyectos existentes',
      icon: FileText,
      color: 'bg-purple-500 hover:bg-purple-600',
      onClick: () => onNavigate('projects')
    }
  ];

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Team Context Banner */}
      <TeamContextBanner />
      
      {/* Header */}
      <div className="text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
          <Activity className="w-8 h-8 text-slate-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Dashboard</h1>
        <p className="text-slate-600">Resumen de tu actividad de impresión 3D</p>
      </div>

      {/* Key Statistics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-600">Proyectos Totales</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalProjects}</p>
            </div>
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-600">Ventas Totales</p>
              <p className="text-2xl font-bold text-green-900">{stats.totalSales}</p>
            </div>
            <Euro className="w-8 h-8 text-green-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-purple-600">Ingresos Totales</p>
              <p className="text-2xl font-bold text-purple-900">{formatCurrency(stats.totalRevenue)}</p>
            </div>
            <TrendingUp className="w-8 h-8 text-purple-600" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-orange-600">Horas de Impresión</p>
              <p className="text-2xl font-bold text-orange-900">{stats.totalPrintHours}h</p>
            </div>
            <Clock className="w-8 h-8 text-orange-600" />
          </div>
        </div>
      </motion.div>

      {/* Additional Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6"
      >
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Package className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Productos Vendidos</p>
              <p className="text-xl font-bold text-gray-900">{stats.totalProducts}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Beneficio Total</p>
              <p className="text-xl font-bold text-gray-900">{formatCurrency(stats.totalProfit)}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Margen Promedio</p>
              <p className="text-xl font-bold text-gray-900">{formatPercentage(stats.averageMargin)}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-6"
      >
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Acciones Rápidas</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {quickActions.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.id}
                  onClick={action.onClick}
                  className={`${action.color} text-white rounded-xl p-6 text-left transition-all duration-200 transform hover:scale-105`}
                >
                  <Icon className="w-8 h-8 mb-3" />
                  <h3 className="text-lg font-semibold mb-1">{action.title}</h3>
                  <p className="text-sm opacity-90">{action.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
} 