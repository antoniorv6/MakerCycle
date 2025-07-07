import { SalesService } from '../salesService'
import type { Sale, SaleFormData } from '@/types'

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
        select: jest.fn().mockReturnValue({
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      })),
      update: jest.fn(() => ({
        eq: jest.fn(() => ({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        })),
      })),
      delete: jest.fn(() => ({
        eq: jest.fn().mockResolvedValue({ data: null, error: null }),
      })),
    })),
  }),
}

jest.mock('@/lib/supabase', () => ({
  createClient: jest.fn(() => mockSupabase),
}))

describe('SalesService', () => {
  let salesService: SalesService
  const mockSale: Omit<Sale, 'id' | 'created_at' | 'updated_at'> = {
    user_id: 'user123',
    project_name: 'Test Project',
    cost: 50,
    unit_cost: 25,
    quantity: 2,
    sale_price: 80,
    profit: 30,
    margin: 37.5,
    date: '2024-01-01',
    status: 'completed',
    print_hours: 10,
    team_id: null,
  }

  beforeEach(() => {
    jest.clearAllMocks()
    salesService = new SalesService()
  })

  describe('getSales', () => {
    it('debería obtener ventas personales cuando no se proporciona teamId', async () => {
      const mockData = [
        { ...mockSale, id: '1', created_at: '2024-01-01', updated_at: '2024-01-01' },
        { ...mockSale, id: '2', created_at: '2024-01-02', updated_at: '2024-01-02' },
      ]

      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery),
      })

      const result = await salesService.getSales('user123')

      expect(mockSupabase.from).toHaveBeenCalledWith('sales')
      expect(mockQuery.eq).toHaveBeenCalledWith('user_id', 'user123')
      expect(mockQuery.is).toHaveBeenCalledWith('team_id', null)
      expect(result).toEqual(mockData)
    })

    it('debería obtener ventas de equipo cuando se proporciona teamId', async () => {
      const mockData = [
        { ...mockSale, id: '1', team_id: 'team123', created_at: '2024-01-01', updated_at: '2024-01-01' },
      ]

      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockData, error: null }),
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery),
      })

      const result = await salesService.getSales('user123', 'team123')

      expect(mockQuery.eq).toHaveBeenCalledWith('team_id', 'team123')
      expect(result).toEqual(mockData)
    })

    it('debería manejar errores correctamente', async () => {
      const mockError = { message: 'Database error' }
      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: null, error: mockError }),
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery),
      })

      await expect(salesService.getSales('user123')).rejects.toThrow('Error fetching sales: Database error')
    })
  })

  describe('createSale', () => {
    it('debería crear una venta correctamente', async () => {
      const mockData = { ...mockSale, id: '1', created_at: '2024-01-01', updated_at: '2024-01-01' }
      const saleData: SaleFormData = {
        projectName: 'Test Project',
        unitCost: 25,
        quantity: 2,
        salePrice: 80,
        date: '2024-01-01',
        printHours: 10,
        team_id: null,
      }

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      })

      const result = await salesService.createSale('user123', saleData)

      expect(mockSupabase.from).toHaveBeenCalledWith('sales')
      expect(result).toEqual(mockData)
    })

    it('debería calcular profit y margin correctamente', async () => {
      const mockData = { ...mockSale, id: '1', created_at: '2024-01-01', updated_at: '2024-01-01' }
      const saleData: SaleFormData = {
        projectName: 'Test Project',
        unitCost: 20,
        quantity: 3,
        salePrice: 90,
        date: '2024-01-01',
        printHours: 15,
        team_id: null,
      }

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: mockData, error: null }),
          }),
        }),
      })

      await salesService.createSale('user123', saleData)

      // Verificar que se calculó correctamente:
      // Total cost: 20 * 3 = 60
      // Profit: 90 - 60 = 30
      // Margin: (30 / 90) * 100 = 33.33%
      const insertCall = mockSupabase.from().insert.mock.calls[0][0][0]
      expect(insertCall.profit).toBe(30)
      expect(insertCall.margin).toBeCloseTo(33.33, 1)
    })

    it('debería manejar errores al crear venta', async () => {
      const mockError = { message: 'Validation error' }
      const saleData: SaleFormData = {
        projectName: 'Test Project',
        unitCost: 25,
        quantity: 2,
        salePrice: 80,
        date: '2024-01-01',
        printHours: 10,
        team_id: null,
      }

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
          }),
        }),
      })

      await expect(salesService.createSale('user123', saleData)).rejects.toThrow('Error creating sale: Validation error')
    })
  })

  describe('updateSale', () => {
    it('debería actualizar una venta correctamente', async () => {
      const mockData = { ...mockSale, id: '1', project_name: 'Updated Project', created_at: '2024-01-01', updated_at: '2024-01-01' }

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: mockData, error: null }),
            }),
          }),
        }),
      })

      const result = await salesService.updateSale('1', { project_name: 'Updated Project' })

      expect(mockSupabase.from).toHaveBeenCalledWith('sales')
      expect(result).toEqual(mockData)
    })

    it('debería manejar errores al actualizar venta', async () => {
      const mockError = { message: 'Update failed' }

      mockSupabase.from.mockReturnValue({
        update: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            select: jest.fn().mockReturnValue({
              single: jest.fn().mockResolvedValue({ data: null, error: mockError }),
            }),
          }),
        }),
      })

      await expect(salesService.updateSale('1', { project_name: 'Updated' })).rejects.toThrow('Error updating sale: Update failed')
    })
  })

  describe('deleteSale', () => {
    it('debería eliminar una venta correctamente', async () => {
      mockSupabase.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: null, error: null }),
        }),
      })

      await salesService.deleteSale('1')

      expect(mockSupabase.from).toHaveBeenCalledWith('sales')
    })

    it('debería manejar errores al eliminar venta', async () => {
      const mockError = { message: 'Delete failed' }

      mockSupabase.from.mockReturnValue({
        delete: jest.fn().mockReturnValue({
          eq: jest.fn().mockResolvedValue({ data: null, error: mockError }),
        }),
      })

      await expect(salesService.deleteSale('1')).rejects.toThrow('Error deleting sale: Delete failed')
    })
  })

  describe('getSalesStats', () => {
    it('debería calcular estadísticas correctamente', async () => {
      const mockSales = [
        { ...mockSale, id: '1', sale_price: 100, profit: 30, quantity: 2, print_hours: 10 },
        { ...mockSale, id: '2', sale_price: 150, profit: 50, quantity: 3, print_hours: 15 },
        { ...mockSale, id: '3', sale_price: 80, profit: 20, quantity: 1, print_hours: 5 },
      ]

      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: mockSales, error: null }),
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery),
      })

      const result = await salesService.getSalesStats('user123')

      expect(result.totalSales).toBe(3)
      expect(result.totalRevenue).toBe(330) // 100 + 150 + 80
      expect(result.totalProfit).toBe(100) // 30 + 50 + 20
      expect(result.averageMargin).toBeCloseTo(30.3, 1) // (30/100 + 50/150 + 20/80) / 3 * 100
      expect(result.totalProducts).toBe(6) // 2 + 3 + 1
      expect(result.totalPrintHours).toBe(30) // 10 + 15 + 5
      expect(result.averageEurosPerHour).toBeCloseTo(11, 1) // 330 / 30
    })

    it('debería manejar ventas vacías', async () => {
      const mockQuery = {
        eq: jest.fn().mockReturnThis(),
        is: jest.fn().mockReturnThis(),
        order: jest.fn().mockResolvedValue({ data: [], error: null }),
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue(mockQuery),
      })

      const result = await salesService.getSalesStats('user123')

      expect(result.totalSales).toBe(0)
      expect(result.totalRevenue).toBe(0)
      expect(result.totalProfit).toBe(0)
      expect(result.averageMargin).toBe(0)
      expect(result.totalProducts).toBe(0)
      expect(result.totalPrintHours).toBe(0)
      expect(result.averageEurosPerHour).toBe(0)
    })
  })
}) 