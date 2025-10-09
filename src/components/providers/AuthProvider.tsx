'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import type { User, Session } from '@supabase/supabase-js'
import WelcomePopup from '@/components/WelcomePopup'

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
  const [showWelcomePopup, setShowWelcomePopup] = useState(false)
  const [hasShownWelcome, setHasShownWelcome] = useState(false)
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
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
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Mostrar popup de bienvenida cuando el usuario se autentica
      // Pero no en páginas de autenticación (auth, reset-password, forgot-password, error)
      const isAuthPage = pathname?.startsWith('/auth') || pathname === '/'
      
      if (event === 'SIGNED_IN' && session?.user && !hasShownWelcome && !isAuthPage) {
        setShowWelcomePopup(true)
        setHasShownWelcome(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth, pathname])

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      // Resetear el estado del popup de bienvenida
      setShowWelcomePopup(false)
      setHasShownWelcome(false)
      // Redirigir a la landing page después del logout
      router.push('/')
    } catch (error) {
      console.error('Error during sign out:', error)
      // Aún redirigir en caso de error
      router.push('/')
    }
  }

  const handleCloseWelcomePopup = () => {
    setShowWelcomePopup(false)
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
      <WelcomePopup 
        isOpen={showWelcomePopup}
        onClose={handleCloseWelcomePopup}
        userName={user?.user_metadata?.full_name || user?.email?.split('@')[0]}
      />
    </AuthContext.Provider>
  )
}