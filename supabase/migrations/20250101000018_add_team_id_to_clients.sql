-- Migration: Add team_id to clients table and update RLS policies

-- 1. Add team_id to clients table
ALTER TABLE clients ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES teams(id) ON DELETE SET NULL;

-- 2. Update RLS policies for clients
DROP POLICY IF EXISTS "Users can read own clients" ON clients;
CREATE POLICY "Users can read own or team clients"
  ON clients
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert own clients" ON clients;
CREATE POLICY "Users can insert own or team clients"
  ON clients
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    team_id IS NULL OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update own clients" ON clients;
CREATE POLICY "Users can update own or team clients"
  ON clients
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete own clients" ON clients;
CREATE POLICY "Users can delete own or team clients"
  ON clients
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  ); 