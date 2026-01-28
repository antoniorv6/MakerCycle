-- =====================================================
-- MIGRACIÓN: Sistema de Presets de Postproducción
-- =====================================================
-- Esta migración añade la funcionalidad de presets de postproducción
-- para que los usuarios puedan guardar configuraciones predefinidas
-- de costes de postprocesado (pintura, uso de máquinas, etc.)

-- =====================================================
-- TABLA POSTPROCESSING_PRESETS (Presets de postproducción)
-- =====================================================
CREATE TABLE IF NOT EXISTS postprocessing_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  cost_per_unit numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'unidad', -- unidad, hora, ml, g, etc.
  category text, -- paint, machine_usage, consumables, labor, etc.
  notes text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- AÑADIR CAMPO POSTPROCESSING_ITEMS A PROJECTS
-- =====================================================
-- Añadir columna postprocessing_items a la tabla projects
ALTER TABLE projects 
ADD COLUMN IF NOT EXISTS postprocessing_items jsonb DEFAULT '[]'::jsonb;

-- Migrar datos existentes de materials a postprocessing_items
-- Mantenemos materials para compatibilidad hacia atrás
UPDATE projects
SET postprocessing_items = COALESCE(
  (
    SELECT jsonb_agg(
      jsonb_build_object(
        'id', COALESCE((m->>'id')::text, gen_random_uuid()::text),
        'name', m->>'name',
        'cost_per_unit', COALESCE((m->>'price')::numeric, 0),
        'quantity', 1,
        'unit', 'unidad',
        'preset_id', NULL,
        'is_from_preset', false
      )
    )
    FROM jsonb_array_elements(materials) m
    WHERE materials IS NOT NULL AND jsonb_array_length(materials) > 0
  ),
  '[]'::jsonb
)
WHERE materials IS NOT NULL 
  AND jsonb_array_length(materials) > 0
  AND (postprocessing_items IS NULL OR postprocessing_items = '[]'::jsonb);

-- Comentarios en las columnas
COMMENT ON COLUMN projects.postprocessing_items IS 'Items de postproducción del proyecto. Formato: [{"id": string, "name": string, "cost_per_unit": number, "quantity": number, "unit": string, "preset_id": string|null, "is_from_preset": boolean}]';
COMMENT ON TABLE postprocessing_presets IS 'Presets de costes de postproducción que los usuarios pueden reutilizar en sus proyectos';

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_postprocessing_presets_user_id ON postprocessing_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_postprocessing_presets_team_id ON postprocessing_presets(team_id);
CREATE INDEX IF NOT EXISTS idx_postprocessing_presets_category ON postprocessing_presets(category);
CREATE INDEX IF NOT EXISTS idx_postprocessing_presets_is_default ON postprocessing_presets(is_default);

-- =====================================================
-- TRIGGERS
-- =====================================================
DROP TRIGGER IF EXISTS update_postprocessing_presets_updated_at ON postprocessing_presets;
CREATE TRIGGER update_postprocessing_presets_updated_at
  BEFORE UPDATE ON postprocessing_presets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE postprocessing_presets ENABLE ROW LEVEL SECURITY;

-- Políticas para postprocessing_presets
DROP POLICY IF EXISTS "Users can view their own postprocessing presets" ON postprocessing_presets;
CREATE POLICY "Users can view their own postprocessing presets"
  ON postprocessing_presets FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert their own postprocessing presets" ON postprocessing_presets;
CREATE POLICY "Users can insert their own postprocessing presets"
  ON postprocessing_presets FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update their own postprocessing presets" ON postprocessing_presets;
CREATE POLICY "Users can update their own postprocessing presets"
  ON postprocessing_presets FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete their own postprocessing presets" ON postprocessing_presets;
CREATE POLICY "Users can delete their own postprocessing presets"
  ON postprocessing_presets FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );
