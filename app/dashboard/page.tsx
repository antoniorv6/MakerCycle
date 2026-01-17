'use client'

import { useCapacitorContext } from '@/components/providers/CapacitorProvider'
import Dashboard from '@/components/Dashboard'
import { MobileLayout } from '@/components/mobile'
import ProtectedRoute from '@/components/auth/ProtectedRoute'
import { useEffect, useState } from 'react'

function DashboardContent() {
  const { isNative, isReady } = useCapacitorContext()
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    // Check if on mobile viewport or native app
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || isNative)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [isNative])

  // Show loading while Capacitor initializes
  if (!isReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <img src="/logo.webp" alt="MakerCycle" className="w-16 h-16 animate-pulse" />
          <div className="w-8 h-8 border-3 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
        </div>
      </div>
    )
  }

  // Use mobile layout for native apps and small screens
  if (isMobile) {
    return <MobileLayout />
  }

  // Desktop layout
  return <Dashboard />
}

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  )
}
