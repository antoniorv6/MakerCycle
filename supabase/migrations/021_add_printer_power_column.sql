-- =====================================================
-- MIGRACIÓN 021: Agregar columna printer_power a projects
-- =====================================================
-- Esta migración añade la columna printer_power a la tabla projects
-- para guardar la potencia de la impresora utilizada

-- Agregar columna printer_power con valor por defecto de 0.35 kW
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS printer_power numeric NOT NULL DEFAULT 0.35;

-- Crear índice para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_projects_printer_power ON projects(printer_power);

-- Comentario para documentación
COMMENT ON COLUMN projects.printer_power IS 'Potencia de la impresora en kW (kilowatios) usada para calcular el coste de electricidad';
