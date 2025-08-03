-- =====================================================
-- MIGRACIÓN INICIAL: Esquema base de MakerFlow
-- =====================================================
-- Esta migración establece toda la estructura base necesaria
-- para el funcionamiento de MakerFlow

-- Crear tipos ENUM personalizados
CREATE TYPE project_status AS ENUM ('draft', 'calculated', 'completed');
CREATE TYPE sale_status AS ENUM ('pending', 'completed', 'cancelled');
CREATE TYPE expense_status AS ENUM ('pending', 'paid', 'cancelled');
CREATE TYPE kanban_status AS ENUM ('pending', 'in_progress', 'completed');

-- =====================================================
-- 1. TABLA PROFILES (Usuarios)
-- =====================================================
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 2. TABLA TEAMS (Equipos de trabajo)
-- =====================================================
CREATE TABLE IF NOT EXISTS teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  created_by uuid REFERENCES profiles(id) ON DELETE SET NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 3. TABLA TEAM_MEMBERS (Miembros de equipos)
-- =====================================================
CREATE TABLE IF NOT EXISTS team_members (
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'member', -- 'member', 'admin'
  joined_at timestamptz DEFAULT now(),
  PRIMARY KEY (team_id, user_id)
);

-- =====================================================
-- 4. TABLA PROJECTS (Proyectos de impresión)
-- =====================================================
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  name text NOT NULL,
  filament_weight numeric NOT NULL DEFAULT 0,
  filament_price numeric NOT NULL DEFAULT 0,
  print_hours numeric NOT NULL DEFAULT 0,
  electricity_cost numeric NOT NULL DEFAULT 0,
  materials jsonb DEFAULT '[]'::jsonb,
  total_cost numeric NOT NULL DEFAULT 0,
  vat_percentage numeric DEFAULT 21,
  profit_margin numeric DEFAULT 15,
  recommended_price numeric DEFAULT 0,
  status project_status DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 5. TABLA PIECES (Piezas individuales de proyectos)
-- =====================================================
CREATE TABLE IF NOT EXISTS pieces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  name text NOT NULL,
  filament_weight numeric NOT NULL DEFAULT 0,
  filament_price numeric NOT NULL DEFAULT 0,
  print_hours numeric NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 6. TABLA CLIENTS (Clientes)
-- =====================================================
CREATE TABLE IF NOT EXISTS clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  name text NOT NULL,
  email text,
  phone text,
  address text,
  tax_id text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 7. TABLA SALES (Ventas)
-- =====================================================
CREATE TABLE IF NOT EXISTS sales (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  client_id uuid REFERENCES clients(id) ON DELETE SET NULL,
  total_amount numeric NOT NULL DEFAULT 0,
  total_cost numeric NOT NULL DEFAULT 0,
  total_profit numeric NOT NULL DEFAULT 0,
  total_margin numeric NOT NULL DEFAULT 0,
  total_print_hours numeric DEFAULT 0,
  items_count integer NOT NULL DEFAULT 0,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status sale_status DEFAULT 'completed',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 8. TABLA SALE_ITEMS (Elementos de venta)
-- =====================================================
CREATE TABLE IF NOT EXISTS sale_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id uuid REFERENCES sales(id) ON DELETE CASCADE NOT NULL,
  project_id uuid REFERENCES projects(id) ON DELETE SET NULL,
  project_name text NOT NULL,
  unit_cost numeric NOT NULL DEFAULT 0,
  quantity integer NOT NULL DEFAULT 1,
  sale_price numeric NOT NULL DEFAULT 0,
  print_hours numeric DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 9. TABLA EXPENSES (Gastos)
-- =====================================================
CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  description text NOT NULL,
  amount numeric NOT NULL DEFAULT 0,
  category text NOT NULL,
  date date NOT NULL DEFAULT CURRENT_DATE,
  status expense_status DEFAULT 'paid',
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 10. TABLA COMPANY_SETTINGS (Configuración de empresa)
-- =====================================================
CREATE TABLE IF NOT EXISTS company_settings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  team_id uuid REFERENCES teams(id) ON DELETE SET NULL,
  name text NOT NULL DEFAULT 'MakerFlow',
  description text NOT NULL DEFAULT 'Servicios de Impresión 3D',
  email text NOT NULL DEFAULT 'info@makerflow.com',
  phone text NOT NULL DEFAULT '+34 XXX XXX XXX',
  address text NOT NULL DEFAULT '',
  website text NOT NULL DEFAULT '',
  logo text NOT NULL DEFAULT '',
  tax_id text NOT NULL DEFAULT '',
  bank_info text NOT NULL DEFAULT '',
  terms text NOT NULL DEFAULT 'Este documento es un albarán de entrega de servicios de impresión 3D. Para cualquier consulta, contacte con nosotros.',
  footer text NOT NULL DEFAULT 'Gracias por confiar en nuestros servicios de impresión 3D.',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- =====================================================
-- 11. TABLA NOTIFICATIONS (Notificaciones)
-- =====================================================
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  type text NOT NULL, -- 'project', 'sale', 'cost', 'team_member'
  title text NOT NULL,
  message text NOT NULL,
  metadata jsonb DEFAULT '{}',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now()
);

-- =====================================================
-- 12. TABLA KANBAN_BOARD (Gestión de proyectos tipo Trello)
-- =====================================================
CREATE TABLE IF NOT EXISTS kanban_board (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  team_id uuid REFERENCES teams(id) ON DELETE CASCADE,
  project_id uuid REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  status kanban_status NOT NULL DEFAULT 'pending',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE (user_id, project_id, team_id, status)
);

-- =====================================================
-- ÍNDICES PARA OPTIMIZACIÓN
-- =====================================================

-- Índices para profiles
CREATE INDEX IF NOT EXISTS idx_profiles_email ON profiles(email);

-- Índices para teams
CREATE INDEX IF NOT EXISTS idx_teams_created_by ON teams(created_by);

-- Índices para team_members
CREATE INDEX IF NOT EXISTS idx_team_members_user_id ON team_members(user_id);
CREATE INDEX IF NOT EXISTS idx_team_members_team_id ON team_members(team_id);

-- Índices para projects
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_projects_team_id ON projects(team_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON projects(created_at);

-- Índices para pieces
CREATE INDEX IF NOT EXISTS idx_pieces_project_id ON pieces(project_id);
CREATE INDEX IF NOT EXISTS idx_pieces_created_at ON pieces(created_at);

-- Índices para clients
CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
CREATE INDEX IF NOT EXISTS idx_clients_team_id ON clients(team_id);
CREATE INDEX IF NOT EXISTS idx_clients_name ON clients(name);

-- Índices para sales
CREATE INDEX IF NOT EXISTS idx_sales_user_id ON sales(user_id);
CREATE INDEX IF NOT EXISTS idx_sales_team_id ON sales(team_id);
CREATE INDEX IF NOT EXISTS idx_sales_client_id ON sales(client_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON sales(date);
CREATE INDEX IF NOT EXISTS idx_sales_status ON sales(status);

-- Índices para sale_items
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_project_id ON sale_items(project_id);

-- Índices para expenses
CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_team_id ON expenses(team_id);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);

-- Índices para company_settings
CREATE UNIQUE INDEX IF NOT EXISTS idx_company_settings_user_id ON company_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_company_settings_team_id ON company_settings(team_id);

-- Índices para notifications
CREATE INDEX IF NOT EXISTS idx_notifications_team_id ON notifications(team_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);

-- Índices para kanban_board
CREATE INDEX IF NOT EXISTS idx_kanban_board_user_id ON kanban_board(user_id);
CREATE INDEX IF NOT EXISTS idx_kanban_board_team_id ON kanban_board(team_id);
CREATE INDEX IF NOT EXISTS idx_kanban_board_project_id ON kanban_board(project_id);
CREATE INDEX IF NOT EXISTS idx_kanban_board_status ON kanban_board(status);

-- =====================================================
-- FUNCIONES AUXILIARES
-- =====================================================

-- Función para actualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Función para manejar nuevos usuarios
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para crear notificaciones de equipo
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
AS $$
BEGIN
  INSERT INTO notifications (team_id, user_id, type, title, message, metadata)
  SELECT p_team_id, user_id, p_type, p_title, p_message, p_metadata
  FROM team_members
  WHERE team_id = p_team_id;
END;
$$;

-- Función para marcar notificaciones como leídas
CREATE OR REPLACE FUNCTION mark_notification_read(p_notification_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE notifications
  SET is_read = true
  WHERE id = p_notification_id AND user_id = auth.uid();
END;
$$;

-- Función para actualizar totales de venta
CREATE OR REPLACE FUNCTION update_sale_totals()
RETURNS trigger AS $$
DECLARE
  sale_id_val uuid;
  total_amount_val numeric;
  total_cost_val numeric;
  total_profit_val numeric;
  total_margin_val numeric;
  total_print_hours_val numeric;
  items_count_val integer;
BEGIN
  -- Obtener el sale_id
  sale_id_val := COALESCE(NEW.sale_id, OLD.sale_id);
  
  -- Calcular totales
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
  
  -- Calcular beneficio y margen
  total_profit_val := total_amount_val - total_cost_val;
  
  IF total_cost_val > 0 THEN
    total_margin_val := (total_profit_val / total_cost_val) * 100;
  ELSE
    total_margin_val := 0;
  END IF;
  
  -- Actualizar la venta
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
$$ LANGUAGE plpgsql;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Triggers para updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at
  BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_pieces_updated_at
  BEFORE UPDATE ON pieces
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_clients_updated_at
  BEFORE UPDATE ON clients
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sales_updated_at
  BEFORE UPDATE ON sales
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_sale_items_updated_at
  BEFORE UPDATE ON sale_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at
  BEFORE UPDATE ON expenses
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_company_settings_updated_at
  BEFORE UPDATE ON company_settings
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_kanban_board_updated_at
  BEFORE UPDATE ON kanban_board
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Trigger para crear perfil automáticamente
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Triggers para actualizar totales de venta
CREATE TRIGGER update_sale_totals_on_insert
  AFTER INSERT ON sale_items
  FOR EACH ROW EXECUTE FUNCTION update_sale_totals();

CREATE TRIGGER update_sale_totals_on_update
  AFTER UPDATE ON sale_items
  FOR EACH ROW EXECUTE FUNCTION update_sale_totals();

CREATE TRIGGER update_sale_totals_on_delete
  AFTER DELETE ON sale_items
  FOR EACH ROW EXECUTE FUNCTION update_sale_totals();

-- =====================================================
-- ROW LEVEL SECURITY (RLS)
-- =====================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE pieces ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE kanban_board ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- POLÍTICAS DE SEGURIDAD
-- =====================================================

-- Políticas para profiles
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable insert for trigger function"
  ON profiles FOR INSERT TO authenticated
  WITH CHECK (true);

-- Políticas para teams
CREATE POLICY "Users can read teams they belong to"
  ON teams FOR SELECT TO authenticated
  USING (
    id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()) OR
    created_by = auth.uid()
  );

CREATE POLICY "Users can create teams"
  ON teams FOR INSERT TO authenticated
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update teams they own"
  ON teams FOR UPDATE TO authenticated
  USING (created_by = auth.uid());

-- Políticas para team_members
CREATE POLICY "Users can read team members"
  ON team_members FOR SELECT TO authenticated
  USING (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Team owners can manage members"
  ON team_members FOR ALL TO authenticated
  USING (
    team_id IN (SELECT id FROM teams WHERE created_by = auth.uid())
  );

-- Políticas para projects
CREATE POLICY "Users can read own or team projects"
  ON projects FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own or team projects"
  ON projects FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    team_id IS NULL OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own or team projects"
  ON projects FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own or team projects"
  ON projects FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

-- Políticas para pieces
CREATE POLICY "Users can view their own pieces"
  ON pieces FOR SELECT TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid() OR
      team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert their own pieces"
  ON pieces FOR INSERT TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid() OR
      team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can update their own pieces"
  ON pieces FOR UPDATE TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid() OR
      team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete their own pieces"
  ON pieces FOR DELETE TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid() OR
      team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    )
  );

-- Políticas para clients
CREATE POLICY "Users can view their own clients"
  ON clients FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert their own clients"
  ON clients FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their own clients"
  ON clients FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete their own clients"
  ON clients FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

-- Políticas para sales
CREATE POLICY "Users can read own or team sales"
  ON sales FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own or team sales"
  ON sales FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own or team sales"
  ON sales FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own or team sales"
  ON sales FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

-- Políticas para sale_items
CREATE POLICY "Users can read own sale items"
  ON sale_items FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sales 
      WHERE sales.id = sale_items.sale_id 
      AND (sales.user_id = auth.uid() OR
           sales.team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
    )
  );

CREATE POLICY "Users can insert own sale items"
  ON sale_items FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM sales 
      WHERE sales.id = sale_items.sale_id 
      AND (sales.user_id = auth.uid() OR
           sales.team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
    )
  );

CREATE POLICY "Users can update own sale items"
  ON sale_items FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sales 
      WHERE sales.id = sale_items.sale_id 
      AND (sales.user_id = auth.uid() OR
           sales.team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
    )
  );

CREATE POLICY "Users can delete own sale items"
  ON sale_items FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM sales 
      WHERE sales.id = sale_items.sale_id 
      AND (sales.user_id = auth.uid() OR
           sales.team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
    )
  );

-- Políticas para expenses
CREATE POLICY "Users can read own or team expenses"
  ON expenses FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own or team expenses"
  ON expenses FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own or team expenses"
  ON expenses FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own or team expenses"
  ON expenses FOR DELETE TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

-- Políticas para company_settings
CREATE POLICY "Users can view their own company settings"
  ON company_settings FOR SELECT TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert their own company settings"
  ON company_settings FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update their own company settings"
  ON company_settings FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id OR
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

-- Políticas para notifications
CREATE POLICY "Users can read team notifications"
  ON notifications FOR SELECT TO authenticated
  USING (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert team notifications"
  ON notifications FOR INSERT TO authenticated
  WITH CHECK (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own notifications"
  ON notifications FOR UPDATE TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Políticas para kanban_board
CREATE POLICY "Users can manage their own kanban cards"
  ON kanban_board FOR ALL TO authenticated
  USING (
    user_id = auth.uid() OR
    (team_id IS NOT NULL AND team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid()))
  ); 