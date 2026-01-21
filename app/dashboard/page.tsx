'use client'

import Layout from '@/components/Layout'
import DashboardOverview from '@/components/dashboard/DashboardOverview'
import { useTranslation } from '@/components/TranslationProvider'

export const dynamic = 'force-dynamic'

export default function DashboardPage() {
  const t = useTranslation()
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t.dashboard.title}</h1>
        <p className="text-gray-600 mt-1">{t.dashboard.welcome}</p>
      </div>
      <DashboardOverview />
    </Layout>
  )
}

