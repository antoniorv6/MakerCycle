/**
 * Plantillas de impresoras 3D predefinidas
 * 
 * Este archivo contiene plantillas de las impresoras 3D más populares del mercado
 * con sus características típicas. Los usuarios pueden seleccionar una plantilla
 * al crear un nuevo perfil de impresora para rellenar automáticamente los campos.
 * 
 * Valores basados en especificaciones típicas del mercado (2024-2025):
 * - Consumo eléctrico: potencia media durante impresión (kW)
 * - Precio de compra: precio aproximado en euros (puede variar según región y ofertas)
 * - Horas de vida útil: estimación conservadora basada en uso profesional
 * 
 * NOTA: Estos valores son aproximados y deben ajustarse según:
 * - Precio real de compra del usuario
 * - Condiciones de uso específicas
 * - Modelo exacto y variante
 */

import type { DatabasePrinterPreset } from '@/types';

export interface PrinterTemplate {
  id: string;
  name: string;
  brand: string;
  model: string;
  category: 'filamento' | 'resina';
  power_consumption: number; // kW
  purchase_price: number; // €
  amortization_hours: number; // Horas estimadas de vida útil
  description?: string;
  notes?: string;
}

export const PRINTER_TEMPLATES: PrinterTemplate[] = [
  // ============================================
  // BAMBU LAB - FILAMENTO
  // ============================================
  {
    id: 'bambu-a1-mini',
    name: 'A1 mini',
    brand: 'Bambu Lab',
    model: 'A1 mini',
    category: 'filamento',
    power_consumption: 0.35,
    purchase_price: 300,
    amortization_hours: 3000,
    description: 'Impresora compacta con AMS Lite y alta velocidad',
    notes: 'Excelente para impresión multicolor. Muy rápida y silenciosa.'
  },
  {
    id: 'bambu-a1',
    name: 'A1',
    brand: 'Bambu Lab',
    model: 'A1',
    category: 'filamento',
    power_consumption: 0.38,
    purchase_price: 450,
    amortization_hours: 3000,
    description: 'Impresora de entrada con AMS Lite integrado',
    notes: 'Buena relación calidad-precio con soporte multicolor.'
  },
  {
    id: 'bambu-p1p',
    name: 'P1P',
    brand: 'Bambu Lab',
    model: 'P1P',
    category: 'filamento',
    power_consumption: 0.40,
    purchase_price: 650,
    amortization_hours: 3500,
    description: 'Impresora de gama media con alta velocidad y calidad',
    notes: 'Una de las mejores opciones precio-rendimiento del mercado.'
  },
  {
    id: 'bambu-p1s',
    name: 'P1S',
    brand: 'Bambu Lab',
    model: 'P1S',
    category: 'filamento',
    power_consumption: 0.42,
    purchase_price: 750,
    amortization_hours: 3500,
    description: 'P1P con carcasa cerrada para materiales avanzados',
    notes: 'Ideal para ABS, ASA y otros materiales que requieren temperatura controlada.'
  },
  {
    id: 'bambu-x1',
    name: 'X1',
    brand: 'Bambu Lab',
    model: 'X1',
    category: 'filamento',
    power_consumption: 0.48,
    purchase_price: 1200,
    amortization_hours: 4000,
    description: 'Impresora profesional con AMS integrado y LiDAR',
    notes: 'Versión sin filamento de carbono de la X1 Carbon.'
  },
  {
    id: 'bambu-x1-carbon',
    name: 'X1 Carbon',
    brand: 'Bambu Lab',
    model: 'X1 Carbon',
    category: 'filamento',
    power_consumption: 0.50,
    purchase_price: 1500,
    amortization_hours: 4000,
    description: 'Impresora profesional con AMS y filamento de carbono',
    notes: 'Top de gama. Excelente para producción y multicolor.'
  },
  {
    id: 'bambu-x1e',
    name: 'X1E',
    brand: 'Bambu Lab',
    model: 'X1E',
    category: 'filamento',
    power_consumption: 0.52,
    purchase_price: 2000,
    amortization_hours: 5000,
    description: 'Versión empresarial de la X1 con mayor robustez',
    notes: 'Diseñada para entornos profesionales y producción continua.'
  },
  {
    id: 'bambu-h2d',
    name: 'H2D',
    brand: 'Bambu Lab',
    model: 'H2D',
    category: 'filamento',
    power_consumption: 0.55,
    purchase_price: 1800,
    amortization_hours: 4000,
    description: 'Impresora grande con doble extrusor',
    notes: 'Volumen ampliado y capacidad de doble material.'
  },
  {
    id: 'bambu-h2s',
    name: 'H2S',
    brand: 'Bambu Lab',
    model: 'H2S',
    category: 'filamento',
    power_consumption: 0.53,
    purchase_price: 1600,
    amortization_hours: 4000,
    description: 'Impresora grande con extrusor simple',
    notes: 'Volumen ampliado para piezas grandes.'
  },
  {
    id: 'bambu-h2c',
    name: 'H2C',
    brand: 'Bambu Lab',
    model: 'H2C',
    category: 'filamento',
    power_consumption: 0.58,
    purchase_price: 2200,
    amortization_hours: 4500,
    description: 'Impresora grande con doble extrusor y carcasa cerrada',
    notes: 'Máxima versatilidad para producción profesional.'
  },

  // ============================================
  // PRUSA - FILAMENTO
  // ============================================
  {
    id: 'prusa-mini-plus',
    name: 'MINI+',
    brand: 'Prusa',
    model: 'MINI+',
    category: 'filamento',
    power_consumption: 0.25,
    purchase_price: 450,
    amortization_hours: 4000,
    description: 'Impresora compacta y confiable',
    notes: 'Excelente calidad y soporte. Fabricada en Europa.'
  },
  {
    id: 'prusa-mk3s-plus',
    name: 'MK3S+',
    brand: 'Prusa',
    model: 'MK3S+',
    category: 'filamento',
    power_consumption: 0.28,
    purchase_price: 850,
    amortization_hours: 5000,
    description: 'Versión mejorada del MK3, muy confiable',
    notes: 'Clásica impresora profesional. Muy confiable y con gran comunidad.'
  },
  {
    id: 'prusa-mk4',
    name: 'MK4',
    brand: 'Prusa',
    model: 'MK4',
    category: 'filamento',
    power_consumption: 0.30,
    purchase_price: 1100,
    amortization_hours: 5000,
    description: 'Impresora de gama media-alta con excelente calidad',
    notes: 'Referencia en calidad y confiabilidad. Fabricada en Europa.'
  },
  {
    id: 'prusa-mk4s',
    name: 'MK4S',
    brand: 'Prusa',
    model: 'MK4S',
    category: 'filamento',
    power_consumption: 0.30,
    purchase_price: 1200,
    amortization_hours: 5000,
    description: 'MK4 con sistema de múltiples materiales',
    notes: 'Versión mejorada con soporte para múltiples materiales.'
  },
  {
    id: 'prusa-xl',
    name: 'XL',
    brand: 'Prusa',
    model: 'XL',
    category: 'filamento',
    power_consumption: 0.60,
    purchase_price: 2500,
    amortization_hours: 6000,
    description: 'Impresora profesional grande con múltiples herramientas',
    notes: 'Ideal para producción profesional. Muy confiable y precisa.'
  },
  {
    id: 'prusa-core-one',
    name: 'CORE One',
    brand: 'Prusa',
    model: 'CORE One',
    category: 'filamento',
    power_consumption: 0.35,
    purchase_price: 1500,
    amortization_hours: 5000,
    description: 'Impresora CoreXY con alta velocidad',
    notes: 'Arquitectura CoreXY para impresiones más rápidas y precisas.'
  },

  // ============================================
  // PRUSA - RESINA
  // ============================================
  {
    id: 'prusa-sl1',
    name: 'SL1',
    brand: 'Prusa',
    model: 'SL1',
    category: 'resina',
    power_consumption: 0.20,
    purchase_price: 1800,
    amortization_hours: 3000,
    description: 'Impresora de resina profesional SLA',
    notes: 'Alta calidad y precisión. Ideal para aplicaciones profesionales.'
  },
  {
    id: 'prusa-sl1s-speed',
    name: 'SL1S SPEED',
    brand: 'Prusa',
    model: 'SL1S SPEED',
    category: 'resina',
    power_consumption: 0.22,
    purchase_price: 2000,
    amortization_hours: 3000,
    description: 'Impresora de resina profesional con alta velocidad',
    notes: 'Versión mejorada con mayor velocidad de impresión.'
  },

  // ============================================
  // CREALITY - FILAMENTO
  // ============================================
  {
    id: 'creality-ender-3',
    name: 'Ender 3',
    brand: 'Creality',
    model: 'Ender 3',
    category: 'filamento',
    power_consumption: 0.22,
    purchase_price: 180,
    amortization_hours: 2000,
    description: 'Impresora de entrada clásica',
    notes: 'Una de las impresoras más vendidas del mundo. Excelente para principiantes.'
  },
  {
    id: 'creality-ender-3-pro',
    name: 'Ender 3 Pro',
    brand: 'Creality',
    model: 'Ender 3 Pro',
    category: 'filamento',
    power_consumption: 0.24,
    purchase_price: 220,
    amortization_hours: 2000,
    description: 'Clásica impresora de entrada con cama magnética',
    notes: 'Versión mejorada de la Ender 3 con mejor cama.'
  },
  {
    id: 'creality-ender-3-v2',
    name: 'Ender 3 V2',
    brand: 'Creality',
    model: 'Ender 3 V2',
    category: 'filamento',
    power_consumption: 0.24,
    purchase_price: 250,
    amortization_hours: 2000,
    description: 'Ender 3 con pantalla mejorada y silenciador',
    notes: 'Mejoras en interfaz y reducción de ruido.'
  },
  {
    id: 'creality-ender-3-v3-se',
    name: 'Ender 3 V3 SE',
    brand: 'Creality',
    model: 'Ender 3 V3 SE',
    category: 'filamento',
    power_consumption: 0.22,
    purchase_price: 180,
    amortization_hours: 2000,
    description: 'Impresora de entrada con auto-nivelado y extrusor directo',
    notes: 'Excelente relación calidad-precio. Ideal para principiantes.'
  },
  {
    id: 'creality-ender-3-s1',
    name: 'Ender 3 S1',
    brand: 'Creality',
    model: 'Ender 3 S1',
    category: 'filamento',
    power_consumption: 0.25,
    purchase_price: 250,
    amortization_hours: 2000,
    description: 'Versión mejorada con extrusor directo y cama magnética',
    notes: 'Muy popular entre makers y pequeños negocios.'
  },
  {
    id: 'creality-ender-3-s1-pro',
    name: 'Ender 3 S1 Pro',
    brand: 'Creality',
    model: 'Ender 3 S1 Pro',
    category: 'filamento',
    power_consumption: 0.26,
    purchase_price: 350,
    amortization_hours: 2500,
    description: 'S1 con cama caliente de alta temperatura',
    notes: 'Ideal para materiales avanzados como ABS y PETG.'
  },
  {
    id: 'creality-ender-3-max',
    name: 'Ender 3 Max',
    brand: 'Creality',
    model: 'Ender 3 Max',
    category: 'filamento',
    power_consumption: 0.30,
    purchase_price: 400,
    amortization_hours: 2500,
    description: 'Ender 3 con volumen ampliado',
    notes: 'Volumen de impresión más grande para piezas grandes.'
  },
  {
    id: 'creality-k1',
    name: 'K1',
    brand: 'Creality',
    model: 'K1',
    category: 'filamento',
    power_consumption: 0.38,
    purchase_price: 500,
    amortization_hours: 3000,
    description: 'Impresora rápida de gama media con cama caliente',
    notes: 'Buena velocidad y calidad a precio competitivo.'
  },
  {
    id: 'creality-k1-max',
    name: 'K1 Max',
    brand: 'Creality',
    model: 'K1 Max',
    category: 'filamento',
    power_consumption: 0.45,
    purchase_price: 750,
    amortization_hours: 3000,
    description: 'Versión grande de la K1 con volumen de impresión ampliado',
    notes: 'Ideal para piezas grandes. Misma tecnología que K1.'
  },
  {
    id: 'creality-k2',
    name: 'K2',
    brand: 'Creality',
    model: 'K2',
    category: 'filamento',
    power_consumption: 0.42,
    purchase_price: 800,
    amortization_hours: 3000,
    description: 'Impresora CoreXY de gama media',
    notes: 'Arquitectura CoreXY para mayor velocidad y precisión.'
  },
  {
    id: 'creality-k2-pro',
    name: 'K2 Pro',
    brand: 'Creality',
    model: 'K2 Pro',
    category: 'filamento',
    power_consumption: 0.48,
    purchase_price: 1200,
    amortization_hours: 3500,
    description: 'Impresora profesional con soporte para hasta 16 filamentos',
    notes: 'Cámara AI, nivelado inteligente, ideal para producción.'
  },
  {
    id: 'creality-cr-10',
    name: 'CR-10',
    brand: 'Creality',
    model: 'CR-10',
    category: 'filamento',
    power_consumption: 0.35,
    purchase_price: 400,
    amortization_hours: 2500,
    description: 'Impresora grande para piezas de gran tamaño',
    notes: 'Volumen de impresión muy grande.'
  },
  {
    id: 'creality-cr-10-s5',
    name: 'CR-10 S5',
    brand: 'Creality',
    model: 'CR-10 S5',
    category: 'filamento',
    power_consumption: 0.50,
    purchase_price: 800,
    amortization_hours: 3000,
    description: 'Impresora grande para piezas de gran tamaño',
    notes: 'Volumen de impresión muy grande (500x500x500mm).'
  },
  {
    id: 'creality-kobra-2',
    name: 'Kobra 2',
    brand: 'Creality',
    model: 'Kobra 2',
    category: 'filamento',
    power_consumption: 0.28,
    purchase_price: 300,
    amortization_hours: 2500,
    description: 'Impresora de entrada con auto-nivelado',
    notes: 'Buena alternativa a las Ender series.'
  },
  {
    id: 'creality-kobra-2-pro',
    name: 'Kobra 2 Pro',
    brand: 'Creality',
    model: 'Kobra 2 Pro',
    category: 'filamento',
    power_consumption: 0.32,
    purchase_price: 350,
    amortization_hours: 2500,
    description: 'Impresora de gama media con cama grande',
    notes: 'Buena opción para impresiones grandes a buen precio.'
  },
  {
    id: 'creality-kobra-2-max',
    name: 'Kobra 2 Max',
    brand: 'Creality',
    model: 'Kobra 2 Max',
    category: 'filamento',
    power_consumption: 0.40,
    purchase_price: 500,
    amortization_hours: 2500,
    description: 'Kobra 2 con volumen ampliado',
    notes: 'Volumen grande para piezas grandes.'
  },

  // ============================================
  // CREALITY - RESINA
  // ============================================
  {
    id: 'creality-halot-one',
    name: 'HALOT-ONE',
    brand: 'Creality',
    model: 'HALOT-ONE',
    category: 'resina',
    power_consumption: 0.15,
    purchase_price: 200,
    amortization_hours: 1500,
    description: 'Impresora de resina de entrada con pantalla 4K',
    notes: 'Excelente para miniaturas y detalles finos.'
  },
  {
    id: 'creality-halot-one-plus',
    name: 'HALOT-ONE Plus',
    brand: 'Creality',
    model: 'HALOT-ONE Plus',
    category: 'resina',
    power_consumption: 0.16,
    purchase_price: 250,
    amortization_hours: 1500,
    description: 'Versión mejorada de la HALOT-ONE',
    notes: 'Mejoras en resolución y velocidad.'
  },
  {
    id: 'creality-halot-mage',
    name: 'HALOT-MAGE',
    brand: 'Creality',
    model: 'HALOT-MAGE',
    category: 'resina',
    power_consumption: 0.18,
    purchase_price: 300,
    amortization_hours: 2000,
    description: 'Impresora de resina con pantalla 8K',
    notes: 'Alta resolución. Ideal para joyería y miniaturas.'
  },
  {
    id: 'creality-halot-x1',
    name: 'HALOT-X1',
    brand: 'Creality',
    model: 'HALOT-X1',
    category: 'resina',
    power_consumption: 0.20,
    purchase_price: 400,
    amortization_hours: 2000,
    description: 'Impresora de resina profesional con alta resolución',
    notes: 'Excelente calidad y precisión para aplicaciones profesionales.'
  },
  {
    id: 'creality-ld-002',
    name: 'LD-002',
    brand: 'Creality',
    model: 'LD-002',
    category: 'resina',
    power_consumption: 0.15,
    purchase_price: 180,
    amortization_hours: 1500,
    description: 'Impresora de resina de entrada',
    notes: 'Buena opción para principiantes en resina.'
  },
  {
    id: 'creality-ld-002h',
    name: 'LD-002H',
    brand: 'Creality',
    model: 'LD-002H',
    category: 'resina',
    power_consumption: 0.16,
    purchase_price: 220,
    amortization_hours: 1500,
    description: 'LD-002 con pantalla monocromática',
    notes: 'Mayor velocidad de impresión con pantalla monocromática.'
  },

  // ============================================
  // ANYCUBIC - FILAMENTO
  // ============================================
  {
    id: 'anycubic-kobra',
    name: 'Kobra',
    brand: 'Anycubic',
    model: 'Kobra',
    category: 'filamento',
    power_consumption: 0.26,
    purchase_price: 250,
    amortization_hours: 2500,
    description: 'Impresora de entrada con auto-nivelado',
    notes: 'Buena alternativa a las Creality Ender.'
  },
  {
    id: 'anycubic-kobra-2',
    name: 'Kobra 2',
    brand: 'Anycubic',
    model: 'Kobra 2',
    category: 'filamento',
    power_consumption: 0.23,
    purchase_price: 200,
    amortization_hours: 2500,
    description: 'Impresora de entrada con auto-nivelado',
    notes: 'Buena alternativa a las Creality.'
  },
  {
    id: 'anycubic-kobra-2-pro',
    name: 'Kobra 2 Pro',
    brand: 'Anycubic',
    model: 'Kobra 2 Pro',
    category: 'filamento',
    power_consumption: 0.32,
    purchase_price: 350,
    amortization_hours: 2500,
    description: 'Impresora de gama media con cama grande',
    notes: 'Buena opción para impresiones grandes a buen precio.'
  },
  {
    id: 'anycubic-kobra-2-max',
    name: 'Kobra 2 Max',
    brand: 'Anycubic',
    model: 'Kobra 2 Max',
    category: 'filamento',
    power_consumption: 0.40,
    purchase_price: 450,
    amortization_hours: 2500,
    description: 'Kobra 2 con volumen ampliado',
    notes: 'Volumen grande para piezas grandes.'
  },
  {
    id: 'anycubic-kobra-x',
    name: 'Kobra X',
    brand: 'Anycubic',
    model: 'Kobra X',
    category: 'filamento',
    power_consumption: 0.35,
    purchase_price: 400,
    amortization_hours: 2500,
    description: 'Impresora rápida con extrusor directo',
    notes: 'Excelente velocidad de impresión.'
  },
  {
    id: 'anycubic-kobra-s1',
    name: 'Kobra S1',
    brand: 'Anycubic',
    model: 'Kobra S1',
    category: 'filamento',
    power_consumption: 0.30,
    purchase_price: 300,
    amortization_hours: 2500,
    description: 'Impresora de entrada con extrusor directo',
    notes: 'Buena relación calidad-precio.'
  },
  {
    id: 'anycubic-kobra-s1-max',
    name: 'Kobra S1 Max',
    brand: 'Anycubic',
    model: 'Kobra S1 Max',
    category: 'filamento',
    power_consumption: 0.38,
    purchase_price: 500,
    amortization_hours: 2500,
    description: 'Kobra S1 con volumen ampliado',
    notes: 'Volumen grande para piezas grandes.'
  },

  // ============================================
  // ANYCUBIC - RESINA
  // ============================================
  {
    id: 'anycubic-photon-mono',
    name: 'Photon Mono',
    brand: 'Anycubic',
    model: 'Photon Mono',
    category: 'resina',
    power_consumption: 0.15,
    purchase_price: 200,
    amortization_hours: 1500,
    description: 'Impresora de resina de entrada con pantalla monocromática',
    notes: 'Excelente para miniaturas y detalles finos. Buena relación calidad-precio.'
  },
  {
    id: 'anycubic-photon-mono-2',
    name: 'Photon Mono 2',
    brand: 'Anycubic',
    model: 'Photon Mono 2',
    category: 'resina',
    power_consumption: 0.16,
    purchase_price: 250,
    amortization_hours: 1500,
    description: 'Versión mejorada de la Photon Mono',
    notes: 'Mejoras en resolución y velocidad.'
  },
  {
    id: 'anycubic-photon-mono-4k',
    name: 'Photon Mono 4K',
    brand: 'Anycubic',
    model: 'Photon Mono 4K',
    category: 'resina',
    power_consumption: 0.17,
    purchase_price: 300,
    amortization_hours: 1500,
    description: 'Impresora de resina con pantalla 4K',
    notes: 'Alta resolución. Ideal para detalles finos.'
  },
  {
    id: 'anycubic-photon-mono-x',
    name: 'Photon Mono X',
    brand: 'Anycubic',
    model: 'Photon Mono X',
    category: 'resina',
    power_consumption: 0.20,
    purchase_price: 500,
    amortization_hours: 2000,
    description: 'Impresora de resina grande con pantalla 6K',
    notes: 'Volumen grande para resina. Buena para producción.'
  },
  {
    id: 'anycubic-photon-m3',
    name: 'Photon M3',
    brand: 'Anycubic',
    model: 'Photon M3',
    category: 'resina',
    power_consumption: 0.18,
    purchase_price: 350,
    amortization_hours: 2000,
    description: 'Impresora de resina con pantalla 4K',
    notes: 'Buena relación calidad-precio.'
  },
  {
    id: 'anycubic-photon-m3-max',
    name: 'Photon M3 Max',
    brand: 'Anycubic',
    model: 'Photon M3 Max',
    category: 'resina',
    power_consumption: 0.22,
    purchase_price: 600,
    amortization_hours: 2000,
    description: 'Impresora de resina grande con pantalla 4K',
    notes: 'Volumen grande para resina. Buena para producción.'
  },
  {
    id: 'anycubic-photon-m3-plus',
    name: 'Photon M3 Plus',
    brand: 'Anycubic',
    model: 'Photon M3 Plus',
    category: 'resina',
    power_consumption: 0.20,
    purchase_price: 450,
    amortization_hours: 2000,
    description: 'Versión mejorada de la Photon M3',
    notes: 'Mejoras en velocidad y resolución.'
  },
  {
    id: 'anycubic-photon-m5s',
    name: 'Photon M5s',
    brand: 'Anycubic',
    model: 'Photon M5s',
    category: 'resina',
    power_consumption: 0.18,
    purchase_price: 300,
    amortization_hours: 1500,
    description: 'Impresora de resina con pantalla 8K',
    notes: 'Alta resolución. Ideal para joyería y miniaturas.'
  },
  {
    id: 'anycubic-photon-d2',
    name: 'Photon D2',
    brand: 'Anycubic',
    model: 'Photon D2',
    category: 'resina',
    power_consumption: 0.20,
    purchase_price: 400,
    amortization_hours: 2000,
    description: 'Impresora de resina tipo DLP',
    notes: 'Tecnología DLP para mayor precisión y velocidad.'
  },
  {
    id: 'anycubic-photon-p1',
    name: 'Photon P1',
    brand: 'Anycubic',
    model: 'Photon P1',
    category: 'resina',
    power_consumption: 0.19,
    purchase_price: 350,
    amortization_hours: 2000,
    description: 'Impresora de resina dual-color/dual-material',
    notes: 'Soporte para impresión dual-color y dual-material.'
  },
];

/**
 * Obtener plantillas por categoría
 */
export function getTemplatesByCategory(category: PrinterTemplate['category']): PrinterTemplate[] {
  return PRINTER_TEMPLATES.filter(template => template.category === category);
}

/**
 * Buscar plantillas por nombre, marca o modelo
 */
export function searchTemplates(query: string): PrinterTemplate[] {
  const lowerQuery = query.toLowerCase();
  return PRINTER_TEMPLATES.filter(template =>
    template.name.toLowerCase().includes(lowerQuery) ||
    template.brand.toLowerCase().includes(lowerQuery) ||
    template.model.toLowerCase().includes(lowerQuery)
  );
}

/**
 * Obtener una plantilla por ID
 */
export function getTemplateById(id: string): PrinterTemplate | undefined {
  return PRINTER_TEMPLATES.find(template => template.id === id);
}

/**
 * Convertir una plantilla a formato DatabasePrinterPreset
 * (sin user_id, team_id, created_at, updated_at)
 */
export function templateToPreset(template: PrinterTemplate): Omit<DatabasePrinterPreset, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'team_id'> {
  return {
    name: template.name,
    power_consumption: template.power_consumption,
    purchase_price: template.purchase_price,
    amortization_hours: template.amortization_hours,
    current_usage_hours: 0,
    brand: template.brand,
    model: template.model,
    notes: template.description || template.notes || '',
    is_default: false,
    amortization_method: 'percentage',
    amortization_value: 10,
    is_being_amortized: false,
  };
}
