'use client'

import Layout from '@/components/Layout'
import CreditsList from '@/components/credits/CreditsList'
import { useTranslation } from '@/components/TranslationProvider'

export const dynamic = 'force-dynamic'

export default function CreditsPage() {
  const t = useTranslation()
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t.credits.title}</h1>
        <p className="text-gray-600 mt-1">{t.credits.subtitle}</p>
      </div>
      <CreditsList />
    </Layout>
  )
}

