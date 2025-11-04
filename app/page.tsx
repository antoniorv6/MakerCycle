import { createServerSupabaseClient } from '@/lib/supabase'
import { redirect } from 'next/navigation'
import LandingPage from '@/components/LandingPage'

// Forzar renderizado dinámico para evitar problemas durante el build
export const dynamic = 'force-dynamic'

export default async function Home() {
  // Añadir await aquí - createServerSupabaseClient() ahora es async
  const supabase = await createServerSupabaseClient()
  
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (session) {
    redirect('/dashboard')
  }

  return <LandingPage />
}