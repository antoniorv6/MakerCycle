'use client'

import React, { useState, useEffect } from 'react'
import { usesNonEssentialCookies, shouldShowBanner, onAcceptAll, onRejectAll, onSaveCustom, type CookiePreferences } from '@/utils/cookieConsent'
import { Capacitor } from '@capacitor/core'

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    analytics: false,
    marketing: false,
    functional: false
  })

  useEffect(() => {
    // Don't show cookie banner on native apps (handled differently)
    if (Capacitor.isNativePlatform()) {
      return
    }
    
    if (usesNonEssentialCookies && shouldShowBanner()) {
      setShowBanner(true)
    }
  }, [])

  const handleAcceptAll = () => {
    onAcceptAll()
    setShowBanner(false)
  }

  const handleRejectAll = () => {
    onRejectAll()
    setShowBanner(false)
  }

  const handleConfigure = () => {
    setShowSettings(true)
  }

  const handleSaveCustom = () => {
    onSaveCustom(preferences)
    setShowBanner(false)
    setShowSettings(false)
  }

  const handlePreferenceChange = (category: keyof CookiePreferences) => {
    setPreferences(prev => ({
      ...prev,
      [category]: !prev[category]
    }))
  }

  if (!showBanner) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-dark-900 text-white p-4 sm:p-6 z-50 shadow-lg safe-area-bottom border-t border-dark-800">
      <div className="max-w-6xl mx-auto">
        {!showSettings ? (
          <div className="flex flex-col space-y-4">
            <div className="flex-1">
              <h3 className="text-base sm:text-lg font-semibold mb-2">Uso de cookies</h3>
              <p className="text-cream-300 text-xs sm:text-sm">
                Utilizamos cookies para mejorar tu experiencia. Puedes aceptar todas, rechazar las no esenciales o configurar tus preferencias.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleRejectAll}
                className="px-4 py-3 sm:py-2 bg-dark-700 hover:bg-dark-600 active:bg-dark-500 rounded-xl sm:rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium"
              >
                Rechazar
              </button>
              <button
                onClick={handleConfigure}
                className="px-4 py-3 sm:py-2 bg-cream-700 hover:bg-cream-600 active:bg-cream-500 rounded-xl sm:rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium text-dark-900"
              >
                Configurar
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-3 sm:py-2 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 rounded-xl sm:rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm font-medium shadow-brand"
              >
                Aceptar todo
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold">Configuración de cookies</h3>
            <div className="space-y-3 max-h-[50vh] overflow-y-auto">
              <div className="flex items-center justify-between py-2">
                <div className="flex-1 mr-4">
                  <h4 className="font-medium text-sm sm:text-base">Cookies técnicas</h4>
                  <p className="text-xs sm:text-sm text-cream-300">Necesarias para el funcionamiento básico</p>
                </div>
                <div className="text-cream-400 text-xs sm:text-sm whitespace-nowrap">Siempre activas</div>
              </div>
              
              <div className="flex items-center justify-between py-2">
                <div className="flex-1 mr-4">
                  <h4 className="font-medium text-sm sm:text-base">Cookies de análisis</h4>
                  <p className="text-xs sm:text-sm text-cream-300">Nos ayudan a entender cómo usas el sitio</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={() => handlePreferenceChange('analytics')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-cream-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex-1 mr-4">
                  <h4 className="font-medium text-sm sm:text-base">Cookies de marketing</h4>
                  <p className="text-xs sm:text-sm text-cream-300">Para personalizar anuncios y contenido</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={() => handlePreferenceChange('marketing')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-cream-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                </label>
              </div>

              <div className="flex items-center justify-between py-2">
                <div className="flex-1 mr-4">
                  <h4 className="font-medium text-sm sm:text-base">Cookies funcionales</h4>
                  <p className="text-xs sm:text-sm text-cream-300">Mejoran la funcionalidad del sitio</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                  <input
                    type="checkbox"
                    checked={preferences.functional}
                    onChange={() => handlePreferenceChange('functional')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-dark-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-brand-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-cream-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-brand-500"></div>
                </label>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-3 sm:py-2 bg-dark-700 hover:bg-dark-600 active:bg-dark-500 rounded-xl sm:rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-sm font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCustom}
                className="px-4 py-3 sm:py-2 bg-brand-500 hover:bg-brand-600 active:bg-brand-700 rounded-xl sm:rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-400 text-sm font-medium shadow-brand"
              >
                Guardar preferencias
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
