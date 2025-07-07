// Funciones utilitarias para cálculos de costos
export const calculateFilamentCost = (weight: number, price: number): number => {
  return (weight / 1000) * price
}

export const calculateElectricityCost = (hours: number, costPerKwh: number): number => {
  return hours * 0.2 * costPerKwh
}

export const calculateMaterialsCost = (materials: Array<{ price: number }>): number => {
  return materials.reduce((sum, material) => sum + (material.price || 0), 0)
}

export const calculateTotalCost = (filamentCost: number, electricityCost: number, materialsCost: number): number => {
  return filamentCost + electricityCost + materialsCost
}

export const calculateSalePrice = (totalCost: number, vatPercentage: number, profitMargin: number): number => {
  const costWithVat = totalCost * (1 + vatPercentage / 100)
  return costWithVat * (1 + profitMargin / 100)
}

export const roundToNearestHalf = (price: number): number => {
  return Math.ceil(price * 2) / 2
}

describe('Cost Calculation Utils', () => {
  describe('calculateFilamentCost', () => {
    it('debería calcular el costo del filamento correctamente', () => {
      // 500g a 25€/kg = (500/1000) * 25 = 12.5€
      expect(calculateFilamentCost(500, 25)).toBe(12.5)
      
      // 1000g a 20€/kg = (1000/1000) * 20 = 20€
      expect(calculateFilamentCost(1000, 20)).toBe(20)
      
      // 250g a 30€/kg = (250/1000) * 30 = 7.5€
      expect(calculateFilamentCost(250, 30)).toBe(7.5)
    })

    it('debería manejar valores cero', () => {
      expect(calculateFilamentCost(0, 25)).toBe(0)
      expect(calculateFilamentCost(500, 0)).toBe(0)
      expect(calculateFilamentCost(0, 0)).toBe(0)
    })

    it('debería manejar valores negativos', () => {
      expect(calculateFilamentCost(-500, 25)).toBe(-12.5)
      expect(calculateFilamentCost(500, -25)).toBe(-12.5)
    })
  })

  describe('calculateElectricityCost', () => {
    it('debería calcular el costo de electricidad correctamente', () => {
      // 10h a 0.15€/kWh = 10 * 0.2 * 0.15 = 0.3€
      expect(calculateElectricityCost(10, 0.15)).toBe(0.3)
      
      // 5h a 0.12€/kWh = 5 * 0.2 * 0.12 = 0.12€
      expect(calculateElectricityCost(5, 0.12)).toBe(0.12)
      
      // 20h a 0.18€/kWh = 20 * 0.2 * 0.18 = 0.72€
      expect(calculateElectricityCost(20, 0.18)).toBe(0.72)
    })

    it('debería manejar valores cero', () => {
      expect(calculateElectricityCost(0, 0.15)).toBe(0)
      expect(calculateElectricityCost(10, 0)).toBe(0)
      expect(calculateElectricityCost(0, 0)).toBe(0)
    })
  })

  describe('calculateMaterialsCost', () => {
    it('debería calcular el costo de materiales correctamente', () => {
      const materials = [
        { price: 10 },
        { price: 15 },
        { price: 5 }
      ]
      
      expect(calculateMaterialsCost(materials)).toBe(30)
    })

    it('debería manejar materiales sin precio', () => {
      const materials = [
        { price: 10 },
        { price: 0 },
        { price: 5 }
      ]
      
      expect(calculateMaterialsCost(materials)).toBe(15)
    })

    it('debería manejar array vacío', () => {
      expect(calculateMaterialsCost([])).toBe(0)
    })
  })

  describe('calculateTotalCost', () => {
    it('debería calcular el costo total correctamente', () => {
      const filamentCost = 12.5
      const electricityCost = 0.3
      const materialsCost = 25
      
      expect(calculateTotalCost(filamentCost, electricityCost, materialsCost)).toBe(37.8)
    })

    it('debería manejar valores cero', () => {
      expect(calculateTotalCost(0, 0, 0)).toBe(0)
      expect(calculateTotalCost(10, 0, 5)).toBe(15)
    })
  })

  describe('calculateSalePrice', () => {
    it('debería calcular el precio de venta correctamente', () => {
      const totalCost = 100
      const vatPercentage = 21
      const profitMargin = 30
      
      // Cost with VAT: 100 * 1.21 = 121€
      // Price with margin: 121 * 1.30 = 157.3€
      expect(calculateSalePrice(totalCost, vatPercentage, profitMargin)).toBe(157.3)
    })

    it('debería manejar porcentajes cero', () => {
      expect(calculateSalePrice(100, 0, 0)).toBe(100)
      expect(calculateSalePrice(100, 21, 0)).toBe(121)
      expect(calculateSalePrice(100, 0, 30)).toBe(130)
    })

    it('debería manejar porcentajes negativos', () => {
      // 100 * 0.9 * 0.8 = 72
      expect(calculateSalePrice(100, -10, -20)).toBe(72)
    })
  })

  describe('roundToNearestHalf', () => {
    it('debería redondear al 0.50 más cercano', () => {
      expect(roundToNearestHalf(45.2)).toBe(45.5)
      expect(roundToNearestHalf(45.7)).toBe(46.0)
      expect(roundToNearestHalf(45.5)).toBe(45.5)
      expect(roundToNearestHalf(45.0)).toBe(45.0)
    })

    it('debería manejar valores enteros', () => {
      expect(roundToNearestHalf(45)).toBe(45.0)
      expect(roundToNearestHalf(46)).toBe(46.0)
    })
  })

  describe('Flujo completo de cálculos', () => {
    it('debería calcular un proyecto completo correctamente', () => {
      // Datos del proyecto
      const filamentWeight = 500 // gramos
      const filamentPrice = 25 // €/kg
      const printHours = 10
      const electricityCost = 0.15 // €/kWh
      const materials = [
        { price: 10 },
        { price: 15 }
      ]
      const vatPercentage = 21
      const profitMargin = 30

      // Cálculos
      const filamentCost = calculateFilamentCost(filamentWeight, filamentPrice)
      const electricityCostTotal = calculateElectricityCost(printHours, electricityCost)
      const materialsCost = calculateMaterialsCost(materials)
      const totalCost = calculateTotalCost(filamentCost, electricityCostTotal, materialsCost)
      const salePrice = calculateSalePrice(totalCost, vatPercentage, profitMargin)
      const recommendedPrice = roundToNearestHalf(salePrice)

      // Verificaciones
      expect(filamentCost).toBe(12.5) // (500/1000) * 25
      expect(electricityCostTotal).toBe(0.3) // 10 * 0.2 * 0.15
      expect(materialsCost).toBe(25) // 10 + 15
      expect(totalCost).toBe(37.8) // 12.5 + 0.3 + 25
      expect(salePrice).toBeCloseTo(59.46, 2) // 37.8 * 1.21 * 1.30
      expect(recommendedPrice).toBe(59.5) // redondeado
    })
  })
}) 