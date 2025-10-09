'use client'

import { useEffect, useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, RefreshCw, ArrowLeft, Mail } from 'lucide-react'

function ErrorContent() {
  const [errorInfo, setErrorInfo] = useState({
    error: '',
    errorCode: '',
    errorDescription: ''
  })
  const searchParams = useSearchParams()

  useEffect(() => {
    const error = searchParams.get('error')
    const errorCode = searchParams.get('error_code')
    const errorDescription = searchParams.get('error_description')

    setErrorInfo({
      error: error || '',
      errorCode: errorCode || '',
      errorDescription: errorDescription || ''
    })
  }, [searchParams])

  const getErrorMessage = () => {
    if (errorInfo.errorCode === 'otp_expired') {
      return {
        title: 'Enlace Expirado',
        message: 'El enlace de recuperación ha expirado. Los enlaces de Supabase expiran después de 24 horas.',
        action: 'Solicita un nuevo enlace de recuperación'
      }
    }
    
    if (errorInfo.error === 'access_denied') {
      return {
        title: 'Acceso Denegado',
        message: 'No tienes permisos para acceder a esta página o el enlace es inválido.',
        action: 'Solicita un nuevo enlace de recuperación'
      }
    }

    return {
      title: 'Error de Autenticación',
      message: errorInfo.errorDescription || 'Ha ocurrido un error inesperado.',
      action: 'Intenta de nuevo'
    }
  }

  const errorData = getErrorMessage()

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-slate-900">
            MakerCycle
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Error de autenticación
          </p>
        </div>
        
        <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
          <div className="text-center space-y-6">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100">
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
            
            <div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">
                {errorData.title}
              </h2>
              
              <p className="text-slate-600 mb-4">
                {errorData.message}
              </p>

              {errorInfo.errorCode === 'otp_expired' && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <RefreshCw className="h-5 w-5 text-yellow-600 mt-0.5 mr-3 flex-shrink-0" />
                    <div className="text-sm">
                      <p className="font-medium text-yellow-800 mb-1">¿Por qué expira el enlace?</p>
                      <p className="text-yellow-700">
                        Los enlaces de recuperación de Supabase expiran después de 24 horas por seguridad. 
                        Esto es normal y esperado.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="space-y-3">
              <Link
                href="/auth/forgot-password"
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
              >
                <Mail className="h-4 w-4" />
                {errorData.action}
              </Link>
              
              <Link
                href="/auth"
                className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-slate-300 rounded-md shadow-sm text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al inicio de sesión
              </Link>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-slate-900">
              MakerCycle
            </h1>
            <p className="mt-2 text-sm text-slate-600">
              Cargando...
            </p>
          </div>
          <div className="bg-white py-8 px-6 shadow-xl rounded-xl">
            <div className="animate-pulse">
              <div className="h-4 bg-slate-200 rounded w-3/4 mx-auto mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-1/2 mx-auto"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <ErrorContent />
    </Suspense>
  )
}
