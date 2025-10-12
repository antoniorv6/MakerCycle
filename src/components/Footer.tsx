'use client'

import React from 'react'
import Link from 'next/link'
import { usesNonEssentialCookies } from '@/utils/cookieConsent'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const responsibleName = 'Adrián Burnao González de la Aleja'
  const licenseName = 'Apache 2.0'

  const handleCookieSettings = () => {
    // This would open the cookie settings modal when usesNonEssentialCookies is true
    // For now, just show an alert since the banner is disabled
    if (usesNonEssentialCookies) {
    } else {
      alert('Actualmente solo utilizamos cookies técnicas necesarias para el funcionamiento del servicio.')
    }
  }

  return (
    <footer className="bg-slate-900 text-slate-300 py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <div className="text-sm">
            © {currentYear} {responsibleName} — {licenseName}
          </div>
          
          <nav className="flex flex-wrap justify-center md:justify-end space-x-6 text-sm">
            <Link 
              href="/legal/aviso-legal" 
              className="hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded"
            >
              Aviso legal
            </Link>
            <Link 
              href="/legal/privacidad" 
              className="hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded"
            >
              Privacidad
            </Link>
            <Link 
              href="/legal/cookies" 
              className="hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded"
            >
              Cookies
            </Link>
            <Link 
              href="/legal/terminos" 
              className="hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded"
            >
              Términos
            </Link>
            <Link 
              href="/legal/seguridad" 
              className="hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded"
            >
              Seguridad
            </Link>
            <button 
              onClick={handleCookieSettings}
              className="hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-offset-2 focus:ring-offset-slate-900 rounded"
            >
              Configurar cookies
            </button>
          </nav>
        </div>
      </div>
    </footer>
  )
}
