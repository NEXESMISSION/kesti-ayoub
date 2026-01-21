'use client'

import { createContext, useContext, ReactNode } from 'react'
import { translations } from '@/lib/translations'

const TranslationContext = createContext(translations)

export function TranslationProvider({ children }: { children: ReactNode }) {
  return (
    <TranslationContext.Provider value={translations}>
      {children}
    </TranslationContext.Provider>
  )
}

export function useTranslation() {
  return useContext(TranslationContext)
}

