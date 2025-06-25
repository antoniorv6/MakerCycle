import React, { useState, useEffect } from 'react';
import { Calculator, ArrowLeft } from 'lucide-react';

// Importar tipos y hook
import type { 
  CostCalculatorProps, 
  ViewMode, 
  Material, 
  Project 
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

  // Cargar proyecto cuando se pasa como prop
  useEffect(() => {
    if (loadedProject) {
      setProjectName(loadedProject.name);
      setFilamentWeight(loadedProject.filamentWeight);
      setFilamentPrice(loadedProject.filamentPrice);
      setPrintHours(loadedProject.printHours);
      setElectricityCost(loadedProject.electricityCost);
      setMaterials(loadedProject.materials);
      setVatPercentage(loadedProject.vatPercentage || 21);
      setProfitMargin(loadedProject.profitMargin || 15);
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
  const saveProject = () => {
    if (!projectName.trim()) {
      alert('Por favor, introduce un nombre para el proyecto');
      return;
    }

    const project: Project = {
      id: loadedProject?.id || Date.now().toString(),
      name: projectName,
      filamentWeight,
      filamentPrice,
      printHours,
      electricityCost,
      materials,
      totalCost: costs.total,
      vatPercentage,
      profitMargin,
      recommendedPrice: salePrice.recommendedPrice,
      createdAt: loadedProject?.createdAt || new Date().toISOString(),
      status: 'calculated'
    };

    const savedProjects = JSON.parse(localStorage.getItem('3d-projects') || '[]');
    const existingIndex = savedProjects.findIndex((p: Project) => p.id === project.id);
    
    if (existingIndex >= 0) {
      savedProjects[existingIndex] = project;
    } else {
      savedProjects.push(project);
    }
    
    localStorage.setItem('3d-projects', JSON.stringify(savedProjects));
    onProjectSaved?.();
    
    alert('Proyecto guardado correctamente');
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
        
        {!loadedProject && (
          <button
            onClick={() => setViewMode('selection')}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors duration-200 ml-4"
          >
            <ArrowLeft className="w-4 h-4 mr-1" />
            Cambiar método
          </button>
        )}
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