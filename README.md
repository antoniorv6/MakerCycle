# 🚀 3DCraftFlow

> **Tu aliado definitivo para la gestión profesional de impresión 3D**

3DCraftFlow es una plataforma SaaS moderna que revoluciona la forma en que gestionas tus proyectos de impresión 3D. Desde el cálculo preciso de costos hasta el análisis detallado de rentabilidad, todo en una interfaz intuitiva y elegante.

![3DCraftFlow Dashboard](https://via.placeholder.com/800x400/1f2937/ffffff?text=3DCraftFlow+Dashboard)

## ✨ Características principales

### 🧮 **Calculadora de costes inteligente**
- Cálculo automático de costos de filamento, electricidad y materiales
- Configuración flexible de precios y márgenes
- Estimación precisa de tiempo de impresión
- Soporte para múltiples configuraciones de impresora

### 📊 **Dashboard Analítico**
- Estadísticas en tiempo real de proyectos y ventas
- Gráficos interactivos de rentabilidad
- Análisis de tendencias y patrones
- Métricas clave de negocio

### 🔐 **Gestión Segura**
- Autenticación robusta con Supabase
- Almacenamiento seguro en la nube
- Sincronización automática de datos
- Backup automático de proyectos

### 💼 **Gestión de Proyectos**
- Organización inteligente de proyectos
- Historial completo de modificaciones
- Exportación de datos
- Colaboración en equipo

## 🛠️ Tecnologías utilizadas

- **Frontend**: [Next.js 14](https://nextjs.org/) + [React 18](https://react.dev/)
- **Backend**: [Supabase](https://supabase.com/) (PostgreSQL + Auth)
- **Estilos**: [Tailwind CSS](https://tailwindcss.com/)
- **Animaciones**: [Framer Motion](https://www.framer.com/motion/)
- **Lenguaje**: [TypeScript](https://www.typescriptlang.org/)

## 🚀 Inicio rápido

### Prerrequisitos

- **Node.js** >= 18.0.0
- **pnpm** (recomendado) o npm/yarn
- Cuenta en [Supabase](https://supabase.com/)

### Instalación

1. **Clona el repositorio**
   ```bash
   git clone https://github.com/tu-usuario/3DCraftFlow.git
   cd 3DCraftFlow
   ```

2. **Instala las dependencias**
   ```bash
   pnpm install
   ```

3. **Configura Supabase**
   - Crea un nuevo proyecto en [Supabase](https://supabase.com/)
   - Ejecuta las migraciones desde `/supabase/migrations`
   - Copia las credenciales de tu proyecto

4. **Configura las variables de entorno**
   ```bash
   cp .env.example .env.local
   ```
   
   Edita `.env.local` con tus credenciales:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   ```

5. **¡Inicia el servidor de desarrollo!**
   ```bash
   pnpm dev
   ```

   Abre [http://localhost:3000](http://localhost:3000) en tu navegador 🎉

## 📁 Estructura del proyecto

```
3DCraftFlow/
├── 📁 app/                    # Páginas y layouts (Next.js App Router)
│   ├── 📁 auth/              # Páginas de autenticación
│   ├── 📁 dashboard/         # Dashboard principal
│   └── 📄 layout.tsx         # Layout raíz
├── 📁 components/            # Componentes reutilizables
│   ├── 📁 cost-calculator/   # Calculadora de costos
│   ├── 📁 auth/              # Componentes de autenticación
│   └── 📁 providers/         # Providers de contexto
├── 📁 lib/                   # Configuraciones y utilidades
│   └── 📄 supabase.ts        # Cliente de Supabase
├── 📁 supabase/              # Configuración de base de datos
│   └── 📁 migrations/        # Migraciones SQL
└── 📁 util/                  # Utilidades varias
```

## 🎯 Casos de uso

### Para impresores profesionales
- Calcula costos precisos para cotizaciones
- Gestiona múltiples proyectos simultáneamente
- Analiza la rentabilidad de tu negocio
- Mantén un historial completo de trabajos

### Para aficionados
- Aprende sobre costos de impresión 3D
- Organiza tus proyectos de manera profesional
- Optimiza el uso de materiales
- Planifica mejor tus impresiones

## 🔧 Configuración avanzada

### Variables de entorno disponibles

| Variable | Descripción | Requerida |
|----------|-------------|-----------|
| `NEXT_PUBLIC_SUPABASE_URL` | URL de tu proyecto Supabase | ✅ |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clave anónima de Supabase | ✅ |

### Scripts disponibles

```bash
pnpm dev          # Servidor de desarrollo
pnpm build        # Construcción para producción
pnpm start        # Servidor de producción
pnpm lint         # Verificar código
```

## 🤝 Contribuir

¡Nos encantaría que contribuyas al proyecto! Consulta nuestra [guía de contribución](CONTRIBUTING.md) para más detalles.

### ¿Cómo puedo ayudar?

- 🐛 Reportar bugs
- 💡 Sugerir nuevas características
- 📝 Mejorar la documentación
- 🔧 Contribuir código

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 📞 Contacto

- **Issues**: [GitHub Issues](https://github.com/tu-usuario/3DCraftFlow/issues)
- **Discusiones**: [GitHub Discussions](https://github.com/tu-usuario/3DCraftFlow/discussions)

---

<div align="center">

**¿Te gusta 3DCraftFlow? ¡Dale una ⭐ al repositorio!**

</div> 