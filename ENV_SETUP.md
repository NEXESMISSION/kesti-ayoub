# Environment Setup Guide

## Step 1: Create .env.local file

Create a file named `.env.local` in the root directory with the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=https://lpnzuhbhalkphiysffac.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwbnp1aGJoYWxrcGhpeXNmZmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzIyNTcsImV4cCI6MjA4NDYwODI1N30.NbPL6pKvIB5qkQY3KNw8NTIS770hM_mWmh1vfTmfd8A
```

**Important**: The `.env.local` file is already in `.gitignore` so it won't be committed to git.

## Step 2: Create User Account

### Option A: Through Supabase Dashboard (Recommended)

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** > **Users**
3. Click **Add User** > **Create new user**
4. Enter:
   - Email: `ayoub@gmail.com`
   - Password: (choose a secure password)
   - Auto Confirm User: ✅ (checked)
5. Click **Create User**

### Option B: Through the Application

1. Start the development server: `npm run dev`
2. Navigate to `http://localhost:3000/auth/signup`
3. Sign up with `ayoub@gmail.com` and a password
4. Check your email for confirmation (or use auto-confirm in Supabase settings)

### Option C: Using SQL (Advanced)

If you need to set a specific UID, you can use the Supabase SQL Editor, but this is not recommended as it bypasses the Auth system.

## Step 3: Verify Setup

1. Run `npm run dev`
2. The app should start on `http://localhost:3000`
3. Try logging in with the created account

## Vercel Deployment

When deploying to Vercel:

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://lpnzuhbhalkphiysffac.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwbnp1aGJoYWxrcGhpeXNmZmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzIyNTcsImV4cCI6MjA4NDYwODI1N30.NbPL6pKvIB5qkQY3KNw8NTIS770hM_mWmh1vfTmfd8A`
4. Redeploy your application

