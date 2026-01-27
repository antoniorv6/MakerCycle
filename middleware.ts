import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

export async function middleware(req: NextRequest) {
  // Verificar si el modo mantenimiento está activo
  const maintenanceMode = process.env.MAINTENANCE_MODE === 'true'
  
  // Si el modo mantenimiento está activo y no estamos ya en la página de mantenimiento,
  // redirigir a la página de mantenimiento
  if (maintenanceMode && req.nextUrl.pathname !== '/maintenance') {
    return NextResponse.redirect(new URL('/maintenance', req.url))
  }

  // Si estamos en modo mantenimiento y ya estamos en /maintenance, permitir el acceso
  if (maintenanceMode && req.nextUrl.pathname === '/maintenance') {
    return NextResponse.next()
  }

  const res = NextResponse.next()
  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return req.cookies.getAll()
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          req.cookies.set(name, value)
        })
      },
    },
  })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Permitir acceso público a /legal/* y rutas de autenticación
  if (req.nextUrl.pathname.startsWith('/legal/') || 
      req.nextUrl.pathname.startsWith('/auth/forgot-password') ||
      req.nextUrl.pathname.startsWith('/auth/reset-password') ||
      req.nextUrl.pathname.startsWith('/auth/error')) {
    return res;
  }

  // If user is not signed in and the current path is not /auth or /, redirect to /auth
  if (!session && req.nextUrl.pathname !== '/auth' && req.nextUrl.pathname !== '/') {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  // If user is signed in and the current path is /auth or /, redirect to /dashboard
  if (session && (req.nextUrl.pathname === '/auth' || req.nextUrl.pathname === '/')) {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}