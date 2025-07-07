-- Migration: Fix notification functions and add better error handling

-- 1. Drop and recreate the mark_notification_read function with better error handling
DROP FUNCTION IF EXISTS mark_notification_read(uuid);

CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_rows integer;
BEGIN
  UPDATE notifications
  SET is_read = true
  WHERE id = p_notification_id AND user_id = auth.uid();
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  IF affected_rows = 0 THEN
    RAISE EXCEPTION 'Notification not found or not owned by user';
  END IF;
  
  RETURN json_build_object('success', true, 'affected_rows', affected_rows);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 2. Add a function to mark all notifications as read for a user
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_rows integer;
BEGIN
  UPDATE notifications
  SET is_read = true
  WHERE user_id = auth.uid() AND is_read = false;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  RETURN json_build_object('success', true, 'affected_rows', affected_rows);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 3. Add a unique constraint to prevent duplicate notifications
-- This will prevent the same notification from being created multiple times
ALTER TABLE notifications 
ADD CONSTRAINT unique_team_notification 
UNIQUE (team_id, type, title, message, created_at);

-- 4. Add an index to improve performance for the unique constraint
CREATE INDEX IF NOT EXISTS idx_notifications_unique_check 
ON notifications(team_id, type, title, message, created_at); 