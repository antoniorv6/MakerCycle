import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

// Validar que las variables de entorno estén disponibles
function validateSupabaseEnv() {
  // Si las variables están disponibles, usarlas directamente
  if (supabaseUrl && supabaseAnonKey) {
    return {
      url: supabaseUrl,
      key: supabaseAnonKey
    }
  }
  
  // Durante el build de Next.js, si las variables no están disponibles,
  // usar valores placeholder que @supabase/ssr aceptará sin lanzar error
  // Estos valores solo se usarán durante el build y nunca en runtime
  // Detectamos el build time verificando si estamos en un contexto sin window
  const isBuildTime = typeof window === 'undefined'
  
  if (isBuildTime) {
    // Valores placeholder válidos para el build (no se usarán en runtime)
    // Usamos un formato válido de JWT para evitar errores de validación
    // Nota: Estos valores solo se usan durante el build. En runtime, las variables
    // deben estar disponibles como variables de entorno del contenedor.
    return {
      url: 'https://placeholder.supabase.co',
      key: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTIwMDAsImV4cCI6MTk2MDc2ODAwMH0.placeholder'
    }
  }
  
  // En runtime (cliente), las variables deben estar disponibles
  throw new Error('Missing Supabase environment variables. Please set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY')
}

export const createClient = () => {
  const { url, key } = validateSupabaseEnv()
  return createBrowserClient(url, key)
}

export const createServerSupabaseClient = async () => {
  const { url, key } = validateSupabaseEnv()
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  
  return createServerClient(url, key, {
    cookies: {
      get(name: string) {
        return cookieStore.get(name)?.value
      },
      set(name: string, value: string, options?: any) {
        // no-op in server components
      },
      remove(name: string, options?: any) {
        // no-op in server components
      },
    },
  })
}

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          user_id: string
          name: string
          email: string | null
          phone: string | null
          address: string | null
          tax_id: string | null
          notes: string | null
          team_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          email?: string | null
          phone?: string | null
          address?: string | null
          tax_id?: string | null
          notes?: string | null
          team_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          email?: string | null
          phone?: string | null
          address?: string | null
          tax_id?: string | null
          notes?: string | null
          team_id?: string | null
          updated_at?: string
        }
      }
      company_settings: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string
          email: string
          phone: string
          address: string
          website: string
          logo: string
          tax_id: string
          bank_info: string
          terms: string
          footer: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name?: string
          description?: string
          email?: string
          phone?: string
          address?: string
          website?: string
          logo?: string
          tax_id?: string
          bank_info?: string
          terms?: string
          footer?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string
          email?: string
          phone?: string
          address?: string
          website?: string
          logo?: string
          tax_id?: string
          bank_info?: string
          terms?: string
          footer?: string
          updated_at?: string
        }
      }
      material_presets: {
        Row: {
          id: string
          user_id: string
          team_id: string | null
          name: string
          price_per_unit: number
          unit: string
          material_type: string
          category: 'filament' | 'resin'
          color: string | null
          brand: string | null
          notes: string | null
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          team_id?: string | null
          name: string
          price_per_unit: number
          unit?: string
          material_type?: string
          category?: 'filament' | 'resin'
          color?: string | null
          brand?: string | null
          notes?: string | null
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          team_id?: string | null
          name?: string
          price_per_unit?: number
          unit?: string
          material_type?: string
          category?: 'filament' | 'resin'
          color?: string | null
          brand?: string | null
          notes?: string | null
          is_default?: boolean
          updated_at?: string
        }
      }
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          currency: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          currency?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          currency?: string
          updated_at?: string
        }
      }
      projects: {
        Row: {
          id: string
          user_id: string
          name: string
          filament_weight: number
          filament_price: number
          print_hours: number
          electricity_cost: number
          materials: any
          total_cost: number
          vat_percentage: number
          profit_margin: number
          recommended_price: number
          status: 'draft' | 'calculated' | 'completed'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          filament_weight: number
          filament_price: number
          print_hours: number
          electricity_cost: number
          materials?: any
          total_cost: number
          vat_percentage?: number
          profit_margin?: number
          recommended_price?: number
          status?: 'draft' | 'calculated' | 'completed'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          filament_weight?: number
          filament_price?: number
          print_hours?: number
          electricity_cost?: number
          materials?: any
          total_cost?: number
          vat_percentage?: number
          profit_margin?: number
          recommended_price?: number
          status?: 'draft' | 'calculated' | 'completed'
          updated_at?: string
        }
      }
      sales: {
        Row: {
          id: string
          user_id: string
          project_name: string
          cost: number
          unit_cost: number
          quantity: number
          sale_price: number
          profit: number
          margin: number
          date: string
          status: 'pending' | 'completed' | 'cancelled'
          print_hours: number | null
          team_id: string | null
          client_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          project_name: string
          cost: number
          unit_cost: number
          quantity: number
          sale_price: number
          profit: number
          margin: number
          date: string
          status?: 'pending' | 'completed' | 'cancelled'
          print_hours?: number | null
          team_id?: string | null
          client_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          project_name?: string
          cost?: number
          unit_cost?: number
          quantity?: number
          sale_price?: number
          profit?: number
          margin?: number
          date?: string
          status?: 'pending' | 'completed' | 'cancelled'
          print_hours?: number | null
          team_id?: string | null
          client_id?: string | null
          updated_at?: string
        }
      }
      expenses: {
        Row: {
          id: string
          user_id: string
          description: string
          amount: number
          category: string
          date: string
          status: 'pending' | 'paid' | 'cancelled'
          notes: string | null
          team_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          description: string
          amount: number
          category: string
          date: string
          status?: 'pending' | 'paid' | 'cancelled'
          notes?: string | null
          team_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          description?: string
          amount?: number
          category?: string
          date?: string
          status?: 'pending' | 'paid' | 'cancelled'
          notes?: string | null
          team_id?: string | null
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          created_by?: string | null
          updated_at?: string
        }
      }
      team_members: {
        Row: {
          team_id: string
          user_id: string
          role: string
          joined_at: string
        }
        Insert: {
          team_id: string
          user_id: string
          role?: string
          joined_at?: string
        }
        Update: {
          team_id?: string
          user_id?: string
          role?: string
          joined_at?: string
        }
      }
    }
  }
}

// Fetch all teams the user belongs to
export async function fetchUserTeams(supabase: SupabaseClient, userId: string) {
  return supabase
    .from('team_members')
    .select('team_id, teams(name, created_by, created_at, updated_at)')
    .eq('user_id', userId)
}

// Create a new team
export async function createTeam(supabase: SupabaseClient, name: string, created_by: string) {
  return supabase
    .from('teams')
    .insert([{ name, created_by }])
    .select()
    .single()
}

// Add a member to a team
export async function addTeamMember(supabase: SupabaseClient, team_id: string, user_id: string, role = 'member') {
  const result = await supabase
    .from('team_members')
    .insert([{ team_id, user_id, role }]);

  // Create notification for new team member
  if (result.error) {
    return result;
  }

  try {
    // Get user profile for notification
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, email')
      .eq('id', user_id)
      .single();

    const newMemberName = profile?.full_name || profile?.email || 'New member';
    
    // Create notification for all team members
    const notificationResult = await supabase.rpc('create_team_notification', {
      p_team_id: team_id,
      p_type: 'team_member',
      p_title: 'Nuevo Miembro del Equipo',
      p_message: `${newMemberName} ha sido añadido al equipo.`,
      p_metadata: {
        new_member_name: newMemberName,
        new_member_id: user_id
      }
    });

    if (notificationResult.error) {
      console.error('Failed to create notification for new team member:', notificationResult.error);
    }
  } catch (notificationError) {
    console.error('Failed to create notification for new team member:', notificationError);
    // Don't throw error to avoid breaking the main flow
  }

  return result;
}

// Remove a member from a team
export async function removeTeamMember(supabase: SupabaseClient, team_id: string, user_id: string) {
  return supabase
    .from('team_members')
    .delete()
    .eq('team_id', team_id)
    .eq('user_id', user_id)
}

// Fetch all projects accessible to the user (personal and team)
export async function fetchAccessibleProjects(supabase: SupabaseClient) {
  return supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false })
}

// Create a project (optionally for a team)
export async function createProject(supabase: SupabaseClient, project: Partial<Database['public']['Tables']['projects']['Insert']> & { team_id?: string | null }) {
  return supabase
    .from('projects')
    .insert([project])
    .select()
    .single()
}

// Update a project
export async function updateProject(supabase: SupabaseClient, id: string, updates: Partial<Database['public']['Tables']['projects']['Update']>) {
  return supabase
    .from('projects')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
}

// Delete a project
export async function deleteProject(supabase: SupabaseClient, id: string) {
  return supabase
    .from('projects')
    .delete()
    .eq('id', id)
}