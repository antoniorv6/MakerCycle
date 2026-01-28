import { createClient } from '@/lib/supabase';
import type { Sale, SaleFormData, SaleItem } from '@/types';
import { NotificationService } from './notificationService';

export class SalesService {
  private supabase = createClient();

  async getSales(userId: string, teamId?: string | null): Promise<Sale[]> {
    let query = this.supabase
      .from('sales')
      .select(`
        *,
        items:sale_items(*),
        printer_amortizations:sales_printer_amortizations(
          *,
          printer:printer_presets(*)
        )
      `)
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
      .select(`
        *,
        items:sale_items(*),
        printer_amortizations:sales_printer_amortizations(
          *,
          printer:printer_presets(*)
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Error fetching sale: ${error.message}`);
    }

    return data;
  }

  async createSale(userId: string, saleData: SaleFormData, teamId?: string | null): Promise<Sale> {
    // Create the sale record
    const sale: Omit<Sale, 'id' | 'created_at' | 'updated_at' | 'items'> = {
      user_id: userId,
      total_amount: 0, // Will be calculated by trigger
      total_cost: 0, // Will be calculated by trigger
      total_profit: 0, // Will be calculated by trigger
      total_margin: 0, // Will be calculated by trigger
      total_print_hours: 0, // Will be calculated by trigger
      items_count: saleData.items.length,
      date: saleData.date,
      status: 'completed',
      team_id: teamId || null,
      client_id: saleData.client_id || null
    };

    const { data: saleRecord, error: saleError } = await this.supabase
      .from('sales')
      .insert([sale])
      .select()
      .single();

    if (saleError) {
      throw new Error(`Error creating sale: ${saleError.message}`);
    }

    // Create sale items
    if (saleData.items.length > 0) {
      const saleItems: Omit<SaleItem, 'id' | 'created_at' | 'updated_at'>[] = saleData.items.map(item => ({
        sale_id: saleRecord.id,
        project_id: item.project_id || null,
        project_name: item.project_name,
        unit_cost: item.unit_cost,
        quantity: item.quantity,
        sale_price: item.sale_price,
        print_hours: item.print_hours
      }));

      const { error: itemsError } = await this.supabase
        .from('sale_items')
        .insert(saleItems);

      if (itemsError) {
        // Delete the sale if items creation fails
        await this.supabase.from('sales').delete().eq('id', saleRecord.id);
        throw new Error(`Error creating sale items: ${itemsError.message}`);
      }
    }

    // Create printer amortizations if any
    if (saleData.printer_amortizations && saleData.printer_amortizations.length > 0) {
      // Calculate profit before amortization
      const totalAmount = saleData.items.reduce((sum, item) => sum + item.sale_price, 0);
      const totalCost = saleData.items.reduce((sum, item) => sum + (item.unit_cost * item.quantity), 0);
      const profitBeforeAmortization = totalAmount - totalCost;

      const amortizations = saleData.printer_amortizations.map(amort => {
        // Calculate amortization amount
        let amortizationAmount = 0;
        if (amort.amortization_method === 'percentage') {
          amortizationAmount = (profitBeforeAmortization * amort.amortization_value) / 100;
        } else {
          // Fixed amount: cannot exceed profit
          amortizationAmount = Math.min(amort.amortization_value, profitBeforeAmortization);
        }
        amortizationAmount = Math.max(0, amortizationAmount);

        return {
          sale_id: saleRecord.id,
          printer_preset_id: amort.printer_preset_id,
          amortization_method: amort.amortization_method,
          amortization_value: amort.amortization_value,
          amortization_amount: amortizationAmount,
          profit_before_amortization: profitBeforeAmortization,
          profit_after_amortization: profitBeforeAmortization - amortizationAmount
        };
      });

      const { error: amortizationsError } = await this.supabase
        .from('sales_printer_amortizations')
        .insert(amortizations);

      if (amortizationsError) {
        console.error('Error creating printer amortizations:', amortizationsError);
        // Don't fail the sale creation if amortizations fail, just log it
      }
    }

    // Create notification for team if sale is team-based
    if (teamId) {
      try {
        await NotificationService.notifyNewSale(
          teamId,
          saleRecord.total_amount,
          `${saleData.items.length} proyectos`
        );
      } catch (notificationError) {
        console.error('Failed to create notification for new sale:', notificationError);
        // Don't throw error to avoid breaking the main flow
      }
    }

    // Return the complete sale with items
    return this.getSale(saleRecord.id) as Promise<Sale>;
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

  async updateSaleItems(saleId: string, items: SaleItem[]): Promise<void> {
    try {
      // Delete existing items
      const { error: deleteError } = await this.supabase
        .from('sale_items')
        .delete()
        .eq('sale_id', saleId);

      if (deleteError) {
        throw new Error(`Error deleting existing sale items: ${deleteError.message}`);
      }

      // Insert new items if there are any
      if (items.length > 0) {
        const saleItems: Omit<SaleItem, 'id' | 'created_at' | 'updated_at'>[] = items.map(item => ({
          sale_id: saleId,
          project_id: item.project_id || null,
          project_name: item.project_name,
          unit_cost: item.unit_cost,
          quantity: item.quantity,
          sale_price: item.sale_price,
          print_hours: item.print_hours
        }));

        const { error: insertError } = await this.supabase
          .from('sale_items')
          .insert(saleItems);

        if (insertError) {
          throw new Error(`Error inserting new sale items: ${insertError.message}`);
        }
      }
    } catch (error) {
      console.error('Error in updateSaleItems:', error);
      throw error;
    }
  }

  async updateSaleAmortizations(saleId: string, amortizations: Array<{
    printer_preset_id: string;
    amortization_method: 'fixed' | 'percentage';
    amortization_value: number;
  }>, profitBeforeAmortization: number): Promise<void> {
    try {
      // Delete existing amortizations
      const { error: deleteError } = await this.supabase
        .from('sales_printer_amortizations')
        .delete()
        .eq('sale_id', saleId);

      if (deleteError) {
        throw new Error(`Error deleting existing amortizations: ${deleteError.message}`);
      }

      // Insert new amortizations if there are any
      if (amortizations.length > 0) {
        const amortizationsData = amortizations.map(amort => {
          // Calculate amortization amount
          let amortizationAmount = 0;
          if (amort.amortization_method === 'percentage') {
            amortizationAmount = (profitBeforeAmortization * amort.amortization_value) / 100;
          } else {
            // Fixed amount: cannot exceed profit
            amortizationAmount = Math.min(amort.amortization_value, profitBeforeAmortization);
          }
          amortizationAmount = Math.max(0, amortizationAmount);

          return {
            sale_id: saleId,
            printer_preset_id: amort.printer_preset_id,
            amortization_method: amort.amortization_method,
            amortization_value: amort.amortization_value,
            amortization_amount: amortizationAmount,
            profit_before_amortization: profitBeforeAmortization,
            profit_after_amortization: profitBeforeAmortization - amortizationAmount
          };
        });

        const { error: insertError } = await this.supabase
          .from('sales_printer_amortizations')
          .insert(amortizationsData);

        if (insertError) {
          console.error('Error inserting new amortizations:', insertError);
          // Don't throw error to avoid breaking the main flow
        }
      }
    } catch (error) {
      console.error('Error updating sale amortizations:', error);
      // Don't throw error to avoid breaking the main flow
    }
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
    const totalRevenue = sales.reduce((sum, sale) => sum + sale.total_amount, 0);
    const totalCosts = sales.reduce((sum, sale) => sum + sale.total_cost, 0);
    const totalProfit = sales.reduce((sum, sale) => sum + sale.total_profit, 0);
    const totalPrintHours = sales.reduce((sum, sale) => sum + sale.total_print_hours, 0);
    const totalProducts = sales.reduce((sum, sale) => sum + (sale.items?.reduce((itemSum, item) => itemSum + item.quantity, 0) || 0), 0);
    
    const averageMargin = sales.length > 0 
      ? sales.reduce((sum, sale) => sum + sale.total_margin, 0) / sales.length 
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