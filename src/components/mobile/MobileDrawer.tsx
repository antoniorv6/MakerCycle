'use client'

import React, { useRef, useEffect } from 'react'
import { X, LogOut, ChevronRight, ExternalLink } from 'lucide-react'
import { OrganizacionIcon, ClientesIcon, EquiposIcon, ConfiguracionIcon } from '@/components/icons/MenuIcons'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import { useHaptics } from '@/hooks/useCapacitor'
import TeamContextIndicator from '../TeamContextIndicator'

interface MobileDrawerProps {
  isOpen: boolean
  onClose: () => void
  onPageChange: (page: string) => void
  currentPage: string
}

const menuItems = [
  { id: 'kanban', label: 'Organización Kanban', icon: OrganizacionIcon, description: 'Tablero visual de proyectos' },
  { id: 'clients', label: 'Clientes', icon: ClientesIcon, description: 'Gestiona tus clientes' },
  { id: 'teams', label: 'Equipos', icon: EquiposIcon, description: 'Colabora con tu equipo' },
  { id: 'settings', label: 'Configuración', icon: ConfiguracionIcon, description: 'Preferencias y ajustes' },
]

export default function MobileDrawer({ isOpen, onClose, onPageChange, currentPage }: MobileDrawerProps) {
  const { user, signOut } = useAuth()
  const { triggerHaptic } = useHaptics()
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  // Focus management: focus close button when drawer opens
  useEffect(() => {
    if (isOpen && closeButtonRef.current) {
      closeButtonRef.current.focus()
    }
  }, [isOpen])

  const handleNavigation = (page: string) => {
    triggerHaptic('light')
    onPageChange(page)
    onClose()
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      onClose()
    } catch (error) {
      console.error('Error during logout:', error)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          
          {/* Drawer */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[85vh] overflow-hidden safe-area-bottom shadow-elevation-4"
            role="dialog"
            aria-modal="true"
            aria-label="Menú de navegación"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2">
              <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h2 className="text-xl font-bold text-slate-900">Menú</h2>
              <button
                ref={closeButtonRef}
                onClick={onClose}
                className="p-2.5 rounded-full hover:bg-slate-100 transition-colors md-ripple min-w-touch min-h-touch flex items-center justify-center"
                aria-label="Cerrar menú"
              >
                <X className="w-5 h-5 text-slate-500" />
              </button>
            </div>

            {/* User Info */}
            <div className="px-6 py-4 bg-slate-50">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-slate-200 rounded-full flex items-center justify-center">
                  <span className="text-slate-600 font-semibold text-lg">
                    {user?.email?.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">
                    {user?.user_metadata?.full_name || 'Usuario'}
                  </p>
                  <p className="text-sm text-slate-500 truncate">{user?.email}</p>
                </div>
              </div>
              
              {/* Team Context */}
              <div className="mt-4">
                <TeamContextIndicator />
              </div>
            </div>

            {/* Menu Items */}
            <div className="px-4 py-4 overflow-y-auto max-h-[40vh]">
              <div className="space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon
                  const isActive = currentPage === item.id
                  
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavigation(item.id)}
                      className={`w-full flex items-center justify-between px-4 py-4 rounded-2xl transition-all duration-200 md-ripple ${
                        isActive
                          ? 'bg-slate-100'
                          : 'hover:bg-slate-50 active:bg-slate-100'
                      }`}
                      aria-current={isActive ? 'page' : undefined}
                    >
                      <div className="flex items-center space-x-4">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                          isActive ? 'bg-slate-800' : 'bg-slate-100'
                        }`}>
                          <div className="w-8 h-8 flex items-center justify-center">
                            <div 
                              className="w-full h-full"
                              style={isActive ? {
                                filter: 'brightness(0) invert(1)'
                              } : {}}
                            >
                              <Icon className="w-full h-full" />
                            </div>
                          </div>
                        </div>
                        <div className="text-left">
                          <p className={`font-medium ${isActive ? 'text-slate-900' : 'text-slate-700'}`}>
                            {item.label}
                          </p>
                          <p className="text-sm text-slate-500">{item.description}</p>
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-slate-400" />
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Buy Me a Coffee Button */}
            <div className="px-4 py-4 border-t border-slate-100">
              <div className="flex justify-center mb-4">
                <a
                  href="https://www.buymeacoffee.com/3dmaniaconh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                  aria-label="Apoya a MakerCycle (enlace externo)"
                >
                  <img
                    src="https://img.buymeacoffee.com/button-api/?text=¡Apoya a MakerCycle!&emoji=🖤&slug=3dmaniaconh&button_colour=FFDD00&font_colour=000000&font_family=Lato&outline_colour=000000&coffee_colour=ffffff"
                    alt="Buy Me a Coffee"
                    className="h-auto w-full max-w-[200px]"
                  />
                  <ExternalLink className="w-4 h-4 text-slate-400 flex-shrink-0" />
                </a>
              </div>
            </div>

            {/* Sign Out */}
            <div className="px-4 py-4 border-t border-slate-100">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center space-x-3 px-4 py-4 rounded-2xl bg-red-50 hover:bg-red-100 active:bg-red-200 transition-colors"
              >
                <LogOut className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-600">Cerrar Sesión</span>
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
