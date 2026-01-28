-- =====================================================
-- MIGRACIÓN: Sistema de Perfiles de Impresora
-- =====================================================
-- Esta migración añade la funcionalidad de perfiles de impresora
-- para que los usuarios puedan guardar configuraciones de sus impresoras
-- incluyendo consumo eléctrico y datos para amortización

-- =====================================================
-- TABLA PRINTER_PRESETS (Perfiles de impresora)
-- =====================================================
CREATE TABLE IF NOT EXISTS printer_presets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  name text NOT NULL,
  power_consumption numeric NOT NULL DEFAULT 0.35, -- Consumo en kW (ej: 0.35 kW)
  purchase_price numeric NOT NULL DEFAULT 0, -- Precio de compra de la impresora
  amortization_hours numeric NOT NULL DEFAULT 2000, -- Horas de vida útil estimadas (ej: 2000h)
  current_usage_hours numeric NOT NULL DEFAULT 0, -- Horas de uso actuales
  brand text,
  model text,
  notes text,
  is_default boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_printer_presets_user_id ON printer_presets(user_id);
CREATE INDEX IF NOT EXISTS idx_printer_presets_team_id ON printer_presets(team_id);
CREATE INDEX IF NOT EXISTS idx_printer_presets_is_default ON printer_presets(is_default);

-- =====================================================
-- TRIGGERS
-- =====================================================
CREATE TRIGGER update_printer_presets_updated_at
  BEFORE UPDATE ON printer_presets
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE printer_presets ENABLE ROW LEVEL SECURITY;

-- Políticas para printer_presets
CREATE POLICY "Users can view their own printer presets"
  ON printer_presets FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert their own printer presets"
  ON printer_presets FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their own printer presets"
  ON printer_presets FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their own printer presets"
  ON printer_presets FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );
