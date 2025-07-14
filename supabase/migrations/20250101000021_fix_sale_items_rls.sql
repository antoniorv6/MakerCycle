-- Fix RLS policies for sale_items to handle updates correctly
-- Drop existing policies
DROP POLICY IF EXISTS "Users can read own sale items" ON sale_items;
DROP POLICY IF EXISTS "Users can insert own sale items" ON sale_items;
DROP POLICY IF EXISTS "Users can update own sale items" ON sale_items;
DROP POLICY IF EXISTS "Users can delete own sale items" ON sale_items;

-- Create improved policies that handle team context
CREATE POLICY "Users can read own sale items"
  ON sale_items
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sales 
      WHERE sales.id = sale_items.sale_id 
      AND (
        (sales.user_id = auth.uid() AND sales.team_id IS NULL) OR
        (sales.team_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM team_members 
          WHERE team_members.team_id = sales.team_id 
          AND team_members.user_id = auth.uid()
        ))
      )
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
      AND (
        (sales.user_id = auth.uid() AND sales.team_id IS NULL) OR
        (sales.team_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM team_members 
          WHERE team_members.team_id = sales.team_id 
          AND team_members.user_id = auth.uid()
        ))
      )
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
      AND (
        (sales.user_id = auth.uid() AND sales.team_id IS NULL) OR
        (sales.team_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM team_members 
          WHERE team_members.team_id = sales.team_id 
          AND team_members.user_id = auth.uid()
        ))
      )
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
      AND (
        (sales.user_id = auth.uid() AND sales.team_id IS NULL) OR
        (sales.team_id IS NOT NULL AND EXISTS (
          SELECT 1 FROM team_members 
          WHERE team_members.team_id = sales.team_id 
          AND team_members.user_id = auth.uid()
        ))
      )
    )
  ); 