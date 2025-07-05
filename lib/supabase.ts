import { createBrowserClient, createServerClient } from '@supabase/ssr'
import { SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string

export const createClient = () =>
  createBrowserClient(supabaseUrl, supabaseAnonKey)

export const createServerSupabaseClient = async () => {
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()
  
  return createServerClient(supabaseUrl, supabaseAnonKey, {
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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
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
  return supabase
    .from('team_members')
    .insert([{ team_id, user_id, role }])
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