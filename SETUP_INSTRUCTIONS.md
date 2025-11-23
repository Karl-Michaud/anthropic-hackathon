# 🚀 Authentication & Database Sync - Setup Instructions

## ✅ What's Been Implemented

All code has been written and is ready to use! Here's what we built:

### 1. **Database Schema** ✅
- Created `whiteboard_data` table with user isolation
- Stores entire localStorage state as JSON (cells, scholarships, essays, etc.)
- Row Level Security (RLS) policies for data protection
- `is_first_time_user` flag for onboarding

### 2. **Authentication** ✅
- Google OAuth
- GitHub OAuth
- Email/Password auth
- Landing page with auth UI
- Protected routes
- Logout functionality

### 3. **Database Sync** ✅
- Automatic background sync (debounced 3s)
- localStorage takes priority
- Database fallback if localStorage cleared
- Real-time sync status indicator

### 4. **UI Components** ✅
- Landing page with auth forms
- Sync status indicator
- Logout button in navigation
- Loading states

---

## 📋 Setup Steps (You Need to Do This!)

### Step 1: Run Database Migration

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Navigate to **SQL Editor**
3. Open the file: `/Users/karlosins/anthropic-hackathon/supabase_migration.sql`
4. Copy the entire contents
5. Paste into Supabase SQL Editor
6. Click **Run** to execute the migration

✅ This creates the `whiteboard_data` table and sets up security policies.

---

### Step 2: Configure OAuth Providers

#### Enable Google OAuth:
1. In Supabase Dashboard → **Authentication** → **Providers**
2. Find **Google** and click to expand
3. Toggle **Enable Sign in with Google**
4. You'll need to create a Google OAuth app:
   - Go to [Google Cloud Console](https://console.cloud.google.com)
   - Create a new project (or use existing)
   - Enable Google+ API
   - Create OAuth 2.0 credentials
   - Add authorized redirect URI: `https://[YOUR-SUPABASE-PROJECT].supabase.co/auth/v1/callback`
5. Copy **Client ID** and **Client Secret** to Supabase
6. Save

#### Enable GitHub OAuth:
1. In Supabase Dashboard → **Authentication** → **Providers**
2. Find **GitHub** and click to expand
3. Toggle **Enable Sign in with GitHub**
4. You'll need to create a GitHub OAuth app:
   - Go to GitHub Settings → Developer settings → OAuth Apps
   - Click **New OAuth App**
   - Set Authorization callback URL: `https://[YOUR-SUPABASE-PROJECT].supabase.co/auth/v1/callback`
5. Copy **Client ID** and **Client Secret** to Supabase
6. Save

#### Enable Email Auth:
1. In Supabase Dashboard → **Authentication** → **Providers**
2. Find **Email** and ensure it's enabled
3. For hackathon purposes, you can disable email confirmation:
   - Go to **Authentication** → **URL Configuration**
   - Uncheck "Enable email confirmations" (optional, for easier testing)

---

### Step 3: Set Environment Variables

Create or update `/Users/karlosins/anthropic-hackathon/app/.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://unrmstvnrsqhwfbixjnv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key-here>
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVucm1zdHZucnNxaHdmYml4am52Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzMzNjE2NiwiZXhwIjoyMDc4OTEyMTY2fQ.71e3QnfBitFsj0QQQUPPxExad40VVOPin0hRSyyVC_Q
```

**To get your ANON KEY:**
1. Go to Supabase Dashboard → **Settings** → **API**
2. Copy the `anon` `public` key
3. Paste it in the `.env.local` file

---

### Step 4: Start the Development Server

```bash
cd /Users/karlosins/anthropic-hackathon/app
npm run dev
```

Navigate to: http://localhost:3000

---

## 🧪 Testing the Implementation

### Test 1: Sign Up with Email
1. Go to http://localhost:3000
2. You should see the Landing Page
3. Click "Sign Up" tab
4. Enter email and password (min 6 characters)
5. Click "Sign Up"
6. You should be redirected to `/whiteboard`

### Test 2: OAuth Login (Google)
1. Go to http://localhost:3000
2. Click "Continue with Google"
3. Complete Google OAuth flow
4. You should be redirected to `/whiteboard`

### Test 3: OAuth Login (GitHub)
1. Go to http://localhost:3000
2. Click "Continue with GitHub"
3. Complete GitHub OAuth flow
4. You should be redirected to `/whiteboard`

### Test 4: Database Sync
1. Log in to the whiteboard
2. Create a scholarship or add a sticky note
3. Watch the sync status indicator (bottom right)
   - Should show "Syncing..." briefly
   - Then show "Synced ✓" for 2 seconds
4. Open browser DevTools → Network tab
5. You should see a request to `/rest/v1/whiteboard_data`

### Test 5: Logout
1. While logged in, click the logout button (bottom of left sidebar)
2. You should be redirected to the landing page
3. Try to navigate to `/whiteboard` directly
4. You should be redirected back to landing page

### Test 6: Data Persistence
1. Log in and create some data
2. Wait for sync to complete ("Synced ✓")
3. Clear browser localStorage:
   - Open DevTools → Application → Local Storage
   - Delete all items
4. Refresh the page
5. Your data should be restored from the database!

### Test 7: Dark Mode with Auth UI
1. Before logging in, toggle dark mode
2. The landing page should respect dark mode
3. Auth forms should have proper dark styling
4. Log in and confirm whiteboard also has dark mode

---

## 🔍 Troubleshooting

### Issue: "Invalid login credentials"
- **Solution**: Make sure you're using the correct email/password
- Try signing up instead of logging in
- Check Supabase auth logs for detailed error

### Issue: OAuth redirect not working
- **Solution**: Verify redirect URLs are configured correctly:
  - Development: `http://localhost:3000/auth/callback`
  - Production: `https://yourdomain.com/auth/callback`

### Issue: RLS policy blocking queries
- **Solution**: Check Supabase logs in Dashboard → **Logs** → **Auth Logs**
- Verify user is actually logged in (check `auth.uid()` in SQL Editor)
- Test RLS policies with SQL Editor

### Issue: Sync not working
- **Solution**:
  - Check browser console for errors
  - Verify `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are set
  - Check Network tab for failed requests

### Issue: Landing page not showing
- **Solution**:
  - Make sure you're logged out
  - Clear cookies and localStorage
  - Restart dev server

---

## 📁 Files Created/Modified

### New Files:
- `supabase_migration.sql` - Database migration
- `app/lib/supabase/queries.ts` - Database queries
- `app/lib/syncManager.ts` - Sync logic
- `app/components/auth/AuthProvider.tsx` - Auth context
- `app/components/auth/AuthForm.tsx` - Login/signup forms
- `app/components/auth/LandingPage.tsx` - Landing page
- `app/components/SyncStatusIndicator.tsx` - Sync status UI
- `app/auth/callback/route.ts` - OAuth callback handler
- `app/whiteboard/page.tsx` - Protected whiteboard route

### Modified Files:
- `app/app/layout.tsx` - Added AuthProvider wrapper
- `app/app/page.tsx` - Landing page or redirect logic
- `app/app/context/WhiteboardContext.tsx` - Added sync integration
- `app/app/components/Whiteboard.tsx` - Added sync indicator
- `app/app/components/Navigation.tsx` - Added logout button

---

## 🎉 You're Done!

Once you complete the setup steps, you'll have:
- ✅ Full authentication (Google, GitHub, Email)
- ✅ Automatic database backup
- ✅ Data persistence across devices
- ✅ User isolation (everyone sees only their data)
- ✅ Beautiful landing page
- ✅ Real-time sync status

**Next Steps:**
- Test all auth flows
- Deploy to Vercel/Netlify
- Add email verification (optional)
- Add password reset (optional)
- Show onboarding for first-time users

---

## 📞 Need Help?

Check:
1. Supabase Dashboard → Auth Logs
2. Browser DevTools → Console
3. Browser DevTools → Network tab
4. Supabase Dashboard → Database → Table Editor (see `whiteboard_data` table)

Good luck with your hackathon! 🚀
