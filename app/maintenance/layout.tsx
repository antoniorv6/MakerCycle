import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import '../globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Mantenimiento - MakerCycle',
  description: 'MakerCycle está en mantenimiento',
  robots: {
    index: false,
    follow: false,
  },
}

export default function MaintenanceLayout({
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
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}
