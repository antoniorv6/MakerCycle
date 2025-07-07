-- Migration: Add team_id to expenses table and update RLS policies

-- 1. Add team_id to expenses table
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES teams(id) ON DELETE SET NULL;

-- 2. Update RLS policies for expenses
DROP POLICY IF EXISTS "Users can read own expenses" ON expenses;
CREATE POLICY "Users can read own or team expenses"
  ON expenses
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert own expenses" ON expenses;
CREATE POLICY "Users can insert own or team expenses"
  ON expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    team_id IS NULL OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update own expenses" ON expenses;
CREATE POLICY "Users can update own or team expenses"
  ON expenses
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete own expenses" ON expenses;
CREATE POLICY "Users can delete own or team expenses"
  ON expenses
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

-- 3. Add team_id to sales table as well
ALTER TABLE sales ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES teams(id) ON DELETE SET NULL;

-- 4. Update RLS policies for sales
DROP POLICY IF EXISTS "Users can read own sales" ON sales;
CREATE POLICY "Users can read own or team sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert own sales" ON sales;
CREATE POLICY "Users can insert own or team sales"
  ON sales
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    team_id IS NULL OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update own sales" ON sales;
CREATE POLICY "Users can update own or team sales"
  ON sales
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete own sales" ON sales;
CREATE POLICY "Users can delete own or team sales"
  ON sales
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  ); 