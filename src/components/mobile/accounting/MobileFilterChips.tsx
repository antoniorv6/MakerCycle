'use client'

import React from 'react'
import { useHaptics } from '@/hooks/useCapacitor'

interface FilterOption {
  value: string
  label: string
}

interface MobileFilterChipsProps {
  options: FilterOption[]
  selected: string
  onChange: (value: string) => void
}

export default function MobileFilterChips({ options, selected, onChange }: MobileFilterChipsProps) {
  const { triggerHaptic } = useHaptics()

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
      {options.map(option => (
        <button
          key={option.value}
          onClick={() => {
            onChange(option.value)
            triggerHaptic('selection')
          }}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            selected === option.value
              ? 'bg-slate-800 text-white'
              : 'bg-slate-100 text-slate-600'
          }`}
        >
          {option.label}
        </button>
      ))}
    </div>
  )
}
