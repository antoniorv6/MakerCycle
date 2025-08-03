# Script de PowerShell para limpiar migraciones antiguas
Write-Host "Limpiando migraciones antiguas..." -ForegroundColor Green

# Crear directorio de backup
$backupDir = "supabase/migrations_backup"
if (-not (Test-Path $backupDir)) {
    New-Item -ItemType Directory -Path $backupDir -Force
    Write-Host "Creando directorio de backup..." -ForegroundColor Yellow
}

# Mover migraciones al backup
Write-Host "Creando backup de migraciones antiguas..." -ForegroundColor Yellow
$migrationsDir = "supabase/migrations"
$migrationFiles = Get-ChildItem -Path $migrationsDir -Filter "*.sql"

foreach ($file in $migrationFiles) {
    Move-Item -Path $file.FullName -Destination "$backupDir/$($file.Name)" -Force
    Write-Host "Movido: $($file.Name)" -ForegroundColor Gray
}

# Restaurar migración consolidada
Write-Host "Restaurando migración consolidada..." -ForegroundColor Green
$consolidatedMigration = "$backupDir/001_initial_schema.sql"
if (Test-Path $consolidatedMigration) {
    Move-Item -Path $consolidatedMigration -Destination "$migrationsDir/001_initial_schema.sql" -Force
    Write-Host "Restaurado: 001_initial_schema.sql" -ForegroundColor Green
} else {
    Write-Host "No se encontró 001_initial_schema.sql en el backup" -ForegroundColor Red
    exit 1
}

# Verificar resultado
Write-Host "Verificando migraciones actuales..." -ForegroundColor Yellow
$currentMigrations = Get-ChildItem -Path $migrationsDir -Filter "*.sql"
Write-Host "Migraciones actuales:" -ForegroundColor Cyan
foreach ($migration in $currentMigrations) {
    Write-Host "  - $($migration.Name)" -ForegroundColor White
}

Write-Host ""
Write-Host "Limpieza completada!" -ForegroundColor Green
Write-Host "Migraciones antiguas guardadas en: $backupDir" -ForegroundColor Cyan
Write-Host "Migración consolidada: $migrationsDir/001_initial_schema.sql" -ForegroundColor Cyan
Write-Host ""
Write-Host "Para aplicar la nueva migración:" -ForegroundColor Yellow
Write-Host "  supabase db reset    # Para desarrollo local" -ForegroundColor White
Write-Host "  supabase db push     # Para producción" -ForegroundColor White 