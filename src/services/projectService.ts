import { createClient } from '@/lib/supabase';
import type { DatabaseProject, Project, Material, Piece } from '@/types';

export class ProjectService {
  private supabase = createClient();

  async getProjects(userId: string): Promise<Project[]> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Error fetching projects: ${error.message}`);
    }

    return data || [];
  }

  async getProject(id: string): Promise<Project | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Error fetching project: ${error.message}`);
    }

    return data;
  }

  async createProject(project: Omit<DatabaseProject, 'id' | 'created_at' | 'updated_at'>): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .insert([project])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating project: ${error.message}`);
    }

    return data;
  }

  async updateProject(id: string, updates: Partial<DatabaseProject>): Promise<Project> {
    const { data, error } = await this.supabase
      .from('projects')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating project: ${error.message}`);
    }

    return data;
  }

  async deleteProject(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('projects')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting project: ${error.message}`);
    }
  }

  calculateProjectCosts(project: {
    filament_weight: number;
    filament_price: number;
    print_hours: number;
    electricity_cost: number;
    materials: Material[];
    pieces?: Piece[];
  }) {
    const totalFilamentWeight = project.pieces 
      ? project.pieces.reduce((sum, piece) => sum + (piece.filament_weight * piece.quantity), 0)
      : project.filament_weight;

    const totalPrintHours = project.pieces
      ? project.pieces.reduce((sum, piece) => sum + (piece.print_hours * piece.quantity), 0)
      : project.print_hours;

    const filamentCost = totalFilamentWeight * (project.filament_price / 1000); // Convert to per kg
    const electricityCost = totalPrintHours * project.electricity_cost;
    const materialsCost = project.materials.reduce((sum, material) => sum + material.price, 0);

    return {
      filamentCost,
      electricityCost,
      materialsCost,
      totalCost: filamentCost + electricityCost + materialsCost,
      totalFilamentWeight,
      totalPrintHours
    };
  }

  calculateSalePrice(totalCost: number, vatPercentage: number, profitMargin: number): number {
    const costWithVat = totalCost * (1 + vatPercentage / 100);
    return costWithVat * (1 + profitMargin / 100);
  }
}

export const projectService = new ProjectService(); 