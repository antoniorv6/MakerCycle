# 🚀 Guía de Configuración - MakerFlow

Esta guía te ayudará a configurar MakerFlow en tu entorno local paso a paso.

## 📋 Prerrequisitos

### Software Requerido
- **Node.js** >= 18.0.0
- **Git** para clonar el repositorio
- **pnpm** (recomendado) o npm/yarn
- **Navegador web** moderno

### Cuentas Requeridas
- **GitHub** (para clonar el repositorio)
- **Supabase** (gratuita, para backend)

## 🔧 Configuración Paso a Paso

### Paso 1: Preparar el Entorno

#### 1.1 Verificar Node.js
```bash
node --version
# Debe ser >= 18.0.0
```

#### 1.2 Instalar pnpm (Recomendado)
```bash
npm install -g pnpm
```

#### 1.3 Clonar el Repositorio
```bash
git clone https://github.com/tu-usuario/MakerFlow.git
cd MakerFlow
```

### Paso 2: Configurar Supabase

#### 2.1 Crear Cuenta en Supabase
1. Ve a [supabase.com](https://supabase.com/)
2. Haz clic en "Start your project"
3. Crea una cuenta gratuita
4. Verifica tu email

#### 2.2 Crear Nuevo Proyecto
1. Haz clic en "New Project"
2. Selecciona tu organización
3. Elige un nombre para tu proyecto (ej: "makerflow-dev")
4. Establece una contraseña para la base de datos
5. Selecciona una región cercana
6. Haz clic en "Create new project"

#### 2.3 Obtener Credenciales
1. Ve a **Settings** > **API**
2. Copia la **Project URL**
3. Copia la **anon public** key
4. Copia la **service_role** key (mantenla segura)

### Paso 3: Configurar Variables de Entorno

#### 3.1 Crear Archivo .env.local
```bash
cp .env.example .env.local
```

#### 3.2 Editar Variables de Entorno
Edita el archivo `.env.local` con tus credenciales:

```env
# Supabase Configuration (REQUERIDO)
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key-aqui
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-key-aqui

# Analytics (OPCIONAL)
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX

# Desarrollo
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Paso 4: Configurar Base de Datos

#### 4.1 Opción A: Usando Supabase CLI (Recomendado)

```bash
# Instalar Supabase CLI
npm install -g supabase

# Inicializar Supabase (si no existe)
supabase init

# Conectar a tu proyecto remoto
supabase link --project-ref tu-project-ref

# Ejecutar migraciones
supabase db push
```

#### 4.2 Opción B: Manual (SQL Editor)

1. Ve a tu proyecto en Supabase
2. Ve a **SQL Editor**
3. Copia el contenido de `supabase/migrations/001_initial_schema.sql`
4. Pega y ejecuta el SQL

### Paso 5: Instalar Dependencias

```bash
# Instalar todas las dependencias
pnpm install
```

### Paso 6: Iniciar Servidor de Desarrollo

```bash
# Iniciar servidor de desarrollo
pnpm dev
```

### Paso 7: Verificar Instalación

1. Abre [http://localhost:3000](http://localhost:3000)
2. Deberías ver la página de inicio de MakerFlow
3. Haz clic en "Registrarse" para crear tu primera cuenta
4. ¡Ya puedes empezar a usar MakerFlow!

## 🔍 Verificación de Configuración

### Verificar Base de Datos
```bash
# Verificar conexión a Supabase
pnpm db:status

# Verificar migraciones
pnpm db:diff
```

### Verificar Variables de Entorno
```bash
# Verificar que las variables están cargadas
node -e "console.log(process.env.NEXT_PUBLIC_SUPABASE_URL)"
```

### Verificar Funcionalidad
1. ✅ Crear cuenta de usuario
2. ✅ Iniciar sesión
3. ✅ Crear un proyecto
4. ✅ Usar la calculadora de costos
5. ✅ Crear una venta

## 🛠️ Comandos Útiles

### Desarrollo
```bash
pnpm dev              # Servidor de desarrollo
pnpm build            # Construir para producción
pnpm start            # Servidor de producción
pnpm lint             # Verificar código
pnpm lint:fix         # Corregir errores
```

### Base de Datos
```bash
pnpm db:reset         # Resetear base de datos local
pnpm db:push          # Subir migraciones
pnpm db:diff          # Ver diferencias
pnpm db:status        # Estado de la base de datos
```

### Utilidades
```bash
pnpm type-check       # Verificar tipos TypeScript
pnpm clean            # Limpiar archivos generados
pnpm test             # Ejecutar tests (si existen)
```

## 🚨 Solución de Problemas

### Error: "Cannot find module"
```bash
# Reinstalar dependencias
rm -rf node_modules
pnpm install
```

### Error: "Supabase connection failed"
1. Verifica las variables de entorno
2. Verifica que el proyecto de Supabase esté activo
3. Verifica que las migraciones estén ejecutadas

### Error: "Database schema not found"
```bash
# Ejecutar migraciones
supabase db push
```

### Error: "Authentication failed"
1. Verifica que las claves de Supabase sean correctas
2. Verifica que el proyecto esté en la región correcta
3. Verifica que las políticas RLS estén configuradas

## 📚 Recursos Adicionales

### Documentación
- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

### Comunidad
- [GitHub Issues](https://github.com/tu-usuario/MakerFlow/issues)
- [GitHub Discussions](https://github.com/tu-usuario/MakerFlow/discussions)

### Herramientas de Desarrollo
- [Supabase CLI](https://supabase.com/docs/reference/cli)
- [Next.js DevTools](https://nextjs.org/docs/advanced-features/nextjs-compiler)
- [React Developer Tools](https://react.dev/learn/react-developer-tools)

## 🎉 ¡Listo!

Una vez completados todos los pasos, tendrás MakerFlow funcionando en tu entorno local. 

**Próximos pasos:**
1. Explora las funcionalidades
2. Crea algunos proyectos de prueba
3. Familiarízate con la interfaz
4. ¡Contribuye al proyecto!

---

**¿Necesitas ayuda?** Crea un issue en GitHub o únete a las discusiones. 