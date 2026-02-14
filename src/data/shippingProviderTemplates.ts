/**
 * Plantillas de proveedores de envío predefinidos
 *
 * Este archivo contiene plantillas de los principales proveedores de envío
 * nacionales (España) e internacionales con tarifas estimadas por tramos de peso.
 *
 * Valores basados en tarifas públicas aproximadas (2025):
 * - Los precios son orientativos para envío estándar peninsular
 * - Los proveedores internacionales muestran tarifas para envío desde España
 * - El usuario puede ajustar las tarifas según sus acuerdos comerciales
 *
 * NOTA: Estas tarifas son aproximadas y deben ajustarse según:
 * - Acuerdos comerciales del usuario con el proveedor
 * - Zona de envío (peninsular, insular, internacional)
 * - Tipo de servicio (estándar, urgente, etc.)
 */

import type { ShippingWeightTier } from '@/types';

export interface ShippingProviderTemplate {
  id: string;
  name: string;
  providerName: string;
  category: 'national' | 'international';
  description: string;
  weightTiers: ShippingWeightTier[];
}

/** Tramos de peso estándar vacíos para proveedores personalizados */
export const DEFAULT_WEIGHT_TIERS: ShippingWeightTier[] = [
  { min_weight: 0, max_weight: 5000, price: 0 },
  { min_weight: 5000, max_weight: 10000, price: 0 },
  { min_weight: 10000, max_weight: 15000, price: 0 },
  { min_weight: 15000, max_weight: 20000, price: 0 },
  { min_weight: 20000, max_weight: 30000, price: 0 },
  { min_weight: 30000, max_weight: 40000, price: 0 },
  { min_weight: 40000, max_weight: 50000, price: 0 },
  { min_weight: 50000, max_weight: 70000, price: 0 },
  { min_weight: 70000, max_weight: 90000, price: 0 },
  { min_weight: 90000, max_weight: 100000, price: 0 },
];

export const SHIPPING_PROVIDER_TEMPLATES: ShippingProviderTemplate[] = [
  // ============================================
  // NACIONALES (España)
  // ============================================
  {
    id: 'correos',
    name: 'Correos - Paq Estándar',
    providerName: 'Correos',
    category: 'national',
    description: 'Correos de España - Servicio Paq Estándar peninsular',
    weightTiers: [
      { min_weight: 0, max_weight: 5000, price: 5.50 },
      { min_weight: 5000, max_weight: 10000, price: 7.80 },
      { min_weight: 10000, max_weight: 15000, price: 10.20 },
      { min_weight: 15000, max_weight: 20000, price: 12.50 },
      { min_weight: 20000, max_weight: 30000, price: 16.80 },
      { min_weight: 30000, max_weight: 40000, price: 21.00 },
      { min_weight: 40000, max_weight: 50000, price: 25.50 },
      { min_weight: 50000, max_weight: 70000, price: 32.00 },
      { min_weight: 70000, max_weight: 90000, price: 40.00 },
      { min_weight: 90000, max_weight: 100000, price: 48.00 },
    ],
  },
  {
    id: 'seur',
    name: 'SEUR - Estándar',
    providerName: 'SEUR',
    category: 'national',
    description: 'SEUR - Envío estándar nacional peninsular',
    weightTiers: [
      { min_weight: 0, max_weight: 5000, price: 7.20 },
      { min_weight: 5000, max_weight: 10000, price: 9.50 },
      { min_weight: 10000, max_weight: 15000, price: 12.80 },
      { min_weight: 15000, max_weight: 20000, price: 15.90 },
      { min_weight: 20000, max_weight: 30000, price: 20.50 },
      { min_weight: 30000, max_weight: 40000, price: 25.80 },
      { min_weight: 40000, max_weight: 50000, price: 31.00 },
      { min_weight: 50000, max_weight: 70000, price: 39.50 },
      { min_weight: 70000, max_weight: 90000, price: 48.00 },
      { min_weight: 90000, max_weight: 100000, price: 55.00 },
    ],
  },
  {
    id: 'mrw',
    name: 'MRW - Urgente',
    providerName: 'MRW',
    category: 'national',
    description: 'MRW - Servicio urgente nacional (entrega día siguiente)',
    weightTiers: [
      { min_weight: 0, max_weight: 5000, price: 8.50 },
      { min_weight: 5000, max_weight: 10000, price: 11.20 },
      { min_weight: 10000, max_weight: 15000, price: 14.50 },
      { min_weight: 15000, max_weight: 20000, price: 17.80 },
      { min_weight: 20000, max_weight: 30000, price: 23.00 },
      { min_weight: 30000, max_weight: 40000, price: 28.50 },
      { min_weight: 40000, max_weight: 50000, price: 34.00 },
      { min_weight: 50000, max_weight: 70000, price: 43.00 },
      { min_weight: 70000, max_weight: 90000, price: 52.00 },
      { min_weight: 90000, max_weight: 100000, price: 60.00 },
    ],
  },
  {
    id: 'gls',
    name: 'GLS - BusinessParcel',
    providerName: 'GLS',
    category: 'national',
    description: 'GLS Spain - BusinessParcel estándar peninsular',
    weightTiers: [
      { min_weight: 0, max_weight: 5000, price: 6.80 },
      { min_weight: 5000, max_weight: 10000, price: 8.90 },
      { min_weight: 10000, max_weight: 15000, price: 11.50 },
      { min_weight: 15000, max_weight: 20000, price: 14.20 },
      { min_weight: 20000, max_weight: 30000, price: 18.50 },
      { min_weight: 30000, max_weight: 40000, price: 23.00 },
      { min_weight: 40000, max_weight: 50000, price: 28.00 },
      { min_weight: 50000, max_weight: 70000, price: 35.50 },
      { min_weight: 70000, max_weight: 90000, price: 44.00 },
      { min_weight: 90000, max_weight: 100000, price: 51.00 },
    ],
  },
  {
    id: 'nacex',
    name: 'Nacex - e-Nacex',
    providerName: 'Nacex',
    category: 'national',
    description: 'Nacex - Servicio e-Nacex para e-commerce peninsular',
    weightTiers: [
      { min_weight: 0, max_weight: 5000, price: 6.50 },
      { min_weight: 5000, max_weight: 10000, price: 8.70 },
      { min_weight: 10000, max_weight: 15000, price: 11.20 },
      { min_weight: 15000, max_weight: 20000, price: 13.80 },
      { min_weight: 20000, max_weight: 30000, price: 18.00 },
      { min_weight: 30000, max_weight: 40000, price: 22.50 },
      { min_weight: 40000, max_weight: 50000, price: 27.50 },
      { min_weight: 50000, max_weight: 70000, price: 35.00 },
      { min_weight: 70000, max_weight: 90000, price: 43.00 },
      { min_weight: 90000, max_weight: 100000, price: 50.00 },
    ],
  },

  // ============================================
  // INTERNACIONALES
  // ============================================
  {
    id: 'dhl',
    name: 'DHL Express - Nacional',
    providerName: 'DHL',
    category: 'international',
    description: 'DHL Express - Servicio estándar desde España',
    weightTiers: [
      { min_weight: 0, max_weight: 5000, price: 9.50 },
      { min_weight: 5000, max_weight: 10000, price: 13.80 },
      { min_weight: 10000, max_weight: 15000, price: 18.20 },
      { min_weight: 15000, max_weight: 20000, price: 22.50 },
      { min_weight: 20000, max_weight: 30000, price: 29.00 },
      { min_weight: 30000, max_weight: 40000, price: 36.00 },
      { min_weight: 40000, max_weight: 50000, price: 43.00 },
      { min_weight: 50000, max_weight: 70000, price: 55.00 },
      { min_weight: 70000, max_weight: 90000, price: 68.00 },
      { min_weight: 90000, max_weight: 100000, price: 78.00 },
    ],
  },
  {
    id: 'fedex',
    name: 'FedEx - Economy',
    providerName: 'FedEx',
    category: 'international',
    description: 'FedEx - Servicio Economy desde España',
    weightTiers: [
      { min_weight: 0, max_weight: 5000, price: 10.50 },
      { min_weight: 5000, max_weight: 10000, price: 15.00 },
      { min_weight: 10000, max_weight: 15000, price: 19.80 },
      { min_weight: 15000, max_weight: 20000, price: 24.50 },
      { min_weight: 20000, max_weight: 30000, price: 31.50 },
      { min_weight: 30000, max_weight: 40000, price: 39.00 },
      { min_weight: 40000, max_weight: 50000, price: 46.50 },
      { min_weight: 50000, max_weight: 70000, price: 59.00 },
      { min_weight: 70000, max_weight: 90000, price: 72.00 },
      { min_weight: 90000, max_weight: 100000, price: 82.00 },
    ],
  },
  {
    id: 'ups',
    name: 'UPS - Standard',
    providerName: 'UPS',
    category: 'international',
    description: 'UPS - Servicio Standard desde España',
    weightTiers: [
      { min_weight: 0, max_weight: 5000, price: 9.80 },
      { min_weight: 5000, max_weight: 10000, price: 14.20 },
      { min_weight: 10000, max_weight: 15000, price: 18.90 },
      { min_weight: 15000, max_weight: 20000, price: 23.50 },
      { min_weight: 20000, max_weight: 30000, price: 30.00 },
      { min_weight: 30000, max_weight: 40000, price: 37.50 },
      { min_weight: 40000, max_weight: 50000, price: 45.00 },
      { min_weight: 50000, max_weight: 70000, price: 57.00 },
      { min_weight: 70000, max_weight: 90000, price: 70.00 },
      { min_weight: 90000, max_weight: 100000, price: 80.00 },
    ],
  },
];

/** Obtener plantilla por ID */
export function getTemplateById(id: string): ShippingProviderTemplate | undefined {
  return SHIPPING_PROVIDER_TEMPLATES.find(t => t.id === id);
}

/** Filtrar plantillas por categoría */
export function getTemplatesByCategory(category: 'national' | 'international'): ShippingProviderTemplate[] {
  return SHIPPING_PROVIDER_TEMPLATES.filter(t => t.category === category);
}

/** Calcular coste de envío basado en peso y tramos */
export function calculateShippingCost(weightInGrams: number, tiers: ShippingWeightTier[]): number {
  if (weightInGrams <= 0 || tiers.length === 0) return 0;

  // Buscar el tramo que corresponde al peso
  const tier = tiers.find(
    t => weightInGrams > t.min_weight && weightInGrams <= t.max_weight
  );

  // Si el peso es exactamente 0, usar el primer tramo
  if (weightInGrams === 0) return 0;

  // Si no se encuentra tramo (peso mayor que el máximo), usar el último tramo
  if (!tier) {
    const maxTier = tiers.reduce((max, t) => t.max_weight > max.max_weight ? t : max, tiers[0]);
    if (weightInGrams > maxTier.max_weight) return maxTier.price;
    // Si el peso es menor o igual al min del primer tramo, usar primer tramo
    return tiers[0].price;
  }

  return tier.price;
}

/** Encontrar el tramo aplicable para un peso dado */
export function findApplicableTier(weightInGrams: number, tiers: ShippingWeightTier[]): ShippingWeightTier | null {
  if (weightInGrams <= 0 || tiers.length === 0) return null;

  const tier = tiers.find(
    t => weightInGrams > t.min_weight && weightInGrams <= t.max_weight
  );

  if (!tier) {
    const maxTier = tiers.reduce((max, t) => t.max_weight > max.max_weight ? t : max, tiers[0]);
    if (weightInGrams > maxTier.max_weight) return maxTier;
    return tiers[0];
  }

  return tier;
}
