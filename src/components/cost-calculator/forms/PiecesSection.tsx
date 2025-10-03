import React, { useState } from 'react';
import { Plus, Copy, Trash2, Package, Edit3, Save, Heart, Bookmark, Settings } from 'lucide-react';
import type { PiecesSectionProps, PieceCardProps } from '../types';
import { useMaterialPresets } from '@/hooks/useMaterialPresets';

const PieceCard: React.FC<PieceCardProps & { onNavigateToSettings?: () => void }> = ({ 
  piece, 
  onUpdate, 
  onRemove, 
  onDuplicate, 
  isFirst,
  onNavigateToSettings
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(piece.name);
  const { presets, loading: presetsLoading, convertPrice } = useMaterialPresets();
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

      {/* Formulario */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Peso filamento (g)
          </label>
          <input
            type="number"
            step="0.1"
            value={piece.filamentWeight}
            onChange={(e) => onUpdate('filamentWeight', parseFloat(e.target.value) || 0)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="0.0"
          />
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Precio filamento (€/kg)
          </label>
          <div className="relative">
            <input
              type="number"
              step="0.01"
              value={piece.filamentPrice}
              onChange={(e) => onUpdate('filamentPrice', parseFloat(e.target.value) || 0)}
              className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="0.00"
            />
            <button
              type="button"
              onClick={() => setShowPresetSelector(!showPresetSelector)}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-purple-600 hover:bg-purple-50 rounded-lg transition-colors group"
              title="Seleccionar perfil de material"
              disabled={presetsLoading || presets.length === 0}
            >
              <Bookmark className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
          
          {/* Material Profile Selector Dropdown */}
          {showPresetSelector && presets.length > 0 && (
            <div className="absolute z-20 mt-2 w-full max-w-lg bg-white border border-gray-200 rounded-xl shadow-xl">
              {/* Header */}
              <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl">
                <h4 className="font-semibold text-gray-900 text-sm flex items-center gap-2">
                  <Bookmark className="w-4 h-4 text-purple-600" />
                  Perfiles de Materiales
                </h4>
                <p className="text-xs text-gray-600 mt-1">Selecciona un perfil para aplicar su precio</p>
              </div>

              {/* Category Tabs */}
              <div className="p-3 border-b border-gray-100">
                <div className="flex bg-gray-100 rounded-lg p-1">
                  <button
                    onClick={() => setSelectedPresetCategory('filament')}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                      selectedPresetCategory === 'filament'
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    Filamentos
                  </button>
                  <button
                    onClick={() => setSelectedPresetCategory('resin')}
                    className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
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
              <div className="max-h-80 overflow-y-auto">
                {filteredPresets.length > 0 ? (
                  filteredPresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset.id)}
                      className="w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 group"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h5 className="font-semibold text-gray-900 truncate group-hover:text-purple-700 transition-colors">
                              {preset.name}
                            </h5>
                            {preset.is_default && (
                              <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                                <Heart className="w-3 h-3 fill-current" />
                                Favorito
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-600">
                            {preset.material_type}
                            {preset.brand && ` • ${preset.brand}`}
                            {preset.color && (
                              <span className="ml-2 inline-block w-3 h-3 rounded-full border border-gray-300" 
                                    style={{ backgroundColor: preset.color }}
                                    title={`Color: ${preset.color}`} />
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <div className="text-lg font-bold text-purple-600 group-hover:text-purple-700 transition-colors">
                            {preset.price_per_unit.toFixed(2)}€
                          </div>
                          <div className="text-xs text-gray-500">por {preset.unit}</div>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    <Package className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm">No hay perfiles de {selectedPresetCategory === 'filament' ? 'filamentos' : 'resinas'}</p>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 bg-gray-50 border-t border-gray-100 rounded-b-xl space-y-2">
                <button
                  onClick={handleManageProfiles}
                  className="w-full px-4 py-3 text-sm text-purple-700 hover:text-purple-800 hover:bg-purple-50 rounded-lg transition-colors font-medium flex items-center justify-center gap-2 border border-purple-200 hover:border-purple-300"
                >
                  <Settings className="w-4 h-4" />
                  Gestionar materiales
                </button>
                <button
                  onClick={() => setShowPresetSelector(false)}
                  className="w-full px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors font-medium"
                >
                  Cancelar
                </button>
              </div>
            </div>
          )}
          
        </div>

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

        <div className="md:col-span-2 lg:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notas (opcional)
          </label>
          <input
            type="text"
            value={piece.notes || ''}
            onChange={(e) => onUpdate('notes', e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
            placeholder="Descripción, especificaciones, observaciones..."
          />
        </div>
      </div>

      {/* Resumen de la pieza */}
      <div className="mt-6 pt-6 border-t border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
            <div className="text-sm font-medium text-blue-700 mb-1">Peso total</div>
            <div className="text-lg font-bold text-blue-900">
              {(piece.filamentWeight * piece.quantity).toFixed(1)}g
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-100">
            <div className="text-sm font-medium text-green-700 mb-1">Tiempo total</div>
            <div className="text-lg font-bold text-green-900">
              {(piece.printHours * piece.quantity).toFixed(1)}h
            </div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
            <div className="text-sm font-medium text-purple-700 mb-1">Coste filamento</div>
            <div className="text-lg font-bold text-purple-900">
              {((piece.filamentWeight * piece.quantity * piece.filamentPrice) / 1000).toFixed(2)}€
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
  onNavigateToSettings
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