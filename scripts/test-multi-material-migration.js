/**
 * Script de prueba para verificar la migración de múltiples materiales por pieza
 * Este script simula la migración de datos existentes y verifica que funcione correctamente
 */

// Simulación de datos existentes (estructura antigua)
const existingProject = {
  id: 'test-project-1',
  name: 'Proyecto de prueba',
  filament_weight: 150, // 150g
  filament_price: 25, // 25€/kg
  print_hours: 8,
  electricity_cost: 0.12,
  materials: [
    { id: 'mat-1', name: 'Soporte', price: 5 },
    { id: 'mat-2', name: 'Adhesivo', price: 2 }
  ],
  pieces: [
    {
      id: 'piece-1',
      name: 'Pieza principal',
      filament_weight: 100,
      filament_price: 25,
      print_hours: 5,
      quantity: 1,
      notes: 'Pieza principal del proyecto'
    },
    {
      id: 'piece-2',
      name: 'Soporte',
      filament_weight: 50,
      filament_price: 25,
      print_hours: 3,
      quantity: 2,
      notes: 'Soportes para la pieza principal'
    }
  ]
};

// Simulación de la migración
function simulateMigration(project) {
  console.log('🔄 Iniciando migración de proyecto:', project.name);
  
  const migratedPieces = project.pieces.map(piece => {
    console.log(`  📦 Migrando pieza: ${piece.name}`);
    
    // Crear material migrado para la pieza
    const migratedMaterial = {
      id: `mat-${piece.id}-migrated`,
      piece_id: piece.id,
      material_name: 'Filamento principal',
      material_type: 'PLA',
      weight: piece.filament_weight,
      price_per_kg: piece.filament_price,
      unit: 'g',
      category: 'filament',
      notes: 'Migrado automáticamente desde el sistema anterior'
    };
    
    console.log(`    ✅ Material creado: ${migratedMaterial.material_name} (${migratedMaterial.weight}g, ${migratedMaterial.price_per_kg}€/kg)`);
    
    return {
      ...piece,
      materials: [migratedMaterial]
    };
  });
  
  return {
    ...project,
    pieces: migratedPieces
  };
}

// Simulación de cálculos con la nueva estructura
function calculateProjectCosts(project) {
  console.log('\n💰 Calculando costes del proyecto migrado...');
  
  let totalFilamentWeight = 0;
  let totalPrintHours = 0;
  let totalFilamentCost = 0;
  
  project.pieces.forEach(piece => {
    console.log(`\n  📦 Procesando pieza: ${piece.name}`);
    console.log(`    Cantidad: ${piece.quantity}`);
    
    totalPrintHours += piece.printHours * piece.quantity;
    
    if (piece.materials && piece.materials.length > 0) {
      console.log(`    Materiales: ${piece.materials.length}`);
      
      const pieceWeight = piece.materials.reduce((sum, material) => {
        const weightInGrams = material.unit === 'kg' ? material.weight * 1000 : material.weight;
        console.log(`      - ${material.material_name}: ${weightInGrams}g`);
        return sum + weightInGrams;
      }, 0);
      
      const pieceCost = piece.materials.reduce((sum, material) => {
        const weightInKg = material.unit === 'g' ? material.weight / 1000 : material.weight;
        const cost = weightInKg * material.price_per_kg;
        console.log(`      - ${material.material_name}: ${cost.toFixed(2)}€`);
        return sum + cost;
      }, 0);
      
      totalFilamentWeight += pieceWeight * piece.quantity;
      totalFilamentCost += pieceCost * piece.quantity;
      
      console.log(`    Peso total: ${pieceWeight}g`);
      console.log(`    Coste total: ${pieceCost.toFixed(2)}€`);
    } else {
      // Fallback a la estructura antigua
      console.log(`    Usando estructura antigua (compatibilidad)`);
      totalFilamentWeight += piece.filamentWeight * piece.quantity;
      totalFilamentCost += (piece.filamentWeight * piece.quantity * piece.filamentPrice) / 1000;
    }
  });
  
  const electricityCost = totalPrintHours * 0.2 * project.electricity_cost;
  const materialsCost = project.materials.reduce((sum, material) => sum + material.price, 0);
  const totalCost = totalFilamentCost + electricityCost + materialsCost;
  
  console.log('\n📊 RESUMEN DE COSTES:');
  console.log(`  Peso total filamento: ${totalFilamentWeight.toFixed(1)}g`);
  console.log(`  Tiempo total impresión: ${totalPrintHours.toFixed(1)}h`);
  console.log(`  Coste filamento: ${totalFilamentCost.toFixed(2)}€`);
  console.log(`  Coste electricidad: ${electricityCost.toFixed(2)}€`);
  console.log(`  Coste materiales adicionales: ${materialsCost.toFixed(2)}€`);
  console.log(`  COSTE TOTAL: ${totalCost.toFixed(2)}€`);
  
  return {
    totalFilamentWeight,
    totalPrintHours,
    totalFilamentCost,
    electricityCost,
    materialsCost,
    totalCost
  };
}

// Ejecutar la prueba
console.log('🚀 INICIANDO PRUEBA DE MIGRACIÓN MULTI-MATERIAL');
console.log('='.repeat(60));

// Mostrar datos originales
console.log('\n📋 DATOS ORIGINALES:');
console.log(`Proyecto: ${existingProject.name}`);
console.log(`Piezas: ${existingProject.pieces.length}`);
existingProject.pieces.forEach(piece => {
  console.log(`  - ${piece.name}: ${piece.filamentWeight}g, ${piece.quantity} unidades`);
});

// Ejecutar migración
const migratedProject = simulateMigration(existingProject);

// Mostrar datos migrados
console.log('\n✅ DATOS MIGRADOS:');
migratedProject.pieces.forEach(piece => {
  console.log(`  - ${piece.name}: ${piece.materials.length} material(es)`);
  piece.materials.forEach(material => {
    console.log(`    * ${material.material_name}: ${material.weight}${material.unit}, ${material.price_per_kg}€/kg`);
  });
});

// Calcular costes
const costs = calculateProjectCosts(migratedProject);

// Verificar que los cálculos son correctos
console.log('\n🔍 VERIFICACIÓN:');
const originalTotalWeight = existingProject.pieces.reduce((sum, piece) => sum + (piece.filamentWeight * piece.quantity), 0);
const originalTotalCost = existingProject.pieces.reduce((sum, piece) => sum + ((piece.filamentWeight * piece.quantity * piece.filamentPrice) / 1000), 0);

console.log(`Peso original: ${originalTotalWeight}g vs Migrado: ${costs.totalFilamentWeight.toFixed(1)}g`);
console.log(`Coste original: ${originalTotalCost.toFixed(2)}€ vs Migrado: ${costs.totalFilamentCost.toFixed(2)}€`);

const weightMatch = Math.abs(originalTotalWeight - costs.totalFilamentWeight) < 0.1;
const costMatch = Math.abs(originalTotalCost - costs.totalFilamentCost) < 0.01;

console.log(`\n${weightMatch ? '✅' : '❌'} Peso: ${weightMatch ? 'CORRECTO' : 'ERROR'}`);
console.log(`${costMatch ? '✅' : '❌'} Coste: ${costMatch ? 'CORRECTO' : 'ERROR'}`);

if (weightMatch && costMatch) {
  console.log('\n🎉 ¡MIGRACIÓN EXITOSA! Los datos se han migrado correctamente.');
} else {
  console.log('\n⚠️  ERROR EN LA MIGRACIÓN: Los cálculos no coinciden.');
}

console.log('\n' + '='.repeat(60));
console.log('✨ Prueba completada');
