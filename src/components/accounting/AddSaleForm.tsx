import React, { useState, useEffect } from 'react';
import { X, Save, Euro, Package, Calendar, Clock, Users, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTeam } from '@/components/providers/TeamProvider';
import { useAuth } from '@/components/providers/AuthProvider';
import { ClientSelector } from './ClientSelector';
import { SaleItemsForm } from './SaleItemsForm';
import { roundCurrency, roundTime } from '@/utils/numberUtils';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import type { Sale, SaleFormData, SaleItemFormData } from '@/types';
import { toast } from 'react-hot-toast';

interface AddSaleFormProps {
  sale?: Sale | null;
  onSave: (saleData: SaleFormData) => void;
  onCancel: () => void;
}

export function AddSaleForm({ sale, onSave, onCancel }: AddSaleFormProps) {
  const { currentTeam, userTeams, getEffectiveTeam } = useTeam();
  const { user } = useAuth();
  const { formatCurrency } = useFormatCurrency();
  
  const [formData, setFormData] = useState<SaleFormData>({
    date: new Date().toISOString().split('T')[0],
    team_id: null,
    client_id: null,
    items: []
  });

  useEffect(() => {
    if (sale) {
      // Convert existing sale to new format
      const items: SaleItemFormData[] = sale.items?.map(item => ({
        project_id: item.project_id || null,
        project_name: item.project_name,
        unit_cost: item.unit_cost,
        quantity: item.quantity,
        sale_price: item.sale_price,
        print_hours: item.print_hours
      })) || [];

      setFormData({
        date: sale.date,
        team_id: sale.team_id || null,
        client_id: sale.client_id || null,
        items
      });
    } else {
      // For new sales, use effective team context
      const effectiveTeam = getEffectiveTeam();
      setFormData(prev => ({
        ...prev,
        team_id: effectiveTeam?.id || null
      }));
    }
  }, [sale, getEffectiveTeam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.items.length === 0) {
      toast.error('Agrega al menos un proyecto a la venta.');
      return;
    }

    // Validate all items have valid numeric values and round to appropriate decimal places
    const validatedItems = formData.items.map(item => ({
      ...item,
      unit_cost: roundCurrency(Number(item.unit_cost) || 0),
      quantity: Number(item.quantity) || 1,
      sale_price: roundCurrency(Number(item.sale_price) || 0),
      print_hours: roundTime(Number(item.print_hours) || 0)
    }));

    // Check if any item has invalid values
    const invalidItems = validatedItems.filter(item => 
      item.unit_cost <= 0 || 
      item.quantity <= 0 || 
      item.sale_price <= 0 ||
      item.project_name.trim() === ''
    );

    if (invalidItems.length > 0) {
      toast.error('Revisa que todos los proyectos tengan valores correctos: nombre, cantidad, precio y coste unitario.');
      return;
    }

    const saleData = {
      ...formData,
      items: validatedItems
    };

    // Track analytics before saving
    const totalAmount = validatedItems.reduce((sum, item) => sum + item.sale_price, 0);
    const itemsCount = validatedItems.length;
    
    onSave(saleData);
    
  };

  const handleInputChange = (field: keyof Omit<SaleFormData, 'items'>, value: string | null) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleItemsChange = (items: SaleItemFormData[]) => {
    setFormData(prev => ({
      ...prev,
      items
    }));
  };

  const handleTeamChange = (teamId: string | null) => {
    setFormData(prev => ({
      ...prev,
      team_id: teamId
    }));
  };

  const calculateTotalAmount = () => {
    return formData.items.reduce((sum, item) => sum + item.sale_price, 0);
  };

  const calculateTotalCost = () => {
    return formData.items.reduce((sum, item) => sum + (item.unit_cost * item.quantity), 0);
  };

  const calculateTotalProfit = () => {
    return calculateTotalAmount() - calculateTotalCost();
  };

  const calculateTotalMargin = () => {
    const totalCost = calculateTotalCost();
    return totalCost > 0 ? (calculateTotalProfit() / totalCost) * 100 : 0;
  };

  const calculateTotalPrintHours = () => {
    return formData.items.reduce((sum, item) => sum + item.print_hours, 0);
  };

  // Use utility functions for formatting
  const formatCurrencyValue = (value: number) => formatCurrency(value);
  const formatPercentageValue = (value: number) => `${roundCurrency(value).toFixed(1)}%`;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-xl shadow-xl max-w-6xl w-full mx-4 max-h-[90vh] overflow-y-auto"
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

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Información General */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información General</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cliente
                </label>
                <ClientSelector
                  selectedClientId={formData.client_id || null}
                  onClientSelect={(clientId) => handleInputChange('client_id', clientId || null)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Equipo
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="team"
                      value=""
                      checked={formData.team_id === null}
                      onChange={() => handleTeamChange(null)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Personal</span>
                  </label>
                  {userTeams.map((team) => (
                    <label key={team.id} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="team"
                        value={team.id}
                        checked={formData.team_id === team.id}
                        onChange={() => handleTeamChange(team.id)}
                        className="text-blue-600 focus:ring-blue-500"
                      />
                      <Users className="w-4 h-4 text-blue-600" />
                      <span className="text-sm text-gray-700">{team.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Proyectos de la Venta */}
          <SaleItemsForm
            items={formData.items}
            onItemsChange={handleItemsChange}
          />

          {/* Resumen de la Venta */}
          {formData.items.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen de la Venta</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrencyValue(calculateTotalAmount())}
                  </div>
                  <div className="text-sm text-gray-600">Total Venta</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-600">
                    {formatCurrencyValue(calculateTotalCost())}
                  </div>
                  <div className="text-sm text-gray-600">Total Coste</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${calculateTotalProfit() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatCurrencyValue(calculateTotalProfit())}
                  </div>
                  <div className="text-sm text-gray-600">Beneficio</div>
                </div>
                <div className="text-center">
                  <div className={`text-2xl font-bold ${calculateTotalMargin() >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {formatPercentageValue(calculateTotalMargin())}
                  </div>
                  <div className="text-sm text-gray-600">Margen</div>
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-sm text-gray-600">
                  {formData.items.length} proyecto{formData.items.length !== 1 ? 's' : ''} • {calculateTotalPrintHours()} horas totales
                </div>
              </div>
            </div>
          )}

          {/* Botones de Acción */}
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
              disabled={formData.items.length === 0}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
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