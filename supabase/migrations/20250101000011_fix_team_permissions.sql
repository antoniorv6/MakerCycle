-- Fix team permissions: members can manage projects/expenses, only admins can manage team members

-- Update team_members policies to be more restrictive for member management
DROP POLICY IF EXISTS "Users can insert team members" ON team_members;
DROP POLICY IF EXISTS "Users can update team members" ON team_members;
DROP POLICY IF EXISTS "Users can delete team members" ON team_members;

-- Only admins/owners can add/update/delete team members
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

-- Update projects policies to allow team members full access
DROP POLICY IF EXISTS "Users can read own or team projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own or team projects" ON projects;
DROP POLICY IF EXISTS "Users can update own or team projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own or team projects" ON projects;

CREATE POLICY "Users can read own or team projects"
  ON projects
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own or team projects"
  ON projects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own or team projects"
  ON projects
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own or team projects"
  ON projects
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

-- Update expenses policies to allow team members full access
DROP POLICY IF EXISTS "Users can read own or team expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert own or team expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update own or team expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete own or team expenses" ON expenses;

CREATE POLICY "Users can read own or team expenses"
  ON expenses
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own or team expenses"
  ON expenses
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own or team expenses"
  ON expenses
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own or team expenses"
  ON expenses
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

-- Update sales policies to allow team members full access
DROP POLICY IF EXISTS "Users can read own or team sales" ON sales;
DROP POLICY IF EXISTS "Users can insert own or team sales" ON sales;
DROP POLICY IF EXISTS "Users can update own or team sales" ON sales;
DROP POLICY IF EXISTS "Users can delete own or team sales" ON sales;

CREATE POLICY "Users can read own or team sales"
  ON sales
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own or team sales"
  ON sales
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own or team sales"
  ON sales
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own or team sales"
  ON sales
  FOR DELETE
  TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  ); 