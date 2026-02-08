import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Calculator } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTeam } from '@/components/providers/TeamProvider';
import { toast } from 'react-hot-toast';
import CalculatorSkeleton from '@/components/skeletons/CalculatorSkeleton';
import TeamContextBanner from '@/components/TeamContextBanner';
import ProjectInfo from './forms/ProjectInfo';
import PiecesSection from './forms/PiecesSection';
import ElectricitySection from './forms/ElectricitySection';
import MaterialsSection from './forms/MaterialsSection';
import PricingConfig from './forms/PricingConfig';
import SummaryTabsPanel from './panels/SummaryTabsPanel';
import DisasterModeButton from './DisasterModeButton';
import StickyNote from './StickyNote';
import ConfirmModal from './ConfirmModal';
import { useCostCalculations } from './hooks/useCostCalculations';
import ProjectSavedSummary from './ProjectSavedSummary';
import { usePostprocessingPresets } from '@/hooks/usePostprocessingPresets';
import { usePrinterPresets } from '@/hooks/usePrinterPresets';
import { useProjectDraft, generateDraftId, type ProjectDraft } from './hooks/useProjectDraft';
import type { DatabaseProject, DatabasePiece, PieceMaterial } from '@/types';

// Function to process pieces (solo sistema multi-material)
async function processPieces(
  pieces: (DatabasePiece & { piece_materials?: PieceMaterial[] })[],
  supabase: any
): Promise<DatabasePiece[]> {
  const processedPieces = await Promise.all(
    pieces.map(async (piece) => {
      if (piece.piece_materials && piece.piece_materials.length > 0) {
        return {
          ...piece,
          materials: piece.piece_materials
        };
      }
      return {
        ...piece,
        materials: []
      };
    })
  );
  return processedPieces;
}

interface CostCalculatorProps {
  loadedProject?: DatabaseProject & { pieces?: DatabasePiece[] };
  onProjectSaved?: (project: DatabaseProject) => void;
  onNavigateToSettings?: () => void;
  onEditingComplete?: () => void;
  importedData?: {
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
    projectName: string;
  };
  loadedDraft?: ProjectDraft | null;
}

const CostCalculator: React.FC<CostCalculatorProps> = ({
  loadedProject,
  onProjectSaved,
  onNavigateToSettings,
  onEditingComplete,
  importedData,
  loadedDraft
}) => {
  const { user } = useAuth();
  const { getEffectiveTeam } = useTeam();
  const { presets: postprocessingPresets } = usePostprocessingPresets();
  const { presets: printerPresets, defaultPreset: defaultPrinter } = usePrinterPresets();
  const { saveDraft, deleteDraft, deleteDraftByProjectId } = useProjectDraft();

  const [isSaving, setIsSaving] = useState(false);
  const [savedProject, setSavedProject] = useState<DatabaseProject & { pieces?: DatabasePiece[] } | null>(null);
  const supabase = createClient();
  const [loading, setLoading] = useState(true);

  // Current draft ID - generated when creating new project or set when editing/loading draft
  const [currentDraftId, setCurrentDraftId] = useState<string | null>(null);

  // Form state
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState<'filament' | 'resin'>('filament');
  const [filamentPrice, setFilamentPrice] = useState(25);
  const [printHours, setPrintHours] = useState(0);
  const [electricityCost, setElectricityCost] = useState(0.12);
  const [printerPower, setPrinterPower] = useState(0.35);
  const [vatPercentage, setVatPercentage] = useState(21);
  const [profitMargin, setProfitMargin] = useState(15);
  const [selectedPrinterId, setSelectedPrinterId] = useState<string | null>(null);
  const [materials, setMaterials] = useState<Array<{ id: string; name: string; price: number }>>([]);
  const [postprocessingItems, setPostprocessingItems] = useState<Array<{
    id: string;
    name: string;
    cost_per_unit: number;
    quantity: number;
    unit: string;
    preset_id?: string | null;
    is_from_preset: boolean;
    description?: string;
    category?: string;
  }>>([]);
  const [pieces, setPieces] = useState<Array<{
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
  }>>([{
    id: '1',
    name: 'Pieza principal',
    filamentWeight: 0,
    filamentPrice: 25,
    printHours: 0,
    quantity: 1,
    notes: '',
    materials: []
  }]);
  const [isDisasterMode, setIsDisasterMode] = useState(false);
  const [disasterModeNotes, setDisasterModeNotes] = useState<Array<{
    id: string;
    title: string;
    content: string;
    position: { x: number; y: number };
    color: string;
    size: 'small' | 'medium' | 'large';
  }>>([]);
  const [nextNoteId, setNextNoteId] = useState(1);
  const [showClearModal, setShowClearModal] = useState(false);

  // Ref to track if initial setup is complete
  const initializedRef = useRef(false);

  // Track editing project ID (from loadedProject or loaded draft)
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // Derive if editing existing project
  const isEditingExistingProject = !!(loadedProject || editingProjectId);

  // Initialize component - set up draft ID and load data
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;

    if (loadedProject) {
      // Editing existing project - use project ID as draft ID prefix
      const draftId = `edit-${loadedProject.id}`;
      setCurrentDraftId(draftId);
      setEditingProjectId(loadedProject.id);
      loadProjectData(loadedProject);
    } else if (loadedDraft) {
      // Loading from a draft passed from ModeSelection
      setCurrentDraftId(loadedDraft.draftId);
      setEditingProjectId(loadedDraft.editingProjectId || null);

      // Restore all state from the draft
      setProjectName(loadedDraft.projectName);
      setProjectType(loadedDraft.projectType);
      setFilamentPrice(loadedDraft.filamentPrice);
      setPrintHours(loadedDraft.printHours);
      setElectricityCost(loadedDraft.electricityCost);
      setPrinterPower(loadedDraft.printerPower);
      setVatPercentage(loadedDraft.vatPercentage);
      setProfitMargin(loadedDraft.profitMargin);
      setSelectedPrinterId(loadedDraft.selectedPrinterId);
      setMaterials(loadedDraft.materials);
      setPostprocessingItems(loadedDraft.postprocessingItems);
      setPieces(loadedDraft.pieces);
      setIsDisasterMode(loadedDraft.isDisasterMode);
      setDisasterModeNotes(loadedDraft.disasterModeNotes);

      if (loadedDraft.disasterModeNotes.length > 0) {
        const maxId = loadedDraft.disasterModeNotes.reduce((max, note) => {
          const match = note.id.match(/disaster-note-(\d+)/);
          return match ? Math.max(max, parseInt(match[1], 10)) : max;
        }, 0);
        setNextNoteId(maxId + 1);
      }
    } else if (importedData) {
      // Imported data - generate new draft ID
      const draftId = generateDraftId();
      setCurrentDraftId(draftId);
      setProjectName(importedData.projectName);
      setPieces(importedData.pieces);
      if (importedData.pieces.length > 0) {
        const avgFilamentPrice = importedData.pieces.reduce((sum, piece) => sum + piece.filamentPrice, 0) / importedData.pieces.length;
        setFilamentPrice(avgFilamentPrice);
      }
    } else {
      // New project - generate new draft ID
      const draftId = generateDraftId();
      setCurrentDraftId(draftId);
    }

    setLoading(false);
  }, [loadedProject, importedData, loadedDraft]);

  // Load project data from loadedProject
  const loadProjectData = (project: DatabaseProject & { pieces?: DatabasePiece[] }) => {
    setProjectName(project.name);
    setProjectType(project.project_type || 'filament');
    setFilamentPrice(project.filament_price);
    setPrintHours(project.print_hours);
    setElectricityCost(project.electricity_cost);
    setVatPercentage(project.vat_percentage);
    setProfitMargin(project.profit_margin);
    setMaterials(project.materials || []);

    // Parse postprocessing_items - handle JSONB that might be a string, null, or array
    let parsedPostprocessingItems: any[] = [];
    
    // Handle different possible formats from Supabase JSONB
    const rawItems = project.postprocessing_items;
    
    if (rawItems !== null && rawItems !== undefined) {
      // If it's already an array, use it directly
      if (Array.isArray(rawItems)) {
        parsedPostprocessingItems = rawItems;
      } 
      // If it's a string, try to parse it as JSON
      else if (typeof rawItems === 'string') {
        try {
          const parsed = JSON.parse(rawItems);
          if (Array.isArray(parsed)) {
            parsedPostprocessingItems = parsed;
          } else if (parsed && typeof parsed === 'object') {
            // Sometimes Supabase returns a single object instead of array
            parsedPostprocessingItems = [parsed];
          }
        } catch (e) {
          console.error('Error parsing postprocessing_items:', e, 'Raw value:', rawItems);
        }
      }
      // If it's an object (not array), wrap it in an array
      else if (typeof rawItems === 'object' && !Array.isArray(rawItems)) {
        parsedPostprocessingItems = [rawItems];
      }
    }
    
    // Always set the items, even if empty - this ensures the state is properly initialized
    if (parsedPostprocessingItems.length > 0) {
      setPostprocessingItems(parsedPostprocessingItems);
    } else if (project.materials && project.materials.length > 0) {
      const migratedItems = project.materials.map((m: any) => ({
        id: m.id || `migrated-${Date.now()}-${Math.random()}`,
        name: m.name,
        cost_per_unit: m.price,
        quantity: 1,
        unit: 'unidad',
        preset_id: null,
        is_from_preset: false
      }));
      setPostprocessingItems(migratedItems);
    } else {
      setPostprocessingItems([]);
    }

    setPrinterPower(0.35);

    if (project.pieces && project.pieces.length > 0) {
      const mappedPieces = project.pieces.map(piece => {
        let materials: Array<{
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
        }> = [];

        if (piece.materials && piece.materials.length > 0) {
          materials = piece.materials.filter(material => material.weight > 0).map(material => ({
            id: material.id,
            materialName: material.material_name || 'Material sin nombre',
            materialType: material.material_type || 'PLA',
            weight: material.weight,
            pricePerKg: material.price_per_kg || 25,
            unit: material.unit || 'g',
            category: material.category || 'filament',
            color: material.color || '#808080',
            brand: material.brand || '',
            notes: material.notes || ''
          }));
        } else if (piece.filament_weight > 0 && piece.filament_price > 0) {
          materials = [{
            id: `legacy-${piece.id}-${Date.now()}`,
            materialName: 'Filamento Principal',
            materialType: 'PLA',
            weight: piece.filament_weight,
            pricePerKg: piece.filament_price,
            unit: 'g',
            category: 'filament' as const,
            color: '#808080',
            brand: 'Sistema Legacy',
            notes: 'Migrado automáticamente desde el sistema anterior'
          }];
        }

        return {
          id: piece.id,
          name: piece.name,
          filamentWeight: piece.filament_weight,
          filamentPrice: piece.filament_price,
          printHours: piece.print_hours,
          quantity: piece.quantity,
          notes: piece.notes || '',
          materials: materials
        };
      });
      setPieces(mappedPieces);
    }
  };

  // Auto-save draft when state changes
  useEffect(() => {
    if (!currentDraftId || loading) return;

    saveDraft(currentDraftId, {
      projectName,
      projectType,
      filamentPrice,
      printHours,
      electricityCost,
      printerPower,
      vatPercentage,
      profitMargin,
      selectedPrinterId,
      materials,
      postprocessingItems,
      pieces,
      isDisasterMode,
      disasterModeNotes,
      editingProjectId: loadedProject?.id || editingProjectId || null
    });
  }, [
    currentDraftId,
    projectName,
    projectType,
    filamentPrice,
    printHours,
    electricityCost,
    printerPower,
    vatPercentage,
    profitMargin,
    selectedPrinterId,
    materials,
    postprocessingItems,
    pieces,
    isDisasterMode,
    disasterModeNotes,
    loadedProject?.id,
    editingProjectId,
    loading,
    saveDraft
  ]);

  // Set default printer when loaded
  useEffect(() => {
    if (defaultPrinter && !selectedPrinterId && !loadedProject) {
      setSelectedPrinterId(defaultPrinter.id);
      setPrinterPower(defaultPrinter.power_consumption);
    }
  }, [defaultPrinter, selectedPrinterId, loadedProject]);

  const calculateTotalFilamentWeight = () => {
    return pieces.reduce((sum, piece) => {
      if (piece.materials && piece.materials.length > 0) {
        const pieceWeight = piece.materials.reduce((materialSum, material) => {
          const weightInGrams = material.unit === 'kg' ? material.weight * 1000 : material.weight;
          return materialSum + weightInGrams;
        }, 0);
        return sum + (pieceWeight * piece.quantity);
      } else {
        return sum + (piece.filamentWeight * piece.quantity);
      }
    }, 0);
  };

  const {
    totalFilamentWeight,
    totalPrintHours,
    totalFilamentCost,
    totalElectricityCost,
    costs,
    salePrice
  } = useCostCalculations({
    pieces,
    filamentWeight: calculateTotalFilamentWeight(),
    filamentPrice,
    printHours,
    electricityCost,
    printerPower,
    materials,
    postprocessingItems,
    vatPercentage,
    profitMargin
  });

  // Material handlers
  const addMaterial = () => {
    setMaterials([...materials, {
      id: Date.now().toString(),
      name: '',
      price: 0
    }]);
  };

  const updateMaterial = (id: string, field: 'name' | 'price', value: string | number) => {
    setMaterials(materials.map(material =>
      material.id === id ? { ...material, [field]: value } : material
    ));
  };

  const removeMaterial = (id: string) => {
    setMaterials(materials.filter(material => material.id !== id));
  };

  // Postprocessing handlers
  const addPostprocessingItem = () => {
    setPostprocessingItems([...postprocessingItems, {
      id: Date.now().toString(),
      name: '',
      cost_per_unit: 0,
      quantity: 1,
      unit: 'unidad',
      preset_id: null,
      is_from_preset: false
    }]);
  };

  const updatePostprocessingItem = (id: string, field: 'name' | 'cost_per_unit' | 'quantity' | 'unit' | 'description' | 'category', value: string | number) => {
    setPostprocessingItems(postprocessingItems.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const removePostprocessingItem = (id: string) => {
    setPostprocessingItems(postprocessingItems.filter(item => item.id !== id));
  };

  const loadPostprocessingPreset = (presetId: string) => {
    const preset = postprocessingPresets.find(p => p.id === presetId);
    if (preset) {
      setPostprocessingItems([...postprocessingItems, {
        id: Date.now().toString(),
        name: preset.name,
        cost_per_unit: preset.cost_per_unit,
        quantity: 1,
        unit: preset.unit,
        preset_id: preset.id,
        is_from_preset: true,
        description: preset.description || undefined,
        category: preset.category || undefined
      }]);
      toast.success(`Preset "${preset.name}" cargado`);
    }
  };

  const savePostprocessingItemAsPreset = async (item: typeof postprocessingItems[0]) => {
    if (!user) {
      toast.error('Debes iniciar sesión para guardar presets');
      return;
    }
    toast.success('Funcionalidad de guardar preset próximamente');
  };

  // Piece handlers
  const addPiece = useCallback(() => {
    const newPiece = {
      id: Date.now().toString(),
      name: `Pieza ${pieces.length + 1}`,
      filamentWeight: 0,
      filamentPrice: filamentPrice,
      printHours: 0,
      quantity: 1,
      notes: '',
      materials: []
    };
    setPieces(prevPieces => [...prevPieces, newPiece]);
  }, [pieces.length, filamentPrice]);

  const updatePiece = useCallback((id: string, field: keyof typeof pieces[0], value: string | number) => {
    setPieces(prevPieces => prevPieces.map(piece =>
      piece.id === id ? { ...piece, [field]: value } : piece
    ));
  }, []);

  const removePiece = useCallback((id: string) => {
    if (pieces.length > 1) {
      setPieces(prevPieces => prevPieces.filter(piece => piece.id !== id));
    }
  }, [pieces.length]);

  const duplicatePiece = useCallback((id: string) => {
    const pieceToDuplicate = pieces.find(piece => piece.id === id);
    if (pieceToDuplicate) {
      const newPiece = {
        ...pieceToDuplicate,
        id: Date.now().toString(),
        name: `${pieceToDuplicate.name} (copia)`,
        materials: pieceToDuplicate.materials?.map(material => ({
          ...material,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
        })) || []
      };
      setPieces(prevPieces => [...prevPieces, newPiece]);
    }
  }, [pieces]);

  // Piece material handlers
  const addMaterialToPiece = useCallback((pieceId: string) => {
    const defaultUnit = projectType === 'resin' ? 'ml' : 'g';
    const defaultCategory = projectType;
    const defaultMaterialType = projectType === 'resin' ? 'Resina' : 'PLA';

    const newMaterial = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      materialName: 'Nuevo material',
      materialType: defaultMaterialType,
      weight: 1,
      pricePerKg: 25,
      unit: defaultUnit,
      category: defaultCategory as 'filament' | 'resin',
      color: '#808080',
      brand: '',
      notes: ''
    };

    setPieces(prevPieces => prevPieces.map(piece =>
      piece.id === pieceId
        ? {
            ...piece,
            materials: [...(piece.materials || []), newMaterial]
          }
        : piece
    ));
  }, [projectType]);

  const updatePieceMaterial = useCallback((pieceId: string, materialId: string, field: string, value: string | number) => {
    setPieces(prevPieces => prevPieces.map(piece =>
      piece.id === pieceId
        ? {
            ...piece,
            materials: piece.materials?.map(material =>
              material.id === materialId
                ? { ...material, [field]: value }
                : material
            ) || []
          }
        : piece
    ));
  }, []);

  const removePieceMaterial = useCallback((pieceId: string, materialId: string) => {
    setPieces(prevPieces => prevPieces.map(piece =>
      piece.id === pieceId
        ? {
            ...piece,
            materials: piece.materials?.filter(material => material.id !== materialId) || []
          }
        : piece
    ));
  }, []);

  // Reset form to defaults
  const resetForm = () => {
    if (isSaving) return;

    // Delete the current draft
    if (currentDraftId) {
      deleteDraft(currentDraftId);
    }

    // Generate new draft ID
    const newDraftId = generateDraftId();
    setCurrentDraftId(newDraftId);
    setEditingProjectId(null);

    // Reset all state to defaults
    setProjectName('');
    setProjectType('filament');
    setFilamentPrice(25);
    setPrintHours(0);
    setElectricityCost(0.12);
    setVatPercentage(21);
    setProfitMargin(15);
    setMaterials([]);
    setPostprocessingItems([]);
    setPieces([{
      id: '1',
      name: 'Pieza principal',
      filamentWeight: 0,
      filamentPrice: 25,
      printHours: 0,
      quantity: 1,
      notes: '',
      materials: []
    }]);
    setIsDisasterMode(false);
    setDisasterModeNotes([]);
  };

  const handleEditProject = async () => {
    if (savedProject) {
      try {
        // Reload the complete project from database to ensure we have all fields including postprocessing_items
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('*')
          .eq('id', savedProject.id)
          .single();

        if (projectError) {
          console.error('Error fetching project:', projectError);
          toast.error('No se pudo cargar el proyecto. Intenta de nuevo.');
          return;
        }

        // Fetch pieces for the project with their materials
        const { data: pieces, error: piecesError } = await supabase
          .from('pieces')
          .select(`
            *,
            piece_materials (*)
          `)
          .eq('project_id', savedProject.id);

        if (piecesError) {
          console.error('Error fetching pieces:', piecesError);
          toast.error('No se pudieron cargar las piezas del proyecto. Intenta de nuevo.');
          return;
        }

        const processedPieces = await processPieces(pieces || [], supabase);

        const projectWithPieces = {
          ...projectData,
          pieces: processedPieces
        };

        setSavedProject(null);
        onProjectSaved?.(projectWithPieces);
      } catch (error) {
        console.error('Error loading project for editing:', error);
        toast.error('No se pudo cargar el proyecto para editar. Intenta de nuevo.');
      }
    } else {
      setSavedProject(null);
    }
  };

  const handleNewProject = () => {
    setSavedProject(null);

    if (isEditingExistingProject) {
      onEditingComplete?.();
    }

    // Delete the current draft since the project was saved
    if (currentDraftId) {
      deleteDraft(currentDraftId);
    }

    // Generate new draft ID and reset form
    const newDraftId = generateDraftId();
    setCurrentDraftId(newDraftId);
    setEditingProjectId(null);

    setProjectName('');
    setProjectType('filament');
    setFilamentPrice(25);
    setPrintHours(0);
    setElectricityCost(0.12);
    setVatPercentage(21);
    setProfitMargin(15);
    setMaterials([]);
    setPostprocessingItems([]);
    setPieces([{
      id: '1',
      name: 'Pieza principal',
      filamentWeight: 0,
      filamentPrice: 25,
      printHours: 0,
      quantity: 1,
      notes: '',
      materials: []
    }]);
    setIsDisasterMode(false);
    setDisasterModeNotes([]);
  };

  // Disaster mode handlers
  const colors = ['yellow', 'pink', 'blue', 'green', 'purple', 'orange'];

  const addDisasterNote = () => {
    const newNote = {
      id: `disaster-note-${nextNoteId}`,
      title: '',
      content: '',
      position: {
        x: Math.random() * (window.innerWidth - 200) + 50,
        y: Math.random() * (window.innerHeight - 250) + 50
      },
      color: colors[Math.floor(Math.random() * colors.length)],
      size: 'medium' as const
    };

    setDisasterModeNotes(prev => [...prev, newNote]);
    setNextNoteId(prev => prev + 1);
  };

  const updateDisasterNote = (id: string, field: 'title' | 'content', value: string) => {
    setDisasterModeNotes(prev => prev.map(note =>
      note.id === id ? { ...note, [field]: value } : note
    ));
  };

  const deleteDisasterNote = (id: string) => {
    setDisasterModeNotes(prev => prev.filter(note => note.id !== id));
  };

  const moveDisasterNote = (id: string, position: { x: number; y: number }) => {
    setDisasterModeNotes(prev => prev.map(note =>
      note.id === id ? { ...note, position } : note
    ));
  };

  const changeDisasterNoteColor = (id: string) => {
    setDisasterModeNotes(prev => prev.map(note =>
      note.id === id
        ? { ...note, color: colors[(colors.indexOf(note.color) + 1) % colors.length] }
        : note
    ));
  };

  const changeDisasterNoteSize = (id: string) => {
    setDisasterModeNotes(prev => prev.map(note =>
      note.id === id
        ? { ...note, size: note.size === 'small' ? 'medium' : note.size === 'medium' ? 'large' : 'small' }
        : note
    ));
  };

  const clearAllDisasterNotes = () => {
    if (disasterModeNotes.length > 0) {
      setShowClearModal(true);
    }
  };

  const handleConfirmClear = () => {
    setDisasterModeNotes([]);
    setShowClearModal(false);
  };

  // Save project
  const saveProject = async () => {
    if (isSaving) return;

    if (!user) {
      toast.error('Debes iniciar sesión para guardar proyectos.');
      return;
    }

    if (!projectName.trim()) {
      toast.error('El proyecto debe tener un nombre.');
      return;
    }

    setIsSaving(true);

    try {
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            email: user.email,
            full_name: user.user_metadata?.full_name || user.email,
          }]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
          toast.error('No se pudo crear el perfil de usuario. Intenta de nuevo.');
          setIsSaving(false);
          return;
        }
      }

      // Ensure postprocessing_items is always an array (never null) for consistency
      const postprocessingItemsToSave = postprocessingItems.length > 0 ? postprocessingItems : [];
      
      const project = {
        user_id: user.id,
        name: projectName,
        project_type: projectType,
        filament_weight: totalFilamentWeight,
        filament_price: filamentPrice,
        print_hours: totalPrintHours,
        electricity_cost: electricityCost,
        materials,
        postprocessing_items: postprocessingItemsToSave, // Always save as array, never null
        total_cost: costs.total,
        vat_percentage: vatPercentage,
        profit_margin: profitMargin,
        recommended_price: salePrice.recommendedPrice,
        status: 'calculated',
        team_id: getEffectiveTeam()?.id || null,
      };

      const existingProjectId = loadedProject?.id || editingProjectId;
      let projectId = existingProjectId;
      let projectData;
      let projectError;

      if (existingProjectId) {
        const { data, error } = await supabase
          .from('projects')
          .update(project)
          .eq('id', existingProjectId)
          .select()
          .single();
        projectData = data;
        projectError = error;
        projectId = existingProjectId;
      } else {
        const { data, error } = await supabase
          .from('projects')
          .insert([project])
          .select()
          .single();
        projectData = data;
        projectError = error;
        projectId = data?.id;
      }

      if (projectError) {
        toast.error('No se pudo guardar el proyecto. Intenta de nuevo.');
        setIsSaving(false);
        return;
      }

      if (projectId) {
        await supabase.from('piece_materials').delete().in('piece_id',
          (await supabase.from('pieces').select('id').eq('project_id', projectId)).data?.map((p: { id: string }) => p.id) || []
        );
        await supabase.from('pieces').delete().eq('project_id', projectId);

        const piecesToSave = pieces.map(piece => ({
          project_id: projectId,
          name: piece.name,
          filament_weight: (piece.materials && piece.materials.length > 0) ? 0 : piece.filamentWeight,
          filament_price: (piece.materials && piece.materials.length > 0) ? 0 : piece.filamentPrice,
          print_hours: piece.printHours,
          quantity: piece.quantity,
          notes: piece.notes || ''
        }));

        if (piecesToSave.length > 0) {
          const { data: savedPieces, error: piecesError } = await supabase
            .from('pieces')
            .insert(piecesToSave)
            .select();

          if (piecesError) {
            console.error('Error saving pieces:', piecesError);
            toast.error('El proyecto se guardó, pero hubo un error al guardar las piezas.');
          } else if (savedPieces) {
            const materialsToSave = [];
            for (let i = 0; i < pieces.length; i++) {
              const piece = pieces[i];
              const savedPiece = savedPieces[i];

              if (piece.materials && piece.materials.length > 0) {
                for (const material of piece.materials) {
                  if (material.weight > 0) {
                    materialsToSave.push({
                      piece_id: savedPiece.id,
                      material_name: material.materialName,
                      material_type: material.materialType,
                      weight: material.weight,
                      price_per_kg: material.pricePerKg,
                      unit: material.unit,
                      category: material.category,
                      color: material.color || '#808080',
                      brand: material.brand || '',
                      notes: material.notes || ''
                    });
                  }
                }
              }
            }

            if (materialsToSave.length > 0) {
              const { error: materialsError } = await supabase
                .from('piece_materials')
                .insert(materialsToSave);

              if (materialsError) {
                console.error('Error saving piece materials:', materialsError);
                toast.error('El proyecto se guardó, pero hubo un error al guardar los materiales de las piezas.');
              }
            }
          }
        }
      }

      if (projectData) {
        // Delete the draft since project is now saved
        if (currentDraftId) {
          deleteDraft(currentDraftId);
          setCurrentDraftId(null); // Prevent auto-save from re-creating the draft
        }
        // Also delete any drafts that were editing this project
        if (projectId) {
          deleteDraftByProjectId(projectId);
        }

        try {
          const { data: fetchedPieces, error: piecesError } = await supabase
            .from('pieces')
            .select(`
              *,
              piece_materials (*)
            `)
            .eq('project_id', projectId);

          if (piecesError) {
            console.error('Error fetching pieces after save:', piecesError);
          }

          const processedPieces = fetchedPieces ? await processPieces(fetchedPieces, supabase) : [];

          const projectWithPieces = {
            ...projectData,
            pieces: processedPieces
          };

          setSavedProject(projectWithPieces);

          setTimeout(() => {
            onProjectSaved?.(projectWithPieces);
          }, 0);
        } catch (error) {
          console.error('Error loading project data for summary:', error);
          const basicProject = {
            ...projectData,
            pieces: (pieces || []).map((piece: any) => ({
              id: piece.id,
              name: piece.name,
              filament_weight: (piece.materials && piece.materials.length > 0) ? 0 : (piece.filament_weight || 0),
              filament_price: (piece.materials && piece.materials.length > 0) ? 0 : (piece.filament_price || 0),
              print_hours: piece.print_hours || 0,
              quantity: piece.quantity || 1,
              notes: piece.notes || '',
              created_at: piece.created_at || new Date().toISOString(),
              updated_at: piece.updated_at || new Date().toISOString(),
              project_id: projectId || '',
              materials: piece.materials || []
            }))
          };
          setSavedProject(basicProject);

          setTimeout(() => {
            onProjectSaved?.(basicProject);
          }, 0);
        }
      }
    } catch (error: any) {
      toast.error(error.message || 'Ha ocurrido un error al guardar el proyecto.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <CalculatorSkeleton />;
  }

  if (savedProject) {
    return (
      <ProjectSavedSummary
        project={savedProject}
        onEdit={handleEditProject}
        onNewProject={handleNewProject}
        isEditing={isEditingExistingProject}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <TeamContextBanner />

      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
          <Calculator className="w-8 h-8 text-slate-600" />
        </div>
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Calculadora de Costes 3D</h1>
        <p className="text-slate-600">Calcula el coste total de tus proyectos de impresión 3D</p>
      </div>

      {/* Layout principal */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Columna izquierda: Formularios */}
        <div className="lg:col-span-2 space-y-6">
          <ProjectInfo
            projectName={projectName}
            projectType={projectType}
            onProjectNameChange={setProjectName}
            onProjectTypeChange={setProjectType}
            onReset={resetForm}
            onSave={saveProject}
            isSaving={isSaving}
          />
          {!loadedProject && (
            <div className="mt-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Contexto actual</label>
              <div className="text-sm text-slate-600 p-2 bg-slate-50 rounded-lg">
                {getEffectiveTeam() ? `Equipo: ${getEffectiveTeam()?.name}` : 'Vista Personal'}
              </div>
            </div>
          )}
          <PiecesSection
            pieces={pieces}
            projectType={projectType}
            onAddPiece={addPiece}
            onUpdatePiece={updatePiece}
            onRemovePiece={removePiece}
            onDuplicatePiece={duplicatePiece}
            onNavigateToSettings={onNavigateToSettings}
            onAddMaterialToPiece={addMaterialToPiece}
            onUpdatePieceMaterial={updatePieceMaterial}
            onRemovePieceMaterial={removePieceMaterial}
          />

          <ElectricitySection
            printHours={totalPrintHours}
            electricityCost={electricityCost}
            printerPower={printerPower}
            onElectricityCostChange={setElectricityCost}
            onPrinterPowerChange={setPrinterPower}
            selectedPrinterId={selectedPrinterId}
            onPrinterSelect={setSelectedPrinterId}
            printerPresets={printerPresets}
            onNavigateToSettings={onNavigateToSettings}
          />

          <PricingConfig
            vatPercentage={vatPercentage}
            profitMargin={profitMargin}
            onVatChange={setVatPercentage}
            onMarginChange={setProfitMargin}
          />

          <MaterialsSection
            materials={materials}
            onAddMaterial={addMaterial}
            onUpdateMaterial={updateMaterial}
            onRemoveMaterial={removeMaterial}
            postprocessingItems={postprocessingItems}
            onAddPostprocessingItem={addPostprocessingItem}
            onUpdatePostprocessingItem={updatePostprocessingItem}
            onRemovePostprocessingItem={removePostprocessingItem}
            onLoadPreset={loadPostprocessingPreset}
            onNavigateToSettings={onNavigateToSettings}
            onSaveAsPreset={savePostprocessingItemAsPreset}
          />
        </div>

        {/* Columna derecha: Resultados */}
        <SummaryTabsPanel
          pieces={pieces}
          totalFilamentWeight={totalFilamentWeight}
          totalPrintHours={totalPrintHours}
          totalFilamentCost={totalFilamentCost}
          totalElectricityCost={totalElectricityCost}
          totalPostprocessingCost={postprocessingItems.reduce((sum, item) => sum + (item.cost_per_unit * (item.quantity || 1)), 0)}
          projectType={projectType}
          costs={costs}
          salePrice={salePrice}
          vatPercentage={vatPercentage}
          profitMargin={profitMargin}
        />
      </div>

      {/* Disaster mode button */}
      <DisasterModeButton
        isActive={isDisasterMode}
        onToggle={() => setIsDisasterMode(!isDisasterMode)}
        onAddNote={addDisasterNote}
        onClearAll={clearAllDisasterNotes}
        noteCount={disasterModeNotes.length}
      />

      {/* Disaster mode notes */}
      {isDisasterMode && disasterModeNotes.map(note => (
        <StickyNote
          key={note.id}
          id={note.id}
          title={note.title}
          content={note.content}
          position={note.position}
          color={note.color}
          size={note.size}
          onUpdate={updateDisasterNote}
          onDelete={deleteDisasterNote}
          onMove={moveDisasterNote}
          onChangeColor={changeDisasterNoteColor}
          onChangeSize={changeDisasterNoteSize}
        />
      ))}

      {/* Clear notes confirmation modal */}
      <ConfirmModal
        isOpen={showClearModal}
        onClose={() => setShowClearModal(false)}
        onConfirm={handleConfirmClear}
        title="Limpiar todas las notas"
        message={`¿Estás seguro de que quieres eliminar las ${disasterModeNotes.length} notas? Esta acción no se puede deshacer.`}
        confirmText="Eliminar todas"
        cancelText="Cancelar"
        type="danger"
      />
    </div>
  );
};

export default CostCalculator;
