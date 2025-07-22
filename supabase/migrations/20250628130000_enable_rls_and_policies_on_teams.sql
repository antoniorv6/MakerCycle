-- Migration: Enable RLS and add policies on teams table

-- 1. Habilitar Row Level Security en la tabla teams
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

-- 2. Eliminar políticas existentes si las hubiera
DROP POLICY IF EXISTS "Users can read teams" ON public.teams;
DROP POLICY IF EXISTS "Users can insert teams" ON public.teams;
DROP POLICY IF EXISTS "Users can update teams" ON public.teams;
DROP POLICY IF EXISTS "Users can delete teams" ON public.teams;

-- 3. Permitir que solo miembros de un equipo puedan ver el equipo
CREATE POLICY "Users can read teams"
  ON public.teams
  FOR SELECT
  TO authenticated
  USING (
    id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
  );

-- 4. Permitir que solo miembros puedan actualizar o eliminar el equipo
CREATE POLICY "Users can update teams"
  ON public.teams
  FOR UPDATE
  TO authenticated
  USING (
    id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete teams"
  ON public.teams
  FOR DELETE
  TO authenticated
  USING (
    id IN (SELECT team_id FROM public.team_members WHERE user_id = auth.uid())
  );

-- 5. Permitir que cualquier usuario autenticado cree un equipo
CREATE POLICY "Users can insert teams"
  ON public.teams
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL); 