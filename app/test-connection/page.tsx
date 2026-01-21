'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function TestConnectionPage() {
  const [status, setStatus] = useState('Testing...')
  const [details, setDetails] = useState<any>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        const supabase = createClient()
        
        // Test 1: Check env vars
        const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
        const hasKey = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
        
        if (!hasUrl || !hasKey) {
          setStatus('❌ Environment variables missing')
          setDetails({ hasUrl, hasKey })
          return
        }

        // Test 2: Try to get session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession()
        
        // Test 3: Try to list users (this will fail but shows if connection works)
        const { error: testError } = await supabase.from('products').select('count').limit(0)
        
        setStatus('✅ Connection successful!')
        setDetails({
          envVars: { hasUrl, hasKey },
          session: session ? 'Active session' : 'No session',
          sessionError: sessionError?.message,
          dbError: testError?.message,
          url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        })
      } catch (error: any) {
        setStatus('❌ Connection failed')
        setDetails({ error: error.message })
      }
    }

    testConnection()
  }, [])

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow p-6">
        <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>
        <div className="mb-4">
          <p className="text-lg font-semibold">{status}</p>
        </div>
        {details && (
          <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
            {JSON.stringify(details, null, 2)}
          </pre>
        )}
        <div className="mt-6">
          <a href="/auth/login" className="text-primary-600 hover:underline">
            ← Back to Login
          </a>
        </div>
      </div>
    </div>
  )
}

