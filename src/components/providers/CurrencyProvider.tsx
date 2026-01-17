'use client'

import React, { createContext, useContext, ReactNode } from 'react';
import { useUserCurrency } from '@/hooks/useUserCurrency';
import type { CurrencyCode } from '@/hooks/useUserCurrency';

interface CurrencyContextType {
  currency: CurrencyCode;
  currencySymbol: string;
  currencyInfo: { code: string; symbol: string; name: string };
  loading: boolean;
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
  const { currency, currencySymbol, currencyInfo, loading } = useUserCurrency();

  return (
    <CurrencyContext.Provider value={{ currency, currencySymbol, currencyInfo, loading }}>
      {children}
    </CurrencyContext.Provider>
  );
}
