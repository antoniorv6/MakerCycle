import { useEffect, useState } from 'react';
import type { Material, CostBreakdown, SalePrice } from '../types';

interface UseCostCalculationsProps {
  filamentWeight: number;
  filamentPrice: number;
  printHours: number;
  electricityCost: number;
  materials: Material[];
  vatPercentage: number;
  profitMargin: number;
}

export const useCostCalculations = ({
  filamentWeight,
  filamentPrice,
  printHours,
  electricityCost,
  materials,
  vatPercentage,
  profitMargin
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

  useEffect(() => {
    // Calcular costes
    const filamentCost = (filamentWeight / 1000) * filamentPrice;
    const electricityCostTotal = printHours * 0.2 * electricityCost;
    const materialsCost = materials.reduce((sum, material) => sum + (material.price || 0), 0);
    const totalCost = filamentCost + electricityCostTotal + materialsCost;

    setCosts({
      filament: filamentCost,
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
  }, [filamentWeight, filamentPrice, printHours, electricityCost, materials, vatPercentage, profitMargin]);

  return { costs, salePrice };
};