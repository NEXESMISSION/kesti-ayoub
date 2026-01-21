/**
 * Script to create a user account in Supabase
 * Run this with: node scripts/create-user.js
 * 
 * Note: This requires the service_role key which should NEVER be exposed in client-side code
 * This is for one-time setup only
 */

const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY // You need to add this to .env.local

if (!serviceRoleKey) {
  console.error('Error: SUPABASE_SERVICE_ROLE_KEY is required in .env.local')
  console.log('Please add your service_role key to .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

async function createUser() {
  const email = 'ayoub@gmail.com'
  const password = 'TempPassword123!' // Change this after first login
  const userId = '98e5ee81-3721-4e05-89bf-f4910511d39b'

  try {
    // Create user via Auth Admin API
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        // You can add custom metadata here
      }
    })

    if (error) {
      console.error('Error creating user:', error.message)
      return
    }

    console.log('User created successfully!')
    console.log('Email:', email)
    console.log('User ID:', data.user.id)
    console.log('\n⚠️  IMPORTANT: Change the password after first login!')
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

createUser()

