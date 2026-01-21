'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { useTranslation } from '@/components/TranslationProvider'

export default function LoginPage() {
  const t = useTranslation()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const hasChecked = useRef(false)

  // Check if user is already logged in (only once)
  useEffect(() => {
    if (hasChecked.current) return
    hasChecked.current = true

    const supabase = createClient()
    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) {
          console.log('Session exists, redirecting...')
          window.location.replace('/dashboard')
        }
      } catch (error) {
        console.error('Error checking session:', error)
      }
    }
    
    checkSession()
  }, [])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      
      // Check if environment variables are set
      if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        setError('Configuration error: Supabase credentials not found')
        setLoading(false)
        return
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.error('Login error:', error)
        setError(error.message || 'Invalid email or password')
        setLoading(false)
      } else if (data?.user && data?.session) {
        // Successfully logged in
        console.log('Login successful:', data.user.email)
        console.log('Session received:', {
          access_token: data.session.access_token ? 'Present' : 'Missing',
          refresh_token: data.session.refresh_token ? 'Present' : 'Missing',
          expires_at: new Date(data.session.expires_at! * 1000).toLocaleString()
        })
        
        // The session should be automatically stored by createBrowserClient
        // Wait a moment for it to be set, then verify
        await new Promise(resolve => setTimeout(resolve, 500))
        
        const { data: { session: verifySession }, error: sessionError } = await supabase.auth.getSession()
        console.log('Session verification:', {
          stored: verifySession ? 'Yes ✓' : 'No ✗',
          error: sessionError?.message,
          cookies: document.cookie.split('; ').filter(c => c.includes('sb-')).length + ' Supabase cookies'
        })
        
        if (verifySession) {
          // Redirect after ensuring session is stored
          console.log('Redirecting to dashboard in 1 second...')
          setTimeout(() => {
            window.location.href = '/dashboard'
          }, 1000)
        } else {
          console.error('Session not stored! Error:', sessionError)
          setError('Session not stored. Please check browser console and try again.')
          setLoading(false)
        }
      } else {
        setError('Login failed. No user data received.')
        setLoading(false)
      }
    } catch (err: any) {
      console.error('Unexpected login error:', err)
      setError(err.message || 'An unexpected error occurred. Please try again.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-gray-900">
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-900">
            {t.auth.welcomeBack}
          </h1>
          <p className="text-center text-gray-700 mb-8">{t.auth.signInToAccount}</p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              <strong>{t.common.error}:</strong> {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
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

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t.auth.signingIn : t.auth.signIn}
            </button>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            {t.auth.dontHaveAccount}{' '}
            <Link href="/auth/signup" className="text-primary-600 hover:text-primary-700 font-semibold">
              {t.auth.signUp}
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
