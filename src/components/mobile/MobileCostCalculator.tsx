'use client'

import React, { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence, PanInfo } from 'framer-motion'
import { 
  Calculator, Package, Zap, Settings, Euro, Check, 
  ChevronLeft, ChevronRight, Plus, Trash2, Copy, Save, RefreshCw,
  Bookmark, ChevronDown, FileText, Loader2
} from 'lucide-react'
import { toast } from 'react-hot-toast'
import { createClient } from '@/lib/supabase'
import { useAuth } from '@/components/providers/AuthProvider'
import { useTeam } from '@/components/providers/TeamProvider'
import { useHaptics } from '@/hooks/useCapacitor'
import { useFormatCurrency } from '@/hooks/useFormatCurrency'
import { useCostCalculations } from '@/components/cost-calculator/hooks/useCostCalculations'
import { useMaterialPresets } from '@/hooks/useMaterialPresets'
import { usePostprocessingPresets } from '@/hooks/usePostprocessingPresets'
import MobileInput from './MobileInput'
import type { DatabaseProject, DatabasePiece, PostprocessingItem } from '@/types'

interface MobileCostCalculatorProps {
  loadedProject?: DatabaseProject & { pieces?: DatabasePiece[] }
  onProjectSaved?: (project: DatabaseProject) => void
  onNavigateToSettings?: () => void
}

// Step definitions - ahora con postproducción
const STEPS = [
  { id: 0, title: 'Proyecto', icon: Settings },
  { id: 1, title: 'Piezas', icon: Package },
  { id: 2, title: 'Postprod.', icon: FileText },
  { id: 3, title: 'Energía', icon: Zap },
  { id: 4, title: 'Precios', icon: Euro },
  { id: 5, title: 'Resumen', icon: Calculator },
]

// Unidades disponibles para postproducción
const POSTPROCESSING_UNITS = [
  'unidad', 'hora', 'ml', 'g', 'kg', 'm²', 'm', 'pieza'
]

export default function MobileCostCalculator({ 
  loadedProject, 
  onProjectSaved, 
  onNavigateToSettings 
}: MobileCostCalculatorProps) {
  const { user } = useAuth()
  const { getEffectiveTeam } = useTeam()
  const { formatCurrency, currencySymbol } = useFormatCurrency()
  const { triggerHaptic } = useHaptics()
  const supabase = createClient()
  
  // Hooks para presets
  const { 
    presets: materialPresets, 
    loading: materialsLoading,
    convertPrice,
    createPresetFromMaterial 
  } = useMaterialPresets()
  
  const { 
    presets: postprocessingPresets, 
    loading: postprocessingPresetsLoading 
  } = usePostprocessingPresets()
  
  // Form state
  const [currentStep, setCurrentStep] = useState(0)
  const [isSaving, setIsSaving] = useState(false)
  const [projectName, setProjectName] = useState(loadedProject?.name || '')
  const [projectType, setProjectType] = useState<'filament' | 'resin'>(loadedProject?.project_type as 'filament' | 'resin' || 'filament')
  const [electricityCost, setElectricityCost] = useState(loadedProject?.electricity_cost || 0.12)
  const [printerPower, setPrinterPower] = useState(0.35)
  const [vatPercentage, setVatPercentage] = useState(loadedProject?.vat_percentage || 21)
  const [profitMargin, setProfitMargin] = useState(loadedProject?.profit_margin || 15)
  
  // Postprocessing items
  const [postprocessingItems, setPostprocessingItems] = useState<PostprocessingItem[]>(
    loadedProject?.postprocessing_items || []
  )
  
  // UI states para selectores
  const [showMaterialPresets, setShowMaterialPresets] = useState<string | null>(null)
  const [showPostprocessingPresets, setShowPostprocessingPresets] = useState(false)
  const [selectedMaterialCategory, setSelectedMaterialCategory] = useState<'filament' | 'resin'>('filament')
  
  const [pieces, setPieces] = useState<Array<{
    id: string
    name: string
    filamentWeight: number
    filamentPrice: number
    printHours: number
    quantity: number
    notes?: string
    materials?: Array<{
      id: string
      materialName: string
      materialType: string
      weight: number
      pricePerKg: number
      unit: string
      category: 'filament' | 'resin'
      color?: string
      brand?: string
      notes?: string
    }>
  }>>(loadedProject?.pieces?.map(p => ({
    id: p.id,
    name: p.name,
    filamentWeight: p.filament_weight,
    filamentPrice: p.filament_price,
    printHours: p.print_hours,
    quantity: p.quantity,
    notes: p.notes || '',
    materials: p.materials?.map(m => ({
      id: m.id,
      materialName: m.material_name || 'Material',
      materialType: m.material_type || 'PLA',
      weight: m.weight,
      pricePerKg: m.price_per_kg || 25,
      unit: m.unit || 'g',
      category: (m.category as 'filament' | 'resin') || 'filament',
      color: m.color,
      brand: m.brand,
      notes: m.notes
    })) || []
  })) || [{
    id: '1',
    name: 'Pieza principal',
    filamentWeight: 0,
    filamentPrice: 25,
    printHours: 0,
    quantity: 1,
    notes: '',
    materials: []
  }])

  // Calculate totals
  const totalFilamentWeight = useMemo(() => {
    return pieces.reduce((sum, piece) => {
      if (piece.materials?.length) {
        const pieceWeight = piece.materials.reduce((mSum, m) => 
          mSum + (m.unit === 'kg' ? m.weight * 1000 : m.weight), 0
        )
        return sum + (pieceWeight * piece.quantity)
      }
      return sum + (piece.filamentWeight * piece.quantity)
    }, 0)
  }, [pieces])

  const totalPrintHours = useMemo(() => {
    return pieces.reduce((sum, p) => sum + (p.printHours * p.quantity), 0)
  }, [pieces])

  // Calcular coste total de postproducción
  const totalPostprocessingCost = useMemo(() => {
    return postprocessingItems.reduce((sum, item) => 
      sum + (item.cost_per_unit * (item.quantity || 1)), 0
    )
  }, [postprocessingItems])

  const { costs, salePrice } = useCostCalculations({
    pieces,
    filamentWeight: totalFilamentWeight,
    filamentPrice: pieces[0]?.filamentPrice || 25,
    printHours: totalPrintHours,
    electricityCost,
    printerPower,
    materials: [],
    postprocessingItems,
    vatPercentage,
    profitMargin
  })

  // Navigation
  const goToStep = (step: number) => {
    if (step >= 0 && step < STEPS.length) {
      triggerHaptic('light')
      setCurrentStep(step)
    }
  }

  const nextStep = () => goToStep(currentStep + 1)
  const prevStep = () => goToStep(currentStep - 1)

  // Swipe handling
  const handleSwipe = (event: any, info: PanInfo) => {
    if (Math.abs(info.offset.x) > 50) {
      if (info.offset.x > 0 && currentStep > 0) {
        prevStep()
      } else if (info.offset.x < 0 && currentStep < STEPS.length - 1) {
        nextStep()
      }
    }
  }

  // Piece management
  const addPiece = useCallback(() => {
    triggerHaptic('light')
    setPieces(prev => [...prev, {
      id: Date.now().toString(),
      name: `Pieza ${prev.length + 1}`,
      filamentWeight: 0,
      filamentPrice: 25,
      printHours: 0,
      quantity: 1,
      notes: '',
      materials: []
    }])
  }, [triggerHaptic])

  const updatePiece = useCallback((id: string, field: string, value: any) => {
    setPieces(prev => prev.map(p => p.id === id ? { ...p, [field]: value } : p))
  }, [])

  const removePiece = useCallback((id: string) => {
    if (pieces.length > 1) {
      triggerHaptic('medium')
      setPieces(prev => prev.filter(p => p.id !== id))
    }
  }, [pieces.length, triggerHaptic])

  const duplicatePiece = useCallback((id: string) => {
    const piece = pieces.find(p => p.id === id)
    if (piece) {
      triggerHaptic('light')
      setPieces(prev => [...prev, {
        ...piece,
        id: Date.now().toString(),
        name: `${piece.name} (copia)`,
        materials: piece.materials?.map(m => ({
          ...m,
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9)
        })) || []
      }])
    }
  }, [pieces, triggerHaptic])

  // Add material to piece
  const addMaterialToPiece = useCallback((pieceId: string) => {
    triggerHaptic('light')
    setPieces(prev => prev.map(p => p.id === pieceId ? {
      ...p,
      materials: [...(p.materials || []), {
        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
        materialName: 'Nuevo material',
        materialType: projectType === 'resin' ? 'Resina' : 'PLA',
        weight: 1,
        pricePerKg: 25,
        unit: projectType === 'resin' ? 'ml' : 'g',
        category: projectType,
        color: '#808080',
        brand: '',
        notes: ''
      }]
    } : p))
  }, [projectType, triggerHaptic])

  const updatePieceMaterial = useCallback((pieceId: string, materialId: string, field: string, value: any) => {
    setPieces(prev => prev.map(p => p.id === pieceId ? {
      ...p,
      materials: p.materials?.map(m => m.id === materialId ? { ...m, [field]: value } : m)
    } : p))
  }, [])

  const removePieceMaterial = useCallback((pieceId: string, materialId: string) => {
    triggerHaptic('light')
    setPieces(prev => prev.map(p => p.id === pieceId ? {
      ...p,
      materials: p.materials?.filter(m => m.id !== materialId)
    } : p))
  }, [triggerHaptic])

  // Cargar preset de material
  const loadMaterialPreset = useCallback((pieceId: string, materialId: string, presetId: string) => {
    const preset = materialPresets.find(p => p.id === presetId)
    if (preset) {
      triggerHaptic('selection')
      
      let pricePerKg = preset.price_per_unit
      if (preset.category === 'filament' && preset.unit !== 'kg') {
        pricePerKg = convertPrice(preset.price_per_unit, preset.unit, 'kg')
      }
      
      setPieces(prev => prev.map(p => p.id === pieceId ? {
        ...p,
        materials: p.materials?.map(m => m.id === materialId ? {
          ...m,
          materialName: preset.name,
          materialType: preset.material_type,
          pricePerKg: pricePerKg,
          unit: preset.unit,
          category: preset.category,
          color: preset.color || '#808080',
          brand: preset.brand || '',
          notes: preset.notes || ''
        } : m)
      } : p))
      
      setShowMaterialPresets(null)
      toast.success(`Preset "${preset.name}" cargado`)
    }
  }, [materialPresets, convertPrice, triggerHaptic])

  // Postprocessing management
  const addPostprocessingItem = useCallback(() => {
    triggerHaptic('light')
    setPostprocessingItems(prev => [...prev, {
      id: Date.now().toString(),
      name: '',
      cost_per_unit: 0,
      quantity: 1,
      unit: 'unidad',
      preset_id: null,
      is_from_preset: false
    }])
  }, [triggerHaptic])

  const updatePostprocessingItem = useCallback((id: string, field: keyof PostprocessingItem, value: any) => {
    setPostprocessingItems(prev => prev.map(item =>
      item.id === id ? { ...item, [field]: value } : item
    ))
  }, [])

  const removePostprocessingItem = useCallback((id: string) => {
    triggerHaptic('light')
    setPostprocessingItems(prev => prev.filter(item => item.id !== id))
  }, [triggerHaptic])

  // Cargar preset de postproducción
  const loadPostprocessingPreset = useCallback((presetId: string) => {
    const preset = postprocessingPresets.find(p => p.id === presetId)
    if (preset) {
      triggerHaptic('selection')
      setPostprocessingItems(prev => [...prev, {
        id: Date.now().toString(),
        name: preset.name,
        cost_per_unit: preset.cost_per_unit,
        quantity: 1,
        unit: preset.unit,
        preset_id: preset.id,
        is_from_preset: true,
        description: preset.description,
        category: preset.category
      }])
      setShowPostprocessingPresets(false)
      toast.success(`Preset "${preset.name}" cargado`)
    }
  }, [postprocessingPresets, triggerHaptic])

  // Save project
  const saveProject = async () => {
    if (!user || !projectName.trim()) {
      toast.error('Introduce un nombre para el proyecto')
      return
    }

    setIsSaving(true)
    triggerHaptic('medium')

    try {
      const project = {
        user_id: user.id,
        name: projectName,
        project_type: projectType,
        filament_weight: totalFilamentWeight,
        filament_price: pieces[0]?.filamentPrice || 25,
        print_hours: totalPrintHours,
        electricity_cost: electricityCost,
        materials: [],
        postprocessing_items: postprocessingItems.length > 0 ? postprocessingItems : null,
        total_cost: costs.total,
        vat_percentage: vatPercentage,
        profit_margin: profitMargin,
        recommended_price: salePrice.recommendedPrice,
        status: 'calculated',
        team_id: getEffectiveTeam()?.id || null,
      }

      let projectId = loadedProject?.id
      let projectData

      if (loadedProject?.id) {
        const { data, error } = await supabase
          .from('projects')
          .update(project)
          .eq('id', loadedProject.id)
          .select()
          .single()
        if (error) throw error
        projectData = data
      } else {
        const { data, error } = await supabase
          .from('projects')
          .insert([project])
          .select()
          .single()
        if (error) throw error
        projectData = data
        projectId = data.id
      }

      // Save pieces
      if (projectId) {
        // Eliminar materiales de piezas existentes
        const existingPieces = await supabase.from('pieces').select('id').eq('project_id', projectId)
        if (existingPieces.data?.length) {
          await supabase.from('piece_materials').delete().in('piece_id', existingPieces.data.map(p => p.id))
        }
        await supabase.from('pieces').delete().eq('project_id', projectId)

        const piecesToSave = pieces.map(p => ({
          project_id: projectId,
          name: p.name,
          filament_weight: p.materials?.length ? 0 : p.filamentWeight,
          filament_price: p.materials?.length ? 0 : p.filamentPrice,
          print_hours: p.printHours,
          quantity: p.quantity,
          notes: p.notes || ''
        }))

        const { data: savedPieces } = await supabase
          .from('pieces')
          .insert(piecesToSave)
          .select()

        // Save materials
        if (savedPieces) {
          const materialsToSave: any[] = []
          pieces.forEach((piece, i) => {
            piece.materials?.forEach(m => {
              if (m.weight > 0) {
                materialsToSave.push({
                  piece_id: savedPieces[i].id,
                  material_name: m.materialName,
                  material_type: m.materialType,
                  weight: m.weight,
                  price_per_kg: m.pricePerKg,
                  unit: m.unit,
                  category: m.category,
                  color: m.color || '#808080',
                  brand: m.brand || '',
                  notes: m.notes || ''
                })
              }
            })
          })

          if (materialsToSave.length) {
            await supabase.from('piece_materials').insert(materialsToSave)
          }
        }
      }

      toast.success('Proyecto guardado')
      onProjectSaved?.(projectData)
    } catch (error) {
      toast.error('Error al guardar')
    } finally {
      setIsSaving(false)
    }
  }

  // Reset form
  const resetForm = () => {
    triggerHaptic('medium')
    setProjectName('')
    setProjectType('filament')
    setElectricityCost(0.12)
    setVatPercentage(21)
    setProfitMargin(15)
    setPostprocessingItems([])
    setPieces([{
      id: '1',
      name: 'Pieza principal',
      filamentWeight: 0,
      filamentPrice: 25,
      printHours: 0,
      quantity: 1,
      materials: []
    }])
    setCurrentStep(0)
  }

  // Filtrar presets de material por categoría
  const filteredMaterialPresets = useMemo(() => {
    return materialPresets.filter(p => p.category === selectedMaterialCategory)
  }, [materialPresets, selectedMaterialCategory])

  // Render step content
  const renderStep = () => {
    switch (currentStep) {
      case 0: // Project Info
        return (
          <div className="space-y-4">
            <MobileInput
              label="Nombre del proyecto"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Mi proyecto 3D"
            />
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Tipo de proyecto
              </label>
              <div className="grid grid-cols-2 gap-3">
                {(['filament', 'resin'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => {
                      setProjectType(type)
                      setSelectedMaterialCategory(type)
                      triggerHaptic('selection')
                    }}
                    className={`p-4 rounded-xl border-2 transition-all ${
                      projectType === type
                        ? 'border-slate-800 bg-slate-50'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <span className="font-medium text-slate-900">
                      {type === 'filament' ? 'Filamento' : 'Resina'}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-sm text-slate-600">
                <strong>Contexto:</strong> {getEffectiveTeam()?.name || 'Personal'}
              </p>
            </div>
          </div>
        )

      case 1: // Pieces
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold text-slate-900">Piezas ({pieces.length})</h3>
              <button
                onClick={addPiece}
                className="flex items-center gap-1 px-3 py-2 bg-slate-800 text-white rounded-lg text-sm"
              >
                <Plus className="w-4 h-4" />
                Añadir
              </button>
            </div>

            <div className="space-y-4 max-h-[55vh] overflow-y-auto pb-2">
              {pieces.map((piece, index) => (
                <div key={piece.id} className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <input
                      type="text"
                      value={piece.name}
                      onChange={(e) => updatePiece(piece.id, 'name', e.target.value)}
                      className="font-medium text-slate-900 bg-transparent border-b border-transparent focus:border-slate-300 outline-none flex-1"
                      style={{ fontSize: '16px' }}
                    />
                    <div className="flex gap-2">
                      <button onClick={() => duplicatePiece(piece.id)} className="p-2 text-slate-400">
                        <Copy className="w-4 h-4" />
                      </button>
                      {pieces.length > 1 && (
                        <button onClick={() => removePiece(piece.id)} className="p-2 text-red-400">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className="text-xs text-slate-500">Horas impresión</label>
                      <input
                        type="number"
                        value={piece.printHours || ''}
                        onChange={(e) => updatePiece(piece.id, 'printHours', parseFloat(e.target.value) || 0)}
                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        style={{ fontSize: '16px' }}
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Cantidad</label>
                      <input
                        type="number"
                        value={piece.quantity}
                        onChange={(e) => updatePiece(piece.id, 'quantity', parseInt(e.target.value) || 1)}
                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        style={{ fontSize: '16px' }}
                        min="1"
                      />
                    </div>
                  </div>

                  {/* Materials */}
                  <div className="border-t border-slate-100 pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-medium text-slate-600">
                        Materiales ({piece.materials?.length || 0})
                      </span>
                      <button
                        onClick={() => addMaterialToPiece(piece.id)}
                        className="text-xs text-slate-600 flex items-center gap-1 bg-slate-100 px-2 py-1 rounded-lg"
                      >
                        <Plus className="w-3 h-3" />
                        Añadir
                      </button>
                    </div>

                    {piece.materials?.map(material => (
                      <div key={material.id} className="bg-slate-50 rounded-lg p-3 mb-2">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2 flex-1">
                            {material.color && (
                              <span 
                                className="w-4 h-4 rounded-full border border-slate-300" 
                                style={{ backgroundColor: material.color }}
                              />
                            )}
                            <input
                              type="text"
                              value={material.materialName}
                              onChange={(e) => updatePieceMaterial(piece.id, material.id, 'materialName', e.target.value)}
                              className="text-sm font-medium bg-transparent outline-none flex-1"
                              style={{ fontSize: '16px' }}
                            />
                          </div>
                          <div className="flex gap-1">
                            {/* Botón de presets de material */}
                            <button
                              onClick={() => setShowMaterialPresets(showMaterialPresets === `${piece.id}-${material.id}` ? null : `${piece.id}-${material.id}`)}
                              disabled={materialsLoading || materialPresets.length === 0}
                              className={`p-1.5 rounded-lg transition-colors ${
                                materialsLoading || materialPresets.length === 0
                                  ? 'text-slate-300'
                                  : 'text-purple-600 hover:bg-purple-50'
                              }`}
                            >
                              <Bookmark className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => removePieceMaterial(piece.id, material.id)}
                              className="p-1.5 text-red-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                        
                        {/* Selector de presets de material */}
                        {showMaterialPresets === `${piece.id}-${material.id}` && (
                          <div className="mb-3 bg-white rounded-lg border border-purple-200 overflow-hidden">
                            <div className="p-2 bg-purple-50 border-b border-purple-100">
                              <div className="flex bg-white rounded-lg p-0.5">
                                {(['filament', 'resin'] as const).map(cat => (
                                  <button
                                    key={cat}
                                    onClick={() => setSelectedMaterialCategory(cat)}
                                    className={`flex-1 px-2 py-1 text-xs font-medium rounded-md transition-colors ${
                                      selectedMaterialCategory === cat
                                        ? 'bg-purple-600 text-white'
                                        : 'text-slate-600'
                                    }`}
                                  >
                                    {cat === 'filament' ? 'Filamentos' : 'Resinas'}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="max-h-32 overflow-y-auto">
                              {filteredMaterialPresets.length > 0 ? (
                                filteredMaterialPresets.map(preset => (
                                  <button
                                    key={preset.id}
                                    onClick={() => loadMaterialPreset(piece.id, material.id, preset.id)}
                                    className="w-full px-3 py-2 text-left hover:bg-purple-50 border-b border-slate-100 last:border-0"
                                  >
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        {preset.color && (
                                          <span 
                                            className="w-3 h-3 rounded-full border border-slate-300" 
                                            style={{ backgroundColor: preset.color }}
                                          />
                                        )}
                                        <span className="text-sm font-medium text-slate-900">{preset.name}</span>
                                        {preset.is_default && (
                                          <span className="text-[10px] bg-purple-100 text-purple-700 px-1 rounded">★</span>
                                        )}
                                      </div>
                                      <span className="text-xs text-purple-600 font-medium">
                                        {formatCurrency(preset.price_per_unit)}/{preset.unit}
                                      </span>
                                    </div>
                                    <div className="text-[10px] text-slate-500 mt-0.5">
                                      {preset.material_type} {preset.brand && `• ${preset.brand}`}
                                    </div>
                                  </button>
                                ))
                              ) : (
                                <p className="text-xs text-slate-400 text-center py-3">
                                  Sin presets de {selectedMaterialCategory === 'filament' ? 'filamento' : 'resina'}
                                </p>
                              )}
                            </div>
                            {onNavigateToSettings && (
                              <button
                                onClick={() => {
                                  setShowMaterialPresets(null)
                                  onNavigateToSettings()
                                }}
                                className="w-full px-3 py-2 text-xs text-purple-600 bg-purple-50 border-t border-purple-100 font-medium"
                              >
                                Gestionar materiales →
                              </button>
                            )}
                          </div>
                        )}
                        
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-500">
                              {material.category === 'resin' ? 'Vol.' : 'Peso'} ({material.unit})
                            </label>
                            <input
                              type="number"
                              value={material.weight || ''}
                              onChange={(e) => updatePieceMaterial(piece.id, material.id, 'weight', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm"
                              style={{ fontSize: '16px' }}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500">{currencySymbol}/kg</label>
                            <input
                              type="number"
                              value={material.pricePerKg || ''}
                              onChange={(e) => updatePieceMaterial(piece.id, material.id, 'pricePerKg', parseFloat(e.target.value) || 0)}
                              className="w-full px-2 py-1.5 border border-slate-200 rounded text-sm"
                              style={{ fontSize: '16px' }}
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-500">Tipo</label>
                            <select
                              value={material.materialType}
                              onChange={(e) => updatePieceMaterial(piece.id, material.id, 'materialType', e.target.value)}
                              className="w-full px-2 py-1.5 border border-slate-200 rounded text-xs"
                            >
                              <option value="PLA">PLA</option>
                              <option value="PETG">PETG</option>
                              <option value="ABS">ABS</option>
                              <option value="TPU">TPU</option>
                              <option value="ASA">ASA</option>
                              <option value="Nylon">Nylon</option>
                              <option value="Resina">Resina</option>
                            </select>
                          </div>
                        </div>
                        
                        {/* Coste del material */}
                        <div className="flex justify-between items-center mt-2 pt-2 border-t border-slate-100">
                          <span className="text-[10px] text-slate-500">Coste material:</span>
                          <span className="text-xs font-semibold text-emerald-600">
                            {formatCurrency((material.weight / (material.unit === 'kg' ? 1 : 1000)) * material.pricePerKg)}
                          </span>
                        </div>
                      </div>
                    ))}

                    {(!piece.materials || piece.materials.length === 0) && (
                      <p className="text-xs text-slate-400 text-center py-2">
                        Sin materiales añadidos
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )

      case 2: // Postprocessing
        return (
          <div className="space-y-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <h3 className="font-semibold text-slate-900">Postproducción</h3>
                <p className="text-xs text-slate-500">Costes adicionales (pintado, lijado, etc.)</p>
              </div>
              <div className="flex gap-2">
                {postprocessingPresets.length > 0 && (
                  <button
                    onClick={() => setShowPostprocessingPresets(!showPostprocessingPresets)}
                    className="flex items-center gap-1 px-3 py-2 bg-purple-600 text-white rounded-lg text-sm"
                  >
                    <Bookmark className="w-4 h-4" />
                    <ChevronDown className={`w-3 h-3 transition-transform ${showPostprocessingPresets ? 'rotate-180' : ''}`} />
                  </button>
                )}
                <button
                  onClick={addPostprocessingItem}
                  className="flex items-center gap-1 px-3 py-2 bg-slate-800 text-white rounded-lg text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Añadir
                </button>
              </div>
            </div>

            {/* Selector de presets de postproducción */}
            {showPostprocessingPresets && (
              <div className="bg-purple-50 rounded-xl p-3 border border-purple-200">
                <div className="text-xs font-medium text-purple-900 mb-2">Cargar preset:</div>
                <div className="space-y-1 max-h-40 overflow-y-auto">
                  {postprocessingPresetsLoading ? (
                    <div className="flex justify-center py-3">
                      <Loader2 className="w-5 h-5 animate-spin text-purple-600" />
                    </div>
                  ) : (
                    postprocessingPresets.map(preset => (
                      <button
                        key={preset.id}
                        onClick={() => loadPostprocessingPreset(preset.id)}
                        className="w-full px-3 py-2 bg-white rounded-lg border border-purple-200 hover:border-purple-400 text-left transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-sm font-medium text-slate-900">{preset.name}</span>
                            {preset.description && (
                              <p className="text-[10px] text-slate-500">{preset.description}</p>
                            )}
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-purple-600">
                              {formatCurrency(preset.cost_per_unit)}
                            </span>
                            <span className="text-[10px] text-slate-500 block">/{preset.unit}</span>
                          </div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
                {onNavigateToSettings && (
                  <button
                    onClick={() => {
                      setShowPostprocessingPresets(false)
                      onNavigateToSettings()
                    }}
                    className="w-full mt-2 px-3 py-2 text-xs text-purple-600 bg-white rounded-lg border border-purple-200 font-medium"
                  >
                    Gestionar presets →
                  </button>
                )}
              </div>
            )}

            {/* Lista de items de postproducción */}
            <div className="space-y-3 max-h-[45vh] overflow-y-auto">
              {postprocessingItems.map(item => (
                <div key={item.id} className="bg-white border border-slate-200 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => updatePostprocessingItem(item.id, 'name', e.target.value)}
                      placeholder="Nombre del elemento"
                      className="font-medium text-slate-900 bg-transparent outline-none flex-1"
                      style={{ fontSize: '16px' }}
                    />
                    <button
                      onClick={() => removePostprocessingItem(item.id)}
                      className="p-2 text-red-400"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs text-slate-500">Cantidad</label>
                      <input
                        type="number"
                        value={item.quantity || 1}
                        onChange={(e) => updatePostprocessingItem(item.id, 'quantity', parseFloat(e.target.value) || 1)}
                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        style={{ fontSize: '16px' }}
                        min="0.01"
                        step="0.01"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Unidad</label>
                      <select
                        value={item.unit || 'unidad'}
                        onChange={(e) => updatePostprocessingItem(item.id, 'unit', e.target.value)}
                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                      >
                        {POSTPROCESSING_UNITS.map(unit => (
                          <option key={unit} value={unit}>{unit}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs text-slate-500">Coste/unidad</label>
                      <input
                        type="number"
                        value={item.cost_per_unit || ''}
                        onChange={(e) => updatePostprocessingItem(item.id, 'cost_per_unit', parseFloat(e.target.value) || 0)}
                        placeholder={`${currencySymbol}0.00`}
                        className="w-full mt-1 px-3 py-2 border border-slate-200 rounded-lg text-sm"
                        style={{ fontSize: '16px' }}
                        min="0"
                        step="0.01"
                      />
                    </div>
                  </div>

                  {/* Total del item */}
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                    <span className="text-sm text-slate-600">Coste total:</span>
                    <span className="text-base font-bold text-slate-900">
                      {formatCurrency((item.cost_per_unit || 0) * (item.quantity || 1))}
                    </span>
                  </div>
                </div>
              ))}

              {postprocessingItems.length === 0 && (
                <div className="text-center py-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200">
                  <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm text-slate-500">Sin elementos de postproducción</p>
                  <p className="text-xs text-slate-400 mt-1">Añade pintado, lijado, barnizado, etc.</p>
                </div>
              )}
            </div>

            {/* Total de postproducción */}
            {postprocessingItems.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-emerald-800">Total postproducción:</span>
                  <span className="text-xl font-bold text-emerald-900">
                    {formatCurrency(totalPostprocessingCost)}
                  </span>
                </div>
              </div>
            )}
          </div>
        )

      case 3: // Electricity
        return (
          <div className="space-y-4">
            <MobileInput
              label="Coste electricidad (€/kWh)"
              type="number"
              value={electricityCost}
              onChange={(e) => setElectricityCost(parseFloat(e.target.value) || 0)}
              step="0.01"
            />
            
            <MobileInput
              label="Potencia impresora (kW)"
              type="number"
              value={printerPower}
              onChange={(e) => setPrinterPower(parseFloat(e.target.value) || 0)}
              step="0.01"
            />

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-amber-600" />
                <span className="font-medium text-amber-800">Coste energético</span>
              </div>
              <p className="text-2xl font-bold text-amber-900">
                {formatCurrency(totalPrintHours * electricityCost * printerPower)}
              </p>
              <p className="text-sm text-amber-600 mt-1">
                {totalPrintHours.toFixed(1)}h × {electricityCost}€/kWh × {printerPower}kW
              </p>
            </div>
          </div>
        )

      case 4: // Pricing
        return (
          <div className="space-y-4">
            <MobileInput
              label="IVA (%)"
              type="number"
              value={vatPercentage}
              onChange={(e) => setVatPercentage(parseFloat(e.target.value) || 0)}
            />
            
            <MobileInput
              label="Margen de beneficio (%)"
              type="number"
              value={profitMargin}
              onChange={(e) => setProfitMargin(parseFloat(e.target.value) || 0)}
            />

            <div className="bg-green-50 border border-green-200 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Euro className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">Precio de venta sugerido</span>
              </div>
              <p className="text-3xl font-bold text-green-900">
                {formatCurrency(salePrice.recommendedPrice)}
              </p>
              <p className="text-sm text-green-600 mt-1">
                Incluye {vatPercentage}% IVA + {profitMargin}% margen
              </p>
            </div>
          </div>
        )

      case 5: // Summary
        return (
          <div className="space-y-4">
            <div className="text-center mb-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Check className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Resumen del Proyecto</h3>
              <p className="text-sm text-slate-500">{projectName || 'Sin nombre'}</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600">Piezas totales</span>
                <span className="font-semibold">{pieces.reduce((s, p) => s + p.quantity, 0)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600">Peso total</span>
                <span className="font-semibold">
                  {totalFilamentWeight >= 1000 
                    ? `${(totalFilamentWeight/1000).toFixed(2)}kg` 
                    : `${totalFilamentWeight.toFixed(1)}g`
                  }
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span className="text-slate-600">Horas impresión</span>
                <span className="font-semibold">{totalPrintHours.toFixed(1)}h</span>
              </div>
              {postprocessingItems.length > 0 && (
                <div className="flex justify-between items-center p-3 bg-purple-50 rounded-xl">
                  <span className="text-purple-700">Postproducción</span>
                  <span className="font-bold text-purple-700">{formatCurrency(totalPostprocessingCost)}</span>
                </div>
              )}
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-xl">
                <span className="text-blue-700">Coste total</span>
                <span className="font-bold text-blue-700">{formatCurrency(costs.total)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-xl">
                <span className="text-green-700">Precio venta</span>
                <span className="font-bold text-green-700">{formatCurrency(salePrice.recommendedPrice)}</span>
              </div>
              <div className="flex justify-between items-center p-3 bg-emerald-50 rounded-xl">
                <span className="text-emerald-700">Beneficio</span>
                <span className="font-bold text-emerald-700">{formatCurrency(salePrice.recommendedPrice - costs.total)}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <button
                onClick={resetForm}
                className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-medium flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Nuevo
              </button>
              <button
                onClick={saveProject}
                disabled={isSaving || !projectName.trim()}
                className="flex-1 py-3 px-4 bg-slate-800 text-white rounded-xl font-medium flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {isSaving ? 'Guardando...' : 'Guardar'}
              </button>
            </div>
          </div>
        )
    }
  }

  return (
    <div className="pb-4">
      {/* Step Indicators */}
      <div className="px-4 mb-6">
        <div className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const Icon = step.icon
            const isActive = currentStep === index
            const isCompleted = currentStep > index
            
            return (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                className="flex flex-col items-center"
              >
                <div className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                  isActive 
                    ? 'bg-slate-800 text-white' 
                    : isCompleted 
                      ? 'bg-green-500 text-white'
                      : 'bg-slate-100 text-slate-400'
                }`}>
                  {isCompleted ? <Check className="w-4 h-4" /> : <Icon className="w-4 h-4" />}
                </div>
                <span className={`text-[9px] mt-1 ${
                  isActive ? 'text-slate-900 font-medium' : 'text-slate-400'
                }`}>
                  {step.title}
                </span>
              </button>
            )
          })}
        </div>
        
        {/* Progress bar */}
        <div className="h-1 bg-slate-100 rounded-full mt-4 overflow-hidden">
          <motion.div
            className="h-full bg-slate-800"
            initial={{ width: 0 }}
            animate={{ width: `${((currentStep + 1) / STEPS.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <motion.div
        key={currentStep}
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        onDragEnd={handleSwipe}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -50 }}
        className="px-4"
      >
        {renderStep()}
      </motion.div>

      {/* Navigation Buttons */}
      {currentStep < STEPS.length - 1 && (
        <div className="px-4 mt-6 flex gap-3">
          {currentStep > 0 && (
            <button
              onClick={prevStep}
              className="flex-1 py-3 px-4 bg-slate-100 text-slate-700 rounded-xl font-medium flex items-center justify-center gap-2"
            >
              <ChevronLeft className="w-4 h-4" />
              Anterior
            </button>
          )}
          <button
            onClick={nextStep}
            className="flex-1 py-3 px-4 bg-slate-800 text-white rounded-xl font-medium flex items-center justify-center gap-2"
          >
            Siguiente
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Swipe hint */}
      <p className="text-[10px] text-slate-400 text-center mt-4">
        ← Desliza para navegar →
      </p>
    </div>
  )
}
