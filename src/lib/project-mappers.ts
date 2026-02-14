import type { DatabaseProject, DatabasePiece, AppProject, AppPiece } from '@/types';

export function dbProjectToAppProject(
  db: DatabaseProject & { pieces?: DatabasePiece[] }
): AppProject {
  return {
    id: db.id,
    name: db.name,
    filamentWeight: db.filament_weight,
    filamentPrice: db.filament_price,
    printHours: db.print_hours,
    electricityCost: db.electricity_cost,
    printerPower: db.printer_power ?? 0.35,
    materials: db.materials,
    postprocessingItems: db.postprocessing_items,
    totalCost: db.total_cost,
    vatPercentage: db.vat_percentage,
    profitMargin: db.profit_margin,
    recommendedPrice: db.recommended_price,
    createdAt: db.created_at,
    status: db.status,
    pieces: db.pieces?.map(dbPieceToAppPiece),
  };
}

export function dbPieceToAppPiece(piece: DatabasePiece): AppPiece {
  return {
    id: piece.id,
    name: piece.name,
    filamentWeight: piece.filament_weight,
    filamentPrice: piece.filament_price,
    printHours: piece.print_hours,
    quantity: piece.quantity,
    notes: piece.notes || '',
    materials: (piece as any).materials || [],
  };
}

export function appProjectToDbProject(
  project: Partial<AppProject>
): Partial<Omit<DatabaseProject, 'user_id' | 'team_id'>> {
  return {
    name: project.name,
    filament_weight: project.filamentWeight,
    filament_price: project.filamentPrice,
    print_hours: project.printHours,
    electricity_cost: project.electricityCost,
    printer_power: project.printerPower,
    materials: project.materials,
    postprocessing_items: project.postprocessingItems,
    total_cost: project.totalCost,
    vat_percentage: project.vatPercentage,
    profit_margin: project.profitMargin,
    recommended_price: project.recommendedPrice,
    status: project.status,
  };
}
