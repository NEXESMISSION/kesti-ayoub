'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sale, Product } from '@/lib/types'
import { X } from 'lucide-react'
import { useTranslation } from '@/components/TranslationProvider'

interface SaleModalProps {
  sale: Sale | null
  products: Product[]
  onClose: () => void
  onSave: () => void
}

export default function SaleModal({ sale, products, onClose, onSave }: SaleModalProps) {
  const t = useTranslation()
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('')
  const [salePrice, setSalePrice] = useState('')
  const [paymentType, setPaymentType] = useState<'cash' | 'credit'>('cash')
  const [customerName, setCustomerName] = useState('')
  const [saleDate, setSaleDate] = useState(new Date().toISOString().split('T')[0])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (sale) {
      setProductId(sale.product_id)
      setQuantity(sale.quantity.toString())
      setSalePrice(sale.sale_price.toString())
      setPaymentType(sale.payment_type)
      setCustomerName(sale.customer_name || '')
      setSaleDate(sale.sale_date.split('T')[0])
    }
  }, [sale])

  // Removed auto-fill of sale price from product since we removed selling_price

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const selectedProduct = products.find(p => p.id === productId)
    if (!selectedProduct) {
      alert('Please select a product')
      setLoading(false)
      return
    }

    if (parseInt(quantity) > selectedProduct.stock_quantity) {
      alert(`Insufficient stock. Available: ${selectedProduct.stock_quantity}`)
      setLoading(false)
      return
    }

    const saleData = {
      product_id: productId,
      quantity: parseInt(quantity),
      sale_price: parseFloat(salePrice),
      payment_type: paymentType,
      customer_name: customerName || null,
      sale_date: new Date(saleDate).toISOString(),
      user_id: user.id,
    }

    try {
      if (sale) {
        // For updates, we need to handle stock adjustment
        const oldSale = sale
        const stockDiff = oldSale.quantity - parseInt(quantity)
        
        const { error: saleError } = await supabase
          .from('sales')
          .update(saleData)
          .eq('id', sale.id)

        if (saleError) throw saleError

        // Adjust stock manually
        if (stockDiff !== 0) {
          const { error: stockError } = await supabase
            .from('products')
            .update({ stock_quantity: selectedProduct.stock_quantity + stockDiff })
            .eq('id', productId)

          if (stockError) throw stockError
        }
      } else {
        const { error } = await supabase
          .from('sales')
          .insert([saleData])

        if (error) throw error

        // Create credit if payment type is credit
        if (paymentType === 'credit' && customerName) {
          const { data: saleResult } = await supabase
            .from('sales')
            .select('id')
            .eq('user_id', user.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

          if (saleResult) {
            await supabase.from('credits').insert([{
              user_id: user.id,
              person_name: customerName,
              type: 'owed_to_me',
              amount: parseFloat(salePrice) * parseInt(quantity),
              remaining_balance: parseFloat(salePrice) * parseInt(quantity),
              related_sale_id: saleResult.id,
              status: 'open',
            }])
          }
        }
      }

      onSave()
    } catch (error: any) {
      alert('Error saving sale: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const selectedProduct = products.find(p => p.id === productId)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {sale ? t.sales.editSale : t.sales.recordSale}
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
              {t.sales.product} *
            </label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            >
              <option value="">{t.sales.product}</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({t.products.stock}: {product.stock_quantity})
                </option>
              ))}
            </select>
            {selectedProduct && (
              <p className="mt-1 text-xs text-gray-500">
                {t.sales.available}: {selectedProduct.stock_quantity} {t.products.units}
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.sales.quantity} *
              </label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                required
                min="1"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.sales.salePrice} *
              </label>
              <input
                type="number"
                step="0.01"
                value={salePrice}
                onChange={(e) => setSalePrice(e.target.value)}
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.sales.paymentType} *
            </label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  value="cash"
                  checked={paymentType === 'cash'}
                  onChange={(e) => setPaymentType(e.target.value as 'cash' | 'credit')}
                  className="ml-2"
                />
                {t.sales.cash}
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  value="credit"
                  checked={paymentType === 'credit'}
                  onChange={(e) => setPaymentType(e.target.value as 'cash' | 'credit')}
                  className="ml-2"
                />
                {t.sales.credit}
              </label>
            </div>
          </div>

          {paymentType === 'credit' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t.sales.customerName} *
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required={paymentType === 'credit'}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder={t.sales.customerName}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.sales.saleDate} *
            </label>
            <input
              type="date"
              value={saleDate}
              onChange={(e) => setSaleDate(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
            />
          </div>

          {selectedProduct && quantity && salePrice && (
            <div className="p-3 bg-gray-50 rounded-lg">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">{t.sales.totalAmount}:</span>
                <span className="font-semibold text-lg text-green-600">
                  {(parseFloat(salePrice) * parseInt(quantity)).toFixed(2)} TD
                </span>
              </div>
            </div>
          )}

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

