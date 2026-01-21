'use client'

import Layout from '@/components/Layout'
import FinanceDashboard from '@/components/finance/FinanceDashboard'
import { useTranslation } from '@/components/TranslationProvider'

export const dynamic = 'force-dynamic'

export default function FinancePage() {
  const t = useTranslation()
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t.finance.title}</h1>
        <p className="text-gray-600 mt-1">{t.finance.subtitle}</p>
      </div>
      <FinanceDashboard />
    </Layout>
  )
}

