import React, { useState, useCallback } from 'react';
import { Plus, Copy, Trash2, Package, Edit3, Save, Heart, Bookmark, Settings, Layers } from 'lucide-react';
import type { PiecesSectionProps, PieceCardProps, CostCalculatorPieceMaterial } from '../types';
import { useMaterialPresets } from '@/hooks/useMaterialPresets';
import PieceMaterialsSection from './PieceMaterialsSection';

const PieceCard: React.FC<PieceCardProps & { onNavigateToSettings?: () => void }> = ({ 
  piece, 
  onUpdate, 
  onRemove, 
  onDuplicate, 
  isFirst,
  onNavigateToSettings,
  onAddMaterial,
  onUpdateMaterial,
  onRemoveMaterial
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(piece.name);
  const { presets, loading: presetsLoading, convertPrice, createPresetFromMaterial } = useMaterialPresets();
  const [showPresetSelector, setShowPresetSelector] = useState(false);
  const [selectedPresetCategory, setSelectedPresetCategory] = useState<'filament' | 'resin'>('filament');

  const handleNameSave = () => {
    onUpdate('name', tempName);
    setIsEditingName(false);
  };

  const handleNameCancel = () => {
    setTempName(piece.name);
    setIsEditingName(false);
  };

  // Filtrar presets por categoría seleccionada
  const filteredPresets = presets.filter(preset => preset.category === selectedPresetCategory);

  const handlePresetSelect = (presetId: string) => {
    const selectedPreset = presets.find(p => p.id === presetId);
    if (selectedPreset) {
      // Convertir el precio a €/kg si es necesario
      let pricePerKg = selectedPreset.price_per_unit;
      if (selectedPreset.unit !== 'kg') {
        pricePerKg = convertPrice(selectedPreset.price_per_unit, selectedPreset.unit, 'kg');
      }
      onUpdate('filamentPrice', pricePerKg);
      setShowPresetSelector(false);
    }
  };

  const handleManageProfiles = () => {
    setShowPresetSelector(false);
    if (onNavigateToSettings) {
      onNavigateToSettings();
    }
  };


  // Calcular totales de materiales
  const totalWeight = piece.materials?.reduce((sum, material) => {
    const weightInGrams = material.unit === 'kg' ? material.weight * 1000 : material.weight;
    return sum + weightInGrams;
  }, 0) || 0;

  const totalCost = piece.materials?.reduce((sum, material) => {
    const weightInKg = material.unit === 'g' ? material.weight / 1000 : material.weight;
    return sum + (weightInKg * material.pricePerKg);
  }, 0) || 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
            <Package className="w-5 h-5 text-blue-600" />
          </div>
          <div className="flex-1">
            {isEditingName ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={tempName}
                  onChange={(e) => setTempName(e.target.value)}
                  className="text-lg font-semibold text-gray-900 bg-gray-50 border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                <button
                  onClick={handleNameSave}
                  className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                  title="Guardar nombre"
                >
                  <Save className="w-4 h-4" />
                </button>
                <button
                  onClick={handleNameCancel}
                  className="p-1 text-gray-500 hover:bg-gray-50 rounded transition-colors"
                  title="Cancelar"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h4 className="text-lg font-semibold text-gray-900">
                  {piece.name || 'Pieza sin nombre'}
                </h4>
                <button
                  onClick={() => setIsEditingName(true)}
                  className="p-1 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                  title="Editar nombre"
                >
                  <Edit3 className="w-4 h-4" />
                </button>
              </div>
            )}
            <p className="text-sm text-gray-500">
              {isFirst ? 'Pieza principal del proyecto' : 'Pieza adicional'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onDuplicate}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            title="Duplicar pieza"
          >
            <Copy className="w-4 h-4" />
          </button>
          {!isFirst && (
            <button
              onClick={onRemove}
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title="Eliminar pieza"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Sección de materiales - PRINCIPAL */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h5 className="text-md font-semibold text-gray-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-600" />
            Materiales de la pieza
          </h5>
          <button
            onClick={onAddMaterial}
            className="inline-flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium text-sm"
          >
            <Plus className="w-4 h-4" />
            Añadir material
          </button>
        </div>
        
        <PieceMaterialsSection
          materials={piece.materials || []}
          onAddMaterial={onAddMaterial}
          onUpdateMaterial={onUpdateMaterial}
          onRemoveMaterial={onRemoveMaterial}
          onNavigateToSettings={onNavigateToSettings}
          onSyncPieceFields={useCallback((totalWeight: number, totalCost: number) => {
            // Sincronizar automáticamente los campos de la pieza
            onUpdate('filamentWeight', totalWeight);
            onUpdate('filamentPrice', totalCost > 0 ? (totalCost / (totalWeight / 1000)) : 25);
          }, [onUpdate])}
          onSaveAsPreset={useCallback(async (material: CostCalculatorPieceMaterial) => {
            await createPresetFromMaterial(material);
          }, [createPresetFromMaterial])}
        />
      </div>

      {/* Información básica de la pieza */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Tiempo impresión (h)
          </label>
          <input
            type="number"
            step="0.1"
            value={piece.printHours}
            onChange={(e) => onUpdate('printHours', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="0.0"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cantidad
          </label>
          <input
            type="number"
            min="1"
            value={piece.quantity}
            onChange={(e) => onUpdate('quantity', parseInt(e.target.value) || 1)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="1"
          />
        </div>

        <div className="md:col-span-2 lg:col-span-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas (opcional)
          </label>
          <input
            type="text"
            value={piece.notes || ''}
            onChange={(e) => onUpdate('notes', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Descripción, especificaciones..."
          />
        </div>
      </div>

      {/* Resumen de la pieza */}
      <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
        <h5 className="font-semibold text-gray-900 mb-3">Resumen de la pieza</h5>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-100">
            <div className="text-sm font-medium text-blue-700 mb-1">Peso total</div>
            <div className="text-lg font-bold text-blue-900">
              {(totalWeight * piece.quantity).toFixed(1)}g
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-3 border border-green-100">
            <div className="text-sm font-medium text-green-700 mb-1">Tiempo total</div>
            <div className="text-lg font-bold text-green-900">
              {(piece.printHours * piece.quantity).toFixed(1)}h
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-3 border border-purple-100">
            <div className="text-sm font-medium text-purple-700 mb-1">Coste materiales</div>
            <div className="text-lg font-bold text-purple-900">
              {(totalCost * piece.quantity).toFixed(2)}€
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const PiecesSection: React.FC<PiecesSectionProps & { onNavigateToSettings?: () => void }> = ({
  pieces,
  onAddPiece,
  onUpdatePiece,
  onRemovePiece,
  onDuplicatePiece,
  onNavigateToSettings,
  onAddMaterialToPiece,
  onUpdatePieceMaterial,
  onRemovePieceMaterial
}) => {
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Piezas del proyecto</h3>
          <p className="text-gray-600">
            Gestiona las diferentes piezas que componen tu proyecto de impresión
          </p>
        </div>
        <button
          onClick={onAddPiece}
          className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          Añadir pieza
        </button>
      </div>

      {/* Contenido */}
      {pieces.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h4 className="text-xl font-semibold text-gray-900 mb-2">No hay piezas añadidas</h4>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Añade la primera pieza para comenzar a calcular los costes de tu proyecto de impresión 3D
          </p>
          <button
            onClick={onAddPiece}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors font-medium"
          >
            <Plus className="w-5 h-5" />
            Añadir primera pieza
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {pieces.map((piece, index) => (
            <PieceCard
              key={piece.id}
              piece={piece}
              onUpdate={(field, value) => onUpdatePiece(piece.id, field, value)}
              onRemove={() => onRemovePiece(piece.id)}
              onDuplicate={() => onDuplicatePiece(piece.id)}
              isFirst={index === 0}
              onNavigateToSettings={onNavigateToSettings}
              onAddMaterial={() => onAddMaterialToPiece(piece.id)}
              onUpdateMaterial={(materialId, field, value) => onUpdatePieceMaterial(piece.id, materialId, field, value)}
              onRemoveMaterial={(materialId) => onRemovePieceMaterial(piece.id, materialId)}
            />
          ))}
        </div>
      )}

      {/* Información adicional */}
      {pieces.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <Package className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <h4 className="font-medium text-blue-900 mb-1">Consejo sobre piezas</h4>
              <p className="text-sm text-blue-700">
                Puedes duplicar piezas similares para ahorrar tiempo. Cada pieza puede tener su propio nombre, 
                cantidad y especificaciones. Los totales se calculan automáticamente sumando todas las piezas.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PiecesSection; 