'use client'

import Link from 'next/link'
import { Calculator, TrendingUp, Shield, Zap, Users, BarChart3 } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-lg flex items-center justify-center">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">3D Manager Pro</h1>
                <p className="text-sm text-gray-500">SaaS de Gestión 3D</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/auth"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth"
                className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-md text-sm font-medium"
              >
                Empezar Gratis
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-50 to-blue-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Gestiona tu negocio de
              <span className="text-primary-600"> impresión 3D</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Plataforma profesional para calcular costes, gestionar proyectos y analizar la rentabilidad 
              de tu negocio de impresión 3D. Todo en la nube, seguro y accesible desde cualquier lugar.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth"
                className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-3 rounded-lg text-lg font-medium transition-colors duration-200"
              >
                Comenzar Gratis
              </Link>
              <button className="border border-gray-300 hover:border-gray-400 text-gray-700 px-8 py-3 rounded-lg text-lg font-medium transition-colors duration-200">
                Ver Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Todo lo que necesitas para tu negocio 3D
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Herramientas profesionales diseñadas específicamente para makers y empresas de impresión 3D
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mb-4">
                <Calculator className="w-6 h-6 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Calculadora Avanzada</h3>
              <p className="text-gray-600">
                Calcula costes precisos introduciendo datos manualmente. Incluye filamento, 
                electricidad, materiales y tiempo de impresión.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Análisis de Rentabilidad</h3>
              <p className="text-gray-600">
                Registra ventas, analiza márgenes y obtén insights detallados sobre la rentabilidad 
                de tus proyectos con gráficos avanzados.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <BarChart3 className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Gestión de Proyectos</h3>
              <p className="text-gray-600">
                Organiza y reutiliza tus proyectos. Guarda configuraciones, comparte presupuestos 
                y mantén un historial completo.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Datos Seguros</h3>
              <p className="text-gray-600">
                Tus datos están protegidos con encriptación de nivel empresarial. Acceso desde 
                cualquier dispositivo, siempre sincronizado.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-yellow-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Rápido y Eficiente</h3>
              <p className="text-gray-600">
                Interfaz optimizada para trabajar rápido. Calcula costes en segundos y genera 
                presupuestos profesionales al instante.
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-300">
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Multiusuario</h3>
              <p className="text-gray-600">
                Colabora con tu equipo. Comparte proyectos, asigna permisos y mantén a todos 
                sincronizados en tiempo real.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary-600 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            ¿Listo para profesionalizar tu negocio 3D?
          </h2>
          <p className="text-xl text-primary-100 mb-8 max-w-2xl mx-auto">
            Únete a cientos de makers y empresas que ya optimizan sus costes y maximizan sus beneficios
          </p>
          <Link
            href="/auth"
            className="bg-white hover:bg-gray-100 text-primary-600 px-8 py-3 rounded-lg text-lg font-medium transition-colors duration-200 inline-block"
          >
            Empezar Gratis Ahora
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary-600 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-bold">3D Manager Pro</span>
              </div>
              <p className="text-gray-400">
                La plataforma profesional para gestionar tu negocio de impresión 3D.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Producto</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Características</a></li>
                <li><a href="#" className="hover:text-white">Precios</a></li>
                <li><a href="#" className="hover:text-white">Demo</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Documentación</a></li>
                <li><a href="#" className="hover:text-white">Contacto</a></li>
                <li><a href="#" className="hover:text-white">FAQ</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-4">Empresa</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Sobre nosotros</a></li>
                <li><a href="#" className="hover:text-white">Blog</a></li>
                <li><a href="#" className="hover:text-white">Privacidad</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 3D Manager Pro. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}