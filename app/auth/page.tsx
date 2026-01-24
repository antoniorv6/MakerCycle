'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/providers/AuthProvider'
import AuthForm from '@/components/auth/AuthForm'
import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function AuthPage() {
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

  return (
    <div className="min-h-screen-safe bg-gradient-to-br from-slate-50 to-slate-100 safe-area-inset">
      {/* Back button */}
      <div className="fixed top-0 left-0 right-0 z-10 safe-area-top">
        <div className="p-4">
          <Link
            href="/"
            className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Volver</span>
          </Link>
        </div>
      </div>

      {/* Auth form */}
      <div className="flex items-center justify-center min-h-screen-safe px-4 py-20">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <img 
              src="/logo.svg" 
              alt="MakerCycle" 
              className="w-32 h-32 mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-slate-900">MakerCycle</h1>
            <p className="text-slate-600 mt-2">Gestión profesional de impresión 3D</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
            <AuthForm />
          </div>
        </div>
      </div>
    </div>
  )
}
