import { ProjectService } from '../projectService'
import type { Material, Piece, DatabaseProject } from '@/types'

// Mock the supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        is: jest.fn(() => ({
          order: jest.fn(() => ({
            single: jest.fn(() => ({
              data: null,
              error: null,
            })),
          })),
        })),
      })),
      insert: jest.fn(() => ({
        select: jest.fn(() => ({
          single: jest.fn(() => ({
            data: null,
            error: null,
          })),
        })),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn(() => ({
            single: jest.fn(() => ({
              data: null,
              error: null,
            })),
          })),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: null,
          error: null,
        })),
      })),
    })),
  }),
  auth: {
    getUser: jest.fn(),
    getSession: jest.fn(),
    signOut: jest.fn(),
  },
}

jest.mock('@/lib/supabase', () => ({
  createClient: jest.fn(() => mockSupabase),
}))

jest.mock('../notificationService', () => ({
  NotificationService: {
    notifyNewProject: jest.fn(),
  },
}))

describe('ProjectService', () => {
  let projectService: ProjectService
  const mockMaterials: Material[] = [
    { id: '1', name: 'PLA', price: 20 },
    { id: '2', name: 'ABS', price: 25 }
  ]

  const mockPieces: Piece[] = [
    {
      id: '1',
      name: 'Test Piece',
      filamentWeight: 100,
      filamentPrice: 25,
      printHours: 2,
      quantity: 1,
      notes: 'Test'
    }
  ]

  const mockProject: Omit<DatabaseProject, 'id' | 'created_at' | 'updated_at'> = {
    user_id: 'user123',
    name: 'Test Project',
    filament_weight: 500,
    filament_price: 25,
    print_hours: 10,
    electricity_cost: 0.15,
    materials: mockMaterials,
    total_cost: 37.8,
    vat_percentage: 21,
    profit_margin: 30,
    recommended_price: 45.5,
    status: 'draft',
    pieces: mockPieces
  }

  beforeEach(() => {
    jest.clearAllMocks()
    projectService = new ProjectService()
  })

  describe('getProjects', () => {
    it('debería obtener proyectos personales cuando no se proporciona teamId', async () => {
      const mockData = [
        { ...mockProject, id: '1', created_at: '2024-01-01', updated_at: '2024-01-01' },
        { ...mockProject, id: '2', created_at: '2024-01-02', updated_at: '2024-01-02' }
      ]

      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockData, error: null })
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery)
      })

      const result = await projectService.getProjects('user123')

      expect(mockSupabase.from).toHaveBeenCalledWith('projects')
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user123')
      expect(mockQuery.is).toHaveBeenCalledWith('team_id', null)
      expect(result).toEqual(mockData)
    })

    it('debería obtener proyectos de equipo cuando se proporciona teamId', async () => {
      const mockData = [
        { ...mockProject, id: '1', team_id: 'team123', created_at: '2024-01-01', updated_at: '2024-01-01' }
      ]

      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockData, error: null })
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery)
      })

      const result = await projectService.getProjects('user123', 'team123')

      expect(mockQuery.eq).toHaveBeenCalledWith('team_id', 'team123')
      expect(result).toEqual(mockData)
    })

    it('debería manejar errores correctamente', async () => {
      const mockError = { message: 'Database error' }
      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: mockError })
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery)
      })

      await expect(projectService.getProjects('user123')).rejects.toThrow('Error fetching projects: Database error')
    })
  })

  describe('getProject', () => {
    it('debería obtener un proyecto específico', async () => {
      const mockData = { ...mockProject, id: '1', created_at: '2024-01-01', updated_at: '2024-01-01' }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockData, error: null })
          })
        })
      })

      const result = await projectService.getProject('1')

      expect(mockSupabase.from).toHaveBeenCalledWith('projects')
      expect(result).toEqual(mockData)
    })

    it('debería manejar errores al obtener proyecto', async () => {
      const mockError = { message: 'Project not found' }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: mockError })
          })
        })
      })

      await expect(projectService.getProject('1')).rejects.toThrow('Error fetching project: Project not found')
    })
  })

  describe('createProject', () => {
    it('debería crear un proyecto correctamente', async () => {
      const mockData = { ...mockProject, id: '1', created_at: '2024-01-01', updated_at: '2024-01-01' }

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockData, error: null })
          })
        })
      })

      const result = await projectService.createProject(mockProject)

      expect(mockSupabase.from).toHaveBeenCalledWith('projects')
      expect(result).toEqual(mockData)
    })

    it('debería manejar errores al crear proyecto', async () => {
      const mockError = { message: 'Validation error' }

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: mockError })
          })
        })
      })

      await expect(projectService.createProject(mockProject)).rejects.toThrow('Error creating project: Validation error')
    })
  })

  describe('updateProject', () => {
    it('debería actualizar un proyecto correctamente', async () => {
      const mockData = { ...mockProject, id: '1', name: 'Updated Project', created_at: '2024-01-01', updated_at: '2024-01-01' }

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockData, error: null })
            })
          })
        })
      })

      const result = await projectService.updateProject('1', { name: 'Updated Project' })

      expect(mockSupabase.from).toHaveBeenCalledWith('projects')
      expect(result).toEqual(mockData)
    })

    it('debería manejar errores al actualizar proyecto', async () => {
      const mockError = { message: 'Update failed' }

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: mockError })
            })
          })
        })
      })

      await expect(projectService.updateProject('1', { name: 'Updated' })).rejects.toThrow('Error updating project: Update failed')
    })
  })

  describe('deleteProject', () => {
    it('debería eliminar un proyecto correctamente', async () => {
      mockSupabase.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: null, error: null })
        })
      })

      await projectService.deleteProject('1')

      expect(mockSupabase.from).toHaveBeenCalledWith('projects')
    })

    it('debería manejar errores al eliminar proyecto', async () => {
      const mockError = { message: 'Delete failed' }

      mockSupabase.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: null, error: mockError })
        })
      })

      await expect(projectService.deleteProject('1')).rejects.toThrow('Error deleting project: Delete failed')
    })
  })

  describe('calculateProjectCosts', () => {
    it('debería calcular costos con piezas', () => {
      const project = {
        filament_weight: 500,
        filament_price: 25,
        print_hours: 10,
        electricity_cost: 0.15,
        materials: mockMaterials,
        pieces: mockPieces
      }

      const result = projectService.calculateProjectCosts(project)

      // Filament cost: (100g * 1 * 25€/kg) / 1000 = 2.5€
      expect(result.filamentCost).toBe(2.5)
      
      // Electricity cost: 2h * 0.15€/kWh = 0.3€
      expect(result.electricityCost).toBe(0.3)
      
      // Materials cost: 20 + 25 = 45€
      expect(result.materialsCost).toBe(45)
      
      // Total cost: 2.5 + 0.3 + 45 = 47.8€
      expect(result.totalCost).toBe(47.8)
      
      expect(result.totalFilamentWeight).toBe(100)
      expect(result.totalPrintHours).toBe(2)
    })

    it('debería calcular costos sin piezas', () => {
      const project = {
        filament_weight: 1000,
        filament_price: 20,
        print_hours: 5,
        electricity_cost: 0.12,
        materials: mockMaterials,
        pieces: undefined
      }

      const result = projectService.calculateProjectCosts(project)

      // Filament cost: (1000g * 20€/kg) / 1000 = 20€
      expect(result.filamentCost).toBe(20)
      
      // Electricity cost: 5h * 0.12€/kWh = 0.6€
      expect(result.electricityCost).toBe(0.6)
      
      // Materials cost: 20 + 25 = 45€
      expect(result.materialsCost).toBe(45)
      
      // Total cost: 20 + 0.6 + 45 = 65.6€
      expect(result.totalCost).toBe(65.6)
      
      expect(result.totalFilamentWeight).toBe(1000)
      expect(result.totalPrintHours).toBe(5)
    })
  })

  describe('calculateSalePrice', () => {
    it('debería calcular precio de venta correctamente', () => {
      const totalCost = 100
      const vatPercentage = 21
      const profitMargin = 30

      const result = projectService.calculateSalePrice(totalCost, vatPercentage, profitMargin)

      // Cost with VAT: 100 * 1.21 = 121€
      // Price with margin: 121 * 1.30 = 157.3€
      expect(result).toBe(157.3)
    })

    it('debería manejar valores cero', () => {
      const result = projectService.calculateSalePrice(0, 0, 0)
      expect(result).toBe(0)
    })

    it('debería manejar porcentajes negativos', () => {
      const result = projectService.calculateSalePrice(100, -10, -20)
      // 100 * 0.9 * 0.8 = 72
      expect(result).toBe(72)
    })
  })
}) 