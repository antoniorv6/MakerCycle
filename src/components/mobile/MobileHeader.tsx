'use client'

import React from 'react'
import { Bell, User } from 'lucide-react'
import { motion } from 'framer-motion'
import { useAuth } from '@/components/providers/AuthProvider'
import { Notifications } from '../Notifications'

interface MobileHeaderProps {
  title?: string
  showBack?: boolean
  onBack?: () => void
}

export default function MobileHeader({ title = 'MakerCycle', showBack, onBack }: MobileHeaderProps) {
  const { user } = useAuth()

  return (
    <header className="fixed top-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-xl border-b border-slate-200 safe-area-top">
      <div className="flex items-center justify-between h-14 px-4">
        {/* Left section */}
        <div className="flex items-center space-x-3">
          {showBack && onBack ? (
            <button
              onClick={onBack}
              className="p-2 -ml-2 rounded-full hover:bg-slate-100 transition-colors"
            >
              <svg className="w-6 h-6 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
          ) : (
            <div className="flex items-center space-x-2">
              <img 
                src="/logo.svg" 
                alt="MakerCycle" 
                className="w-12 h-12 object-contain"
              />
              <span className="font-bold text-slate-900 text-lg">{title}</span>
            </div>
          )}
          
          {showBack && (
            <span className="font-semibold text-slate-900">{title}</span>
          )}
        </div>

        {/* Right section */}
        <div className="flex items-center space-x-2">
          <Notifications />
          
          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center">
            <span className="text-slate-600 font-medium text-sm">
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </span>
          </div>
        </div>
      </div>
    </header>
  )
}
