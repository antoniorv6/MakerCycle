import { createClient as createSupabaseClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'
import { clientSchema } from '@/lib/validators'

export interface Client {
  id: string
  name: string
  email: string | null
  phone: string | null
  address: string | null
  taxId: string | null
  notes: string | null
  teamId?: string | null
  createdAt: string
  updatedAt: string
}

export interface ClientFormData {
  name: string
  email: string
  phone: string
  address: string
  taxId: string
  notes: string
  teamId?: string | null
}

// Convert Client to database format
function toDatabaseFormat(data: ClientFormData, userId: string): Database['public']['Tables']['clients']['Insert'] {
  return {
    user_id: userId,
    name: data.name,
    email: data.email || null,
    phone: data.phone || null,
    address: data.address || null,
    tax_id: data.taxId || null,
    notes: data.notes || null,
    team_id: data.teamId || null
  }
}

// Convert database format to Client
function fromDatabaseFormat(dbData: Database['public']['Tables']['clients']['Row']): Client {
  return {
    id: dbData.id,
    name: dbData.name,
    email: dbData.email,
    phone: dbData.phone,
    address: dbData.address,
    taxId: dbData.tax_id,
    notes: dbData.notes,
    teamId: dbData.team_id,
    createdAt: dbData.created_at,
    updatedAt: dbData.updated_at
  }
}

export async function getClients(userId: string, teamId?: string | null): Promise<Client[]> {
  const supabase = createSupabaseClient()
  
  try {
    let query = supabase
      .from('clients')
      .select('*')
      .order('name')

    // If teamId is provided, get team clients, otherwise get user's own clients
    if (teamId) {
      query = query.eq('team_id', teamId)
    } else {
      query = query.eq('user_id', userId)
    }

    const { data, error } = await query

    if (error) {
      console.error('Error fetching clients:', error)
      return []
    }

    return data.map(fromDatabaseFormat)
  } catch (error) {
    console.error('Error fetching clients:', error)
    return []
  }
}

export async function getClient(clientId: string): Promise<Client | null> {
  const supabase = createSupabaseClient()
  
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .single()

    if (error) {
      console.error('Error fetching client:', error)
      return null
    }

    return fromDatabaseFormat(data)
  } catch (error) {
    console.error('Error fetching client:', error)
    return null
  }
}

export async function createClient(userId: string, data: ClientFormData): Promise<Client> {
  const supabase = createSupabaseClient()

  try {
    // Validar datos antes de crear
    clientSchema.parse({
      name: data.name,
      email: data.email,
      phone: data.phone,
      address: data.address,
      tax_id: data.taxId,
      notes: data.notes,
    });

    const { data: newClient, error } = await supabase
      .from('clients')
      .insert(toDatabaseFormat(data, userId))
      .select()
      .single()

    if (error) {
      throw error
    }

    return fromDatabaseFormat(newClient)
  } catch (error) {
    console.error('Error creating client:', error)
    throw error
  }
}

export async function updateClient(clientId: string, data: Partial<ClientFormData>): Promise<Client> {
  const supabase = createSupabaseClient()

  try {
    // Validación parcial
    const validationData: any = {};
    if (data.name !== undefined) validationData.name = data.name;
    if (data.email !== undefined) validationData.email = data.email;
    if (data.phone !== undefined) validationData.phone = data.phone;
    if (data.address !== undefined) validationData.address = data.address;
    if (data.taxId !== undefined) validationData.tax_id = data.taxId;
    if (data.notes !== undefined) validationData.notes = data.notes;

    clientSchema.partial().parse(validationData);

    const updateData: Partial<Database['public']['Tables']['clients']['Update']> = {}

    if (data.name !== undefined) updateData.name = data.name
    if (data.email !== undefined) updateData.email = data.email || null
    if (data.phone !== undefined) updateData.phone = data.phone || null
    if (data.address !== undefined) updateData.address = data.address || null
    if (data.taxId !== undefined) updateData.tax_id = data.taxId || null
    if (data.notes !== undefined) updateData.notes = data.notes || null
    if (data.teamId !== undefined) updateData.team_id = data.teamId || null

    const { data: updatedClient, error } = await supabase
      .from('clients')
      .update(updateData)
      .eq('id', clientId)
      .select()
      .single()

    if (error) {
      throw error
    }

    return fromDatabaseFormat(updatedClient)
  } catch (error) {
    console.error('Error updating client:', error)
    throw error
  }
}

export async function deleteClient(clientId: string): Promise<void> {
  const supabase = createSupabaseClient()
  
  try {
    const { error } = await supabase
      .from('clients')
      .delete()
      .eq('id', clientId)

    if (error) {
      throw error
    }
  } catch (error) {
    console.error('Error deleting client:', error)
    throw error
  }
} 