'use client'

import { Sale } from '@/lib/types'
import { Edit, Trash2, Calendar, User, CreditCard, DollarSign } from 'lucide-react'
import { format } from 'date-fns'
import { useTranslation } from '@/components/TranslationProvider'

interface SaleCardProps {
  sale: Sale
  onEdit: (sale: Sale) => void
  onDelete: (id: string) => void
}

export default function SaleCard({ sale, onEdit, onDelete }: SaleCardProps) {
  const t = useTranslation()
  const product = sale.product as any
  const total = sale.sale_price * sale.quantity

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">
            {product?.name || 'Unknown Product'}
          </h3>
          <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-600">
            <span className="flex items-center">
              <DollarSign className="w-4 h-4 ml-1" />
              ${sale.sale_price.toFixed(2)} × {sale.quantity}
            </span>
            <span className="font-semibold text-green-600">
              {t.sales.totalAmount}: ${total.toFixed(2)}
            </span>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(sale)}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(sale.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 text-sm">
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${
          sale.payment_type === 'cash' 
            ? 'bg-green-100 text-green-700' 
            : 'bg-yellow-100 text-yellow-700'
        }`}>
          {sale.payment_type === 'cash' ? t.sales.cash : t.sales.credit}
        </span>
        {sale.customer_name && (
          <span className="flex items-center text-gray-600">
            <User className="w-4 h-4 ml-1" />
            {sale.customer_name}
          </span>
        )}
        <span className="flex items-center text-gray-600">
          <Calendar className="w-4 h-4 ml-1" />
          {format(new Date(sale.sale_date), 'MMM dd, yyyy')}
        </span>
      </div>
    </div>
  )
}

