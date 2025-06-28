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

// Database format (snake_case)
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
  created_at: string;
  updated_at: string;
}

// App format (camelCase) - for backward compatibility
export interface Project {
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