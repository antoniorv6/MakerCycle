-- Fix the overly restrictive final RLS policies
-- The SELECT policy was preventing reading team data in personal view

-- Drop the restrictive policies
DROP POLICY IF EXISTS "Users can read team members" ON team_members;
DROP POLICY IF EXISTS "Users can insert team members" ON team_members;
DROP POLICY IF EXISTS "Users can update team members" ON team_members;
DROP POLICY IF EXISTS "Users can delete team members" ON team_members;

-- Create balanced policies
-- Allow all authenticated users to read team_members (needed for navigation and team switching)
CREATE POLICY "Users can read team members"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (true);

-- Users can insert team members if they are members of that team
CREATE POLICY "Users can insert team members"
  ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

-- Users can update team members if they are members of that team
CREATE POLICY "Users can update team members"
  ON team_members
  FOR UPDATE
  TO authenticated
  USING (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

-- Users can delete team members if they are members of that team
CREATE POLICY "Users can delete team members"
  ON team_members
  FOR DELETE
  TO authenticated
  USING (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  ); 