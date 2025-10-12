'use client'

import React, { useState, useEffect } from 'react'
import { usesNonEssentialCookies, shouldShowBanner, onAcceptAll, onRejectAll, onSaveCustom, type CookiePreferences } from '@/utils/cookieConsent'

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    analytics: false,
    marketing: false,
    functional: false
  })

  useEffect(() => {
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
    <div className="fixed bottom-0 left-0 right-0 bg-slate-900 text-white p-6 z-50 shadow-lg">
      <div className="max-w-6xl mx-auto">
        {!showSettings ? (
          <div className="flex flex-col md:flex-row items-center justify-between space-y-4 md:space-y-0">
            <div className="flex-1">
              <h3 className="text-lg font-semibold mb-2">Uso de cookies</h3>
              <p className="text-slate-300 text-sm">
                Utilizamos cookies para mejorar tu experiencia. Puedes aceptar todas, rechazar las no esenciales o configurar tus preferencias.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
              <button
                onClick={handleRejectAll}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                Rechazar
              </button>
              <button
                onClick={handleConfigure}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                Configurar
              </button>
              <button
                onClick={handleAcceptAll}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Aceptar
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Configuración de cookies</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Cookies técnicas</h4>
                  <p className="text-sm text-slate-300">Necesarias para el funcionamiento básico del sitio</p>
                </div>
                <div className="text-slate-400 text-sm">Siempre activas</div>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Cookies de análisis</h4>
                  <p className="text-sm text-slate-300">Nos ayudan a entender cómo usas el sitio</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={() => handlePreferenceChange('analytics')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Cookies de marketing</h4>
                  <p className="text-sm text-slate-300">Para personalizar anuncios y contenido</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={() => handlePreferenceChange('marketing')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium">Cookies funcionales</h4>
                  <p className="text-sm text-slate-300">Mejoran la funcionalidad del sitio</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.functional}
                    onChange={() => handlePreferenceChange('functional')}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-slate-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </div>
            
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4 pt-4">
              <button
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-slate-500"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveCustom}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
