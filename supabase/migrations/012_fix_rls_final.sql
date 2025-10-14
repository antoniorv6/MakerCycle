-- =====================================================
-- MIGRACIÓN 012: CORRECCIÓN FINAL DE POLÍTICAS RLS
-- =====================================================
-- Esta migración reemplaza TODAS las políticas RLS existentes con versiones
-- que funcionan correctamente sin recursión infinita y manejan el contexto
-- personal vs equipo de manera adecuada.

-- =====================================================
-- 1. ELIMINAR TODAS LAS POLÍTICAS RLS EXISTENTES
-- =====================================================

-- Eliminar políticas de profiles
DROP POLICY IF EXISTS "Users can read own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Enable insert for trigger function" ON profiles;

-- Eliminar políticas de teams
DROP POLICY IF EXISTS "Users can read teams they belong to" ON teams;
DROP POLICY IF EXISTS "Users can create teams" ON teams;
DROP POLICY IF EXISTS "Users can update teams they own" ON teams;

-- Eliminar políticas de team_members
DROP POLICY IF EXISTS "Users can read team members" ON team_members;
DROP POLICY IF EXISTS "Team owners can manage members" ON team_members;

-- Eliminar políticas de projects
DROP POLICY IF EXISTS "Users can read own or team projects" ON projects;
DROP POLICY IF EXISTS "Users can insert own or team projects" ON projects;
DROP POLICY IF EXISTS "Users can update own or team projects" ON projects;
DROP POLICY IF EXISTS "Users can delete own or team projects" ON projects;

-- Eliminar políticas de pieces
DROP POLICY IF EXISTS "Users can view their own pieces" ON pieces;
DROP POLICY IF EXISTS "Users can insert their own pieces" ON pieces;
DROP POLICY IF EXISTS "Users can update their own pieces" ON pieces;
DROP POLICY IF EXISTS "Users can delete their own pieces" ON pieces;

-- Eliminar políticas de clients
DROP POLICY IF EXISTS "Users can view their own clients" ON clients;
DROP POLICY IF EXISTS "Users can insert their own clients" ON clients;
DROP POLICY IF EXISTS "Users can update their own clients" ON clients;
DROP POLICY IF EXISTS "Users can delete their own clients" ON clients;

-- Eliminar políticas de sales
DROP POLICY IF EXISTS "Users can read own or team sales" ON sales;
DROP POLICY IF EXISTS "Users can insert own or team sales" ON sales;
DROP POLICY IF EXISTS "Users can update own or team sales" ON sales;
DROP POLICY IF EXISTS "Users can delete own or team sales" ON sales;

-- Eliminar políticas de sale_items
DROP POLICY IF EXISTS "Users can read own sale items" ON sale_items;
DROP POLICY IF EXISTS "Users can insert own sale items" ON sale_items;
DROP POLICY IF EXISTS "Users can update own sale items" ON sale_items;
DROP POLICY IF EXISTS "Users can delete own sale items" ON sale_items;

-- Eliminar políticas de expenses
DROP POLICY IF EXISTS "Users can read own or team expenses" ON expenses;
DROP POLICY IF EXISTS "Users can insert own or team expenses" ON expenses;
DROP POLICY IF EXISTS "Users can update own or team expenses" ON expenses;
DROP POLICY IF EXISTS "Users can delete own or team expenses" ON expenses;

-- Eliminar políticas de company_settings
DROP POLICY IF EXISTS "Users can view their own company settings" ON company_settings;
DROP POLICY IF EXISTS "Users can insert their own company settings" ON company_settings;
DROP POLICY IF EXISTS "Users can update their own company settings" ON company_settings;

-- Eliminar políticas de notifications
DROP POLICY IF EXISTS "Users can read team notifications" ON notifications;
DROP POLICY IF EXISTS "Users can insert team notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON notifications;

-- Eliminar políticas de kanban_board
DROP POLICY IF EXISTS "Users can manage their own kanban cards" ON kanban_board;

-- Eliminar políticas de material_presets
DROP POLICY IF EXISTS "Users can view their own material presets" ON material_presets;
DROP POLICY IF EXISTS "Users can insert their own material presets" ON material_presets;
DROP POLICY IF EXISTS "Users can update their own material presets" ON material_presets;
DROP POLICY IF EXISTS "Users can delete their own material presets" ON material_presets;

-- =====================================================
-- 2. CREAR POLÍTICAS RLS CORRECTAS Y FINALES
-- =====================================================

-- Políticas para profiles
CREATE POLICY "profiles_select_policy"
  ON profiles FOR SELECT TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "profiles_update_policy"
  ON profiles FOR UPDATE TO authenticated
  USING ((select auth.uid()) = id);

CREATE POLICY "profiles_insert_policy"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK ((select auth.uid()) = id);

CREATE POLICY "profiles_trigger_insert_policy"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (true);

-- Políticas para teams
CREATE POLICY "teams_select_policy"
  ON teams FOR SELECT TO authenticated
  USING (
    id IN (SELECT team_id FROM team_members WHERE user_id = (select auth.uid())) OR
    created_by = (select auth.uid())
  );

CREATE POLICY "teams_insert_policy"
  ON teams FOR INSERT TO authenticated
  WITH CHECK (created_by = (select auth.uid()));

CREATE POLICY "teams_update_policy"
  ON teams FOR UPDATE TO authenticated
  USING (created_by = (select auth.uid()));

CREATE POLICY "teams_delete_policy"
  ON teams FOR DELETE TO authenticated
  USING (created_by = (select auth.uid()));

-- Políticas para team_members
CREATE POLICY "team_members_select_policy"
  ON team_members FOR SELECT TO authenticated
  USING (user_id = (select auth.uid()));

CREATE POLICY "team_members_insert_policy"
  ON team_members FOR INSERT TO authenticated
  WITH CHECK (
    team_id IN (SELECT id FROM teams WHERE created_by = (select auth.uid()))
  );

CREATE POLICY "team_members_update_policy"
  ON team_members FOR UPDATE TO authenticated
  USING (
    team_id IN (SELECT id FROM teams WHERE created_by = (select auth.uid()))
  );

CREATE POLICY "team_members_delete_policy"
  ON team_members FOR DELETE TO authenticated
  USING (
    team_id IN (SELECT id FROM teams WHERE created_by = (select auth.uid()))
  );

-- Políticas para projects
CREATE POLICY "projects_all_policy"
  ON projects FOR ALL TO authenticated
  USING (
    (select auth.uid()) = user_id OR
    (team_id IS NOT NULL AND team_id IN (
      SELECT team_id FROM team_members WHERE user_id = (select auth.uid())
    ))
  )
  WITH CHECK (
    (select auth.uid()) = user_id OR
    (team_id IS NOT NULL AND team_id IN (
      SELECT team_id FROM team_members WHERE user_id = (select auth.uid())
    ))
  );

-- Políticas para pieces
CREATE POLICY "pieces_all_policy"
  ON pieces FOR ALL TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE 
      (user_id = (select auth.uid()) OR
       (team_id IS NOT NULL AND team_id IN (
         SELECT team_id FROM team_members WHERE user_id = (select auth.uid())
       )))
    )
  )
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE 
      (user_id = (select auth.uid()) OR
       (team_id IS NOT NULL AND team_id IN (
         SELECT team_id FROM team_members WHERE user_id = (select auth.uid())
       )))
    )
  );

-- Políticas para clients
CREATE POLICY "clients_all_policy"
  ON clients FOR ALL TO authenticated
  USING (
    (select auth.uid()) = user_id OR
    (team_id IS NOT NULL AND team_id IN (
      SELECT team_id FROM team_members WHERE user_id = (select auth.uid())
    ))
  )
  WITH CHECK (
    (select auth.uid()) = user_id OR
    (team_id IS NOT NULL AND team_id IN (
      SELECT team_id FROM team_members WHERE user_id = (select auth.uid())
    ))
  );

-- Políticas para sales
CREATE POLICY "sales_all_policy"
  ON sales FOR ALL TO authenticated
  USING (
    (select auth.uid()) = user_id OR
    (team_id IS NOT NULL AND team_id IN (
      SELECT team_id FROM team_members WHERE user_id = (select auth.uid())
    ))
  )
  WITH CHECK (
    (select auth.uid()) = user_id OR
    (team_id IS NOT NULL AND team_id IN (
      SELECT team_id FROM team_members WHERE user_id = (select auth.uid())
    ))
  );

-- Políticas para sale_items
CREATE POLICY "sale_items_all_policy"
  ON sale_items FOR ALL TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sales 
      WHERE sales.id = sale_items.sale_id 
      AND ((select auth.uid()) = sales.user_id OR
           (sales.team_id IS NOT NULL AND sales.team_id IN (
             SELECT team_id FROM team_members WHERE user_id = (select auth.uid())
           )))
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sales 
      WHERE sales.id = sale_items.sale_id 
      AND ((select auth.uid()) = sales.user_id OR
           (sales.team_id IS NOT NULL AND sales.team_id IN (
             SELECT team_id FROM team_members WHERE user_id = (select auth.uid())
           )))
    )
  );

-- Políticas para expenses
CREATE POLICY "expenses_all_policy"
  ON expenses FOR ALL TO authenticated
  USING (
    (select auth.uid()) = user_id OR
    (team_id IS NOT NULL AND team_id IN (
      SELECT team_id FROM team_members WHERE user_id = (select auth.uid())
    ))
  )
  WITH CHECK (
    (select auth.uid()) = user_id OR
    (team_id IS NOT NULL AND team_id IN (
      SELECT team_id FROM team_members WHERE user_id = (select auth.uid())
    ))
  );

-- Políticas para company_settings
CREATE POLICY "company_settings_all_policy"
  ON company_settings FOR ALL TO authenticated
  USING (
    (select auth.uid()) = user_id OR
    (team_id IS NOT NULL AND team_id IN (
      SELECT team_id FROM team_members WHERE user_id = (select auth.uid())
    ))
  )
  WITH CHECK (
    (select auth.uid()) = user_id OR
    (team_id IS NOT NULL AND team_id IN (
      SELECT team_id FROM team_members WHERE user_id = (select auth.uid())
    ))
  );

-- Políticas para notifications
CREATE POLICY "notifications_all_policy"
  ON notifications FOR ALL TO authenticated
  USING (
    (select auth.uid()) = user_id OR
    (team_id IS NOT NULL AND team_id IN (
      SELECT team_id FROM team_members WHERE user_id = (select auth.uid())
    ))
  )
  WITH CHECK (
    (select auth.uid()) = user_id OR
    (team_id IS NOT NULL AND team_id IN (
      SELECT team_id FROM team_members WHERE user_id = (select auth.uid())
    ))
  );

-- Políticas para kanban_board
CREATE POLICY "kanban_board_all_policy"
  ON kanban_board FOR ALL TO authenticated
  USING (
    (select auth.uid()) = user_id OR
    (team_id IS NOT NULL AND team_id IN (
      SELECT team_id FROM team_members WHERE user_id = (select auth.uid())
    ))
  )
  WITH CHECK (
    (select auth.uid()) = user_id OR
    (team_id IS NOT NULL AND team_id IN (
      SELECT team_id FROM team_members WHERE user_id = (select auth.uid())
    ))
  );

-- Políticas para material_presets
CREATE POLICY "material_presets_all_policy"
  ON material_presets FOR ALL TO authenticated
  USING (
    (select auth.uid()) = user_id OR
    (team_id IS NOT NULL AND team_id IN (
      SELECT team_id FROM team_members WHERE user_id = (select auth.uid())
    ))
  )
  WITH CHECK (
    (select auth.uid()) = user_id OR
    (team_id IS NOT NULL AND team_id IN (
      SELECT team_id FROM team_members WHERE user_id = (select auth.uid())
    ))
  );

-- =====================================================
-- 3. VERIFICAR CONFIGURACIÓN FINAL
-- =====================================================

-- Verificar que RLS está habilitado
SELECT schemaname, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'projects', 'sales', 'expenses', 'clients', 'notifications', 'company_settings', 'teams', 'team_members', 'kanban_board', 'material_presets', 'pieces', 'sale_items')
ORDER BY tablename;

-- Verificar políticas creadas
SELECT schemaname, tablename, policyname, cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('profiles', 'projects', 'sales', 'expenses', 'clients', 'notifications', 'company_settings', 'teams', 'team_members', 'kanban_board', 'material_presets', 'pieces', 'sale_items')
ORDER BY tablename, policyname;
