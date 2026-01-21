'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Credit, CreditPayment } from '@/lib/types'
import { Edit, Trash2, Calendar, User, DollarSign, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { useTranslation } from '@/components/TranslationProvider'

interface CreditCardProps {
  credit: Credit
  onEdit: (credit: Credit) => void
  onDelete: (id: string) => void
}

export default function CreditCard({ credit, onEdit, onDelete }: CreditCardProps) {
  const t = useTranslation()
  const [payments, setPayments] = useState<CreditPayment[]>([])
  const [showPayments, setShowPayments] = useState(false)
  const [paymentAmount, setPaymentAmount] = useState('')
  const [paymentNotes, setPaymentNotes] = useState('')
  const [addingPayment, setAddingPayment] = useState(false)

  const supabase = createClient()

  const fetchPayments = async () => {
    const { data } = await supabase
      .from('credit_payments')
      .select('*')
      .eq('credit_id', credit.id)
      .order('payment_date', { ascending: false })

    if (data) setPayments(data)
  }

  useEffect(() => {
    if (showPayments) {
      fetchPayments()
    }
  }, [showPayments, credit.id])

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!paymentAmount || parseFloat(paymentAmount) <= 0) return

    setAddingPayment(true)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { error } = await supabase.from('credit_payments').insert([{
      user_id: user.id,
      credit_id: credit.id,
      amount: parseFloat(paymentAmount),
      payment_date: new Date().toISOString(),
      notes: paymentNotes || null,
    }])

    if (error) {
      alert('Error adding payment: ' + error.message)
    } else {
      setPaymentAmount('')
      setPaymentNotes('')
      fetchPayments()
      // Refresh credit to get updated balance
      window.location.reload()
    }
    setAddingPayment(false)
  }

  const isReceivable = credit.type === 'owed_to_me'
  const progressPercent = credit.amount > 0 
    ? ((credit.amount - credit.remaining_balance) / credit.amount) * 100 
    : 0

  return (
    <div className={`bg-white rounded-lg border-2 ${
      isReceivable ? 'border-green-200' : 'border-red-200'
    } p-4 hover:shadow-md transition-shadow`}>
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-gray-900 text-lg">{credit.person_name}</h3>
            <span className={`px-2 py-1 rounded text-xs font-medium ${
              credit.status === 'settled' 
                ? 'bg-gray-100 text-gray-700'
                : credit.status === 'partially_paid'
                ? 'bg-yellow-100 text-yellow-700'
                : 'bg-blue-100 text-blue-700'
            }`}>
              {credit.status === 'settled' ? t.credits.settled : 
               credit.status === 'partially_paid' ? t.credits.partiallyPaid : 
               t.credits.open}
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm text-gray-600">
            <span className={`font-semibold ${isReceivable ? 'text-green-600' : 'text-red-600'}`}>
              {isReceivable ? t.credits.owedToMe : t.credits.iOwe}
            </span>
            {credit.due_date && (
              <span className="flex items-center">
                <Calendar className="w-4 h-4 ml-1" />
                {t.credits.dueDate}: {format(new Date(credit.due_date), 'MMM dd, yyyy')}
              </span>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(credit)}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(credit.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-600">{t.credits.totalAmount}</p>
            <p className="text-lg font-semibold text-gray-900">${credit.amount.toFixed(2)}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600">{t.credits.remaining}</p>
            <p className={`text-lg font-bold ${isReceivable ? 'text-green-600' : 'text-red-600'}`}>
              ${credit.remaining_balance.toFixed(2)}
            </p>
          </div>
        </div>

        {credit.amount > 0 && (
          <div>
            <div className="flex justify-between text-xs text-gray-600 mb-1">
              <span>{t.credits.progress}</span>
              <span>{progressPercent.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  isReceivable ? 'bg-green-500' : 'bg-red-500'
                }`}
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {credit.notes && (
          <p className="text-sm text-gray-600 italic">{credit.notes}</p>
        )}

        {credit.status !== 'settled' && (
          <div className="pt-3 border-t border-gray-200">
            <button
              onClick={() => setShowPayments(!showPayments)}
              className="text-sm text-primary-600 hover:text-primary-700 font-medium"
            >
              {showPayments ? t.credits.hidePayments : t.credits.showPayments} ({t.credits.payments}: {payments.length})
            </button>

            {showPayments && (
              <div className="mt-3 space-y-3">
                <form onSubmit={handleAddPayment} className="bg-gray-50 p-3 rounded-lg space-y-2">
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      step="0.01"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      placeholder={t.credits.paymentAmount}
                      required
                      min="0.01"
                      max={credit.remaining_balance.toString()}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                    />
                    <button
                      type="submit"
                      disabled={addingPayment}
                      className="px-4 py-2 bg-primary-600 text-white rounded text-sm hover:bg-primary-700 transition-colors disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                  <input
                    type="text"
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder={t.credits.paymentNotes}
                    className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                  />
                </form>

                {payments.length > 0 ? (
                  <div className="space-y-2">
                    {payments.map((payment) => (
                      <div key={payment.id} className="flex justify-between items-center text-sm bg-white p-2 rounded border border-gray-200">
                        <div>
                          <span className="font-medium">${payment.amount.toFixed(2)}</span>
                          {payment.notes && (
                            <span className="text-gray-500 ml-2">- {payment.notes}</span>
                          )}
                        </div>
                        <span className="text-gray-500">
                          {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 text-center py-2">{t.credits.noPayments}</p>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

