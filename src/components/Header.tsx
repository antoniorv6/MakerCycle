'use client'

import Link from 'next/link'
import { ArrowUpRight, Zap } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white/90 backdrop-blur-xl border-b border-cream-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-90 transition-opacity">
              <img src="/logo.svg" alt="MakerCycle" className="w-10 h-10" />
              <div>
                <h1 className="text-xl font-bold text-dark-900 font-display">
                  MakerCycle
                </h1>
                <p className="text-sm text-dark-500">Calculadora y Gestión Profesional de Impresión 3D</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/auth"
              className="text-dark-600 hover:text-brand-500 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-cream-100"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/auth"
              className="group bg-brand-gradient text-white px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 transform hover:shadow-xl inline-flex items-center active:scale-95"
            >
              <Zap className="w-4 h-4 mr-1.5" />
              Empezar Gratis
              <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
