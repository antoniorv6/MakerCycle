import { createClient } from '@/lib/supabase';
import type { Expense, ExpenseFormData } from '@/types';

export class ExpenseService {
  private supabase = createClient();

  async getExpenses(userId: string, teamId?: string | null): Promise<Expense[]> {
    let query = this.supabase
      .from('expenses')
      .select('*')
      .order('created_at', { ascending: false });

    if (teamId) {
      // Get team expenses
      query = query.eq('team_id', teamId);
    } else {
      // Get personal expenses (where team_id is null)
      query = query.eq('user_id', userId).is('team_id', null);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching expenses: ${error.message}`);
    }

    return data || [];
  }

  async getExpense(id: string): Promise<Expense | null> {
    const { data, error } = await this.supabase
      .from('expenses')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Error fetching expense: ${error.message}`);
    }

    return data;
  }

  async createExpense(userId: string, expenseData: ExpenseFormData, teamId?: string | null): Promise<Expense> {
    const expense: Omit<Expense, 'id' | 'created_at' | 'updated_at'> = {
      user_id: userId,
      description: expenseData.description,
      amount: expenseData.amount,
      category: expenseData.category,
      date: expenseData.date,
      status: 'paid',
      notes: expenseData.notes,
      team_id: teamId || null
    };

    const { data, error } = await this.supabase
      .from('expenses')
      .insert([expense])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating expense: ${error.message}`);
    }

    return data;
  }

  async updateExpense(id: string, updates: Partial<Expense>): Promise<Expense> {
    const { data, error } = await this.supabase
      .from('expenses')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating expense: ${error.message}`);
    }

    return data;
  }

  async deleteExpense(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('expenses')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting expense: ${error.message}`);
    }
  }

  calculateExpenseStats(expenses: Expense[]) {
    const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalExpensesCount = expenses.length;
    
    const expensesByCategory = expenses.reduce((acc, expense) => {
      acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
      return acc;
    }, {} as Record<string, number>);

    return {
      totalExpenses,
      totalExpensesCount,
      expensesByCategory
    };
  }

  getExpenseCategories() {
    return [
      'Materiales',
      'Equipamiento',
      'Electricidad',
      'Software',
      'Mantenimiento',
      'Marketing',
      'Transporte',
      'Otros'
    ];
  }
}

export const expenseService = new ExpenseService(); 