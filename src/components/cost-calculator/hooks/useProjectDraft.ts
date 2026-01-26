import { useCallback, useState, useEffect } from 'react';

const STORAGE_KEY = 'makercycle_project_drafts';

// Define the shape of the project draft
export interface ProjectDraft {
  draftId: string; // Unique identifier for this draft
  projectName: string;
  projectType: 'filament' | 'resin';
  filamentPrice: number;
  printHours: number;
  electricityCost: number;
  printerPower: number;
  vatPercentage: number;
  profitMargin: number;
  selectedPrinterId: string | null;
  materials: Array<{ id: string; name: string; price: number }>;
  postprocessingItems: Array<{
    id: string;
    name: string;
    cost_per_unit: number;
    quantity: number;
    unit: string;
    preset_id?: string | null;
    is_from_preset: boolean;
    description?: string;
    category?: string;
  }>;
  pieces: Array<{
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
  }>;
  isDisasterMode: boolean;
  disasterModeNotes: Array<{
    id: string;
    title: string;
    content: string;
    position: { x: number; y: number };
    color: string;
    size: 'small' | 'medium' | 'large';
  }>;
  savedAt: number; // timestamp
  // Track if this draft is editing an existing project (null for new projects)
  editingProjectId: string | null;
}

// Storage structure for multiple drafts
interface DraftStorage {
  [draftId: string]: ProjectDraft;
}

// Default values for a new project (without draftId and savedAt)
export const DEFAULT_DRAFT_VALUES: Omit<ProjectDraft, 'savedAt' | 'draftId'> = {
  projectName: '',
  projectType: 'filament',
  filamentPrice: 25,
  printHours: 0,
  electricityCost: 0.12,
  printerPower: 0.35,
  vatPercentage: 21,
  profitMargin: 15,
  selectedPrinterId: null,
  materials: [],
  postprocessingItems: [],
  pieces: [{
    id: '1',
    name: 'Pieza principal',
    filamentWeight: 0,
    filamentPrice: 25,
    printHours: 0,
    quantity: 1,
    notes: '',
    materials: []
  }],
  isDisasterMode: false,
  disasterModeNotes: [],
  editingProjectId: null
};

/**
 * Generate a unique draft ID
 */
export function generateDraftId(): string {
  return `draft-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Format a date as relative time (e.g., "hace 5 minutos")
 */
export function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return 'hace unos segundos';
  if (diffMins < 60) return `hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
  if (diffHours < 24) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
  return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
}

/**
 * Check if a draft has meaningful content (not just default values)
 */
export function hasMeaningfulContent(draft: Partial<ProjectDraft>): boolean {
  // Check if project name is set
  if (draft.projectName && draft.projectName.trim().length > 0) return true;

  // Check if pieces have content beyond defaults
  if (draft.pieces && draft.pieces.length > 0) {
    const hasModifiedPiece = draft.pieces.some(piece =>
      piece.name !== 'Pieza principal' ||
      piece.filamentWeight > 0 ||
      piece.printHours > 0 ||
      piece.quantity > 1 ||
      (piece.notes && piece.notes.trim().length > 0) ||
      (piece.materials && piece.materials.length > 0 && piece.materials.some(m => m.weight > 0))
    );
    if (hasModifiedPiece) return true;
  }

  // Check if there are materials or postprocessing items
  if (draft.materials && draft.materials.length > 0) return true;
  if (draft.postprocessingItems && draft.postprocessingItems.length > 0) return true;

  // Check for disaster mode notes
  if (draft.disasterModeNotes && draft.disasterModeNotes.length > 0) return true;

  return false;
}

/**
 * Hook to manage multiple project drafts in localStorage.
 *
 * Features:
 * - Stores multiple drafts indexed by draftId
 * - Auto-saves project state to localStorage on changes
 * - Removes drafts when projects are saved
 * - Auto-expires drafts older than 7 days
 * - Provides list of all pending drafts
 */
export function useProjectDraft() {
  const [drafts, setDrafts] = useState<ProjectDraft[]>([]);

  /**
   * Load all drafts from localStorage
   */
  const loadAllDrafts = useCallback((): DraftStorage => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return {};

      const storage: DraftStorage = JSON.parse(saved);
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

      // Filter out expired drafts
      const validDrafts: DraftStorage = {};
      let hasExpired = false;

      Object.entries(storage).forEach(([id, draft]) => {
        if (draft.savedAt >= sevenDaysAgo) {
          validDrafts[id] = draft;
        } else {
          hasExpired = true;
        }
      });

      // If some drafts expired, update storage
      if (hasExpired) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(validDrafts));
      }

      return validDrafts;
    } catch (error) {
      console.error('Error loading project drafts from localStorage:', error);
      return {};
    }
  }, []);

  /**
   * Refresh the drafts state from localStorage
   */
  const refreshDrafts = useCallback(() => {
    const allDrafts = loadAllDrafts();
    const draftList = Object.values(allDrafts)
      .filter(draft => hasMeaningfulContent(draft))
      .sort((a, b) => b.savedAt - a.savedAt); // Most recent first
    setDrafts(draftList);
  }, [loadAllDrafts]);

  // Load drafts on mount
  useEffect(() => {
    refreshDrafts();
  }, [refreshDrafts]);

  /**
   * Save a draft to localStorage
   */
  const saveDraft = useCallback((draftId: string, draft: Omit<ProjectDraft, 'savedAt' | 'draftId'>) => {
    try {
      // Only save if there's meaningful content
      if (!hasMeaningfulContent(draft)) {
        // If no meaningful content, remove this draft if it exists
        const allDrafts = loadAllDrafts();
        if (allDrafts[draftId]) {
          delete allDrafts[draftId];
          localStorage.setItem(STORAGE_KEY, JSON.stringify(allDrafts));
          refreshDrafts();
        }
        return;
      }

      const allDrafts = loadAllDrafts();
      allDrafts[draftId] = {
        ...draft,
        draftId,
        savedAt: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allDrafts));
      refreshDrafts();
    } catch (error) {
      console.error('Error saving project draft to localStorage:', error);
    }
  }, [loadAllDrafts, refreshDrafts]);

  /**
   * Load a specific draft by ID
   */
  const loadDraft = useCallback((draftId: string): ProjectDraft | null => {
    const allDrafts = loadAllDrafts();
    return allDrafts[draftId] || null;
  }, [loadAllDrafts]);

  /**
   * Delete a specific draft by ID
   */
  const deleteDraft = useCallback((draftId: string) => {
    try {
      const allDrafts = loadAllDrafts();
      if (allDrafts[draftId]) {
        delete allDrafts[draftId];
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allDrafts));
        refreshDrafts();
      }
    } catch (error) {
      console.error('Error deleting project draft from localStorage:', error);
    }
  }, [loadAllDrafts, refreshDrafts]);

  /**
   * Delete a draft by editing project ID (when a project is saved)
   */
  const deleteDraftByProjectId = useCallback((projectId: string) => {
    try {
      const allDrafts = loadAllDrafts();
      let modified = false;

      Object.entries(allDrafts).forEach(([draftId, draft]) => {
        if (draft.editingProjectId === projectId) {
          delete allDrafts[draftId];
          modified = true;
        }
      });

      if (modified) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(allDrafts));
        refreshDrafts();
      }
    } catch (error) {
      console.error('Error deleting draft by project ID:', error);
    }
  }, [loadAllDrafts, refreshDrafts]);

  /**
   * Clear all drafts from localStorage
   */
  const clearAllDrafts = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      setDrafts([]);
    } catch (error) {
      console.error('Error clearing project drafts from localStorage:', error);
    }
  }, []);

  /**
   * Check if there are any pending drafts
   */
  const hasDrafts = useCallback((): boolean => {
    return drafts.length > 0;
  }, [drafts]);

  return {
    drafts,
    saveDraft,
    loadDraft,
    deleteDraft,
    deleteDraftByProjectId,
    clearAllDrafts,
    hasDrafts,
    refreshDrafts,
    defaultDraftValues: DEFAULT_DRAFT_VALUES
  };
}

export default useProjectDraft;
