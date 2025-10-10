import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Package, Edit3, Save, X, Bookmark, Settings } from 'lucide-react';
import type { CostCalculatorPieceMaterial } from '../types';
import { useMaterialPresets } from '@/hooks/useMaterialPresets';

interface PieceMaterialsSectionProps {
  materials: CostCalculatorPieceMaterial[];
  onAddMaterial: () => void;
  onUpdateMaterial: (id: string, field: keyof CostCalculatorPieceMaterial, value: string | number) => void;
  onRemoveMaterial: (id: string) => void;
  onNavigateToSettings?: () => void;
  onSyncPieceFields?: (totalWeight: number, totalCost: number) => void;
  onSaveAsPreset?: (material: CostCalculatorPieceMaterial) => void;
}

const MaterialCard: React.FC<{
  material: CostCalculatorPieceMaterial;
  onUpdate: (field: keyof CostCalculatorPieceMaterial, value: string | number) => void;
  onRemove: () => void;
  onNavigateToSettings?: () => void;
  onSaveAsPreset?: (material: CostCalculatorPieceMaterial) => void;
}> = ({ material, onUpdate, onRemove, onNavigateToSettings, onSaveAsPreset }) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(material.materialName);
  const { presets, loading: presetsLoading, convertPrice } = useMaterialPresets();
  const [showPresetSelector, setShowPresetSelector] = useState(false);
  const [selectedPresetCategory, setSelectedPresetCategory] = useState<'filament' | 'resin'>(material.category);
  const [isPresetLoaded, setIsPresetLoaded] = useState(false);

  // Filtrar presets por categoría seleccionada
  const filteredPresets = presets.filter(preset => preset.category === selectedPresetCategory);

  const handleNameSave = () => {
    onUpdate('materialName', tempName);
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setTempName(material.materialName);
    setIsEditingName(false);
  };

  const handleColorChange = (color: string) => {
    onUpdate('color', color);
  };

  const handlePresetSelect = (presetId: string) => {
    const selectedPreset = presets.find(p => p.id === presetId);
    
    if (selectedPreset) {
      // Convertir el precio a €/kg si es necesario
      let pricePerKg = selectedPreset.price_per_unit;
      if (selectedPreset.unit !== 'kg') {
        pricePerKg = convertPrice(selectedPreset.price_per_unit, selectedPreset.unit, 'kg');
      }
      
      // Actualizar todos los campos del material con los datos del preset
      onUpdate('materialName', selectedPreset.name);
      onUpdate('materialType', selectedPreset.material_type);
      onUpdate('pricePerKg', pricePerKg);
      onUpdate('category', selectedPreset.category);
      onUpdate('color', selectedPreset.color || '');
      onUpdate('brand', selectedPreset.brand || '');
      onUpdate('notes', selectedPreset.notes || '');
      
      // Marcar que se ha cargado un preset
      setIsPresetLoaded(true);
      
      // Cerrar el selector
      setShowPresetSelector(false);
    }
  };

  const handleManageProfiles = () => {
    setShowPresetSelector(false);
    if (onNavigateToSettings) {
      onNavigateToSettings();
    }
  };

  const handleResetPreset = () => {
    setIsPresetLoaded(false);
  };

  const getCategoryColor = (category: string) => {
    return category === 'filament' ? 'bg-blue-100 text-blue-700' : 'bg-purple-100 text-purple-700';
  };

  const getTypeColor = (type: string) => {
    const colors = {
      'PLA': 'bg-green-100 text-green-700',
      'ABS': 'bg-red-100 text-red-700',
      'PETG': 'bg-yellow-100 text-yellow-700',
      'TPU': 'bg-orange-100 text-orange-700',
      'Resina': 'bg-purple-100 text-purple-700',
    };
    return colors[type as keyof typeof colors] || 'bg-gray-100 text-gray-700';
  };

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <Package className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="text-sm font-medium text-gray-900 bg-white border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={handleNameSave}
                  className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                  title="Guardar nombre"
                >
                  <Save className="w-3 h-3" />
                </button>
                <button
                  onClick={handleNameCancel}
                  className="p-1 text-gray-500 hover:bg-gray-50 rounded transition-colors"
                  title="Cancelar"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h5 className="text-sm font-medium text-gray-900">
                  {material.materialName || 'Material sin nombre'}
                </h5>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Editar nombre"
                >
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getCategoryColor(material.category)}`}>
                {material.category === 'filament' ? 'Filamento' : 'Resina'}
              </span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTypeColor(material.materialType)}`}>
                {material.materialType}
              </span>
              {material.color && (
                <div className="flex items-center gap-1">
                  <span 
                    className="w-4 h-4 rounded-full border-2 border-gray-300 shadow-sm" 
                    style={{ backgroundColor: material.color }}
                    title={`Color: ${material.color}`}
                  />
                  <span className="text-xs text-gray-600 font-mono">
                    {material.color}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Selector de presets */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowPresetSelector(!showPresetSelector)}
              className="p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
              title="Seleccionar perfil de material"
              disabled={presetsLoading || presets.length === 0}
            >
              <Bookmark className="w-4 h-4" />
            </button>
            
            {/* Material Profile Selector Dropdown */}
            {showPresetSelector && presets.length > 0 && (
              <div className="absolute z-20 right-0 mt-2 w-80 bg-white border border-gray-200 rounded-xl shadow-xl">
                {/* Header */}
                <div className="p-3 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                  <h4 className="font-semibold text-gray-900 text-xs flex items-center gap-2">
                    <Bookmark className="w-3 h-3 text-purple-600" />
                    Perfiles de Materiales
                  </h4>
                </div>

                {/* Category Tabs */}
                <div className="p-2 border-b border-gray-100">
                  <div className="flex bg-gray-100 rounded-lg p-1">
                    <button
                      onClick={() => setSelectedPresetCategory('filament')}
                      className={`flex-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                        selectedPresetCategory === 'filament'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Filamentos
                    </button>
                    <button
                      onClick={() => setSelectedPresetCategory('resin')}
                      className={`flex-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                        selectedPresetCategory === 'resin'
                          ? 'bg-white text-gray-900 shadow-sm'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      Resinas
                    </button>
                  </div>
                </div>

                {/* Presets List */}
                <div className="max-h-60 overflow-y-auto">
                  {filteredPresets.length > 0 ? (
                    filteredPresets.map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => handlePresetSelect(preset.id)}
                        className="w-full px-3 py-2 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 group"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h5 className="font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors text-sm">
                                {preset.name}
                              </h5>
                              {preset.is_default && (
                                <span className="inline-flex items-center gap-1 px-1 py-0.5 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                  <Bookmark className="w-2 h-2 fill-current" />
                                  Favorito
                                </span>
                              )}
                            </div>
                            <div className="text-xs text-gray-600">
                              {preset.material_type}
                              {preset.brand && ` • ${preset.brand}`}
                            </div>
                          </div>
                          <div className="text-right ml-2">
                            <div className="text-sm font-bold text-purple-600 group-hover:text-purple-700 transition-colors">
                              {preset.price_per_unit.toFixed(2)}€
                            </div>
                            <div className="text-xs text-gray-500">por {preset.unit}</div>
                          </div>
                        </div>
                      </button>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">
                      <Package className="w-6 h-6 mx-auto mb-2 text-gray-400" />
                      <p className="text-xs">No hay perfiles de {selectedPresetCategory === 'filament' ? 'filamentos' : 'resinas'}</p>
                    </div>
                  )}
                </div>

                {/* Footer */}
                <div className="p-2 bg-gray-50 border-t border-gray-100 rounded-b-xl space-y-1">
                  <button
                    onClick={handleManageProfiles}
                    className="w-full px-3 py-2 text-xs text-purple-700 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors font-medium flex items-center justify-center gap-1 border border-purple-200 hover:border-purple-300"
                  >
                    <Settings className="w-3 h-3" />
                    Gestionar materiales
                  </button>
                  <button
                    onClick={() => setShowPresetSelector(false)}
                    className="w-full px-3 py-1 text-xs text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Botón para resetear preset */}
          {isPresetLoaded && (
            <button
              onClick={handleResetPreset}
              className="p-2 text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
              title="Editar manualmente"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}

          {/* Botón para guardar como preset */}
          {onSaveAsPreset && (
            <button
              onClick={() => onSaveAsPreset(material)}
              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Guardar como preset"
            >
              <Save className="w-4 h-4" />
            </button>
          )}

          {/* Botón eliminar */}
          <button
            onClick={onRemove}
            className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            title="Eliminar material"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>


      {/* Formulario */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="md:col-span-2 lg:col-span-1">
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Peso utilizado ({material.unit}) <span className="text-blue-600">*</span>
          </label>
          <input
            type="number"
            step="0.1"
            value={material.weight}
            onChange={(e) => onUpdate('weight', parseFloat(e.target.value) || 0)}
            className="w-full px-3 py-2 border-2 border-blue-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium"
            placeholder="0.0"
          />
          <p className="text-xs text-gray-500 mt-1">
            Cantidad de material que has usado para esta pieza
          </p>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Precio (€/kg)
          </label>
          <input
            type="number"
            step="0.01"
            value={material.pricePerKg}
            onChange={(e) => onUpdate('pricePerKg', parseFloat(e.target.value) || 0)}
            disabled={isPresetLoaded}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
              isPresetLoaded 
                ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed' 
                : 'border-gray-300 bg-white'
            }`}
            placeholder="0.00"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Unidad
          </label>
          <select
            value={material.unit}
            onChange={(e) => onUpdate('unit', e.target.value)}
            disabled={isPresetLoaded}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
              isPresetLoaded 
                ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed' 
                : 'border-gray-300 bg-white'
            }`}
          >
            <option value="g">Gramos (g)</option>
            <option value="kg">Kilogramos (kg)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Tipo de material
          </label>
          <input
            type="text"
            value={material.materialType}
            onChange={(e) => onUpdate('materialType', e.target.value)}
            disabled={isPresetLoaded}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
              isPresetLoaded 
                ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed' 
                : 'border-gray-300 bg-white'
            }`}
            placeholder="PLA, ABS, PETG..."
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Color
          </label>
          <input
            type="color"
            value={material.color || '#808080'}
            onChange={(e) => handleColorChange(e.target.value)}
            disabled={isPresetLoaded}
            className={`w-full h-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
              isPresetLoaded 
                ? 'border-gray-200 bg-gray-50 cursor-not-allowed opacity-50' 
                : 'border-gray-300 bg-white cursor-pointer'
            }`}
            title={isPresetLoaded ? "Color del preset (no editable)" : "Seleccionar color"}
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-gray-700 mb-1">
            Marca
          </label>
          <input
            type="text"
            value={material.brand || ''}
            onChange={(e) => onUpdate('brand', e.target.value)}
            disabled={isPresetLoaded}
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm ${
              isPresetLoaded 
                ? 'border-gray-200 bg-gray-50 text-gray-500 cursor-not-allowed' 
                : 'border-gray-300 bg-white'
            }`}
            placeholder="Prusament, eSUN, Sunlu..."
          />
        </div>
      </div>

      {/* Resumen del material */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="text-xs font-medium text-blue-700 mb-1">Peso total</div>
            <div className="text-sm font-bold text-blue-900">
              {material.weight.toFixed(1)}{material.unit}
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <div className="text-xs font-medium text-green-700 mb-1">Coste</div>
            <div className="text-sm font-bold text-green-900">
              {((material.weight / (material.unit === 'kg' ? 1 : 1000)) * material.pricePerKg).toFixed(2)}€
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PieceMaterialsSection: React.FC<PieceMaterialsSectionProps> = ({
  materials,
  onAddMaterial,
  onUpdateMaterial,
  onRemoveMaterial,
  onNavigateToSettings,
  onSyncPieceFields,
  onSaveAsPreset
}) => {
  const totalWeight = materials.reduce((sum, material) => {
    const weightInGrams = material.unit === 'kg' ? material.weight * 1000 : material.weight;
    return sum + weightInGrams;
  }, 0);

  const totalCost = materials.reduce((sum, material) => {
    const weightInKg = material.unit === 'g' ? material.weight / 1000 : material.weight;
    return sum + (weightInKg * material.pricePerKg);
  }, 0);

  // Determinar la mejor unidad para mostrar el peso total
  const displayWeight = totalWeight >= 1000 ? (totalWeight / 1000).toFixed(2) : totalWeight.toFixed(1);
  const displayUnit = totalWeight >= 1000 ? 'kg' : 'g';

  // Sincronizar automáticamente los campos de la pieza cuando cambien los materiales
  useEffect(() => {
    if (onSyncPieceFields) {
      onSyncPieceFields(totalWeight, totalCost);
    }
  }, [totalWeight, totalCost]); // Removemos onSyncPieceFields de las dependencias

  return (
    <div className="space-y-4">

      {/* Lista de materiales */}
      {materials.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <h5 className="text-lg font-semibold text-gray-900 mb-2">No hay materiales añadidos</h5>
          <p className="text-gray-600 mb-4 max-w-sm mx-auto">
            Añade el primer material para comenzar a desglosar los costes de esta pieza
          </p>
          <button
            onClick={onAddMaterial}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Añadir primer material
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {materials.map((material) => (
            <MaterialCard
              key={material.id}
              material={material}
              onUpdate={(field, value) => onUpdateMaterial(material.id, field, value)}
              onRemove={() => onRemoveMaterial(material.id)}
              onNavigateToSettings={onNavigateToSettings}
              onSaveAsPreset={onSaveAsPreset}
            />
          ))}
        </div>
      )}

      {/* Resumen total */}
      {materials.length > 0 && (
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <h5 className="font-semibold text-gray-900 mb-3">Resumen de materiales</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
              <div className="text-sm font-medium text-blue-700 mb-1">Peso total</div>
              <div className="text-lg font-bold text-blue-900">
                {displayWeight}{displayUnit}
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-3 border border-green-100">
              <div className="text-sm font-medium text-green-700 mb-1">Coste total</div>
              <div className="text-lg font-bold text-green-900">
                {totalCost.toFixed(2)}€
              </div>
            </div>
            <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
              <div className="text-sm font-medium text-purple-700 mb-1">Materiales</div>
              <div className="text-lg font-bold text-purple-900">
                {materials.length}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PieceMaterialsSection;
