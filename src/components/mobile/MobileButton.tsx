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
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-5 text-base',
    lg: 'py-4 px-6 text-lg',
    full: 'py-4 px-6 text-base w-full',
  }

  const variantClasses = {
    primary: `
      bg-gradient-to-r from-slate-700 to-slate-800 text-white
      shadow-lg active:shadow-md
      disabled:from-slate-400 disabled:to-slate-500
    `,
    secondary: `
      bg-slate-100 text-slate-700 border border-slate-200
      active:bg-slate-200
      disabled:bg-slate-50 disabled:text-slate-400
    `,
    ghost: `
      bg-transparent text-slate-700
      active:bg-slate-100
      disabled:text-slate-400
    `,
    danger: `
      bg-red-500 text-white
      shadow-lg active:shadow-md
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
