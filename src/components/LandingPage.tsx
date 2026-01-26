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
  Bell,
  Zap,
  Target,
  TrendingUp
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
      color: "from-brand-500 to-coral-500",
      iconBg: "bg-brand-500"
    },
    {
      icon: BarChart3,
      title: "Contabilidad y Rentabilidad",
      description: "Gestiona ventas, gastos y clientes. Analiza márgenes y optimiza tus precios.",
      color: "from-success-500 to-success-700",
      iconBg: "bg-success-500"
    },
    {
      icon: LayoutGrid,
      title: "Organización Kanban",
      description: "Organiza y prioriza tus proyectos con un tablero Kanban intuitivo.",
      color: "from-purple-600 to-purple-800",
      iconBg: "bg-purple-600"
    },
    {
      icon: Users,
      title: "Gestión de Equipos",
      description: "Colabora con tu equipo, asigna roles y controla los permisos de acceso.",
      color: "from-dark-800 to-dark-950",
      iconBg: "bg-dark-900"
    },
    {
      icon: Bell,
      title: "Notificaciones",
      description: "Recibe alertas automáticas sobre cambios y eventos importantes.",
      color: "from-warning-500 to-warning-700",
      iconBg: "bg-warning-500"
    },
    {
      icon: Shield,
      title: "Seguridad",
      description: "Tus datos están protegidos con cifrado y políticas de acceso avanzadas.",
      color: "from-coral-500 to-brand-600",
      iconBg: "bg-coral-500"
    }
  ]

  return (
    <div className="min-h-screen-safe bg-cream-50 overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-cream-200 safe-area-top">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-3 sm:py-4">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <img src="/logo.svg" alt="MakerCycle" className="w-12 h-12 sm:w-16 sm:h-16" />
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-dark-900 font-display">
                  MakerCycle
                </h1>
                <p className="text-xs sm:text-sm text-dark-500 hidden sm:block">Gestión Profesional 3D</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/auth/"
                className="text-dark-600 hover:text-brand-500 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 hidden sm:block"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth/"
                className="group bg-brand-gradient text-white px-4 sm:px-6 py-2.5 rounded-xl text-sm font-semibold shadow-lg transition-all duration-300 inline-flex items-center active:scale-95 hover:shadow-xl"
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
      <section className="relative bg-cream-gradient py-16 sm:py-24 lg:py-36 overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 bg-grid-pattern opacity-30"></div>
        <div className="absolute top-20 left-10 w-64 sm:w-96 h-64 sm:h-96 bg-brand-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
        <div className="absolute top-40 right-10 w-64 sm:w-96 h-64 sm:h-96 bg-coral-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-20 left-1/3 w-64 sm:w-80 h-64 sm:h-80 bg-brand-400 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>              
              <div className="inline-flex items-center px-4 sm:px-5 py-2.5 rounded-full bg-white/80 backdrop-blur-sm text-dark-700 text-xs sm:text-sm font-medium mb-8 sm:mb-10 shadow-sm border border-cream-200">
                <Sparkles className="w-4 h-4 mr-2 text-brand-500" />
                ¡Profesionaliza tu negocio 3D! 🚀
              </div>
              
              <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold text-dark-900 mb-6 sm:mb-8 leading-tight px-2 font-display">
                Gestión visual y cálculo profesional para
                <span className="gradient-text-brand"> impresión 3D</span>
              </h1>
              
              <p className="text-lg sm:text-xl md:text-2xl text-dark-600 mb-8 sm:mb-10 max-w-4xl mx-auto leading-relaxed px-4">
                MakerCycle es la suite <span className="text-brand-500 font-semibold">open source</span> definitiva para makers y empresas: gestiona proyectos, calcula costes y analiza la rentabilidad de tu negocio.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center mb-10 sm:mb-14 px-4">
                <Link
                  href="/auth/"
                  className="group bg-brand-gradient text-white px-8 sm:px-10 py-4 rounded-2xl text-base sm:text-lg font-bold shadow-xl transition-all duration-300 inline-flex items-center justify-center active:scale-95 hover:shadow-2xl brand-hover"
                >
                  <Zap className="w-5 h-5 mr-2" />
                  Comenzar Gratis
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button className="group border-2 border-cream-300 text-dark-700 px-8 sm:px-10 py-4 rounded-2xl text-base sm:text-lg font-semibold transition-all duration-300 inline-flex items-center justify-center bg-white shadow-md active:scale-95 hover:border-brand-300 hover:bg-cream-50 hover:shadow-lg">
                  <Play className="w-5 h-5 mr-2 text-brand-500" />
                  Ver Demo
                </button>
              </div>
              
              <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-sm sm:text-base text-dark-600 px-4">
                <div className="flex items-center bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full">
                  <CheckCircle className="w-5 h-5 mr-2 text-success-500" />
                  Completamente Gratis
                </div>
                <div className="flex items-center bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full">
                  <CheckCircle className="w-5 h-5 mr-2 text-success-500" />
                  Sin tarjeta de crédito
                </div>
                <div className="flex items-center bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full">
                  <CheckCircle className="w-5 h-5 mr-2 text-success-500" />
                  Configuración rápida
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-brand-50 text-brand-600 text-sm font-medium mb-6">
              <Target className="w-4 h-4 mr-2" />
              Funcionalidades
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-dark-900 mb-6 sm:mb-8 px-2 font-display">
              Todo lo que necesitas para tu negocio 3D
            </h2>
            <p className="text-lg sm:text-xl text-dark-500 max-w-3xl mx-auto px-4">
              Herramientas profesionales para organizar, calcular, analizar y colaborar en tus proyectos.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white p-6 sm:p-8 rounded-3xl shadow-lg border border-cream-200 transition-all duration-500 active:scale-98 hover:shadow-2xl hover:border-brand-200 hover:-translate-y-1"
              >
                <div className={`w-14 sm:w-16 h-14 sm:h-16 ${feature.iconBg} rounded-2xl flex items-center justify-center mb-5 sm:mb-6 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="w-7 sm:w-8 h-7 sm:h-8 text-white" />
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-dark-900 mb-3 sm:mb-4 font-display">{feature.title}</h3>
                <p className="text-base sm:text-lg text-dark-500 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Source Section */}
      <section className="py-16 sm:py-24 bg-cream-gradient">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-20">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-dark-900 text-white text-sm font-medium mb-6">
              <Code className="w-4 h-4 mr-2" />
              Open Source
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-dark-900 mb-6 sm:mb-8 font-display">
              Open Source y Transparente
            </h2>
            <p className="text-lg sm:text-xl text-dark-500 max-w-2xl mx-auto px-4">
              Creemos en la transparencia y la colaboración. Nuestro código está abierto para que puedas ver, contribuir y confiar.
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6 sm:gap-8">
            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-cream-200 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 sm:w-20 h-16 sm:h-20 bg-dark-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 sm:mb-8">
                <Github className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-dark-900 mb-3 sm:mb-4 font-display">Código Abierto</h3>
              <p className="text-base sm:text-lg text-dark-500 mb-6 sm:mb-8">
                Todo el código está disponible en GitHub bajo licencia MIT.
              </p>
              <a href="https://github.com/antoniorv6/MakerCycle" className="inline-flex items-center text-brand-500 hover:text-brand-600 font-semibold text-base sm:text-lg group">
                Ver en GitHub
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-cream-200 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 sm:w-20 h-16 sm:h-20 bg-success-500 rounded-2xl flex items-center mx-auto mb-6 sm:mb-8 justify-center">
                <Code className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-dark-900 mb-3 sm:mb-4 font-display">Contribuye</h3>
              <p className="text-base sm:text-lg text-dark-500 mb-6 sm:mb-8">
                ¿Tienes ideas para mejorar? Contribuye al proyecto.
              </p>
              <a href="https://github.com/antoniorv6/MakerCycle/blob/main/CONTRIBUTING.md" className="inline-flex items-center text-brand-500 hover:text-brand-600 font-semibold text-base sm:text-lg group">
                Guía de Contribución
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

            <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl border border-cream-200 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
              <div className="w-16 sm:w-20 h-16 sm:h-20 bg-brand-gradient rounded-2xl flex items-center justify-center mx-auto mb-6 sm:mb-8">
                <Download className="w-8 sm:w-10 h-8 sm:h-10 text-white" />
              </div>
              <h3 className="text-xl sm:text-2xl font-bold text-dark-900 mb-3 sm:mb-4 font-display">Auto-hosting</h3>
              <p className="text-base sm:text-lg text-dark-500 mb-6 sm:mb-8">
                Instala en tu propio servidor para control total.
              </p>
              <a href="#" className="inline-flex items-center text-brand-500 hover:text-brand-600 font-semibold text-base sm:text-lg group">
                Documentación
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-24 bg-dark-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-dots-pattern opacity-20"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-brand-500 rounded-full filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-coral-500 rounded-full filter blur-3xl opacity-10"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 sm:gap-12 text-center">
            <div className="text-white">
              <div className="text-4xl sm:text-5xl font-bold mb-3 font-display text-brand-400">100%</div>
              <div className="text-base sm:text-lg text-cream-300">Open Source</div>
            </div>
            <div className="text-white">
              <div className="text-4xl sm:text-5xl font-bold mb-3 font-display text-brand-400">MIT</div>
              <div className="text-base sm:text-lg text-cream-300">Licencia</div>
            </div>
            <div className="text-white">
              <div className="text-4xl sm:text-5xl font-bold mb-3 font-display text-brand-400">24/7</div>
              <div className="text-base sm:text-lg text-cream-300">Comunidad</div>
            </div>
            <div className="text-white">
              <div className="text-4xl sm:text-5xl font-bold mb-3 font-display text-brand-400">∞</div>
              <div className="text-base sm:text-lg text-cream-300">Posibilidades</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-16 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-success-50 text-success-600 text-sm font-medium mb-6">
              <TrendingUp className="w-4 h-4 mr-2" />
              Gratis para siempre
            </div>
            <h2 className="text-3xl sm:text-4xl font-bold text-dark-900 mb-6 sm:mb-8 font-display">
              MakerCycle es gratis para todos
            </h2>
            <p className="text-lg sm:text-xl text-dark-500 max-w-2xl mx-auto px-4">
              Todas las funcionalidades son gratuitas y open source. Si quieres apoyar el proyecto, puedes invitarme a un café ☕️
            </p>
            <div className="mt-8 sm:mt-10 flex justify-center gap-4 sm:gap-5 flex-col sm:flex-row px-4">
              <Link
                href="/auth/"
                className="inline-flex items-center justify-center bg-brand-gradient text-white px-8 sm:px-10 py-4 rounded-2xl text-base sm:text-lg font-bold shadow-xl transition-all duration-300 active:scale-95 hover:shadow-2xl"
              >
                <Zap className="w-5 h-5 mr-2" />
                Empezar Gratis
                <ArrowRight className="w-5 h-5 ml-2" />
              </Link>
              <a
                href="https://coff.ee/3dmaniaconh"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center bg-warning-400 hover:bg-warning-500 text-dark-900 font-bold px-8 sm:px-10 py-4 rounded-2xl shadow-lg transition-all duration-300 text-base sm:text-lg active:scale-95"
              >
                <Star className="w-5 h-5 mr-2" />
                Invítame a un café
              </a>
            </div>
          </div>
          <div className="max-w-2xl mx-auto px-4">
            <div className="bg-cream-gradient p-8 sm:p-10 rounded-3xl border border-cream-200">
              <ul className="space-y-4 sm:space-y-5 text-base sm:text-lg text-dark-700">
                <li className="flex items-center"><CheckCircle className="w-6 h-6 text-success-500 mr-4 flex-shrink-0" /> Proyectos ilimitados</li>
                <li className="flex items-center"><CheckCircle className="w-6 h-6 text-success-500 mr-4 flex-shrink-0" /> Calculadora avanzada de costes</li>
                <li className="flex items-center"><CheckCircle className="w-6 h-6 text-success-500 mr-4 flex-shrink-0" /> Contabilidad y análisis</li>
                <li className="flex items-center"><CheckCircle className="w-6 h-6 text-success-500 mr-4 flex-shrink-0" /> Gestión de clientes</li>
                <li className="flex items-center"><CheckCircle className="w-6 h-6 text-success-500 mr-4 flex-shrink-0" /> Equipos colaborativos</li>
                <li className="flex items-center"><CheckCircle className="w-6 h-6 text-success-500 mr-4 flex-shrink-0" /> Notificaciones inteligentes</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 sm:py-24 bg-brand-gradient relative overflow-hidden">
        <div className="absolute inset-0 bg-dots-pattern opacity-10"></div>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl opacity-10"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-coral-600 rounded-full filter blur-3xl opacity-20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-6 sm:mb-8 px-2 font-display">
            ¿Listo para profesionalizar tu negocio 3D?
          </h2>
          <p className="text-lg sm:text-xl text-white/90 mb-8 sm:mb-10 max-w-3xl mx-auto px-4">
            Únete a la comunidad de makers. Es completamente gratis.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 justify-center px-4">
            <Link
              href="/auth/"
              className="group bg-white text-brand-500 px-8 sm:px-10 py-4 rounded-2xl text-base sm:text-lg font-bold shadow-xl transition-all duration-300 inline-flex items-center justify-center active:scale-95 hover:shadow-2xl hover:bg-cream-50"
            >
              <Zap className="w-5 h-5 mr-2" />
              Empezar Gratis Ahora
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
            </Link>
            <a
              href="https://github.com/antoniorv6/MakerCycle"
              className="group border-2 border-white/80 text-white px-8 sm:px-10 py-4 rounded-2xl text-base sm:text-lg font-semibold transition-all duration-300 inline-flex items-center justify-center active:scale-95 hover:bg-white/20 hover:border-white shadow-lg hover:shadow-xl"
            >
              <Github className="w-5 h-5 mr-2" />
              Ver en GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-dark-900 text-white py-16 sm:py-20 safe-area-bottom">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-12">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <img src="/logo.svg" alt="MakerCycle" className="w-14 h-14" />
                <span className="text-xl sm:text-2xl font-bold font-display">MakerCycle</span>
              </div>
              <p className="text-base text-cream-400 mb-6">
                Calculadora de costes y gestor de proyectos para impresión 3D. Open source y colaborativa.
              </p>
              <div className="flex space-x-4">
                <a href="https://github.com/antoniorv6/MakerCycle" className="w-10 h-10 bg-dark-800 rounded-lg flex items-center justify-center text-cream-400 hover:text-brand-400 hover:bg-dark-700 transition-all duration-200">
                  <Github className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 bg-dark-800 rounded-lg flex items-center justify-center text-cream-400 hover:text-brand-400 hover:bg-dark-700 transition-all duration-200">
                  <Globe className="w-5 h-5" />
                </a>
              </div>
            </div>
            
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-6 font-display">Producto</h3>
              <ul className="space-y-3 sm:space-y-4 text-base text-cream-400">
                <li><a href="#" className="hover:text-brand-400 transition-colors duration-200">Características</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors duration-200">Demo</a></li>
                <li><a href="#" className="hover:text-brand-400 transition-colors duration-200">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-6 font-display">Desarrollo</h3>
              <ul className="space-y-3 sm:space-y-4 text-base text-cream-400">
                <li><a href="https://github.com/antoniorv6/MakerCycle" className="hover:text-brand-400 transition-colors duration-200">Documentación</a></li>
                <li><a href="https://github.com/antoniorv6/MakerCycle/blob/main/CONTRIBUTING.md" className="hover:text-brand-400 transition-colors duration-200">Contribuir</a></li>
                <li><a href="https://github.com/antoniorv6/MakerCycle/issues" className="hover:text-brand-400 transition-colors duration-200">Issues</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg sm:text-xl font-semibold mb-6 font-display">Legal</h3>
              <ul className="space-y-3 sm:space-y-4 text-base text-cream-400">
                <li><a href="/legal/aviso-legal/" className="hover:text-brand-400 transition-colors duration-200">Aviso Legal</a></li>
                <li><a href="/legal/privacidad/" className="hover:text-brand-400 transition-colors duration-200">Privacidad</a></li>
                <li><a href="/legal/cookies/" className="hover:text-brand-400 transition-colors duration-200">Cookies</a></li>
                <li><a href="/legal/terminos/" className="hover:text-brand-400 transition-colors duration-200">Términos</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-dark-700 mt-12 sm:mt-16 pt-8 sm:pt-10 text-center">
            <p className="text-base text-cream-500">&copy; 2024 MakerCycle. Open Source bajo licencia MIT.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
