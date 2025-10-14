'use client'

import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'

export default function Header() {
  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center space-x-3">
            <Link href="/" className="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  MakerCycle
                </h1>
                <p className="text-sm text-slate-500">Calculadora y Gestión Profesional de Impresión 3D</p>
              </div>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <Link
              href="/auth"
              className="text-slate-600 hover:text-slate-900 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-slate-100"
            >
              Iniciar Sesión
            </Link>
            <Link
              href="/auth"
              className="group bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white px-6 py-2 rounded-lg text-sm font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 inline-flex items-center"
            >
              Empezar Gratis
              <ArrowUpRight className="w-4 h-4 ml-1 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform duration-200" />
            </Link>
          </div>
        </div>
      </div>
    </header>
  )
}
