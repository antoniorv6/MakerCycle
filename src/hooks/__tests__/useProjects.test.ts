import { renderHook, waitFor } from '@testing-library/react'
import { useProjects } from '../useProjects'
import type { Project } from '@/types'

// Mock the project service
const mockProjectService = {
  getProjects: jest.fn(),
  createProject: jest.fn(),
  updateProject: jest.fn(),
  deleteProject: jest.fn(),
}

jest.mock('@/services/projectService', () => ({
  projectService: mockProjectService,
}))

describe('useProjects', () => {
  const mockProjects: Project[] = [
    {
      id: '1',
      user_id: 'user123',
      name: 'Test Project 1',
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
    },
    {
      id: '2',
      user_id: 'user123',
      name: 'Test Project 2',
      filament_weight: 750,
      filament_price: 30,
      print_hours: 15,
      electricity_cost: 0.18,
      materials: [{ id: '2', name: 'ABS', price: 25 }],
      total_cost: 65.2,
      vat_percentage: 21,
      profit_margin: 35,
      recommended_price: 95.8,
      status: 'calculated',
      created_at: '2024-01-02',
      updated_at: '2024-01-02',
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Carga inicial', () => {
    it('debería cargar proyectos correctamente', async () => {
      mockProjectService.getProjects.mockResolvedValue(mockProjects)

      const { result } = renderHook(() => useProjects('user123'))

      expect(result.current.projects).toEqual([])
      expect(result.current.loading).toBe(true)
      expect(result.current.error).toBe(null)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.projects).toEqual(mockProjects)
      expect(result.current.error).toBe(null)
    })

    it('debería manejar errores de carga', async () => {
      const errorMessage = 'Failed to fetch projects'
      mockProjectService.getProjects.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useProjects('user123'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(result.current.projects).toEqual([])
      expect(result.current.error).toBe(errorMessage)
    })

    it('debería cargar proyectos de equipo', async () => {
      mockProjectService.getProjects.mockResolvedValue(mockProjects)

      const { result } = renderHook(() => useProjects('user123', 'team123'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      expect(mockProjectService.getProjects).toHaveBeenCalledWith('user123', 'team123')
      expect(result.current.projects).toEqual(mockProjects)
    })
  })

  describe('Crear proyecto', () => {
    it('debería crear un proyecto correctamente', async () => {
      mockProjectService.getProjects.mockResolvedValue(mockProjects)
      const newProject = {
        user_id: 'user123',
        name: 'New Project',
        filament_weight: 600,
        filament_price: 28,
        print_hours: 12,
        electricity_cost: 0.16,
        materials: [{ id: '1', name: 'PLA', price: 22 }],
        total_cost: 45.6,
        vat_percentage: 21,
        profit_margin: 32,
        recommended_price: 68.4,
        status: 'draft' as const,
      }

      mockProjectService.createProject.mockResolvedValue({
        ...newProject,
        id: '3',
        created_at: '2024-01-03',
        updated_at: '2024-01-03',
      })

      const { result } = renderHook(() => useProjects('user123'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await result.current.createProject(newProject)

      expect(mockProjectService.createProject).toHaveBeenCalledWith(newProject)
      expect(mockProjectService.getProjects).toHaveBeenCalledTimes(2) // Initial load + refresh
    })

    it('debería manejar errores al crear proyecto', async () => {
      mockProjectService.getProjects.mockResolvedValue(mockProjects)
      const errorMessage = 'Failed to create project'
      mockProjectService.createProject.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useProjects('user123'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const newProject = {
        user_id: 'user123',
        name: 'New Project',
        filament_weight: 600,
        filament_price: 28,
        print_hours: 12,
        electricity_cost: 0.16,
        materials: [],
        total_cost: 45.6,
        vat_percentage: 21,
        profit_margin: 32,
        recommended_price: 68.4,
        status: 'draft' as const,
      }

      await expect(result.current.createProject(newProject)).rejects.toThrow(errorMessage)
    })
  })

  describe('Actualizar proyecto', () => {
    it('debería actualizar un proyecto correctamente', async () => {
      mockProjectService.getProjects.mockResolvedValue(mockProjects)

      const { result } = renderHook(() => useProjects('user123'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const updates = { name: 'Updated Project Name' }
      await result.current.updateProject('1', updates)

      expect(mockProjectService.updateProject).toHaveBeenCalledWith('1', updates)
      expect(mockProjectService.getProjects).toHaveBeenCalledTimes(2) // Initial load + refresh
    })

    it('debería manejar errores al actualizar proyecto', async () => {
      mockProjectService.getProjects.mockResolvedValue(mockProjects)
      const errorMessage = 'Failed to update project'
      mockProjectService.updateProject.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useProjects('user123'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const updates = { name: 'Updated Project Name' }
      await expect(result.current.updateProject('1', updates)).rejects.toThrow(errorMessage)
    })
  })

  describe('Eliminar proyecto', () => {
    it('debería eliminar un proyecto correctamente', async () => {
      mockProjectService.getProjects.mockResolvedValue(mockProjects)

      const { result } = renderHook(() => useProjects('user123'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await result.current.deleteProject('1')

      expect(mockProjectService.deleteProject).toHaveBeenCalledWith('1')
      expect(mockProjectService.getProjects).toHaveBeenCalledTimes(2) // Initial load + refresh
    })

    it('debería manejar errores al eliminar proyecto', async () => {
      mockProjectService.getProjects.mockResolvedValue(mockProjects)
      const errorMessage = 'Failed to delete project'
      mockProjectService.deleteProject.mockRejectedValue(new Error(errorMessage))

      const { result } = renderHook(() => useProjects('user123'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      await expect(result.current.deleteProject('1')).rejects.toThrow(errorMessage)
    })
  })

  describe('Estados de carga', () => {
    it('debería mostrar estado de carga durante operaciones', async () => {
      mockProjectService.getProjects.mockResolvedValue(mockProjects)

      const { result } = renderHook(() => useProjects('user123'))

      expect(result.current.loading).toBe(true)

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })
    })

    it('debería manejar múltiples operaciones concurrentes', async () => {
      mockProjectService.getProjects.mockResolvedValue(mockProjects)

      const { result } = renderHook(() => useProjects('user123'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Simular múltiples operaciones
      const promises = [
        result.current.createProject(mockProjects[0]),
        result.current.updateProject('1', { name: 'Updated' }),
        result.current.deleteProject('2'),
      ]

      await Promise.all(promises)

      expect(mockProjectService.getProjects).toHaveBeenCalledTimes(4) // Initial + 3 operations
    })
  })

  describe('Filtrado y búsqueda', () => {
    it('debería filtrar proyectos por estado', async () => {
      mockProjectService.getProjects.mockResolvedValue(mockProjects)

      const { result } = renderHook(() => useProjects('user123'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      const draftProjects = result.current.projects.filter(p => p.status === 'draft')
      expect(draftProjects).toHaveLength(1)
      expect(draftProjects[0].name).toBe('Test Project 1')

      const calculatedProjects = result.current.projects.filter(p => p.status === 'calculated')
      expect(calculatedProjects).toHaveLength(1)
      expect(calculatedProjects[0].name).toBe('Test Project 2')
    })

    it('debería ordenar proyectos por fecha de creación', async () => {
      mockProjectService.getProjects.mockResolvedValue(mockProjects)

      const { result } = renderHook(() => useProjects('user123'))

      await waitFor(() => {
        expect(result.current.loading).toBe(false)
      })

      // Los proyectos deberían estar ordenados por fecha de creación (más reciente primero)
      expect(result.current.projects[0].created_at).toBe('2024-01-02')
      expect(result.current.projects[1].created_at).toBe('2024-01-01')
    })
  })

  describe('Optimizaciones', () => {
    it('debería evitar llamadas duplicadas durante la carga', async () => {
      mockProjectService.getProjects.mockResolvedValue(mockProjects)

      const { result } = renderHook(() => useProjects('user123'))

      // Intentar múltiples operaciones durante la carga inicial
      const newProject = {
        user_id: 'user123',
        name: 'New Project',
        filament_weight: 600,
        filament_price: 28,
        print_hours: 12,
        electricity_cost: 0.16,
        materials: [],
        total_cost: 45.6,
        vat_percentage: 21,
        profit_margin: 32,
        recommended_price: 68.4,
        status: 'draft' as const,
      }

      // Estas operaciones deberían esperar a que termine la carga inicial
      const promises = [
        result.current.createProject(newProject),
        result.current.updateProject('1', { name: 'Updated' }),
        result.current.deleteProject('2'),
      ]

      await Promise.all(promises)

      // Solo debería haber una llamada inicial + las operaciones
      expect(mockProjectService.getProjects).toHaveBeenCalledTimes(4)
    })
  })
}) 