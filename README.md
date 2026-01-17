# MakerCycle Mobile

Aplicación móvil nativa de MakerCycle - Calculadora de costes y gestor de proyectos de impresión 3D.

## 🚀 Tecnologías

- **Next.js 14** - Framework React con App Router
- **Capacitor.js 6** - Framework para aplicaciones móviles nativas
- **Tailwind CSS** - Framework CSS utility-first
- **Supabase** - Backend as a Service (Auth + Database)
- **Framer Motion** - Animaciones
- **TypeScript** - Tipado estático

## 📱 Plataformas Soportadas

- iOS 13+
- Android 5.1+ (API 22+)
- Web (PWA)

## 🛠️ Configuración del Entorno

### Requisitos Previos

- Node.js 18+
- pnpm (recomendado) o npm
- Para iOS: macOS + Xcode 15+
- Para Android: Android Studio + JDK 17

### Variables de Entorno

Crea un archivo `.env.local` con:

```env
NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_clave_anonima
```

### Instalación

```bash
# Instalar dependencias
pnpm install

# Inicializar Capacitor (primera vez)
npx cap sync
```

## 🏃‍♂️ Desarrollo

### Desarrollo Web

```bash
# Servidor de desarrollo
pnpm dev
```

### Desarrollo iOS

```bash
# Compilar y sincronizar
pnpm build:mobile

# Abrir en Xcode
pnpm cap:open:ios

# O ejecutar directamente
pnpm cap:run:ios
```

### Desarrollo Android

```bash
# Compilar y sincronizar
pnpm build:mobile

# Abrir en Android Studio
pnpm cap:open:android

# O ejecutar directamente
pnpm cap:run:android
```

## 📦 Compilación para Producción

### Build Web/PWA

```bash
pnpm build
```

### Build para Móvil

```bash
# Compilar y sincronizar con plataformas nativas
pnpm build:mobile
```

### Generar APK/IPA

1. **Android**: Abre en Android Studio y genera desde `Build > Build Bundle(s) / APK(s)`
2. **iOS**: Abre en Xcode y genera desde `Product > Archive`

## 📂 Estructura del Proyecto

```
├── app/                    # Rutas de Next.js App Router
│   ├── auth/              # Páginas de autenticación
│   ├── dashboard/         # Dashboard principal
│   └── legal/             # Páginas legales
├── src/
│   ├── components/        # Componentes React
│   │   ├── mobile/        # Componentes específicos para móvil
│   │   ├── providers/     # Context providers
│   │   └── ...
│   ├── hooks/             # Custom hooks
│   ├── services/          # Servicios de API
│   ├── types/             # Tipos TypeScript
│   └── utils/             # Utilidades
├── public/                # Assets estáticos
├── ios/                   # Proyecto nativo iOS (generado)
├── android/               # Proyecto nativo Android (generado)
└── capacitor.config.ts    # Configuración de Capacitor
```

## 🎨 Características Móviles

- **Bottom Navigation**: Navegación inferior nativa para móvil
- **Safe Areas**: Soporte para notch y home indicator
- **Gestos táctiles**: Interacciones optimizadas para touch
- **Haptic Feedback**: Retroalimentación táctil en acciones
- **Status Bar**: Integración con barra de estado nativa
- **Splash Screen**: Pantalla de carga personalizada
- **Keyboard handling**: Manejo inteligente del teclado

## 🔧 Comandos Útiles

```bash
# Sincronizar cambios web con apps nativas
pnpm cap:sync

# Verificar configuración de Capacitor
npx cap doctor

# Actualizar plugins de Capacitor
npx cap update

# Limpiar cache
pnpm clean
```

## 🔐 Configuración de Seguridad

Para producción, asegúrate de:

1. Configurar correctamente las políticas RLS en Supabase
2. Usar HTTPS para todas las conexiones
3. Configurar los dominios permitidos en Supabase

## 📄 Licencia

Este proyecto está bajo la licencia MIT. Ver [LICENSE](LICENSE) para más detalles.

## 🤝 Contribuir

Ver [CONTRIBUTING.md](CONTRIBUTING.md) para guías de contribución.
