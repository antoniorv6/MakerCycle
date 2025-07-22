'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { 
  Calculator, 
  TrendingUp, 
  Shield, 
  Zap, 
  Users, 
  BarChart3, 
  CheckCircle, 
  ArrowRight, 
  Play,
  ChevronRight,
  Globe,
  Lock,
  Clock,
  DollarSign,
  Target,
  Sparkles,
  MousePointer,
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
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    setIsVisible(true)
    
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    
    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  const features = [
    {
      icon: Calculator,
      title: "Calculadora de Costes 3D",
      description: "Calcula de forma precisa todos los costes de impresión: filamento, electricidad, materiales, tiempo y más, en segundos.",
      color: "from-slate-600 to-slate-700",
      delay: "0ms"
    },
    {
      icon: BarChart3,
      title: "Contabilidad y Rentabilidad",
      description: "Gestiona ventas, gastos y clientes. Analiza márgenes de beneficio, visualiza estadísticas avanzadas y optimiza tus precios para maximizar la rentabilidad de tu negocio.",
      color: "from-emerald-700 to-emerald-900",
      delay: "100ms"
    },
    {
      icon: LayoutGrid,
      title: "Organización de Proyectos (Kanban)",
      description: "Organiza y prioriza tus proyectos de impresión 3D con un tablero Kanban intuitivo. Arrastra tareas, gestiona estados y mantén el control total de tu flujo de trabajo.",
      color: "from-purple-700 to-slate-800",
      delay: "200ms"
    },
    {
      icon: Users,
      title: "Gestión de Equipos y Roles",
      description: "Colabora con tu equipo, asigna roles personalizados y controla los permisos de acceso para una gestión profesional y segura.",
      color: "from-slate-700 to-slate-900",
      delay: "300ms"
    },
    {
      icon: Bell,
      title: "Notificaciones Inteligentes",
      description: "Recibe alertas automáticas sobre cambios, tareas y eventos importantes para no perderte nada en tus proyectos.",
      color: "from-amber-600 to-amber-700",
      delay: "400ms"
    },
    {
      icon: Shield,
      title: "Seguridad y Privacidad",
      description: "Tus datos están protegidos con cifrado y políticas de acceso avanzadas. Control total sobre tu información y la de tu equipo.",
      color: "from-indigo-700 to-indigo-900",
      delay: "500ms"
    }
  ]

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Header */}
      <header className="relative bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  MakerCycle
                </h1>
                <p className="text-sm text-slate-500">Calculadora y Gestión Profesional de Impresión 3D</p>
              </div>
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

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-slate-50 py-20 lg:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-3"></div>
        <div className="absolute top-0 left-0 w-72 h-72 bg-slate-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
        <div className="absolute top-0 right-0 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-emerald-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>
        
        {/* Mouse follower effect */}
        <div 
          className="fixed w-4 h-4 bg-gradient-to-r from-slate-500 to-slate-600 rounded-full pointer-events-none z-50 opacity-30 mix-blend-multiply"
          style={{
            left: mousePosition.x - 8,
            top: mousePosition.y - 8,
            transform: 'translate(-50%, -50%)',
          }}
        />
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>              
              <div className="inline-flex items-center px-4 py-2 rounded-full bg-slate-100 text-slate-700 text-sm font-medium mb-8 hover:bg-slate-200 transition-colors duration-200">
                <Sparkles className="w-4 h-4 mr-2" />
                ¡Profesionaliza tu negocio 3D hoy! 🚀
              </div>
              <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
                Gestión visual y cálculo profesional para
                <span className="bg-gradient-to-r from-purple-700 to-slate-800 bg-clip-text text-transparent"> impresión 3D</span>
              </h1>
              <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                MakerCycle es la suite open source definitiva para makers y empresas: gestiona proyectos con Kanban, calcula costes, colabora en equipo, recibe notificaciones y analiza la rentabilidad de tu negocio de impresión 3D.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                <Link
                  href="/auth"
                  className="group bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center"
                >
                  Comenzar Gratis
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
                </Link>
                <button className="group border-2 border-slate-300 hover:border-slate-400 text-slate-700 px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 inline-flex items-center bg-white/80 backdrop-blur-sm hover:bg-white">
                  <Play className="w-5 h-5 mr-2" />
                  Ver Demo
                </button>
              </div>
              
              <div className="flex items-center justify-center space-x-8 text-sm text-slate-500">
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
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">
              Todo lo que necesitas para tu negocio 3D
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              MakerCycle reúne herramientas profesionales para organizar, calcular, analizar y colaborar en tus proyectos de impresión 3D.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index}
                className="group bg-white p-8 rounded-2xl shadow-lg border border-slate-200 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 card-hover"
                style={{ animationDelay: feature.delay }}
              >
                <div className={`w-16 h-16 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-4">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Open Source Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              Open Source y Transparente
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Creemos en la transparencia y la colaboración. Nuestro código está abierto para que puedas ver, contribuir y confiar.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Github className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Código Abierto</h3>
              <p className="text-slate-600 mb-6">
                Todo el código está disponible en GitHub bajo licencia MIT. Revisa, contribuye o haz fork.
              </p>
              <a href="https://github.com/antoniorv6/MakerCycle" className="inline-flex items-center text-slate-700 hover:text-slate-900 font-medium">
                Ver en GitHub
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-emerald-700 rounded-2xl flex items-center mx-auto mb-6 justify-center">
                <Code className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Contribuye</h3>
              <p className="text-slate-600 mb-6">
                ¿Tienes ideas para mejorar? Contribuye al proyecto. Cada pull request es bienvenido.
              </p>
              <a href="https://github.com/antoniorv6/MakerCycle/blob/main/CONTRIBUTING.md" className="inline-flex items-center text-slate-700 hover:text-slate-900 font-medium">
                Guía de Contribución
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>

            <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl flex items-center justify-center mx-auto mb-6">
                <Download className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-4">Auto-hosting</h3>
              <p className="text-slate-600 mb-6">
                Instala en tu propio servidor si prefieres mantener el control total de tus datos.
              </p>
              <a href="#" className="inline-flex items-center text-slate-700 hover:text-slate-900 font-medium">
                Documentación
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-slate-700 to-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div className="text-white group">
              <div className="text-4xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">100%</div>
              <div className="text-slate-200">Open Source</div>
            </div>
            <div className="text-white group">
              <div className="text-4xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">MIT</div>
              <div className="text-slate-200">Licencia</div>
            </div>
            <div className="text-white group">
              <div className="text-4xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">24/7</div>
              <div className="text-slate-200">Comunidad</div>
            </div>
            <div className="text-white group">
              <div className="text-4xl font-bold mb-2 group-hover:scale-110 transition-transform duration-300">∞</div>
              <div className="text-slate-200">Posibilidades</div>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-6">
              MakerCycle es gratis para todos
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Todas las funcionalidades son gratuitas y open source. Si quieres apoyar el proyecto, puedes invitarme a un café ☕️
            </p>
            <div className="mt-8 flex justify-center gap-4 flex-col sm:flex-row">
              <Link
                href="/auth"
                className="inline-flex items-center bg-gradient-to-r from-slate-700 to-slate-800 hover:from-slate-800 hover:to-slate-900 text-white px-8 py-4 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105"
              >
                Empezar Gratis
                <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
              </Link>
              <a
                href="https://coff.ee/3dmaniaconh"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold px-8 py-4 rounded-xl shadow-lg transition-all duration-300 text-lg"
              >
                <Star className="w-5 h-5 mr-2" />
                Invítame a un café
              </a>
            </div>
          </div>
          <div className="max-w-2xl mx-auto">
            <ul className="space-y-4 text-lg text-slate-700">
              <li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" /> Proyectos ilimitados</li>
              <li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" /> Calculadora avanzada de costes</li>
              <li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" /> Contabilidad y análisis de rentabilidad</li>
              <li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" /> Gestión de clientes</li>
              <li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" /> Equipos colaborativos y roles</li>
              <li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" /> Seguridad y privacidad</li>
              <li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" /> Notificaciones inteligentes</li>
            </ul>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-slate-700 to-slate-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Listo para profesionalizar tu negocio 3D?
          </h2>
          <p className="text-xl text-slate-200 mb-8 max-w-3xl mx-auto">
            Únete a la comunidad de makers. Es completamente gratis, y si te gusta, puedes apoyar el proyecto.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth"
              className="group bg-white hover:bg-slate-100 text-slate-700 px-8 py-4 rounded-xl text-lg font-semibold shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:scale-105 inline-flex items-center"
            >
              Empezar Gratis Ahora
              <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform duration-200" />
            </Link>
            <a
              href="https://github.com/antoniorv6/MakerCycle"
              className="group border-2 border-white/20 hover:border-white/40 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 inline-flex items-center"
            >
              <Github className="w-5 h-5 mr-2" />
              Ver en GitHub
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <span className="text-xl font-bold">MakerCycle</span>
              </div>
              <p className="text-slate-400 mb-6">
                MakerCycle: Calculadora de costes y gestor de proyectos para impresión 3D. Open source, profesional y colaborativa.
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
              <h3 className="text-lg font-semibold mb-6">Producto</h3>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Características</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Demo</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Desarrollo</h3>
              <ul className="space-y-3 text-slate-400">
                <li><a href="https://github.com/antoniorv6/MakerCycle" className="hover:text-white transition-colors duration-200">Documentación</a></li>
                <li><a href="https://github.com/antoniorv6/MakerCycle/blob/main/CONTRIBUTING.md" className="hover:text-white transition-colors duration-200">Contribuir</a></li>
                <li><a href="https://github.com/antoniorv6/MakerCycle/issues" className="hover:text-white transition-colors duration-200">Issues</a></li>
                <li><a href="https://github.com/antoniorv6/MakerCycle/projects" className="hover:text-white transition-colors duration-200">Roadmap</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Legal</h3>
              <ul className="space-y-3 text-slate-400">
                <li><a href="/legal/aviso-legal" className="hover:text-white transition-colors duration-200">Aviso Legal</a></li>
                <li><a href="/legal/privacidad" className="hover:text-white transition-colors duration-200">Privacidad</a></li>
                <li><a href="/legal/cookies" className="hover:text-white transition-colors duration-200">Cookies</a></li>
                <li><a href="/legal/terminos" className="hover:text-white transition-colors duration-200">Términos</a></li>
                <li><a href="/legal/seguridad" className="hover:text-white transition-colors duration-200">Seguridad</a></li>
                <li><a href="/legal/licencia" className="hover:text-white transition-colors duration-200">Licencia MIT</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
            <p>&copy; 2024 MakerCycle. Open Source bajo licencia MIT.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}