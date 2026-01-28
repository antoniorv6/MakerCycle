/** @type {import('next').NextConfig} */
const nextConfig = {
  // Exportación estática para Capacitor
  output: 'export',
  
  // Desactivar optimización de imágenes (no compatible con export estático)
  images: {
    unoptimized: true,
  },
  
  // Trailing slash necesario para rutas en Capacitor
  trailingSlash: true,
  
  // Configuración para archivos estáticos
  assetPrefix: '',
  
  // Desactivar indicadores de desarrollo en móvil
  devIndicators: {
    buildActivity: false,
  },
}

module.exports = nextConfig
