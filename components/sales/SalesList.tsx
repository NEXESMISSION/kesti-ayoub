'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Sale, Product } from '@/lib/types'
import SaleCard from './SaleCard'
import SaleModal from './SaleModal'
import { Plus, ShoppingCart } from 'lucide-react'
import { format } from 'date-fns'
import { useTranslation } from '@/components/TranslationProvider'

export default function SalesList() {
  const t = useTranslation()
  const [sales, setSales] = useState<Sale[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSale, setEditingSale] = useState<Sale | null>(null)

  const supabase = createClient()

  const fetchSales = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('sales')
        .select(`
          *,
          product:products(*)
        `)
        .eq('user_id', user.id)
        .order('sale_date', { ascending: false })

      if (error) throw error
      setSales(data || [])
    } catch (error) {
      console.error('Error fetching sales:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchProducts = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('user_id', user.id)
        .order('name', { ascending: true })

      if (error) throw error
      setProducts(data || [])
    } catch (error) {
      console.error('Error fetching products:', error)
    }
  }

  useEffect(() => {
    fetchSales()
    fetchProducts()
  }, [])

  const handleAdd = () => {
    setEditingSale(null)
    setIsModalOpen(true)
  }

  const handleEdit = (sale: Sale) => {
    setEditingSale(sale)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm(t.sales.deleteConfirm)) return

    const { error } = await supabase
      .from('sales')
      .delete()
      .eq('id', id)

    if (error) {
      alert('Error deleting sale: ' + error.message)
    } else {
      fetchSales()
      fetchProducts()
    }
  }

  const handleSave = () => {
    setIsModalOpen(false)
    fetchSales()
    fetchProducts()
  }

  const totalRevenue = sales.reduce((sum, sale) => sum + (sale.sale_price * sale.quantity), 0)

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
            <ShoppingCart className="w-5 h-5" />
            <span className="text-sm">{sales.length} {t.sales.salesCount}</span>
          </div>
          <div className="text-sm">
            <span className="text-gray-600">{t.sales.totalRevenue}: </span>
            <span className="font-semibold text-green-600">{totalRevenue.toFixed(2)} TD</span>
          </div>
        </div>
        <button
          onClick={handleAdd}
          className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 transition-colors w-full sm:w-auto justify-center"
        >
          <Plus className="w-4 h-4" />
          <span>{t.sales.recordSale}</span>
        </button>
      </div>

      {sales.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
          <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{t.sales.noSales}</p>
          <button
            onClick={handleAdd}
            className="text-primary-600 hover:text-primary-700 font-semibold"
          >
            {t.sales.recordFirstSale}
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {sales.map((sale) => (
            <SaleCard
              key={sale.id}
              sale={sale}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <SaleModal
          sale={editingSale}
          products={products}
          onClose={() => setIsModalOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}

