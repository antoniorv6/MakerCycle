'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save } from 'lucide-react'
import MobileInput from '../MobileInput'
import MobileSelect from '../MobileSelect'
import MobileButton from '../MobileButton'
import { useTeam } from '@/components/providers/TeamProvider'
import { useFormatCurrency } from '@/hooks/useFormatCurrency'
import { useHaptics } from '@/hooks/useCapacitor'
import type { Expense, ExpenseFormData } from '@/types'

interface MobileAddExpenseFormProps {
  expense?: Expense | null
  onSave: (expenseData: ExpenseFormData) => void
  onCancel: () => void
}

const expenseCategories = [
  { value: '', label: 'Seleccionar categoría' },
  { value: 'Materiales', label: 'Materiales' },
  { value: 'Equipamiento', label: 'Equipamiento' },
  { value: 'Electricidad', label: 'Electricidad' },
  { value: 'Software', label: 'Software' },
  { value: 'Mantenimiento', label: 'Mantenimiento' },
  { value: 'Marketing', label: 'Marketing' },
  { value: 'Transporte', label: 'Transporte' },
  { value: 'Otros', label: 'Otros' },
]

export default function MobileAddExpenseForm({ expense, onSave, onCancel }: MobileAddExpenseFormProps) {
  const { userTeams, getEffectiveTeam } = useTeam()
  const { currencySymbol } = useFormatCurrency()
  const { triggerHaptic } = useHaptics()

  const [amountInput, setAmountInput] = useState<string>('')
  const [formData, setFormData] = useState<ExpenseFormData>({
    description: '',
    amount: 0,
    category: '',
    date: new Date().toISOString().split('T')[0],
    notes: '',
    team_id: null
  })

  useEffect(() => {
    if (expense) {
      setFormData({
        description: expense.description,
        amount: expense.amount,
        category: expense.category,
        date: expense.date,
        notes: expense.notes || '',
        team_id: expense.team_id || null
      })
      setAmountInput(expense.amount?.toString() || '')
    } else {
      const effectiveTeam = getEffectiveTeam()
      setFormData(prev => ({ ...prev, team_id: effectiveTeam?.id || null }))
      setAmountInput('')
    }
  }, [expense, getEffectiveTeam])

  const handleSubmit = () => {
    triggerHaptic('medium')
    onSave(formData)
  }

  const teamOptions = [
    { value: '', label: 'Personal' },
    ...userTeams.map(t => ({ value: t.id, label: t.name }))
  ]

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 30, stiffness: 300 }}
        className="fixed inset-0 z-50 bg-white flex flex-col safe-area-top safe-area-bottom"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 bg-white">
          <h2 className="text-lg font-bold text-slate-900">
            {expense ? 'Editar Gasto' : 'Nuevo Gasto'}
          </h2>
          <button
            onClick={onCancel}
            className="p-2 rounded-full hover:bg-slate-100 active:bg-slate-200 transition-colors"
          >
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        {/* Scrollable form body */}
        <div className="flex-1 overflow-y-auto native-scroll pb-24">
          <div className="p-4 space-y-5">
            {/* Expense info */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">Información del Gasto</h3>
              <MobileInput
                label="Descripción"
                type="text"
                placeholder="Descripción del gasto"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                required
              />
              <MobileInput
                label={`Cantidad (${currencySymbol})`}
                type="number"
                value={amountInput}
                onChange={(e) => {
                  const value = e.target.value
                  setAmountInput(value)
                  if (value !== '' && value !== '-' && value !== '.') {
                    const numValue = parseFloat(value)
                    if (!isNaN(numValue)) {
                      setFormData(prev => ({ ...prev, amount: numValue }))
                    }
                  }
                }}
                onBlur={() => {
                  if (amountInput === '' || amountInput === '-' || amountInput === '.') {
                    setAmountInput('0')
                    setFormData(prev => ({ ...prev, amount: 0 }))
                  } else {
                    const numValue = parseFloat(amountInput)
                    if (!isNaN(numValue)) {
                      setAmountInput(numValue.toString())
                      setFormData(prev => ({ ...prev, amount: numValue }))
                    }
                  }
                }}
                required
              />
              <MobileSelect
                label="Categoría"
                options={expenseCategories}
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              />
            </div>

            {/* Additional info */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">Información Adicional</h3>
              <MobileInput
                label="Fecha"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                required
              />
              <MobileSelect
                label="Equipo"
                options={teamOptions}
                value={formData.team_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, team_id: e.target.value || null }))}
              />
            </div>

            {/* Notes */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">Notas</h3>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notas (opcional)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  rows={3}
                  placeholder="Información adicional..."
                  className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-opacity-50 focus:border-slate-500 placeholder:text-slate-400"
                  style={{ fontSize: '16px' }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Fixed bottom action bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 p-4 safe-area-bottom flex gap-3">
          <MobileButton variant="secondary" size="full" onClick={onCancel} className="flex-1">
            Cancelar
          </MobileButton>
          <MobileButton
            variant="primary"
            size="full"
            onClick={handleSubmit}
            icon={<Save className="w-4 h-4" />}
            className="flex-1"
          >
            {expense ? 'Actualizar' : 'Guardar'}
          </MobileButton>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
