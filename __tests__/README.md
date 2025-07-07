# Test Suite - 3DCraftFlow

Esta suite de tests está configurada para probar todos los componentes y funcionalidades de la aplicación 3DCraftFlow.

## Estructura de Tests

```
__tests__/
├── components/           # Tests de componentes React
│   ├── auth/            # Tests de autenticación
│   ├── cost-calculator/ # Tests de calculadora de costes
│   └── ...              # Otros componentes
├── hooks/               # Tests de custom hooks
├── utils/               # Tests de utilidades
└── utils/               # Utilidades de testing
    └── test-utils.tsx   # Configuración común para tests
```

## Comandos de Testing

```bash
# Ejecutar todos los tests
pnpm test

# Ejecutar tests en modo watch
pnpm test:watch

# Ejecutar tests con coverage
pnpm test:coverage

# Ejecutar tests para CI/CD
pnpm test:ci
```

## Configuración

### Jest
- Configurado para Next.js con TypeScript
- Soporte para JSX/TSX
- Coverage reporting
- Mock automático de módulos comunes

### Testing Library
- React Testing Library para testing de componentes
- User Event para simular interacciones de usuario
- Jest DOM para matchers adicionales

### Mocks Configurados
- Next.js Router
- Next.js Image
- Framer Motion
- React Hot Toast
- Supabase Client
- ResizeObserver
- Window.matchMedia

## Escribiendo Tests

### Componentes React
```typescript
import { render, screen } from '@tests/utils/test-utils'
import MyComponent from '@/components/MyComponent'

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />)
    expect(screen.getByText('Hello')).toBeInTheDocument()
  })
})
```

### Custom Hooks
```typescript
import { renderHook, act } from '@testing-library/react'
import { useMyHook } from '@/hooks/useMyHook'

describe('useMyHook', () => {
  it('returns expected values', () => {
    const { result } = renderHook(() => useMyHook())
    expect(result.current.value).toBe(expectedValue)
  })
})
```

### Utilidades
```typescript
import { myUtil } from '@/utils/myUtil'

describe('myUtil', () => {
  it('processes data correctly', () => {
    const result = myUtil(input)
    expect(result).toEqual(expectedOutput)
  })
})
```

## Coverage

El proyecto está configurado para mantener un coverage mínimo del 70% en:
- Branches
- Functions
- Lines
- Statements

## CI/CD

Los tests se ejecutan automáticamente en:
- Push a main/develop
- Pull requests a main
- Múltiples versiones de Node.js (18.x, 20.x)

## Troubleshooting

### Errores comunes

1. **Module not found**: Verificar que el path del import sea correcto
2. **Type errors**: Asegurar que los tipos estén correctamente definidos
3. **Mock errors**: Verificar que los mocks estén configurados en jest.setup.js

### Debugging

```bash
# Ejecutar un test específico
pnpm test -- --testNamePattern="MyComponent"

# Ejecutar tests con verbose output
pnpm test -- --verbose

# Ejecutar tests con coverage para un archivo específico
pnpm test -- --coverage --collectCoverageFrom="components/MyComponent.tsx"
``` 