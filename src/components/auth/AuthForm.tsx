'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Mail, Lock, User, Zap } from 'lucide-react'
import { AuthSkeleton } from '@/components/skeletons'
import Link from 'next/link'

export default function AuthForm() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        })

        if (error) throw error

        setMessage('¡Cuenta creada! Revisa tu email para confirmar tu cuenta.')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        router.push('/dashboard')
      }
    } catch (error: any) {
      setMessage(error.message || 'Ha ocurrido un error')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <AuthSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Segmented Control - Login/Register toggle */}
      <div className="flex bg-slate-100 rounded-xl p-1" role="tablist" aria-label="Tipo de acceso">
        <button
          type="button"
          onClick={() => { setIsSignUp(false); setMessage('') }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all md-ripple ${
            !isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
          }`}
          role="tab"
          aria-selected={!isSignUp}
        >
          Iniciar sesión
        </button>
        <button
          type="button"
          onClick={() => { setIsSignUp(true); setMessage('') }}
          className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all md-ripple ${
            isSignUp ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500'
          }`}
          role="tab"
          aria-selected={isSignUp}
        >
          Crear cuenta
        </button>
      </div>

      <form onSubmit={handleAuth} className="space-y-6">
        {isSignUp && (
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-dark-700">
              Nombre completo
            </label>
            <div className="mt-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User className="h-5 w-5 text-dark-400" />
              </div>
              <input
                id="fullName"
                name="fullName"
                type="text"
                autoComplete="name"
                required={isSignUp}
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="appearance-none block w-full pl-10 pr-3 py-3.5 border border-cream-300 rounded-xl placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white transition-all duration-200"
                placeholder="Tu nombre completo"
                style={{ fontSize: 16 }}
              />
            </div>
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-dark-700">
            Email
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="h-5 w-5 text-dark-400" />
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
          <label htmlFor="password" className="block text-sm font-medium text-dark-700">
            Contraseña
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-dark-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete={isSignUp ? 'new-password' : 'current-password'}
              autoCapitalize="off"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full pl-10 pr-12 py-3.5 border border-cream-300 rounded-xl placeholder-dark-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 bg-white transition-all duration-200"
              placeholder="••••••••"
              style={{ fontSize: 16 }}
            />
            <div className="absolute inset-y-0 right-0 pr-1 flex items-center">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-dark-400 hover:text-brand-500 transition-colors duration-200 min-w-touch min-h-touch flex items-center justify-center"
                aria-label={showPassword ? 'Ocultar contraseña' : 'Mostrar contraseña'}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div>
          <button
            type="submit"
            disabled={loading}
            className="group relative w-full flex justify-center items-center min-h-touch-lg py-3.5 px-4 border border-transparent text-base font-semibold rounded-xl text-white bg-brand-gradient shadow-elevation-2 hover:shadow-elevation-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 active:scale-98 md-ripple"
          >
            <Zap className="w-5 h-5 mr-2" />
            {loading ? 'Procesando...' : isSignUp ? 'Crear cuenta' : 'Iniciar sesión'}
          </button>
        </div>
      </form>

      {message && (
        <div
          className={`p-4 rounded-xl ${
            message.includes('error') || message.includes('Error')
              ? 'bg-error-50 text-error-700 border border-error-200'
              : 'bg-success-50 text-success-700 border border-success-200'
          }`}
          aria-live="polite"
        >
          <p className="text-sm">{message}</p>
        </div>
      )}

      <div className="text-center space-y-3">
        {!isSignUp && (
          <div>
            <Link
              href="/auth/forgot-password"
              className="text-sm text-brand-500 hover:text-brand-600 transition-colors duration-200 font-medium inline-flex items-center min-h-touch justify-center"
            >
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
