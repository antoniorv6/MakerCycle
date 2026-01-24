-- =====================================================
-- MIGRACIÓN 019: CORRECCIÓN COMPLETA DE FUNCIONALIDAD DE EQUIPOS
-- =====================================================
-- Esta migración corrige todos los problemas de seguridad y funcionalidad
-- relacionados con la gestión de equipos:
--
-- 1. Habilita RLS en teams y team_members
-- 2. Elimina todas las políticas duplicadas/conflictivas
-- 3. Crea políticas RLS correctas SIN recursión infinita
-- 4. Crea funciones RPC para operaciones de equipo
-- 5. Corrige funciones existentes con search_path seguro
-- 6. Elimina políticas permisivas innecesarias
-- =====================================================

-- =====================================================
-- PARTE 1: HABILITAR RLS EN TEAMS Y TEAM_MEMBERS
-- =====================================================

ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PARTE 2: ELIMINAR TODAS LAS POLÍTICAS EXISTENTES
-- =====================================================

-- Políticas de teams
DROP POLICY IF EXISTS "teams_select_policy" ON teams;
DROP POLICY IF EXISTS "teams_insert_policy" ON teams;
DROP POLICY IF EXISTS "teams_update_policy" ON teams;
DROP POLICY IF EXISTS "teams_delete_policy" ON teams;
DROP POLICY IF EXISTS "Users can read teams they belong to" ON teams;
DROP POLICY IF EXISTS "Users can create teams" ON teams;
DROP POLICY IF EXISTS "Users can update teams they own" ON teams;

-- Políticas de team_members (todas las variantes)
DROP POLICY IF EXISTS "team_members_select_policy" ON team_members;
DROP POLICY IF EXISTS "team_members_insert_policy" ON team_members;
DROP POLICY IF EXISTS "team_members_update_policy" ON team_members;
DROP POLICY IF EXISTS "team_members_delete_policy" ON team_members;
DROP POLICY IF EXISTS "team_members_select_own" ON team_members;
DROP POLICY IF EXISTS "team_members_insert_by_owner" ON team_members;
DROP POLICY IF EXISTS "team_members_update_by_owner" ON team_members;
DROP POLICY IF EXISTS "team_members_delete_by_owner" ON team_members;
DROP POLICY IF EXISTS "Users can read team members" ON team_members;
DROP POLICY IF EXISTS "Team owners can manage members" ON team_members;
DROP POLICY IF EXISTS "Team owners can insert members" ON team_members;
DROP POLICY IF EXISTS "Team owners can update members" ON team_members;
DROP POLICY IF EXISTS "Team owners can delete members" ON team_members;

-- Políticas permisivas de profiles
DROP POLICY IF EXISTS "profiles_trigger_insert_policy" ON profiles;
DROP POLICY IF EXISTS "profiles_update_for_password_recovery" ON profiles;
DROP POLICY IF EXISTS "profiles_select_for_password_recovery" ON profiles;
DROP POLICY IF EXISTS "profiles_select_for_team_invites" ON profiles;

-- =====================================================
-- PARTE 3: CREAR POLÍTICAS RLS CORRECTAS PARA TEAMS
-- =====================================================

-- SELECT: Usuarios pueden ver equipos donde son miembros o que han creado
CREATE POLICY "teams_select_policy" ON teams
  FOR SELECT TO authenticated
  USING (
    created_by = (SELECT auth.uid())
    OR id IN (
      SELECT team_id FROM team_members WHERE user_id = (SELECT auth.uid())
    )
  );

-- INSERT: Cualquier usuario autenticado puede crear equipos
CREATE POLICY "teams_insert_policy" ON teams
  FOR INSERT TO authenticated
  WITH CHECK (created_by = (SELECT auth.uid()));

-- UPDATE: Solo el creador puede actualizar
CREATE POLICY "teams_update_policy" ON teams
  FOR UPDATE TO authenticated
  USING (created_by = (SELECT auth.uid()))
  WITH CHECK (created_by = (SELECT auth.uid()));

-- DELETE: Solo el creador puede eliminar
CREATE POLICY "teams_delete_policy" ON teams
  FOR DELETE TO authenticated
  USING (created_by = (SELECT auth.uid()));

-- =====================================================
-- PARTE 4: CREAR POLÍTICAS RLS PARA TEAM_MEMBERS
-- (Sin auto-referencia para evitar recursión infinita)
-- =====================================================

-- SELECT: El usuario solo puede ver sus propias membresías
-- Para ver otros miembros, usar la función RPC get_team_members_with_profiles
CREATE POLICY "team_members_select_own" ON team_members
  FOR SELECT TO authenticated
  USING (user_id = (SELECT auth.uid()));

-- INSERT: El propietario del equipo puede agregar miembros
CREATE POLICY "team_members_insert_by_owner" ON team_members
  FOR INSERT TO authenticated
  WITH CHECK (
    team_id IN (SELECT id FROM teams WHERE created_by = (SELECT auth.uid()))
  );

-- UPDATE: El propietario del equipo puede actualizar roles
CREATE POLICY "team_members_update_by_owner" ON team_members
  FOR UPDATE TO authenticated
  USING (
    team_id IN (SELECT id FROM teams WHERE created_by = (SELECT auth.uid()))
  )
  WITH CHECK (
    team_id IN (SELECT id FROM teams WHERE created_by = (SELECT auth.uid()))
  );

-- DELETE: El propietario del equipo puede eliminar miembros
CREATE POLICY "team_members_delete_by_owner" ON team_members
  FOR DELETE TO authenticated
  USING (
    team_id IN (SELECT id FROM teams WHERE created_by = (SELECT auth.uid()))
  );

-- =====================================================
-- PARTE 5: ACTUALIZAR POLÍTICA DE PROFILES
-- (Permitir búsqueda para invitaciones de equipo)
-- =====================================================

-- Eliminar política de select existente si existe
DROP POLICY IF EXISTS "profiles_select_policy" ON profiles;

-- Crear política que permite:
-- 1. Ver el propio perfil
-- 2. Buscar perfiles para invitaciones (solo lectura)
CREATE POLICY "profiles_select_policy" ON profiles
  FOR SELECT TO authenticated
  USING (true);  -- Permitir lectura de todos los perfiles para búsqueda

-- =====================================================
-- PARTE 6: FUNCIONES RPC PARA OPERACIONES DE EQUIPO
-- =====================================================

-- Función para crear equipo con propietario (atómica)
CREATE OR REPLACE FUNCTION create_team_with_owner(
  p_team_name TEXT,
  p_user_id UUID
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_team_id UUID;
  v_result json;
BEGIN
  -- Validar que el usuario existe
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = p_user_id) THEN
    RAISE EXCEPTION 'Usuario no encontrado';
  END IF;

  -- Crear el equipo
  INSERT INTO teams (name, created_by)
  VALUES (p_team_name, p_user_id)
  RETURNING id INTO v_team_id;

  -- Agregar al creador como admin
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (v_team_id, p_user_id, 'admin');

  -- Retornar el equipo creado
  SELECT json_build_object(
    'id', t.id,
    'name', t.name,
    'created_by', t.created_by,
    'created_at', t.created_at,
    'updated_at', t.updated_at
  ) INTO v_result
  FROM teams t
  WHERE t.id = v_team_id;

  RETURN v_result;
END;
$$;

-- Función para invitar miembros por email
CREATE OR REPLACE FUNCTION invite_team_member(
  p_team_id UUID,
  p_email TEXT,
  p_role TEXT DEFAULT 'member'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_team_owner_id UUID;
  v_is_admin BOOLEAN;
  v_result json;
BEGIN
  -- Obtener el user_id del perfil por email (case insensitive)
  SELECT id INTO v_user_id
  FROM profiles
  WHERE LOWER(email) = LOWER(p_email);

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Usuario no encontrado con el email: %', p_email;
  END IF;

  -- Verificar que el equipo existe
  SELECT created_by INTO v_team_owner_id
  FROM teams
  WHERE id = p_team_id;

  IF v_team_owner_id IS NULL THEN
    RAISE EXCEPTION 'Equipo no encontrado';
  END IF;

  -- Verificar que el usuario actual es propietario o admin del equipo
  SELECT EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_id = p_team_id 
    AND user_id = auth.uid() 
    AND role = 'admin'
  ) INTO v_is_admin;

  IF v_team_owner_id != auth.uid() AND NOT v_is_admin THEN
    RAISE EXCEPTION 'No tienes permisos para invitar miembros a este equipo';
  END IF;

  -- Verificar si el usuario ya es miembro
  IF EXISTS (SELECT 1 FROM team_members WHERE team_id = p_team_id AND user_id = v_user_id) THEN
    RAISE EXCEPTION 'El usuario ya es miembro de este equipo';
  END IF;

  -- Validar el rol
  IF p_role NOT IN ('member', 'admin') THEN
    RAISE EXCEPTION 'Rol inválido. Debe ser "member" o "admin"';
  END IF;

  -- Agregar al usuario como miembro
  INSERT INTO team_members (team_id, user_id, role)
  VALUES (p_team_id, v_user_id, p_role);

  -- Retornar información del miembro agregado
  SELECT json_build_object(
    'user_id', p.id,
    'email', p.email,
    'full_name', p.full_name,
    'role', p_role,
    'team_id', p_team_id
  ) INTO v_result
  FROM profiles p
  WHERE p.id = v_user_id;

  RETURN v_result;
END;
$$;

-- Función para obtener miembros de un equipo con perfiles
CREATE OR REPLACE FUNCTION get_team_members_with_profiles(p_team_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_result json;
  v_user_is_member BOOLEAN;
BEGIN
  -- Verificar que el usuario actual es miembro del equipo
  SELECT EXISTS (
    SELECT 1 FROM team_members 
    WHERE team_id = p_team_id AND user_id = auth.uid()
  ) INTO v_user_is_member;

  IF NOT v_user_is_member THEN
    RAISE EXCEPTION 'No tienes acceso a este equipo';
  END IF;

  -- Obtener miembros con perfiles
  SELECT json_agg(
    json_build_object(
      'user_id', tm.user_id,
      'team_id', tm.team_id,
      'role', tm.role,
      'joined_at', tm.joined_at,
      'email', p.email,
      'full_name', p.full_name,
      'avatar_url', p.avatar_url
    )
  ) INTO v_result
  FROM team_members tm
  JOIN profiles p ON p.id = tm.user_id
  WHERE tm.team_id = p_team_id;

  RETURN COALESCE(v_result, '[]'::json);
END;
$$;

-- Función para crear perfiles faltantes
CREATE OR REPLACE FUNCTION create_missing_profiles()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  SELECT 
    au.id,
    au.email,
    au.raw_user_meta_data->>'full_name',
    au.raw_user_meta_data->>'avatar_url'
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.id
  WHERE p.id IS NULL;
END;
$$;

-- =====================================================
-- PARTE 7: CORREGIR FUNCIONES EXISTENTES (SEARCH_PATH)
-- =====================================================

-- Función update_updated_at_column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Función handle_new_user
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Función create_team_notification
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
  INSERT INTO notifications (team_id, user_id, type, title, message, metadata)
  SELECT p_team_id, user_id, p_type, p_title, p_message, p_metadata
  FROM team_members
  WHERE team_id = p_team_id;
END;
$$;

-- Función mark_notification_read
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
END;
$$;

-- Función update_sale_totals
CREATE OR REPLACE FUNCTION update_sale_totals()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  sale_id_val uuid;
  total_amount_val numeric;
  total_cost_val numeric;
  total_profit_val numeric;
  total_margin_val numeric;
  total_print_hours_val numeric;
  items_count_val integer;
BEGIN
  sale_id_val := COALESCE(NEW.sale_id, OLD.sale_id);
  
  SELECT 
    COALESCE(SUM(sale_price), 0),
    COALESCE(SUM(unit_cost * quantity), 0),
    COALESCE(SUM(print_hours), 0),
    COUNT(*)
  INTO 
    total_amount_val,
    total_cost_val,
    total_print_hours_val,
    items_count_val
  FROM sale_items 
  WHERE sale_id = sale_id_val;
  
  total_profit_val := total_amount_val - total_cost_val;
  
  IF total_cost_val > 0 THEN
    total_margin_val := (total_profit_val / total_cost_val) * 100;
  ELSE
    total_margin_val := 0;
  END IF;
  
  UPDATE sales 
  SET 
    total_amount = total_amount_val,
    total_cost = total_cost_val,
    total_profit = total_profit_val,
    total_margin = total_margin_val,
    total_print_hours = total_print_hours_val,
    items_count = items_count_val,
    updated_at = now()
  WHERE id = sale_id_val;
  
  RETURN COALESCE(NEW, OLD);
END;
$$;

-- =====================================================
-- PARTE 8: PERMISOS PARA LAS FUNCIONES RPC
-- =====================================================

GRANT EXECUTE ON FUNCTION create_team_with_owner TO authenticated;
GRANT EXECUTE ON FUNCTION invite_team_member TO authenticated;
GRANT EXECUTE ON FUNCTION get_team_members_with_profiles TO authenticated;
GRANT EXECUTE ON FUNCTION create_missing_profiles TO authenticated;

-- =====================================================
-- VERIFICACIÓN FINAL
-- =====================================================

-- Verificar que RLS está habilitado
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'teams' 
    AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS no está habilitado en teams';
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename = 'team_members' 
    AND rowsecurity = true
  ) THEN
    RAISE EXCEPTION 'RLS no está habilitado en team_members';
  END IF;
  
  RAISE NOTICE 'Migración completada exitosamente. RLS habilitado en teams y team_members.';
END;
$$;
