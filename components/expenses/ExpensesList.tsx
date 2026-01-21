'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Expense } from '@/lib/types'
import ExpenseCard from './ExpenseCard'
import ExpenseModal from './ExpenseModal'
import { Plus, Receipt } from 'lucide-react'
import { useTranslation } from '@/components/TranslationProvider'

export default function ExpensesList() {
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)

  const supabase = createClient()

  const fetchExpenses = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('user_id', user.id)
        .order('expense_date', { ascending: false })

      if (error) throw error
      setExpenses(data || [])
    } catch (error) {
      console.error('Error fetching expenses:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [])

  const handleAdd = () => {
    setEditingExpense(null)
    setIsModalOpen(true)
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setIsModalOpen(true)
  }

  const t = useTranslation()

  const handleDelete = async (id: string) => {
    if (!confirm(t.expenses.deleteConfirm)) return

    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error deleting expense: ' + error.message)
    } else {
      fetchExpenses()
    }
  }

  const handleSave = () => {
    setIsModalOpen(false)
    fetchExpenses()
  }

  const totalExpenses = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-gray-600">
            <Receipt className="w-5 h-5" />
            <span className="text-sm">{expenses.length} {t.expenses.expensesCount}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">{t.common.total}: </span>
            <span className="font-semibold text-red-600">{totalExpenses.toFixed(2)} TD</span>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>{t.expenses.addExpense}</span>
        </button>
      </div>

      {expenses.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{t.expenses.noExpenses}</p>
          <button
            onClick={handleAdd}
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            {t.expenses.addFirstExpense}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {expenses.map((expense) => (
            <ExpenseCard
              key={expense.id}
              expense={expense}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <ExpenseModal
          expense={editingExpense}
          categories={[]}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

