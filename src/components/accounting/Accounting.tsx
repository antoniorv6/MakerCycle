import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/providers/AuthProvider';
import { useSales } from '@/hooks/useSales';
import { useExpenses } from '@/hooks/useExpenses';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { useFormatCurrency } from '@/hooks/useFormatCurrency';
import { AccountingHeader } from './AccountingHeader';
import { SalesTable } from './SalesTable';
import { ExpensesTable } from './ExpensesTable';
import { AmortizationsSection } from './AmortizationsSection';
import { AddSaleForm } from './AddSaleForm';
import { AddExpenseForm } from './AddExpenseForm';
import { InvoiceForm } from './InvoiceForm';
import AdvancedStatistics from '@/components/AdvancedStatistics';
import { AccountingSkeleton } from '@/components/skeletons';
import { logger } from '@/lib/logger';
import { salesService } from '@/services/salesService';
import type { Sale, Expense, SaleFormData, ExpenseFormData } from '@/types';
import { toast } from 'react-hot-toast';

type TabType = 'sales' | 'expenses' | 'amortizations';

export default function Accounting() {
  const [activeTab, setActiveTab] = useState<TabType>('sales');
  const [searchTerm, setSearchTerm] = useState('');
  const [expenseSearchTerm, setExpenseSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddExpenseForm, setShowAddExpenseForm] = useState(false);
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [showInvoiceForm, setShowInvoiceForm] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedSaleForInvoice, setSelectedSaleForInvoice] = useState<Sale | null>(null);

  const { user } = useAuth();
  const { 
    sales, 
    loading: salesLoading, 
    createSale, 
    updateSale, 
    deleteSale, 
    getSaleStats 
  } = useSales();
  
  const { 
    expenses, 
    loading: expensesLoading, 
    createExpense, 
    updateExpense, 
    deleteExpense, 
    getExpenseStats 
  } = useExpenses();

  const { companyData } = useCompanySettings();
  const { currencySymbol } = useFormatCurrency();

  const loading = salesLoading || expensesLoading;

  const handleAddSale = async (saleData: SaleFormData) => {
    try {
      if (editingSale) {
        // For editing, we need to update the sale and its items
        await updateSale({
          id: editingSale.id,
          updates: {
            date: saleData.date,
            team_id: saleData.team_id,
            client_id: saleData.client_id
          }
        });
        
        // Update sale items
        if (editingSale.items) {
          const items = saleData.items.map(item => ({
            id: '', // Will be set by the service
            sale_id: editingSale.id,
            project_id: item.project_id || null,
            project_name: item.project_name,
            unit_cost: item.unit_cost,
            quantity: item.quantity,
            sale_price: item.sale_price,
            print_hours: item.print_hours,
            created_at: '',
            updated_at: ''
          }));
          await salesService.updateSaleItems(editingSale.id, items);
        }

        // Update printer amortizations
        if (saleData.printer_amortizations) {
          const totalAmount = saleData.items.reduce((sum, item) => sum + item.sale_price, 0);
          const totalCost = saleData.items.reduce((sum, item) => sum + (item.unit_cost * item.quantity), 0);
          const profitBeforeAmortization = totalAmount - totalCost;
          
          await salesService.updateSaleAmortizations(
            editingSale.id,
            saleData.printer_amortizations,
            profitBeforeAmortization
          );
        }
        
        setEditingSale(null);
      } else {
        await createSale(saleData);
      }
      setShowAddForm(false);
    } catch (error) {
      logger.error('Error saving sale:', error);
    }
  };

  const handleAddExpense = async (expenseData: ExpenseFormData) => {
    try {
      if (editingExpense) {
        await updateExpense({
          id: editingExpense.id,
          updates: {
            description: expenseData.description,
            amount: expenseData.amount,
            category: expenseData.category,
            date: expenseData.date,
            notes: expenseData.notes,
            team_id: expenseData.team_id
          }
        });
        setEditingExpense(null);
      } else {
        await createExpense(expenseData);
      }
      setShowAddExpenseForm(false);
    } catch (error) {
      logger.error('Error saving expense:', error);
    }
  };

  const handleDeleteSale = async (id: string) => {
    try {
      await deleteSale(id);
    } catch (error) {
      logger.error('Error deleting sale:', error);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id);
    } catch (error) {
      logger.error('Error deleting expense:', error);
    }
  };

  const handleEditSale = (sale: Sale) => {
    setEditingSale(sale);
    setShowAddForm(true);
  };

  const handleEditExpense = (expense: Expense) => {
    setEditingExpense(expense);
    setShowAddExpenseForm(true);
  };

  const handleGenerateInvoice = (sale: Sale) => {
    // Validar que la venta tenga un cliente asignado
    if (!sale.client_id) {
      toast.error('Esta venta necesita un cliente asignado antes de generar el albarán.');
      return;
    }
    setSelectedSaleForInvoice(sale);
    setShowInvoiceForm(true);
  };

  const handleGeneratePDF = async (invoiceData: any) => {
    try {
      const { InvoiceService } = await import('@/services/invoiceService');
      await InvoiceService.generatePDF(invoiceData, companyData, currencySymbol);
      setShowInvoiceForm(false);
      setSelectedSaleForInvoice(null);
    } catch (error) {
      logger.error('Error generating PDF:', error);
      toast.error('Error al generar el PDF');
    }
  };

  const calculateStats = () => {
    const saleStats = getSaleStats();
    const expenseStats = getExpenseStats();
    
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
    };
  };

  if (loading) {
    return <AccountingSkeleton />;
  }

  if (showAdvancedStats) {
    return (
      <AdvancedStatistics 
        onBack={() => setShowAdvancedStats(false)}
      />
    );
  }

  const stats = calculateStats();

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <AccountingHeader
        stats={stats}
        onShowAdvancedStats={() => setShowAdvancedStats(true)}
      />

      {/* Tabs Navigation */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('sales')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'sales'
                  ? 'border-slate-500 text-slate-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>Ventas</span>
                <span className="bg-slate-100 text-slate-800 text-xs font-medium px-2 py-1 rounded-full">
                  {salesLoading ? '...' : sales.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'expenses'
                  ? 'border-slate-500 text-slate-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>Gastos</span>
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2 py-1 rounded-full">
                  {expensesLoading ? '...' : expenses.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('amortizations')}
              className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                activeTab === 'amortizations'
                  ? 'border-slate-500 text-slate-600'
                  : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>Amortizaciones</span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'sales' ? (
              <SalesTable
                sales={sales}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                onDeleteSale={handleDeleteSale}
                onEditSale={handleEditSale}
                onAddSale={() => setShowAddForm(true)}
                onGenerateInvoice={handleGenerateInvoice}
              />
            ) : activeTab === 'expenses' ? (
              <ExpensesTable
                expenses={expenses}
                searchTerm={expenseSearchTerm}
                onSearchChange={setExpenseSearchTerm}
                onDeleteExpense={handleDeleteExpense}
                onEditExpense={handleEditExpense}
                onAddExpense={() => setShowAddExpenseForm(true)}
              />
            ) : (
              <AmortizationsSection />
            )}
          </motion.div>
        </div>
      </div>

      {/* Add Sale Modal */}
      {showAddForm && (
        <AddSaleForm
          sale={editingSale}
          onSave={handleAddSale}
          onCancel={() => {
            setShowAddForm(false);
            setEditingSale(null);
          }}
        />
      )}

      {/* Add Expense Modal */}
      {showAddExpenseForm && (
        <AddExpenseForm
          expense={editingExpense}
          onSave={handleAddExpense}
          onCancel={() => {
            setShowAddExpenseForm(false);
            setEditingExpense(null);
          }}
        />
      )}

      {/* Invoice Form Modal */}
      {showInvoiceForm && selectedSaleForInvoice && (
        <InvoiceForm
          sale={selectedSaleForInvoice}
          onClose={() => {
            setShowInvoiceForm(false);
            setSelectedSaleForInvoice(null);
          }}
          onGeneratePDF={handleGeneratePDF}
        />
      )}
    </div>
  );
} 