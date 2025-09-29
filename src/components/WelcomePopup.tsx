'use client'

import { useState, useEffect } from 'react'
import { X, Github, Coffee, ExternalLink } from 'lucide-react'

interface WelcomePopupProps {
  isOpen: boolean
  onClose: () => void
  userName?: string
}

export default function WelcomePopup({ isOpen, onClose, userName }: WelcomePopupProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (isOpen) {
      // Pequeño delay para la animación
      const timer = setTimeout(() => setIsVisible(true), 100)
      return () => clearTimeout(timer)
    } else {
      setIsVisible(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className={`absolute inset-0 bg-black/50 transition-opacity duration-300 ${
          isVisible ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={onClose}
      />
      
      {/* Modal */}
      <div 
        className={`relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all duration-300 ${
          isVisible 
            ? 'scale-100 opacity-100 translate-y-0' 
            : 'scale-95 opacity-0 translate-y-4'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-slate-700 to-slate-800 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                ¡Bienvenido{userName ? `, ${userName}` : ''}!
              </h2>
              <p className="text-sm text-slate-600">MakerCycle Beta</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-amber-600 text-sm font-bold">β</span>
              </div>
              <div>
                <h3 className="font-semibold text-amber-800 mb-2">
                  MakerCycle está en Beta
                </h3>
                <p className="text-sm text-amber-700 leading-relaxed">
                  Estamos trabajando duro para mejorar la aplicación. Durante esta fase beta, 
                  es posible que encuentres algunos bugs o características en desarrollo.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="font-semibold text-slate-900">¿Cómo puedes ayudar?</h4>
            
            <div className="space-y-3">
              {/* GitHub Issues */}
              <a
                href="https://github.com/antoniorv6/MakerCycle/issues"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 bg-slate-50 hover:bg-slate-100 rounded-xl transition-colors duration-200 group"
              >
                <div className="w-10 h-10 bg-slate-800 rounded-lg flex items-center justify-center group-hover:bg-slate-700 transition-colors duration-200">
                  <Github className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 group-hover:text-slate-700">
                    Reportar bugs en GitHub
                  </p>
                  <p className="text-sm text-slate-600">
                    Ayúdanos a mejorar reportando problemas
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              </a>

              {/* Buy Me a Coffee */}
              <a
                href="https://buymeacoffee.com/3dmaniaconh"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-3 p-3 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors duration-200 group"
              >
                <div className="w-10 h-10 bg-amber-600 rounded-lg flex items-center justify-center group-hover:bg-amber-700 transition-colors duration-200">
                  <Coffee className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-slate-900 group-hover:text-slate-700">
                    Apoya el proyecto
                  </p>
                  <p className="text-sm text-slate-600">
                    Contribuye al desarrollo con Buy Me a Coffee
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-slate-400 group-hover:text-slate-600" />
              </a>
            </div>
          </div>

          <div className="bg-slate-50 rounded-xl p-4">
            <p className="text-sm text-slate-600 text-center">
              ¡Gracias por ser parte de la comunidad MakerCycle! 🚀
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 pb-6">
          <button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white font-medium py-3 px-4 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            ¡Empezar a usar MakerCycle!
          </button>
        </div>
      </div>
    </div>
  )
}
