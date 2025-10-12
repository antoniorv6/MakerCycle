'use client'

import { useState, useEffect } from 'react'
import { usePasswordRecovery } from '@/hooks/usePasswordRecovery'
import { useRouter } from 'next/navigation'
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface PasswordResetFormProps {
  onBack?: () => void
}

export default function PasswordResetForm({ onBack }: PasswordResetFormProps) {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const router = useRouter()
  const { loading, message, isSuccess, updatePassword } = usePasswordRecovery()

  // Validar fortaleza de la contraseña
  const validatePassword = (pwd: string) => {
    let strength = 0
    if (pwd.length >= 8) strength += 1
    if (/[A-Z]/.test(pwd)) strength += 1
    if (/[a-z]/.test(pwd)) strength += 1
    if (/[0-9]/.test(pwd)) strength += 1
    if (/[^A-Za-z0-9]/.test(pwd)) strength += 1
    return strength
  }

  useEffect(() => {
    setPasswordStrength(validatePassword(password))
  }, [password])

  const getPasswordStrengthColor = (strength: number) => {
    if (strength <= 2) return 'bg-red-500'
    if (strength <= 3) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getPasswordStrengthText = (strength: number) => {
    if (strength <= 2) return 'Débil'
    if (strength <= 3) return 'Media'
    return 'Fuerte'
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()

    // Validación adicional de fortaleza
    if (passwordStrength < 3) {
      return
    }

    await updatePassword(password, confirmPassword)
  }

  // Redirigir cuando sea exitoso
  useEffect(() => {
    if (isSuccess) {
      const timer = setTimeout(() => {
        router.push('/dashboard')
      }, 2000)
      return () => clearTimeout(timer)
    }
  }, [isSuccess, router])

  if (isSuccess) {
    return (
      <div className="space-y-6">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100 mb-4">
            <CheckCircle className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            ¡Contraseña actualizada!
          </h2>
          <p className="text-slate-600">
            Tu contraseña ha sido actualizada correctamente. Serás redirigido al dashboard en unos segundos.
          </p>
        </div>

        <div className="bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-start">
            <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 mr-3 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium mb-1">¡Todo listo!</p>
              <p>Ya puedes iniciar sesión con tu nueva contraseña.</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-slate-900 mb-2">
          Nueva contraseña
        </h2>
        <p className="text-slate-600">
          Crea una nueva contraseña segura para tu cuenta
        </p>
      </div>

      <form onSubmit={handlePasswordReset} className="space-y-6">
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-slate-700">
            Nueva contraseña
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="appearance-none block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-md placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500"
              placeholder="••••••••"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-slate-400 hover:text-slate-500"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
          
          {/* Indicador de fortaleza de contraseña */}
          {password && (
            <div className="mt-2">
              <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                <span>Fortaleza de la contraseña:</span>
                <span className={`font-medium ${
                  passwordStrength <= 2 ? 'text-red-600' :
                  passwordStrength <= 3 ? 'text-yellow-600' : 'text-green-600'
                }`}>
                  {getPasswordStrengthText(passwordStrength)}
                </span>
              </div>
              <div className="w-full bg-slate-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${getPasswordStrengthColor(passwordStrength)}`}
                  style={{ width: `${(passwordStrength / 5) * 100}%` }}
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700">
            Confirmar contraseña
          </label>
          <div className="mt-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Lock className="h-5 w-5 text-slate-400" />
            </div>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="appearance-none block w-full pl-10 pr-10 py-2 border border-slate-300 rounded-md placeholder-slate-400 focus:outline-none focus:ring-slate-500 focus:border-slate-500"
              placeholder="••••••••"
            />
            <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="text-slate-400 hover:text-slate-500"
              >
                {showConfirmPassword ? (
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
            disabled={loading || passwordStrength < 3 || password !== confirmPassword}
            className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-xl text-white bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
          </button>
        </div>
      </form>

      {message && (
        <div className={`p-4 rounded-xl ${
          isSuccess 
            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
            : 'bg-red-50 text-red-700 border border-red-200'
        }`}>
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
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </button>
        ) : (
          <Link
            href="/auth"
            className="inline-flex items-center text-sm text-slate-600 hover:text-slate-900 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver al inicio de sesión
          </Link>
        )}
      </div>
    </div>
  )
}
