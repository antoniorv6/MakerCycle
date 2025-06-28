import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Save, Upload, Calculator, FileText, Settings, Euro, Clock, Package, Zap, Plus, Trash2, ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';
import type { Project, DatabaseProject } from './types';
import toast from 'react-hot-toast';

// Importar tipos y hook
import { 
  ViewMode, 
  Material,
  CostCalculatorProps
} from './types';
import { useCostCalculations } from './hooks/useCostCalculations';

// Importar componentes de vistas
import ModeSelection from './views/ModeSelection';
import FileUpload from './views/FileUpload';

// Importar componentes de formularios
import ProjectInfo from './forms/ProjectInfo';
import FilamentSection from './forms/FilamentSection';
import ElectricitySection from './forms/ElectricitySection';
import PricingConfig from './forms/PricingConfig';
import MaterialsSection from './forms/MaterialsSection';

// Importar paneles de resultados
import CostBreakdownPanel from './panels/CostBreakdownPanel';
import SalePricePanel from './panels/SalePricePanel';
import ProjectInfoPanel from './panels/ProjectInfoPanel';

const CostCalculator: React.FC<CostCalculatorProps> = ({ loadedProject, onProjectSaved }) => {
  // Estados de la aplicación
  const [viewMode, setViewMode] = useState<ViewMode>('selection');
  
  // Estados del formulario
  const [projectName, setProjectName] = useState<string>('');
  const [filamentWeight, setFilamentWeight] = useState<number>(100);
  const [filamentPrice, setFilamentPrice] = useState<number>(25);
  const [printHours, setPrintHours] = useState<number>(3);
  const [electricityCost, setElectricityCost] = useState<number>(0.12);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [vatPercentage, setVatPercentage] = useState<number>(21);
  const [profitMargin, setProfitMargin] = useState<number>(15);

  // Hook personalizado para cálculos
  const { costs, salePrice } = useCostCalculations({
    filamentWeight,
    filamentPrice,
    printHours,
    electricityCost,
    materials,
    vatPercentage,
    profitMargin
  });

  const { user } = useAuth();
  const supabase = createClient();

  // Cargar proyecto cuando se pasa como prop
  useEffect(() => {
    if (loadedProject) {
      setProjectName(loadedProject.name);
      setFilamentWeight(loadedProject.filament_weight);
      setFilamentPrice(loadedProject.filament_price);
      setPrintHours(loadedProject.print_hours);
      setElectricityCost(loadedProject.electricity_cost);
      setMaterials(loadedProject.materials);
      setVatPercentage(loadedProject.vat_percentage || 21);
      setProfitMargin(loadedProject.profit_margin || 15);
      setViewMode('manual-entry');
    }
  }, [loadedProject]);

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
    setMaterials(materials.map(material => 
      material.id === id 
        ? { ...material, [field]: value }
        : material
    ));
  };

  const removeMaterial = (id: string) => {
    setMaterials(materials.filter(material => material.id !== id));
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

      // Now insert the project
      const project = {
        user_id: user.id,
        name: projectName,
        filament_weight: filamentWeight,
        filament_price: filamentPrice,
        print_hours: printHours,
        electricity_cost: electricityCost,
        materials,
        total_cost: costs.total,
        vat_percentage: vatPercentage,
        profit_margin: profitMargin,
        recommended_price: salePrice.recommendedPrice,
        status: 'calculated',
      };

      const { error } = await supabase.from('projects').insert([project]);
      if (error) {
        toast.error('Error al guardar el proyecto en Supabase: ' + error.message);
      } else {
        onProjectSaved?.();
        toast.success('Proyecto guardado correctamente en Supabase');
      }
    } catch (error: any) {
      toast.error('Error inesperado: ' + error.message);
    }
  };

  // Función para manejar análisis de archivos
  const handleFileAnalyzed = (weight: number, time: number) => {
    setFilamentWeight(weight);
    setPrintHours(time);
    setViewMode('manual-entry');
  };

  // Render según el modo de vista
  if (viewMode === 'selection') {
    return <ModeSelection onModeSelect={setViewMode} />;
  }

  if (viewMode === 'file-upload') {
    return (
      <FileUpload 
        onBack={() => setViewMode('selection')}
        onFileAnalyzed={handleFileAnalyzed}
      />
    );
  }

  // Render del formulario manual (viewMode === 'manual-entry')
  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="text-center flex-1">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-50 rounded-full mb-4">
            <Calculator className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Calculadora de Costes 3D</h1>
          <p className="text-gray-600">Calcula el coste total de tus proyectos de impresión 3D</p>
        </div>
        
        <button
          onClick={() => setViewMode('selection')}
          className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 ml-4"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Cambiar método
        </button>
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

          <FilamentSection
            weight={filamentWeight}
            price={filamentPrice}
            onWeightChange={setFilamentWeight}
            onPriceChange={setFilamentPrice}
          />

          <ElectricitySection
            printHours={printHours}
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
          <CostBreakdownPanel costs={costs} />
          
          <SalePricePanel 
            salePrice={salePrice} 
            costs={costs}
            vatPercentage={vatPercentage}
            profitMargin={profitMargin}
          />
          
          <ProjectInfoPanel 
            filamentWeight={filamentWeight}
            printHours={printHours}
            materials={materials}
          />
        </div>
      </div>
    </div>
  );
};

export default CostCalculator;