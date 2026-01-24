-- =====================================================
-- MIGRACIÓN: Sistema de Amortización de Impresoras
-- =====================================================
-- Esta migración añade:
-- 1. Campos de método de amortización por defecto a printer_presets
-- 2. Tabla para vincular ventas con amortizaciones de impresoras

-- =====================================================
-- ACTUALIZAR PRINTER_PRESETS
-- =====================================================
-- Añadir campos para método de amortización por defecto
ALTER TABLE printer_presets 
ADD COLUMN IF NOT EXISTS amortization_method text DEFAULT 'percentage' CHECK (amortization_method IN ('fixed', 'percentage')),
ADD COLUMN IF NOT EXISTS amortization_value numeric DEFAULT 10, -- Porcentaje o cantidad fija según el método
ADD COLUMN IF NOT EXISTS is_being_amortized boolean DEFAULT false; -- Indica si se está amortizando actualmente

-- =====================================================
-- TABLA SALES_PRINTER_AMORTIZATIONS
-- =====================================================
-- Vincula ventas con amortizaciones de impresoras
CREATE TABLE IF NOT EXISTS sales_printer_amortizations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
  printer_preset_id uuid REFERENCES printer_presets(id) ON DELETE CASCADE NOT NULL,
  amortization_method text NOT NULL CHECK (amortization_method IN ('fixed', 'percentage')),
  amortization_value numeric NOT NULL DEFAULT 0, -- Porcentaje o cantidad según el método
  amortization_amount numeric NOT NULL DEFAULT 0, -- Cantidad real amortizada (calculada)
  profit_before_amortization numeric NOT NULL DEFAULT 0, -- Beneficio antes de la amortización
  profit_after_amortization numeric NOT NULL DEFAULT 0, -- Beneficio después de la amortización
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(sale_id, printer_preset_id) -- Una venta solo puede amortizar una impresora una vez
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_sales_printer_amortizations_sale_id ON sales_printer_amortizations(sale_id);
CREATE INDEX IF NOT EXISTS idx_sales_printer_amortizations_printer_id ON sales_printer_amortizations(printer_preset_id);
CREATE INDEX IF NOT EXISTS idx_printer_presets_is_being_amortized ON printer_presets(is_being_amortized);

-- =====================================================
-- TRIGGERS
-- =====================================================
CREATE TRIGGER update_sales_printer_amortizations_updated_at
  BEFORE UPDATE ON sales_printer_amortizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para actualizar is_being_amortized cuando se crea/elimina una amortización
CREATE OR REPLACE FUNCTION update_printer_amortization_status()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    -- Marcar la impresora como en amortización
    UPDATE printer_presets
    SET is_being_amortized = true
    WHERE id = NEW.printer_preset_id;
    
    -- Actualizar las horas de uso de la impresora basándose en las horas de impresión de la venta
    UPDATE printer_presets
    SET current_usage_hours = current_usage_hours + (
      SELECT COALESCE(SUM(print_hours), 0)
      FROM sale_items
      WHERE sale_id = NEW.sale_id
    )
    WHERE id = NEW.printer_preset_id;
    
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    -- Verificar si hay más amortizaciones para esta impresora
    IF NOT EXISTS (
      SELECT 1 FROM sales_printer_amortizations 
      WHERE printer_preset_id = OLD.printer_preset_id 
      AND id != OLD.id
    ) THEN
      -- Si no hay más amortizaciones, desmarcar
      UPDATE printer_presets
      SET is_being_amortized = false
      WHERE id = OLD.printer_preset_id;
    END IF;
    
    -- Revertir las horas de uso (opcional, según tu lógica de negocio)
    -- UPDATE printer_presets
    -- SET current_usage_hours = GREATEST(0, current_usage_hours - (
    --   SELECT COALESCE(SUM(print_hours), 0)
    --   FROM sale_items
    --   WHERE sale_id = OLD.sale_id
    -- ))
    -- WHERE id = OLD.printer_preset_id;
    
    RETURN OLD;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_printer_amortization_status
  AFTER INSERT OR DELETE ON sales_printer_amortizations
  FOR EACH ROW EXECUTE FUNCTION update_printer_amortization_status();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================
ALTER TABLE sales_printer_amortizations ENABLE ROW LEVEL SECURITY;

-- Políticas para sales_printer_amortizations
CREATE POLICY "Users can view their own printer amortizations"
  ON sales_printer_amortizations FOR SELECT TO authenticated
  USING (
    sale_id IN (
      SELECT id FROM sales WHERE user_id = auth.uid() OR team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can insert their own printer amortizations"
  ON sales_printer_amortizations FOR INSERT TO authenticated
  WITH CHECK (
    sale_id IN (
      SELECT id FROM sales WHERE user_id = auth.uid() OR team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    ) AND
    printer_preset_id IN (
      SELECT id FROM printer_presets WHERE user_id = auth.uid() OR team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update their own printer amortizations"
  ON sales_printer_amortizations FOR UPDATE TO authenticated
  USING (
    sale_id IN (
      SELECT id FROM sales WHERE user_id = auth.uid() OR team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can delete their own printer amortizations"
  ON sales_printer_amortizations FOR DELETE TO authenticated
  USING (
    sale_id IN (
      SELECT id FROM sales WHERE user_id = auth.uid() OR team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );
