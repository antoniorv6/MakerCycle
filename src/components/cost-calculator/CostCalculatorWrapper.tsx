import React, { useState, useCallback } from 'react';
import { ViewMode } from '@/types';
import ModeSelection from './views/ModeSelection';
import FileImportView from './views/FileImportView';
import CostCalculator from './CostCalculator';
import { useProjectDraft, type ProjectDraft } from './hooks/useProjectDraft';
import { toast } from 'react-hot-toast';
import type { DatabaseProject, DatabasePiece, Piece } from '@/types';

interface CostCalculatorWrapperProps {
  loadedProject?: DatabaseProject & { pieces?: DatabasePiece[] };
  onProjectSaved?: (project: DatabaseProject) => void;
  onEditingComplete?: () => void;
  onNavigateToSettings?: () => void;
}

const CostCalculatorWrapper: React.FC<CostCalculatorWrapperProps> = ({
  loadedProject,
  onProjectSaved,
  onEditingComplete,
  onNavigateToSettings
}) => {
  const [currentView, setCurrentView] = useState<ViewMode | null>(null);
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
  const [loadedDraft, setLoadedDraft] = useState<ProjectDraft | null>(null);

  // Use the project draft hook
  const { drafts, deleteDraft } = useProjectDraft();

  // Handle loading a draft from the pending drafts panel
  const handleLoadDraft = useCallback((draft: ProjectDraft) => {
    setLoadedDraft(draft);
    setCurrentView('manual-entry');
    toast.success('Borrador cargado');
  }, []);

  // Handle deleting a draft
  const handleDeleteDraft = useCallback((draftId: string) => {
    deleteDraft(draftId);
    toast.success('Borrador eliminado');
  }, [deleteDraft]);

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

  // CASO 1: Si hay un proyecto cargado para editar, ir DIRECTAMENTE a la calculadora
  if (loadedProject) {
    return (
      <CostCalculator
        loadedProject={loadedProject}
        onProjectSaved={onProjectSaved}
        onEditingComplete={onEditingComplete}
        onNavigateToSettings={onNavigateToSettings}
      />
    );
  }

  // CASO 2: Mostrar selección de modo si no hay vista actual
  if (!currentView) {
    return (
      <ModeSelection
        onModeSelect={handleModeSelect}
        drafts={drafts}
        onLoadDraft={handleLoadDraft}
        onDeleteDraft={handleDeleteDraft}
      />
    );
  }

  // CASO 3: Mostrar vista de importación de archivos
  if (currentView === 'file-import') {
    return (
      <FileImportView
        onBack={handleBackToModeSelection}
        onImportComplete={handleImportComplete}
      />
    );
  }

  // CASO 4: Mostrar calculador manual (proyecto nuevo)
  if (currentView === 'manual-entry') {
    return (
      <CostCalculator
        loadedProject={undefined}
        onProjectSaved={onProjectSaved}
        onEditingComplete={onEditingComplete}
        onNavigateToSettings={onNavigateToSettings}
        importedData={importedPieces.length > 0 ? {
          pieces: importedPieces,
          projectName: importedProjectName
        } : undefined}
        loadedDraft={loadedDraft}
      />
    );
  }

  return null;
};

export default CostCalculatorWrapper;
