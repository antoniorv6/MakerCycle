-- Fix the conflicting update_sale_totals function
-- The function in the security migration is trying to access non-existent fields
-- We need to ensure the correct function is used

-- Drop the problematic trigger first
DROP TRIGGER IF EXISTS update_sale_totals_trigger ON sales;

-- Drop the function with CASCADE to also drop dependent triggers
DROP FUNCTION IF EXISTS update_sale_totals() CASCADE;

-- Recreate the correct function that works with sale_items table
CREATE OR REPLACE FUNCTION update_sale_totals()
RETURNS trigger AS $$
DECLARE
  sale_id_val uuid;
  total_amount_val numeric;
  total_cost_val numeric;
  total_profit_val numeric;
  total_margin_val numeric;
  total_print_hours_val numeric;
  items_count_val integer;
BEGIN
  -- Get the sale_id
  sale_id_val := COALESCE(NEW.sale_id, OLD.sale_id);
  
  -- Calculate totals
  SELECT 
    COALESCE(SUM(sale_price), 0),
    COALESCE(SUM(unit_cost * quantity), 0),
    COALESCE(SUM(print_hours), 0),
    COUNT(*)
  INTO 
    total_amount_val,
    total_cost_val,
    total_print_hours_val,
    items_count_val
  FROM sale_items 
  WHERE sale_id = sale_id_val;
  
  -- Calculate profit and margin
  total_profit_val := total_amount_val - total_cost_val;
  
  IF total_cost_val > 0 THEN
    total_margin_val := (total_profit_val / total_cost_val) * 100;
  ELSE
    total_margin_val := 0;
  END IF;
  
  -- Update the sale
  UPDATE sales 
  SET 
    total_amount = total_amount_val,
    total_cost = total_cost_val,
    total_profit = total_profit_val,
    total_margin = total_margin_val,
    total_print_hours = total_print_hours_val,
    items_count = items_count_val,
    updated_at = now()
  WHERE id = sale_id_val;
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Recreate the triggers on sale_items table
CREATE TRIGGER update_sale_totals_on_insert
  AFTER INSERT ON sale_items
  FOR EACH ROW EXECUTE FUNCTION update_sale_totals();

CREATE TRIGGER update_sale_totals_on_update
  AFTER UPDATE ON sale_items
  FOR EACH ROW EXECUTE FUNCTION update_sale_totals();

CREATE TRIGGER update_sale_totals_on_delete
  AFTER DELETE ON sale_items
  FOR EACH ROW EXECUTE FUNCTION update_sale_totals(); 