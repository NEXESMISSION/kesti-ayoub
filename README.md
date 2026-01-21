# Sales & Finance Tracking Web Application

A comprehensive web application for tracking sales, products, expenses, and financial obligations. Built with Next.js and Supabase.

## Features

- 🔐 User Authentication (Supabase Auth)
- 📦 Product Management
- 💰 Sales Tracking
- 💸 Expense Management
- 📊 Credit Tracking (Receivables & Payables)
- 📈 Finance Dashboard

## Quick Setup

**The `.env.local` file has been created with your Supabase credentials!**

### 1. Install Dependencies

```bash
npm install
```

### 2. Set up Database

1. Go to your Supabase project: https://supabase.com/dashboard/project/lpnzuhbhalkphiysffac
2. Navigate to **SQL Editor**
3. Run `supabase/schema.sql` first (creates all tables, triggers, functions)
4. Then run `supabase/rls_policies.sql` (enables Row Level Security)

### 3. Create User Account

**Option A: Through Supabase Dashboard (Recommended)**
1. Go to **Authentication** > **Users** in your Supabase dashboard
2. Click **Add User** > **Create new user**
3. Enter email: `ayoub@gmail.com`, set a password, check "Auto Confirm User"
4. Click **Create User**

**Option B: Through the Application**
1. Start the dev server: `npm run dev`
2. Go to `http://localhost:3000/auth/signup`
3. Sign up with `ayoub@gmail.com`

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

**Note**: The app runs on `localhost:3000` in development mode.

## Mobile-First Design

The application is designed with mobile devices as the primary target, ensuring optimal user experience on smartphones and tablets.

## Technology Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, RLS)
- **Hosting**: Vercel/Netlify ready

