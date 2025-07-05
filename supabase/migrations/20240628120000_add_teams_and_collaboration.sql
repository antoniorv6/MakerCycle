-- Migration: Add teams and team-based collaboration to projects

-- 1. Create teams table
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- 2. Create team_members table
CREATE TABLE IF NOT EXISTS team_members (
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member', -- e.g., 'member', 'admin'
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (team_id, user_id)
);

-- 3. Add team_id to projects
ALTER TABLE projects ADD COLUMN IF NOT EXISTS team_id uuid REFERENCES teams(id) ON DELETE SET NULL;

-- 4. Update RLS policies for projects
DROP POLICY IF EXISTS "Users can read own projects" ON projects;
CREATE POLICY "Users can read own or team projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can insert own projects" ON projects;
CREATE POLICY "Users can insert own or team projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    team_id IS NULL OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can update own projects" ON projects;
CREATE POLICY "Users can update own or team projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

DROP POLICY IF EXISTS "Users can delete own projects" ON projects;
CREATE POLICY "Users can delete own or team projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

-- 5. Triggers for updated_at
CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 