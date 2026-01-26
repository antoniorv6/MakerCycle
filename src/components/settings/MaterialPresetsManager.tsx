import React, { useState } from 'react';
import { Plus, Trash2, Star, Edit2, X, Check, Package, Filter } from 'lucide-react';
import { useMaterialPresets } from '@/hooks/useMaterialPresets';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import type { DatabaseMaterialPreset } from '@/types';

const MATERIAL_TYPES = {
  filament: ['PLA', 'ABS', 'PETG', 'TPU', 'ASA', 'Nylon', 'PC', 'PVA', 'HIPS', 'Otro'],
  resin: ['Resina Estándar', 'Resina Flexible', 'Resina Transparente', 'Resina de Alta Temperatura', 'Resina Dental', 'Otro']
};

const UNITS = {
  filament: ['kg', 'g'],
  resin: ['ml', 'l']
};

export default function MaterialPresetsManager() {
  const [selectedCategory, setSelectedCategory] = useState<'filament' | 'resin'>('filament');
  const [showTypeSelector, setShowTypeSelector] = useState(false);
  const { presets, loading, addPreset, updatePreset, removePreset, setAsDefault, stats } = useMaterialPresets();
  const { currencySymbol } = useFormatCurrency();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  // Estado local para input numérico (permite que esté vacío)
  const [priceInput, setPriceInput] = useState<string>('');


  const [formData, setFormData] = useState<Omit<DatabaseMaterialPreset, 'id' | 'user_id' | 'created_at' | 'updated_at'>>({
    name: '',
    price_per_unit: 25,
    unit: 'kg',
    material_type: 'PLA',
    category: 'filament',
    color: '#FFFFFF',
    brand: '',
    notes: '',
    is_default: false,
    team_id: null,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      price_per_unit: 25,
      unit: 'kg',
      material_type: 'PLA',
      category: 'filament',
      color: '#FFFFFF',
      brand: '',
      notes: '',
      is_default: false,
      team_id: null,
    });
    setPriceInput('');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleCategoryChange = (category: 'filament' | 'resin') => {
    setSelectedCategory(category);
    setFormData(prev => ({
      ...prev,
      category,
      material_type: MATERIAL_TYPES[category][0],
      unit: UNITS[category][0],
    }));
  };

  const handleStartAdding = () => {
    setShowTypeSelector(true);
  };

  const handleTypeSelection = (type: 'filament' | 'resin') => {
    setSelectedCategory(type);
    setFormData(prev => ({
      ...prev,
      category: type,
      material_type: MATERIAL_TYPES[type][0],
      unit: UNITS[type][0],
    }));
    setShowTypeSelector(false);
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

    // Guardar el preset tal cual, sin conversiones
    // El precio se guarda tal como lo introduce el usuario
    if (editingId) {
      const success = await updatePreset(editingId, formData);
      if (success) {
        resetForm();
      }
    } else {
      const newPreset = await addPreset(formData);
      if (newPreset) {
        resetForm();
      }
    }
  };

  const handleEdit = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      // Cargar el preset tal cual, sin conversiones
      setFormData({
        name: preset.name,
        price_per_unit: preset.price_per_unit,
        unit: preset.unit,
        material_type: preset.material_type,
        category: preset.category,
        color: preset.color || '#FFFFFF',
        brand: preset.brand || '',
        notes: preset.notes || '',
        is_default: preset.is_default,
        team_id: preset.team_id || null,
      });
      setPriceInput(preset.price_per_unit?.toString() || '');
      setEditingId(presetId);
      setIsAdding(false);
      setSelectedCategory(preset.category);
    }
  };

  const handleDelete = async (presetId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este preset?')) {
      await removePreset(presetId);
    }
  };

  const handleSetDefault = async (presetId: string) => {
    await setAsDefault(presetId);
  };

  const filteredPresets = presets.filter(preset => preset.category === selectedCategory);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-20 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Package className="w-6 h-6 text-purple-600" />
            Perfiles de Materiales
          </h2>
          <p className="text-gray-600 mt-1">
            Guarda tus materiales favoritos para acceder rápidamente a sus precios
          </p>
        </div>
        {!isAdding && !editingId && !showTypeSelector && (
          <button
            onClick={handleStartAdding}
            className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Perfil
          </button>
        )}
      </div>

      {/* Type Selector */}
      {showTypeSelector && (
        <div className="mb-6 p-6 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 text-center">
            ¿Qué tipo de material quieres crear?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => handleTypeSelection('filament')}
              className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200 group"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-200 transition-colors">
                  <Package className="w-8 h-8 text-blue-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Filamento</h4>
                <p className="text-sm text-gray-600 mb-3">
                  PLA, ABS, PETG, TPU y otros filamentos para impresión 3D
                </p>
                <div className="text-xs text-gray-500">
                  Unidades: kg, g
                </div>
              </div>
            </button>
            
            <button
              onClick={() => handleTypeSelection('resin')}
              className="p-6 bg-white rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:shadow-lg transition-all duration-200 group"
            >
              <div className="text-center">
                <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-purple-200 transition-colors">
                  <Package className="w-8 h-8 text-purple-600" />
                </div>
                <h4 className="text-lg font-semibold text-gray-900 mb-2">Resina</h4>
                <p className="text-sm text-gray-600 mb-3">
                  Resinas estándar, flexibles, transparentes y especializadas
                </p>
                <div className="text-xs text-gray-500">
                  Unidades: ml, l
                </div>
              </div>
            </button>
          </div>
          <div className="text-center mt-4">
            <button
              onClick={() => setShowTypeSelector(false)}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Category Filter */}
      {!showTypeSelector && (
        <div className="mb-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-500" />
            <span className="font-medium text-gray-700">Tipo de material:</span>
          </div>
          <div className="flex gap-2">
            {[
              { id: 'filament', label: 'Filamentos', count: stats.byCategory.filament || 0 },
              { id: 'resin', label: 'Resinas', count: stats.byCategory.resin || 0 },
            ].map(({ id, label, count }) => (
              <button
                key={id}
                onClick={() => handleCategoryChange(id as 'filament' | 'resin')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors border ${
                  selectedCategory === id
                    ? 'bg-purple-600 text-white border-purple-600'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Form for adding/editing preset */}
      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <h3 className="font-semibold text-gray-900 mb-4">
            {editingId ? 'Editar Perfil' : `Nuevo Perfil de ${selectedCategory === 'filament' ? 'Filamento' : 'Resina'}`}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Perfil *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ej: PLA Blanco Básico"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio por {formData.unit} ({currencySymbol}) *
              </label>
              <input
                type="number"
                step="0.01"
                value={priceInput !== undefined && priceInput !== null ? priceInput : (formData.price_per_unit?.toString() || '')}
                onChange={(e) => {
                  const value = e.target.value;
                  setPriceInput(value);
                  // Only update parent if we have a valid number
                  if (value !== '' && value !== '-' && value !== '.') {
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue)) {
                      setFormData({ ...formData, price_per_unit: numValue });
                    }
                  }
                }}
                onBlur={(e) => {
                  const value = priceInput;
                  if (value === '' || value === '-' || value === '.') {
                    setPriceInput('0');
                    setFormData({ ...formData, price_per_unit: 0 });
                  } else {
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue)) {
                      setPriceInput(numValue.toString());
                      setFormData({ ...formData, price_per_unit: numValue });
                    } else {
                      setPriceInput('0');
                      setFormData({ ...formData, price_per_unit: 0 });
                    }
                  }
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder={formData.category === 'resin' ? '50.00' : '25.00'}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Unidad *
              </label>
              <select
                value={formData.unit}
                onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {UNITS[formData.category].map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tipo de Material *
              </label>
              <select
                value={formData.material_type}
                onChange={(e) => setFormData({ ...formData, material_type: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                {MATERIAL_TYPES[formData.category].map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Ej: Prusament, eSun, etc."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Color
              </label>
              <div className="flex gap-2">
                <input
                  type="color"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="w-16 h-10 border border-gray-300 rounded-lg cursor-pointer"
                />
                <input
                  type="text"
                  value={formData.color}
                  onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="#FFFFFF"
                />
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="Notas adicionales sobre este material..."
                rows={2}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="is_default"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
            />
            <label htmlFor="is_default" className="text-sm font-medium text-gray-700">
              Usar como perfil predeterminado para {formData.category === 'filament' ? 'filamentos' : formData.category === 'resin' ? 'resinas' : 'otros materiales'}
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Check className="w-4 h-4" />
              {editingId ? 'Guardar Cambios' : 'Crear Perfil'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors shadow-sm"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* List of presets */}
      {filteredPresets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tienes perfiles de {selectedCategory === 'filament' ? 'filamentos' : 'resinas'}
          </h3>
          <p className="text-gray-600 mb-4">
            Crea tu primer perfil de {selectedCategory === 'filament' ? 'filamento' : 'resina'} para acceder rápidamente a tus materiales favoritos
          </p>
          {!isAdding && !showTypeSelector && (
            <button
              onClick={handleStartAdding}
              className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Crear Primer Perfil
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredPresets.map((preset) => (
            <div
              key={preset.id}
              className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-gray-900 text-lg">{preset.name}</h3>
                    {preset.is_default && (
                      <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">
                        <Star className="w-3 h-3 fill-current" />
                        Por defecto
                      </span>
                    )}
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                      {preset.category === 'filament' ? 'Filamento' : preset.category === 'resin' ? 'Resina' : 'Otro'}
                    </span>
                    {preset.color && (
                      <span
                        className="inline-block w-6 h-6 rounded-full border-2 border-gray-300"
                        style={{ backgroundColor: preset.color }}
                        title={`Color: ${preset.color}`}
                      />
                    )}
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Precio:</span>
                      <span className="ml-2 font-medium text-purple-600">
                        {preset.price_per_unit.toFixed(2)}{currencySymbol}/{preset.unit}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500">Tipo:</span>
                      <span className="ml-2 font-medium">{preset.material_type}</span>
                    </div>
                    {preset.brand && (
                      <div>
                        <span className="text-gray-500">Marca:</span>
                        <span className="ml-2 font-medium">{preset.brand}</span>
                      </div>
                    )}
                  </div>

                  {preset.notes && (
                    <p className="mt-2 text-sm text-gray-600 italic">{preset.notes}</p>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  {!preset.is_default && (
                    <button
                      onClick={() => handleSetDefault(preset.id)}
                      className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                      title="Establecer como predeterminado"
                    >
                      <Star className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(preset.id)}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(preset.id)}
                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info section */}
      <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex items-start gap-3">
          <Package className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-blue-900">
            <h4 className="font-medium mb-1">💡 Consejos sobre perfiles</h4>
            <ul className="space-y-1 text-blue-700">
              <li>• Los perfiles te permiten seleccionar rápidamente el precio de tus materiales favoritos</li>
              <li>• Puedes establecer un perfil como predeterminado para cada categoría (filamentos, resinas, etc.)</li>
              <li>• Los perfiles son accesibles desde el calculadora de costes con el icono ✨</li>
              <li>• Organiza tus materiales por categorías para una mejor gestión</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
