-- =====================================================
-- MIGRACIÓN: Sistema de Presets de Materiales
-- =====================================================
-- Esta migración añade la funcionalidad de presets de materiales
-- para que los usuarios puedan guardar configuraciones predefinidas
-- Compatible tanto con filamentos como con resinas

-- =====================================================
-- TABLA MATERIAL_PRESETS (Presets de materiales)
-- =====================================================
CREATE TABLE IF NOT EXISTS material_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  name text NOT NULL,
  price_per_unit numeric NOT NULL DEFAULT 0,
  unit text NOT NULL DEFAULT 'kg', -- kg, g, ml, l
  material_type text NOT NULL DEFAULT 'PLA', -- PLA, ABS, PETG, TPU, Resina, etc.
  category text NOT NULL DEFAULT 'filament', -- filament, resin, other
  color text,
  brand text,
  notes text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_material_presets_user_id ON material_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_material_presets_team_id ON material_presets(team_id);
CREATE INDEX IF NOT EXISTS idx_material_presets_category ON material_presets(category);
CREATE INDEX IF NOT EXISTS idx_material_presets_material_type ON material_presets(material_type);
CREATE INDEX IF NOT EXISTS idx_material_presets_is_default ON material_presets(is_default);

-- =====================================================
-- TRIGGERS
-- =====================================================
CREATE TRIGGER update_material_presets_updated_at
  BEFORE UPDATE ON material_presets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE material_presets ENABLE ROW LEVEL SECURITY;

-- Políticas para material_presets
CREATE POLICY "Users can view their own material presets"
  ON material_presets FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert their own material presets"
  ON material_presets FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their own material presets"
  ON material_presets FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their own material presets"
  ON material_presets FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

