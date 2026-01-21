# Troubleshooting Guide

## Login Issues

### Problem: Stuck on "Signing in..."

**Possible Causes:**
1. User account doesn't exist in Supabase
2. Wrong password
3. Email not confirmed
4. Environment variables not loaded

**Solutions:**

1. **Check if user exists:**
   - Go to Supabase Dashboard → Authentication → Users
   - Look for `ayoub@gmail.com`
   - If it doesn't exist, create it:
     - Click "Add User" → "Create new user"
     - Email: `ayoub@gmail.com`
     - Set password
     - ✅ Check "Auto Confirm User"

2. **Try signing up instead:**
   - Go to `/auth/signup`
   - Create a new account with `ayoub@gmail.com`
   - This will create the user if it doesn't exist

3. **Check environment variables:**
   - Verify `.env.local` exists in the root directory
   - Check it contains:
     ```
     NEXT_PUBLIC_SUPABASE_URL=https://lpnzuhbhalkphiysffac.supabase.co
     NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
     ```
   - Restart the dev server after creating/modifying `.env.local`

4. **Check browser console:**
   - Open browser DevTools (F12)
   - Check Console tab for any errors
   - Check Network tab to see if API calls are failing

5. **Clear browser cache:**
   - Clear cookies and cache
   - Try in incognito/private mode

### Problem: "Invalid email or password"

- Verify the password is correct
- If you created the user via Supabase Dashboard, make sure you set the password correctly
- Try resetting the password in Supabase Dashboard

### Problem: "Email not confirmed"

- Go to Supabase Dashboard → Authentication → Users
- Find your user
- Click "Confirm Email" or check "Auto Confirm User" when creating

## Database Issues

### Problem: Tables don't exist

1. Go to Supabase SQL Editor
2. Run `supabase/schema.sql` completely
3. Verify tables exist: Go to Table Editor in Supabase Dashboard

### Problem: "Permission denied" errors

1. Make sure you ran `supabase/rls_policies.sql`
2. Check Row Level Security is enabled on all tables
3. Verify policies are created correctly

## Development Server Issues

### Problem: Server won't start

1. Make sure `.env.local` exists
2. Check port 3000 is not in use
3. Try: `npm run dev -- -p 3001` to use a different port

### Problem: Changes not reflecting

1. Clear `.next` folder: `Remove-Item -Recurse -Force .next`
2. Restart dev server
3. Hard refresh browser (Ctrl+Shift+R)

## Build Issues

### Problem: Build fails

1. Clear cache: `npm cache clean --force`
2. Delete `.next` folder
3. Reinstall: `rm -rf node_modules && npm install`
4. Try build again: `npm run build`

