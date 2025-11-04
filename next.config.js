/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['images.pexels.com'],
    unoptimized: true, // Para compatibilidad con Netlify
  },
  output: 'standalone',
  // Asegurar que los archivos estáticos se sirvan correctamente
  trailingSlash: false,
}

module.exports = nextConfig
