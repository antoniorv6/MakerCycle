'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import type { User, Session } from '@supabase/supabase-js'
import posthog from 'posthog-js'

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
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const getSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession()
      
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Identify user in PostHog when session is loaded
      if (session?.user) {
        posthog.identify(session.user.id, {
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email,
          created_at: session.user.created_at,
        })
      } else {
        posthog.reset() // Clear identification for anonymous users
      }
    }

    getSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)

      // Handle PostHog identification on auth state changes
      if (event === 'SIGNED_IN' && session?.user) {
        posthog.identify(session.user.id, {
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.email,
          created_at: session.user.created_at,
        })
        posthog.capture('user_signed_in')
      } else if (event === 'SIGNED_OUT') {
        posthog.reset()
        posthog.capture('user_signed_out')
      }
    })

    return () => subscription.unsubscribe()
  }, [supabase.auth])

  const signOut = async () => {
    try {
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