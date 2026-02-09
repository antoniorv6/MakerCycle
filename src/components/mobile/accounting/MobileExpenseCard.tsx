'use client'

import React from 'react'
import { motion, PanInfo } from 'framer-motion'
import { Edit, Trash2, Calendar, Tag } from 'lucide-react'
import { useFormatCurrency } from '@/hooks/useFormatCurrency'
import { useHaptics } from '@/hooks/useCapacitor'
import type { Expense } from '@/types'

interface MobileExpenseCardProps {
  expense: Expense
  isSwiped: boolean
  onSwipe: (id: string, info: PanInfo) => void
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

export default function MobileExpenseCard({ expense, isSwiped, onSwipe, onEdit, onDelete }: MobileExpenseCardProps) {
  const { formatCurrency } = useFormatCurrency()
  const { triggerHaptic } = useHaptics()

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-700 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'paid': return 'Pagado'
      case 'pending': return 'Pendiente'
      case 'cancelled': return 'Cancelado'
      default: return status
    }
  }

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      'Materiales': 'bg-blue-100 text-blue-700',
      'Equipamiento': 'bg-purple-100 text-purple-700',
      'Electricidad': 'bg-yellow-100 text-yellow-700',
      'Software': 'bg-indigo-100 text-indigo-700',
      'Mantenimiento': 'bg-orange-100 text-orange-700',
      'Marketing': 'bg-pink-100 text-pink-700',
      'Transporte': 'bg-teal-100 text-teal-700',
      'Otros': 'bg-gray-100 text-gray-700',
    }
    return colors[category] || 'bg-gray-100 text-gray-700'
  }

  const handleAction = (action: () => void) => {
    triggerHaptic('medium')
    action()
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Action buttons behind */}
      <div className="absolute right-0 top-0 bottom-0 w-20 flex items-stretch">
        <button
          onClick={() => handleAction(() => onEdit(expense))}
          className="flex-1 bg-blue-500 flex items-center justify-center"
        >
          <Edit className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={() => handleAction(() => onDelete(expense.id))}
          className="flex-1 bg-red-500 flex items-center justify-center"
        >
          <Trash2 className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Card front */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -80, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => onSwipe(expense.id, info)}
        animate={{ x: isSwiped ? -80 : 0 }}
        className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm relative"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            {/* Description and category */}
            <div className="flex items-center gap-2 mb-1.5">
              <h3 className="text-sm font-semibold text-slate-900 truncate">{expense.description}</h3>
            </div>
            <div className="flex items-center gap-2 mb-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${getCategoryColor(expense.category)}`}>
                {expense.category}
              </span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getStatusStyle(expense.status)}`}>
                {getStatusText(expense.status)}
              </span>
              {expense.team_id && (
                <span className="text-[10px] text-blue-600 font-medium">Equipo</span>
              )}
            </div>
            {expense.notes && (
              <p className="text-[10px] text-slate-400 truncate">{expense.notes}</p>
            )}
          </div>

          {/* Amount and date */}
          <div className="text-right ml-3 flex-shrink-0">
            <p className="text-base font-bold text-red-600">{formatCurrency(expense.amount)}</p>
            <div className="flex items-center gap-1 justify-end text-slate-400 mt-0.5">
              <Calendar className="w-3 h-3" />
              <span className="text-[10px]">{formatDate(expense.date)}</span>
            </div>
          </div>
        </div>

        {/* Swipe hint */}
        {!isSwiped && (
          <p className="text-[9px] text-slate-300 text-center mt-2">← Desliza para ver acciones</p>
        )}
      </motion.div>
    </div>
  )
}
