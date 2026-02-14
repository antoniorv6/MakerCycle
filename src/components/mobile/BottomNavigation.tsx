'use client'

import React from 'react'
import { Home, Menu } from 'lucide-react'
import { CalculadoraIcon, ContabilidadIcon, ProyectosIcon } from '@/components/icons/MenuIcons'
import { motion } from 'framer-motion'

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
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-slate-200 safe-area-bottom">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = currentPage === item.id
          
          return (
            <button
              key={item.id}
              onClick={() => item.isMenu ? onMenuOpen() : onPageChange(item.id)}
              className="relative flex flex-col items-center justify-center flex-1 h-full py-2 transition-all duration-200"
            >
              <div className="relative">
                {isActive && !item.isMenu && (
                  <motion.div
                    layoutId="bottomNavIndicator"
                    className="absolute -inset-2 bg-slate-100 rounded-xl"
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                {item.isMenu ? (
                  <Icon 
                    className={`relative w-6 h-6 transition-colors duration-200 ${
                      isActive && !item.isMenu
                        ? 'text-slate-800' 
                        : 'text-slate-400'
                    }`} 
                  />
                ) : (
                  <div className={`relative w-8 h-8 flex items-center justify-center ${isActive ? 'opacity-100' : 'opacity-50'}`}>
                    <Icon className="w-full h-full" />
                  </div>
                )}
              </div>
              <span 
                className={`text-[10px] mt-1 font-medium transition-colors duration-200 ${
                  isActive && !item.isMenu
                    ? 'text-slate-800' 
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
