import React, { useState } from 'react';
import { Plus, Trash2, Star, Edit2, X, Check, Printer, Zap, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import { usePrinterPresets } from '@/hooks/usePrinterPresets';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import type { DatabasePrinterPreset } from '@/types';

export default function PrinterPresetsManager() {
  const { presets, loading, addPreset, updatePreset, removePreset, setAsDefault, stats, getAmortizationData } = usePrinterPresets();
  const { currencySymbol, formatCurrency } = useFormatCurrency();
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<DatabasePrinterPreset, 'id' | 'user_id' | 'created_at' | 'updated_at'>>({
    name: '',
    power_consumption: 0.35,
    purchase_price: 0,
    amortization_hours: 2000,
    current_usage_hours: 0,
    brand: '',
    model: '',
    notes: '',
    is_default: false,
    team_id: null,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      power_consumption: 0.35,
      purchase_price: 0,
      amortization_hours: 2000,
      current_usage_hours: 0,
      brand: '',
      model: '',
      notes: '',
      is_default: false,
      team_id: null,
    });
    setIsAdding(false);
    setEditingId(null);
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
        power_consumption: preset.power_consumption,
        purchase_price: preset.purchase_price,
        amortization_hours: preset.amortization_hours,
        current_usage_hours: preset.current_usage_hours,
        brand: preset.brand || '',
        model: preset.model || '',
        notes: preset.notes || '',
        is_default: preset.is_default,
        team_id: preset.team_id || null,
      });
      setEditingId(presetId);
      setIsAdding(false);
    }
  };

  const handleDelete = async (presetId: string) => {
    if (confirm('¿Estás seguro de que quieres eliminar este perfil de impresora?')) {
      await removePreset(presetId);
    }
  };

  const handleSetDefault = async (presetId: string) => {
    await setAsDefault(presetId);
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

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-slate-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Printer className="w-6 h-6 text-amber-600" />
            Perfiles de Impresoras
          </h2>
          <p className="text-gray-600 mt-1">
            Configura tus impresoras para calcular consumo y amortización
          </p>
        </div>
        {!isAdding && !editingId && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            Nueva Impresora
          </button>
        )}
      </div>

      {/* Stats Summary */}
      {stats.total > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
            <div className="text-sm text-amber-600 font-medium">Impresoras</div>
            <div className="text-2xl font-bold text-amber-900">{stats.total}</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <div className="text-sm text-blue-600 font-medium">Valor Total</div>
            <div className="text-2xl font-bold text-blue-900">{formatCurrency(stats.totalPurchaseValue)}</div>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <div className="text-sm text-green-600 font-medium">Amortizado</div>
            <div className="text-2xl font-bold text-green-900">{formatCurrency(stats.totalAmortized)}</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 border border-purple-200">
            <div className="text-sm text-purple-600 font-medium">Por Amortizar</div>
            <div className="text-2xl font-bold text-purple-900">{formatCurrency(stats.totalRemaining)}</div>
          </div>
        </div>
      )}

      {/* Form for adding/editing printer */}
      {(isAdding || editingId) && (
        <form onSubmit={handleSubmit} className="mb-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Printer className="w-5 h-5 text-amber-600" />
            {editingId ? 'Editar Impresora' : 'Nueva Impresora'}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Ej: Ender 3 Pro"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Consumo Eléctrico (kW) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.power_consumption}
                onChange={(e) => setFormData({ ...formData, power_consumption: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="0.35"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Potencia media de la impresora en funcionamiento</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Precio de Compra ({currencySymbol})
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.purchase_price}
                onChange={(e) => setFormData({ ...formData, purchase_price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="300.00"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horas de Vida Útil Estimadas
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={formData.amortization_hours}
                onChange={(e) => setFormData({ ...formData, amortization_hours: parseFloat(e.target.value) || 2000 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="2000"
              />
              <p className="text-xs text-gray-500 mt-1">Horas estimadas antes de renovar la impresora</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Horas de Uso Actuales
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                value={formData.current_usage_hours}
                onChange={(e) => setFormData({ ...formData, current_usage_hours: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="0"
              />
              <p className="text-xs text-gray-500 mt-1">Horas acumuladas de uso de la impresora</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Marca
              </label>
              <input
                type="text"
                value={formData.brand}
                onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Ej: Creality, Prusa, Anycubic..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Modelo
              </label>
              <input
                type="text"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Ej: Ender 3 Pro, MK3S+..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                placeholder="Notas adicionales sobre esta impresora..."
                rows={2}
              />
            </div>
          </div>

          <div className="flex items-center gap-2 mb-4">
            <input
              type="checkbox"
              id="is_default_printer"
              checked={formData.is_default}
              onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
              className="w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
            />
            <label htmlFor="is_default_printer" className="text-sm font-medium text-gray-700">
              Usar como impresora predeterminada
            </label>
          </div>

          {/* Preview de amortización */}
          {formData.purchase_price > 0 && formData.amortization_hours > 0 && (
            <div className="mb-4 p-3 bg-white rounded-lg border border-amber-300">
              <h4 className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                Vista previa de amortización
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                <div>
                  <span className="text-gray-500">Coste por hora:</span>
                  <span className="ml-2 font-medium text-amber-600">
                    {formatCurrency(formData.purchase_price / formData.amortization_hours)}/h
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Progreso:</span>
                  <span className="ml-2 font-medium">
                    {((formData.current_usage_hours / formData.amortization_hours) * 100).toFixed(1)}%
                  </span>
                </div>
                <div>
                  <span className="text-gray-500">Por amortizar:</span>
                  <span className="ml-2 font-medium text-purple-600">
                    {formatCurrency(Math.max(formData.purchase_price - (formData.current_usage_hours / formData.amortization_hours) * formData.purchase_price, 0))}
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-2">
            <button
              type="submit"
              className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Check className="w-4 h-4" />
              {editingId ? 'Guardar Cambios' : 'Crear Perfil'}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancelar
            </button>
          </div>
        </form>
      )}

      {/* List of printers */}
      {presets.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <Printer className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            No tienes perfiles de impresora
          </h3>
          <p className="text-gray-600 mb-4">
            Añade tu primera impresora para calcular costes de electricidad y amortización
          </p>
          {!isAdding && (
            <button
              onClick={() => setIsAdding(true)}
              className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Añadir Primera Impresora
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {presets.map((preset) => {
            const amortization = getAmortizationData(preset);
            
            return (
              <div
                key={preset.id}
                className="p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="font-semibold text-gray-900 text-lg">{preset.name}</h3>
                      {preset.is_default && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-medium">
                          <Star className="w-3 h-3 fill-current" />
                          Por defecto
                        </span>
                      )}
                      {amortization.isFullyAmortized && (
                        <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">
                          <Check className="w-3 h-3" />
                          Amortizada
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-3">
                      <div className="flex items-center gap-2">
                        <Zap className="w-4 h-4 text-yellow-500" />
                        <div>
                          <span className="text-gray-500">Consumo:</span>
                          <span className="ml-1 font-medium text-gray-900">
                            {preset.power_consumption} kW
                          </span>
                        </div>
                      </div>
                      
                      {preset.purchase_price > 0 && (
                        <div>
                          <span className="text-gray-500">Precio:</span>
                          <span className="ml-1 font-medium text-gray-900">
                            {formatCurrency(preset.purchase_price)}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <div>
                          <span className="text-gray-500">Uso:</span>
                          <span className="ml-1 font-medium">
                            {preset.current_usage_hours.toFixed(1)}h / {preset.amortization_hours}h
                          </span>
                        </div>
                      </div>
                      
                      {preset.purchase_price > 0 && (
                        <div className="flex items-center gap-2">
                          <TrendingUp className="w-4 h-4 text-amber-500" />
                          <div>
                            <span className="text-gray-500">Coste/h:</span>
                            <span className="ml-1 font-medium text-amber-600">
                              {formatCurrency(amortization.costPerHour)}/h
                            </span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Progress bar de amortización */}
                    {preset.purchase_price > 0 && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-gray-500 mb-1">
                          <span>Amortización: {amortization.progress.toFixed(1)}%</span>
                          <span>Restante: {formatCurrency(amortization.remainingAmount)}</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all ${
                              amortization.isFullyAmortized ? 'bg-green-500' : 'bg-amber-500'
                            }`}
                            style={{ width: `${Math.min(amortization.progress, 100)}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Brand/Model info */}
                    {(preset.brand || preset.model) && (
                      <div className="mt-2 text-sm text-gray-500">
                        {preset.brand && preset.model 
                          ? `${preset.brand} ${preset.model}`
                          : preset.brand || preset.model
                        }
                      </div>
                    )}

                    {preset.notes && (
                      <p className="mt-2 text-sm text-gray-600 italic">{preset.notes}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 ml-4">
                    {!preset.is_default && (
                      <button
                        onClick={() => handleSetDefault(preset.id)}
                        className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                        title="Establecer como predeterminada"
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
            );
          })}
        </div>
      )}

      {/* Info section */}
      <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <div className="flex items-start gap-3">
          <Printer className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
          <div className="text-sm text-amber-900">
            <h4 className="font-medium mb-1">💡 Sobre la amortización de impresoras</h4>
            <ul className="space-y-1 text-amber-700">
              <li>• El <strong>coste por hora</strong> se calcula dividiendo el precio de compra entre las horas de vida útil</li>
              <li>• Este coste se añade automáticamente a tus proyectos al seleccionar la impresora</li>
              <li>• Las <strong>horas de uso</strong> se actualizan manualmente o al guardar proyectos</li>
              <li>• Cuando la impresora esté totalmente amortizada, el coste por hora será de {currencySymbol}0</li>
              <li>• Valores típicos de vida útil: 2000-5000h para impresoras FDM, 1000-2000h para resina</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
