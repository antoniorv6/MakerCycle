-- =====================================================
-- MIGRACIÓN: Añadir tipo de proyecto (filamento/resina)
-- =====================================================
-- Esta migración añade el campo project_type para distinguir
-- entre proyectos de filamento y proyectos de resina

-- Crear tipo ENUM para project_type
CREATE TYPE project_type AS ENUM ('filament', 'resin');

-- Añadir columna project_type a la tabla projects
ALTER TABLE projects 
ADD COLUMN project_type project_type DEFAULT 'filament';

-- Actualizar proyectos existentes basándose en los materiales de las piezas
-- Si alguna pieza tiene materiales con category='resin', el proyecto es de resina
UPDATE projects
SET project_type = 'resin'
WHERE id IN (
  SELECT DISTINCT p.id
  FROM projects p
  INNER JOIN pieces pc ON pc.project_id = p.id
  INNER JOIN piece_materials pm ON pm.piece_id = pc.id
  WHERE pm.category = 'resin'
);

-- Comentario en la columna
COMMENT ON COLUMN projects.project_type IS 'Tipo de proyecto: filament (filamento) o resin (resina). Determina las unidades de presentación (g/kg vs ml/L)';
