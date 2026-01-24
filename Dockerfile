# Usar imagen base de Node.js con pnpm
FROM node:20-alpine AS base

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Establecer directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración de dependencias
FROM base AS deps
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

# Construir la aplicación
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Aceptar build arguments para variables de entorno
# IMPORTANTE: En Dokploy, configura estas variables como "Build Arguments" en la configuración de la aplicación
# Si no están disponibles durante el build, el código usará valores placeholder para completar el build
ARG NEXT_PUBLIC_SUPABASE_URL
ARG NEXT_PUBLIC_SUPABASE_ANON_KEY

# Establecer variables de entorno para producción
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_PUBLIC_SUPABASE_URL=${NEXT_PUBLIC_SUPABASE_URL}
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=${NEXT_PUBLIC_SUPABASE_ANON_KEY}

RUN pnpm build

# Imagen de producción
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copiar archivos necesarios del build standalone
# El modo standalone de Next.js genera una estructura autocontenida en .next/standalone
# Copiamos el contenido de standalone a la raíz del contenedor
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

# Exponer el puerto 3000 (requerido por Dokploy)
EXPOSE 3000

# Variables de entorno para Next.js
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Comando para iniciar el servidor Next.js
CMD ["node", "server.js"]

