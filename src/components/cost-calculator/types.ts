// Form section props interfaces
export interface ElectricitySectionProps {
  printHours: number;
  electricityCost: number;
  onElectricityCostChange: (cost: number) => void;
}

export interface FilamentSectionProps {
  weight: number;
  price: number;
  onWeightChange: (weight: number) => void;
  onPriceChange: (price: number) => void;
}

export interface MaterialsSectionProps {
  materials: Array<{
    id: string;
    name: string;
    price: number;
  }>;
  onAddMaterial: () => void;
  onUpdateMaterial: (id: string, field: 'name' | 'price', value: string | number) => void;
  onRemoveMaterial: (id: string) => void;
}

export interface ProjectInfoProps {
  projectName: string;
  onProjectNameChange: (name: string) => void;
  onReset: () => void;
  onSave: () => void;
}

export interface PricingConfigProps {
  vatPercentage: number;
  profitMargin: number;
  onVatChange: (percentage: number) => void;
  onMarginChange: (margin: number) => void;
}

// Material de una pieza para el cost calculator
export interface CostCalculatorPieceMaterial {
  id: string;
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

export interface PiecesSectionProps {
  pieces: Array<{
    id: string;
    name: string;
    filamentWeight: number; // DEPRECATED: mantener para compatibilidad
    filamentPrice: number; // DEPRECATED: mantener para compatibilidad
    printHours: number;
    quantity: number;
    notes?: string;
    materials?: CostCalculatorPieceMaterial[]; // Nueva estructura
  }>;
  onAddPiece: () => void;
  onUpdatePiece: (id: string, field: 'name' | 'filamentWeight' | 'filamentPrice' | 'printHours' | 'quantity' | 'notes', value: string | number) => void;
  onRemovePiece: (id: string) => void;
  onDuplicatePiece: (id: string) => void;
  // Nuevas funciones para manejar materiales
  onAddMaterialToPiece: (pieceId: string) => void;
  onUpdatePieceMaterial: (pieceId: string, materialId: string, field: keyof CostCalculatorPieceMaterial, value: string | number) => void;
  onRemovePieceMaterial: (pieceId: string, materialId: string) => void;
}

export interface PieceCardProps {
  piece: {
    id: string;
    name: string;
    filamentWeight: number; // DEPRECATED: mantener para compatibilidad
    filamentPrice: number; // DEPRECATED: mantener para compatibilidad
    printHours: number;
    quantity: number;
    notes?: string;
    materials?: CostCalculatorPieceMaterial[]; // Nueva estructura
  };
  onUpdate: (field: 'name' | 'filamentWeight' | 'filamentPrice' | 'printHours' | 'quantity' | 'notes', value: string | number) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  isFirst: boolean;
  // Nuevas funciones para manejar materiales
  onAddMaterial: () => void;
  onUpdateMaterial: (materialId: string, field: keyof CostCalculatorPieceMaterial, value: string | number) => void;
  onRemoveMaterial: (materialId: string) => void;
}

export interface ProjectInfoPanelProps {
  filamentWeight: number;
  printHours: number;
  materials: Array<{
    id: string;
    name: string;
    price: number;
  }>;
} 