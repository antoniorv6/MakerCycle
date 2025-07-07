-- Fix overly restrictive RLS policies for team_members table
-- The previous policies were too restrictive and prevented reading when not in a team

-- Drop the restrictive policies
DROP POLICY IF EXISTS "Users can read team members" ON team_members;
DROP POLICY IF EXISTS "Users can insert team members" ON team_members;
DROP POLICY IF EXISTS "Users can update team members" ON team_members;
DROP POLICY IF EXISTS "Users can delete team members" ON team_members;

-- Create more flexible policies
-- Users can read team members if they are members of that team OR if they are authenticated
CREATE POLICY "Users can read team members"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (true); -- Allow all authenticated users to read team_members

-- Users can insert team members if they are admin/owner of that team
CREATE POLICY "Users can insert team members"
  ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Users can update team members if they are admin/owner of that team
CREATE POLICY "Users can update team members"
  ON team_members
  FOR UPDATE
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  );

-- Users can delete team members if they are admin/owner of that team
CREATE POLICY "Users can delete team members"
  ON team_members
  FOR DELETE
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid() AND role IN ('admin', 'owner')
    )
  ); 