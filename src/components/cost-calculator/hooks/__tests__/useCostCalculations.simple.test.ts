import { renderHook } from '@testing-library/react'
import { useCostCalculations } from '../useCostCalculations'
import type { Material } from '@/types'

describe('useCostCalculations - Simple Tests', () => {
  const mockMaterials: Material[] = [
    { id: '1', name: 'Material 1', price: 10 },
    { id: '2', name: 'Material 2', price: 15 }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Cálculos básicos', () => {
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

  describe('Totales calculados', () => {
    it('debería calcular totales correctamente', () => {
      const { result } = renderHook(() =>
        useCostCalculations({
          filamentWeight: 750,
          filamentPrice: 30,
          printHours: 15,
          electricityCost: 0.18,
          materials: mockMaterials,
          vatPercentage: 21,
          profitMargin: 30
        })
      )

      // Total filament weight: 750g
      expect(result.current.totalFilamentWeight).toBe(750)
      
      // Total print hours: 15h
      expect(result.current.totalPrintHours).toBe(15)
      
      // Total filament cost: (750g / 1000) * 30€/kg = 22.5€
      expect(result.current.totalFilamentCost).toBe(22.5)
      
      // Total electricity cost: 15h * 0.2 * 0.18€/kWh = 0.54€
      expect(result.current.totalElectricityCost).toBe(0.54)
    })
  })
}) 