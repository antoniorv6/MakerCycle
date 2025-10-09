import { useState } from 'react'
import { createClient } from '@/lib/supabase'

export function usePasswordRecovery() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const supabase = createClient()

  const sendPasswordRecoveryEmail = async (email: string) => {
    setLoading(true)
    setMessage('')
    setIsSuccess(false)

    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setIsSuccess(true)
      setMessage('¡Email de recuperación enviado! Revisa tu bandeja de entrada y sigue las instrucciones.')
    } catch (error: any) {
      // Manejo específico de errores comunes
      if (error.message?.includes('Invalid email')) {
        setMessage('El email proporcionado no es válido.')
      } else if (error.message?.includes('User not found')) {
        setMessage('No existe una cuenta con este email.')
      } else if (error.message?.includes('rate limit')) {
        setMessage('Demasiados intentos. Espera unos minutos antes de intentar de nuevo.')
      } else {
        setMessage(error.message || 'Ha ocurrido un error al enviar el email de recuperación')
      }
      
      setIsSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  const updatePassword = async (password: string, confirmPassword: string) => {
    setLoading(true)
    setMessage('')
    setIsSuccess(false)

    // Validaciones
    if (password !== confirmPassword) {
      setMessage('Las contraseñas no coinciden')
      setLoading(false)
      return
    }

    if (password.length < 8) {
      setMessage('La contraseña debe tener al menos 8 caracteres')
      setLoading(false)
      return
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      })

      if (error) throw error

      setIsSuccess(true)
      setMessage('¡Contraseña actualizada correctamente! Serás redirigido al dashboard.')
    } catch (error: any) {
      setMessage(error.message || 'Ha ocurrido un error al actualizar la contraseña')
      setIsSuccess(false)
    } finally {
      setLoading(false)
    }
  }

  const checkSession = async () => {
    try {
      const { data, error } = await supabase.auth.getSession()
      
      if (error) throw error
      
      return { session: data.session, error: null }
    } catch (error: any) {
      return { session: null, error }
    }
  }

  const setRecoverySession = async (accessToken: string, refreshToken: string) => {
    try {
      const { data, error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      })

      if (error) throw error

      return { session: data.session, error: null }
    } catch (error: any) {
      return { session: null, error }
    }
  }

  const clearMessage = () => {
    setMessage('')
    setIsSuccess(false)
  }

  return {
    loading,
    message,
    isSuccess,
    sendPasswordRecoveryEmail,
    updatePassword,
    checkSession,
    setRecoverySession,
    clearMessage
  }
}
