import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Calculator, FileText, Settings, Euro, Clock, Package, Zap, Plus, Trash2 } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import type { Project, DatabaseProject, Piece, Team, Material, ViewMode, CostCalculatorProps } from '@/types';
import toast from 'react-hot-toast';
import { CalculatorSkeleton } from '@/components/skeletons';
import { useCostCalculations } from './hooks/useCostCalculations';

// Importar componentes de vistas
import ModeSelection from './views/ModeSelection';

// Importar componentes de formularios
import ProjectInfo from './forms/ProjectInfo';
import FilamentSection from './forms/FilamentSection';
import ElectricitySection from './forms/ElectricitySection';
import PricingConfig from './forms/PricingConfig';
import MaterialsSection from './forms/MaterialsSection';
import PiecesSection from './forms/PiecesSection';

// Importar paneles de resultados
import CostBreakdownPanel from './panels/CostBreakdownPanel';
import SalePricePanel from './panels/SalePricePanel';
import ProjectInfoPanel from './panels/ProjectInfoPanel';
import ProjectSummaryPanel from './panels/ProjectSummaryPanel';

const CostCalculator: React.FC<CostCalculatorProps> = ({ loadedProject, onProjectSaved }: CostCalculatorProps) => {
  // Estados de la aplicación
  const [viewMode, setViewMode] = useState<ViewMode>('manual-entry');
  const [loading, setLoading] = useState(false);
  
  // Estados del formulario
  const [projectName, setProjectName] = useState<string>('');
  const [filamentWeight, setFilamentWeight] = useState<number>(100);
  const [filamentPrice, setFilamentPrice] = useState<number>(25);
  const [printHours, setPrintHours] = useState<number>(3);
  const [electricityCost, setElectricityCost] = useState<number>(0.12);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [vatPercentage, setVatPercentage] = useState<number>(21);
  const [profitMargin, setProfitMargin] = useState<number>(15);
  
  // Nuevo estado para piezas
  const [pieces, setPieces] = useState<Piece[]>([
    {
      id: '1',
      name: 'Pieza principal',
      filamentWeight: 100,
      filamentPrice: 25,
      printHours: 3,
      quantity: 1,
      notes: ''
    }
  ]);

  const [teams, setTeams] = useState<Team[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);

  // Hook personalizado para cálculos
  const { costs, salePrice, totalFilamentWeight, totalPrintHours, totalFilamentCost, totalElectricityCost } = useCostCalculations({
    filamentWeight,
    filamentPrice,
    printHours,
    electricityCost,
    materials,
    vatPercentage,
    profitMargin,
    pieces
  });

  const { user } = useAuth();
  const supabase = createClient();

  // Cargar proyecto cuando se pasa como prop
  useEffect(() => {
    if (loadedProject) {
      setLoading(true);
      setProjectName(loadedProject.name);
      setFilamentWeight(loadedProject.filament_weight);
      setFilamentPrice(loadedProject.filament_price);
      setPrintHours(loadedProject.print_hours);
      setElectricityCost(loadedProject.electricity_cost);
      setMaterials(loadedProject.materials);
      setVatPercentage(loadedProject.vat_percentage || 21);
      setProfitMargin(loadedProject.profit_margin || 15);
      
      // Cargar piezas si existen
      if (loadedProject.pieces && loadedProject.pieces.length > 0) {
        setPieces(loadedProject.pieces.map((piece: import('@/types').DatabasePiece) => ({
          id: piece.id,
          name: piece.name,
          filamentWeight: piece.filament_weight,
          filamentPrice: piece.filament_price,
          printHours: piece.print_hours,
          quantity: piece.quantity,
          notes: piece.notes || ''
        })));
      } else {
        // Crear pieza principal con los datos del proyecto
        setPieces([{
          id: '1',
          name: 'Pieza principal',
          filamentWeight: loadedProject.filament_weight,
          filamentPrice: loadedProject.filament_price,
          printHours: loadedProject.print_hours,
          quantity: 1,
          notes: ''
        }]);
      }
      
      setViewMode('manual-entry');
      setLoading(false);
    }
  }, [loadedProject]);

  useEffect(() => {
    if (user && !loadedProject) {
      fetchTeams();
    }
  }, [user, loadedProject]);

  const fetchTeams = async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from('team_members')
      .select('team_id, teams(*)')
      .eq('user_id', user.id);
    if (!error && data) {
      setTeams(data.map((tm: any) => tm.teams));
    }
  };

  // Funciones de manejo de materiales
  const addMaterial = () => {
    const newMaterial: Material = {
      id: Date.now().toString(),
      name: '',
      price: 0
    };
    setMaterials([...materials, newMaterial]);
  };

  const updateMaterial = (id: string, field: 'name' | 'price', value: string | number) => {
    setMaterials(materials.map((material: Material) => 
      material.id === id 
        ? { ...material, [field]: value }
        : material
    ));
  };

  const removeMaterial = (id: string) => {
    setMaterials(materials.filter((material: Material) => material.id !== id));
  };

  // Funciones de manejo de piezas
  const addPiece = () => {
    const newPiece: Piece = {
      id: Date.now().toString(),
      name: `Pieza ${pieces.length + 1}`,
      filamentWeight: 0,
      filamentPrice: filamentPrice, // Usar el precio por defecto
      printHours: 0,
      quantity: 1,
      notes: ''
    };
    setPieces([...pieces, newPiece]);
  };

  const updatePiece = (id: string, field: keyof Piece, value: string | number) => {
    setPieces(pieces.map((piece: Piece) => 
      piece.id === id 
        ? { ...piece, [field]: value }
        : piece
    ));
  };

  const removePiece = (id: string) => {
    if (pieces.length > 1) {
      setPieces(pieces.filter((piece: Piece) => piece.id !== id));
    } else {
      toast.error('Debe haber al menos una pieza en el proyecto');
    }
  };

  const duplicatePiece = (id: string) => {
    const pieceToDuplicate = pieces.find((piece: Piece) => piece.id === id);
    if (pieceToDuplicate) {
      const newPiece: Piece = {
        ...pieceToDuplicate,
        id: Date.now().toString(),
        name: `${pieceToDuplicate.name} (copia)`,
        quantity: 1
      };
      setPieces([...pieces, newPiece]);
    }
  };

  // Función de reset del formulario
  const resetForm = () => {
    setProjectName('');
    setFilamentWeight(100);
    setFilamentPrice(25);
    setPrintHours(3);
    setElectricityCost(0.12);
    setMaterials([]);
    setVatPercentage(21);
    setProfitMargin(15);
    setPieces([{
      id: '1',
      name: 'Pieza principal',
      filamentWeight: 100,
      filamentPrice: 25,
      printHours: 3,
      quantity: 1,
      notes: ''
    }]);
  };

  // Función de guardado de proyecto
  const saveProject = async () => {
    if (!projectName.trim()) {
      toast.error('Por favor, introduce un nombre para el proyecto');
      return;
    }
    if (!user) {
      toast.error('Debes iniciar sesión para guardar el proyecto en la nube.');
      return;
    }

    try {
      // First, ensure profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (!existingProfile) {
        // Create profile if it doesn't exist
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
          toast.error('Error al crear el perfil del usuario. Inténtalo de nuevo.');
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
        team_id: selectedTeamId,
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
        toast.error('Error al guardar el proyecto en Supabase: ' + projectError.message);
        return;
      }

      // Handle pieces
      if (projectId) {
        // Always delete all pieces for this project and re-insert
        await supabase.from('pieces').delete().eq('project_id', projectId);

        if (pieces.length > 1 || pieces[0].name !== 'Pieza principal') {
          const piecesToSave = pieces.map(piece => ({
            project_id: projectId,
            name: piece.name,
            filament_weight: piece.filamentWeight,
            filament_price: piece.filamentPrice,
            print_hours: piece.printHours,
            quantity: piece.quantity,
            notes: piece.notes || ''
          }));

          const { error: piecesError } = await supabase
            .from('pieces')
            .insert(piecesToSave);

          if (piecesError) {
            console.error('Error saving pieces:', piecesError);
            toast.error('Proyecto guardado pero hubo un error al guardar las piezas');
          }
        }
      }

      if (projectData) {
        onProjectSaved?.(projectData);
      }
      toast.success('Proyecto guardado correctamente en Supabase');
    } catch (error: any) {
      toast.error('Error inesperado: ' + error.message);
    }
  };



  if (loading) {
    return <CalculatorSkeleton />;
  }

  // Render del formulario manual (viewMode === 'manual-entry')
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-full mb-4">
          <Calculator className="w-8 h-8 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Calculadora de Costes 3D</h1>
        <p className="text-gray-600">Calcula el coste total de tus proyectos de impresión 3D</p>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Equipo</label>
              <select
                value={selectedTeamId || ''}
                onChange={e => setSelectedTeamId(e.target.value || null)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Personal (sin equipo)</option>
                {teams.map(team => (
                  <option key={team.id} value={team.id}>{team.name}</option>
                ))}
              </select>
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