#!/bin/bash

# Script para limpiar migraciones antiguas y mantener solo la consolidada
# Este script elimina todas las migraciones antiguas y mantiene solo 001_initial_schema.sql

echo "🧹 Limpiando migraciones antiguas..."

# Crear directorio de backup
mkdir -p supabase/migrations_backup

# Mover todas las migraciones antiguas al backup
echo "📦 Creando backup de migraciones antiguas..."
mv supabase/migrations/*.sql supabase/migrations_backup/

# Restaurar solo la migración consolidada
echo "✅ Restaurando migración consolidada..."
mv supabase/migrations_backup/001_initial_schema.sql supabase/migrations/

# Verificar que solo existe la migración consolidada
echo "🔍 Verificando migraciones actuales..."
ls -la supabase/migrations/

echo ""
echo "✅ Limpieza completada!"
echo "📁 Migraciones antiguas guardadas en: supabase/migrations_backup/"
echo "📄 Migración consolidada: supabase/migrations/001_initial_schema.sql"
echo ""
echo "💡 Para aplicar la nueva migración:"
echo "   supabase db reset    # Para desarrollo local"
echo "   supabase db push     # Para producción" 