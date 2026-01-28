'use client'

import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import PasswordResetForm from '@/components/auth/PasswordResetForm'

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen-safe bg-gradient-to-br from-slate-50 to-slate-100 safe-area-inset">
      {/* Back button */}
      <div className="fixed top-0 left-0 right-0 z-10 safe-area-top">
        <div className="p-4">
          <Link
            href="/auth/"
            className="inline-flex items-center text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            <span className="font-medium">Volver</span>
          </Link>
        </div>
      </div>

      {/* Form */}
      <div className="flex items-center justify-center min-h-screen-safe px-4 py-20">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <img 
              src="/logo.svg" 
              alt="MakerCycle" 
              className="w-32 h-32 mx-auto mb-4"
            />
            <h1 className="text-2xl font-bold text-slate-900">Nueva Contraseña</h1>
            <p className="text-slate-600 mt-2">Introduce tu nueva contraseña</p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-slate-200">
            <PasswordResetForm />
          </div>
        </div>
      </div>
    </div>
  )
}
