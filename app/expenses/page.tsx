'use client'

import Layout from '@/components/Layout'
import ExpensesList from '@/components/expenses/ExpensesList'
import { useTranslation } from '@/components/TranslationProvider'

export const dynamic = 'force-dynamic'

export default function ExpensesPage() {
  const t = useTranslation()
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t.expenses.title}</h1>
        <p className="text-gray-600 mt-1">{t.expenses.subtitle}</p>
      </div>
      <ExpensesList />
    </Layout>
  )
}

