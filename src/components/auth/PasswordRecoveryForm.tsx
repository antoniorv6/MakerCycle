'use client'

import { useState } from 'react'
import { usePasswordRecovery } from '@/hooks/usePasswordRecovery'
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'

interface PasswordRecoveryFormProps {
  onBack?: () => void
}

export default function PasswordRecoveryForm({ onBack }: PasswordRecoveryFormProps) {
  const [email, setEmail] = useState('')
  const { loading, message, isSuccess, sendPasswordRecoveryEmail, clearMessage } = usePasswordRecovery()

  const handlePasswordRecovery = async (e: React.FormEvent) => {
    e.preventDefault()
    await sendPasswordRecoveryEmail(email)
  }

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-4">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            ¡Email enviado!
          </h2>
          <p className="text-slate-600">
            Hemos enviado un enlace de recuperación a <strong>{email}</strong>
          </p>
        </div>

        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-1">¿Qué hacer ahora?</p>
              <ul className="space-y-1 text-emerald-600">
                <li>• Revisa tu bandeja de entrada</li>
                <li>• Busca en la carpeta de spam si no lo encuentras</li>
                <li>• Haz clic en el enlace del email</li>
                <li>• Crea una nueva contraseña segura</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="text-center space-y-4">
          <p className="text-sm text-slate-600">
            ¿No recibiste el email?{' '}
            <button
              onClick={() => {
                clearMessage()
              }}
              className="text-slate-700 hover:text-slate-900 font-medium underline"
            >
              Intentar de nuevo
            </button>
          </p>
          
          {onBack && (
            <div>
              <button
                onClick={onBack}
                className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al inicio de sesión
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Recuperar contraseña
        </h2>
        <p className="text-slate-600">
          Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña
        </p>
      </div>

      <form onSubmit={handlePasswordRecovery} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-slate-700">
            Email
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="off"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="appearance-none block w-full pl-10 pr-3 py-3.5 border border-cream-300 rounded-xl placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white transition-all duration-200"
              placeholder="tu@email.com"
              style={{ fontSize: 16 }}
            />
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center min-h-touch-lg py-3.5 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-elevation-2 hover:shadow-elevation-3 md-ripple"
          >
            {loading ? 'Enviando...' : 'Enviar enlace de recuperación'}
          </button>
        </div>
      </form>

      {message && (
        <div
          className={`p-4 rounded-xl ${
            isSuccess
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}
          aria-live="polite"
        >
          <div className="flex items-start">
            {isSuccess ? (
              <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 mr-3 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
            )}
            <p className="text-sm">{message}</p>
          </div>
        </div>
      )}

      <div className="text-center">
        {onBack ? (
          <button
            onClick={onBack}
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200 min-h-touch px-3"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio de sesión
          </button>
        ) : (
          <Link
            href="/auth"
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200 min-h-touch px-3"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio de sesión
          </Link>
        )}
      </div>
    </div>
  )
}
