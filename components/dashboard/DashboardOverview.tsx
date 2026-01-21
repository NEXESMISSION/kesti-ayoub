'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'
import { Package, ShoppingCart, Receipt, CreditCard, ArrowRight, TrendingUp, TrendingDown } from 'lucide-react'
import { useTranslation } from '@/components/TranslationProvider'

interface DashboardStats {
  productsCount: number
  salesCount: number
  expensesCount: number
  creditsCount: number
  totalSales: number
  totalExpenses: number
  lowStockProducts: number
}

export default function DashboardOverview() {
  const t = useTranslation()
  const [stats, setStats] = useState<DashboardStats>({
    productsCount: 0,
    salesCount: 0,
    expensesCount: 0,
    creditsCount: 0,
    totalSales: 0,
    totalExpenses: 0,
    lowStockProducts: 0,
  })
  const [loading, setLoading] = useState(true)

  const supabase = createClient()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        // Fetch products
        const { data: products } = await supabase
          .from('products')
          .select('id, stock_quantity')
          .eq('user_id', user.id)

        // Fetch sales
        const { data: sales } = await supabase
          .from('sales')
          .select('sale_price, quantity')
          .eq('user_id', user.id)

        // Fetch expenses
        const { data: expenses } = await supabase
          .from('expenses')
          .select('amount')
          .eq('user_id', user.id)

        // Fetch credits
        const { data: credits } = await supabase
          .from('credits')
          .select('id')
          .eq('user_id', user.id)
          .neq('status', 'settled')

        const productsCount = products?.length || 0
        const salesCount = sales?.length || 0
        const expensesCount = expenses?.length || 0
        const creditsCount = credits?.length || 0

        const totalSales = (sales || []).reduce(
          (sum, sale) => sum + (sale.sale_price * sale.quantity),
          0
        )

        const totalExpenses = (expenses || []).reduce(
          (sum, expense) => sum + expense.amount,
          0
        )

        const lowStockProducts = (products || []).filter(
          p => p.stock_quantity < 10
        ).length

        setStats({
          productsCount,
          salesCount,
          expensesCount,
          creditsCount,
          totalSales,
          totalExpenses,
          lowStockProducts,
        })
      } catch (error) {
        console.error('Error fetching stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  const netProfit = stats.totalSales - stats.totalExpenses

  return (
    <div className="space-y-6">
      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link href="/products" className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <Package className="w-5 h-5 text-primary-600" />
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.productsCount}</p>
          <p className="text-sm text-gray-600">{t.dashboard.products}</p>
          {stats.lowStockProducts > 0 && (
            <p className="text-xs text-red-600 mt-1">{stats.lowStockProducts} {t.dashboard.lowStock}</p>
          )}
        </Link>

        <Link href="/sales" className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <ShoppingCart className="w-5 h-5 text-green-600" />
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.salesCount}</p>
          <p className="text-sm text-gray-600">{t.dashboard.sales}</p>
        </Link>

        <Link href="/expenses" className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <Receipt className="w-5 h-5 text-red-600" />
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.expensesCount}</p>
          <p className="text-sm text-gray-600">{t.dashboard.expenses}</p>
        </Link>

        <Link href="/credits" className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="w-5 h-5 text-yellow-600" />
            <ArrowRight className="w-4 h-4 text-gray-400" />
          </div>
          <p className="text-2xl font-bold text-gray-900">{stats.creditsCount}</p>
          <p className="text-sm text-gray-600">{t.dashboard.openCredits}</p>
        </Link>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-green-50 rounded-lg border border-green-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{t.dashboard.totalSales}</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">{stats.totalSales.toFixed(2)} TD</p>
        </div>

        <div className="bg-red-50 rounded-lg border border-red-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{t.dashboard.totalExpenses}</span>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">{stats.totalExpenses.toFixed(2)} TD</p>
        </div>

        <div className={`rounded-lg border p-6 ${
          netProfit >= 0
            ? 'bg-green-50 border-green-200'
            : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{t.dashboard.netProfit}</span>
            {netProfit >= 0 ? (
              <TrendingUp className="w-5 h-5 text-green-600" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-600" />
            )}
          </div>
          <p className={`text-3xl font-bold ${
            netProfit >= 0 ? 'text-green-600' : 'text-red-600'
          }`}>
            {netProfit.toFixed(2)} TD
          </p>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.dashboard.quickActions}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <Link
            href="/products"
            className="px-4 py-3 bg-primary-50 text-primary-700 rounded-lg hover:bg-primary-100 transition-colors text-center font-medium"
          >
            {t.dashboard.addProduct}
          </Link>
          <Link
            href="/sales"
            className="px-4 py-3 bg-green-50 text-green-700 rounded-lg hover:bg-green-100 transition-colors text-center font-medium"
          >
            {t.dashboard.recordSale}
          </Link>
          <Link
            href="/expenses"
            className="px-4 py-3 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition-colors text-center font-medium"
          >
            {t.dashboard.addExpense}
          </Link>
          <Link
            href="/finance"
            className="px-4 py-3 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors text-center font-medium"
          >
            {t.dashboard.viewFinance}
          </Link>
        </div>
      </div>
    </div>
  )
}

