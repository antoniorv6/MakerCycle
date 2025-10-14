import { createClient } from '@/lib/supabase';
import type { PieceMaterial, AppPieceMaterial } from '@/types';

export class PieceMaterialService {
  private supabase = createClient();

  /**
   * Obtiene todos los materiales de una pieza específica
   */
  async getPieceMaterials(pieceId: string): Promise<PieceMaterial[]> {
    const { data, error } = await this.supabase
      .from('piece_materials')
      .select('*')
      .eq('piece_id', pieceId)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Error fetching piece materials: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Obtiene todos los materiales de múltiples piezas
   */
  async getPiecesMaterials(pieceIds: string[]): Promise<Record<string, PieceMaterial[]>> {
    if (pieceIds.length === 0) return {};

    const { data, error } = await this.supabase
      .from('piece_materials')
      .select('*')
      .in('piece_id', pieceIds)
      .order('created_at', { ascending: true });

    if (error) {
      throw new Error(`Error fetching pieces materials: ${error.message}`);
    }

    // Agrupar por piece_id
    const grouped: Record<string, PieceMaterial[]> = {};
    (data || []).forEach(material => {
      if (!grouped[material.piece_id]) {
        grouped[material.piece_id] = [];
      }
      grouped[material.piece_id].push(material);
    });

    return grouped;
  }

  /**
   * Crea un nuevo material para una pieza
   */
  async createPieceMaterial(material: Omit<PieceMaterial, 'id' | 'created_at' | 'updated_at'>): Promise<PieceMaterial> {
    const { data, error } = await this.supabase
      .from('piece_materials')
      .insert([material])
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating piece material: ${error.message}`);
    }

    return data;
  }

  /**
   * Actualiza un material de una pieza
   */
  async updatePieceMaterial(
    id: string, 
    updates: Partial<Omit<PieceMaterial, 'id' | 'piece_id' | 'created_at' | 'updated_at'>>
  ): Promise<PieceMaterial> {
    const { data, error } = await this.supabase
      .from('piece_materials')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error updating piece material: ${error.message}`);
    }

    return data;
  }

  /**
   * Elimina un material de una pieza
   */
  async deletePieceMaterial(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('piece_materials')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Error deleting piece material: ${error.message}`);
    }
  }

  /**
   * Elimina todos los materiales de una pieza
   */
  async deleteAllPieceMaterials(pieceId: string): Promise<void> {
    const { error } = await this.supabase
      .from('piece_materials')
      .delete()
      .eq('piece_id', pieceId);

    if (error) {
      throw new Error(`Error deleting all piece materials: ${error.message}`);
    }
  }

  /**
   * Crea múltiples materiales para una pieza
   */
  async createMultiplePieceMaterials(
    pieceId: string, 
    materials: Omit<PieceMaterial, 'id' | 'piece_id' | 'created_at' | 'updated_at'>[]
  ): Promise<PieceMaterial[]> {
    const materialsWithPieceId = materials.map(material => ({
      ...material,
      piece_id: pieceId
    }));

    const { data, error } = await this.supabase
      .from('piece_materials')
      .insert(materialsWithPieceId)
      .select();

    if (error) {
      throw new Error(`Error creating multiple piece materials: ${error.message}`);
    }

    return data || [];
  }

  /**
   * Convierte PieceMaterial (database format) a AppPieceMaterial (app format)
   */
  convertToAppFormat(material: PieceMaterial): AppPieceMaterial {
    return {
      id: material.id,
      pieceId: material.piece_id,
      materialPresetId: material.material_preset_id,
      materialName: material.material_name,
      materialType: material.material_type,
      weight: material.weight,
      pricePerKg: material.price_per_kg,
      unit: material.unit,
      category: material.category,
      color: material.color,
      brand: material.brand,
      notes: material.notes
    };
  }

  /**
   * Convierte AppPieceMaterial (app format) a PieceMaterial (database format)
   */
  convertToDatabaseFormat(material: AppPieceMaterial, pieceId: string): Omit<PieceMaterial, 'id' | 'created_at' | 'updated_at'> {
    return {
      piece_id: pieceId,
      material_preset_id: material.materialPresetId,
      material_name: material.materialName,
      material_type: material.materialType,
      weight: material.weight,
      price_per_kg: material.pricePerKg,
      unit: material.unit,
      category: material.category,
      color: material.color,
      brand: material.brand,
      notes: material.notes
    };
  }

  /**
   * Calcula el peso total de una pieza basado en sus materiales
   */
  calculatePieceTotalWeight(materials: PieceMaterial[]): number {
    return materials.reduce((total, material) => {
      // Convertir a gramos si es necesario
      const weightInGrams = material.unit === 'kg' ? material.weight * 1000 : material.weight;
      return total + weightInGrams;
    }, 0);
  }

  /**
   * Calcula el coste total de materiales de una pieza
   */
  calculatePieceMaterialsCost(materials: PieceMaterial[]): number {
    return materials.reduce((total, material) => {
      // Convertir peso a kg si es necesario
      const weightInKg = material.unit === 'g' ? material.weight / 1000 : material.weight;
      return total + (weightInKg * material.price_per_kg);
    }, 0);
  }

  /**
   * Obtiene un resumen de materiales de una pieza
   */
  getPieceMaterialsSummary(materials: PieceMaterial[]): {
    totalWeight: number;
    totalCost: number;
    materialCount: number;
    categories: string[];
    types: string[];
  } {
    const totalWeight = this.calculatePieceTotalWeight(materials);
    const totalCost = this.calculatePieceMaterialsCost(materials);
    const materialCount = materials.length;
    const categories = Array.from(new Set(materials.map(m => m.category)));
    const types = Array.from(new Set(materials.map(m => m.material_type)));

    return {
      totalWeight,
      totalCost,
      materialCount,
      categories,
      types
    };
  }
}

export const pieceMaterialService = new PieceMaterialService();
