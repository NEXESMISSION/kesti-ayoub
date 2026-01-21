'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Credit } from '@/lib/types'
import { X } from 'lucide-react'
import { useTranslation } from '@/components/TranslationProvider'

interface CreditModalProps {
  credit: Credit | null
  onClose: () => void
  onSave: () => void
}

export default function CreditModal({ credit, onClose, onSave }: CreditModalProps) {
  const t = useTranslation()
  const [personName, setPersonName] = useState('')
  const [type, setType] = useState<'owed_to_me' | 'i_owe'>('owed_to_me')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [expectedPaymentDate, setExpectedPaymentDate] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (credit) {
      setPersonName(credit.person_name)
      setType(credit.type)
      setAmount(credit.amount.toString())
      setDueDate(credit.due_date ? credit.due_date.split('T')[0] : '')
      setExpectedPaymentDate(credit.expected_payment_date ? credit.expected_payment_date.split('T')[0] : '')
      setNotes(credit.notes || '')
    } else {
      setPersonName('')
      setType('owed_to_me')
      setAmount('')
      setDueDate('')
      setExpectedPaymentDate('')
      setNotes('')
    }
  }, [credit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const creditData = {
      person_name: personName,
      type,
      amount: parseFloat(amount),
      remaining_balance: parseFloat(amount),
      due_date: dueDate ? new Date(dueDate).toISOString() : null,
      expected_payment_date: expectedPaymentDate ? new Date(expectedPaymentDate).toISOString() : null,
      notes: notes || null,
      status: 'open' as const,
      user_id: user.id,
    }

    try {
      if (credit) {
        // For updates, preserve the remaining balance if it's less than the new amount
        const newBalance = credit.remaining_balance > parseFloat(amount) 
          ? parseFloat(amount) 
          : credit.remaining_balance

        const { error } = await supabase
          .from('credits')
          .update({
            ...creditData,
            remaining_balance: newBalance,
            status: newBalance === 0 ? 'settled' : newBalance < parseFloat(amount) ? 'partially_paid' : 'open',
          })
          .eq('id', credit.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('credits')
          .insert([creditData])

        if (error) throw error
      }

      onSave()
    } catch (error: any) {
      alert('Error saving credit: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {credit ? t.credits.editCredit : t.credits.addCredit}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.credits.personName} *
            </label>
            <input
              type="text"
              value={personName}
              onChange={(e) => setPersonName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder={t.credits.personName}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.credits.creditType} *
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="owed_to_me"
                  checked={type === 'owed_to_me'}
                  onChange={(e) => setType(e.target.value as 'owed_to_me' | 'i_owe')}
                  className="ml-2"
                />
                <span className="text-green-600 font-medium">{t.credits.owedToMe}</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="i_owe"
                  checked={type === 'i_owe'}
                  onChange={(e) => setType(e.target.value as 'owed_to_me' | 'i_owe')}
                  className="ml-2"
                />
                <span className="text-red-600 font-medium">{t.credits.iOwe}</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.credits.amount} *
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.credits.dueDate}
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          {type === 'owed_to_me' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.credits.whenToGetPaid}
              </label>
              <input
                type="date"
                value={expectedPaymentDate}
                onChange={(e) => setExpectedPaymentDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.common.notes}
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder={t.common.optional}
            />
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50"
            >
              {loading ? t.common.saving : t.common.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

