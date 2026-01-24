import React, { useState, useEffect } from 'react';
import { ViewMode } from '@/types';
import ModeSelection from './views/ModeSelection';
import FileImportView from './views/FileImportView';
import CostCalculator from './CostCalculator';
import { useProjectDraft, type ProjectDraft } from './hooks/useProjectDraft';
import { FileText, Plus, Clock } from 'lucide-react';
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
  const { loadDraft, clearDraft, hasDraft, getDraftTimestamp } = useProjectDraft();
  const [currentView, setCurrentView] = useState<ViewMode | null>(
    loadedProject ? 'manual-entry' : null
  );
  const [showPendingProjectModal, setShowPendingProjectModal] = useState(false);
  const [pendingDraft, setPendingDraft] = useState<ProjectDraft | null>(null);
  const [shouldLoadDraft, setShouldLoadDraft] = useState(false);
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

  // Verificar si hay un proyecto pendiente en localStorage al montar
  useEffect(() => {
    // Solo verificar si no hay proyecto cargado y no estamos en una vista específica
    if (!loadedProject && !currentView) {
      const draft = loadDraft();
      if (draft && hasDraft()) {
        setPendingDraft(draft);
        setShowPendingProjectModal(true);
      }
    }
  }, [loadedProject, loadDraft, hasDraft, currentView]);

  // Función para formatear el tiempo transcurrido
  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'hace unos segundos';
    if (diffMins < 60) return `hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
  };

  // Continuar con el proyecto pendiente
  const handleContinuePendingProject = () => {
    setShowPendingProjectModal(false);
    setShouldLoadDraft(true);
    setCurrentView('manual-entry');
  };

  // Empezar un proyecto nuevo (descarta el pendiente)
  const handleStartNewProject = () => {
    clearDraft();
    setPendingDraft(null);
    setShowPendingProjectModal(false);
    setShouldLoadDraft(false);
  };

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

  // Modal de proyecto pendiente
  if (showPendingProjectModal && pendingDraft) {
    const savedDate = new Date(pendingDraft.savedAt);
    const timeAgo = getTimeAgo(savedDate);
    const projectName = pendingDraft.projectName || 'Sin nombre';
    const piecesCount = pendingDraft.pieces?.length || 0;
    
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-8 text-white">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                <FileText className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">Proyecto pendiente</h2>
                <p className="text-amber-100 mt-1">Tienes un proyecto sin guardar</p>
              </div>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Info del proyecto */}
            <div className="bg-slate-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Nombre del proyecto</span>
                <span className="text-sm font-semibold text-slate-900">
                  {projectName === '' ? 'Sin nombre' : projectName}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Piezas</span>
                <span className="text-sm font-semibold text-slate-900">{piecesCount}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-500">Tipo</span>
                <span className="text-sm font-semibold text-slate-900 capitalize">
                  {pendingDraft.projectType === 'resin' ? 'Resina' : 'Filamento'}
                </span>
              </div>
              <div className="flex items-center gap-2 text-slate-500 pt-2 border-t border-slate-200">
                <Clock className="w-4 h-4" />
                <span className="text-sm">Guardado {timeAgo}</span>
              </div>
            </div>

            {/* Mensaje */}
            <p className="text-slate-600 text-center">
              ¿Quieres continuar con este proyecto o empezar uno nuevo?
            </p>

            {/* Botones */}
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={handleStartNewProject}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-xl transition-colors"
              >
                <Plus className="w-5 h-5" />
                Empezar nuevo proyecto
              </button>
              <button
                onClick={handleContinuePendingProject}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-medium rounded-xl transition-all shadow-lg hover:shadow-xl"
              >
                <FileText className="w-5 h-5" />
                Continuar proyecto
              </button>
            </div>
          </div>
        </div>
      </div>
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
        importedData={importedPieces.length > 0 ? {
          pieces: importedPieces,
          projectName: importedProjectName
        } : undefined}
        shouldLoadDraft={shouldLoadDraft}
      />
    );
  }

  return null;
};

export default CostCalculatorWrapper;
