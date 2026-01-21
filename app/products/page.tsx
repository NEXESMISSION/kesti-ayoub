'use client'

import Layout from '@/components/Layout'
import ProductsList from '@/components/products/ProductsList'
import { useTranslation } from '@/components/TranslationProvider'

export const dynamic = 'force-dynamic'

export default function ProductsPage() {
  const t = useTranslation()
  return (
    <Layout>
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">{t.products.title}</h1>
        <p className="text-gray-600 mt-1">{t.products.subtitle}</p>
      </div>
      <ProductsList />
    </Layout>
  )
}

