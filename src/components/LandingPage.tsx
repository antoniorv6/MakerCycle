'use client'

import Link from 'next/link'
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
  Star
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
      title: "Calculadora de Costes",
      description: "Calcula costes precisos de impresión 3D incluyendo filamento, electricidad, tiempo y materiales",
      color: "from-slate-600 to-slate-700",
      delay: "0ms"
    },
    {
      icon: TrendingUp,
      title: "Análisis de Rentabilidad",
      description: "Analiza márgenes de beneficio y optimiza tus precios para maximizar la rentabilidad",
      color: "from-emerald-600 to-emerald-700",
      delay: "100ms"
    },
    {
      icon: BarChart3,
      title: "Gestión de Proyectos",
      description: "Organiza y gestiona todos tus proyectos de impresión 3D en un solo lugar",
      color: "from-blue-600 to-blue-700",
      delay: "200ms"
    },
    {
      icon: Shield,
      title: "Datos Seguros",
      description: "Tus datos están protegidos con encriptación de nivel empresarial en la nube",
      color: "from-indigo-600 to-indigo-700",
      delay: "300ms"
    },
    {
      icon: Zap,
      title: "Interfaz Optimizada",
      description: "Diseñada para ser rápida y eficiente. Calcula costes en segundos",
      color: "from-amber-600 to-amber-700",
      delay: "400ms"
    },
    {
      icon: Users,
      title: "Colaboración en Equipo",
      description: "Trabaja con tu equipo compartiendo proyectos y configuraciones",
      color: "from-purple-600 to-purple-700",
      delay: "500ms"
    }
  ]

  const pricingPlans = [
    {
      name: "Gratis",
      price: "€0",
      period: "/mes",
      description: "Todas las funcionalidades",
      features: [
        "Proyectos ilimitados",
        "Calculadora avanzada",
        "Análisis completo",
        "Gestión de clientes",
        "Equipos colaborativos",
        "Soporte comunitario"
      ],
      cta: "Empezar Gratis",
      popular: false,
      icon: MousePointer
    },
    {
      name: "Apoyo",
      price: "€2",
      period: "/mes",
      description: "Apoya el proyecto",
      features: [
        "Todo lo de Gratis",
        "Soporte prioritario",
        "Acceso a nuevas funciones",
        "Badge de 'Supporter'",
        "Voz en el roadmap",
        "Acceso a beta features"
      ],
      cta: "Apoyar Proyecto",
      popular: true,
      icon: Target
    },
    {
      name: "Patrocinador",
      price: "€5",
      period: "/mes",
      description: "Máximo apoyo",
      features: [
        "Todo lo de Apoyo",
        "Soporte directo",
        "Funciones exclusivas",
        "Badge de 'Patrocinador'",
        "Influencia en decisiones",
        "Acceso a código fuente"
      ],
      cta: "Ser Patrocinador",
      popular: false,
      icon: Zap
    }
  ]

  return (
    <div className="min-h-screen bg-white overflow-hidden">
      {/* Header */}
      <header className="relative bg-white/95 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-slate-700 to-slate-800 rounded-xl flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110">
                <Calculator className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">
                  3DCraftFlow
                </h1>
                <p className="text-sm text-slate-500">Gestión Profesional 3D</p>
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
                Open Source • Profesional • Confiable
              </div>
              
              <h1 className="text-5xl md:text-7xl font-bold text-slate-900 mb-6 leading-tight">
                Gestiona tu negocio de
                <span className="bg-gradient-to-r from-slate-700 to-slate-800 bg-clip-text text-transparent"> impresión 3D</span>
              </h1>
              
              <p className="text-xl md:text-2xl text-slate-600 mb-8 max-w-4xl mx-auto leading-relaxed">
                Plataforma open source para calcular costes, gestionar proyectos y analizar la rentabilidad 
                de tu negocio de impresión 3D. Profesional, seguro y accesible.
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
              Herramientas profesionales para makers
            </h2>
            <p className="text-xl text-slate-600 max-w-3xl mx-auto">
              Desarrollado por makers, para makers. Todas las herramientas que necesitas para profesionalizar tu negocio de impresión 3D.
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
              <a href="https://github.com/antoniorv6/3DCraftFlow" className="inline-flex items-center text-slate-700 hover:text-slate-900 font-medium">
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
              <a href="https://github.com/antoniorv6/3DCraftFlow/blob/main/CONTRIBUTING.md" className="inline-flex items-center text-slate-700 hover:text-slate-900 font-medium">
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
              Gratis para todos, apoyo opcional
            </h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Creemos que las herramientas profesionales deben ser accesibles para todos. Si te gusta el proyecto, puedes apoyarlo.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <div 
                key={index}
                className={`relative bg-white p-8 rounded-2xl shadow-lg border-2 transition-all duration-300 transform hover:-translate-y-2 ${
                  plan.popular 
                    ? 'border-slate-500 shadow-2xl scale-105' 
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-slate-600 to-slate-700 text-white px-4 py-2 rounded-full text-sm font-semibold">
                      Recomendado
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <div className="w-12 h-12 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center mx-auto mb-4">
                    <plan.icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <div className="mb-4">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-500">{plan.period}</span>
                  </div>
                  <p className="text-slate-600">{plan.description}</p>
                </div>

                <ul className="space-y-4 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-emerald-500 mr-3 flex-shrink-0" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth"
                  className={`w-full py-3 px-6 rounded-xl font-semibold text-center transition-all duration-300 ${
                    plan.popular
                      ? 'bg-gradient-to-r from-slate-600 to-slate-700 text-white hover:from-slate-700 hover:to-slate-800'
                      : 'bg-slate-100 text-slate-900 hover:bg-slate-200'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
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
              href="https://github.com/antoniorv6/3DCraftFlow"
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
                <div className="w-10 h-10 bg-gradient-to-br from-slate-600 to-slate-700 rounded-xl flex items-center justify-center">
                  <Calculator className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-bold">3DCraftFlow</span>
              </div>
              <p className="text-slate-400 mb-6">
                Plataforma open source para la gestión profesional de impresión 3D.
              </p>
              <div className="flex space-x-4">
                <a href="https://github.com/antoniorv6/3DCraftFlow" className="text-slate-400 hover:text-white transition-colors duration-200">
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
                <li><a href="#" className="hover:text-white transition-colors duration-200">Precios</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Demo</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">API</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Desarrollo</h3>
              <ul className="space-y-3 text-slate-400">
                <li><a href="https://github.com/antoniorv6/3DCraftFlow" className="hover:text-white transition-colors duration-200">Documentación</a></li>
                <li><a href="https://github.com/antoniorv6/3DCraftFlow/blob/main/CONTRIBUTING.md" className="hover:text-white transition-colors duration-200">Contribuir</a></li>
                <li><a href="https://github.com/antoniorv6/3DCraftFlow/issues" className="hover:text-white transition-colors duration-200">Issues</a></li>
                <li><a href="https://github.com/antoniorv6/3DCraftFlow/projects" className="hover:text-white transition-colors duration-200">Roadmap</a></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6">Legal</h3>
              <ul className="space-y-3 text-slate-400">
                <li><a href="#" className="hover:text-white transition-colors duration-200">Licencia MIT</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Privacidad</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Términos</a></li>
                <li><a href="#" className="hover:text-white transition-colors duration-200">Seguridad</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-slate-400">
                          <p>&copy; 2024 3DCraftFlow. Open Source bajo licencia MIT.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}