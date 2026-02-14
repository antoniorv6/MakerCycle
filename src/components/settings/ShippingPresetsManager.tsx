import React, { useState } from 'react';
import { Plus, Trash2, Star, Edit2, X, Check, Truck, Weight } from 'lucide-react';
import { useShippingPresets } from '@/hooks/useShippingPresets';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { SHIPPING_PROVIDER_TEMPLATES, DEFAULT_WEIGHT_TIERS } from '@/data/shippingProviderTemplates';
import type { ShippingPreset, ShippingWeightTier } from '@/types';

export default function ShippingPresetsManager() {
  const { presets, loading, addPreset, updatePreset, removePreset, setAsDefault } = useShippingPresets();
  const { formatCurrency, currencySymbol } = useFormatCurrency();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>('');

  const [formData, setFormData] = useState<Omit<ShippingPreset, 'id' | 'user_id' | 'created_at' | 'updated_at'>>({
    name: '',
    provider_name: '',
    is_custom_provider: false,
    weight_tiers: [...DEFAULT_WEIGHT_TIERS],
    notes: '',
    is_default: false,
    team_id: null,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      provider_name: '',
      is_custom_provider: false,
      weight_tiers: [...DEFAULT_WEIGHT_TIERS],
      notes: '',
      is_default: false,
      team_id: null,
    });
    setSelectedTemplateId('');
    setIsAdding(false);
    setEditingId(null);
  };

  const handleTemplateSelect = (templateId: string) => {
    setSelectedTemplateId(templateId);

    if (templateId === 'custom') {
      setFormData({
        ...formData,
        name: '',
        provider_name: '',
        is_custom_provider: true,
        weight_tiers: [...DEFAULT_WEIGHT_TIERS],
      });
      return;
    }

    const template = SHIPPING_PROVIDER_TEMPLATES.find(t => t.id === templateId);
    if (template) {
      setFormData({
        ...formData,
        name: template.name,
        provider_name: template.providerName,
        is_custom_provider: false,
        weight_tiers: template.weightTiers.map(t => ({ ...t })),
      });
    }
  };

  const handleTierChange = (index: number, field: keyof ShippingWeightTier, value: string) => {
    const numValue = parseFloat(value);
    if (isNaN(numValue) && value !== '') return;

    const newTiers = [...formData.weight_tiers];
    newTiers[index] = {
      ...newTiers[index],
      [field]: value === '' ? 0 : numValue,
    };
    setFormData({ ...formData, weight_tiers: newTiers });
  };

  const handleAddTier = () => {
    const lastTier = formData.weight_tiers[formData.weight_tiers.length - 1];
    const newTier: ShippingWeightTier = {
      min_weight: lastTier ? lastTier.max_weight : 0,
      max_weight: lastTier ? lastTier.max_weight + 10000 : 5000,
      price: 0,
    };
    setFormData({ ...formData, weight_tiers: [...formData.weight_tiers, newTier] });
  };

  const handleRemoveTier = (index: number) => {
    if (formData.weight_tiers.length <= 1) return;
    const newTiers = formData.weight_tiers.filter((_, i) => i !== index);
    setFormData({ ...formData, weight_tiers: newTiers });
  };

  const handleStartAdding = () => {
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim() || !formData.provider_name.trim()) return;

    // Validar que haya al menos un tramo con precio
    const hasValidTier = formData.weight_tiers.some(t => t.price > 0);
    if (!hasValidTier) return;

    if (editingId) {
      const success = await updatePreset(editingId, formData);
      if (success) resetForm();
    } else {
      const newPreset = await addPreset(formData);
      if (newPreset) resetForm();
    }
  };

  const handleEdit = (presetId: string) => {
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      setFormData({
        name: preset.name,
        provider_name: preset.provider_name,
        is_custom_provider: preset.is_custom_provider,
        weight_tiers: preset.weight_tiers.map(t => ({ ...t })),
        notes: preset.notes || '',
        is_default: preset.is_default,
        team_id: preset.team_id || null,
      });
      setSelectedTemplateId(preset.is_custom_provider ? 'custom' : '');
      setEditingId(presetId);
      setIsAdding(false);
    }
  };

  const handleDelete = async (presetId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este preset de envío?')) {
      await removePreset(presetId);
    }
  };

  const handleSetDefault = async (presetId: string) => {
    await setAsDefault(presetId);
  };

  // Formatear peso de gramos a kg para mostrar
  const formatWeight = (grams: number): string => {
    return (grams / 1000).toFixed(0);
  };

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

  const nationalTemplates = SHIPPING_PROVIDER_TEMPLATES.filter(t => t.category === 'national');
  const internationalTemplates = SHIPPING_PROVIDER_TEMPLATES.filter(t => t.category === 'international');

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-blue-600" />
            Presets de Envío
          </h2>
          <p className="text-gray-600 mt-1">
            Configura proveedores de envío con tarifas por tramos de peso
          </p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={handleStartAdding}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nuevo Preset
          </button>
        )}
      </div>

      {/* Form for adding/editing preset */}
      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-gray-900 mb-4">
            {editingId ? 'Editar Preset de Envío' : 'Nuevo Preset de Envío'}
          </h3>

          {/* Template selector (only when adding new) */}
          {!editingId && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Selecciona un proveedor
              </label>
              <select
                value={selectedTemplateId}
                onChange={(e) => handleTemplateSelect(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">-- Seleccionar proveedor --</option>
                <optgroup label="Nacionales (España)">
                  {nationalTemplates.map(t => (
                    <option key={t.id} value={t.id}>{t.name} - {t.description}</option>
                  ))}
                </optgroup>
                <optgroup label="Internacionales">
                  {internationalTemplates.map(t => (
                    <option key={t.id} value={t.id}>{t.name} - {t.description}</option>
                  ))}
                </optgroup>
                <optgroup label="Otro">
                  <option value="custom">Proveedor personalizado</option>
                </optgroup>
              </select>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Preset *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Correos Nacional Estándar"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del Proveedor *
              </label>
              <input
                type="text"
                value={formData.provider_name}
                onChange={(e) => setFormData({ ...formData, provider_name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ej: Correos"
                required
              />
            </div>
          </div>

          {/* Weight Tiers Editor */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
              <Weight className="w-4 h-4" />
              Tarifas por Tramo de Peso
            </label>
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_1fr_1fr_40px] gap-2 px-3 py-2 bg-gray-100 text-xs font-semibold text-gray-600 uppercase">
                <span>Peso mín (kg)</span>
                <span>Peso máx (kg)</span>
                <span>Precio ({currencySymbol})</span>
                <span></span>
              </div>
              {/* Tier rows */}
              <div className="divide-y divide-gray-100">
                {formData.weight_tiers.map((tier, index) => (
                  <div key={index} className="grid grid-cols-[1fr_1fr_1fr_40px] gap-2 px-3 py-2 items-center">
                    <input
                      type="number"
                      step="0.1"
                      value={tier.min_weight / 1000}
                      onChange={(e) => handleTierChange(index, 'min_weight', String(parseFloat(e.target.value || '0') * 1000))}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={tier.max_weight / 1000}
                      onChange={(e) => handleTierChange(index, 'max_weight', String(parseFloat(e.target.value || '0') * 1000))}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="number"
                      step="0.01"
                      value={tier.price || ''}
                      onChange={(e) => handleTierChange(index, 'price', e.target.value)}
                      className="w-full px-2 py-1 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0.00"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveTier(index)}
                      className="p-1 text-gray-400 hover:text-red-500 transition-colors disabled:opacity-30"
                      disabled={formData.weight_tiers.length <= 1}
                      title="Eliminar tramo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
            <button
              type="button"
              onClick={handleAddTier}
              className="mt-2 flex items-center gap-1 px-3 py-1.5 text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              Añadir tramo personalizado
            </button>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Notas
            </label>
            <textarea
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              rows={2}
              placeholder="Notas adicionales (zona, tipo de servicio, etc.)"
            />
          </div>

          <div className="mb-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={formData.is_default}
                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Marcar como favorito</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Check className="w-4 h-4" />
              {editingId ? 'Guardar Cambios' : 'Crear Preset'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-colors flex items-center gap-2 shadow-sm"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* Presets List */}
      <div className="space-y-3">
        {presets.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Truck className="w-12 h-12 mx-auto mb-4 text-gray-400" />
            <p>No hay presets de envío configurados</p>
            {!isAdding && (
              <button
                onClick={handleStartAdding}
                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Crear tu primer preset de envío
              </button>
            )}
          </div>
        ) : (
          presets.map((preset) => (
            <div
              key={preset.id}
              className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">{preset.name}</h3>
                    {preset.is_default && (
                      <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                    )}
                    {preset.is_custom_provider && (
                      <span className="px-2 py-0.5 bg-gray-200 text-gray-600 rounded text-xs">
                        Personalizado
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                    <span>Proveedor: <strong className="text-gray-900">{preset.provider_name}</strong></span>
                    <span>{preset.weight_tiers.length} tramos</span>
                  </div>
                  {/* Mini tariff summary */}
                  <div className="flex gap-2 flex-wrap">
                    {preset.weight_tiers.slice(0, 4).map((tier, i) => (
                      <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                        {formatWeight(tier.min_weight)}-{formatWeight(tier.max_weight)}kg: {formatCurrency(tier.price)}
                      </span>
                    ))}
                    {preset.weight_tiers.length > 4 && (
                      <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded text-xs">
                        +{preset.weight_tiers.length - 4} más
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
