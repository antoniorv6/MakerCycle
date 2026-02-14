import { useMemo } from 'react';
import { calculateShippingCost, findApplicableTier } from '@/data/shippingProviderTemplates';
import type { ShippingPreset, ShippingWeightTier } from '@/types';

interface UseShippingCostProps {
  shippingEnabled: boolean;
  selectedPreset: ShippingPreset | null;
  packagingWeightMode: 'percentage' | 'fixed';
  packagingWeightValue: number;
  productionWeightGrams: number;
}

interface UseShippingCostResult {
  shippingCost: number;
  totalWeight: number;
  packagingWeight: number;
  applicableTier: ShippingWeightTier | null;
}

export function useShippingCost({
  shippingEnabled,
  selectedPreset,
  packagingWeightMode,
  packagingWeightValue,
  productionWeightGrams,
}: UseShippingCostProps): UseShippingCostResult {
  return useMemo(() => {
    if (!shippingEnabled || !selectedPreset) {
      return {
        shippingCost: 0,
        totalWeight: productionWeightGrams,
        packagingWeight: 0,
        applicableTier: null,
      };
    }

    // Calcular peso del embalaje
    const packagingWeight = packagingWeightMode === 'percentage'
      ? (productionWeightGrams * packagingWeightValue / 100)
      : packagingWeightValue;

    const totalWeight = productionWeightGrams + packagingWeight;

    // Calcular coste de envío
    const shippingCost = calculateShippingCost(totalWeight, selectedPreset.weight_tiers);
    const applicableTier = findApplicableTier(totalWeight, selectedPreset.weight_tiers);

    return {
      shippingCost,
      totalWeight,
      packagingWeight,
      applicableTier,
    };
  }, [shippingEnabled, selectedPreset, packagingWeightMode, packagingWeightValue, productionWeightGrams]);
}
