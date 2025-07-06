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
  pieces?: DatabasePiece[];
  created_at: string;
  updated_at: string;
}

export interface Piece {
  id: string;
  name: string;
  filamentWeight: number;
  filamentPrice: number;
  printHours: number;
  quantity: number;
  notes?: string;
}

export interface DatabasePiece {
  id: string;
  project_id: string;
  name: string;
  filament_weight: number;
  filament_price: number;
  print_hours: number;
  quantity: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface Material {
  id: string;
  name: string;
  price: number;
}

// Sales related types
export interface Sale {
  id: string;
  user_id: string;
  project_name: string;
  cost: number;
  unit_cost: number;
  quantity: number;
  sale_price: number;
  profit: number;
  margin: number;
  date: string;
  status: 'pending' | 'completed' | 'cancelled';
  print_hours?: number;
  created_at: string;
  updated_at: string;
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

export interface SaleFormData {
  projectName: string;
  unitCost: number;
  quantity: number;
  salePrice: number;
  date: string;
  printHours: number;
}

export interface ExpenseFormData {
  description: string;
  amount: number;
  category: string;
  date: string;
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