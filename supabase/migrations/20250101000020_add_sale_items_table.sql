-- Add sale_items table to support multiple projects per sale
CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  project_name text NOT NULL,
  unit_cost numeric NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  sale_price numeric NOT NULL DEFAULT 0,
  print_hours numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add team_id and client_id to sales table if they don't exist
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'team_id') THEN
    ALTER TABLE sales ADD COLUMN team_id uuid REFERENCES teams(id) ON DELETE SET NULL;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'sales' AND column_name = 'client_id') THEN
    ALTER TABLE sales ADD COLUMN client_id uuid REFERENCES clients(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Remove old columns from sales table that are now in sale_items
ALTER TABLE sales DROP COLUMN IF EXISTS project_name;
ALTER TABLE sales DROP COLUMN IF EXISTS unit_cost;
ALTER TABLE sales DROP COLUMN IF EXISTS quantity;
ALTER TABLE sales DROP COLUMN IF EXISTS print_hours;

-- Add new columns to sales table
ALTER TABLE sales ADD COLUMN IF NOT EXISTS total_amount numeric NOT NULL DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS total_cost numeric NOT NULL DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS total_profit numeric NOT NULL DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS total_margin numeric NOT NULL DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS total_print_hours numeric DEFAULT 0;
ALTER TABLE sales ADD COLUMN IF NOT EXISTS items_count integer NOT NULL DEFAULT 0;

-- Enable Row Level Security for sale_items
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;

-- Create policies for sale_items
CREATE POLICY "Users can read own sale items"
  ON sale_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sales 
      WHERE sales.id = sale_items.sale_id 
      AND sales.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own sale items"
  ON sale_items
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sales 
      WHERE sales.id = sale_items.sale_id 
      AND sales.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update own sale items"
  ON sale_items
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sales 
      WHERE sales.id = sale_items.sale_id 
      AND sales.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete own sale items"
  ON sale_items
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sales 
      WHERE sales.id = sale_items.sale_id 
      AND sales.user_id = auth.uid()
    )
  );

-- Create trigger for updated_at on sale_items
CREATE TRIGGER update_sale_items_updated_at
  BEFORE UPDATE ON sale_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create function to update sale totals when items change
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

-- Create triggers to update sale totals
CREATE TRIGGER update_sale_totals_on_insert
  AFTER INSERT ON sale_items
  FOR EACH ROW EXECUTE FUNCTION update_sale_totals();

CREATE TRIGGER update_sale_totals_on_update
  AFTER UPDATE ON sale_items
  FOR EACH ROW EXECUTE FUNCTION update_sale_totals();

CREATE TRIGGER update_sale_totals_on_delete
  AFTER DELETE ON sale_items
  FOR EACH ROW EXECUTE FUNCTION update_sale_totals(); 