'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, ChevronRight, Calendar, Printer } from 'lucide-react'
import { usePrinterPresets } from '@/hooks/usePrinterPresets'
import { useFormatCurrency } from '@/hooks/useFormatCurrency'
import { useSales } from '@/hooks/useSales'
import { useHaptics } from '@/hooks/useCapacitor'
import type { Sale } from '@/types'

export default function MobileAmortizations() {
  const { presets: printerPresets, getAmortizationData } = usePrinterPresets()
  const { sales } = useSales()
  const { formatCurrency } = useFormatCurrency()
  const { triggerHaptic } = useHaptics()
  const [expandedPrinters, setExpandedPrinters] = useState<Set<string>>(new Set())

  const amortizingPrinters = printerPresets.filter(printer => {
    if (printer.purchase_price <= 0) return false
    const data = getAmortizationData(printer)
    return !data.isFullyAmortized && (printer.is_being_amortized || data.remainingAmount > 0)
  })

  const toggleExpanded = (printerId: string) => {
    triggerHaptic('selection')
    const newExpanded = new Set(expandedPrinters)
    if (newExpanded.has(printerId)) {
      newExpanded.delete(printerId)
    } else {
      newExpanded.add(printerId)
    }
    setExpandedPrinters(newExpanded)
  }

  const getSalesForPrinter = (printerId: string): Sale[] => {
    return sales.filter(sale =>
      sale.printer_amortizations?.some(amort => amort.printer_preset_id === printerId)
    )
  }

  const getTotalAmortizedForPrinter = (printerId: string): number => {
    return getSalesForPrinter(printerId).reduce((sum, sale) => {
      const amortization = sale.printer_amortizations?.find(a => a.printer_preset_id === printerId)
      return sum + (amortization?.amortization_amount || 0)
    }, 0)
  }

  if (amortizingPrinters.length === 0) {
    return (
      <div className="px-4">
        <div className="bg-white rounded-2xl p-8 text-center border border-slate-100">
          <Printer className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-900 mb-1">Sin amortizaciones</h3>
          <p className="text-sm text-slate-500">Las impresoras en amortización aparecerán aquí</p>
        </div>
      </div>
    )
  }

  return (
    <div className="px-4 space-y-3">
      {amortizingPrinters.map(printer => {
        const amortizationData = getAmortizationData(printer)
        const printerSales = getSalesForPrinter(printer.id)
        const totalAmortized = getTotalAmortizedForPrinter(printer.id)
        const isExpanded = expandedPrinters.has(printer.id)

        return (
          <div
            key={printer.id}
            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
          >
            {/* Header - always visible */}
            <button
              onClick={() => toggleExpanded(printer.id)}
              className="w-full p-3.5 text-left active:bg-slate-50 transition-colors"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {isExpanded
                    ? <ChevronDown className="w-4 h-4 text-purple-600 flex-shrink-0" />
                    : <ChevronRight className="w-4 h-4 text-purple-600 flex-shrink-0" />
                  }
                  <span className="font-semibold text-slate-900 text-sm truncate">{printer.name}</span>
                  {printer.brand && (
                    <span className="text-[10px] text-slate-400 truncate">{printer.brand}</span>
                  )}
                </div>
                <span className="text-xs font-medium text-purple-600">
                  {amortizationData.progress.toFixed(0)}%
                </span>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-slate-200 rounded-full h-2 mb-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    amortizationData.isFullyAmortized ? 'bg-green-500' : 'bg-purple-500'
                  }`}
                  style={{ width: `${Math.min(amortizationData.progress, 100)}%` }}
                />
              </div>

              {/* Summary row */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">
                  Compra: <span className="font-medium text-slate-700">{formatCurrency(printer.purchase_price)}</span>
                </span>
                <span className="text-emerald-600 font-medium">
                  {formatCurrency(totalAmortized)} amortizado
                </span>
              </div>
            </button>

            {/* Expanded details */}
            <AnimatePresence>
              {isExpanded && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <div className="px-3.5 pb-3.5 border-t border-slate-100">
                    {/* Stats */}
                    <div className="grid grid-cols-2 gap-2 py-3">
                      <div className="bg-emerald-50 rounded-xl p-2.5">
                        <p className="text-[10px] text-emerald-600 font-medium">Amortizado</p>
                        <p className="text-sm font-bold text-emerald-700">{formatCurrency(totalAmortized)}</p>
                      </div>
                      <div className="bg-purple-50 rounded-xl p-2.5">
                        <p className="text-[10px] text-purple-600 font-medium">Pendiente</p>
                        <p className="text-sm font-bold text-purple-700">{formatCurrency(amortizationData.remainingAmount)}</p>
                      </div>
                    </div>

                    {/* Sales list */}
                    <p className="text-xs font-medium text-slate-700 mb-2">
                      Ventas asociadas ({printerSales.length})
                    </p>
                    {printerSales.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-3">Sin ventas asociadas</p>
                    ) : (
                      <div className="space-y-1.5">
                        {printerSales.map(sale => {
                          const amortization = sale.printer_amortizations?.find(
                            a => a.printer_preset_id === printer.id
                          )
                          if (!amortization) return null

                          return (
                            <div key={sale.id} className="bg-slate-50 rounded-xl p-2.5">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-1.5">
                                  <Calendar className="w-3 h-3 text-slate-400" />
                                  <span className="text-xs text-slate-600">
                                    {new Date(sale.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
                                  </span>
                                  {sale.items && sale.items.length > 0 && (
                                    <span className="text-[10px] text-slate-400">
                                      {sale.items.length} proy.
                                    </span>
                                  )}
                                </div>
                                <span className="text-xs font-semibold text-purple-700">
                                  {formatCurrency(amortization.amortization_amount)}
                                </span>
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
