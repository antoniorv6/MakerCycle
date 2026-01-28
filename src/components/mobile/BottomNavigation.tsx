'use client'

import React from 'react'
import { Home, Calculator, TrendingUp, FolderOpen, Menu } from 'lucide-react'
import { motion } from 'framer-motion'

interface BottomNavigationProps {
  currentPage: string
  onPageChange: (page: string) => void
  onMenuOpen: () => void
}

const navItems = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'calculator', label: 'Calcular', icon: Calculator },
  { id: 'accounting', label: 'Cuentas', icon: TrendingUp },
  { id: 'projects', label: 'Proyectos', icon: FolderOpen },
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
                <Icon 
                  className={`relative w-6 h-6 transition-colors duration-200 ${
                    isActive && !item.isMenu
                      ? 'text-slate-800' 
                      : 'text-slate-400'
                  }`} 
                />
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
