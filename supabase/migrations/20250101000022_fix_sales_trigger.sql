-- Fix sales trigger that references non-existent quantity field
-- The quantity field was moved from sales table to sale_items table

-- Drop the outdated trigger on sales table
DROP TRIGGER IF EXISTS update_sale_totals_trigger ON sales;

-- Create a new function specifically for sales table that doesn't reference quantity
-- This function will be used if we need to update sales table directly
CREATE OR REPLACE FUNCTION update_sales_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- This function is a placeholder for future sales table updates
  -- Currently, sales totals are updated via sale_items triggers
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- The correct update_sale_totals function is already defined in the sale_items migration
-- and is triggered on sale_items table, not sales table 