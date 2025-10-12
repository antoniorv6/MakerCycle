-- =====================================================
-- MIGRACIÓN 013: HABILITAR RECUPERACIÓN DE CONTRASEÑAS
-- =====================================================
-- Esta migración configura las políticas RLS necesarias para permitir
-- la recuperación de contraseñas sin autenticación previa.

-- =====================================================
-- 1. CONFIGURAR POLÍTICAS PARA RECUPERACIÓN DE CONTRASEÑAS
-- =====================================================

-- Permitir que usuarios no autenticados puedan leer profiles para verificar emails
-- durante el proceso de recuperación de contraseña
CREATE POLICY "profiles_select_for_password_recovery"
  ON profiles FOR SELECT TO anon
  USING (true);

-- Permitir que usuarios no autenticados puedan actualizar profiles
-- para el proceso de recuperación de contraseña
CREATE POLICY "profiles_update_for_password_recovery"
  ON profiles FOR UPDATE TO anon
  USING (true);

-- =====================================================
-- 2. CONFIGURAR FUNCIONES DE UTILIDAD PARA RECUPERACIÓN
-- =====================================================

-- Función para verificar si un email existe en la base de datos
CREATE OR REPLACE FUNCTION check_email_exists(email_to_check text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles 
    WHERE email = email_to_check
  );
END;
$$;

-- Función para obtener información básica del usuario por email
-- (solo para verificación durante recuperación)
CREATE OR REPLACE FUNCTION get_user_info_for_recovery(email_to_check text)
RETURNS TABLE(
  id uuid,
  email text,
  full_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    p.id,
    p.email,
    p.full_name
  FROM profiles p
  WHERE p.email = email_to_check;
END;
$$;

-- =====================================================
-- 3. CONFIGURAR PERMISOS PARA FUNCIONES
-- =====================================================

-- Permitir que usuarios anónimos ejecuten las funciones de recuperación
GRANT EXECUTE ON FUNCTION check_email_exists(text) TO anon;
GRANT EXECUTE ON FUNCTION get_user_info_for_recovery(text) TO anon;

-- =====================================================
-- 4. CONFIGURAR RLS PARA FUNCIONES
-- =====================================================

-- Las funciones ya tienen SECURITY DEFINER, por lo que se ejecutan
-- con los permisos del propietario de la función, no del usuario que las llama

-- =====================================================
-- 5. VERIFICAR CONFIGURACIÓN
-- =====================================================

-- Verificar que las políticas se crearon correctamente
SELECT schemaname, tablename, policyname, cmd, roles
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'profiles'
AND policyname LIKE '%password_recovery%';

-- Verificar que las funciones se crearon correctamente
SELECT routine_name, routine_type, security_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('check_email_exists', 'get_user_info_for_recovery');
