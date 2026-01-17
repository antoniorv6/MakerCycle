import React, { useState } from 'react';
import { Plus, Trash2, Star, Edit2, X, Check, Paintbrush, Filter } from 'lucide-react';
import { usePostprocessingPresets } from '@/hooks/usePostprocessingPresets';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import type { DatabasePostprocessingPreset } from '@/types';

const CATEGORIES = [
  'Pintura',
  'Uso de Máquinas',
  'Consumibles',
  'Mano de Obra',
  'Acabados',
  'Otro'
];

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

export default function PostprocessingPresetsManager() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { presets, loading, addPreset, updatePreset, removePreset, setAsDefault, stats } = usePostprocessingPresets();
  const { formatCurrency, currencySymbol } = useFormatCurrency();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<DatabasePostprocessingPreset, 'id' | 'user_id' | 'created_at' | 'updated_at'>>({
    name: '',
    description: '',
    cost_per_unit: 0,
    unit: 'unidad',
    category: undefined,
    notes: '',
    is_default: false,
    team_id: null,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      cost_per_unit: 0,
      unit: 'unidad',
      category: undefined,
      notes: '',
      is_default: false,
      team_id: null,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleCategoryChange = (category: string | null) => {
    setSelectedCategory(category);
  };

  const handleStartAdding = () => {
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      return;
    }

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
      setFormData({
        name: preset.name,
        description: preset.description || '',
        cost_per_unit: preset.cost_per_unit,
        unit: preset.unit,
        category: preset.category || undefined,
        notes: preset.notes || '',
        is_default: preset.is_default,
        team_id: preset.team_id || null,
      });
      setEditingId(presetId);
      setIsAdding(false);
      setSelectedCategory(preset.category || null);
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

  const filteredPresets = selectedCategory
    ? presets.filter(preset => preset.category === selectedCategory)
    : presets;

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
            <Paintbrush className="w-6 h-6 text-green-600" />
            Presets de Postproducción
          </h2>
          <p className="text-gray-600 mt-1">
            Guarda tus costes de postproducción favoritos (pintura, máquinas, etc.)
          </p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={handleStartAdding}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Preset
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-gray-500" />
          <span className="font-medium text-gray-700">Categoría:</span>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleCategoryChange(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              selectedCategory === null
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todas ({stats.total})
          </button>
          {CATEGORIES.map((category) => {
            const count = stats.byCategory[category] || 0;
            return (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedCategory === category
                    ? 'bg-green-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Form for adding/editing preset */}
      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h3 className="font-semibold text-gray-900 mb-4">
            {editingId ? 'Editar Preset' : 'Nuevo Preset de Postproducción'}
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Preset *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Ej: Pintura Acrílica Blanca"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Coste por {formData.unit} *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.cost_per_unit}
                onChange={(e) => setFormData({ ...formData, cost_per_unit: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder={`${currencySymbol}0.00`}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                {UNITS.map(unit => (
                  <option key={unit} value={unit}>{unit}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Categoría
              </label>
              <select
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value || undefined })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
              >
                <option value="">Sin categoría</option>
                {CATEGORIES.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Descripción
              </label>
              <textarea
                value={formData.description || ''}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={2}
                placeholder="Descripción opcional del preset"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                value={formData.notes || ''}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                rows={2}
                placeholder="Notas adicionales"
              />
            </div>

            <div className="md:col-span-2">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={formData.is_default}
                  onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                  className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                />
                <span className="text-sm text-gray-700">Marcar como favorito</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {editingId ? 'Guardar Cambios' : 'Crear Preset'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors flex items-center gap-2"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Presets List */}
      <div className="space-y-3">
        {filteredPresets.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Paintbrush className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No hay presets de postproducción</p>
            {!isAdding && (
              <button
                onClick={handleStartAdding}
                className="mt-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Crear tu primer preset
              </button>
            )}
          </div>
        ) : (
          filteredPresets.map((preset) => (
            <div
              key={preset.id}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-green-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{preset.name}</h3>
                    {preset.is_default && (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                  </div>
                  {preset.description && (
                    <p className="text-sm text-gray-600 mb-2">{preset.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    <span>
                      <strong className="text-gray-900">{formatCurrency(preset.cost_per_unit)}</strong> / {preset.unit}
                    </span>
                    {preset.category && (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        {preset.category}
                      </span>
                    )}
                  </div>
                  {preset.notes && (
                    <p className="text-xs text-gray-500 mt-2">{preset.notes}</p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {!preset.is_default && (
                    <button
                      onClick={() => handleSetDefault(preset.id)}
                      className="p-2 text-gray-400 hover:text-yellow-500 transition-colors"
                      title="Marcar como favorito"
                    >
                      <Star className="w-5 h-5" />
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(preset.id)}
                    className="p-2 text-gray-400 hover:text-blue-500 transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(preset.id)}
                    className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
