'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { User, Session } from '@supabase/supabase-js'

type AuthContextType = {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Obtener el cliente de Supabase (singleton)
    const supabase = createClient()
    
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      // Solo actualizar el estado si realmente cambió algo
      // Esto evita re-renders innecesarios cuando Supabase refresca el token
      setSession(prevSession => {
        // Si la sesión es la misma (mismo access_token), no actualizar
        if (prevSession?.access_token === session?.access_token) {
          return prevSession
        }
        return session
      })
      setUser(prevUser => {
        // Si el usuario es el mismo (mismo id), no actualizar
        if (prevUser?.id === session?.user?.id) {
          return prevUser
        }
        return session?.user ?? null
      })
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, []) // Sin dependencias - solo se ejecuta una vez al montar

  const signOut = async () => {
    try {
      const supabase = createClient()
      await supabase.auth.signOut()
      // Redirigir a la landing page después del logout
      router.push('/')
    } catch (error) {
      console.error('Error during sign out:', error)
      // Aún redirigir en caso de error
      router.push('/')
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}