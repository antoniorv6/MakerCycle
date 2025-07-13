-- Migration: Fix notification UPDATE policy

-- 1. Drop the old UPDATE policy
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- 2. Create a new UPDATE policy that allows users to update their own notifications
CREATE POLICY "Users can update own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3. Ensure the mark_all_notifications_read function exists and works correctly
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