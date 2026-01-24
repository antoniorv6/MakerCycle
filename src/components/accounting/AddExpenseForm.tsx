import React, { useState, useEffect } from 'react';
import { X, Save, Euro, FileText, Calendar, Users, User } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTeam } from '@/components/providers/TeamProvider';
import type { Expense, ExpenseFormData, Team } from '@/types';

interface AddExpenseFormProps {
  expense?: Expense | null;
  onSave: (expenseData: ExpenseFormData) => void;
  onCancel: () => void;
}

export function AddExpenseForm({ expense, onSave, onCancel }: AddExpenseFormProps) {
  const { currentTeam, userTeams, getEffectiveTeam } = useTeam();
  const [selectedTeamId, setSelectedTeamId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: '',
    amount: 0,
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    team_id: null
  });

  const expenseCategories = [
    'Materiales',
    'Equipamiento',
    'Electricidad',
    'Software',
    'Mantenimiento',
    'Marketing',
    'Transporte',
    'Otros'
  ];

  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        notes: expense.notes || '',
        team_id: expense.team_id || null
      });
      setSelectedTeamId(expense.team_id || null);
    } else {
      // For new expenses, use effective team context
      const effectiveTeam = getEffectiveTeam();
      setFormData(prev => ({
        ...prev,
        team_id: effectiveTeam?.id || null
      }));
      setSelectedTeamId(effectiveTeam?.id || null);
    }
  }, [expense, getEffectiveTeam]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      team_id: selectedTeamId
    });
  };

  const handleInputChange = (field: keyof ExpenseFormData, value: string | number) => {
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
        className="bg-white rounded-xl shadow-xl max-w-3xl w-full mx-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">
              {expense ? 'Editar Gasto' : 'Nuevo Gasto'}
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
          {/* Información del Gasto */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información del Gasto</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Descripción detallada del gasto"
                  required
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.amount?.toString() || ''}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Allow any input while typing
                      if (value !== '' && value !== '-' && value !== '.') {
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue)) {
                          handleInputChange('amount', numValue);
                        }
                      }
                    }}
                    onBlur={(e) => {
                      const value = e.target.value;
                      if (value === '' || value === '-' || value === '.') {
                        handleInputChange('amount', 0);
                      } else {
                        const numValue = parseFloat(value);
                        if (!isNaN(numValue)) {
                          handleInputChange('amount', numValue);
                        } else {
                          handleInputChange('amount', 0);
                        }
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => handleInputChange('category', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="">Seleccionar categoría</option>
                    {expenseCategories.map(category => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Información Adicional */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Información Adicional</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  Equipo
                </label>
                <div className="space-y-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      name="team"
                      value=""
                      checked={selectedTeamId === null}
                      onChange={() => setSelectedTeamId(null)}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-sm text-gray-700">Personal</span>
                  </label>
                  {userTeams.map((team: Team) => (
                    <label key={team.id} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="team"
                        value={team.id}
                        checked={selectedTeamId === team.id}
                        onChange={() => setSelectedTeamId(team.id)}
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

          {/* Notas */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Notas Adicionales</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notas (opcional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Información adicional sobre el gasto, justificación, detalles de compra, etc..."
              />
            </div>
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
              {expense ? 'Actualizar' : 'Guardar'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
} 