import React, { useState } from 'react';
import { FileText, Plus, Trash2, Bookmark, Settings, Loader2, ChevronDown, ChevronUp } from 'lucide-react';
import type { MaterialsSectionProps } from '../types';
import { usePostprocessingPresets } from '@/hooks/usePostprocessingPresets';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import type { PostprocessingItem } from '@/types';

// Unidades disponibles (debe coincidir con PostprocessingPresetsManager)
const UNITS = [
  'unidad',
  'hora',
  'ml',
  'g',
  'kg',
  'm²',
  'm',
  'pieza'
];

interface ExtendedMaterialsSectionProps extends MaterialsSectionProps {
  postprocessingItems?: PostprocessingItem[];
  onAddPostprocessingItem?: () => void;
  onUpdatePostprocessingItem?: (id: string, field: keyof PostprocessingItem, value: string | number) => void;
  onRemovePostprocessingItem?: (id: string) => void;
  onLoadPreset?: (presetId: string) => void;
  onNavigateToSettings?: () => void;
  onSaveAsPreset?: (item: PostprocessingItem) => void;
}

const MaterialsSection: React.FC<ExtendedMaterialsSectionProps> = ({
  materials,
  onAddMaterial,
  onUpdateMaterial,
  onRemoveMaterial,
  postprocessingItems = [],
  onAddPostprocessingItem,
  onUpdatePostprocessingItem,
  onRemovePostprocessingItem,
  onLoadPreset,
  onNavigateToSettings,
  onSaveAsPreset
}) => {
  const { presets, loading: presetsLoading } = usePostprocessingPresets();
  const { formatCurrency, currencySymbol } = useFormatCurrency();
  const [showPresets, setShowPresets] = useState(false);
  const [showLegacyMaterials, setShowLegacyMaterials] = useState(materials.length > 0);

  // Usar postprocessingItems si están disponibles, sino usar materials (legacy)
  const usePostprocessing = postprocessingItems.length > 0 || (onAddPostprocessingItem !== undefined);
  const items = usePostprocessing ? postprocessingItems : materials.map(m => ({
    id: m.id,
    name: m.name,
    cost_per_unit: m.price, // Para legacy, el price se trata como coste unitario
    quantity: 1,
    unit: 'unidad',
    preset_id: null,
    is_from_preset: false
  } as PostprocessingItem));

  const handleAddItem = () => {
    if (usePostprocessing && onAddPostprocessingItem) {
      onAddPostprocessingItem();
    } else {
      onAddMaterial();
    }
  };

  const handleUpdateItem = (id: string, field: 'name' | 'cost_per_unit' | 'quantity' | 'unit', value: string | number) => {
    if (usePostprocessing && onUpdatePostprocessingItem) {
      onUpdatePostprocessingItem(id, field as keyof PostprocessingItem, value);
    } else {
      if (field === 'name' || field === 'cost_per_unit') {
        onUpdateMaterial(id, field === 'name' ? 'name' : 'price', value);
      }
    }
  };

  const handleRemoveItem = (id: string) => {
    if (usePostprocessing && onRemovePostprocessingItem) {
      onRemovePostprocessingItem(id);
    } else {
      onRemoveMaterial(id);
    }
  };

  const handleLoadPreset = (presetId: string) => {
    if (onLoadPreset) {
      onLoadPreset(presetId);
      setShowPresets(false);
    }
  };

  const handleSaveAsPreset = (item: PostprocessingItem) => {
    if (onSaveAsPreset) {
      onSaveAsPreset(item);
    }
  };

  // Calcular total de postprocessing (coste_unitario * cantidad)
  const totalPostprocessingCost = items.reduce((sum, item) => {
    return sum + (item.cost_per_unit * (item.quantity || 1));
  }, 0);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 hover:shadow-xl transition-shadow duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <FileText className="w-5 h-5 text-green-500 mr-2" />
          <h2 className="text-xl font-semibold text-gray-900">Costes de Postproducción</h2>
        </div>
        <div className="flex gap-2">
          {presets.length > 0 && (
            <button
              onClick={() => setShowPresets(!showPresets)}
              className="px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 text-sm font-medium flex items-center gap-1"
              title="Cargar preset"
            >
              <Bookmark className="w-4 h-4" />
              {showPresets ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          )}
          {onNavigateToSettings && (
            <button
              onClick={onNavigateToSettings}
              className="px-3 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors duration-200 text-sm font-medium flex items-center gap-1"
              title="Gestionar presets"
            >
              <Settings className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={handleAddItem}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors duration-200 text-sm font-medium"
          >
            <Plus className="w-4 h-4 inline mr-1" />
            Añadir
          </button>
        </div>
      </div>

      {/* Lista de presets disponibles */}
      {showPresets && presets.length > 0 && (
        <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
          <div className="text-sm font-medium text-blue-900 mb-2">Cargar preset:</div>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {presetsLoading ? (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="w-5 h-5 animate-spin text-blue-500" />
              </div>
            ) : (
              presets.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handleLoadPreset(preset.id)}
                  className="w-full text-left px-3 py-2 bg-white rounded border border-blue-200 hover:bg-blue-100 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="font-medium text-sm text-gray-900">{preset.name}</div>
                    {preset.description && (
                      <div className="text-xs text-gray-600">{preset.description}</div>
                    )}
                    <div className="text-xs text-gray-500">
                      {formatCurrency(preset.cost_per_unit)} / {preset.unit}
                      {preset.category && ` • ${preset.category}`}
                    </div>
                  </div>
                  {preset.is_default && (
                    <span className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded">Favorito</span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {/* Lista de items de postproducción */}
      <div className="space-y-4">
        {items.map((item) => (
          <div key={item.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
            {/* Fila 1: Nombre */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Nombre</label>
              <input
                type="text"
                placeholder="Nombre del item"
                value={item.name}
                onChange={(e) => handleUpdateItem(item.id, 'name', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>
            
            {/* Fila 2: Cantidad, Unidad y Coste en horizontal */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cantidad</label>
                <input
                  type="number"
                  placeholder="1"
                  value={item.quantity || 1}
                  onChange={(e) => handleUpdateItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  min="0.01"
                  step="0.01"
                />
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Unidad</label>
                <select
                  value={item.unit || 'unidad'}
                  onChange={(e) => handleUpdateItem(item.id, 'unit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                >
                  {UNITS.map(unit => (
                    <option key={unit} value={unit}>{unit}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Coste unitario</label>
                <input
                  type="number"
                  placeholder={`${currencySymbol}0.00`}
                  value={item.cost_per_unit || ''}
                  onChange={(e) => handleUpdateItem(item.id, 'cost_per_unit', parseFloat(e.target.value) || 0)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
                  min="0"
                  step="0.01"
                />
              </div>
            </div>
            
            {/* Mostrar coste total calculado */}
            <div className="flex justify-between items-center pt-2 border-t border-gray-200">
              <span className="text-sm font-medium text-gray-700">Coste total:</span>
              <span className="text-sm font-bold text-gray-900">
                {formatCurrency((item.cost_per_unit || 0) * (item.quantity || 1))}
              </span>
            </div>
            
            {/* Fila 3: Botones de acción */}
            <div className="flex gap-2 justify-end">
            </div>
            
            {/* Fila 3: Botones de acción */}
            <div className="flex gap-2 justify-end">
              {onSaveAsPreset && !item.is_from_preset && (
                <button
                  onClick={() => handleSaveAsPreset(item)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm flex items-center gap-2"
                  title="Guardar como preset"
                >
                  <Bookmark className="w-4 h-4" />
                  Guardar como preset
                </button>
              )}
              <button
                onClick={() => handleRemoveItem(item.id)}
                className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-200 text-sm flex items-center gap-2"
                title="Eliminar"
              >
                <Trash2 className="w-4 h-4" />
                Eliminar
              </button>
            </div>
          </div>
        ))}
        {items.length === 0 && (
          <p className="text-gray-500 text-sm text-center py-4">No hay items de postproducción añadidos</p>
        )}
      </div>

      {/* Total de postproducción */}
      {items.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <span className="text-lg font-semibold text-gray-900">Total postproducción:</span>
            <span className="text-xl font-bold text-gray-900">{formatCurrency(totalPostprocessingCost)}</span>
          </div>
        </div>
      )}

      {/* Mostrar materiales legacy si existen */}
      {!usePostprocessing && materials.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Materiales Adicionales (Legacy)</span>
            <button
              onClick={() => setShowLegacyMaterials(!showLegacyMaterials)}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              {showLegacyMaterials ? 'Ocultar' : 'Mostrar'}
            </button>
          </div>
          {showLegacyMaterials && (
            <div className="space-y-2">
              {materials.map((material) => (
                <div key={material.id} className="flex justify-between items-center py-2 px-3 bg-yellow-50 rounded border border-yellow-200">
                  <span className="text-sm text-gray-700">{material.name}</span>
                  <span className="text-sm font-medium text-gray-900">{formatCurrency(material.price)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default MaterialsSection;
