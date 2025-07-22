'use client'

import React from 'react'
import { Calculator, TrendingUp, FolderOpen, Settings, Menu, X, LogOut, Home, Users, User } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import TeamContextIndicator from './TeamContextIndicator'
import { Notifications } from './Notifications'

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string) => void
  isOpen: boolean
  onToggle: () => void
}

const menuItems = [
  { id: 'home', label: 'Dashboard', icon: Home },
  { id: 'calculator', label: 'Calculadora', icon: Calculator },
  { id: 'accounting', label: 'Contabilidad', icon: TrendingUp },
  { id: 'clients', label: 'Clientes', icon: User },
  { id: 'projects', label: 'Proyectos', icon: FolderOpen },
  { id: 'teams', label: 'Equipos', icon: Users, href: '/dashboard/teams' },
  { id: 'settings', label: 'Configuración', icon: Settings },
]

export default function Sidebar({ currentPage, onPageChange, isOpen, onToggle }: SidebarProps) {
  const { user, signOut } = useAuth()

  return (
    <>
      {/* Mobile overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white rounded-lg p-2 shadow-lg border border-slate-200"
      >
        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : -280,
          transition: { type: "spring", stiffness: 300, damping: 30 }
        }}
        className="fixed left-0 top-0 h-full w-70 bg-white border-r border-slate-200 shadow-lg z-50 lg:relative lg:translate-x-0 lg:z-auto lg:w-64"
      >
        <div className="p-6 relative">
          {/* Logo arriba a la derecha */}
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo.webp" alt="Logo MakerCycle" className="w-10 h-10 object-contain" />
            <h1 className="text-xl font-bold text-slate-900">MakerCycle</h1>
          </div>
          <div>
            <p className="text-sm text-slate-500">Gestión Profesional 3D</p>
          </div>

          {/* User info */}
          <div className="mb-6 p-3 bg-slate-50 rounded-lg">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
                <span className="text-slate-600 font-medium text-sm">
                  {user?.email?.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-slate-900 truncate">
                  {user?.user_metadata?.full_name || user?.email}
                </p>
                <p className="text-xs text-slate-500 truncate">{user?.email}</p>
              </div>
              <Notifications />
            </div>
            
            {/* Team Context Indicator */}
            <div className="border-t border-slate-200 pt-3">
              <TeamContextIndicator />
            </div>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon
              const isActive = currentPage === item.id
              
              if (item.href) {
                return (
                  <a
                    key={item.id}
                    href={item.href}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                      isActive
                        ? 'bg-slate-100 text-slate-700 border border-slate-200'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                    onClick={() => { if (window.innerWidth < 1024) onToggle() }}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-slate-600' : 'text-slate-400'}`} />
                    <span className="font-medium">{item.label}</span>
                  </a>
                )
              }
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onPageChange(item.id)
                    if (window.innerWidth < 1024) onToggle()
                  }}
                  className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-slate-100 text-slate-700 border border-slate-200'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-5 h-5 ${isActive ? 'text-slate-600' : 'text-slate-400'}`} />
                  <span className="font-medium">{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-slate-200">
          <button
            onClick={async () => {
              try {
                await signOut()
              } catch (error) {
                console.error('Error during logout:', error)
              }
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg transition-all duration-200"
          >
            <LogOut className="w-5 h-5 text-slate-400" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </motion.aside>
    </>
  )
}