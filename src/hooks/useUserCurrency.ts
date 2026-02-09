import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase';
import { useAuth } from '@/components/providers/AuthProvider';

// Lista de monedas disponibles (actualizada con MXN)
export const CURRENCIES = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: 'US$', name: 'Dólar estadounidense' },
  { code: 'MXN', symbol: 'MX$', name: 'Peso mexicano' },
  { code: 'ARS', symbol: 'ARS$', name: 'Peso argentino' },
  { code: 'BRL', symbol: 'R$', name: 'Real brasileño' },
  { code: 'CLP', symbol: 'CLP$', name: 'Peso chileno' },
  { code: 'COP', symbol: 'COP$', name: 'Peso colombiano' },
  { code: 'PEN', symbol: 'S/', name: 'Sol peruano' },
  { code: 'UYU', symbol: 'UYU$', name: 'Peso uruguayo' },
  { code: 'PYG', symbol: '₲', name: 'Guaraní paraguayo' },
  { code: 'BOB', symbol: 'Bs.', name: 'Boliviano boliviano' },
  { code: 'VES', symbol: 'Bs.S', name: 'Bolívar venezolano' },
  { code: 'GYD', symbol: 'GY$', name: 'Dólar guyanés' },
  { code: 'SRD', symbol: 'SRD$', name: 'Dólar surinamés' },
] as const;

export type CurrencyCode = typeof CURRENCIES[number]['code'];

const DEFAULT_CURRENCY = 'EUR';

export function useUserCurrency() {
  const [currency, setCurrency] = useState<CurrencyCode>(DEFAULT_CURRENCY);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const supabase = createClient();

  // Obtener la moneda del usuario desde la base de datos
  const fetchUserCurrency = useCallback(async () => {
    if (!user) {
      setCurrency(DEFAULT_CURRENCY);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('currency')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching user currency:', error);
        setCurrency(DEFAULT_CURRENCY);
      } else {
        // Validar que la moneda existe en la lista
        const validCurrency = CURRENCIES.find(c => c.code === data?.currency);
        setCurrency(validCurrency ? (data.currency as CurrencyCode) : DEFAULT_CURRENCY);
      }
    } catch (error) {
      console.error('Error fetching user currency:', error);
      setCurrency(DEFAULT_CURRENCY);
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  // Guardar la moneda del usuario
  const saveUserCurrency = useCallback(async (newCurrency: CurrencyCode) => {
    if (!user) {
      throw new Error('Usuario no autenticado');
    }

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ currency: newCurrency })
        .eq('id', user.id);

      if (error) {
        console.error('Error saving user currency:', error);
        throw error;
      }

      setCurrency(newCurrency);
      
      // También guardar en localStorage como backup
      localStorage.setItem(`user_currency_${user.id}`, newCurrency);
    } catch (error) {
      console.error('Error saving user currency:', error);
      // Si falla Supabase, guardar solo en localStorage
      localStorage.setItem(`user_currency_${user.id}`, newCurrency);
      setCurrency(newCurrency);
      throw error;
    }
  }, [user, supabase]);

  // Obtener el símbolo de la moneda actual
  const getCurrencySymbol = useCallback(() => {
    const currencyData = CURRENCIES.find(c => c.code === currency);
    return currencyData?.symbol || '€';
  }, [currency]);

  // Obtener información completa de la moneda actual
  const getCurrencyInfo = useCallback(() => {
    return CURRENCIES.find(c => c.code === currency) || CURRENCIES[0];
  }, [currency]);

  useEffect(() => {
    if (user) {
      // Intentar cargar desde localStorage primero para respuesta rápida
      const cachedCurrency = localStorage.getItem(`user_currency_${user.id}`);
      if (cachedCurrency && CURRENCIES.find(c => c.code === cachedCurrency)) {
        setCurrency(cachedCurrency as CurrencyCode);
        setLoading(false);
      }
      
      // Luego cargar desde la base de datos
      fetchUserCurrency();
    } else {
      setCurrency(DEFAULT_CURRENCY);
      setLoading(false);
    }
  }, [user, fetchUserCurrency]);

  return {
    currency,
    currencySymbol: getCurrencySymbol(),
    currencyInfo: getCurrencyInfo(),
    loading,
    saveUserCurrency,
    currencies: CURRENCIES,
  };
}
