import { useState, useEffect } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import { getCompanySettings, saveCompanySettings, type CompanyData } from '@/services/companySettingsService';

export { type CompanyData } from '@/services/companySettingsService';

const DEFAULT_COMPANY_DATA: CompanyData = {
  name: '3DCraftFlow',
  description: 'Servicios de Impresión 3D',
  email: 'info@3dcraftflow.com',
  phone: '+34 XXX XXX XXX',
  address: '',
  website: '',
  logo: '',
  taxId: '',
  bankInfo: '',
  terms: 'Este documento es un albarán de entrega de servicios de impresión 3D. Para cualquier consulta, contacte con nosotros.',
  footer: 'Gracias por confiar en nuestros servicios de impresión 3D.'
};

export function useCompanySettings() {
  const { user } = useAuth();
  const [companyData, setCompanyData] = useState<CompanyData>(DEFAULT_COMPANY_DATA);
  const [isLoading, setIsLoading] = useState(true);

  // Cargar datos de la empresa desde Supabase
  useEffect(() => {
    if (user) {
      const loadCompanySettings = async () => {
        try {
          setIsLoading(true);
          console.log('Loading company settings for user:', user.id);
          
          // Intentar cargar desde localStorage primero como fallback
          const savedData = localStorage.getItem(`company_settings_${user.id}`);
          if (savedData) {
            try {
              const parsedData = JSON.parse(savedData);
              console.log('Found data in localStorage:', parsedData);
              setCompanyData({ ...DEFAULT_COMPANY_DATA, ...parsedData });
            } catch (error) {
              console.error('Error parsing localStorage data:', error);
            }
          }
          
          // Intentar cargar desde Supabase
          const data = await getCompanySettings(user.id);
          console.log('Loaded company settings from Supabase:', data);
          
          // Solo actualizar si los datos de Supabase son diferentes de los por defecto
          if (data.name !== DEFAULT_COMPANY_DATA.name || data.email !== DEFAULT_COMPANY_DATA.email) {
            setCompanyData(data);
            // Guardar en localStorage como backup
            localStorage.setItem(`company_settings_${user.id}`, JSON.stringify(data));
          }
        } catch (error) {
          console.error('Error loading company settings:', error);
          // Fallback to defaults if there's an error
          setCompanyData(DEFAULT_COMPANY_DATA);
        } finally {
          setIsLoading(false);
        }
      };

      loadCompanySettings();
    } else {
      setIsLoading(false);
    }
  }, [user]);

  // Guardar datos de la empresa en Supabase
  const saveCompanyData = async (data: CompanyData): Promise<void> => {
    if (!user) throw new Error('Usuario no autenticado');

    try {
      console.log('Saving company settings to Supabase:', data);
      await saveCompanySettings(user.id, data);
      setCompanyData(data);
      
      // También guardar en localStorage como backup
      localStorage.setItem(`company_settings_${user.id}`, JSON.stringify(data));
      console.log('Saved to localStorage as backup');
    } catch (error) {
      console.error('Error saving company settings:', error);
      
      // Si falla Supabase, guardar solo en localStorage
      console.log('Falling back to localStorage only');
      localStorage.setItem(`company_settings_${user.id}`, JSON.stringify(data));
      setCompanyData(data);
      
      // No lanzar error si es porque la tabla no existe
      if (error instanceof Error && error.message.includes('relation "company_settings" does not exist')) {
        console.log('Table does not exist yet, using localStorage only');
        return;
      }
      
      throw error;
    }
  };

  // Obtener datos de la empresa
  const getCompanyData = (): CompanyData => {
    return companyData;
  };

  // Resetear a valores por defecto
  const resetToDefaults = async (): Promise<void> => {
    if (!user) return;
    
    try {
      await saveCompanySettings(user.id, DEFAULT_COMPANY_DATA);
      setCompanyData(DEFAULT_COMPANY_DATA);
    } catch (error) {
      console.error('Error resetting company settings:', error);
      throw error;
    }
  };

  return {
    companyData,
    isLoading,
    saveCompanyData,
    getCompanyData,
    resetToDefaults
  };
} 