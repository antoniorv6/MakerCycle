import React, { useState, useEffect } from 'react';
import { X, Save, Euro, Package, Calendar, Clock } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Sale, SaleFormData } from '@/types';

interface AddSaleFormProps {
  sale?: Sale | null;
  onSave: (saleData: SaleFormData) => void;
  onCancel: () => void;
}

export function AddSaleForm({ sale, onSave, onCancel }: AddSaleFormProps) {
  const [formData, setFormData] = useState<SaleFormData>({
    projectName: '',
    unitCost: 0,
    quantity: 1,
    salePrice: 0,
    date: new Date().toISOString().split('T')[0],
    printHours: 0
  });

  useEffect(() => {
    if (sale) {
      setFormData({
        projectName: sale.project_name,
        unitCost: sale.unit_cost,
        quantity: sale.quantity,
        salePrice: sale.sale_price,
        date: sale.date,
        printHours: sale.print_hours || 0
      });
    }
  }, [sale]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  const handleInputChange = (field: keyof SaleFormData, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {sale ? 'Editar Venta' : 'Nueva Venta'}
            </h3>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Proyecto
            </label>
            <input
              type="text"
              value={formData.projectName}
              onChange={(e) => handleInputChange('projectName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Coste Unitario (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.unitCost}
                onChange={(e) => handleInputChange('unitCost', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cantidad
              </label>
              <input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Precio de Venta (€)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.salePrice}
                onChange={(e) => handleInputChange('salePrice', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horas de Impresión
              </label>
              <input
                type="number"
                step="0.1"
                value={formData.printHours}
                onChange={(e) => handleInputChange('printHours', parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fecha
            </label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => handleInputChange('date', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
            >
              <Save className="w-4 h-4 mr-2" />
              {sale ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
} 