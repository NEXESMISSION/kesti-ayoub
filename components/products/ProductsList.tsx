'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/lib/types'
import ProductCard from './ProductCard'
import ProductModal from './ProductModal'
import { Plus, Package } from 'lucide-react'
import { useTranslation } from '@/components/TranslationProvider'

export default function ProductsList() {
  const t = useTranslation()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)

  const supabase = createClient()

  const fetchProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  const handleAdd = () => {
    setEditingProduct(null)
    setIsModalOpen(true)
  }

  const handleEdit = (product: Product) => {
    setEditingProduct(product)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t.products.deleteConfirm)) return

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error deleting product: ' + error.message)
    } else {
      fetchProducts()
    }
  }

  const handleSave = () => {
    setIsModalOpen(false)
    fetchProducts()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center space-x-2 text-gray-600">
          <Package className="w-5 h-5" />
          <span className="text-sm">{products.length} {t.products.productsCount}</span>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>{t.products.addProduct}</span>
        </button>
      </div>

      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{t.products.noProducts}</p>
          <button
            onClick={handleAdd}
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            {t.products.addFirstProduct}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <ProductModal
          product={editingProduct}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

