-- =====================================================
-- MIGRACIÓN: Sistema de Presets de Envío
-- =====================================================
-- Esta migración añade la funcionalidad de presets de envío
-- para que los usuarios puedan guardar configuraciones de proveedores
-- de envío con tarifas por tramos de peso

-- =====================================================
-- TABLA SHIPPING_PRESETS (Presets de envío)
-- =====================================================
CREATE TABLE IF NOT EXISTS shipping_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  name text NOT NULL,                          -- Nombre del preset (ej: "Correos Nacional")
  provider_name text NOT NULL,                 -- Nombre del proveedor (ej: "Correos", "SEUR")
  is_custom_provider boolean DEFAULT false,     -- true si es un proveedor personalizado
  weight_tiers jsonb NOT NULL DEFAULT '[]'::jsonb, -- Array de tramos [{min_weight, max_weight, price}] en gramos
  notes text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_shipping_presets_user_id ON shipping_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_shipping_presets_team_id ON shipping_presets(team_id);
CREATE INDEX IF NOT EXISTS idx_shipping_presets_is_default ON shipping_presets(is_default);

-- =====================================================
-- TRIGGERS
-- =====================================================
CREATE TRIGGER update_shipping_presets_updated_at
  BEFORE UPDATE ON shipping_presets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE shipping_presets ENABLE ROW LEVEL SECURITY;

-- Políticas para shipping_presets
CREATE POLICY "Users can view their own shipping presets"
  ON shipping_presets FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert their own shipping presets"
  ON shipping_presets FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their own shipping presets"
  ON shipping_presets FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their own shipping presets"
  ON shipping_presets FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

-- =====================================================
-- CAMPOS DE ENVÍO EN PROJECTS
-- =====================================================
ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS shipping_enabled boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS shipping_preset_id uuid REFERENCES shipping_presets(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS packaging_weight_mode text DEFAULT 'percentage',
  ADD COLUMN IF NOT EXISTS packaging_weight_value numeric DEFAULT 10,
  ADD COLUMN IF NOT EXISTS shipping_cost numeric DEFAULT 0;
