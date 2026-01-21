'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { FinanceSummary } from '@/lib/types'
import { DollarSign, TrendingUp, TrendingDown, ArrowDownCircle, ArrowUpCircle, Calendar } from 'lucide-react'
import { format, subDays, startOfMonth, endOfMonth } from 'date-fns'
import { useTranslation } from '@/components/TranslationProvider'

export default function FinanceDashboard() {
  const t = useTranslation()
  const [summary, setSummary] = useState<FinanceSummary>({
    totalSales: 0,
    totalExpenses: 0,
    netProfit: 0,
    outstandingReceivables: 0,
    outstandingPayables: 0,
    cashFlow: 0,
  })
  const [loading, setLoading] = useState(true)
  const [dateRange, setDateRange] = useState<'all' | 'today' | 'week' | 'month' | 'custom'>('month')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')

  const supabase = createClient()

  const getDateFilter = () => {
    const now = new Date()
    switch (dateRange) {
      case 'today':
        return {
          start: format(now, 'yyyy-MM-dd'),
          end: format(now, 'yyyy-MM-dd'),
        }
      case 'week':
        return {
          start: format(subDays(now, 7), 'yyyy-MM-dd'),
          end: format(now, 'yyyy-MM-dd'),
        }
      case 'month':
        return {
          start: format(startOfMonth(now), 'yyyy-MM-dd'),
          end: format(endOfMonth(now), 'yyyy-MM-dd'),
        }
      case 'custom':
        return {
          start: startDate || format(subDays(now, 30), 'yyyy-MM-dd'),
          end: endDate || format(now, 'yyyy-MM-dd'),
        }
      default:
        return null
    }
  }

  const fetchFinanceData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const dateFilter = getDateFilter()

      // Fetch sales
      let salesQuery = supabase
        .from('sales')
        .select('sale_price, quantity, payment_type')
        .eq('user_id', user.id)

      if (dateFilter) {
        salesQuery = salesQuery
          .gte('sale_date', dateFilter.start)
          .lte('sale_date', dateFilter.end)
      }

      const { data: salesData } = await salesQuery

      // Fetch expenses
      let expensesQuery = supabase
        .from('expenses')
        .select('amount')
        .eq('user_id', user.id)

      if (dateFilter) {
        expensesQuery = expensesQuery
          .gte('expense_date', dateFilter.start)
          .lte('expense_date', dateFilter.end)
      }

      const { data: expensesData } = await expensesQuery

      // Fetch credits (always all time for outstanding amounts)
      const { data: creditsData } = await supabase
        .from('credits')
        .select('type, remaining_balance, status')
        .eq('user_id', user.id)
        .neq('status', 'settled')

      // Calculate totals
      const totalSales = (salesData || []).reduce(
        (sum, sale) => sum + (sale.sale_price * sale.quantity),
        0
      )

      const totalExpenses = (expensesData || []).reduce(
        (sum, expense) => sum + expense.amount,
        0
      )

      const netProfit = totalSales - totalExpenses

      const outstandingReceivables = (creditsData || [])
        .filter(c => c.type === 'owed_to_me')
        .reduce((sum, c) => sum + c.remaining_balance, 0)

      const outstandingPayables = (creditsData || [])
        .filter(c => c.type === 'i_owe')
        .reduce((sum, c) => sum + c.remaining_balance, 0)

      // Cash flow = sales (cash only) - expenses - payables + receivables collected
      const cashSales = (salesData || [])
        .filter(s => s.payment_type === 'cash')
        .reduce((sum, sale) => sum + (sale.sale_price * sale.quantity), 0)

      const cashFlow = cashSales - totalExpenses

      setSummary({
        totalSales,
        totalExpenses,
        netProfit,
        outstandingReceivables,
        outstandingPayables,
        cashFlow,
      })
    } catch (error) {
      console.error('Error fetching finance data:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFinanceData()
  }, [dateRange, startDate, endDate])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Date Range Filter */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Calendar className="w-5 h-5 text-gray-600" />
            <span className="font-medium text-gray-700">{t.finance.dateRange}</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(['all', 'today', 'week', 'month', 'custom'] as const).map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  dateRange === range
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {range === 'all' ? t.finance.all :
                 range === 'today' ? t.finance.today :
                 range === 'week' ? t.finance.week :
                 range === 'month' ? t.finance.month :
                 t.finance.custom}
              </button>
            ))}
          </div>
        </div>

        {dateRange === 'custom' && (
          <div className="mt-4 grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.finance.startDate}</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">{t.finance.endDate}</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">{t.finance.totalSales}</span>
            <DollarSign className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-gray-900">{summary.totalSales.toFixed(2)} TD</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">{t.finance.totalExpenses}</span>
            <TrendingDown className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">{summary.totalExpenses.toFixed(2)} TD</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">{t.finance.netProfit}</span>
            <TrendingUp className={`w-5 h-5 ${summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
          <p className={`text-3xl font-bold ${summary.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {summary.netProfit.toFixed(2)} TD
          </p>
        </div>

        <div className="bg-green-50 rounded-lg border border-green-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{t.finance.receivables}</span>
            <ArrowDownCircle className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">{summary.outstandingReceivables.toFixed(2)} TD</p>
          <p className="text-xs text-gray-600 mt-1">{t.finance.moneyOwedToYou}</p>
        </div>

        <div className="bg-red-50 rounded-lg border border-red-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{t.finance.payables}</span>
            <ArrowUpCircle className="w-5 h-5 text-red-600" />
          </div>
          <p className="text-3xl font-bold text-red-600">{summary.outstandingPayables.toFixed(2)} TD</p>
          <p className="text-xs text-gray-600 mt-1">{t.finance.moneyYouOwe}</p>
        </div>

        <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">{t.finance.cashFlow}</span>
            <DollarSign className={`w-5 h-5 ${summary.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`} />
          </div>
          <p className={`text-3xl font-bold ${summary.cashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {summary.cashFlow.toFixed(2)} TD
          </p>
          <p className="text-xs text-gray-600 mt-1">{t.finance.cashSalesMinusExpenses}</p>
        </div>
      </div>

      {/* Additional Insights */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{t.finance.financialInsights}</h3>
        <div className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{t.finance.profitMargin}</span>
            <span className={`font-semibold ${
              summary.totalSales > 0 && (summary.netProfit / summary.totalSales) >= 0.2
                ? 'text-green-600'
                : summary.totalSales > 0 && (summary.netProfit / summary.totalSales) >= 0.1
                ? 'text-yellow-600'
                : 'text-red-600'
            }`}>
              {summary.totalSales > 0
                ? `${((summary.netProfit / summary.totalSales) * 100).toFixed(1)}%`
                : 'N/A'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">{t.finance.netCreditPosition}</span>
            <span className={`font-semibold ${
              summary.outstandingReceivables > summary.outstandingPayables
                ? 'text-green-600'
                : 'text-red-600'
            }`}>
              {(summary.outstandingReceivables - summary.outstandingPayables).toFixed(2)} TD
            </span>
          </div>
          {summary.totalSales > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-gray-600">{t.finance.expenseRatio}</span>
              <span className="font-semibold text-gray-900">
                {((summary.totalExpenses / summary.totalSales) * 100).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

