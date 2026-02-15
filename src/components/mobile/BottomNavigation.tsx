'use client'

import React from 'react'
import { Home, Menu } from 'lucide-react'
import { CalculadoraIcon, ContabilidadIcon, ProyectosIcon } from '@/components/icons/MenuIcons'
import { motion } from 'framer-motion'
import { useHaptics } from '@/hooks/useCapacitor'

interface BottomNavigationProps {
  currentPage: string
  onPageChange: (page: string) => void
  onMenuOpen: () => void
}

const navItems = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'calculator', label: 'Calcular', icon: CalculadoraIcon },
  { id: 'accounting', label: 'Cuentas', icon: ContabilidadIcon },
  { id: 'projects', label: 'Proyectos', icon: ProyectosIcon },
  { id: 'menu', label: 'Más', icon: Menu, isMenu: true },
]

export default function BottomNavigation({ currentPage, onPageChange, onMenuOpen }: BottomNavigationProps) {
  const { triggerHaptic } = useHaptics()

  const handlePress = (item: typeof navItems[number]) => {
    triggerHaptic('light')
    if (item.isMenu) {
      onMenuOpen()
    } else {
      onPageChange(item.id)
    }
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl shadow-elevation-3 safe-area-bottom" role="navigation" aria-label="Navegación principal">
      <div className="flex items-center justify-around h-[68px] max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id

          return (
            <button
              key={item.id}
              onClick={() => handlePress(item)}
              className="relative flex flex-col items-center justify-center flex-1 h-full py-2 transition-all duration-200 md-ripple"
              aria-current={isActive && !item.isMenu ? 'page' : undefined}
            >
              <div className="relative">
                {isActive && !item.isMenu && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -inset-2.5 bg-brand-50 border border-brand-200 rounded-xl"
                    transition={{ type: 'tween', duration: 0.2 }}
                  />
                )}
                {item.isMenu ? (
                  <Icon
                    className={`relative w-7 h-7 transition-colors duration-200 ${
                      isActive && !item.isMenu
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  />
                ) : (
                  <div className={`relative w-7 h-7 flex items-center justify-center ${isActive ? 'opacity-100' : 'opacity-75'}`}>
                    <Icon className="w-full h-full" />
                  </div>
                )}
              </div>
              <span
                className={`text-[11px] mt-1 font-medium transition-colors duration-200 ${
                  isActive && !item.isMenu
                    ? 'text-brand-600'
                    : 'text-slate-400'
                }`}
              >
                {item.label}
              </span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
