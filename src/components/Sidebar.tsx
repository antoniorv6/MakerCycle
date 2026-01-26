'use client'

import React from 'react'
import { Calculator, TrendingUp, FolderOpen, Settings, Menu, X, LogOut, Home, Users, User, LayoutGrid } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import TeamContextIndicator from './TeamContextIndicator'
import { Notifications } from './Notifications'

interface SidebarProps {
  currentPage: string
  onPageChange: (page: string, tab?: string) => void
  isOpen: boolean
  onToggle: () => void
}

const menuItems = [
  { id: 'home', label: 'Dashboard', icon: Home },
  { id: 'calculator', label: 'Calculadora', icon: Calculator },
  { id: 'accounting', label: 'Contabilidad', icon: TrendingUp },
  { id: 'clients', label: 'Clientes', icon: User },
  { id: 'projects', label: 'Proyectos', icon: FolderOpen },
  { id: 'kanban', label: 'Organización', icon: LayoutGrid, iconColor: 'text-purple-600', tooltip: 'Organiza y prioriza tus proyectos visualmente' },
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
            className="fixed inset-0 bg-dark-900/60 backdrop-blur-sm z-40 lg:hidden"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      {/* Mobile menu button */}
      <button
        onClick={onToggle}
        className="fixed top-4 left-4 z-50 lg:hidden bg-white rounded-xl p-2.5 shadow-lg border border-cream-200 hover:border-brand-300 transition-colors"
      >
        {isOpen ? <X className="w-6 h-6 text-dark-700" /> : <Menu className="w-6 h-6 text-dark-700" />}
      </button>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isOpen ? 0 : -280,
          transition: { type: "spring", stiffness: 300, damping: 30 }
        }}
        className="fixed left-0 top-0 h-full w-70 bg-white border-r border-cream-200 shadow-xl z-50 lg:relative lg:translate-x-0 lg:z-auto lg:w-64 flex flex-col"
      >
        {/* Scrollable content area */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-6">
            {/* Logo */}
            <div className="mb-6 flex justify-center">
              <img src="/logo.svg" alt="Logo MakerCycle" className="w-36 h-auto object-contain" />
            </div>
            <div className="text-center mb-6">
              <p className="text-sm text-dark-500">Gestión Profesional 3D</p>
            </div>

            {/* User info */}
            <div className="mb-6 p-4 bg-cream-gradient rounded-2xl border border-cream-200">
              <div className="flex items-center space-x-3 mb-3">
                <div className="w-10 h-10 bg-brand-gradient rounded-xl flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-sm">
                    {user?.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-dark-900 truncate">
                    {user?.user_metadata?.full_name || user?.email}
                  </p>
                  <p className="text-xs text-dark-500 truncate">{user?.email}</p>
                </div>
                <Notifications />
              </div>
              
              {/* Team Context Indicator */}
              <div className="border-t border-cream-300 pt-3">
                <TeamContextIndicator />
              </div>
            </div>

            <nav className="space-y-1.5">
              {menuItems.map((item) => {
                const Icon = item.icon
                const isActive = currentPage === item.id
                
                if (item.href) {
                  return (
                    <a
                      key={item.id}
                      href={item.href}
                      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                        isActive
                          ? 'bg-brand-gradient text-white shadow-md'
                          : 'text-dark-600 hover:bg-cream-100 hover:text-dark-900'
                      }`}
                      onClick={() => { if (window.innerWidth < 1024) onToggle() }}
                    >
                      <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-dark-400'}`} />
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
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                      isActive
                        ? 'bg-brand-gradient text-white shadow-md'
                        : 'text-dark-600 hover:bg-cream-100 hover:text-dark-900'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-dark-400'}`} />
                    <span className="font-medium">{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Fixed bottom section */}
        <div className="flex-shrink-0 p-6 border-t border-cream-200 bg-cream-50">
          <button
            onClick={async () => {
              try {
                await signOut()
              } catch (error) {
                console.error('Error during logout:', error)
              }
            }}
            className="w-full flex items-center space-x-3 px-4 py-3 text-dark-600 hover:bg-white hover:text-brand-600 rounded-xl transition-all duration-200 border border-cream-200 hover:border-brand-300 bg-white"
          >
            <LogOut className="w-5 h-5 text-dark-400" />
            <span className="font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </motion.aside>
    </>
  )
}
