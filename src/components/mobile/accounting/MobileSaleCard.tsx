'use client'

import React from 'react'
import { motion, PanInfo } from 'framer-motion'
import { Edit, FileText, Trash2, Package, Calendar, Euro, TrendingUp, UserCheck, Users, User } from 'lucide-react'
import { useFormatCurrency } from '@/hooks/useFormatCurrency'
import { useClients } from '@/hooks/useClients'
import { useHaptics } from '@/hooks/useCapacitor'
import type { Sale } from '@/types'

interface MobileSaleCardProps {
  sale: Sale
  isSwiped: boolean
  onSwipe: (id: string, info: PanInfo) => void
  onEdit: (sale: Sale) => void
  onDelete: (id: string) => void
  onGenerateInvoice: (sale: Sale) => void
}

export default function MobileSaleCard({ sale, isSwiped, onSwipe, onEdit, onDelete, onGenerateInvoice }: MobileSaleCardProps) {
  const { formatCurrency } = useFormatCurrency()
  const { clients } = useClients()
  const { triggerHaptic } = useHaptics()

  const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`

  const getClientName = (clientId: string | null | undefined) => {
    if (!clientId) return 'Sin cliente'
    const client = clients.find(c => c.id === clientId)
    return client ? client.name : 'Cliente no encontrado'
  }

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700 border-green-200'
      case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
      case 'cancelled': return 'bg-red-100 text-red-700 border-red-200'
      default: return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed': return 'Completada'
      case 'pending': return 'Pendiente'
      case 'cancelled': return 'Cancelada'
      default: return status
    }
  }

  const handleAction = (action: () => void) => {
    triggerHaptic('medium')
    action()
  }

  return (
    <div className="relative overflow-hidden rounded-2xl">
      {/* Action buttons behind */}
      <div className="absolute right-0 top-0 bottom-0 w-40 flex items-stretch">
        <button
          onClick={() => handleAction(() => onEdit(sale))}
          className="flex-1 bg-blue-500 flex items-center justify-center"
        >
          <Edit className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={() => handleAction(() => onGenerateInvoice(sale))}
          className="flex-1 bg-emerald-500 flex items-center justify-center"
        >
          <FileText className="w-5 h-5 text-white" />
        </button>
        <button
          onClick={() => handleAction(() => onDelete(sale.id))}
          className="flex-1 bg-red-500 flex items-center justify-center"
        >
          <Trash2 className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Card front */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -160, right: 0 }}
        dragElastic={0.1}
        onDragEnd={(_, info) => onSwipe(sale.id, info)}
        animate={{ x: isSwiped ? -160 : 0 }}
        className="bg-white rounded-2xl p-3.5 border border-slate-100 shadow-sm relative"
      >
        {/* Header: project count + status + date */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1">
              <Package className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-xs font-semibold text-slate-700">
                {sale.items_count} proy.
              </span>
            </div>
            <span className={`text-[10px] px-2 py-0.5 rounded-full border font-medium ${getStatusStyle(sale.status)}`}>
              {getStatusText(sale.status)}
            </span>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <Calendar className="w-3 h-3" />
            <span className="text-[10px]">{formatDate(sale.date)}</span>
          </div>
        </div>

        {/* Project names */}
        {sale.items && sale.items.length > 0 && (
          <div className="mb-2.5">
            {sale.items.slice(0, 2).map((item, i) => (
              <div key={i} className="flex items-center gap-1.5 text-xs text-slate-600">
                <span className="w-1 h-1 bg-blue-400 rounded-full flex-shrink-0" />
                <span className="truncate">{item.project_name}</span>
                <span className="text-[10px] text-slate-400 bg-slate-50 px-1 py-0.5 rounded flex-shrink-0">x{item.quantity}</span>
              </div>
            ))}
            {sale.items.length > 2 && (
              <p className="text-[10px] text-slate-400 ml-2.5">+{sale.items.length - 2} más</p>
            )}
          </div>
        )}

        {/* Financial summary row */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[10px] text-slate-400">Total</p>
              <p className="text-sm font-bold text-slate-900">{formatCurrency(sale.total_amount)}</p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Beneficio</p>
              <p className={`text-xs font-semibold ${sale.total_profit >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatCurrency(sale.total_profit)}
              </p>
            </div>
            <div>
              <p className="text-[10px] text-slate-400">Margen</p>
              <p className={`text-xs font-semibold ${sale.total_margin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {formatPercentage(sale.total_margin)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-slate-400">
            <UserCheck className="w-3 h-3" />
            <span className="text-[10px] truncate max-w-[70px]">{getClientName(sale.client_id)}</span>
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
