-- Migration: Create kanban_board table for Trello-like project management

-- 1. Create ENUM type for kanban status
CREATE TYPE kanban_status AS ENUM ('pending', 'in_progress', 'completed');

-- 2. Create kanban_board table
CREATE TABLE IF NOT EXISTS kanban_board (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  status kanban_status NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, project_id, team_id, status) -- evita duplicados exactos
);

-- 3. Enable Row Level Security
ALTER TABLE kanban_board ENABLE ROW LEVEL SECURITY;

-- 4. RLS policies
CREATE POLICY "Users can manage their own kanban cards" ON kanban_board
  FOR ALL
  TO authenticated
  USING (
    user_id = auth.uid() OR
    (team_id IS NOT NULL AND team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
  );

-- 5. Trigger for updated_at
CREATE TRIGGER update_kanban_board_updated_at
  BEFORE UPDATE ON kanban_board
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 