# Suite de Tests - 3DCraftFlow

Esta suite de tests unitarios está diseñada para evaluar la funcionalidad de la aplicación 3DCraftFlow y asegurar que ninguna funcionalidad se rompa durante el desarrollo.

## Estructura de Tests

### Tests Unitarios

#### 1. Hooks (`src/components/cost-calculator/hooks/__tests__/`)
- **useCostCalculations.test.ts**: Prueba los cálculos de costos y precios de venta
  - Cálculos básicos sin piezas
  - Cálculos con piezas múltiples
  - Actualizaciones reactivas
  - Casos edge (valores cero, negativos)

#### 2. Servicios (`src/services/__tests__/`)
- **projectService.test.ts**: Prueba el servicio de gestión de proyectos
  - CRUD de proyectos
  - Cálculos de costos
  - Manejo de errores
  - Filtrado por equipo/personal

- **salesService.test.ts**: Prueba el servicio de ventas
  - CRUD de ventas
  - Cálculo de estadísticas
  - Manejo de errores
  - Filtrado por equipo

#### 3. Componentes (`src/components/__tests__/`)
- **CostCalculator.test.tsx**: Prueba el componente principal de cálculo
  - Renderizado básico
  - Interacción del usuario
  - Validación de formularios
  - Gestión de materiales y piezas
  - Cálculos en tiempo real

#### 4. Hooks Personalizados (`src/hooks/__tests__/`)
- **useProjects.test.ts**: Prueba el hook de gestión de proyectos
  - Carga inicial
  - Operaciones CRUD
  - Estados de carga
  - Filtrado y búsqueda
  - Optimizaciones

### Tests de Integración

#### 1. Flujo Completo (`src/__tests__/`)
- **integration.test.ts**: Prueba el flujo completo de la aplicación
  - Creación de proyecto → Cálculo de costos → Creación de venta
  - Manejo de errores en el flujo
  - Cálculos con diferentes inputs
  - Gestión de materiales y piezas
  - Validaciones de formulario
  - Persistencia de datos

## Comandos de Testing

```bash
# Ejecutar todos los tests
pnpm test

# Ejecutar tests en modo watch (desarrollo)
pnpm test:watch

# Ejecutar tests con cobertura
pnpm test:coverage

# Ejecutar tests específicos
pnpm test -- --testNamePattern="useCostCalculations"
```

## Cobertura de Tests

La suite de tests cubre:

### ✅ Funcionalidades Principales
- [x] Cálculos de costos de filamento
- [x] Cálculos de costos de electricidad
- [x] Cálculos de costos de materiales
- [x] Cálculo de precios de venta
- [x] Gestión de piezas múltiples
- [x] Validación de formularios
- [x] CRUD de proyectos
- [x] CRUD de ventas
- [x] Manejo de errores
- [x] Estados de carga

### ✅ Casos Edge
- [x] Valores cero y negativos
- [x] Campos vacíos
- [x] Errores de red/base de datos
- [x] Operaciones concurrentes
- [x] Datos corruptos

### ✅ Interacciones de Usuario
- [x] Entrada de datos en formularios
- [x] Agregar/eliminar materiales
- [x] Agregar/eliminar piezas
- [x] Guardar proyectos
- [x] Actualizar proyectos existentes

## Configuración

### Jest Configuration (`jest.config.js`)
- Configuración para Next.js
- Mapeo de módulos con alias `@/`
- Configuración de cobertura
- Umbrales de cobertura (70% mínimo)

### Setup (`jest.setup.js`)
- Configuración de Testing Library
- Mocks para Next.js router
- Mocks para Supabase
- Mocks para framer-motion
- Mocks para react-hot-toast

## Mocks Utilizados

### Servicios
- **Supabase**: Mock completo del cliente de base de datos
- **ProjectService**: Mock de métodos CRUD
- **SalesService**: Mock de métodos CRUD y estadísticas
- **NotificationService**: Mock de notificaciones

### Librerías Externas
- **Next.js Router**: Mock de navegación
- **framer-motion**: Mock de animaciones
- **react-hot-toast**: Mock de notificaciones toast

## Criterios de Aceptación

### Cálculos de Costos
- ✅ Filamento: `(peso_g / 1000) * precio_€/kg`
- ✅ Electricidad: `horas * 0.2 * costo_€/kWh`
- ✅ Materiales: Suma de precios de materiales
- ✅ Total: Suma de todos los costos

### Precios de Venta
- ✅ Precio base: Costo total
- ✅ Con margen: `precio_base * (1 + margen%)`
- ✅ Con IVA: `precio_con_margen * (1 + iva%)`
- ✅ Precio recomendado: Redondeado a 0.50€

### Validaciones
- ✅ Nombre de proyecto requerido
- ✅ Valores numéricos positivos
- ✅ Peso de filamento > 0
- ✅ Precio de filamento > 0
- ✅ Horas de impresión > 0

### Gestión de Datos
- ✅ Crear proyecto → Calcular costos → Guardar
- ✅ Cargar proyecto existente → Editar → Actualizar
- ✅ Crear venta desde proyecto
- ✅ Manejo de errores sin romper UI

## Mantenimiento

### Agregar Nuevos Tests
1. Crear archivo en la carpeta correspondiente
2. Seguir convención de nombres: `*.test.ts` o `*.test.tsx`
3. Usar describe/it para estructura clara
4. Mockar dependencias externas
5. Probar casos edge y errores

### Actualizar Tests Existentes
1. Mantener compatibilidad con cambios de API
2. Actualizar mocks cuando sea necesario
3. Verificar cobertura después de cambios
4. Ejecutar suite completa antes de merge

### Debugging
```bash
# Ejecutar tests con debug
pnpm test -- --verbose

# Ejecutar test específico con debug
pnpm test -- --testNamePattern="useCostCalculations" --verbose

# Ver cobertura detallada
pnpm test:coverage -- --coverageReporters=text
```

## Reportes

### Cobertura
Los tests generan reportes de cobertura que muestran:
- Porcentaje de líneas cubiertas
- Porcentaje de funciones cubiertas
- Porcentaje de branches cubiertos
- Archivos con menor cobertura

### Performance
- Tests unitarios: < 1s por archivo
- Tests de integración: < 5s por archivo
- Suite completa: < 30s

## Contribución

Al agregar nuevas funcionalidades:
1. ✅ Escribir tests unitarios para la lógica
2. ✅ Escribir tests de integración para el flujo
3. ✅ Actualizar mocks si es necesario
4. ✅ Verificar que todos los tests pasen
5. ✅ Mantener cobertura > 70%

## Troubleshooting

### Errores Comunes
- **Module not found**: Verificar alias en jest.config.js
- **Mock not working**: Verificar setup en jest.setup.js
- **Async test failing**: Usar waitFor para operaciones asíncronas
- **Component not rendering**: Verificar mocks de dependencias

### Soluciones
```bash
# Limpiar cache de Jest
pnpm test -- --clearCache

# Reinstalar dependencias
rm -rf node_modules && pnpm install

# Verificar configuración
pnpm test -- --showConfig
``` 