import { createClient } from '@/lib/supabase';
import type { Sale, SaleFormData } from '@/types';
import { NotificationService } from './notificationService';

export class SalesService {
  private supabase = createClient();

  async getSales(userId: string, teamId?: string | null): Promise<Sale[]> {
    let query = this.supabase
      .from('sales')
      .select('*')
      .order('created_at', { ascending: false });

    if (teamId) {
      // Get team sales
      query = query.eq('team_id', teamId);
    } else {
      // Get personal sales (where team_id is null)
      query = query.eq('user_id', userId).is('team_id', null);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching sales: ${error.message}`);
    }

    return data || [];
  }

  async getSale(id: string): Promise<Sale | null> {
    const { data, error } = await this.supabase
      .from('sales')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Error fetching sale: ${error.message}`);
    }

    return data;
  }

  async createSale(userId: string, saleData: SaleFormData, teamId?: string | null): Promise<Sale> {
    const { unitCost, quantity, salePrice, printHours } = saleData;
    
    const cost = unitCost * quantity;
    const profit = salePrice - cost;
    const margin = cost > 0 ? (profit / cost) * 100 : 0;

    const sale: Omit<Sale, 'id' | 'created_at' | 'updated_at'> = {
      user_id: userId,
      project_name: saleData.projectName,
      cost,
      unit_cost: unitCost,
      quantity,
      sale_price: salePrice,
      profit,
      margin,
      date: saleData.date,
      status: 'completed',
      print_hours: printHours,
      team_id: teamId || null,
      client_id: saleData.client_id || null
    };

    const { data, error } = await this.supabase
      .from('sales')
      .insert([sale])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating sale: ${error.message}`);
    }

    // Create notification for team if sale is team-based
    if (teamId) {
      try {
        await NotificationService.notifyNewSale(
          teamId,
          sale.sale_price,
          sale.project_name
        );
      } catch (notificationError) {
        console.error('Failed to create notification for new sale:', notificationError);
        // Don't throw error to avoid breaking the main flow
      }
    }

    return data;
  }

  async updateSale(id: string, updates: Partial<Sale>): Promise<Sale> {
    const { data, error } = await this.supabase
      .from('sales')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating sale: ${error.message}`);
    }

    return data;
  }

  async deleteSale(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('sales')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting sale: ${error.message}`);
    }
  }

  calculateSaleStats(sales: Sale[]) {
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.sale_price, 0);
    const totalCosts = sales.reduce((sum, sale) => sum + sale.cost, 0);
    const totalProfit = sales.reduce((sum, sale) => sum + sale.profit, 0);
    const totalPrintHours = sales.reduce((sum, sale) => sum + (sale.print_hours || 0), 0);
    const totalProducts = sales.reduce((sum, sale) => sum + sale.quantity, 0);
    
    const averageMargin = sales.length > 0 
      ? sales.reduce((sum, sale) => sum + sale.margin, 0) / sales.length 
      : 0;
    
    const averageEurosPerHour = totalPrintHours > 0 ? totalProfit / totalPrintHours : 0;

    return {
      totalRevenue,
      totalCosts,
      totalProfit,
      totalPrintHours,
      totalProducts,
      averageMargin,
      averageEurosPerHour,
      totalSales: sales.length
    };
  }
}

export const salesService = new SalesService(); 