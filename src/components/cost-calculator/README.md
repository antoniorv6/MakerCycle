# Cost Calculator - Importación desde Archivos .gcode.3mf

## Funcionalidad Implementada

Se ha implementado una funcionalidad completa para importar proyectos de impresión 3D desde archivos `.gcode.3mf` exportados por OrcaSlicer.

### Características Principales

1. **Selección de Modo de Creación**
   - Modo Manual: Inserción tradicional de datos
   - Modo Importación: Subida de archivos .gcode.3mf

2. **Importación Automática de Datos**
   - Extracción automática del peso del filamento
   - Extracción del tiempo de impresión
   - Extracción de configuraciones (altura de capa, diámetro del nozzle)
   - Detección del tipo de filamento
   - Conversión de múltiples placas en piezas separadas
   - **NUEVO:** Soporte para múltiples filamentos por placa
   - **NUEVO:** Detección automática de perfiles de filamentos con precios
   - **NUEVO:** Opción de guardar perfiles detectados en la biblioteca de materiales
   - **NUEVO:** Consolidación automática de perfiles duplicados entre placas
   - **NUEVO:** Extracción automática del color del filamento (hex)

3. **Interfaz de Usuario Intuitiva**
   - Drag & drop para subir archivos
   - Preview de datos extraídos antes de importar
   - Validación de archivos .gcode.3mf
   - Manejo de errores con mensajes informativos
   - **NUEVO:** Selección de perfiles de filamentos a guardar
   - **NUEVO:** Preview detallado de múltiples filamentos por placa
   - **NUEVO:** Indicador de cuántas placas usan cada perfil único
   - **NUEVO:** Visualización del color del filamento con círculo de color
   - **NUEVO:** Guardado automático de perfiles seleccionados al importar

### Componentes Creados

- `ModeSelection`: Pantalla de selección entre modo manual e importación
- `FileImportView`: Interfaz de subida y procesamiento de archivos
- `CostCalculatorWrapper`: Wrapper principal que maneja los diferentes modos
- `PrintCostCalculator`: Librería para procesar archivos .gcode.3mf

### Flujo de Trabajo

1. El usuario accede al cost calculator
2. Selecciona "Importar desde Archivo"
3. Sube un archivo .gcode.3mf de OrcaSlicer
4. El sistema extrae automáticamente:
   - Información de cada placa (peso, tiempo, configuraciones)
   - Perfiles de filamentos con precios
   - Totales del proyecto
   - Metadatos adicionales
5. El usuario revisa los datos extraídos y selecciona qué perfiles guardar
6. Opcionalmente guarda los perfiles de filamentos en su biblioteca
7. Confirma la importación
8. Se abre el formulario de costes con los datos pre-rellenados
9. Cada placa se convierte en una pieza editable del proyecto

### Uso

```tsx
import CostCalculator from '@/components/cost-calculator';

// El componente maneja automáticamente los diferentes modos
<CostCalculator
  loadedProject={project} // Opcional: proyecto existente
  onProjectSaved={handleSave}
  onNavigateToSettings={handleSettings}
/>
```

### Archivos de Soporte

- `lib/from_3mf.ts`: Librería principal para procesar archivos .gcode.3mf
- Dependencia: `jszip` para leer archivos ZIP/3MF

### Compatibilidad

- Archivos .gcode.3mf de OrcaSlicer
- Múltiples placas por archivo
- Diferentes formatos de tiempo de impresión
- Varios tipos de filamento
