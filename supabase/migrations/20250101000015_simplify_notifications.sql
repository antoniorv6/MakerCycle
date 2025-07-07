-- Migration: Simplify notifications structure

-- 1. Remove the unique constraint since we're now creating notifications per user
ALTER TABLE notifications DROP CONSTRAINT IF EXISTS unique_team_notification;

-- 2. Drop the index that was created for the unique constraint
DROP INDEX IF EXISTS idx_notifications_unique_check;

-- 3. Update RLS policies to be more specific
DROP POLICY IF EXISTS "Users can read team notifications" ON notifications;
CREATE POLICY "Users can read own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- 4. Update the insert policy to be more specific
DROP POLICY IF EXISTS "Users can insert team notifications" ON notifications;
CREATE POLICY "Users can insert notifications for team members"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  ); 