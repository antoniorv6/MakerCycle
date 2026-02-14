import './globals.css'
import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { TeamProvider } from '@/components/providers/TeamProvider'
import { CurrencyProvider } from '@/components/providers/CurrencyProvider'
import { CapacitorProvider } from '@/components/providers/CapacitorProvider'
import { QueryClientProvider } from '@/components/providers/QueryClientProvider'
import { Toaster } from 'react-hot-toast'
import CookieBanner from '@/components/CookieBanner'

const inter = Inter({ subsets: ['latin'] })

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#ef2a1f', // MakerCycle brand red
}

export const metadata: Metadata = {
  title: 'MakerCycle - Calculadora de Costes y Gestor de Proyectos 3D',
  description: 'MakerCycle es la plataforma profesional definitiva para calcular costes, gestionar proyectos y optimizar la rentabilidad de tu negocio de impresión 3D.',
  keywords: [
    'calculadora de costes impresión 3D',
    'gestor de proyectos impresión 3D',
    'software impresión 3D',
    'MakerCycle',
  ],
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'MakerCycle',
  },
  formatDetection: {
    telephone: false,
  },
  manifest: '/manifest.json',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="icon" href="/logo.webp" type="image/webp" />
        <link rel="apple-touch-icon" href="/logo.webp" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`${inter.className} h-full antialiased`}>
        <QueryClientProvider>
          <CapacitorProvider>
            <AuthProvider>
              <CurrencyProvider>
                <TeamProvider>
                  <div className="min-h-screen-safe flex flex-col">
                    <main className="flex-1">
                      {children}
                    </main>
                  </div>
                </TeamProvider>
              </CurrencyProvider>
            </AuthProvider>
          </CapacitorProvider>
        </QueryClientProvider>
        <CookieBanner />
        <Toaster
          position="top-center"
          containerStyle={{
            top: 'calc(env(safe-area-inset-top, 0px) + 60px)',
          }}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
              borderRadius: '12px',
              padding: '12px 16px',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 5000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />
      </body>
    </html>
  )
}
