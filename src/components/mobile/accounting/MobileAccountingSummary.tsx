'use client'

import React from 'react'
import { TrendingUp, Euro } from 'lucide-react'
import { useFormatCurrency } from '@/hooks/useFormatCurrency'
import type { AccountingStats } from '@/types'

interface MobileAccountingSummaryProps {
  stats: AccountingStats
}

export default function MobileAccountingSummary({ stats }: MobileAccountingSummaryProps) {
  const { formatCurrency } = useFormatCurrency()

  return (
    <div className="flex gap-3 px-4">
      <div className="flex-1 bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3 border border-emerald-200">
        <div className="flex items-center gap-2 mb-1">
          <Euro className="w-4 h-4 text-emerald-600" />
          <span className="text-xs font-medium text-emerald-600">Ingresos</span>
        </div>
        <p className="text-lg font-bold text-emerald-900">{formatCurrency(stats.totalRevenue)}</p>
      </div>
      <div className="flex-1 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-3 border border-blue-200">
        <div className="flex items-center gap-2 mb-1">
          <TrendingUp className="w-4 h-4 text-blue-600" />
          <span className="text-xs font-medium text-blue-600">B. Neto</span>
        </div>
        <p className={`text-lg font-bold ${stats.netProfit >= 0 ? 'text-blue-900' : 'text-red-600'}`}>
          {formatCurrency(stats.netProfit)}
        </p>
      </div>
    </div>
  )
}
