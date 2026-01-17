import { useMemo } from 'react';
import { formatCurrency as formatCurrencyUtil } from '@/utils/numberUtils';
import { useCurrency } from '@/components/providers/CurrencyProvider';

/**
 * Hook para formatear valores como moneda usando la moneda configurada del usuario
 */
export function useFormatCurrency() {
  const { currencySymbol, loading } = useCurrency();

  const formatCurrency = useMemo(() => {
    return (value: number): string => {
      return formatCurrencyUtil(value, currencySymbol);
    };
  }, [currencySymbol]);

  return {
    formatCurrency,
    currencySymbol,
    loading,
  };
}
