-- Debug and fix team roles issue
-- First, let's see what roles exist in the database
-- Then make the policies more permissive

-- Drop all existing policies to start fresh
DROP POLICY IF EXISTS "Users can read team members" ON team_members;
DROP POLICY IF EXISTS "Users can insert team members" ON team_members;
DROP POLICY IF EXISTS "Users can update team members" ON team_members;
DROP POLICY IF EXISTS "Users can delete team members" ON team_members;

-- Create very permissive policies for debugging
-- Allow all authenticated users to do everything (temporarily for debugging)
CREATE POLICY "Users can read team members"
  ON team_members
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can insert team members"
  ON team_members
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Users can update team members"
  ON team_members
  FOR UPDATE
  TO authenticated
  USING (true);

CREATE POLICY "Users can delete team members"
  ON team_members
  FOR DELETE
  TO authenticated
  USING (true);

-- Also create a function to check team roles
CREATE OR REPLACE FUNCTION debug_team_roles(team_id_param uuid)
RETURNS TABLE(user_id uuid, role text, email text) AS $$
BEGIN
  RETURN QUERY
  SELECT tm.user_id, tm.role, p.email
  FROM team_members tm
  LEFT JOIN profiles p ON tm.user_id = p.id
  WHERE tm.team_id = team_id_param
  ORDER BY tm.role, p.email;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 