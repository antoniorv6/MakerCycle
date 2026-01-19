import { useEffect, useState } from 'react';
import type { Material, PrinterPreset } from '@/types';
import type { CostCalculatorPieceMaterial } from '../types';
import { calculateAmortizationCostPerHour } from '@/services/printerPresetService';

interface CostBreakdown {
  filament: number;
  electricity: number;
  materials: number;
  amortization: number;
  total: number;
}

interface SalePrice {
  basePrice: number;
  priceWithMargin: number;
  priceWithTax: number;
  recommendedPrice: number;
}

interface UseCostCalculationsProps {
  // Campos legacy para compatibilidad
  filamentWeight: number;
  filamentPrice: number;
  printHours: number;
  electricityCost: number;
  printerPower: number;
  materials: Material[];
  postprocessingItems?: Array<{
    id: string;
    name: string;
    cost?: number; // Alias para cost_per_unit
    cost_per_unit?: number;
    quantity: number;
    unit: string;
  }>;
  vatPercentage: number;
  profitMargin: number;
  // Nuevos campos para piezas
  pieces?: Array<{
    id: string;
    name: string;
    filamentWeight: number;
    filamentPrice: number;
    printHours: number;
    quantity: number;
    notes?: string;
    materials?: CostCalculatorPieceMaterial[];
  }>;
  // Campos para amortización de impresora
  selectedPrinter?: PrinterPreset | null;
  includeAmortization?: boolean;
}

export const useCostCalculations = ({
  filamentWeight,
  filamentPrice,
  printHours,
  electricityCost,
  printerPower,
  materials,
  postprocessingItems = [],
  vatPercentage,
  profitMargin,
  pieces = [],
  selectedPrinter = null,
  includeAmortization = true
}: UseCostCalculationsProps) => {
  const [costs, setCosts] = useState<CostBreakdown>({
    filament: 0,
    electricity: 0,
    materials: 0,
    amortization: 0,
    total: 0
  });

  const [salePrice, setSalePrice] = useState<SalePrice>({
    basePrice: 0,
    priceWithMargin: 0,
    priceWithTax: 0,
    recommendedPrice: 0
  });

  // Calcular totales desde las piezas
  const calculateTotalsFromPieces = () => {
    if (pieces.length === 0) {
      return {
        totalFilamentWeight: filamentWeight,
        totalPrintHours: printHours,
        totalFilamentCost: (filamentWeight / 1000) * filamentPrice
      };
    }

    let totalFilamentWeight = 0;
    let totalPrintHours = 0;
    let totalFilamentCost = 0;

    pieces.forEach(piece => {
      totalPrintHours += piece.printHours * piece.quantity;
      
      if (piece.materials && piece.materials.length > 0) {
        // Usar la nueva estructura de materiales
        const pieceWeight = piece.materials.reduce((sum, material) => {
          if (material.category === 'resin') {
            // Para resina, convertir a ml (unidad base)
            const volumeInMl = material.unit === 'L' ? material.weight * 1000 : material.weight;
            return sum + volumeInMl;
          } else {
            // Para filamento, convertir a gramos (unidad base)
            const weightInGrams = material.unit === 'kg' ? material.weight * 1000 : material.weight;
            return sum + weightInGrams;
          }
        }, 0);
        
        const pieceCost = piece.materials.reduce((sum, material) => {
          let weightInKg;
          if (material.category === 'resin') {
            // Para resina, convertir volumen a "kg equivalente" para cálculo de precio
            // Asumimos que 1L de resina ≈ 1kg para cálculo de precio
            weightInKg = material.unit === 'L' ? material.weight : material.weight / 1000;
          } else {
            // Para filamento, convertir a kg
            weightInKg = material.unit === 'g' ? material.weight / 1000 : material.weight;
          }
          return sum + (weightInKg * material.pricePerKg);
        }, 0);
        
        totalFilamentWeight += pieceWeight * piece.quantity;
        totalFilamentCost += pieceCost * piece.quantity;
      } else {
        // Fallback a la estructura antigua para compatibilidad
        totalFilamentWeight += piece.filamentWeight * piece.quantity;
        totalFilamentCost += (piece.filamentWeight * piece.quantity * piece.filamentPrice) / 1000;
      }
    });

    return {
      totalFilamentWeight,
      totalPrintHours,
      totalFilamentCost
    };
  };

  useEffect(() => {
    const { totalFilamentWeight, totalPrintHours, totalFilamentCost } = calculateTotalsFromPieces();

    // Calcular costes
    const electricityCostTotal = totalPrintHours * printerPower * electricityCost;
    const materialsCost = materials.reduce((sum, material) => sum + (material.price || 0), 0);
    const postprocessingCost = postprocessingItems.reduce((sum, item) => {
      const unitCost = item.cost_per_unit ?? item.cost ?? 0;
      return sum + (unitCost * (item.quantity || 1));
    }, 0);
    
    // Calcular coste de amortización de impresora
    let amortizationCost = 0;
    if (selectedPrinter && includeAmortization && selectedPrinter.purchase_price > 0) {
      const isFullyAmortized = selectedPrinter.current_usage_hours >= selectedPrinter.amortization_hours;
      if (!isFullyAmortized) {
        const costPerHour = calculateAmortizationCostPerHour(
          selectedPrinter.purchase_price,
          selectedPrinter.amortization_hours
        );
        amortizationCost = costPerHour * totalPrintHours;
      }
    }
    
    const totalCost = totalFilamentCost + electricityCostTotal + materialsCost + postprocessingCost + amortizationCost;

    setCosts({
      filament: totalFilamentCost,
      electricity: electricityCostTotal,
      materials: materialsCost + postprocessingCost,
      amortization: amortizationCost,
      total: totalCost
    });

    // Calcular precio de venta
    const basePrice = totalCost;
    const priceWithMargin = basePrice * (1 + profitMargin / 100);
    const priceWithTax = priceWithMargin * (1 + vatPercentage / 100);
    const recommendedPrice = Math.ceil(priceWithTax * 2) / 2; // Redondear a 0.50 más cercano

    setSalePrice({
      basePrice,
      priceWithMargin,
      priceWithTax,
      recommendedPrice
    });
  }, [filamentWeight, filamentPrice, printHours, electricityCost, printerPower, materials, postprocessingItems, vatPercentage, profitMargin, pieces, selectedPrinter, includeAmortization]);

  const { totalFilamentWeight, totalPrintHours, totalFilamentCost } = calculateTotalsFromPieces();

  return { 
    costs, 
    salePrice,
    // Totales calculados desde piezas
    totalFilamentWeight,
    totalPrintHours,
    totalFilamentCost,
    totalElectricityCost: totalPrintHours * printerPower * electricityCost
  };
};