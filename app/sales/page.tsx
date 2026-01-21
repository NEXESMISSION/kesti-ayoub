'use client'

import Layout from '@/components/Layout'
import SalesList from '@/components/sales/SalesList'
import { useTranslation } from '@/components/TranslationProvider'

export const dynamic = 'force-dynamic'

export default function SalesPage() {
  const t = useTranslation()
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t.sales.title}</h1>
        <p className="text-gray-600 mt-1">{t.sales.subtitle}</p>
      </div>
      <SalesList />
    </Layout>
  )
}

