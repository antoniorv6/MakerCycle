'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Save, Plus, Trash2, Package, ChevronDown } from 'lucide-react'
import MobileInput from '../MobileInput'
import MobileSelect from '../MobileSelect'
import MobileButton from '../MobileButton'
import { useTeam } from '@/components/providers/TeamProvider'
import { useAuth } from '@/components/providers/AuthProvider'
import { useClients } from '@/hooks/useClients'
import { useFormatCurrency } from '@/hooks/useFormatCurrency'
import { useHaptics } from '@/hooks/useCapacitor'
import { createClient } from '@/lib/supabase'
import { roundCurrency, roundTime } from '@/utils/numberUtils'
import type { Sale, SaleFormData, SaleItemFormData, Project } from '@/types'
import { PrinterAmortizationSection } from '../../accounting/PrinterAmortizationSection'
import { toast } from 'react-hot-toast'

interface MobileAddSaleFormProps {
  sale?: Sale | null
  onSave: (saleData: SaleFormData) => void
  onCancel: () => void
}

export default function MobileAddSaleForm({ sale, onSave, onCancel }: MobileAddSaleFormProps) {
  const { userTeams, getEffectiveTeam } = useTeam()
  const { user } = useAuth()
  const { clients } = useClients()
  const { formatCurrency, currencySymbol } = useFormatCurrency()
  const { triggerHaptic } = useHaptics()
  const supabase = createClient()

  const [projects, setProjects] = useState<Project[]>([])
  const [showProjectPicker, setShowProjectPicker] = useState<number | null>(null)
  const [inputValues, setInputValues] = useState<Record<number, Record<string, string>>>({})

  const [formData, setFormData] = useState<SaleFormData>({
    date: new Date().toISOString().split('T')[0],
    team_id: null,
    client_id: null,
    items: [],
    printer_amortizations: []
  })

  useEffect(() => {
    if (sale) {
      const items: SaleItemFormData[] = sale.items?.map(item => ({
        project_id: item.project_id || null,
        project_name: item.project_name,
        unit_cost: item.unit_cost,
        quantity: item.quantity,
        sale_price: item.sale_price,
        print_hours: item.print_hours
      })) || []

      const printerAmortizations = sale.printer_amortizations?.map(amort => ({
        printer_preset_id: amort.printer_preset_id,
        amortization_method: amort.amortization_method,
        amortization_value: amort.amortization_value
      })) || []

      setFormData({
        date: sale.date,
        team_id: sale.team_id || null,
        client_id: sale.client_id || null,
        items,
        printer_amortizations: printerAmortizations
      })
    } else {
      const effectiveTeam = getEffectiveTeam()
      setFormData(prev => ({ ...prev, team_id: effectiveTeam?.id || null }))
    }
  }, [sale, getEffectiveTeam])

  const fetchProjects = async () => {
    if (!user) return
    const effectiveTeam = getEffectiveTeam()
    const baseQuery = supabase.from('projects').select('*').order('created_at', { ascending: false })
    const { data } = effectiveTeam
      ? await baseQuery.eq('team_id', effectiveTeam.id)
      : await baseQuery.eq('user_id', user.id).is('team_id', null)
    setProjects(data || [])
  }

  useEffect(() => {
    if (user) fetchProjects()
  }, [user])

  const addItem = () => {
    triggerHaptic('light')
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { project_id: null, project_name: '', unit_cost: 0, quantity: 1, sale_price: 0, print_hours: 0 }]
    }))
  }

  const removeItem = (index: number) => {
    triggerHaptic('light')
    setFormData(prev => ({ ...prev, items: prev.items.filter((_, i) => i !== index) }))
  }

  const updateItem = (index: number, field: keyof SaleItemFormData, value: string | number | null) => {
    setFormData(prev => {
      const newItems = [...prev.items]
      let processedValue = value
      if (field === 'unit_cost' || field === 'sale_price') {
        processedValue = roundCurrency(typeof value === 'string' ? parseFloat(value) || 0 : (value as number) || 0)
      } else if (field === 'print_hours') {
        processedValue = roundTime(typeof value === 'string' ? parseFloat(value) || 0 : (value as number) || 0)
      } else if (field === 'quantity') {
        processedValue = typeof value === 'string' ? parseInt(value) || 1 : (value as number) || 1
      }
      newItems[index] = { ...newItems[index], [field]: processedValue }
      return { ...prev, items: newItems }
    })
  }

  const handleProjectSelect = (index: number, project: Project) => {
    const roundedUnitCost = roundCurrency(project.total_cost)
    const roundedPrice = project.recommended_price > 0 ? roundCurrency(project.recommended_price) : roundCurrency(roundedUnitCost * 1.15)
    const roundedHours = roundTime(project.print_hours)

    setFormData(prev => {
      const newItems = [...prev.items]
      newItems[index] = {
        ...newItems[index],
        project_id: project.id,
        project_name: project.name,
        unit_cost: roundedUnitCost,
        sale_price: roundedPrice,
        print_hours: roundedHours,
      }
      return { ...prev, items: newItems }
    })
    setShowProjectPicker(null)
    triggerHaptic('selection')
  }

  const getInputVal = (index: number, field: string, propValue: number | undefined): string => {
    return inputValues[index]?.[field] ?? propValue?.toString() ?? ''
  }

  const setInputVal = (index: number, field: string, value: string) => {
    setInputValues(prev => ({ ...prev, [index]: { ...prev[index], [field]: value } }))
  }

  const handleNumericChange = (index: number, field: keyof SaleItemFormData, value: string) => {
    setInputVal(index, field, value)
    if (value !== '' && value !== '-' && value !== '.') {
      const numValue = parseFloat(value)
      if (!isNaN(numValue)) updateItem(index, field, numValue)
    }
  }

  const handleNumericBlur = (index: number, field: keyof SaleItemFormData) => {
    const item = formData.items[index]
    const val = getInputVal(index, field, item[field] as number | undefined)
    if (val === '' || val === '-' || val === '.') {
      setInputVal(index, field, '0')
      updateItem(index, field, 0)
    } else {
      const numValue = parseFloat(val)
      if (!isNaN(numValue)) {
        setInputVal(index, field, numValue.toString())
        updateItem(index, field, numValue)
      }
    }
  }

  const calculateTotalAmount = () => formData.items.reduce((sum, item) => sum + item.sale_price, 0)
  const calculateTotalCost = () => formData.items.reduce((sum, item) => sum + (item.unit_cost * item.quantity), 0)
  const calculateTotalProfit = () => calculateTotalAmount() - calculateTotalCost()
  const calculateTotalMargin = () => {
    const cost = calculateTotalCost()
    return cost > 0 ? (calculateTotalProfit() / cost) * 100 : 0
  }

  const handleSubmit = () => {
    if (formData.items.length === 0) {
      toast.error('Agrega al menos un proyecto a la venta.')
      return
    }

    const validatedItems = formData.items.map(item => ({
      ...item,
      unit_cost: roundCurrency(Number(item.unit_cost) || 0),
      quantity: Number(item.quantity) || 1,
      sale_price: roundCurrency(Number(item.sale_price) || 0),
      print_hours: roundTime(Number(item.print_hours) || 0)
    }))

    const invalidItems = validatedItems.filter(item =>
      item.unit_cost <= 0 || item.quantity <= 0 || item.sale_price <= 0 || item.project_name.trim() === ''
    )

    if (invalidItems.length > 0) {
      toast.error('Revisa que todos los proyectos tengan valores correctos.')
      return
    }

    triggerHaptic('medium')
    onSave({ ...formData, items: validatedItems })
  }

  // Team options for select
  const teamOptions = [
    { value: '', label: 'Personal' },
    ...userTeams.map(t => ({ value: t.id, label: t.name }))
  ]

  // Client options for select
  const clientOptions = [
    { value: '', label: 'Sin cliente' },
    ...clients.map(c => ({ value: c.id, label: c.name }))
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
            {sale ? 'Editar Venta' : 'Nueva Venta'}
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
            {/* General info */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-slate-900">Información General</h3>
              <MobileInput
                label="Fecha"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              />
              <MobileSelect
                label="Cliente"
                options={clientOptions}
                value={formData.client_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, client_id: e.target.value || null }))}
              />
              <MobileSelect
                label="Equipo"
                options={teamOptions}
                value={formData.team_id || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, team_id: e.target.value || null }))}
              />
            </div>

            {/* Sale items */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">Proyectos de la venta</h3>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-medium active:bg-blue-700"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar
                </button>
              </div>

              {formData.items.length === 0 && (
                <div className="bg-slate-50 rounded-xl p-6 text-center border border-slate-200">
                  <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Agrega proyectos a la venta</p>
                </div>
              )}

              {formData.items.map((item, index) => (
                <div key={index} className="bg-slate-50 rounded-xl p-3.5 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-700">Proyecto {index + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeItem(index)}
                      className="p-1.5 bg-red-100 rounded-lg active:bg-red-200"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                    </button>
                  </div>

                  {/* Project name + selector */}
                  <MobileInput
                    placeholder="Nombre del proyecto"
                    value={item.project_name}
                    onChange={(e) => updateItem(index, 'project_name', e.target.value)}
                    className="!py-3"
                  />

                  <button
                    type="button"
                    onClick={() => setShowProjectPicker(showProjectPicker === index ? null : index)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 border rounded-xl text-sm ${
                      item.project_id ? 'border-green-300 bg-green-50 text-green-700' : 'border-slate-300 bg-white text-slate-500'
                    }`}
                    style={{ fontSize: '16px' }}
                  >
                    <span>{item.project_id ? 'Proyecto vinculado' : 'Vincular proyecto existente'}</span>
                    <ChevronDown className="w-4 h-4" />
                  </button>

                  {showProjectPicker === index && (
                    <div className="bg-white border border-slate-300 rounded-xl shadow-lg max-h-40 overflow-y-auto">
                      {projects.length > 0 ? projects.map(project => (
                        <button
                          key={project.id}
                          type="button"
                          onClick={() => handleProjectSelect(index, project)}
                          className="w-full text-left px-3 py-2.5 active:bg-slate-50 border-b border-slate-100 last:border-b-0"
                        >
                          <p className="text-sm font-medium text-slate-900">{project.name}</p>
                          <p className="text-xs text-slate-500">Coste: {formatCurrency(project.total_cost)} | {project.print_hours}h</p>
                        </button>
                      )) : (
                        <p className="p-3 text-sm text-slate-400">No hay proyectos</p>
                      )}
                    </div>
                  )}

                  {/* Numeric fields 2x2 */}
                  <div className="grid grid-cols-2 gap-2">
                    <MobileInput
                      label={`Coste (${currencySymbol})`}
                      type="number"
                      value={getInputVal(index, 'unit_cost', item.unit_cost)}
                      onChange={(e) => handleNumericChange(index, 'unit_cost', e.target.value)}
                      onBlur={() => handleNumericBlur(index, 'unit_cost')}
                      className="!py-3"
                    />
                    <MobileInput
                      label="Cantidad"
                      type="number"
                      value={getInputVal(index, 'quantity', item.quantity)}
                      onChange={(e) => handleNumericChange(index, 'quantity', e.target.value)}
                      onBlur={() => handleNumericBlur(index, 'quantity')}
                      className="!py-3"
                    />
                    <MobileInput
                      label={`Precio venta (${currencySymbol})`}
                      type="number"
                      value={getInputVal(index, 'sale_price', item.sale_price)}
                      onChange={(e) => handleNumericChange(index, 'sale_price', e.target.value)}
                      onBlur={() => handleNumericBlur(index, 'sale_price')}
                      className="!py-3"
                    />
                    <MobileInput
                      label="Horas"
                      type="number"
                      value={getInputVal(index, 'print_hours', item.print_hours)}
                      onChange={(e) => handleNumericChange(index, 'print_hours', e.target.value)}
                      onBlur={() => handleNumericBlur(index, 'print_hours')}
                      className="!py-3"
                    />
                  </div>

                  {/* Item summary */}
                  <div className="grid grid-cols-2 gap-2 bg-white rounded-lg p-2 text-xs">
                    <div>
                      <span className="text-slate-500">Coste total:</span>
                      <p className="font-medium">{formatCurrency(item.unit_cost * item.quantity)}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Beneficio:</span>
                      <p className={`font-medium ${(item.sale_price - item.unit_cost * item.quantity) >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {formatCurrency(item.sale_price - item.unit_cost * item.quantity)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Printer Amortization */}
            {formData.items.length > 0 && calculateTotalProfit() > 0 && (
              <PrinterAmortizationSection
                profit={calculateTotalProfit()}
                amortizations={formData.printer_amortizations || []}
                onAmortizationsChange={(amortizations) => {
                  setFormData(prev => ({ ...prev, printer_amortizations: amortizations }))
                }}
              />
            )}

            {/* Sale summary */}
            {formData.items.length > 0 && (
              <div className="bg-blue-50 rounded-xl p-3.5 border border-blue-200">
                <h3 className="text-sm font-semibold text-slate-900 mb-3">Resumen</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <p className="text-lg font-bold text-blue-600">{formatCurrency(calculateTotalAmount())}</p>
                    <p className="text-[10px] text-slate-500">Total Venta</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-slate-600">{formatCurrency(calculateTotalCost())}</p>
                    <p className="text-[10px] text-slate-500">Total Coste</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-lg font-bold ${calculateTotalProfit() >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {formatCurrency(calculateTotalProfit())}
                    </p>
                    <p className="text-[10px] text-slate-500">Beneficio</p>
                  </div>
                  <div className="text-center">
                    <p className={`text-lg font-bold ${calculateTotalMargin() >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {calculateTotalMargin().toFixed(1)}%
                    </p>
                    <p className="text-[10px] text-slate-500">Margen</p>
                  </div>
                </div>
              </div>
            )}
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
            disabled={formData.items.length === 0}
            icon={<Save className="w-4 h-4" />}
            className="flex-1"
          >
            {sale ? 'Actualizar' : 'Guardar'}
          </MobileButton>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
