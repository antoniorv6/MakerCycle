'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X, Plus } from 'lucide-react'
import { useSales } from '@/hooks/useSales'
import { useExpenses } from '@/hooks/useExpenses'
import { useCompanySettings } from '@/hooks/useCompanySettings'
import { useFormatCurrency } from '@/hooks/useFormatCurrency'
import { useHaptics } from '@/hooks/useCapacitor'
import MobileAccountingSummary from './accounting/MobileAccountingSummary'
import MobileSalesList from './accounting/MobileSalesList'
import MobileExpensesList from './accounting/MobileExpensesList'
import MobileAmortizations from './accounting/MobileAmortizations'
import MobileAddSaleForm from './accounting/MobileAddSaleForm'
import MobileAddExpenseForm from './accounting/MobileAddExpenseForm'
import { InvoiceForm } from '../accounting/InvoiceForm'
import { InvoiceService } from '@/services/invoiceService'
import { salesService } from '@/services/salesService'
import { AccountingSkeleton } from '../skeletons'
import AdvancedStatistics from '@/components/AdvancedStatistics'
import type { Sale, Expense, SaleFormData, ExpenseFormData, AccountingStats } from '@/types'
import { toast } from 'react-hot-toast'

type TabType = 'sales' | 'expenses' | 'amortizations'

export default function MobileAccounting() {
  const [activeTab, setActiveTab] = useState<TabType>('sales')
  const [searchTerm, setSearchTerm] = useState('')
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [salesStatusFilter, setSalesStatusFilter] = useState('all')
  const [expensesStatusFilter, setExpensesStatusFilter] = useState('all')
  const [showAddSaleForm, setShowAddSaleForm] = useState(false)
  const [showAddExpenseForm, setShowAddExpenseForm] = useState(false)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [showInvoiceForm, setShowInvoiceForm] = useState(false)
  const [selectedSaleForInvoice, setSelectedSaleForInvoice] = useState<Sale | null>(null)
  const [showAdvancedStats, setShowAdvancedStats] = useState(false)

  const { triggerHaptic } = useHaptics()

  const {
    sales,
    loading: salesLoading,
    createSale,
    updateSale,
    deleteSale,
    getSaleStats,
    refetch: refetchSales,
  } = useSales()

  const {
    expenses,
    loading: expensesLoading,
    createExpense,
    updateExpense,
    deleteExpense,
    getExpenseStats,
    refetch: refetchExpenses,
  } = useExpenses()

  const { companyData } = useCompanySettings()
  const { currencySymbol } = useFormatCurrency()

  const loading = salesLoading || expensesLoading

  // Handlers
  const handleAddSale = async (saleData: SaleFormData) => {
    try {
      if (editingSale) {
        await updateSale(editingSale.id, {
          date: saleData.date,
          team_id: saleData.team_id,
          client_id: saleData.client_id
        })
        if (editingSale.items) {
          const items = saleData.items.map(item => ({
            id: '',
            sale_id: editingSale.id,
            project_id: item.project_id || null,
            project_name: item.project_name,
            unit_cost: item.unit_cost,
            quantity: item.quantity,
            sale_price: item.sale_price,
            print_hours: item.print_hours,
            created_at: '',
            updated_at: ''
          }))
          await salesService.updateSaleItems(editingSale.id, items)
        }
        if (saleData.printer_amortizations) {
          const totalAmount = saleData.items.reduce((sum, item) => sum + item.sale_price, 0)
          const totalCost = saleData.items.reduce((sum, item) => sum + (item.unit_cost * item.quantity), 0)
          const profitBeforeAmortization = totalAmount - totalCost
          await salesService.updateSaleAmortizations(
            editingSale.id,
            saleData.printer_amortizations,
            profitBeforeAmortization
          )
        }
        setEditingSale(null)
      } else {
        await createSale(saleData)
      }
      setShowAddSaleForm(false)
    } catch (error) {
      console.error('Error saving sale:', error)
    }
  }

  const handleAddExpense = async (expenseData: ExpenseFormData) => {
    try {
      if (editingExpense) {
        await updateExpense(editingExpense.id, {
          description: expenseData.description,
          amount: expenseData.amount,
          category: expenseData.category,
          date: expenseData.date,
          notes: expenseData.notes,
          team_id: expenseData.team_id
        })
        setEditingExpense(null)
      } else {
        await createExpense(expenseData)
      }
      setShowAddExpenseForm(false)
    } catch (error) {
      console.error('Error saving expense:', error)
    }
  }

  const handleDeleteSale = async (id: string) => {
    try {
      await deleteSale(id)
    } catch (error) {
      console.error('Error deleting sale:', error)
    }
  }

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id)
    } catch (error) {
      console.error('Error deleting expense:', error)
    }
  }

  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale)
    setShowAddSaleForm(true)
  }

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense)
    setShowAddExpenseForm(true)
  }

  const handleGenerateInvoice = (sale: Sale) => {
    if (!sale.client_id) {
      toast.error('Esta venta necesita un cliente asignado antes de generar el albarán.')
      return
    }
    setSelectedSaleForInvoice(sale)
    setShowInvoiceForm(true)
  }

  const handleGeneratePDF = async (invoiceData: Parameters<typeof InvoiceService.generatePDF>[0]) => {
    try {
      await InvoiceService.generatePDF(invoiceData, companyData, currencySymbol)
      setShowInvoiceForm(false)
      setSelectedSaleForInvoice(null)
    } catch (error) {
      console.error('Error generating PDF:', error)
    }
  }

  const calculateStats = (): AccountingStats => {
    const saleStats = getSaleStats()
    const expenseStats = getExpenseStats()
    return {
      totalRevenue: saleStats.totalRevenue,
      totalCosts: saleStats.totalCosts,
      totalExpenses: expenseStats.totalExpenses,
      totalProfit: saleStats.totalProfit,
      netProfit: saleStats.totalProfit - expenseStats.totalExpenses,
      averageMargin: saleStats.averageMargin,
      totalSales: saleStats.totalSales,
      averageEurosPerHour: saleStats.averageEurosPerHour,
      totalPrintHours: saleStats.totalPrintHours,
      totalProducts: saleStats.totalProducts,
      totalExpensesCount: expenseStats.totalExpensesCount
    }
  }

  if (loading) {
    return <AccountingSkeleton />
  }

  if (showAdvancedStats) {
    return <AdvancedStatistics onBack={() => setShowAdvancedStats(false)} />
  }

  const stats = calculateStats()

  const tabs: { id: TabType; label: string }[] = [
    { id: 'sales', label: 'Ventas' },
    { id: 'expenses', label: 'Gastos' },
    { id: 'amortizations', label: 'Amort.' },
  ]

  const handleRefreshSales = async () => {
    await refetchSales()
  }

  const handleRefreshExpenses = async () => {
    await refetchExpenses()
  }

  return (
    <div className="pb-4">
      {/* Financial Summary */}
      <MobileAccountingSummary stats={stats} />

      {/* Advanced stats link */}
      <div className="flex justify-center py-2">
        <button
          onClick={() => setShowAdvancedStats(true)}
          className="text-xs text-slate-500 active:text-slate-700"
        >
          Ver estadísticas avanzadas
        </button>
      </div>

      {/* Tab Pills + Search */}
      <div className="px-4 mb-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex gap-1.5 bg-slate-100 rounded-xl p-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id)
                  setSearchTerm('')
                  setSearchExpanded(false)
                  triggerHaptic('selection')
                }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Search toggle */}
          {activeTab !== 'amortizations' && (
            <button
              onClick={() => {
                setSearchExpanded(!searchExpanded)
                if (searchExpanded) setSearchTerm('')
              }}
              className="p-2 rounded-xl bg-slate-100 active:bg-slate-200"
            >
              {searchExpanded ? <X className="w-4 h-4 text-slate-600" /> : <Search className="w-4 h-4 text-slate-600" />}
            </button>
          )}
        </div>

        {/* Expandable search bar */}
        <AnimatePresence>
          {searchExpanded && activeTab !== 'amortizations' && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="relative mb-3">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder={activeTab === 'sales' ? 'Buscar ventas...' : 'Buscar gastos...'}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 bg-white border border-slate-200 rounded-xl text-base focus:ring-2 focus:ring-slate-500 focus:border-slate-500"
                  style={{ fontSize: '16px' }}
                  autoFocus
                />
                {searchTerm && (
                  <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 p-1">
                    <X className="w-4 h-4 text-slate-400" />
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, x: 15 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.2 }}
      >
        {activeTab === 'sales' && (
          <MobileSalesList
            sales={sales}
            searchTerm={searchTerm}
            statusFilter={salesStatusFilter}
            onStatusFilterChange={setSalesStatusFilter}
            onEditSale={handleEditSale}
            onDeleteSale={handleDeleteSale}
            onGenerateInvoice={handleGenerateInvoice}
            onRefresh={handleRefreshSales}
          />
        )}
        {activeTab === 'expenses' && (
          <MobileExpensesList
            expenses={expenses}
            searchTerm={searchTerm}
            statusFilter={expensesStatusFilter}
            onStatusFilterChange={setExpensesStatusFilter}
            onEditExpense={handleEditExpense}
            onDeleteExpense={handleDeleteExpense}
            onRefresh={handleRefreshExpenses}
          />
        )}
        {activeTab === 'amortizations' && (
          <MobileAmortizations />
        )}
      </motion.div>

      {/* FAB - Floating Action Button */}
      {activeTab !== 'amortizations' && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.3 }}
          onClick={() => {
            triggerHaptic('medium')
            if (activeTab === 'sales') {
              setEditingSale(null)
              setShowAddSaleForm(true)
            } else {
              setEditingExpense(null)
              setShowAddExpenseForm(true)
            }
          }}
          className="fixed bottom-24 right-4 z-30 w-14 h-14 bg-gradient-to-br from-slate-700 to-slate-900 rounded-full shadow-lg flex items-center justify-center active:scale-95 transition-transform"
        >
          <Plus className="w-6 h-6 text-white" />
        </motion.button>
      )}

      {/* Forms */}
      <AnimatePresence>
        {showAddSaleForm && (
          <MobileAddSaleForm
            sale={editingSale}
            onSave={handleAddSale}
            onCancel={() => { setShowAddSaleForm(false); setEditingSale(null) }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAddExpenseForm && (
          <MobileAddExpenseForm
            expense={editingExpense}
            onSave={handleAddExpense}
            onCancel={() => { setShowAddExpenseForm(false); setEditingExpense(null) }}
          />
        )}
      </AnimatePresence>

      {/* Invoice Form */}
      {showInvoiceForm && selectedSaleForInvoice && (
        <InvoiceForm
          sale={selectedSaleForInvoice}
          onClose={() => { setShowInvoiceForm(false); setSelectedSaleForInvoice(null) }}
          onGeneratePDF={handleGeneratePDF}
        />
      )}
    </div>
  )
}
