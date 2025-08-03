-- Fix the sales trigger that references non-existent quantity field
-- The quantity field was moved from sales table to sale_items table

-- First, drop the problematic trigger
DROP TRIGGER IF EXISTS update_sale_totals_trigger ON sales;

-- Create a new function for sales table that doesn't reference quantity
CREATE OR REPLACE FUNCTION update_sales_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- This function is a placeholder for future sales table updates
  -- Currently, sales totals are updated via sale_items triggers
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create a new trigger for sales table if needed in the future
-- (Currently commented out since we don't need it)
-- CREATE TRIGGER update_sales_totals_trigger
--   BEFORE INSERT OR UPDATE ON sales
--   FOR EACH ROW
--   EXECUTE FUNCTION update_sales_totals(); 