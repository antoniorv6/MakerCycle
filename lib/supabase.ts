import { createBrowserClient, createServerClient } from '@supabase/ssr'

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
    }
  }
}