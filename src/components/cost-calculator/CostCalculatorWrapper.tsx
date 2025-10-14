import React, { useState } from 'react';
import { ViewMode } from '@/types';
import ModeSelection from './views/ModeSelection';
import FileImportView from './views/FileImportView';
import CostCalculator from './CostCalculator';
import type { DatabaseProject, DatabasePiece, Piece } from '@/types';

interface CostCalculatorWrapperProps {
  loadedProject?: DatabaseProject & { pieces?: DatabasePiece[] };
  onProjectSaved?: (project: DatabaseProject) => void;
  onNavigateToSettings?: () => void;
}

const CostCalculatorWrapper: React.FC<CostCalculatorWrapperProps> = ({
  loadedProject,
  onProjectSaved,
  onNavigateToSettings
}) => {
  const [currentView, setCurrentView] = useState<ViewMode | null>(
    loadedProject ? 'manual-entry' : null
  );
  const [importedPieces, setImportedPieces] = useState<Array<{
    id: string;
    name: string;
    filamentWeight: number;
    filamentPrice: number;
    printHours: number;
    quantity: number;
    notes?: string;
    materials?: Array<{
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
    }>;
  }>>([]);
  const [importedProjectName, setImportedProjectName] = useState('');

  const handleModeSelect = (mode: ViewMode) => {
    setCurrentView(mode);
  };

  const handleBackToModeSelection = () => {
    setCurrentView(null);
    setImportedPieces([]);
    setImportedProjectName('');
  };

  const handleImportComplete = (pieces: Piece[], projectName: string) => {
    // Convert Piece[] (snake_case) to expected format (camelCase)
    const convertedPieces = pieces.map(piece => ({
      id: piece.id,
      name: piece.name,
      filamentWeight: piece.filamentWeight,
      filamentPrice: piece.filamentPrice,
      printHours: piece.printHours,
      quantity: piece.quantity,
      notes: piece.notes,
      materials: piece.materials?.map(material => ({
        id: material.id,
        materialName: material.material_name,
        materialType: material.material_type,
        weight: material.weight,
        pricePerKg: material.price_per_kg,
        unit: material.unit,
        category: material.category,
        color: material.color,
        brand: material.brand,
        notes: material.notes
      }))
    }));
    setImportedPieces(convertedPieces);
    setImportedProjectName(projectName);
    setCurrentView('manual-entry');
  };

  // Si hay un proyecto cargado, mostrar directamente el calculador
  if (loadedProject) {
    return (
      <CostCalculator
        loadedProject={loadedProject}
        onProjectSaved={onProjectSaved}
        onNavigateToSettings={onNavigateToSettings}
      />
    );
  }

  // Mostrar selección de modo si no hay vista actual
  if (!currentView) {
    return <ModeSelection onModeSelect={handleModeSelect} />;
  }

  // Mostrar vista de importación de archivos
  if (currentView === 'file-import') {
    return (
      <FileImportView
        onBack={handleBackToModeSelection}
        onImportComplete={handleImportComplete}
      />
    );
  }

  // Mostrar calculador manual con datos importados si los hay
  if (currentView === 'manual-entry') {
    return (
      <CostCalculator
        loadedProject={undefined}
        onProjectSaved={onProjectSaved}
        onNavigateToSettings={onNavigateToSettings}
        importedData={{
          pieces: importedPieces,
          projectName: importedProjectName
        }}
      />
    );
  }

  return null;
};

export default CostCalculatorWrapper;
