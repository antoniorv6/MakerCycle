'use client'

import { useEffect, useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, useSearchParams } from 'next/navigation'
import PasswordResetForm from '@/components/auth/PasswordResetForm'
import { AuthSkeleton } from '@/components/skeletons'

function ResetPasswordContent() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [session, setSession] = useState<any>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  useEffect(() => {
    const handlePasswordReset = async () => {
      try {
        // Verificar si hay parámetros de recuperación en la URL
        const accessToken = searchParams.get('access_token')
        const refreshToken = searchParams.get('refresh_token')
        const type = searchParams.get('type')

        // Si hay tokens en la URL, establecer la sesión
        if (accessToken && refreshToken && type === 'recovery') {
          const { data, error } = await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken
          })

          if (error) {
            setError('Enlace de recuperación inválido o expirado. Verifica que la URL de redirección esté configurada correctamente en Supabase.')
            setLoading(false)
            return
          }

          if (data.session) {
            setSession(data.session)
            setLoading(false)
            return
          }
        }

        // Si no hay tokens en la URL, verificar sesión existente
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          setError('Error al verificar la sesión')
          setLoading(false)
          return
        }

        if (sessionData.session) {
          setSession(sessionData.session)
          setLoading(false)
          return
        }

        // Si no hay sesión, verificar si hay parámetros de error en la URL
        const hasErrorParams = searchParams.get('error') || searchParams.get('error_code')
        if (hasErrorParams) {
          router.push('/auth/error?' + searchParams.toString())
          return
        }

        // Si no hay sesión ni errores, mostrar mensaje genérico
        setError('No tienes una sesión activa. Por favor, solicita un nuevo enlace de recuperación.')
        setLoading(false)
        
      } catch (err: any) {
        setError('Error al verificar la sesión: ' + err.message)
        setLoading(false)
      }
    }

    handlePasswordReset()
  }, [searchParams, supabase.auth])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">
              MakerCycle
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Verificando enlace de recuperación...
            </p>
          </div>
          
          <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
            <AuthSkeleton />
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">
              MakerCycle
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Error en la recuperación de contraseña
            </p>
          </div>
          
          <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
            <div className="text-center space-y-4">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              
              <h2 className="text-xl font-semibold text-slate-900">
                Enlace inválido
              </h2>
              
              <p className="text-slate-600">
                {error}
              </p>
              
              <div className="space-y-3">
                <a
                  href="/auth/forgot-password"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                >
                  Solicitar nuevo enlace
                </a>
                
                <a
                  href="/auth"
                  className="w-full flex justify-center py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500"
                >
                  Volver al inicio de sesión
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            MakerCycle
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Crea una nueva contraseña
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
          <PasswordResetForm />
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">
              MakerCycle
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Verificando enlace de recuperación...
            </p>
          </div>
          
          <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
            <AuthSkeleton />
          </div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
