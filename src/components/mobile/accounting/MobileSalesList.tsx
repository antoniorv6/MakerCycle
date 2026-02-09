'use client'

import React from 'react'
import { Package } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import PullToRefresh from '../PullToRefresh'
import MobileFilterChips from './MobileFilterChips'
import MobileSaleCard from './MobileSaleCard'
import { useSwipeActions } from '@/hooks/useSwipeActions'
import type { Sale } from '@/types'

interface MobileSalesListProps {
  sales: Sale[]
  searchTerm: string
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  onEditSale: (sale: Sale) => void
  onDeleteSale: (id: string) => void
  onGenerateInvoice: (sale: Sale) => void
  onRefresh: () => Promise<void>
}

const statusFilters = [
  { value: 'all', label: 'Todas' },
  { value: 'completed', label: 'Completadas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'cancelled', label: 'Canceladas' },
]

export default function MobileSalesList({
  sales,
  searchTerm,
  statusFilter,
  onStatusFilterChange,
  onEditSale,
  onDeleteSale,
  onGenerateInvoice,
  onRefresh,
}: MobileSalesListProps) {
  const { swipedItemId, handleSwipe, clearSwipe } = useSwipeActions({ threshold: 80 })

  const filteredSales = sales.filter(sale => {
    const matchesSearch = !searchTerm ||
      sale.items?.some(item => item.project_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      sale.date.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || sale.status === statusFilter
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-3">
      {/* Filter Chips */}
      <div className="px-4">
        <MobileFilterChips
          options={statusFilters}
          selected={statusFilter}
          onChange={onStatusFilterChange}
        />
      </div>

      {/* Sales List with Pull to Refresh */}
      <PullToRefresh onRefresh={onRefresh}>
        <div className="px-4 space-y-2.5">
          {filteredSales.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 text-center border border-slate-100"
            >
              <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 mb-1">Sin ventas</h3>
              <p className="text-sm text-slate-500">
                {searchTerm || statusFilter !== 'all'
                  ? 'No hay ventas con estos filtros'
                  : 'Registra tu primera venta'}
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredSales.map((sale, index) => (
                <motion.div
                  key={sale.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <MobileSaleCard
                    sale={sale}
                    isSwiped={swipedItemId === sale.id}
                    onSwipe={handleSwipe}
                    onEdit={(s) => { clearSwipe(); onEditSale(s) }}
                    onDelete={(id) => { clearSwipe(); onDeleteSale(id) }}
                    onGenerateInvoice={(s) => { clearSwipe(); onGenerateInvoice(s) }}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </PullToRefresh>
    </div>
  )
}
