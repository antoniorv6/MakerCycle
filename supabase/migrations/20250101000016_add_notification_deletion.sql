-- Migration: Add notification deletion functionality

-- 1. Add DELETE policy for notifications
CREATE POLICY "Users can delete own notifications"
  ON notifications
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- 2. Create function to delete a single notification
CREATE OR REPLACE FUNCTION delete_notification(p_notification_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_rows integer;
BEGIN
  DELETE FROM notifications
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

-- 3. Create function to delete all notifications for a user
CREATE OR REPLACE FUNCTION delete_all_notifications()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_rows integer;
BEGIN
  DELETE FROM notifications
  WHERE user_id = auth.uid();
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  RETURN json_build_object('success', true, 'affected_rows', affected_rows);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- 4. Create function to delete read notifications for a user
CREATE OR REPLACE FUNCTION delete_read_notifications()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_rows integer;
BEGIN
  DELETE FROM notifications
  WHERE user_id = auth.uid() AND is_read = true;
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  RETURN json_build_object('success', true, 'affected_rows', affected_rows);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$; 