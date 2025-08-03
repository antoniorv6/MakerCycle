# 🤝 Guía de Contribución - MakerFlow

¡Gracias por tu interés en contribuir a MakerFlow! Este documento te guiará a través del proceso de contribución.

## 📋 Índice

- [Cómo Contribuir](#cómo-contribuir)
- [Configuración del Entorno](#configuración-del-entorno)
- [Proceso de Desarrollo](#proceso-de-desarrollo)
- [Estándares de Código](#estándares-de-código)
- [Reportar Bugs](#reportar-bugs)
- [Sugerir Características](#sugerir-características)
- [Pull Requests](#pull-requests)
- [Código de Conducta](#código-de-conducta)

## 🚀 Cómo Contribuir

### Tipos de Contribuciones

- 🐛 **Reportar bugs** - Ayuda a mejorar la estabilidad
- 💡 **Sugerir características** - Comparte tus ideas
- 📝 **Mejorar documentación** - Ayuda a otros desarrolladores
- 🔧 **Contribuir código** - Implementa nuevas funcionalidades
- 🎨 **Mejorar UI/UX** - Ayuda con el diseño
- 🧪 **Escribir tests** - Mejora la calidad del código

### Antes de Contribuir

1. **Revisa los issues existentes** - Evita duplicar trabajo
2. **Lee la documentación** - Familiarízate con el proyecto
3. **Únete a las discusiones** - Conecta con la comunidad
4. **Prueba la aplicación** - Asegúrate de que funciona

## 🔧 Configuración del Entorno

### 1. Fork y Clone

```bash
# Fork el repositorio en GitHub
# Luego clona tu fork
git clone https://github.com/tu-usuario/MakerFlow.git
cd MakerFlow
```

### 2. Configurar Upstream

```bash
# Agregar el repositorio original como upstream
git remote add upstream https://github.com/original/MakerFlow.git

# Verificar remotes
git remote -v
```

### 3. Instalar Dependencias

```bash
# Instalar pnpm si no lo tienes
npm install -g pnpm

# Instalar dependencias
pnpm install
```

### 4. Configurar Variables de Entorno

```bash
# Copiar archivo de ejemplo
cp .env.example .env.local

# Editar con tus credenciales de Supabase
```

### 5. Configurar Base de Datos

```bash
# Instalar Supabase CLI
npm install -g supabase

# Ejecutar migraciones
supabase db push
```

## 🛠️ Proceso de Desarrollo

### 1. Crear una Rama

```bash
# Actualizar tu fork
git fetch upstream
git checkout main
git merge upstream/main

# Crear rama para tu feature
git checkout -b feature/nombre-de-tu-feature
```

### 2. Desarrollar

```bash
# Iniciar servidor de desarrollo
pnpm dev

# Verificar código
pnpm lint
pnpm type-check
```

### 3. Commit y Push

```bash
# Agregar cambios
git add .

# Commit con mensaje descriptivo
git commit -m "feat: agregar nueva funcionalidad de calculadora"

# Push a tu fork
git push origin feature/nombre-de-tu-feature
```

### 4. Crear Pull Request

1. Ve a tu fork en GitHub
2. Haz clic en "Compare & pull request"
3. Completa la plantilla de PR
4. Espera la revisión

## 📝 Estándares de Código

### Convenciones de Nomenclatura

#### Archivos y Carpetas
```bash
# Componentes React
PascalCase.tsx
# Ejemplo: CostCalculator.tsx

# Hooks personalizados
camelCase.ts
# Ejemplo: useCostCalculations.ts

# Utilidades
camelCase.ts
# Ejemplo: formatCurrency.ts
```

#### Variables y Funciones
```typescript
// Variables
const projectName = 'Mi Proyecto';
const isCalculating = false;

// Funciones
const calculateCost = () => { /* ... */ };
const handleSubmit = () => { /* ... */ };

// Componentes
const CostCalculator = () => { /* ... */ };
```

### Estructura de Componentes

```typescript
// 1. Imports
import React from 'react';
import { motion } from 'framer-motion';

// 2. Types
interface Props {
  project: Project;
  onSave: (project: Project) => void;
}

// 3. Component
export const ProjectCard: React.FC<Props> = ({ project, onSave }) => {
  // 4. Hooks
  const [isEditing, setIsEditing] = useState(false);

  // 5. Handlers
  const handleEdit = () => setIsEditing(true);

  // 6. Render
  return (
    <motion.div className="...">
      {/* JSX */}
    </motion.div>
  );
};
```

### Estándares de CSS

```css
/* Usar Tailwind CSS cuando sea posible */
className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md"

/* Para estilos personalizados, usar CSS modules */
/* ProjectCard.module.css */
.container {
  @apply flex items-center justify-between p-4;
}
```

## 🐛 Reportar Bugs

### Antes de Reportar

1. **Busca en issues existentes** - Evita duplicados
2. **Prueba en diferentes navegadores** - Verifica si es específico
3. **Revisa la consola del navegador** - Busca errores
4. **Prueba en modo incógnito** - Elimina extensiones

### Plantilla de Bug Report

```markdown
## 🐛 Bug Report

### Descripción
Descripción clara y concisa del bug.

### Pasos para Reproducir
1. Ve a '...'
2. Haz clic en '...'
3. Desplázate hasta '...'
4. Ver error

### Comportamiento Esperado
Descripción de lo que debería pasar.

### Comportamiento Actual
Descripción de lo que realmente pasa.

### Información Adicional
- **Navegador**: Chrome 120.0.6099.109
- **Sistema Operativo**: Windows 11
- **Versión de MakerFlow**: v0.1.0

### Capturas de Pantalla
[Si aplica, incluir capturas]

### Logs
```
[Incluir logs de consola si hay errores]
```
```

## 💡 Sugerir Características

### Antes de Sugerir

1. **Busca en issues existentes** - Evita duplicados
2. **Revisa la documentación** - Verifica si ya existe
3. **Considera el alcance** - ¿Es apropiado para MakerFlow?
4. **Piensa en la implementación** - ¿Es técnicamente viable?

### Plantilla de Feature Request

```markdown
## 💡 Feature Request

### Descripción
Descripción clara de la característica solicitada.

### Problema que Resuelve
Explicación de por qué esta característica es necesaria.

### Solución Propuesta
Descripción de cómo debería funcionar.

### Alternativas Consideradas
Otras soluciones que se han considerado.

### Información Adicional
- **Prioridad**: Alta/Media/Baja
- **Impacto**: Usuarios afectados
- **Complejidad**: Técnica estimada
```

## 🔄 Pull Requests

### Antes de Crear un PR

- [ ] **Código funciona** - Prueba todas las funcionalidades
- [ ] **Tests pasan** - Si hay tests, deben pasar
- [ ] **Linting limpio** - `pnpm lint` sin errores
- [ ] **TypeScript válido** - `pnpm type-check` sin errores
- [ ] **Documentación actualizada** - Si es necesario
- [ ] **Commits descriptivos** - Mensajes claros

### Plantilla de Pull Request

```markdown
## 📝 Descripción
Descripción clara de los cambios realizados.

## 🎯 Tipo de Cambio
- [ ] Bug fix
- [ ] Nueva característica
- [ ] Mejora de documentación
- [ ] Refactorización
- [ ] Otro

## 🧪 Cómo Probar
1. Ve a '...'
2. Haz clic en '...'
3. Verifica que '...'

## 📸 Capturas de Pantalla
[Si aplica, incluir capturas]

## ✅ Checklist
- [ ] Mi código sigue las convenciones del proyecto
- [ ] He probado mi código
- [ ] He actualizado la documentación si es necesario
- [ ] Mis cambios no generan nuevos warnings
- [ ] He agregado tests si es necesario

## 🔗 Issues Relacionados
Closes #123
```

### Proceso de Revisión

1. **Revisión automática** - CI/CD verifica el código
2. **Revisión manual** - Mantenedores revisan el PR
3. **Feedback** - Se pueden solicitar cambios
4. **Merge** - Una vez aprobado, se fusiona

## 📚 Recursos de Desarrollo

### Documentación
- [Next.js Docs](https://nextjs.org/docs)
- [React Docs](https://react.dev)
- [Supabase Docs](https://supabase.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)

### Herramientas
- [TypeScript](https://www.typescriptlang.org/docs)
- [ESLint](https://eslint.org/docs)
- [Prettier](https://prettier.io/docs)

### Comunidad
- [GitHub Issues](https://github.com/tu-usuario/MakerFlow/issues)
- [GitHub Discussions](https://github.com/tu-usuario/MakerFlow/discussions)

## 🤝 Código de Conducta

### Nuestros Estándares

- **Respeto mutuo** - Trata a todos con respeto
- **Comunicación constructiva** - Sé positivo y útil
- **Aprendizaje continuo** - Estamos aquí para aprender
- **Colaboración** - Trabajamos juntos hacia un objetivo común

### Comportamiento Inaceptable

- Comentarios ofensivos o discriminatorios
- Trolling o comportamiento disruptivo
- Spam o contenido no relacionado
- Acoso o intimidación

### Reportar Problemas

Si experimentas o presencias comportamiento inaceptable:

1. **Contacta a los mantenedores** - Envía un email privado
2. **Proporciona detalles** - Incluye contexto relevante
3. **Confidencialidad** - Tu privacidad será respetada

## 🎉 Reconocimiento

### Contribuidores Destacados

- **Contribuidores de Oro** - 10+ PRs aprobados
- **Contribuidores de Plata** - 5+ PRs aprobados
- **Contribuidores de Bronce** - 1+ PRs aprobados

### Cómo Ser Reconocido

1. **Contribuye regularmente** - Mantén actividad consistente
2. **Ayuda a otros** - Responde preguntas en issues
3. **Mantén calidad** - Envía código de alta calidad
4. **Sé paciente** - Las revisiones pueden tomar tiempo

## 📞 Contacto

- **Issues**: [GitHub Issues](https://github.com/tu-usuario/MakerFlow/issues)
- **Discusiones**: [GitHub Discussions](https://github.com/tu-usuario/MakerFlow/discussions)
- **Email**: [tu-email@ejemplo.com](mailto:tu-email@ejemplo.com)

---

**¡Gracias por contribuir a MakerFlow!** 🚀

Tu contribución ayuda a hacer MakerFlow mejor para toda la comunidad de impresión 3D. 