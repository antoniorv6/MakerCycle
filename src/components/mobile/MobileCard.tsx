'use client'

import React, { ReactNode } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight } from 'lucide-react'

interface MobileCardProps {
  children: ReactNode
  onClick?: () => void
  className?: string
  showArrow?: boolean
  padding?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'elevated' | 'outlined' | 'accent'
}

export default function MobileCard({ 
  children, 
  onClick, 
  className = '', 
  showArrow = false,
  padding = 'md',
  variant = 'default'
}: MobileCardProps) {
  const paddingClasses = {
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }

  const variantClasses = {
    default: 'bg-white border border-slate-200 shadow-elevation-1',
    elevated: 'bg-white shadow-elevation-3',
    outlined: 'bg-slate-50 border-2 border-slate-300',
    accent: 'bg-white border border-brand-200 shadow-elevation-1',
  }

  const Component = onClick ? motion.button : motion.div

  return (
    <Component
      onClick={onClick}
      whileTap={onClick ? { scale: 0.985 } : undefined}
      className={`
        w-full rounded-2xl transition-all duration-200
        ${paddingClasses[padding]}
        ${variantClasses[variant]}
        ${onClick ? 'active:bg-slate-50 cursor-pointer tap-highlight-none md-ripple' : ''}
        ${className}
      `}
    >
      <div className={`flex items-center ${showArrow ? 'justify-between' : ''}`}>
        <div className="flex-1 text-left">{children}</div>
        {showArrow && onClick && (
          <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0 ml-2" />
        )}
      </div>
    </Component>
  )
}
