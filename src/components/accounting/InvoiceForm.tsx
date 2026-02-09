import React, { useState, useEffect } from 'react';
import { X, Download, FileText, Plus, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useClients } from '@/hooks/useClients';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import type { Sale, InvoiceFormData } from '@/types';
import { toast } from 'react-hot-toast';

interface InvoiceFormProps {
  sale: Sale;
  onClose: () => void;
  onGeneratePDF: (data: InvoiceFormData) => void;
}

export function InvoiceForm({ sale, onClose, onGeneratePDF }: InvoiceFormProps) {
  const { clients } = useClients();
  // Estado local para inputs numéricos (permite que estén vacíos)
  const [inputValues, setInputValues] = useState<Record<number, { quantity?: string; unitPrice?: string }>>({});
  const [formData, setFormData] = useState<InvoiceFormData>(() => ({
    clientName: '',
    clientAddress: '',
    clientPhone: '',
    clientEmail: '',
    invoiceNumber: `ALB-${Date.now()}`,
    issueDate: new Date().toISOString().split('T')[0],
    deliveryDate: new Date().toISOString().split('T')[0],
    items: sale.items?.map(item => {
      
      return {
        description: item.project_name,
        quantity: Number(item.quantity) || 0,
        unitPrice: Number(item.sale_price) || 0,
        totalPrice: (Number(item.sale_price) || 0) * (Number(item.quantity) || 0)
      };
    }) || [],
    subtotal: Number(sale.total_amount) || 0,
    totalPrice: Number(sale.total_amount) || 0,
    notes: ''
  }));

  // Cargar datos del cliente si existe
  useEffect(() => {
    if (sale.client_id) {
      const client = clients.find(c => c.id === sale.client_id);
      if (client) {
        setFormData(prev => ({
          ...prev,
          clientName: client.name,
          clientAddress: client.address || '',
          clientPhone: client.phone || '',
          clientEmail: client.email || ''
        }));
      }
    } else {
      // Si no hay cliente asignado, mostrar advertencia
      toast('Completa los datos del cliente manualmente para este albarán.');
    }
  }, [sale.client_id, clients]);

  const handleInputChange = (field: keyof Omit<InvoiceFormData, 'items'>, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemChange = (index: number, field: keyof InvoiceFormData['items'][0], value: string | number) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };

    // Recalcular totales
    const subtotal = newItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    
    setFormData(prev => ({
      ...prev,
      items: newItems,
      subtotal,
      totalPrice: subtotal
    }));
  };

  const addItem = () => {
    const newItem = {
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0
    };
    
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };

  const removeItem = (index: number) => {
    const newItems = formData.items.filter((_, i) => i !== index);
    const subtotal = newItems.reduce((sum, item) => sum + (item.unitPrice * item.quantity), 0);
    
    setFormData(prev => ({
      ...prev,
      items: newItems,
      subtotal,
      totalPrice: subtotal
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      toast.error('Agrega al menos un concepto al albarán.');
      return;
    }

    // Validar que todos los items tengan descripción y precios válidos
    const invalidItems = formData.items.filter(item => 
      !item.description.trim() || item.unitPrice <= 0 || item.quantity <= 0
    );

    if (invalidItems.length > 0) {
      toast.error('Revisa que todos los conceptos tengan descripción, cantidad y precio correctos.');
      return;
    }

    onGeneratePDF(formData);
  };

  const { formatCurrency, currencySymbol } = useFormatCurrency();

  // Obtener el valor del input local o el del prop
  const getInputValue = (index: number, field: 'quantity' | 'unitPrice', propValue: number | undefined): string => {
    if (inputValues[index]?.[field] !== undefined && inputValues[index][field] !== null) {
      return inputValues[index][field];
    }
    return propValue?.toString() || '';
  };

  // Actualizar el valor del input local
  const setInputValue = (index: number, field: 'quantity' | 'unitPrice', value: string) => {
    setInputValues(prev => ({
      ...prev,
      [index]: {
        ...prev[index],
        [field]: value
      }
    }));
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-y-auto"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900">Generar Albarán</h2>
                <p className="text-sm text-gray-600">Completa los datos para generar el albarán</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Datos del Cliente */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  Datos del Cliente
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre/Razón Social *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.clientName}
                    onChange={(e) => handleInputChange('clientName', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Nombre del cliente"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección *
                  </label>
                  <textarea
                    required
                    value={formData.clientAddress}
                    onChange={(e) => handleInputChange('clientAddress', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Dirección completa"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      value={formData.clientPhone}
                      onChange={(e) => handleInputChange('clientPhone', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Teléfono"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input
                      type="email"
                      value={formData.clientEmail}
                      onChange={(e) => handleInputChange('clientEmail', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Email"
                    />
                  </div>
                </div>
              </div>

              {/* Datos del Albarán */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  Datos del Albarán
                </h3>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Número de Albarán *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.invoiceNumber}
                    onChange={(e) => handleInputChange('invoiceNumber', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="ALB-001"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Emisión *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.issueDate}
                      onChange={(e) => handleInputChange('issueDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Fecha de Entrega
                    </label>
                    <input
                      type="date"
                      value={formData.deliveryDate}
                      onChange={(e) => handleInputChange('deliveryDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Items del Albarán */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900 border-b border-gray-200 pb-2">
                  Items del Albarán
                </h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Agregar Item
                </button>
              </div>

              <div className="space-y-4">
                {formData.items.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-md font-medium text-gray-900">Item {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="flex items-center justify-center w-8 h-8 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors"
                        title="Eliminar item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descripción *
                        </label>
                        <input
                          type="text"
                          required
                          value={item.description}
                          onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Descripción del servicio"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cantidad *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          value={getInputValue(index, 'quantity', item.quantity)}
                          onChange={(e) => {
                            const value = e.target.value;
                            setInputValue(index, 'quantity', value);
                            // Only update parent if we have a valid number
                            if (value !== '' && value !== '-') {
                              const numValue = parseInt(value);
                              if (!isNaN(numValue)) {
                                handleItemChange(index, 'quantity', numValue);
                              }
                            }
                          }}
                          onBlur={(e) => {
                            const value = getInputValue(index, 'quantity', item.quantity);
                            if (value === '' || value === '-') {
                              setInputValue(index, 'quantity', '0');
                              handleItemChange(index, 'quantity', 0);
                            } else {
                              const numValue = parseInt(value);
                              if (!isNaN(numValue)) {
                                setInputValue(index, 'quantity', numValue.toString());
                                handleItemChange(index, 'quantity', numValue);
                              } else {
                                setInputValue(index, 'quantity', '0');
                                handleItemChange(index, 'quantity', 0);
                              }
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Precio Unitario ({currencySymbol}) *
                        </label>
                        <input
                          type="number"
                          required
                          min="0"
                          step="0.01"
                          value={getInputValue(index, 'unitPrice', item.unitPrice)}
                          onChange={(e) => {
                            const value = e.target.value;
                            setInputValue(index, 'unitPrice', value);
                            // Only update parent if we have a valid number
                            if (value !== '' && value !== '-' && value !== '.') {
                              const numValue = parseFloat(value);
                              if (!isNaN(numValue)) {
                                handleItemChange(index, 'unitPrice', numValue);
                              }
                            }
                          }}
                          onBlur={(e) => {
                            const value = getInputValue(index, 'unitPrice', item.unitPrice);
                            if (value === '' || value === '-' || value === '.') {
                              setInputValue(index, 'unitPrice', '0');
                              handleItemChange(index, 'unitPrice', 0);
                            } else {
                              const numValue = parseFloat(value);
                              if (!isNaN(numValue)) {
                                setInputValue(index, 'unitPrice', numValue.toString());
                                handleItemChange(index, 'unitPrice', numValue);
                              } else {
                                setInputValue(index, 'unitPrice', '0');
                                handleItemChange(index, 'unitPrice', 0);
                              }
                            }
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-sm text-gray-600">Subtotal: </span>
                      <span className="font-medium">{formatCurrency(item.unitPrice * item.quantity)}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Totales */}
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-medium text-gray-900">Total del Albarán</span>
                  <span className="text-2xl font-bold text-blue-600">{formatCurrency(formData.totalPrice)}</span>
                </div>
              </div>
            </div>

            {/* Notas */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas Adicionales
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Notas adicionales, condiciones, etc."
                rows={3}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4 mr-2" />
                Generar PDF
              </button>
            </div>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
} 