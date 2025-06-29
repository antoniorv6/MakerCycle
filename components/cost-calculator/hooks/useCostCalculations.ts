import { useEffect, useState } from 'react';
import type { Material, CostBreakdown, SalePrice, Piece } from '../types';

interface UseCostCalculationsProps {
  // Campos legacy para compatibilidad
  filamentWeight: number;
  filamentPrice: number;
  printHours: number;
  electricityCost: number;
  materials: Material[];
  vatPercentage: number;
  profitMargin: number;
  // Nuevos campos para piezas
  pieces?: Piece[];
}

export const useCostCalculations = ({
  filamentWeight,
  filamentPrice,
  printHours,
  electricityCost,
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

    const totalFilamentWeight = pieces.reduce((sum, piece) => 
      sum + (piece.filamentWeight * piece.quantity), 0
    );
    
    const totalPrintHours = pieces.reduce((sum, piece) => 
      sum + (piece.printHours * piece.quantity), 0
    );
    
    const totalFilamentCost = pieces.reduce((sum, piece) => 
      sum + ((piece.filamentWeight * piece.quantity * piece.filamentPrice) / 1000), 0
    );

    return {
      totalFilamentWeight,
      totalPrintHours,
      totalFilamentCost
    };
  };

  useEffect(() => {
    const { totalFilamentWeight, totalPrintHours, totalFilamentCost } = calculateTotalsFromPieces();

    // Calcular costes
    const electricityCostTotal = totalPrintHours * 0.2 * electricityCost;
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
  }, [filamentWeight, filamentPrice, printHours, electricityCost, materials, vatPercentage, profitMargin, pieces]);

  const { totalFilamentWeight, totalPrintHours, totalFilamentCost } = calculateTotalsFromPieces();

  return { 
    costs, 
    salePrice,
    // Totales calculados desde piezas
    totalFilamentWeight,
    totalPrintHours,
    totalFilamentCost,
    totalElectricityCost: totalPrintHours * 0.2 * electricityCost
  };
};