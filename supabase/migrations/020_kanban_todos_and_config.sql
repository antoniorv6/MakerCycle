-- Migration 020: Kanban card configuration (priority, deadline) and per-phase TODOs
-- Adds priority and deadline fields to kanban_board
-- Creates kanban_card_todos table for per-phase task checklists

-- 1. Create priority enum
CREATE TYPE kanban_priority AS ENUM ('high', 'medium', 'low');

-- 2. Add priority and deadline columns to kanban_board
ALTER TABLE kanban_board
  ADD COLUMN priority kanban_priority NOT NULL DEFAULT 'medium',
  ADD COLUMN deadline date DEFAULT NULL;

-- 3. Fix UNIQUE constraint: replace (user_id, project_id, team_id, status) with proper uniqueness
--    The old constraint allowed the same project in multiple columns (bug)
ALTER TABLE kanban_board DROP CONSTRAINT IF EXISTS kanban_board_user_id_project_id_team_id_status_key;

-- Partial unique indexes handle NULL team_id correctly
CREATE UNIQUE INDEX idx_kanban_board_unique_project
  ON kanban_board (user_id, project_id) WHERE team_id IS NULL;
CREATE UNIQUE INDEX idx_kanban_board_unique_project_team
  ON kanban_board (team_id, project_id) WHERE team_id IS NOT NULL;

-- Index for deadline queries
CREATE INDEX idx_kanban_board_deadline ON kanban_board(deadline) WHERE deadline IS NOT NULL;

-- 4. Create kanban_card_todos table
CREATE TABLE IF NOT EXISTS kanban_card_todos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  kanban_card_id uuid REFERENCES kanban_board(id) ON DELETE CASCADE NOT NULL,
  phase kanban_status NOT NULL,
  title text NOT NULL,
  is_completed boolean NOT NULL DEFAULT false,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Indexes
CREATE INDEX idx_kanban_card_todos_card_id ON kanban_card_todos(kanban_card_id);
CREATE INDEX idx_kanban_card_todos_card_phase ON kanban_card_todos(kanban_card_id, phase);

-- Auto-update trigger
CREATE TRIGGER update_kanban_card_todos_updated_at
  BEFORE UPDATE ON kanban_card_todos
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. RLS for kanban_card_todos (access delegated through kanban_board)
ALTER TABLE kanban_card_todos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "kanban_card_todos_all_policy"
  ON kanban_card_todos FOR ALL TO authenticated
  USING (
    kanban_card_id IN (
      SELECT id FROM kanban_board
      WHERE user_id = (select auth.uid())
         OR (team_id IS NOT NULL AND team_id IN (
              SELECT team_id FROM team_members WHERE user_id = (select auth.uid())
            ))
    )
  )
  WITH CHECK (
    kanban_card_id IN (
      SELECT id FROM kanban_board
      WHERE user_id = (select auth.uid())
         OR (team_id IS NOT NULL AND team_id IN (
              SELECT team_id FROM team_members WHERE user_id = (select auth.uid())
            ))
    )
  );
