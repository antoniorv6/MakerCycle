// Core application types
export interface User {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

// Project related types
export interface Project {
  id: string;
  user_id: string;
  name: string;
  filament_weight: number;
  filament_price: number;
  print_hours: number;
  electricity_cost: number;
  materials: Material[];
  total_cost: number;
  vat_percentage: number;
  profit_margin: number;
  recommended_price: number;
  status: 'draft' | 'calculated' | 'completed';
  pieces?: Piece[];
  created_at: string;
  updated_at: string;
}

// App format (camelCase) for UI components
export interface AppProject {
  id: string;
  name: string;
  filamentWeight: number;
  filamentPrice: number;
  printHours: number;
  electricityCost: number;
  materials: Material[];
  totalCost: number;
  vatPercentage: number;
  profitMargin: number;
  recommendedPrice: number;
  createdAt: string;
  status: 'draft' | 'calculated' | 'completed';
  pieces?: AppPiece[];
}

export interface AppPiece {
  id: string;
  name: string;
  filamentWeight: number;
  filamentPrice: number;
  printHours: number;
  quantity: number;
  notes?: string;
}

export interface DatabaseProject {
  id: string;
  user_id: string;
  name: string;
  filament_weight: number;
  filament_price: number;
  print_hours: number;
  electricity_cost: number;
  materials: Material[];
  total_cost: number;
  vat_percentage: number;
  profit_margin: number;
  recommended_price: number;
  status: 'draft' | 'calculated' | 'completed';
  team_id?: string | null;
  pieces?: DatabasePiece[];
  created_at: string;
  updated_at: string;
}

// Material de una pieza específica
export interface PieceMaterial {
  id: string;
  piece_id: string;
  material_preset_id?: string;
  material_name: string;
  material_type: string;
  weight: number;
  price_per_kg: number;
  unit: string;
  category: 'filament' | 'resin';
  color?: string;
  brand?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Material de una pieza específica (formato app)
export interface AppPieceMaterial {
  id: string;
  pieceId: string;
  materialPresetId?: string;
  materialName: string;
  materialType: string;
  weight: number;
  pricePerKg: number;
  unit: string;
  category: 'filament' | 'resin';
  color?: string;
  brand?: string;
  notes?: string;
}

export interface Piece {
  id: string;
  name: string;
  filamentWeight: number; // DEPRECATED: usar materials array
  filamentPrice: number; // DEPRECATED: usar materials array
  printHours: number;
  quantity: number;
  notes?: string;
  materials?: PieceMaterial[]; // Nueva estructura para múltiples materiales
}

export interface DatabasePiece {
  id: string;
  project_id: string;
  name: string;
  filament_weight: number; // DEPRECATED: usar materials array
  filament_price: number; // DEPRECATED: usar materials array
  print_hours: number;
  quantity: number;
  notes?: string;
  created_at: string;
  updated_at: string;
  materials?: PieceMaterial[]; // Nueva estructura para múltiples materiales
}

export interface Material {
  id: string;
  name: string;
  price: number;
}

// Client related types
export interface Client {
  id: string;
  user_id: string;
  name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  tax_id: string | null;
  notes: string | null;
  team_id?: string | null;
  created_at: string;
  updated_at: string;
}

// Sales related types
export interface SaleItem {
  id: string;
  sale_id: string;
  project_id?: string | null;
  project_name: string;
  unit_cost: number;
  quantity: number;
  sale_price: number;
  print_hours: number;
  created_at: string;
  updated_at: string;
}

export interface Sale {
  id: string;
  user_id: string;
  total_amount: number;
  total_cost: number;
  total_profit: number;
  total_margin: number;
  total_print_hours: number;
  items_count: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  team_id?: string | null;
  client_id?: string | null;
  created_at: string;
  updated_at: string;
  items?: SaleItem[];
}

// Expense related types
export interface Expense {
  id: string;
  user_id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  status: 'pending' | 'paid' | 'cancelled';
  notes?: string;
  team_id?: string | null;
  created_at: string;
  updated_at: string;
}

// Team related types
export interface Team {
  id: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  team_id: string;
  user_id: string;
  role: 'owner' | 'member' | 'admin';
  created_at: string;
}

// Statistics types
export interface DashboardStats {
  totalProjects: number;
  totalSales: number;
  totalRevenue: number;
  totalProfit: number;
  averageMargin: number;
  totalPrintHours: number;
  averageEurosPerHour: number;
  totalProducts: number;
  totalExpenses: number;
  netProfit: number;
}

export interface AccountingStats {
  totalRevenue: number;
  totalCosts: number;
  totalExpenses: number;
  totalProfit: number;
  netProfit: number;
  averageMargin: number;
  totalSales: number;
  averageEurosPerHour: number;
  totalPrintHours: number;
  totalProducts: number;
  totalExpensesCount: number;
}

// Cost calculator types
export type ViewMode = 'manual-entry';

export interface CostCalculatorProps {
  loadedProject?: DatabaseProject;
  onProjectSaved?: (project: DatabaseProject) => void;
}



// Form types
export interface ProjectFormData {
  name: string;
  filament_weight: number;
  filament_price: number;
  print_hours: number;
  electricity_cost: number;
  materials: Material[];
  vat_percentage: number;
  profit_margin: number;
  pieces: Piece[];
}

export interface SaleItemFormData {
  project_id?: string | null;
  project_name: string;
  unit_cost: number;
  quantity: number;
  sale_price: number;
  print_hours: number;
}

export interface SaleFormData {
  date: string;
  team_id?: string | null;
  client_id?: string | null;
  items: SaleItemFormData[];
}

export interface ExpenseFormData {
  description: string;
  amount: number;
  category: string;
  date: string;
  notes: string;
  team_id?: string | null;
}

export interface InvoiceFormData {
  // Datos del cliente
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;
  
  // Datos del albarán
  invoiceNumber: string;
  issueDate: string;
  deliveryDate: string;
  
  // Datos de los servicios (múltiples items)
  items: {
    description: string;
    quantity: number;
    unitPrice: number;
    totalPrice: number;
  }[];
  
  // Totales
  subtotal: number;
  totalPrice: number;
  
  // Notas adicionales
  notes: string;
}

// API Response types
export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  count: number;
  page: number;
  limit: number;
}

// Cost calculator component props
export interface ProjectSummaryProps {
  pieces: Piece[];
  totalFilamentWeight: number;
  totalPrintHours: number;
  totalFilamentCost: number;
  totalElectricityCost: number;
}

// Cost calculator panel props
export interface CostBreakdownPanelProps {
  costs: {
    filament: number;
    electricity: number;
    materials: number;
    total: number;
  };
}

export interface SalePricePanelProps {
  salePrice: {
    basePrice: number;
    priceWithMargin: number;
    priceWithTax: number;
    recommendedPrice: number;
  };
  costs: {
    filament: number;
    electricity: number;
    materials: number;
    total: number;
  };
  vatPercentage: number;
  profitMargin: number;
}

export interface PiecesSectionProps {
  pieces: Piece[];
  onAddPiece: () => void;
  onUpdatePiece: (id: string, field: keyof Piece, value: string | number) => void;
  onRemovePiece: (id: string) => void;
  onDuplicatePiece: (id: string) => void;
}

export interface PieceCardProps {
  piece: Piece;
  onUpdate: (field: keyof Piece, value: string | number) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  isFirst: boolean;
}

export interface ModeSelectionProps {
  onModeSelect: (mode: ViewMode) => void;
}

// Material preset types
export interface MaterialPreset {
  id: string;
  user_id: string;
  team_id?: string | null;
  name: string;
  price_per_unit: number;
  unit: string;
  material_type: string;
  category: 'filament' | 'resin';
  color?: string;
  brand?: string;
  notes?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface DatabaseMaterialPreset {
  id: string;
  user_id: string;
  team_id?: string | null;
  name: string;
  price_per_unit: number;
  unit: string;
  material_type: string;
  category: 'filament' | 'resin';
  color?: string;
  brand?: string;
  notes?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface AppMaterialPreset {
  id: string;
  name: string;
  pricePerUnit: number;
  unit: string;
  materialType: string;
  category: 'filament' | 'resin';
  color?: string;
  brand?: string;
  notes?: string;
  isDefault: boolean;
}

export type KanbanStatus = 'pending' | 'in_progress' | 'completed';

export interface KanbanCard {
  id: string;
  user_id: string;
  team_id?: string | null;
  project_id: string;
  status: KanbanStatus;
  created_at: string;
  updated_at: string;
  project?: Project; // opcional, para joins
} 
