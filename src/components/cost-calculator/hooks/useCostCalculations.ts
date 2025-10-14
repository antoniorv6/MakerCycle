import { useEffect, useState } from 'react';
import type { Material } from '@/types';
import type { CostCalculatorPieceMaterial } from '../types';

interface CostBreakdown {
  filament: number;
  electricity: number;
  materials: number;
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
}

export const useCostCalculations = ({
  filamentWeight,
  filamentPrice,
  printHours,
  electricityCost,
  printerPower,
  materials,
  vatPercentage,
  profitMargin,
  pieces = []
}: UseCostCalculationsProps) => {
  const [costs, setCosts] = useState<CostBreakdown>({
    filament: 0,
    electricity: 0,
    materials: 0,
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
          const weightInGrams = material.unit === 'kg' ? material.weight * 1000 : material.weight;
          return sum + weightInGrams;
        }, 0);
        
        const pieceCost = piece.materials.reduce((sum, material) => {
          const weightInKg = material.unit === 'g' ? material.weight / 1000 : material.weight;
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
    const totalCost = totalFilamentCost + electricityCostTotal + materialsCost;

    setCosts({
      filament: totalFilamentCost,
      electricity: electricityCostTotal,
      materials: materialsCost,
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
  }, [filamentWeight, filamentPrice, printHours, electricityCost, printerPower, materials, vatPercentage, profitMargin, pieces]);

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