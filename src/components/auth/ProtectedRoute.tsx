'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
}

export default function ProtectedRoute({ children, redirectTo = '/auth/' }: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo)
      } else {
        setIsAuthorized(true)
      }
    }
  }, [user, loading, router, redirectTo])

  // Show loading while checking auth
  if (loading || !isAuthorized) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <img src="/logo.webp" alt="MakerCycle" className="w-16 h-16 animate-pulse" />
          <div className="w-8 h-8 border-3 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
          <p className="text-slate-600 font-medium">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
