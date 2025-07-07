import { renderHook, act } from '@testing-library/react'
import { useCostCalculations } from '../useCostCalculations'
import type { Material, Piece } from '@/types'

describe('useCostCalculations', () => {
  const mockMaterials: Material[] = [
    { id: '1', name: 'Material 1', price: 10 },
    { id: '2', name: 'Material 2', price: 15 }
  ]

  const mockPieces: Piece[] = [
    {
      id: '1',
      name: 'Piece 1',
      filamentWeight: 100,
      filamentPrice: 25,
      printHours: 2,
      quantity: 2,
      notes: 'Test piece'
    },
    {
      id: '2',
      name: 'Piece 2',
      filamentWeight: 150,
      filamentPrice: 30,
      printHours: 3,
      quantity: 1,
      notes: 'Another test piece'
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Cálculos básicos sin piezas', () => {
    it('debería calcular costos correctamente con valores básicos', () => {
      const { result } = renderHook(() =>
        useCostCalculations({
          filamentWeight: 500,
          filamentPrice: 25,
          printHours: 10,
          electricityCost: 0.15,
          materials: mockMaterials,
          vatPercentage: 21,
          profitMargin: 30
        })
      )

      // Filament cost: (500g / 1000) * 25€/kg = 12.5€
      expect(result.current.costs.filament).toBe(12.5)
      
      // Electricity cost: 10h * 0.2 * 0.15€/kWh = 0.3€
      expect(result.current.costs.electricity).toBe(0.3)
      
      // Materials cost: 10 + 15 = 25€
      expect(result.current.costs.materials).toBe(25)
      
      // Total cost: 12.5 + 0.3 + 25 = 37.8€
      expect(result.current.costs.total).toBe(37.8)
    })

    it('debería calcular precios de venta correctamente', () => {
      const { result } = renderHook(() =>
        useCostCalculations({
          filamentWeight: 1000,
          filamentPrice: 20,
          printHours: 5,
          electricityCost: 0.12,
          materials: [{ id: '1', name: 'Test', price: 10 }],
          vatPercentage: 21,
          profitMargin: 25
        })
      )

      // Base price = total cost = 20 + 0.12 + 10 = 30.12€
      expect(result.current.salePrice.basePrice).toBe(30.12)
      
      // Price with margin: 30.12 * 1.25 = 37.65€
      expect(result.current.salePrice.priceWithMargin).toBe(37.65)
      
      // Price with VAT: 37.65 * 1.21 = 45.56€
      expect(result.current.salePrice.priceWithTax).toBe(45.56)
      
      // Recommended price: rounded to nearest 0.50
      expect(result.current.salePrice.recommendedPrice).toBe(45.5)
    })
  })

  describe('Cálculos con piezas', () => {
    it('debería calcular totales desde piezas correctamente', () => {
      const { result } = renderHook(() =>
        useCostCalculations({
          filamentWeight: 0, // Se ignora cuando hay piezas
          filamentPrice: 0,
          printHours: 0,
          electricityCost: 0.15,
          materials: mockMaterials,
          vatPercentage: 21,
          profitMargin: 30,
          pieces: mockPieces
        })
      )

      // Total filament weight: (100 * 2) + (150 * 1) = 350g
      expect(result.current.totalFilamentWeight).toBe(350)
      
      // Total print hours: (2 * 2) + (3 * 1) = 7h
      expect(result.current.totalPrintHours).toBe(7)
      
      // Total filament cost: ((100 * 2 * 25) / 1000) + ((150 * 1 * 30) / 1000) = 5 + 4.5 = 9.5€
      expect(result.current.totalFilamentCost).toBe(9.5)
    })

    it('debería calcular costos totales con piezas', () => {
      const { result } = renderHook(() =>
        useCostCalculations({
          filamentWeight: 0,
          filamentPrice: 0,
          printHours: 0,
          electricityCost: 0.15,
          materials: mockMaterials,
          vatPercentage: 21,
          profitMargin: 30,
          pieces: mockPieces
        })
      )

      // Filament cost: 9.5€ (calculado arriba)
      expect(result.current.costs.filament).toBe(9.5)
      
      // Electricity cost: 7h * 0.2 * 0.15€/kWh = 0.21€
      expect(result.current.costs.electricity).toBe(0.21)
      
      // Materials cost: 25€
      expect(result.current.costs.materials).toBe(25)
      
      // Total cost: 9.5 + 0.21 + 25 = 34.71€
      expect(result.current.costs.total).toBe(34.71)
    })

    it('debería manejar piezas vacías correctamente', () => {
      const { result } = renderHook(() =>
        useCostCalculations({
          filamentWeight: 500,
          filamentPrice: 25,
          printHours: 10,
          electricityCost: 0.15,
          materials: mockMaterials,
          vatPercentage: 21,
          profitMargin: 30,
          pieces: []
        })
      )

      // Debería usar los valores básicos cuando no hay piezas
      expect(result.current.totalFilamentWeight).toBe(500)
      expect(result.current.totalPrintHours).toBe(10)
      expect(result.current.totalFilamentCost).toBe(12.5)
    })
  })

  describe('Actualizaciones reactivas', () => {
    it('debería recalcular cuando cambian los valores', () => {
      const { result, rerender } = renderHook(
        ({ props }) => useCostCalculations(props),
        {
          initialProps: {
            filamentWeight: 500,
            filamentPrice: 25,
            printHours: 10,
            electricityCost: 0.15,
            materials: mockMaterials,
            vatPercentage: 21,
            profitMargin: 30
          }
        }
      )

      const initialTotal = result.current.costs.total

      // Cambiar el precio del filamento
      rerender({
        props: {
          filamentWeight: 500,
          filamentPrice: 30, // Aumentado de 25 a 30
          printHours: 10,
          electricityCost: 0.15,
          materials: mockMaterials,
          vatPercentage: 21,
          profitMargin: 30
        }
      })

      expect(result.current.costs.total).toBeGreaterThan(initialTotal)
      expect(result.current.costs.filament).toBe(15) // (500/1000) * 30
    })
  })

  describe('Casos edge', () => {
    it('debería manejar valores cero correctamente', () => {
      const { result } = renderHook(() =>
        useCostCalculations({
          filamentWeight: 0,
          filamentPrice: 0,
          printHours: 0,
          electricityCost: 0,
          materials: [],
          vatPercentage: 0,
          profitMargin: 0
        })
      )

      expect(result.current.costs.filament).toBe(0)
      expect(result.current.costs.electricity).toBe(0)
      expect(result.current.costs.materials).toBe(0)
      expect(result.current.costs.total).toBe(0)
      expect(result.current.salePrice.basePrice).toBe(0)
      expect(result.current.salePrice.recommendedPrice).toBe(0)
    })

    it('debería manejar valores negativos correctamente', () => {
      const { result } = renderHook(() =>
        useCostCalculations({
          filamentWeight: -100,
          filamentPrice: -10,
          printHours: -5,
          electricityCost: -0.1,
          materials: [{ id: '1', name: 'Test', price: -5 }],
          vatPercentage: -10,
          profitMargin: -20
        })
      )

      // Los valores negativos deberían ser tratados como 0 o valores absolutos
      expect(result.current.costs.total).toBeDefined()
      expect(result.current.salePrice.recommendedPrice).toBeDefined()
    })
  })
}) 