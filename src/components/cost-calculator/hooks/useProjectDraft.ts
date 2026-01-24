import { useCallback, useEffect, useRef } from 'react';

const STORAGE_KEY = 'makercycle_project_draft';

// Define the shape of the project draft
export interface ProjectDraft {
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
}

// Default values for a new project
const DEFAULT_DRAFT: Omit<ProjectDraft, 'savedAt'> = {
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
  disasterModeNotes: []
};

/**
 * Hook to manage project draft persistence in localStorage.
 * 
 * Features:
 * - Saves project state to localStorage on every change
 * - Restores saved state when the component mounts
 * - Clears localStorage when the project is saved successfully
 * - Only persists if there's actual content (not empty project)
 */
export function useProjectDraft() {
  const isInitializedRef = useRef(false);

  /**
   * Check if a draft has meaningful content (not just default values)
   */
  const hasMeaningfulContent = useCallback((draft: Partial<ProjectDraft>): boolean => {
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
  }, []);

  /**
   * Save the current project state to localStorage
   */
  const saveDraft = useCallback((draft: Omit<ProjectDraft, 'savedAt'>) => {
    try {
      // Only save if there's meaningful content
      if (!hasMeaningfulContent(draft)) {
        // If no meaningful content, clear any existing draft
        localStorage.removeItem(STORAGE_KEY);
        return;
      }

      const draftWithTimestamp: ProjectDraft = {
        ...draft,
        savedAt: Date.now()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(draftWithTimestamp));
    } catch (error) {
      console.error('Error saving project draft to localStorage:', error);
    }
  }, [hasMeaningfulContent]);

  /**
   * Load the saved draft from localStorage
   * Returns null if no draft exists or if it's expired (older than 7 days)
   */
  const loadDraft = useCallback((): ProjectDraft | null => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) return null;

      const draft: ProjectDraft = JSON.parse(saved);
      
      // Check if draft is older than 7 days
      const sevenDaysAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
      if (draft.savedAt < sevenDaysAgo) {
        localStorage.removeItem(STORAGE_KEY);
        return null;
      }

      return draft;
    } catch (error) {
      console.error('Error loading project draft from localStorage:', error);
      return null;
    }
  }, []);

  /**
   * Clear the saved draft from localStorage
   * Call this when the project is successfully saved
   */
  const clearDraft = useCallback(() => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing project draft from localStorage:', error);
    }
  }, []);

  /**
   * Check if there's a saved draft available
   */
  const hasDraft = useCallback((): boolean => {
    const draft = loadDraft();
    return draft !== null && hasMeaningfulContent(draft);
  }, [loadDraft, hasMeaningfulContent]);

  /**
   * Get the timestamp of when the draft was last saved
   */
  const getDraftTimestamp = useCallback((): Date | null => {
    const draft = loadDraft();
    return draft ? new Date(draft.savedAt) : null;
  }, [loadDraft]);

  return {
    saveDraft,
    loadDraft,
    clearDraft,
    hasDraft,
    getDraftTimestamp,
    defaultDraft: DEFAULT_DRAFT
  };
}

export default useProjectDraft;
