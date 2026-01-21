'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/lib/types'
import { X } from 'lucide-react'
import { useTranslation } from '@/components/TranslationProvider'

interface ProductModalProps {
  product: Product | null
  onClose: () => void
  onSave: () => void
}

export default function ProductModal({ product, onClose, onSave }: ProductModalProps) {
  const t = useTranslation()
  const [name, setName] = useState('')
  const [sku, setSku] = useState('')
  const [stockQuantity, setStockQuantity] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (product) {
      setName(product.name)
      setSku(product.sku || '')
      setStockQuantity(product.stock_quantity.toString())
    }
  }, [product])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const productData = {
      name,
      sku: sku || null,
      cost_price: 0, // Keep for backward compatibility but not used
      selling_price: 0, // Keep for backward compatibility but not used
      stock_quantity: parseInt(stockQuantity),
      user_id: user.id,
    }

    try {
      if (product) {
        const { error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', product.id)

        if (error) throw error
      } else {
        const { error } = await supabase
          .from('products')
          .insert([productData])

        if (error) throw error
      }

      onSave()
    } catch (error: any) {
      alert('Error saving product: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {product ? t.products.editProduct : t.products.addProduct}
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
              {t.products.productName} *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder={t.products.productName}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.products.sku}
            </label>
            <input
              type="text"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder={t.common.optional}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t.products.stockQuantity} *
            </label>
            <input
              type="number"
              value={stockQuantity}
              onChange={(e) => setStockQuantity(e.target.value)}
              required
              min="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
              placeholder="0"
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

