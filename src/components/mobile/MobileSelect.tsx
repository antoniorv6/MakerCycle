'use client'

import React, { forwardRef, SelectHTMLAttributes, ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

interface MobileSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helper?: string
  icon?: ReactNode
  containerClassName?: string
  options: Array<{ value: string; label: string }>
}

const MobileSelect = forwardRef<HTMLSelectElement, MobileSelectProps>(({
  label,
  error,
  helper,
  icon,
  containerClassName = '',
  className = '',
  options,
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
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            {icon}
          </div>
        )}
        
        <select
          ref={ref}
          className={`
            w-full rounded-xl border bg-white
            transition-all duration-200
            appearance-none
            text-base
            ${icon ? 'pl-12' : 'pl-4'}
            pr-12 py-4
            ${error 
              ? 'border-red-300 focus:border-red-500 focus:ring-red-500' 
              : 'border-slate-300 focus:border-slate-500 focus:ring-slate-500'
            }
            focus:outline-none focus:ring-2 focus:ring-opacity-50
            disabled:bg-slate-50 disabled:text-slate-500 disabled:cursor-not-allowed
            ${className}
          `}
          style={{ fontSize: '16px' }} // Prevents iOS zoom on focus
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
          <ChevronDown className="w-5 h-5" />
        </div>
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

MobileSelect.displayName = 'MobileSelect'

export default MobileSelect
