'use client'

import React, { forwardRef, InputHTMLAttributes, ReactNode } from 'react'

interface MobileInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helper?: string
  icon?: ReactNode
  iconPosition?: 'left' | 'right'
  containerClassName?: string
}

const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(({
  label,
  error,
  helper,
  icon,
  iconPosition = 'left',
  containerClassName = '',
  className = '',
  ...props
}, ref) => {
  return (
    <div className={containerClassName}>
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {icon && iconPosition === 'left' && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
        
        <input
          ref={ref}
          className={`
            w-full rounded-xl border bg-white
            transition-all duration-200
            text-base
            ${icon && iconPosition === 'left' ? 'pl-12' : 'pl-4'}
            ${icon && iconPosition === 'right' ? 'pr-12' : 'pr-4'}
            py-4
            ${error
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500'
              : 'border-slate-300 focus:border-brand-500 focus:ring-brand-500'
            }
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            placeholder:text-slate-400
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            ${className}
          `}
          style={{ fontSize: '16px' }} // Prevents iOS zoom on focus
          {...props}
        />
        
        {icon && iconPosition === 'right' && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
            {icon}
          </div>
        )}
      </div>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
      
      {helper && !error && (
        <p className="mt-2 text-sm text-slate-500">{helper}</p>
      )}
    </div>
  )
})

MobileInput.displayName = 'MobileInput'

export default MobileInput
