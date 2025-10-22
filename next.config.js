/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.pexels.com'],
    unoptimized: true, // Para compatibilidad con Netlify
  },
  // Asegurar que los archivos estáticos se sirvan correctamente
  trailingSlash: false,
  // Configuración para archivos estáticos
  assetPrefix: process.env.NODE_ENV === 'production' ? '' : '',
}

module.exports = nextConfig
