'use client'

import React, { createContext, useContext, ReactNode } from 'react';
import { useUserCurrency, CURRENCIES } from '@/hooks/useUserCurrency';
import type { CurrencyCode } from '@/hooks/useUserCurrency';

interface CurrencyContextType {
  currency: CurrencyCode;
  currencySymbol: string;
  currencyInfo: { code: string; symbol: string; name: string };
  loading: boolean;
  saveUserCurrency: (newCurrency: CurrencyCode) => Promise<void>;
  currencies: typeof CURRENCIES;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export function useCurrency() {
  const context = useContext(CurrencyContext);
  if (context === undefined) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
}

interface CurrencyProviderProps {
  children: ReactNode;
}

export function CurrencyProvider({ children }: CurrencyProviderProps) {
  const { currency, currencySymbol, currencyInfo, loading, saveUserCurrency } = useUserCurrency();

  return (
    <CurrencyContext.Provider value={{ 
      currency, 
      currencySymbol, 
      currencyInfo, 
      loading,
      saveUserCurrency,
      currencies: CURRENCIES
    }}>
      {children}
    </CurrencyContext.Provider>
  );
}
