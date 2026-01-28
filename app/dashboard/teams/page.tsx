'use client'

import { useCapacitorContext } from '@/components/providers/CapacitorProvider'
import Dashboard from '@/components/Dashboard'
import { MobileLayout } from '@/components/mobile'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useEffect, useState } from 'react'

function TeamsContent() {
  const { isNative, isReady } = useCapacitorContext()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || isNative)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [isNative])

  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <img src="/logo.svg" alt="MakerCycle" className="w-24 h-24 animate-pulse" />
          <div className="w-8 h-8 border-3 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  if (isMobile) {
    return <MobileLayout initialPage="teams" />
  }

  return <Dashboard initialPage="teams" />
}

export default function TeamsPage() {
  return (
    <ProtectedRoute>
      <TeamsContent />
    </ProtectedRoute>
  )
}
