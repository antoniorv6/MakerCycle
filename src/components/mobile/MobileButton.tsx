'use client'

import React, { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface MobileButtonProps {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg' | 'full'
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  className?: string
  type?: 'button' | 'submit' | 'reset'
}

export default function MobileButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
}: MobileButtonProps) {
  const sizeClasses = {
    sm: 'py-2.5 px-4 text-sm min-h-[44px]',
    md: 'py-3 px-5 text-base min-h-[44px]',
    lg: 'py-4 px-6 text-lg min-h-[48px]',
    full: 'py-4 px-6 text-base w-full min-h-[48px]',
  }

  const variantClasses = {
    primary: `
      bg-brand-gradient text-white
      shadow-elevation-2 active:shadow-elevation-1
      disabled:opacity-50 disabled:shadow-none
    `,
    secondary: `
      bg-brand-50 text-brand-700 border border-brand-200
      active:bg-brand-100
      disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-200
    `,
    ghost: `
      bg-slate-50 text-slate-700 border border-slate-200
      active:bg-slate-100
      disabled:bg-slate-50 disabled:text-slate-400 disabled:border-slate-100
    `,
    danger: `
      bg-red-500 text-white
      shadow-lg shadow-red-500/25 active:shadow-md
      disabled:bg-red-300
    `,
  }

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      whileTap={disabled ? undefined : { scale: 0.97 }}
      className={`
        inline-flex items-center justify-center
        font-semibold rounded-xl
        transition-all duration-200
        tap-highlight-none no-select
        ${!disabled ? 'md-ripple' : ''}
        ${sizeClasses[size]}
        ${variantClasses[variant]}
        ${disabled ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}
        ${className}
      `}
    >
      {icon && iconPosition === 'left' && (
        <span className="mr-2 flex-shrink-0">{icon}</span>
      )}
      {children}
      {icon && iconPosition === 'right' && (
        <span className="ml-2 flex-shrink-0">{icon}</span>
      )}
    </motion.button>
  )
}
