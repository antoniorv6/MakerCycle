import './globals.css'
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { AuthProvider } from '@/components/providers/AuthProvider'
import { TeamProvider } from '@/components/providers/TeamProvider'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'MakerCycle - Calculadora de Costes y Gestor de Proyectos de Impresión 3D',
  description: 'MakerCycle es la plataforma profesional definitiva para calcular costes, gestionar proyectos y optimizar la rentabilidad de tu negocio de impresión 3D. Open source, colaborativa y segura.',
  keywords: [
    'calculadora de costes impresión 3D',
    'gestor de proyectos impresión 3D',
    'software impresión 3D',
    'MakerCycle',
    'cost calculator 3D printing',
    'gestión impresión 3D',
    'presupuestos impresión 3D',
    'open source impresión 3D',
    'colaboración impresión 3D',
    'negocio impresión 3D'
  ],
  openGraph: {
    title: 'MakerCycle - Calculadora de Costes y Gestor de Proyectos de Impresión 3D',
    description: 'MakerCycle es la plataforma profesional definitiva para calcular costes, gestionar proyectos y optimizar la rentabilidad de tu negocio de impresión 3D.',
    url: 'https://makercycle.com',
    siteName: 'MakerCycle',
    images: [
      {
        url: '/logo.webp',
        width: 512,
        height: 512,
        alt: 'Logo MakerCycle',
      },
    ],
    locale: 'es_ES',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MakerCycle - Calculadora de Costes y Gestor de Proyectos de Impresión 3D',
    description: 'MakerCycle es la plataforma profesional definitiva para calcular costes, gestionar proyectos y optimizar la rentabilidad de tu negocio de impresión 3D.',
    images: ['/logo.webp'],
    site: '@makercycle',
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
  alternates: {
    canonical: 'https://makercycle.com',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="icon" href="/logo.webp" type="image/webp" />
        <meta name="theme-color" content="#1e293b" />
        <meta name="author" content="MakerCycle" />
        <meta name="copyright" content="2024 MakerCycle" />
        <meta property="og:image" content="/logo.webp" />
        <meta property="og:type" content="website" />
        <meta property="og:locale" content="es_ES" />
        <meta property="og:site_name" content="MakerCycle" />
        <meta name="twitter:image" content="/logo.webp" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MakerCycle - Calculadora de Costes y Gestor de Proyectos de Impresión 3D" />
        <meta name="twitter:description" content="MakerCycle es la plataforma profesional definitiva para calcular costes, gestionar proyectos y optimizar la rentabilidad de tu negocio de impresión 3D." />
        <meta name="twitter:site" content="@makercycle" />
        <link rel="canonical" href="https://makercycle.com" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <TeamProvider>
            {children}
          </TeamProvider>
        </AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#363636',
              color: '#fff',
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