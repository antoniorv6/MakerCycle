'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { 
  Calculator, 
  Shield, 
  Users, 
  BarChart3, 
  CheckCircle, 
  ArrowRight, 
  Play,
  Globe,
  Sparkles,
  ArrowUpRight,
  Github,
  Code,
  Download,
  Star,
  LayoutGrid,
  Bell
} from 'lucide-react'

export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)
  }, [])

  const features = [
    {
      icon: Calculator,
      title: "Calculadora de Costes 3D",
      description: "Calcula de forma precisa todos los costes de impresión: filamento, electricidad, materiales, tiempo y más.",
      color: "from-slate-600 to-slate-700",
      delay: "0ms"
    },
    {
      icon: BarChart3,
      title: "Contabilidad y Rentabilidad",
      description: "Gestiona ventas, gastos y clientes. Analiza márgenes y optimiza tus precios.",
      color: "from-emerald-700 to-emerald-900",
      delay: "100ms"
    },
    {
      icon: LayoutGrid,
      title: "Organización Kanban",
      description: "Organiza y prioriza tus proyectos con un tablero Kanban intuitivo.",
      color: "from-purple-700 to-slate-800",
      delay: "200ms"
    },
    {
      icon: Users,
      title: "Gestión de Equipos",
      description: "Colabora con tu equipo, asigna roles y controla los permisos de acceso.",
      color: "from-slate-700 to-slate-900",
      delay: "300ms"
    },
    {
      icon: Bell,
      title: "Notificaciones",
      description: "Recibe alertas automáticas sobre cambios y eventos importantes.",
      color: "from-amber-600 to-amber-700",
      delay: "400ms"
    },
    {
      icon: Shield,
      title: "Seguridad",
      description: "Tus datos están protegidos con cifrado y políticas de acceso avanzadas.",
      color: "from-indigo-700 to-indigo-900",
      delay: "500ms"
    }
  ]

  return (
    <div className="min-h-screen-safe bg-white overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 safe-area-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img src="/logo.webp" alt="MakerCycle" className="w-8 h-8 sm:w-10 sm:h-10" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-slate-900">
                  MakerCycle
                </h1>
                <p className="text-xs sm:text-sm text-slate-500 hidden sm:block">Gestión Profesional 3D</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/auth/"
                className="text-slate-600 hover:text-slate-900 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hidden sm:block"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth/"
                className="group bg-gradient-to-r from-slate-700 to-slate-800 text-white px-4 sm:px-6 py-2 rounded-lg text-sm font-medium shadow-lg transition-all duration-300 inline-flex items-center active:scale-95"
              >
                <span className="hidden sm:inline">Empezar Gratis</span>
                <span className="sm:hidden">Empezar</span>
                <ArrowUpRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-slate-50 py-12 sm:py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-3"></div>
        <div className="absolute top-0 left-0 w-48 sm:w-72 h-48 sm:h-72 bg-slate-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 right-0 w-48 sm:w-72 h-48 sm:h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>              
              <div className="inline-flex items-center px-3 sm:px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-xs sm:text-sm font-medium mb-6 sm:mb-8">
                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 mr-2" />
                ¡Profesionaliza tu negocio 3D! 🚀
              </div>
              <h1 className="text-3xl sm:text-5xl md:text-7xl font-bold text-slate-900 mb-4 sm:mb-6 leading-tight px-2">
                Gestión visual y cálculo profesional para
                <span className="bg-gradient-to-r from-purple-700 to-slate-800 bg-clip-text text-transparent"> impresión 3D</span>
              </h1>
              <p className="text-base sm:text-xl md:text-2xl text-slate-600 mb-6 sm:mb-8 max-w-4xl mx-auto leading-relaxed px-4">
                MakerCycle es la suite open source definitiva para makers y empresas: gestiona proyectos, calcula costes y analiza la rentabilidad de tu negocio.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center mb-8 sm:mb-12 px-4">
                <Link
                  href="/auth/"
                  className="group bg-gradient-to-r from-slate-700 to-slate-800 text-white px-6 sm:px-8 py-4 rounded-xl text-base sm:text-lg font-semibold shadow-xl transition-all duration-300 inline-flex items-center justify-center active:scale-95"
                >
                  Comenzar Gratis
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Link>
                <button className="group border-2 border-slate-300 text-slate-700 px-6 sm:px-8 py-4 rounded-xl text-base sm:text-lg font-semibold transition-all duration-300 inline-flex items-center justify-center bg-white/80 backdrop-blur-sm active:scale-95">
                  <Play className="w-5 h-5 mr-2" />
                  Ver Demo
                </button>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 text-xs sm:text-sm text-slate-500 px-4">
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                  Completamente Gratis
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                  Sin tarjeta de crédito
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-4 h-4 mr-2 text-emerald-500" />
                  Configuración rápida
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-slate-900 mb-4 sm:mb-6 px-2">
              Todo lo que necesitas para tu negocio 3D
            </h2>
            <p className="text-base sm:text-xl text-slate-600 max-w-3xl mx-auto px-4">
              Herramientas profesionales para organizar, calcular, analizar y colaborar en tus proyectos.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 transition-all duration-500 active:scale-98"
                style={{ animationDelay: feature.delay }}
              >
                <div className={`w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br ${feature.color} rounded-xl sm:rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg`}>
                  <feature.icon className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-4">{feature.title}</h3>
                <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Source Section */}
      <section className="py-12 sm:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-4 sm:mb-6">
              Open Source y Transparente
            </h2>
            <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto px-4">
              Creemos en la transparencia y la colaboración. Nuestro código está abierto para que puedas ver, contribuir y confiar.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-4 sm:gap-8">
            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 text-center">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Github className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-4">Código Abierto</h3>
              <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6">
                Todo el código está disponible en GitHub bajo licencia MIT.
              </p>
              <a href="https://github.com/antoniorv6/MakerCycle" className="inline-flex items-center text-slate-700 hover:text-slate-900 font-medium text-sm sm:text-base">
                Ver en GitHub
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 text-center">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-xl sm:rounded-2xl flex items-center mx-auto mb-4 sm:mb-6 justify-center">
                <Code className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-4">Contribuye</h3>
              <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6">
                ¿Tienes ideas para mejorar? Contribuye al proyecto.
              </p>
              <a href="https://github.com/antoniorv6/MakerCycle/blob/main/CONTRIBUTING.md" className="inline-flex items-center text-slate-700 hover:text-slate-900 font-medium text-sm sm:text-base">
                Guía de Contribución
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>

            <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-lg border border-slate-200 text-center">
              <div className="w-12 sm:w-16 h-12 sm:h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl sm:rounded-2xl flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <Download className="w-6 sm:w-8 h-6 sm:h-8 text-white" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-slate-900 mb-2 sm:mb-4">Auto-hosting</h3>
              <p className="text-sm sm:text-base text-slate-600 mb-4 sm:mb-6">
                Instala en tu propio servidor para control total.
              </p>
              <a href="#" className="inline-flex items-center text-slate-700 hover:text-slate-900 font-medium text-sm sm:text-base">
                Documentación
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-slate-700 to-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 text-center">
            <div className="text-white">
              <div className="text-2xl sm:text-4xl font-bold mb-2">100%</div>
              <div className="text-sm sm:text-base text-slate-200">Open Source</div>
            </div>
            <div className="text-white">
              <div className="text-2xl sm:text-4xl font-bold mb-2">MIT</div>
              <div className="text-sm sm:text-base text-slate-200">Licencia</div>
            </div>
            <div className="text-white">
              <div className="text-2xl sm:text-4xl font-bold mb-2">24/7</div>
              <div className="text-sm sm:text-base text-slate-200">Comunidad</div>
            </div>
            <div className="text-white">
              <div className="text-2xl sm:text-4xl font-bold mb-2">∞</div>
              <div className="text-sm sm:text-base text-slate-200">Posibilidades</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-12 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-bold text-slate-900 mb-4 sm:mb-6">
              MakerCycle es gratis para todos
            </h2>
            <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto px-4">
              Todas las funcionalidades son gratuitas y open source. Si quieres apoyar el proyecto, puedes invitarme a un café ☕️
            </p>
            <div className="mt-6 sm:mt-8 flex justify-center gap-3 sm:gap-4 flex-col sm:flex-row px-4">
              <Link
                href="/auth/"
                className="inline-flex items-center justify-center bg-gradient-to-r from-slate-700 to-slate-800 text-white px-6 sm:px-8 py-4 rounded-xl text-base sm:text-lg font-semibold shadow-xl transition-all duration-300 active:scale-95"
              >
                Empezar Gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <a
                href="https://coff.ee/3dmaniaconh"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold px-6 sm:px-8 py-4 rounded-xl shadow-lg transition-all duration-300 text-base sm:text-lg active:scale-95"
              >
                <Star className="w-5 h-5 mr-2" />
                Invítame a un café
              </a>
            </div>
          </div>
          <div className="max-w-2xl mx-auto px-4">
            <ul className="space-y-3 sm:space-y-4 text-base sm:text-lg text-slate-700">
              <li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" /> Proyectos ilimitados</li>
              <li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" /> Calculadora avanzada de costes</li>
              <li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" /> Contabilidad y análisis</li>
              <li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" /> Gestión de clientes</li>
              <li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" /> Equipos colaborativos</li>
              <li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" /> Notificaciones inteligentes</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 bg-gradient-to-r from-slate-700 to-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold text-white mb-4 sm:mb-6 px-2">
            ¿Listo para profesionalizar tu negocio 3D?
          </h2>
          <p className="text-base sm:text-xl text-slate-200 mb-6 sm:mb-8 max-w-3xl mx-auto px-4">
            Únete a la comunidad de makers. Es completamente gratis.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center px-4">
            <Link
              href="/auth/"
              className="group bg-white text-slate-700 px-6 sm:px-8 py-4 rounded-xl text-base sm:text-lg font-semibold shadow-xl transition-all duration-300 inline-flex items-center justify-center active:scale-95"
            >
              Empezar Gratis Ahora
              <ArrowRight className="w-5 h-5 ml-2" />
            </Link>
            <a
              href="https://github.com/antoniorv6/MakerCycle"
              className="group border-2 border-white/20 text-white px-6 sm:px-8 py-4 rounded-xl text-base sm:text-lg font-semibold transition-all duration-300 inline-flex items-center justify-center active:scale-95"
            >
              <Github className="w-5 h-5 mr-2" />
              Ver en GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-12 sm:py-16 safe-area-bottom">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-3 mb-4 sm:mb-6">
                <img src="/logo.webp" alt="MakerCycle" className="w-8 h-8" />
                <span className="text-lg sm:text-xl font-bold">MakerCycle</span>
              </div>
              <p className="text-sm sm:text-base text-slate-400 mb-4 sm:mb-6">
                Calculadora de costes y gestor de proyectos para impresión 3D. Open source y colaborativa.
              </p>
              <div className="flex space-x-4">
                <a href="https://github.com/antoniorv6/MakerCycle" className="text-slate-400 hover:text-white transition-colors duration-200">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="text-slate-400 hover:text-white transition-colors duration-200">
                  <Globe className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Producto</h3>
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Demo</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Desarrollo</h3>
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-slate-400">
                <li><a href="https://github.com/antoniorv6/MakerCycle" className="hover:text-white transition-colors duration-200">Documentación</a></li>
                <li><a href="https://github.com/antoniorv6/MakerCycle/blob/main/CONTRIBUTING.md" className="hover:text-white transition-colors duration-200">Contribuir</a></li>
                <li><a href="https://github.com/antoniorv6/MakerCycle/issues" className="hover:text-white transition-colors duration-200">Issues</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-base sm:text-lg font-semibold mb-4 sm:mb-6">Legal</h3>
              <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base text-slate-400">
                <li><a href="/legal/aviso-legal/" className="hover:text-white transition-colors duration-200">Aviso Legal</a></li>
                <li><a href="/legal/privacidad/" className="hover:text-white transition-colors duration-200">Privacidad</a></li>
                <li><a href="/legal/cookies/" className="hover:text-white transition-colors duration-200">Cookies</a></li>
                <li><a href="/legal/terminos/" className="hover:text-white transition-colors duration-200">Términos</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-8 sm:mt-12 pt-6 sm:pt-8 text-center text-sm sm:text-base text-slate-400">
            <p>&copy; 2024 MakerCycle. Open Source bajo licencia MIT.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
