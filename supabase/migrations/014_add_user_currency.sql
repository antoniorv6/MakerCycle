-- =====================================================
-- MIGRACIÓN: Agregar campo currency a profiles
-- =====================================================
-- Esta migración agrega el campo currency a la tabla profiles
-- para permitir a los usuarios configurar su moneda preferida
-- Fecha: 2024
-- Descripción: Agrega soporte para múltiples monedas en la aplicación

-- Paso 1: Agregar columna currency a la tabla profiles
-- Primero la agregamos como nullable para poder actualizar usuarios existentes
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS currency text;

-- Paso 2: Establecer valor por defecto 'EUR' para usuarios existentes que no tengan moneda
UPDATE profiles 
SET currency = 'EUR' 
WHERE currency IS NULL;

-- Paso 3: Ahora hacer la columna NOT NULL con valor por defecto
ALTER TABLE profiles 
ALTER COLUMN currency SET DEFAULT 'EUR',
ALTER COLUMN currency SET NOT NULL;

-- Paso 4: Crear índice para optimizar consultas por moneda
CREATE INDEX IF NOT EXISTS idx_profiles_currency ON profiles(currency);

-- Paso 5: Agregar comentario en la columna
COMMENT ON COLUMN profiles.currency IS 'Código de moneda ISO 4217 preferida por el usuario (EUR, USD, ARS, BRL, CLP, COP, PEN, UYU, PYG, BOB, VES, GYD, SRD). Por defecto: EUR';

-- Paso 6: Actualizar la función handle_new_user para incluir currency en nuevos usuarios
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, currency)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'full_name',
    NEW.raw_user_meta_data->>'avatar_url',
    'EUR'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
