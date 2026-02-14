import { z } from 'zod';

// Cliente
export const clientSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().max(20).optional(),
  address: z.string().max(500).optional(),
  tax_id: z.string().max(50).optional(),
  notes: z.string().max(1000).optional(),
});

export type ClientInput = z.infer<typeof clientSchema>;

// Invoice
export const invoiceItemSchema = z.object({
  description: z.string().min(1).max(200),
  quantity: z.number().positive().max(100000),
  unitPrice: z.number().positive().max(1000000),
});

export const invoiceSchema = z.object({
  invoiceNumber: z.string().min(1).max(50),
  clientName: z.string().min(1).max(100),
  clientAddress: z.string().max(500).optional(),
  clientPhone: z.string().max(20).optional(),
  clientEmail: z.string().email().optional().or(z.literal('')),
  issueDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  deliveryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  items: z.array(invoiceItemSchema).min(1).max(100),
  totalPrice: z.number().positive(),
  notes: z.string().max(1000).optional(),
});

export type InvoiceInput = z.infer<typeof invoiceSchema>;

// Project
export const projectCreateSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  filament_weight: z.number().nonnegative().max(100000),
  filament_price: z.number().nonnegative().max(100000),
  print_hours: z.number().nonnegative().max(10000),
  electricity_cost: z.number().nonnegative().max(1000),
  printer_power: z.number().positive().max(5000).default(350),
  vat_percentage: z.number().min(0).max(100).default(21),
  profit_margin: z.number().min(0).max(1000).default(30),
});

export type ProjectCreateInput = z.infer<typeof projectCreateSchema>;
