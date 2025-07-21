import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/providers/AuthProvider';
import { useSales } from '@/hooks/useSales';
import { useExpenses } from '@/hooks/useExpenses';
import { useCompanySettings } from '@/hooks/useCompanySettings';
import { AccountingHeader } from './AccountingHeader';
import { SalesTable } from './SalesTable';
import { ExpensesTable } from './ExpensesTable';
import { AddSaleForm } from './AddSaleForm';
import { AddExpenseForm } from './AddExpenseForm';
import { InvoiceForm } from './InvoiceForm';
import AdvancedStatistics from '@/components/AdvancedStatistics';
import { AccountingSkeleton } from '@/components/skeletons';
import { InvoiceService } from '@/services/invoiceService';
import { salesService } from '@/services/salesService';
import type { Sale, Expense, SaleFormData, ExpenseFormData } from '@/types';
import { toast } from 'react-hot-toast';

type TabType = 'sales' | 'expenses';

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

  const loading = salesLoading || expensesLoading;

  const handleAddSale = async (saleData: SaleFormData) => {
    try {
      if (editingSale) {
        // For editing, we need to update the sale and its items
        await updateSale(editingSale.id, {
          date: saleData.date,
          team_id: saleData.team_id,
          client_id: saleData.client_id
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
        
        setEditingSale(null);
      } else {
        await createSale(saleData);
      }
      setShowAddForm(false);
    } catch (error) {
      console.error('Error saving sale:', error);
    }
  };

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
        });
        setEditingExpense(null);
      } else {
        await createExpense(expenseData);
      }
      setShowAddExpenseForm(false);
    } catch (error) {
      console.error('Error saving expense:', error);
    }
  };

  const handleDeleteSale = async (id: string) => {
    try {
      await deleteSale(id);
    } catch (error) {
      console.error('Error deleting sale:', error);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    try {
      await deleteExpense(id);
    } catch (error) {
      console.error('Error deleting expense:', error);
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
      console.log('Generating PDF with company data:', companyData);
      console.log('Invoice data received:', invoiceData);
      console.log('Invoice data type:', typeof invoiceData);
      console.log('Invoice items:', invoiceData?.items);
      
      await InvoiceService.generatePDF(invoiceData, companyData);
      setShowInvoiceForm(false);
      setSelectedSaleForInvoice(null);
    } catch (error) {
      console.error('Error generating PDF:', error);
      // Aquí podrías mostrar una notificación de error
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
            ) : (
              <ExpensesTable
                expenses={expenses}
                searchTerm={expenseSearchTerm}
                onSearchChange={setExpenseSearchTerm}
                onDeleteExpense={handleDeleteExpense}
                onEditExpense={handleEditExpense}
                onAddExpense={() => setShowAddExpenseForm(true)}
              />
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