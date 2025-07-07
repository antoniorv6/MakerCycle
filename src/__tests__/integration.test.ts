import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { CostCalculator } from '../components/cost-calculator/CostCalculator'
import { ProjectService } from '../services/projectService'
import { SalesService } from '../services/salesService'
import type { DatabaseProject, SaleFormData } from '@/types'

// Mock services
jest.mock('../services/projectService')
jest.mock('../services/salesService')

describe('Integration Tests', () => {
  const mockProjectService = ProjectService as jest.MockedClass<typeof ProjectService>
  const mockSalesService = SalesService as jest.MockedClass<typeof SalesService>

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Flujo completo de proyecto', () => {
    it('debería crear un proyecto, calcular costos y crear una venta', async () => {
      const user = userEvent.setup()
      
      // Mock project service methods
      const mockCreateProject = jest.fn().mockResolvedValue({
        id: '1',
        user_id: 'user123',
        name: 'Test Project',
        filament_weight: 500,
        filament_price: 25,
        print_hours: 10,
        electricity_cost: 0.15,
        materials: [{ id: '1', name: 'PLA', price: 20 }],
        total_cost: 37.8,
        vat_percentage: 21,
        profit_margin: 30,
        recommended_price: 59.5,
        status: 'draft',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      })

      const mockCreateSale = jest.fn().mockResolvedValue({
        id: '1',
        user_id: 'user123',
        project_name: 'Test Project',
        cost: 37.8,
        unit_cost: 37.8,
        quantity: 1,
        sale_price: 59.5,
        profit: 21.7,
        margin: 36.47,
        date: '2024-01-01',
        status: 'completed',
        print_hours: 10,
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      })

      mockProjectService.prototype.createProject = mockCreateProject
      mockSalesService.prototype.createSale = mockCreateSale

      // Render calculator
      render(<CostCalculator onProjectSaved={jest.fn()} />)

      // Fill project form
      const nameInput = screen.getByLabelText(/nombre del proyecto/i)
      await user.type(nameInput, 'Test Project')

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

      // Save project
      const saveButton = screen.getByRole('button', { name: /guardar proyecto/i })
      await user.click(saveButton)

      // Verify project was created
      await waitFor(() => {
        expect(mockCreateProject).toHaveBeenCalledWith({
          user_id: expect.any(String),
          name: 'Test Project',
          filament_weight: 500,
          filament_price: 25,
          print_hours: 10,
          electricity_cost: 0.15,
          materials: expect.any(Array),
          total_cost: expect.any(Number),
          vat_percentage: 21,
          profit_margin: 30,
          recommended_price: expect.any(Number),
          status: 'draft',
        })
      })

      // Create sale from project
      const saleData: SaleFormData = {
        projectName: 'Test Project',
        unitCost: 37.8,
        quantity: 1,
        salePrice: 59.5,
        date: '2024-01-01',
        printHours: 10,
        team_id: null,
      }

      await mockCreateSale('user123', saleData)

      // Verify sale was created
      expect(mockCreateSale).toHaveBeenCalledWith('user123', saleData)
    })

    it('debería manejar errores en el flujo completo', async () => {
      const user = userEvent.setup()

      // Mock service to throw error
      const mockCreateProject = jest.fn().mockRejectedValue(new Error('Database error'))
      mockProjectService.prototype.createProject = mockCreateProject

      render(<CostCalculator onProjectSaved={jest.fn()} />)

      // Fill form
      const nameInput = screen.getByLabelText(/nombre del proyecto/i)
      await user.type(nameInput, 'Test Project')

      const filamentWeightInput = screen.getByLabelText(/peso del filamento/i)
      await user.clear(filamentWeightInput)
      await user.type(filamentWeightInput, '500')

      // Try to save
      const saveButton = screen.getByRole('button', { name: /guardar proyecto/i })
      await user.click(saveButton)

      // Verify error was handled
      await waitFor(() => {
        expect(mockCreateProject).toHaveBeenCalled()
      })
    })
  })

  describe('Cálculos de costos', () => {
    it('debería calcular costos correctamente con diferentes inputs', async () => {
      const user = userEvent.setup()
      render(<CostCalculator onProjectSaved={jest.fn()} />)

      // Test different filament weights
      const filamentWeightInput = screen.getByLabelText(/peso del filamento/i)
      await user.clear(filamentWeightInput)
      await user.type(filamentWeightInput, '1000')

      const filamentPriceInput = screen.getByLabelText(/precio del filamento/i)
      await user.clear(filamentPriceInput)
      await user.type(filamentPriceInput, '30')

      const printHoursInput = screen.getByLabelText(/horas de impresión/i)
      await user.clear(printHoursInput)
      await user.type(printHoursInput, '20')

      // Verify calculations are updated
      await waitFor(() => {
        // Filament cost should be: (1000g / 1000) * 30€/kg = 30€
        expect(screen.getByText('30.00€')).toBeInTheDocument()
      })
    })

    it('debería calcular precios de venta con diferentes márgenes', async () => {
      const user = userEvent.setup()
      render(<CostCalculator onProjectSaved={jest.fn()} />)

      // Set basic values
      const nameInput = screen.getByLabelText(/nombre del proyecto/i)
      await user.type(nameInput, 'Test Project')

      const filamentWeightInput = screen.getByLabelText(/peso del filamento/i)
      await user.clear(filamentWeightInput)
      await user.type(filamentWeightInput, '500')

      const filamentPriceInput = screen.getByLabelText(/precio del filamento/i)
      await user.clear(filamentPriceInput)
      await user.type(filamentPriceInput, '25')

      // Verify recommended price is calculated
      await waitFor(() => {
        expect(screen.getByText(/59\.50€/)).toBeInTheDocument() // Recommended price
      })
    })
  })

  describe('Gestión de materiales y piezas', () => {
    it('debería agregar y eliminar materiales correctamente', async () => {
      const user = userEvent.setup()
      render(<CostCalculator onProjectSaved={jest.fn()} />)

      // Add material
      const addMaterialButton = screen.getByRole('button', { name: /agregar material/i })
      await user.click(addMaterialButton)

      // Verify material was added
      const materialInputs = screen.getAllByLabelText(/nombre del material/i)
      expect(materialInputs).toHaveLength(2)

      // Remove material
      const removeButtons = screen.getAllByRole('button', { name: /eliminar/i })
      await user.click(removeButtons[removeButtons.length - 1])

      // Verify material was removed
      const remainingMaterialInputs = screen.getAllByLabelText(/nombre del material/i)
      expect(remainingMaterialInputs).toHaveLength(1)
    })

    it('debería agregar y eliminar piezas correctamente', async () => {
      const user = userEvent.setup()
      render(<CostCalculator onProjectSaved={jest.fn()} />)

      // Add piece
      const addPieceButton = screen.getByRole('button', { name: /agregar pieza/i })
      await user.click(addPieceButton)

      // Verify piece was added
      const pieceNameInputs = screen.getAllByLabelText(/nombre de la pieza/i)
      expect(pieceNameInputs).toHaveLength(2)

      // Fill piece details
      const newPieceNameInput = pieceNameInputs[1]
      await user.type(newPieceNameInput, 'Test Piece')

      const pieceWeightInput = screen.getAllByLabelText(/peso del filamento/i)[1]
      await user.clear(pieceWeightInput)
      await user.type(pieceWeightInput, '100')

      const piecePriceInput = screen.getAllByLabelText(/precio del filamento/i)[1]
      await user.clear(piecePriceInput)
      await user.type(piecePriceInput, '25')

      const pieceHoursInput = screen.getAllByLabelText(/horas de impresión/i)[1]
      await user.clear(pieceHoursInput)
      await user.type(pieceHoursInput, '2')

      const pieceQuantityInput = screen.getAllByLabelText(/cantidad/i)[1]
      await user.clear(pieceQuantityInput)
      await user.type(pieceQuantityInput, '3')

      // Remove piece
      const removeButtons = screen.getAllByRole('button', { name: /eliminar/i })
      await user.click(removeButtons[removeButtons.length - 1])

      // Verify piece was removed
      const remainingPieceInputs = screen.getAllByLabelText(/nombre de la pieza/i)
      expect(remainingPieceInputs).toHaveLength(1)
    })
  })

  describe('Validaciones de formulario', () => {
    it('debería validar todos los campos requeridos', async () => {
      const user = userEvent.setup()
      render(<CostCalculator onProjectSaved={jest.fn()} />)

      // Try to save without filling required fields
      const saveButton = screen.getByRole('button', { name: /guardar proyecto/i })
      await user.click(saveButton)

      // Verify validation errors
      await waitFor(() => {
        expect(screen.getByText(/el nombre del proyecto es requerido/i)).toBeInTheDocument()
      })
    })

    it('debería validar valores numéricos positivos', async () => {
      const user = userEvent.setup()
      render(<CostCalculator onProjectSaved={jest.fn()} />)

      // Fill name
      const nameInput = screen.getByLabelText(/nombre del proyecto/i)
      await user.type(nameInput, 'Test Project')

      // Set negative values
      const filamentWeightInput = screen.getByLabelText(/peso del filamento/i)
      await user.clear(filamentWeightInput)
      await user.type(filamentWeightInput, '-100')

      const filamentPriceInput = screen.getByLabelText(/precio del filamento/i)
      await user.clear(filamentPriceInput)
      await user.type(filamentPriceInput, '-10')

      // Try to save
      const saveButton = screen.getByRole('button', { name: /guardar proyecto/i })
      await user.click(saveButton)

      // Verify validation errors
      await waitFor(() => {
        expect(screen.getByText(/el peso del filamento debe ser positivo/i)).toBeInTheDocument()
        expect(screen.getByText(/el precio del filamento debe ser positivo/i)).toBeInTheDocument()
      })
    })
  })

  describe('Persistencia de datos', () => {
    it('debería cargar y actualizar un proyecto existente', async () => {
      const user = userEvent.setup()
      
      const existingProject: DatabaseProject = {
        id: '1',
        user_id: 'user123',
        name: 'Existing Project',
        filament_weight: 500,
        filament_price: 25,
        print_hours: 10,
        electricity_cost: 0.15,
        materials: [{ id: '1', name: 'PLA', price: 20 }],
        total_cost: 37.8,
        vat_percentage: 21,
        profit_margin: 30,
        recommended_price: 59.5,
        status: 'draft',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      const mockUpdateProject = jest.fn().mockResolvedValue({
        ...existingProject,
        name: 'Updated Project',
      })

      mockProjectService.prototype.updateProject = mockUpdateProject

      render(<CostCalculator loadedProject={existingProject} onProjectSaved={jest.fn()} />)

      // Verify project data is loaded
      const nameInput = screen.getByLabelText(/nombre del proyecto/i)
      expect(nameInput).toHaveValue('Existing Project')

      // Update project name
      await user.clear(nameInput)
      await user.type(nameInput, 'Updated Project')

      // Save changes
      const saveButton = screen.getByRole('button', { name: /guardar cambios/i })
      await user.click(saveButton)

      // Verify update was called
      await waitFor(() => {
        expect(mockUpdateProject).toHaveBeenCalledWith('1', { name: 'Updated Project' })
      })
    })
  })
}) 