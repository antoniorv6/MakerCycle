'use client'

import { useEffect, useState, ReactNode } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import { Wrench } from 'lucide-react'

interface ProtectedRouteProps {
  children: ReactNode
  redirectTo?: string
}

const isMaintenanceMode = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === 'true'

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
          <img src="/logo.svg" alt="MakerCycle" className="w-24 h-24 animate-pulse" />
          <div className="w-8 h-8 border-3 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
          <p className="text-slate-600 font-medium">Verificando sesión...</p>
        </div>
      </div>
    )
  }

  // Show maintenance mode screen
  if (isMaintenanceMode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center space-y-6 px-6 text-center max-w-md">
          <div className="w-20 h-20 bg-slate-200 rounded-full flex items-center justify-center">
            <Wrench className="w-10 h-10 text-slate-600" />
          </div>
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-slate-800">
              Estamos en mantenimiento
            </h1>
            <p className="text-slate-600">
              Estamos realizando mejoras en la plataforma para ofrecerte una mejor experiencia. Volveremos pronto.
            </p>
          </div>
          <div className="pt-4">
            <img src="/logo.svg" alt="MakerCycle" className="w-16 h-16 opacity-50" />
          </div>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
