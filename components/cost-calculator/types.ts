// ===== INTERFACES Y TIPOS =====

export interface Material {
  id: string;
  name: string;
  price: number;
}

export interface CostBreakdown {
  filament: number;
  electricity: number;
  materials: number;
  total: number;
}

export interface SalePrice {
  basePrice: number;
  priceWithMargin: number;
  priceWithTax: number;
  recommendedPrice: number;
}

// Nueva interfaz para piezas
export interface Piece {
  id: string;
  name: string;
  filamentWeight: number;
  filamentPrice: number;
  printHours: number;
  quantity: number;
  notes?: string;
}

// Database format (snake_case) - Actualizado para piezas
export interface DatabaseProject {
  id: string;
  user_id: string;
  name: string;
  // Campos legacy para compatibilidad
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
  created_at: string;
  updated_at: string;
  // Nuevos campos para piezas
  pieces?: DatabasePiece[];
}

// Database format para piezas
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

// App format (camelCase) - Actualizado para piezas
export interface Project {
  id: string;
  name: string;
  // Campos legacy para compatibilidad
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
  // Nuevos campos para piezas
  pieces?: Piece[];
}

export interface CostCalculatorProps {
  loadedProject?: DatabaseProject | null;
  onProjectSaved?: () => void;
}

export type ViewMode = 'selection' | 'file-upload' | 'manual-entry';

// Props para componentes individuales
export interface ModeSelectionProps {
  onModeSelect: (mode: ViewMode) => void;
}

export interface FileUploadProps {
  onBack: () => void;
  onFileAnalyzed: (weight: number, time: number) => void;
}

export interface ProjectInfoProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onReset: () => void;
  onSave: () => void;
}

export interface FilamentSectionProps {
  weight: number;
  price: number;
  onWeightChange: (weight: number) => void;
  onPriceChange: (price: number) => void;
}

export interface ElectricitySectionProps {
  printHours: number;
  electricityCost: number;
  onPrintHoursChange: (hours: number) => void;
  onElectricityCostChange: (cost: number) => void;
}

export interface PricingConfigProps {
  vatPercentage: number;
  profitMargin: number;
  onVatChange: (vat: number) => void;
  onMarginChange: (margin: number) => void;
}

export interface MaterialsSectionProps {
  materials: Material[];
  onAddMaterial: () => void;
  onUpdateMaterial: (id: string, field: 'name' | 'price', value: string | number) => void;
  onRemoveMaterial: (id: string) => void;
}

export interface CostBreakdownPanelProps {
  costs: CostBreakdown;
}

export interface SalePricePanelProps {
  salePrice: SalePrice;
  costs: CostBreakdown;
  vatPercentage: number;
  profitMargin: number;
}

export interface ProjectInfoPanelProps {
  filamentWeight: number;
  printHours: number;
  materials: Material[];
}

// Nuevas props para el sistema de piezas
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

export interface ProjectSummaryProps {
  pieces: Piece[];
  totalFilamentWeight: number;
  totalPrintHours: number;
  totalFilamentCost: number;
  totalElectricityCost: number;
}