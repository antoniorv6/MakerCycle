-- Migration: Fix function search path security warnings
-- This migration addresses the "function_search_path_mutable" warnings by setting explicit search_path

-- 1. Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 2. Fix handle_new_user function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Fix create_team_notification function (maintain void return type)
DROP FUNCTION IF EXISTS create_team_notification(uuid, text, text, text, jsonb);
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
SET search_path = public
AS $$
BEGIN
  -- Check if team exists and user has access
  IF NOT EXISTS (SELECT 1 FROM team_members WHERE team_id = p_team_id AND user_id = auth.uid()) THEN
    RAISE EXCEPTION 'Access denied to team';
  END IF;

  -- Insert notifications for all team members (except the current user who created the action)
  INSERT INTO notifications (team_id, user_id, type, title, message, metadata)
  SELECT p_team_id, user_id, p_type, p_title, p_message, p_metadata
  FROM team_members
  WHERE team_id = p_team_id AND user_id != auth.uid();
END;
$$;

-- 4. Fix mark_notification_read function (maintain void return type)
DROP FUNCTION IF EXISTS mark_notification_read(uuid);
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE notifications
  SET is_read = true
  WHERE id = p_notification_id AND user_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Notification not found or not owned by user';
  END IF;
END;
$$;

-- 5. Fix mark_all_notifications_read function (maintain void return type)
DROP FUNCTION IF EXISTS mark_all_notifications_read();
CREATE OR REPLACE FUNCTION mark_all_notifications_read()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE notifications
  SET is_read = true
  WHERE user_id = auth.uid() AND is_read = false;
END;
$$;

-- 6. Fix delete_notification function (maintain void return type)
DROP FUNCTION IF EXISTS delete_notification(uuid);
CREATE OR REPLACE FUNCTION delete_notification(p_notification_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM notifications
  WHERE id = p_notification_id AND user_id = auth.uid();
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Notification not found or not owned by user';
  END IF;
END;
$$;

-- 7. Fix delete_all_notifications function (maintain void return type)
DROP FUNCTION IF EXISTS delete_all_notifications();
CREATE OR REPLACE FUNCTION delete_all_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM notifications
  WHERE user_id = auth.uid();
END;
$$;

-- 8. Fix delete_read_notifications function (maintain void return type)
DROP FUNCTION IF EXISTS delete_read_notifications();
CREATE OR REPLACE FUNCTION delete_read_notifications()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM notifications
  WHERE user_id = auth.uid() AND is_read = true;
END;
$$;

-- 9. Fix update_company_settings_updated_at function
CREATE OR REPLACE FUNCTION update_company_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 10. Fix update_clients_updated_at function
CREATE OR REPLACE FUNCTION update_clients_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 11. Create update_sale_totals function (if it doesn't exist, create it with proper security)
CREATE OR REPLACE FUNCTION update_sale_totals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update profit and margin calculations
  NEW.profit = (NEW.sale_price - NEW.cost) * NEW.quantity;
  NEW.margin = CASE 
    WHEN NEW.sale_price > 0 THEN ((NEW.sale_price - NEW.cost) / NEW.sale_price) * 100
    ELSE 0
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 12. Create trigger for update_sale_totals if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger 
    WHERE tgname = 'update_sale_totals_trigger'
  ) THEN
    CREATE TRIGGER update_sale_totals_trigger
      BEFORE INSERT OR UPDATE ON sales
      FOR EACH ROW
      EXECUTE FUNCTION update_sale_totals();
  END IF;
END $$; 