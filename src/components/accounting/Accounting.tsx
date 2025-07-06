import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/components/providers/AuthProvider';
import { useSales } from '@/hooks/useSales';
import { useExpenses } from '@/hooks/useExpenses';
import { AccountingHeader } from './AccountingHeader';
import { SalesTable } from './SalesTable';
import { ExpensesTable } from './ExpensesTable';
import { AddSaleForm } from './AddSaleForm';
import { AddExpenseForm } from './AddExpenseForm';
import AdvancedStatistics from '@/components/AdvancedStatistics';
import { AccountingSkeleton } from '@/components/skeletons';
import type { Sale, Expense, SaleFormData, ExpenseFormData } from '@/types';


export default function Accounting() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expenseSearchTerm, setExpenseSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [showAddExpenseForm, setShowAddExpenseForm] = useState(false);
  const [showAdvancedStats, setShowAdvancedStats] = useState(false);
  const [editingSale, setEditingSale] = useState<Sale | null>(null);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);

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

  const loading = salesLoading || expensesLoading;

  const handleAddSale = async (saleData: SaleFormData) => {
    try {
      if (editingSale) {
        await updateSale(editingSale.id, {
          project_name: saleData.projectName,
          unit_cost: saleData.unitCost,
          quantity: saleData.quantity,
          sale_price: saleData.salePrice,
          date: saleData.date,
          print_hours: saleData.printHours
        });
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
          notes: expenseData.notes
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
        onShowAddForm={() => setShowAddForm(true)}
        onShowAddExpenseForm={() => setShowAddExpenseForm(true)}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <SalesTable
          sales={sales}
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onDeleteSale={handleDeleteSale}
          onEditSale={handleEditSale}
        />

        <ExpensesTable
          expenses={expenses}
          searchTerm={expenseSearchTerm}
          onSearchChange={setExpenseSearchTerm}
          onDeleteExpense={handleDeleteExpense}
          onEditExpense={handleEditExpense}
        />
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
    </div>
  );
} 