'use client'

import React from 'react'
import { Receipt } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import PullToRefresh from '../PullToRefresh'
import MobileFilterChips from './MobileFilterChips'
import MobileExpenseCard from './MobileExpenseCard'
import { useSwipeActions } from '@/hooks/useSwipeActions'
import type { Expense } from '@/types'

interface MobileExpensesListProps {
  expenses: Expense[]
  searchTerm: string
  statusFilter: string
  onStatusFilterChange: (value: string) => void
  onEditExpense: (expense: Expense) => void
  onDeleteExpense: (id: string) => void
  onRefresh: () => Promise<void>
}

const statusFilters = [
  { value: 'all', label: 'Todos' },
  { value: 'paid', label: 'Pagados' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'cancelled', label: 'Cancelados' },
]

export default function MobileExpensesList({
  expenses,
  searchTerm,
  statusFilter,
  onStatusFilterChange,
  onEditExpense,
  onDeleteExpense,
  onRefresh,
}: MobileExpensesListProps) {
  const { swipedItemId, handleSwipe, clearSwipe } = useSwipeActions({ threshold: 80 })

  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch = !searchTerm ||
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.date.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || expense.status === statusFilter
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

      {/* Expenses List with Pull to Refresh */}
      <PullToRefresh onRefresh={onRefresh}>
        <div className="px-4 space-y-2.5">
          {filteredExpenses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-8 text-center border border-slate-100"
            >
              <Receipt className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-semibold text-slate-900 mb-1">Sin gastos</h3>
              <p className="text-sm text-slate-500">
                {searchTerm || statusFilter !== 'all'
                  ? 'No hay gastos con estos filtros'
                  : 'Registra tu primer gasto'}
              </p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredExpenses.map((expense, index) => (
                <motion.div
                  key={expense.id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <MobileExpenseCard
                    expense={expense}
                    isSwiped={swipedItemId === expense.id}
                    onSwipe={handleSwipe}
                    onEdit={(e) => { clearSwipe(); onEditExpense(e) }}
                    onDelete={(id) => { clearSwipe(); onDeleteExpense(id) }}
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
