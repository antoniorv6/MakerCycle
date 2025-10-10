import { createClient } from '@/lib/supabase';
import type { DatabaseProject, Project, Material, Piece, PieceMaterial } from '@/types';
import { NotificationService } from './notificationService';
import { pieceMaterialService } from './pieceMaterialService';

export class ProjectService {
  private supabase = createClient();

  async getProjects(userId: string, teamId?: string | null): Promise<Project[]> {
    let query = this.supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (teamId) {
      // Get team projects
      query = query.eq('team_id', teamId);
    } else {
      // Get personal projects (where team_id is null)
      query = query.eq('user_id', userId).is('team_id', null);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching projects: ${error.message}`);
    }

    return data || [];
  }

  async getProject(id: string): Promise<Project | null> {
    const { data, error } = await this.supabase
      .from('projects')
      .select(`
        *,
        pieces (
          *,
          piece_materials (*)
        )
      `)
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

    // Create notification for team if project is team-based
    if (project.team_id) {
      try {
        await NotificationService.notifyNewProject(
          project.team_id,
          project.name,
          project.user_id
        );
      } catch (notificationError) {
        console.error('Failed to create notification for new project:', notificationError);
        // Don't throw error to avoid breaking the main flow
      }
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
    let totalFilamentWeight = 0;
    let totalPrintHours = 0;
    let filamentCost = 0;

    if (project.pieces) {
      // Calcular usando la nueva estructura de materiales por pieza
      for (const piece of project.pieces) {
        totalPrintHours += piece.printHours * piece.quantity;
        
        if (piece.materials && piece.materials.length > 0) {
          // Usar la nueva estructura de materiales
          const pieceWeight = pieceMaterialService.calculatePieceTotalWeight(piece.materials);
          const pieceCost = pieceMaterialService.calculatePieceMaterialsCost(piece.materials);
          
          totalFilamentWeight += pieceWeight * piece.quantity;
          filamentCost += pieceCost * piece.quantity;
        } else {
          // Fallback a la estructura antigua para compatibilidad
          totalFilamentWeight += piece.filamentWeight * piece.quantity;
          filamentCost += (piece.filamentWeight * piece.quantity * piece.filamentPrice) / 1000;
        }
      }
    } else {
      // Usar valores del proyecto (estructura antigua)
      totalFilamentWeight = project.filament_weight;
      totalPrintHours = project.print_hours;
      filamentCost = totalFilamentWeight * (project.filament_price / 1000);
    }

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