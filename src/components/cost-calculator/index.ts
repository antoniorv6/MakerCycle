// Exportación principal
export { default } from './CostCalculatorWrapper';
export { default as CostCalculator } from './CostCalculator';

// Exportar tipos para uso externo
export type {
  Material,
  Project,
  DatabaseProject,
  DatabasePiece,
  Piece,
  CostCalculatorProps,
  ViewMode
} from '@/types';

// Exportar hook personalizado
export { useCostCalculations } from './hooks/useCostCalculations';

// Exportar componentes individuales si necesitas usarlos por separado
export { default as ModeSelection } from './views/ModeSelection';
export { default as FileImportView } from './views/FileImportView';

export { default as ProjectInfo } from './forms/ProjectInfo';
export { default as FilamentSection } from './forms/FilamentSection';
export { default as ElectricitySection } from './forms/ElectricitySection';
export { default as PricingConfig } from './forms/PricingConfig';
export { default as MaterialsSection } from './forms/MaterialsSection';
export { default as PiecesSection } from './forms/PiecesSection';
export { default as CostBreakdownPanel } from './panels/CostBreakdownPanel';
export { default as SalePricePanel } from './panels/SalePricePanel';
export { default as ProjectInfoPanel } from './panels/ProjectInfoPanel';
export { default as ProjectSummaryPanel } from './panels/ProjectSummaryPanel';