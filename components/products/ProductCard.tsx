'use client'

import { Product } from '@/lib/types'
import { Edit, Trash2, Package } from 'lucide-react'
import { useTranslation } from '@/components/TranslationProvider'

interface ProductCardProps {
  product: Product
  onEdit: (product: Product) => void
  onDelete: (id: string) => void
}

export default function ProductCard({ product, onEdit, onDelete }: ProductCardProps) {
  const t = useTranslation()

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="font-semibold text-gray-900 text-lg">{product.name}</h3>
          {product.sku && (
            <p className="text-sm text-gray-500">{t.products.sku}: {product.sku}</p>
          )}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => onEdit(product)}
            className="p-2 text-gray-600 hover:text-primary-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(product.id)}
            className="p-2 text-gray-600 hover:text-red-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between items-center pt-2 border-t border-gray-200">
          <span className="text-gray-600 flex items-center">
            <Package className="w-4 h-4 ml-1" />
            {t.products.stock}:
          </span>
          <span className={`font-semibold ${product.stock_quantity === 0 ? 'text-red-600' : product.stock_quantity < 10 ? 'text-yellow-600' : 'text-green-600'}`}>
            {product.stock_quantity} {t.products.units}
          </span>
        </div>
      </div>
    </div>
  )
}

