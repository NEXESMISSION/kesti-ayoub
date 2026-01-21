'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Credit } from '@/lib/types'
import CreditCard from './CreditCard'
import CreditModal from './CreditModal'
import { Plus, CreditCard as CreditCardIcon, ArrowDownCircle, ArrowUpCircle } from 'lucide-react'
import { useTranslation } from '@/components/TranslationProvider'

export default function CreditsList() {
  const t = useTranslation()
  const [credits, setCredits] = useState<Credit[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingCredit, setEditingCredit] = useState<Credit | null>(null)
  const [filter, setFilter] = useState<'all' | 'owed_to_me' | 'i_owe'>('all')

  const supabase = createClient()

  const fetchCredits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      let query = supabase
        .from('credits')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (filter !== 'all') {
        query = query.eq('type', filter)
      }

      const { data, error } = await query

      if (error) throw error
      setCredits(data || [])
    } catch (error) {
      console.error('Error fetching credits:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCredits()
  }, [filter])

  const handleAdd = () => {
    setEditingCredit(null)
    setIsModalOpen(true)
  }

  const handleEdit = (credit: Credit) => {
    setEditingCredit(credit)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t.credits.deleteConfirm)) return

    const { error } = await supabase
      .from('credits')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error deleting credit: ' + error.message)
    } else {
      fetchCredits()
    }
  }

  const handleSave = () => {
    setIsModalOpen(false)
    fetchCredits()
  }

  const receivables = credits.filter(c => c.type === 'owed_to_me' && c.status !== 'settled')
  const payables = credits.filter(c => c.type === 'i_owe' && c.status !== 'settled')
  const totalReceivables = receivables.reduce((sum, c) => sum + c.remaining_balance, 0)
  const totalPayables = payables.reduce((sum, c) => sum + c.remaining_balance, 0)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <CreditCardIcon className="w-5 h-5" />
            <span className="text-sm">{credits.length} {t.credits.creditsCount}</span>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors w-full sm:w-auto justify-center"
          >
            <Plus className="w-4 h-4" />
            <span>{t.credits.addCredit}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ArrowDownCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-700">{t.credits.receivables}</span>
              </div>
              <span className="text-xl font-bold text-green-600">
                {totalReceivables.toFixed(2)} TD
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">{receivables.length} {t.credits.openCount}</p>
          </div>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ArrowUpCircle className="w-5 h-5 text-red-600" />
                <span className="text-sm font-medium text-gray-700">{t.credits.payables}</span>
              </div>
              <span className="text-xl font-bold text-red-600">
                {totalPayables.toFixed(2)} TD
              </span>
            </div>
            <p className="text-xs text-gray-600 mt-1">{payables.length} {t.credits.openCount}</p>
          </div>
        </div>

        <div className="flex space-x-2">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'all'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {t.credits.all}
          </button>
          <button
            onClick={() => setFilter('owed_to_me')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'owed_to_me'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {t.credits.owedToMe}
          </button>
          <button
            onClick={() => setFilter('i_owe')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === 'i_owe'
                ? 'bg-primary-600 text-white'
                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
            }`}
          >
            {t.credits.iOwe}
          </button>
        </div>
      </div>

      {credits.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <CreditCardIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{t.credits.noCredits}</p>
          <button
            onClick={handleAdd}
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            {t.credits.addFirstCredit}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {credits.map((credit) => (
            <CreditCard
              key={credit.id}
              credit={credit}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <CreditModal
          credit={editingCredit}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

