import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Calculator, Zap } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import { useTeam } from '@/components/providers/TeamProvider';
import { toast } from 'react-hot-toast';
import CalculatorSkeleton from '@/components/skeletons/CalculatorSkeleton';
import TeamContextBanner from '@/components/TeamContextBanner';
import ProjectInfo from './forms/ProjectInfo';
import FilamentSection from './forms/FilamentSection';
import PiecesSection from './forms/PiecesSection';
import ElectricitySection from './forms/ElectricitySection';
import MaterialsSection from './forms/MaterialsSection';
import PricingConfig from './forms/PricingConfig';
import ProjectSummaryPanel from './panels/ProjectSummaryPanel';
import CostBreakdownPanel from './panels/CostBreakdownPanel';
import SalePricePanel from './panels/SalePricePanel';
import StickyNotesManager from './StickyNotesManager';
import DisasterModeButton from './DisasterModeButton';
import StickyNote from './StickyNote';
import ConfirmModal from './ConfirmModal';
import { useCostCalculations } from './hooks/useCostCalculations';
import ProjectSavedSummary from './ProjectSavedSummary';
import { usePostprocessingPresets } from '@/hooks/usePostprocessingPresets';
import { usePrinterPresets } from '@/hooks/usePrinterPresets';
import { useProjectDraft } from './hooks/useProjectDraft';
import type { DatabaseProject, DatabasePiece, PieceMaterial } from '@/types';

// Function to process pieces (solo sistema multi-material)
async function processPieces(
  pieces: (DatabasePiece & { piece_materials?: PieceMaterial[] })[], 
  supabase: any
): Promise<DatabasePiece[]> {
  const processedPieces = await Promise.all(
    pieces.map(async (piece) => {
      // Solo usar materiales del sistema multi-material
      if (piece.piece_materials && piece.piece_materials.length > 0) {
        return {
          ...piece,
          materials: piece.piece_materials
        };
      }
      
      // Si no tiene materiales, devolver la pieza sin materiales
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
  // Indica si se debe cargar el borrador del localStorage
  shouldLoadDraft?: boolean;
}

const CostCalculator: React.FC<CostCalculatorProps> = ({ loadedProject, onProjectSaved, onNavigateToSettings, importedData, shouldLoadDraft = true }: CostCalculatorProps) => {
  const { user } = useAuth();
  const { getEffectiveTeam } = useTeam();
  const { presets: postprocessingPresets } = usePostprocessingPresets();
  const { presets: printerPresets, defaultPreset: defaultPrinter } = usePrinterPresets();
  const { saveDraft, loadDraft, clearDraft, defaultDraft } = useProjectDraft();
  const [isSaving, setIsSaving] = useState(false);
  const [savedProject, setSavedProject] = useState<DatabaseProject & { pieces?: DatabasePiece[] } | null>(null);
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('');
  const [projectType, setProjectType] = useState<'filament' | 'resin'>('filament');
  const [filamentPrice, setFilamentPrice] = useState(25);
  const [printHours, setPrintHours] = useState(0);
  const [electricityCost, setElectricityCost] = useState(0.12);
  const [printerPower, setPrinterPower] = useState(0.35);
  const [vatPercentage, setVatPercentage] = useState(21);
  const [profitMargin, setProfitMargin] = useState(15);
  // Estado para impresora seleccionada (solo para consumo eléctrico)
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
    materials: [] // Empezar sin materiales para evitar materiales vacíos
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
  
  // Ref para saber si ya se cargó el borrador inicial
  const draftLoadedRef = useRef(false);
  // Ref para saber si estamos en modo edición de proyecto existente
  const isEditingExistingProject = !!loadedProject;

  // Efecto para cargar el borrador guardado en localStorage
  // Solo se ejecuta si no hay proyecto cargado ni datos importados y shouldLoadDraft es true
  useEffect(() => {
    // Marcar como cargado primero para evitar que el efecto de guardar 
    // sobrescriba el borrador mientras lo estamos restaurando
    if (draftLoadedRef.current) return;
    
    // Si hay proyecto cargado o datos importados, no cargar borrador
    if (loadedProject || importedData) {
      draftLoadedRef.current = true;
      return;
    }
    
    // Si no debemos cargar el borrador (usuario eligió empezar nuevo proyecto)
    if (!shouldLoadDraft) {
      draftLoadedRef.current = true;
      return;
    }
    
    draftLoadedRef.current = true;
    
    const savedDraft = loadDraft();
    if (savedDraft) {
      // Restaurar estado desde el borrador
      setProjectName(savedDraft.projectName);
      setProjectType(savedDraft.projectType);
      setFilamentPrice(savedDraft.filamentPrice);
      setPrintHours(savedDraft.printHours);
      setElectricityCost(savedDraft.electricityCost);
      setPrinterPower(savedDraft.printerPower);
      setVatPercentage(savedDraft.vatPercentage);
      setProfitMargin(savedDraft.profitMargin);
      setSelectedPrinterId(savedDraft.selectedPrinterId);
      setMaterials(savedDraft.materials);
      setPostprocessingItems(savedDraft.postprocessingItems);
      setPieces(savedDraft.pieces);
      setIsDisasterMode(savedDraft.isDisasterMode);
      setDisasterModeNotes(savedDraft.disasterModeNotes);
      
      // Calcular el siguiente ID de nota basado en las notas existentes
      if (savedDraft.disasterModeNotes.length > 0) {
        const maxId = savedDraft.disasterModeNotes.reduce((max, note) => {
          const match = note.id.match(/disaster-note-(\d+)/);
          return match ? Math.max(max, parseInt(match[1], 10)) : max;
        }, 0);
        setNextNoteId(maxId + 1);
      }
    }
  }, [loadedProject, importedData, loadDraft, shouldLoadDraft]);

  // Función auxiliar para calcular tiempo transcurrido
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

  // Efecto para guardar el borrador en localStorage cuando cambie algo
  // Solo para proyectos nuevos, no para edición de proyectos existentes
  useEffect(() => {
    // No guardar borrador si:
    // - Estamos editando un proyecto existente
    // - Aún no hemos terminado de cargar el borrador inicial
    // - Aún estamos cargando el proyecto
    if (isEditingExistingProject || !draftLoadedRef.current || loading) return;
    
    // Guardar el estado actual como borrador
    saveDraft({
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
      disasterModeNotes
    });
  }, [
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
    isEditingExistingProject,
    loading,
    saveDraft
  ]);

  useEffect(() => {
    if (loadedProject) {
      setProjectName(loadedProject.name);
      setProjectType(loadedProject.project_type || 'filament');
      setFilamentPrice(loadedProject.filament_price);
      setPrintHours(loadedProject.print_hours);
      setElectricityCost(loadedProject.electricity_cost);
      setVatPercentage(loadedProject.vat_percentage);
      setProfitMargin(loadedProject.profit_margin);
      setMaterials(loadedProject.materials || []);
      // Cargar postprocessing_items si existen, sino migrar desde materials
      if (loadedProject.postprocessing_items && Array.isArray(loadedProject.postprocessing_items) && loadedProject.postprocessing_items.length > 0) {
        setPostprocessingItems(loadedProject.postprocessing_items);
      } else if (loadedProject.materials && loadedProject.materials.length > 0) {
        // Migrar materials legacy a postprocessing_items
        const migratedItems = loadedProject.materials.map((m: any) => ({
          id: m.id || `migrated-${Date.now()}-${Math.random()}`,
          name: m.name,
          cost_per_unit: m.price, // El price legacy se trata como coste unitario
          quantity: 1,
          unit: 'unidad',
          preset_id: null,
          is_from_preset: false
        }));
        setPostprocessingItems(migratedItems);
      } else {
        setPostprocessingItems([]);
      }
      
      // Para proyectos existentes, usar valor por defecto de potencia
      // La potencia no se guarda en la base de datos, por lo que usamos el valor por defecto
      setPrinterPower(0.35);

      if (loadedProject.pieces && loadedProject.pieces.length > 0) {
        const mappedPieces = loadedProject.pieces.map(piece => {
          
          // Si la pieza tiene materiales del sistema multi-material, usarlos
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
            materials = piece.materials.filter(material => material.weight > 0).map(material => {
              return {
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
              };
            });
          } 
          // Si no tiene materiales pero tiene datos legacy, migrarlos
          else if (piece.filament_weight > 0 && piece.filament_price > 0) {
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
          
          const mappedPiece = {
            id: piece.id,
            name: piece.name,
            filamentWeight: piece.filament_weight,
            filamentPrice: piece.filament_price,
            printHours: piece.print_hours,
            quantity: piece.quantity,
            notes: piece.notes || '',
            materials: materials
          };
          
          
          return mappedPiece;
        });
        setPieces(mappedPieces);
      }
      draftLoadedRef.current = true; // Marcar como cargado para evitar sobrescribir
    } else if (importedData) {
      // Manejar datos importados desde archivo
      setProjectName(importedData.projectName);
      setPieces(importedData.pieces);
      
      // Calcular precio promedio del filamento de las piezas importadas
      if (importedData.pieces.length > 0) {
        const avgFilamentPrice = importedData.pieces.reduce((sum, piece) => sum + piece.filamentPrice, 0) / importedData.pieces.length;
        setFilamentPrice(avgFilamentPrice);
      }
      draftLoadedRef.current = true; // Marcar como cargado
    }
    setLoading(false);
  }, [loadedProject, importedData]);

  const calculateTotalFilamentWeight = () => {
    return pieces.reduce((sum, piece) => {
      if (piece.materials && piece.materials.length > 0) {
        // Usar la nueva estructura de materiales
        const pieceWeight = piece.materials.reduce((materialSum, material) => {
          const weightInGrams = material.unit === 'kg' ? material.weight * 1000 : material.weight;
          return materialSum + weightInGrams;
        }, 0);
        return sum + (pieceWeight * piece.quantity);
      } else {
        // Fallback a la estructura antigua para compatibilidad
        return sum + (piece.filamentWeight * piece.quantity);
      }
    }, 0);
  };

  // Efecto para establecer la impresora por defecto cuando cargue
  useEffect(() => {
    if (defaultPrinter && !selectedPrinterId && !loadedProject) {
      setSelectedPrinterId(defaultPrinter.id);
      setPrinterPower(defaultPrinter.power_consumption);
    }
  }, [defaultPrinter]);

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

  // Funciones para manejar postprocessing items
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
    // Esta función se implementará más adelante con el hook
    toast.success('Funcionalidad de guardar preset próximamente');
  };

  const addPiece = useCallback(() => {
    const newPiece = {
      id: Date.now().toString(),
      name: `Pieza ${pieces.length + 1}`,
      filamentWeight: 0,
      filamentPrice: filamentPrice,
      printHours: 0,
      quantity: 1,
      notes: '',
      materials: [] // Empezar sin materiales para evitar materiales vacíos
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

  // Funciones para manejar materiales de piezas (memoizadas)
  const addMaterialToPiece = useCallback((pieceId: string) => {
    const defaultUnit = projectType === 'resin' ? 'ml' : 'g';
    const defaultCategory = projectType;
    const defaultMaterialType = projectType === 'resin' ? 'Resina' : 'PLA';
    
    const newMaterial = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      materialName: 'Nuevo material',
      materialType: defaultMaterialType,
      weight: 1, // Empezar con peso 1 en lugar de 0
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

  const resetForm = () => {
    if (isSaving) {
      return; // Prevent reset while saving
    }
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
      materials: [] // Empezar sin materiales para evitar materiales vacíos
    }]);
    // Limpiar también las notas del modo desastre
    setIsDisasterMode(false);
    setDisasterModeNotes([]);
    // Limpiar el borrador del localStorage
    clearDraft();
  };

  const handleEditProject = async () => {
    if (savedProject) {
      try {
        // Fetch pieces for the project with their materials from the database
        const { data: pieces, error } = await supabase
          .from('pieces')
          .select(`
            *,
            piece_materials (*)
          `)
          .eq('project_id', savedProject.id);

        if (error) {
          console.error('Error fetching pieces:', error);
          toast.error('No se pudieron cargar las piezas del proyecto. Intenta de nuevo.');
          return;
        }

        // Process pieces to include materials
        const processedPieces = await processPieces(pieces || [], supabase);
        
        // Create the project with processed pieces
        const projectWithPieces = { 
          ...savedProject, 
          pieces: processedPieces 
        };

        // Update the loadedProject by calling onProjectSaved with the complete project
        onProjectSaved?.(projectWithPieces);
      } catch (error) {
        console.error('Error loading project for editing:', error);
        toast.error('No se pudo cargar el proyecto para editar. Intenta de nuevo.');
      }
    }
    
    setSavedProject(null);
  };

  const handleNewProject = () => {
    setSavedProject(null);
    resetForm();
    // El borrador ya se limpia en resetForm, pero aseguramos que se limpie
    clearDraft();
  };

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

  const saveProject = async () => {
    if (isSaving) {
      return; // Prevent multiple simultaneous saves
    }

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
      // Ensure user profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              email: user.email,
              full_name: user.user_metadata?.full_name || user.email,
            }
          ]);

        if (profileError) {
          console.error('Error creating profile:', profileError);
          toast.error('No se pudo crear el perfil de usuario. Intenta de nuevo.');
          setIsSaving(false);
          return;
        }
      }

      // Prepare project object
      const project = {
        user_id: user.id,
        name: projectName,
        project_type: projectType,
        filament_weight: totalFilamentWeight,
        filament_price: filamentPrice,
        print_hours: totalPrintHours, // This is the total from all pieces
        electricity_cost: electricityCost,
        materials, // Mantener para compatibilidad
        postprocessing_items: postprocessingItems.length > 0 ? postprocessingItems : null,
        total_cost: costs.total,
        vat_percentage: vatPercentage,
        profit_margin: profitMargin,
        recommended_price: salePrice.recommendedPrice,
        status: 'calculated',
        team_id: getEffectiveTeam()?.id || null,
      };

      let projectId = loadedProject?.id;
      let projectData;
      let projectError;

      if (loadedProject?.id) {
        // Update existing project
        const { data, error } = await supabase
          .from('projects')
          .update(project)
          .eq('id', loadedProject.id)
          .select()
          .single();
        projectData = data;
        projectError = error;
        projectId = loadedProject.id;
      } else {
        // Insert new project
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

      // Handle pieces
      if (projectId) {
        // Always delete all pieces and their materials for this project
        await supabase.from('piece_materials').delete().in('piece_id', 
          (await supabase.from('pieces').select('id').eq('project_id', projectId)).data?.map((p: { id: string }) => p.id) || []
        );
        await supabase.from('pieces').delete().eq('project_id', projectId);

        // Guardar siempre todas las piezas, incluso si solo hay una y tiene el nombre por defecto
        const piecesToSave = pieces.map(piece => ({
          project_id: projectId,
          name: piece.name,
          // Si la pieza tiene materiales multi-material, guardar filament_weight y filament_price como 0
          // para que no se active la lógica de migración legacy
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
            // Save piece materials for each piece (only materials with weight > 0)
            const materialsToSave = [];
            for (let i = 0; i < pieces.length; i++) {
              const piece = pieces[i];
              const savedPiece = savedPieces[i];
              
              if (piece.materials && piece.materials.length > 0) {
                for (const material of piece.materials) {
                  // Solo guardar materiales con peso > 0 para evitar materiales vacíos
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
        // Limpiar el borrador del localStorage ya que el proyecto se guardó exitosamente
        clearDraft();
        
        // After saving, fetch the complete project data from database including materials
        try {
          const { data: pieces, error: piecesError } = await supabase
            .from('pieces')
            .select(`
              *,
              piece_materials (*)
            `)
            .eq('project_id', projectId);

          if (piecesError) {
            console.error('Error fetching pieces after save:', piecesError);
            toast.error('Proyecto guardado, pero no se pudieron cargar los materiales para el resumen.');
          }

          // Process pieces to include materials
          const processedPieces = pieces ? await processPieces(pieces, supabase) : [];
          
          // Create complete project with materials from database
          const projectWithPieces = {
            ...projectData,
            pieces: processedPieces
          };
          
          // Show project summary with complete data
          setSavedProject(projectWithPieces);
          onProjectSaved?.(projectWithPieces);
        } catch (error) {
          console.error('Error loading project data for summary:', error);
          // Fallback to basic project data without materials
          const basicProject = {
            ...projectData,
            pieces: pieces.map(piece => ({
              id: piece.id,
              name: piece.name,
              filament_weight: (piece.materials && piece.materials.length > 0) ? 0 : piece.filamentWeight,
              filament_price: (piece.materials && piece.materials.length > 0) ? 0 : piece.filamentPrice,
              print_hours: piece.printHours,
              quantity: piece.quantity,
              notes: piece.notes || '',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              project_id: projectId || '',
              materials: piece.materials || []
            }))
          };
          setSavedProject(basicProject);
          onProjectSaved?.(basicProject);
        }
      }
    } catch (error: any) {
      toast.error(
        error.message || 'Ha ocurrido un error al guardar el proyecto.'
      );
    } finally {
      setIsSaving(false);
    }
  };


  if (loading) {
    return <CalculatorSkeleton />;
  }

  // Show project summary if a project was just saved
  if (savedProject) {
    return (
      <ProjectSavedSummary
        project={savedProject}
        onEdit={handleEditProject}
        onNewProject={handleNewProject}
      />
    );
  }

  // Render del formulario manual (viewMode === 'manual-entry')
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Team Context Banner */}
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
        <div className="space-y-6">
          <ProjectSummaryPanel
            pieces={pieces}
            totalFilamentWeight={totalFilamentWeight}
            totalPrintHours={totalPrintHours}
            totalFilamentCost={totalFilamentCost}
            totalElectricityCost={totalElectricityCost}
            totalPostprocessingCost={postprocessingItems.reduce((sum, item) => sum + (item.cost_per_unit * (item.quantity || 1)), 0)}
            projectType={projectType}
          />
          
          <CostBreakdownPanel costs={costs} />
          
          <SalePricePanel 
            salePrice={salePrice} 
            costs={costs}
            vatPercentage={vatPercentage}
            profitMargin={profitMargin}
          />
        </div>
      </div>

      {/* Botón sticky de modo desastre */}
      <DisasterModeButton
        isActive={isDisasterMode}
        onToggle={() => setIsDisasterMode(!isDisasterMode)}
        onAddNote={addDisasterNote}
        onClearAll={clearAllDisasterNotes}
        noteCount={disasterModeNotes.length}
      />

      {/* Notas del modo desastre */}
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

      {/* Modal de confirmación para limpiar notas */}
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