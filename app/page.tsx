'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import LandingPage from '@/components/LandingPage'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (mounted && !loading && user) {
      router.push('/dashboard/')
    }
  }, [user, loading, router, mounted])

  // Show loading state while checking auth
  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
          <p className="text-slate-600 font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  // If user is authenticated, don't show landing page (redirect is happening)
  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-slate-300 border-t-slate-700 rounded-full animate-spin" />
          <p className="text-slate-600 font-medium">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return <LandingPage />
}
