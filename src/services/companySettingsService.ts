import { createClient } from '@/lib/supabase'
import type { Database } from '@/lib/supabase'

export interface CompanyData {
  name: string
  description: string
  email: string
  phone: string
  address: string
  website: string
  logo: string
  taxId: string
  bankInfo: string
  terms: string
  footer: string
}

const DEFAULT_COMPANY_DATA: CompanyData = {
  name: 'MakerCycle',
  description: 'Servicios de Impresión 3D',
  email: 'info@makercycle.com',
  phone: '+34 XXX XXX XXX',
  address: '',
  website: '',
  logo: '',
  taxId: '',
  bankInfo: '',
  terms: 'Este documento es un albarán de entrega de servicios de impresión 3D. Para cualquier consulta, contacte con nosotros.',
  footer: 'Gracias por confiar en nuestros servicios de impresión 3D.'
}

// Convert CompanyData to database format
function toDatabaseFormat(data: CompanyData, userId: string): Database['public']['Tables']['company_settings']['Insert'] {
  return {
    user_id: userId,
    name: data.name,
    description: data.description,
    email: data.email,
    phone: data.phone,
    address: data.address,
    website: data.website,
    logo: data.logo,
    tax_id: data.taxId,
    bank_info: data.bankInfo,
    terms: data.terms,
    footer: data.footer
  }
}

// Convert database format to CompanyData
function fromDatabaseFormat(dbData: Database['public']['Tables']['company_settings']['Row']): CompanyData {
  return {
    name: dbData.name,
    description: dbData.description,
    email: dbData.email,
    phone: dbData.phone,
    address: dbData.address,
    website: dbData.website,
    logo: dbData.logo,
    taxId: dbData.tax_id,
    bankInfo: dbData.bank_info,
    terms: dbData.terms,
    footer: dbData.footer
  }
}

export async function getCompanySettings(userId: string, teamId?: string | null): Promise<CompanyData> {
  const supabase = createClient()
  
  try {
    let query = supabase
      .from('company_settings')
      .select('*');

    if (teamId) {
      // Get team settings
      query = query.eq('team_id', teamId);
    } else {
      // Get personal settings (where team_id is null)
      query = query.eq('user_id', userId).is('team_id', null);
    }

    const { data, error } = await query.single()

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found, return defaults
        return DEFAULT_COMPANY_DATA
      }
      // Si es un error de tabla no encontrada, también retornar defaults
      if (error.message && error.message.includes('relation "company_settings" does not exist')) {
        return DEFAULT_COMPANY_DATA
      }
      throw error
    }

    const formattedData = fromDatabaseFormat(data);
    return formattedData
  } catch (error) {
    console.error('Error fetching company settings:', error)
    return DEFAULT_COMPANY_DATA
  }
}

export async function saveCompanySettings(userId: string, data: CompanyData, teamId?: string | null): Promise<void> {
  const supabase = createClient()
  
  try {
    
    let updateQuery;
    
    if (teamId) {
      // Update team settings
      updateQuery = supabase
        .from('company_settings')
        .update(toDatabaseFormat(data, userId))
        .eq('team_id', teamId);
    } else {
      // Update personal settings (where team_id is null)
      updateQuery = supabase
        .from('company_settings')
        .update(toDatabaseFormat(data, userId))
        .eq('user_id', userId)
        .is('team_id', null);
    }
    
    // First, try to update existing settings
    const { error: updateError } = await updateQuery

    if (updateError) {
      if (updateError.code === 'PGRST116') {
        // No existing settings, insert new ones
        const { error: insertError } = await supabase
          .from('company_settings')
          .insert(toDatabaseFormat(data, userId))

        if (insertError) {
          // Si la tabla no existe, no lanzar error, solo log
          if (insertError.message && insertError.message.includes('relation "company_settings" does not exist')) {
            return;
          }
          throw insertError
        }
      } else {
        // Si es un error de tabla no encontrada, no lanzar error
        if (updateError.message && updateError.message.includes('relation "company_settings" does not exist')) {
          return;
        }
        throw updateError
      }
    }
  } catch (error) {
    console.error('Error saving company settings:', error)
    // No lanzar error si la tabla no existe
    if (error instanceof Error && error.message.includes('relation "company_settings" does not exist')) {
      return;
    }
    throw error
  }
}

export async function createDefaultCompanySettings(userId: string, teamId?: string | null): Promise<void> {
  await saveCompanySettings(userId, DEFAULT_COMPANY_DATA, teamId)
} 