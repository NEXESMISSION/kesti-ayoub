'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Home, Package, ShoppingCart, Receipt, CreditCard, BarChart3, LogOut } from 'lucide-react'
import { useTranslation } from '@/components/TranslationProvider'

export default function Navbar() {
  const router = useRouter()
  const t = useTranslation()

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/auth/login')
    router.refresh()
  }

  const navItems = [
    { href: '/dashboard', icon: Home, label: t.nav.dashboard },
    { href: '/products', icon: Package, label: t.nav.products },
    { href: '/sales', icon: ShoppingCart, label: t.nav.sales },
    { href: '/expenses', icon: Receipt, label: t.nav.expenses },
    { href: '/credits', icon: CreditCard, label: t.nav.credits },
    { href: '/finance', icon: BarChart3, label: t.nav.finance },
  ]

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-1 overflow-x-auto">
            {navItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-primary-600 transition-colors whitespace-nowrap"
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </Link>
              )
            })}
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="hidden sm:inline">{t.nav.logout}</span>
          </button>
        </div>
      </div>
    </nav>
  )
}

