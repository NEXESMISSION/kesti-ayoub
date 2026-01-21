'use client'

import { Expense } from '@/lib/types'
import { Edit, Trash2, Calendar, Tag } from 'lucide-react'
import { format } from 'date-fns'
import { useTranslation } from '@/components/TranslationProvider'

interface ExpenseCardProps {
  expense: Expense
  onEdit: (expense: Expense) => void
  onDelete: (id: string) => void
}

export default function ExpenseCard({ expense, onEdit, onDelete }: ExpenseCardProps) {
  const t = useTranslation()
  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">{expense.title}</h3>
          <div className="flex items-center gap-2 mt-1">
            <span className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs font-medium flex items-center">
              <Tag className="w-3 h-3 ml-1" />
              {expense.category}
            </span>
            {expense.payment_method && (
              <span className="text-xs text-gray-500">
                {expense.payment_method}
              </span>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(expense)}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(expense.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="w-4 h-4 ml-1" />
          {format(new Date(expense.expense_date), 'MMM dd, yyyy')}
        </div>
        <div className="text-xl font-bold text-red-600">
          {expense.amount.toFixed(2)} TD
        </div>
      </div>

      {expense.notes && (
        <p className="mt-2 text-sm text-gray-600 italic">{expense.notes}</p>
      )}
    </div>
  )
}

