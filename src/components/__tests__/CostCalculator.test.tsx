import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CostCalculator } from '../cost-calculator/CostCalculator'
import type { DatabaseProject } from '@/types'

// Mock the useCostCalculations hook
jest.mock('../cost-calculator/hooks/useCostCalculations', () => ({
  useCostCalculations: jest.fn(() => ({
    costs: {
      filament: 12.5,
      electricity: 0.3,
      materials: 25,
      total: 37.8,
    },
    salePrice: {
      basePrice: 37.8,
      priceWithMargin: 49.14,
      priceWithTax: 59.46,
      recommendedPrice: 59.5,
    },
    totalFilamentWeight: 500,
    totalPrintHours: 10,
    totalFilamentCost: 12.5,
    totalElectricityCost: 0.3,
  })),
}))

// Mock the project service
jest.mock('@/services/projectService', () => ({
  projectService: {
    createProject: jest.fn(),
    updateProject: jest.fn(),
  },
}))

describe('CostCalculator', () => {
  const mockProject: DatabaseProject = {
    id: '1',
    user_id: 'user123',
    name: 'Test Project',
    filament_weight: 500,
    filament_price: 25,
    print_hours: 10,
    electricity_cost: 0.15,
    materials: [
      { id: '1', name: 'PLA', price: 20 },
      { id: '2', name: 'ABS', price: 25 },
    ],
    total_cost: 37.8,
    vat_percentage: 21,
    profit_margin: 30,
    recommended_price: 59.5,
    status: 'draft',
    created_at: '2024-01-01',
    updated_at: '2024-01-01',
  }

  const defaultProps = {
    onProjectSaved: jest.fn(),
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Renderizado básico', () => {
    it('debería renderizar el componente correctamente', () => {
      render(<CostCalculator {...defaultProps} />)

      expect(screen.getByText('Calculadora de Costos')).toBeInTheDocument()
      expect(screen.getByText('Información del Proyecto')).toBeInTheDocument()
      expect(screen.getByText('Filamento')).toBeInTheDocument()
      expect(screen.getByText('Electricidad')).toBeInTheDocument()
      expect(screen.getByText('Materiales')).toBeInTheDocument()
      expect(screen.getByText('Piezas')).toBeInTheDocument()
    })

    it('debería mostrar valores por defecto', () => {
      render(<CostCalculator {...defaultProps} />)

      // Verificar que los campos tienen valores por defecto
      const nameInput = screen.getByLabelText(/nombre del proyecto/i)
      expect(nameInput).toHaveValue('')

      const filamentWeightInput = screen.getByLabelText(/peso del filamento/i)
      expect(filamentWeightInput).toHaveValue(0)

      const filamentPriceInput = screen.getByLabelText(/precio del filamento/i)
      expect(filamentPriceInput).toHaveValue(0)
    })
  })

  describe('Carga de proyecto existente', () => {
    it('debería cargar datos de proyecto existente', () => {
      render(<CostCalculator loadedProject={mockProject} {...defaultProps} />)

      const nameInput = screen.getByLabelText(/nombre del proyecto/i)
      expect(nameInput).toHaveValue('Test Project')

      const filamentWeightInput = screen.getByLabelText(/peso del filamento/i)
      expect(filamentWeightInput).toHaveValue(500)

      const filamentPriceInput = screen.getByLabelText(/precio del filamento/i)
      expect(filamentPriceInput).toHaveValue(25)
    })

    it('debería mostrar el estado correcto del proyecto', () => {
      render(<CostCalculator loadedProject={mockProject} {...defaultProps} />)

      // Verificar que el botón de guardar muestra el texto correcto
      const saveButton = screen.getByRole('button', { name: /guardar cambios/i })
      expect(saveButton).toBeInTheDocument()
    })
  })

  describe('Interacción del usuario', () => {
    it('debería actualizar el nombre del proyecto', async () => {
      const user = userEvent.setup()
      render(<CostCalculator {...defaultProps} />)

      const nameInput = screen.getByLabelText(/nombre del proyecto/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'Nuevo Proyecto')

      expect(nameInput).toHaveValue('Nuevo Proyecto')
    })

    it('debería actualizar el peso del filamento', async () => {
      const user = userEvent.setup()
      render(<CostCalculator {...defaultProps} />)

      const filamentWeightInput = screen.getByLabelText(/peso del filamento/i)
      await user.clear(filamentWeightInput)
      await user.type(filamentWeightInput, '750')

      expect(filamentWeightInput).toHaveValue(750)
    })

    it('debería actualizar el precio del filamento', async () => {
      const user = userEvent.setup()
      render(<CostCalculator {...defaultProps} />)

      const filamentPriceInput = screen.getByLabelText(/precio del filamento/i)
      await user.clear(filamentPriceInput)
      await user.type(filamentPriceInput, '30')

      expect(filamentPriceInput).toHaveValue(30)
    })

    it('debería actualizar las horas de impresión', async () => {
      const user = userEvent.setup()
      render(<CostCalculator {...defaultProps} />)

      const printHoursInput = screen.getByLabelText(/horas de impresión/i)
      await user.clear(printHoursInput)
      await user.type(printHoursInput, '15')

      expect(printHoursInput).toHaveValue(15)
    })

    it('debería actualizar el costo de electricidad', async () => {
      const user = userEvent.setup()
      render(<CostCalculator {...defaultProps} />)

      const electricityInput = screen.getByLabelText(/costo de electricidad/i)
      await user.clear(electricityInput)
      await user.type(electricityInput, '0.20')

      expect(electricityInput).toHaveValue(0.2)
    })
  })

  describe('Validación de formulario', () => {
    it('debería mostrar error cuando el nombre está vacío', async () => {
      const user = userEvent.setup()
      render(<CostCalculator {...defaultProps} />)

      const saveButton = screen.getByRole('button', { name: /guardar proyecto/i })
      await user.click(saveButton)

      // Verificar que se muestra un mensaje de error
      await waitFor(() => {
        expect(screen.getByText(/el nombre del proyecto es requerido/i)).toBeInTheDocument()
      })
    })

    it('debería mostrar error cuando el peso del filamento es negativo', async () => {
      const user = userEvent.setup()
      render(<CostCalculator {...defaultProps} />)

      const nameInput = screen.getByLabelText(/nombre del proyecto/i)
      await user.type(nameInput, 'Test Project')

      const filamentWeightInput = screen.getByLabelText(/peso del filamento/i)
      await user.clear(filamentWeightInput)
      await user.type(filamentWeightInput, '-100')

      const saveButton = screen.getByRole('button', { name: /guardar proyecto/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/el peso del filamento debe ser positivo/i)).toBeInTheDocument()
      })
    })

    it('debería mostrar error cuando el precio del filamento es negativo', async () => {
      const user = userEvent.setup()
      render(<CostCalculator {...defaultProps} />)

      const nameInput = screen.getByLabelText(/nombre del proyecto/i)
      await user.type(nameInput, 'Test Project')

      const filamentPriceInput = screen.getByLabelText(/precio del filamento/i)
      await user.clear(filamentPriceInput)
      await user.type(filamentPriceInput, '-10')

      const saveButton = screen.getByRole('button', { name: /guardar proyecto/i })
      await user.click(saveButton)

      await waitFor(() => {
        expect(screen.getByText(/el precio del filamento debe ser positivo/i)).toBeInTheDocument()
      })
    })
  })

  describe('Guardado de proyecto', () => {
    it('debería guardar un nuevo proyecto correctamente', async () => {
      const user = userEvent.setup()
      const mockOnProjectSaved = jest.fn()
      render(<CostCalculator onProjectSaved={mockOnProjectSaved} />)

      // Llenar el formulario
      const nameInput = screen.getByLabelText(/nombre del proyecto/i)
      await user.type(nameInput, 'Nuevo Proyecto')

      const filamentWeightInput = screen.getByLabelText(/peso del filamento/i)
      await user.clear(filamentWeightInput)
      await user.type(filamentWeightInput, '500')

      const filamentPriceInput = screen.getByLabelText(/precio del filamento/i)
      await user.clear(filamentPriceInput)
      await user.type(filamentPriceInput, '25')

      const printHoursInput = screen.getByLabelText(/horas de impresión/i)
      await user.clear(printHoursInput)
      await user.type(printHoursInput, '10')

      const electricityInput = screen.getByLabelText(/costo de electricidad/i)
      await user.clear(electricityInput)
      await user.type(electricityInput, '0.15')

      // Guardar el proyecto
      const saveButton = screen.getByRole('button', { name: /guardar proyecto/i })
      await user.click(saveButton)

      // Verificar que se llamó la función de callback
      await waitFor(() => {
        expect(mockOnProjectSaved).toHaveBeenCalled()
      })
    })

    it('debería actualizar un proyecto existente', async () => {
      const user = userEvent.setup()
      const mockOnProjectSaved = jest.fn()
      render(<CostCalculator loadedProject={mockProject} onProjectSaved={mockOnProjectSaved} />)

      // Modificar el nombre del proyecto
      const nameInput = screen.getByLabelText(/nombre del proyecto/i)
      await user.clear(nameInput)
      await user.type(nameInput, 'Proyecto Actualizado')

      // Guardar los cambios
      const saveButton = screen.getByRole('button', { name: /guardar cambios/i })
      await user.click(saveButton)

      // Verificar que se llamó la función de callback
      await waitFor(() => {
        expect(mockOnProjectSaved).toHaveBeenCalled()
      })
    })
  })

  describe('Cálculos en tiempo real', () => {
    it('debería mostrar los costos calculados', () => {
      render(<CostCalculator {...defaultProps} />)

      // Verificar que se muestran los costos calculados
      expect(screen.getByText('12.50€')).toBeInTheDocument() // Filament cost
      expect(screen.getByText('0.30€')).toBeInTheDocument() // Electricity cost
      expect(screen.getByText('25.00€')).toBeInTheDocument() // Materials cost
      expect(screen.getByText('37.80€')).toBeInTheDocument() // Total cost
    })

    it('debería mostrar los precios de venta calculados', () => {
      render(<CostCalculator {...defaultProps} />)

      // Verificar que se muestran los precios calculados
      expect(screen.getByText('37.80€')).toBeInTheDocument() // Base price
      expect(screen.getByText('49.14€')).toBeInTheDocument() // Price with margin
      expect(screen.getByText('59.46€')).toBeInTheDocument() // Price with tax
      expect(screen.getByText('59.50€')).toBeInTheDocument() // Recommended price
    })
  })

  describe('Gestión de materiales', () => {
    it('debería agregar un nuevo material', async () => {
      const user = userEvent.setup()
      render(<CostCalculator {...defaultProps} />)

      const addMaterialButton = screen.getByRole('button', { name: /agregar material/i })
      await user.click(addMaterialButton)

      // Verificar que se agregó un nuevo campo de material
      const materialInputs = screen.getAllByLabelText(/nombre del material/i)
      expect(materialInputs).toHaveLength(2) // 1 inicial + 1 nuevo
    })

    it('debería eliminar un material', async () => {
      const user = userEvent.setup()
      render(<CostCalculator {...defaultProps} />)

      // Agregar un material primero
      const addMaterialButton = screen.getByRole('button', { name: /agregar material/i })
      await user.click(addMaterialButton)

      // Eliminar el material agregado
      const removeButtons = screen.getAllByRole('button', { name: /eliminar/i })
      await user.click(removeButtons[removeButtons.length - 1])

      // Verificar que se eliminó el material
      const materialInputs = screen.getAllByLabelText(/nombre del material/i)
      expect(materialInputs).toHaveLength(1) // Solo el inicial
    })
  })

  describe('Gestión de piezas', () => {
    it('debería agregar una nueva pieza', async () => {
      const user = userEvent.setup()
      render(<CostCalculator {...defaultProps} />)

      const addPieceButton = screen.getByRole('button', { name: /agregar pieza/i })
      await user.click(addPieceButton)

      // Verificar que se agregó una nueva pieza
      const pieceNameInputs = screen.getAllByLabelText(/nombre de la pieza/i)
      expect(pieceNameInputs).toHaveLength(2) // 1 inicial + 1 nueva
    })

    it('debería eliminar una pieza', async () => {
      const user = userEvent.setup()
      render(<CostCalculator {...defaultProps} />)

      // Agregar una pieza primero
      const addPieceButton = screen.getByRole('button', { name: /agregar pieza/i })
      await user.click(addPieceButton)

      // Eliminar la pieza agregada
      const removeButtons = screen.getAllByRole('button', { name: /eliminar/i })
      await user.click(removeButtons[removeButtons.length - 1])

      // Verificar que se eliminó la pieza
      const pieceNameInputs = screen.getAllByLabelText(/nombre de la pieza/i)
      expect(pieceNameInputs).toHaveLength(1) // Solo la inicial
    })
  })
}) 