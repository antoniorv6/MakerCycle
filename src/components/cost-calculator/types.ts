// Form section props interfaces
export interface ElectricitySectionProps {
  printHours: number;
  electricityCost: number;
  onPrintHoursChange: (hours: number) => void;
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

export interface PiecesSectionProps {
  pieces: Array<{
    id: string;
    name: string;
    filamentWeight: number;
    filamentPrice: number;
    printHours: number;
    quantity: number;
    notes?: string;
  }>;
  onAddPiece: () => void;
  onUpdatePiece: (id: string, field: 'name' | 'filamentWeight' | 'filamentPrice' | 'printHours' | 'quantity' | 'notes', value: string | number) => void;
  onRemovePiece: (id: string) => void;
  onDuplicatePiece: (id: string) => void;
}

export interface PieceCardProps {
  piece: {
    id: string;
    name: string;
    filamentWeight: number;
    filamentPrice: number;
    printHours: number;
    quantity: number;
    notes?: string;
  };
  onUpdate: (field: 'name' | 'filamentWeight' | 'filamentPrice' | 'printHours' | 'quantity' | 'notes', value: string | number) => void;
  onRemove: () => void;
  onDuplicate: () => void;
  isFirst: boolean;
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