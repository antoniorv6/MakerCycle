import React, { useState, useEffect, useCallback } from 'react';
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
import type { DatabaseProject, DatabasePiece } from '@/types';

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
}

const CostCalculator: React.FC<CostCalculatorProps> = ({ loadedProject, onProjectSaved, onNavigateToSettings, importedData }: CostCalculatorProps) => {
  const { user } = useAuth();
  const { getEffectiveTeam } = useTeam();
  const supabase = createClient();
  const [loading, setLoading] = useState(true);
  const [projectName, setProjectName] = useState('');
  const [filamentPrice, setFilamentPrice] = useState(25);
  const [printHours, setPrintHours] = useState(0);
  const [electricityCost, setElectricityCost] = useState(0.12);
  const [vatPercentage, setVatPercentage] = useState(21);
  const [profitMargin, setProfitMargin] = useState(15);
  const [materials, setMaterials] = useState<Array<{ id: string; name: string; price: number }>>([]);
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

  useEffect(() => {
    console.log('🔍 Debug - CostCalculator useEffect triggered with loadedProject:', loadedProject);
    if (loadedProject) {
      console.log('🔍 Debug - loadedProject.pieces:', loadedProject.pieces);
      setProjectName(loadedProject.name);
      setFilamentPrice(loadedProject.filament_price);
      setPrintHours(loadedProject.print_hours);
      setElectricityCost(loadedProject.electricity_cost);
      setVatPercentage(loadedProject.vat_percentage);
      setProfitMargin(loadedProject.profit_margin);
      setMaterials(loadedProject.materials || []);

      if (loadedProject.pieces && loadedProject.pieces.length > 0) {
        console.log('🔍 Debug - Loading pieces in CostCalculator:', loadedProject.pieces);
        if (loadedProject.pieces[0]) {
          console.log('🔍 Debug - First piece in CostCalculator:', loadedProject.pieces[0]);
          console.log('🔍 Debug - First piece materials in CostCalculator:', loadedProject.pieces[0].materials);
        }
        const mappedPieces = loadedProject.pieces.map(piece => {
          console.log(`  Piece: ${piece.name}, materials:`, piece.materials?.length || 0);
          console.log(`  Piece materials array:`, piece.materials);
          console.log(`  Piece raw data:`, {
            id: piece.id,
            name: piece.name,
            filament_weight: piece.filament_weight,
            filament_price: piece.filament_price,
            materials: piece.materials
          });
          
          // Si la pieza tiene materiales del sistema multi-material, usarlos
          let materials = [];
          if (piece.materials && piece.materials.length > 0) {
            console.log(`    Using multi-material system`);
            materials = piece.materials.filter(material => material.weight > 0).map(material => {
              console.log(`    Mapping material:`, material);
              console.log(`    Material keys:`, Object.keys(material));
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
            console.log(`    Migrating legacy data to multi-material format`);
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
          
          console.log(`  Mapped piece result:`, {
            id: mappedPiece.id,
            name: mappedPiece.name,
            materialsCount: mappedPiece.materials.length,
            materials: mappedPiece.materials
          });
          
          // Debug: verificar si los materiales tienen las propiedades correctas
          if (mappedPiece.materials.length > 0) {
            console.log(`    First mapped material:`, mappedPiece.materials[0]);
            console.log(`    First mapped material keys:`, Object.keys(mappedPiece.materials[0]));
          }
          
          return mappedPiece;
        });
        console.log('🔍 Debug - Mapped pieces:', mappedPieces);
        setPieces(mappedPieces);
      }
    } else if (importedData) {
      // Manejar datos importados desde archivo
      setProjectName(importedData.projectName);
      setPieces(importedData.pieces);
      
      // Calcular precio promedio del filamento de las piezas importadas
      if (importedData.pieces.length > 0) {
        const avgFilamentPrice = importedData.pieces.reduce((sum, piece) => sum + piece.filamentPrice, 0) / importedData.pieces.length;
        setFilamentPrice(avgFilamentPrice);
      }
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
    materials,
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

  const addPiece = () => {
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
    setPieces([...pieces, newPiece]);
  };

  const updatePiece = (id: string, field: keyof typeof pieces[0], value: string | number) => {
    setPieces(pieces.map(piece =>
      piece.id === id ? { ...piece, [field]: value } : piece
    ));
  };

  const removePiece = (id: string) => {
    if (pieces.length > 1) {
      setPieces(pieces.filter(piece => piece.id !== id));
    }
  };

  const duplicatePiece = (id: string) => {
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
      setPieces([...pieces, newPiece]);
    }
  };

  // Funciones para manejar materiales de piezas (memoizadas)
  const addMaterialToPiece = useCallback((pieceId: string) => {
    const newMaterial = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      materialName: 'Nuevo material',
      materialType: 'PLA',
      weight: 1, // Empezar con peso 1g en lugar de 0
      pricePerKg: 25,
      unit: 'g',
      category: 'filament' as const,
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
  }, []);

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
    setProjectName('');
    setFilamentPrice(25);
    setPrintHours(0);
    setElectricityCost(0.12);
    setVatPercentage(21);
    setProfitMargin(15);
    setMaterials([]);
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
    if (!user) {
      toast.error('Debes iniciar sesión para guardar proyectos.');
      return;
    }

    if (!projectName.trim()) {
      toast.error('El proyecto debe tener un nombre.');
      return;
    }

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
          return;
        }
      }

      // Prepare project object
      const project = {
        user_id: user.id,
        name: projectName,
        filament_weight: totalFilamentWeight,
        filament_price: filamentPrice,
        print_hours: totalPrintHours,
        electricity_cost: electricityCost,
        materials,
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
        return;
      }

      // Handle pieces
      if (projectId) {
        // Always delete all pieces and their materials for this project
        await supabase.from('piece_materials').delete().in('piece_id', 
          (await supabase.from('pieces').select('id').eq('project_id', projectId)).data?.map(p => p.id) || []
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
        
        onProjectSaved?.(projectData);
      }
      toast.success('Proyecto guardado correctamente.');
    } catch (error: any) {
      toast.error(
        error.message || 'Ha ocurrido un error al guardar el proyecto.'
      );
    }
  };


  if (loading) {
    return <CalculatorSkeleton />;
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
            onProjectNameChange={setProjectName}
            onReset={resetForm}
            onSave={saveProject}
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
            onElectricityCostChange={setElectricityCost}
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