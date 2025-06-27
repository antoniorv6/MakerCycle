import { createClientComponentClient, createServerComponentClient } from '@supabase/auth-helpers-nextjs'

export const createClient = () => createClientComponentClient()

// Importación dinámica para evitar el error con Client Components
export const createServerClient = async () => {
  const { cookies } = await import('next/headers')
  return createServerComponentClient({ cookies })
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
    }
  }
}