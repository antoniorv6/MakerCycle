-- Fix the INSERT policy for team_members to be more flexible
-- The current policy is too restrictive and prevents adding members

-- Drop the restrictive INSERT policy
DROP POLICY IF EXISTS "Users can insert team members" ON team_members;

-- Create a more flexible INSERT policy
-- Allow users to insert team members if they are members of that team (any role)
CREATE POLICY "Users can insert team members"
  ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

-- Also update the UPDATE and DELETE policies to be more flexible
DROP POLICY IF EXISTS "Users can update team members" ON team_members;
DROP POLICY IF EXISTS "Users can delete team members" ON team_members;

CREATE POLICY "Users can update team members"
  ON team_members
  FOR UPDATE
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete team members"
  ON team_members
  FOR DELETE
  TO authenticated
  USING (
    team_id IN (
      SELECT team_id FROM team_members 
      WHERE user_id = auth.uid()
    )
  ); 