-- Migration: Improve notification creation to prevent duplicates

-- 1. Drop and recreate the create_team_notification function to create notifications for all team members
DROP FUNCTION IF EXISTS create_team_notification(uuid, text, text, text, jsonb);

CREATE OR REPLACE FUNCTION create_team_notification(
  p_team_id uuid,
  p_type text,
  p_title text,
  p_message text,
  p_metadata jsonb DEFAULT '{}'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_rows integer;
BEGIN
  -- Check if team exists and user has access
  IF NOT EXISTS (SELECT 1 FROM team_members WHERE team_id = p_team_id AND user_id = auth.uid()) THEN
    RETURN json_build_object('success', false, 'error', 'Access denied to team');
  END IF;

  -- Insert notifications for all team members (except the current user who created the action)
  INSERT INTO notifications (team_id, user_id, type, title, message, metadata)
  SELECT p_team_id, user_id, p_type, p_title, p_message, p_metadata
  FROM team_members
  WHERE team_id = p_team_id AND user_id != auth.uid();
  
  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  
  RETURN json_build_object('success', true, 'affected_rows', affected_rows);
EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$; 