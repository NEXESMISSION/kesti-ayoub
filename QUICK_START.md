# Quick Start Guide

## ✅ Step 1: Environment Setup

The `.env.local` file has been created with your Supabase credentials. If you need to recreate it, copy from `.env.local.template`:

```env
NEXT_PUBLIC_SUPABASE_URL=https://lpnzuhbhalkphiysffac.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwbnp1aGJoYWxrcGhpeXNmZmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzIyNTcsImV4cCI6MjA4NDYwODI1N30.NbPL6pKvIB5qkQY3KNw8NTIS770hM_mWmh1vfTmfd8A
```

## ✅ Step 2: Database Setup

1. Go to your Supabase project: https://supabase.com/dashboard/project/lpnzuhbhalkphiysffac
2. Navigate to **SQL Editor**
3. Run `supabase/schema.sql` first (creates all tables, triggers, functions)
4. Then run `supabase/rls_policies.sql` (enables Row Level Security)

## ✅ Step 3: Create User Account

### Option A: Through Supabase Dashboard (Recommended)

1. Go to **Authentication** > **Users** in your Supabase dashboard
2. Click **Add User** > **Create new user**
3. Enter:
   - Email: `ayoub@gmail.com`
   - Password: (choose a secure password)
   - Auto Confirm User: ✅ (checked)
4. Click **Create User**

### Option B: Through the Application

1. Start the dev server: `npm run dev`
2. Go to `http://localhost:3000/auth/signup`
3. Sign up with `ayoub@gmail.com` and a password

## ✅ Step 4: Run the Application

```bash
# Install dependencies (if not done)
npm install

# Start development server
npm run dev
```

The app will run on **http://localhost:3000**

## ✅ Step 5: Build for Production

The project has been tested and builds successfully:

```bash
npm run build
```

## 🚀 Vercel Deployment

### Environment Variables in Vercel:

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add these variables:
   - `NEXT_PUBLIC_SUPABASE_URL` = `https://lpnzuhbhalkphiysffac.supabase.co`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imxwbnp1aGJoYWxrcGhpeXNmZmFjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjkwMzIyNTcsImV4cCI6MjA4NDYwODI1N30.NbPL6pKvIB5qkQY3KNw8NTIS770hM_mWmh1vfTmfd8A`
4. Redeploy your application

## 📝 Notes

- The app is configured to run on **localhost:3000** in development
- All pages are set to `dynamic = 'force-dynamic'` for proper Supabase integration
- The build is clean with no errors
- Mobile-first responsive design is implemented throughout

