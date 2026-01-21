'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/components/TranslationProvider'

export default function SignupPage() {
  const t = useTranslation()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    if (password !== confirmPassword) {
      setError('كلمات المرور غير متطابقة')
      setLoading(false)
      return
    }

    if (password.length < 6) {
      setError('يجب أن تكون كلمة المرور 6 أحرف على الأقل')
      setLoading(false)
      return
    }

    try {
      const supabase = createClient()
      
      // Check if environment variables are set
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setError('Configuration error: Supabase credentials not found')
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/dashboard`,
        },
      })

      if (error) {
        console.error('Signup error:', error)
        setError(error.message || 'Failed to create account')
        setLoading(false)
      } else if (data?.user) {
        console.log('Signup successful:', data.user.email)
        // Use window.location for a full page reload
        window.location.href = '/dashboard'
      } else {
        setError('Signup failed. Please try again.')
        setLoading(false)
      }
    } catch (err: any) {
      console.error('Unexpected signup error:', err)
      setError(err.message || 'An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
            {t.auth.createAccount}
          </h1>
          <p className="text-center text-gray-600 mb-8">{t.auth.startTracking}</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSignup} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                {t.auth.email}
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder={t.auth.email}
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                {t.auth.password}
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="••••••••"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                {t.auth.confirmPassword}
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t.auth.creatingAccount : t.auth.signUp}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t.auth.alreadyHaveAccount}{' '}
            <Link href="/auth/login" className="text-primary-600 hover:text-primary-700 font-semibold">
              {t.auth.signIn}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

