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
      <div className="min-h-screen flex items-center justify-center bg-cream-gradient">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-dark-600 font-medium">Cargando...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-cream-gradient">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
          <p className="text-dark-600 font-medium">Redirigiendo...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen-safe bg-cream-gradient safe-area-inset relative overflow-y-auto">
      {/* Decorative elements */}
      <div className="hidden sm:block">
        <div className="absolute top-20 -left-20 w-64 h-64 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob pointer-events-none"></div>
        <div className="absolute top-40 -right-20 w-64 h-64 bg-coral-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000 pointer-events-none"></div>
        <div className="absolute -bottom-20 left-1/3 w-80 h-80 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000 pointer-events-none"></div>
      </div>

      {/* Back button */}
      <div className="fixed top-0 left-0 right-0 z-10 safe-area-top pointer-events-none">
        <div className="p-4">
          <Link
            href="/"
            className="pointer-events-auto inline-flex items-center text-dark-600 hover:text-brand-500 transition-colors bg-white/80 backdrop-blur-sm px-4 py-2 rounded-xl border border-cream-200"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Volver</span>
          </Link>
        </div>
      </div>

      {/* Auth form */}
      <div className="relative flex items-center justify-center min-h-screen-safe px-4 py-20">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <img
              src="/logo.svg"
              alt="MakerCycle"
              className="w-24 h-24 sm:w-36 sm:h-36 mx-auto mb-4"
            />
            <h1 className="text-2xl sm:text-3xl font-bold text-dark-900 font-display">MakerCycle</h1>
            <p className="text-dark-500 mt-2">Gestión profesional de impresión 3D</p>
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-3xl shadow-2xl p-5 sm:p-8 border border-cream-200">
            <AuthForm />
          </div>
        </div>
      </div>
    </div>
  )
}
