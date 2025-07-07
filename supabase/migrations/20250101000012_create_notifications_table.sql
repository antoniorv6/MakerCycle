-- Migration: Create notifications table for team events

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL, -- 'project', 'sale', 'cost', 'team_member'
  title text NOT NULL,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}', -- Store additional data like project name, amount, etc.
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- 2. Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_team_id ON notifications(team_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- 3. Enable RLS on notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- 4. Create RLS policies for notifications
-- Users can read notifications for teams they belong to
CREATE POLICY "Users can read team notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

-- Users can insert notifications for teams they belong to
CREATE POLICY "Users can insert team notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 5. Create function to create notifications for all team members
CREATE OR REPLACE FUNCTION create_team_notification(
  p_team_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO notifications (team_id, user_id, type, title, message, metadata)
  SELECT p_team_id, user_id, p_type, p_title, p_message, p_metadata
  FROM team_members
  WHERE team_id = p_team_id;
END;
$$;

-- 6. Create function to mark notifications as read
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications
  SET is_read = true
  WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$; 