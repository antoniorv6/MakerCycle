import React, { useState, useEffect } from 'react';
import { Calculator } from 'lucide-react';
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
import { useCostCalculations } from './hooks/useCostCalculations';
import type { DatabaseProject, DatabasePiece } from '@/types';

interface CostCalculatorProps {
  loadedProject?: DatabaseProject & { pieces?: DatabasePiece[] };
  onProjectSaved?: (project: DatabaseProject) => void;
}

const CostCalculator: React.FC<CostCalculatorProps> = ({ loadedProject, onProjectSaved }: CostCalculatorProps) => {
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
  }>>([{
    id: '1',
    name: 'Pieza principal',
    filamentWeight: 0,
    filamentPrice: 25,
    printHours: 0,
    quantity: 1,
    notes: ''
  }]);

  useEffect(() => {
    if (loadedProject) {
      setProjectName(loadedProject.name);
      setFilamentPrice(loadedProject.filament_price);
      setPrintHours(loadedProject.print_hours);
      setElectricityCost(loadedProject.electricity_cost);
      setVatPercentage(loadedProject.vat_percentage);
      setProfitMargin(loadedProject.profit_margin);
      setMaterials(loadedProject.materials || []);

      if (loadedProject.pieces && loadedProject.pieces.length > 0) {
        setPieces(loadedProject.pieces.map(piece => ({
          id: piece.id,
          name: piece.name,
          filamentWeight: piece.filament_weight,
          filamentPrice: piece.filament_price,
          printHours: piece.print_hours,
          quantity: piece.quantity,
          notes: piece.notes || ''
        })));
      }
    }
    setLoading(false);
  }, [loadedProject]);

  const calculateTotalFilamentWeight = () => {
    return pieces.reduce((sum, piece) => sum + (piece.filamentWeight * piece.quantity), 0);
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
      notes: ''
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
        name: `${pieceToDuplicate.name} (copia)`
      };
      setPieces([...pieces, newPiece]);
    }
  };

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
      notes: ''
    }]);
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
        // Always delete all pieces for this project and re-insert
        await supabase.from('pieces').delete().eq('project_id', projectId);

        // Guardar siempre todas las piezas, incluso si solo hay una y tiene el nombre por defecto
        const piecesToSave = pieces.map(piece => ({
          project_id: projectId,
          name: piece.name,
          filament_weight: piece.filamentWeight,
          filament_price: piece.filamentPrice,
          print_hours: piece.printHours,
          quantity: piece.quantity,
          notes: piece.notes || ''
        }));

        if (piecesToSave.length > 0) {
          const { error: piecesError } = await supabase
            .from('pieces')
            .insert(piecesToSave);

          if (piecesError) {
            console.error('Error saving pieces:', piecesError);
            toast.error('El proyecto se guardó, pero hubo un error al guardar las piezas.');
          }
        }
      }

      if (projectData) {
        onProjectSaved?.(projectData);
      }
      toast.success('Proyecto guardado correctamente.');
    } catch (error: any) {
      toast.error('Ha ocurrido un error inesperado. Intenta de nuevo.');
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
          />

          <ElectricitySection
            printHours={totalPrintHours}
            electricityCost={electricityCost}
            onPrintHoursChange={setPrintHours}
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
    </div>
  );
};

export default CostCalculator;