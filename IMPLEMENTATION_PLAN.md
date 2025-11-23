# 🚀 Authentication & Database Sync Implementation Plan

## Overview
Add user authentication (Google/GitHub/Email) and database backup for whiteboard data.

**Goal**: Save user's localStorage data to database as backup. If localStorage is cleared, restore from database.

---

## 📋 Requirements Summary

- **Auth Methods**: Google OAuth, GitHub OAuth, Email/Password
- **UI Style**: Minimal, matches whiteboard aesthetic
- **Data Migration**: None - fresh start with auth
- **Sync Strategy**: Debounced auto-save (3s after last change)
- **Conflict Resolution**: localStorage takes priority, overwrite DB
- **User Model**: One whiteboard per user

---

## 🗄️ Phase 1: Database Schema Updates

### 1.1 Migration SQL Script

**Simple Approach**: One table to store entire whiteboard state as JSON (mirrors localStorage)

```sql
-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create whiteboard_data table - stores entire localStorage state as JSON
CREATE TABLE whiteboard_data (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,

  -- Store entire whiteboard state (matches localStorage structure)
  cells JSONB DEFAULT '[]'::jsonb,
  scholarships JSONB DEFAULT '[]'::jsonb,
  essays JSONB DEFAULT '[]'::jsonb,
  json_outputs JSONB DEFAULT '[]'::jsonb,
  block_positions JSONB DEFAULT '[]'::jsonb,

  -- Track first-time users
  is_first_time_user BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE whiteboard_data ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Users can only access their own whiteboard
CREATE POLICY "Users can view own whiteboard" ON whiteboard_data
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own whiteboard" ON whiteboard_data
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own whiteboard" ON whiteboard_data
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own whiteboard" ON whiteboard_data
  FOR DELETE USING (auth.uid() = user_id);

-- Create index for performance
CREATE INDEX idx_whiteboard_data_user_id ON whiteboard_data(user_id);
```

**Note**: We're NOT using the existing scholarship/essay tables. Just backing up localStorage as-is.

### 1.2 Supabase Auth Configuration
- Enable Google OAuth provider
- Enable GitHub OAuth provider
- Enable Email provider
- Configure redirect URLs

---

## 🎨 Phase 2: Authentication UI Components

### 2.1 Files to Create

#### `app/components/auth/AuthProvider.tsx`
```typescript
- Wrap app with Supabase auth context
- Provide user state, loading state, auth methods
- Handle auth state changes
```

#### `app/components/auth/LandingPage.tsx`
```typescript
- Minimal, whiteboard-themed design
- Logo/title at top
- Auth forms in center
- Dotted background (match whiteboard)
- Smooth animations
```

#### `app/components/auth/AuthForm.tsx`
```typescript
- Tab switcher: Login / Sign Up
- Email/Password fields
- Social auth buttons (Google, GitHub)
- Error handling
- Loading states
```

#### `app/components/auth/ProtectedRoute.tsx`
```typescript
- Redirect to landing if not authenticated
- Show loading spinner while checking auth
```

### 2.2 Styling
- Use existing design system colors
- Match whiteboard dotted background
- Glassmorphism for form cards
- Smooth transitions
- Dark mode support (existing context)

---

## 🔄 Phase 3: Database Sync Implementation

### 3.1 Files to Create/Update

#### `app/lib/syncManager.ts` (NEW)
```typescript
/**
 * Sync Manager: Handles bidirectional sync between localStorage and Supabase
 */

Features:
- Debounced save to database (3s after last change)
- Background fetch from database
- Conflict resolution (localStorage priority)
- Sync status tracking
- Error handling and retry logic

API:
- syncToDatabase(userId, whiteboardData)
- fetchFromDatabase(userId)
- getSyncStatus()
- forceSyncNow()
```

#### `app/context/WhiteboardContext.tsx` (UPDATE)
```typescript
Changes:
- Add userId to context
- Integrate syncManager
- Auto-sync on data changes (debounced)
- Fetch from DB on mount (background)
- Add sync status to context
```

#### `app/lib/supabase/queries.ts` (NEW)
```typescript
/**
 * Database query helpers - SIMPLE!
 */

Functions (only 3 needed):
- getWhiteboardData(userId) → Returns entire whiteboard state + is_first_time_user
- saveWhiteboardData(userId, whiteboardState) → Saves entire whiteboard state
- markUserAsReturning(userId) → Sets is_first_time_user = false

Flow:
1. On first login: is_first_time_user = true (show onboarding/tutorial)
2. On second session: Set is_first_time_user = false
3. Future sessions: is_first_time_user = false (skip onboarding)
```

### 3.2 Sync Flow

```
User makes change
    ↓
Save to localStorage (immediate)
    ↓
Trigger debounced sync (3s timer)
    ↓
If no more changes after 3s → Save to DB
    ↓
Update sync status UI
```

### 3.3 Initial Load Flow

```
User logs in
    ↓
Show loading spinner briefly
    ↓
Fetch from database in background
    ↓
Check is_first_time_user flag
    ↓
If is_first_time_user = true:
  - Show onboarding/tutorial (optional)
  - Load localStorage if exists, else start fresh
  - Mark as returning user (set is_first_time_user = false)
    ↓
If is_first_time_user = false:
  - Load from localStorage first (instant)
  - If localStorage empty → Restore from DB
  - If both exist → Use localStorage (priority)
    ↓
Render whiteboard immediately
    ↓
Done - background sync active
```

---

## 🛣️ Phase 4: Routing & Navigation

### 4.1 Route Structure

```
/                           → Landing page (unauthenticated)
                             OR redirect to /whiteboard (authenticated)

/whiteboard                 → Protected route - main whiteboard app

/auth/callback              → OAuth callback handler

/api/auth/*                 → Supabase auth API routes
```

### 4.2 Files to Create/Update

#### `app/page.tsx` (UPDATE)
```typescript
- Check if user is authenticated
- If yes: redirect to /whiteboard
- If no: show LandingPage component
```

#### `app/whiteboard/page.tsx` (NEW)
```typescript
- Protected route (requires auth)
- Import and render <Whiteboard />
- Show loading state while auth checking
```

#### `app/middleware.ts` (UPDATE)
```typescript
- Protect /whiteboard route
- Redirect to / if not authenticated
- Handle auth session refresh
```

---

## 🔐 Phase 5: Environment & Configuration

### 5.1 Environment Variables

```bash
# .env.local
NEXT_PUBLIC_SUPABASE_URL=https://unrmstvnrsqhwfbixjnv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>

# OAuth redirect URL (configure in Supabase dashboard)
# http://localhost:3000/auth/callback (dev)
# https://yourdomain.com/auth/callback (prod)
```

### 5.2 Supabase Client Setup

#### Update `app/utils/supabase/client.ts`
```typescript
- Already exists
- Ensure proper configuration
```

#### Update `app/utils/supabase/server.ts`
```typescript
- Server-side Supabase client
- For API routes and SSR
```

---

## 📦 Phase 6: Dependencies

### 6.1 Required Packages (Already Installed)
```json
{
  "@supabase/ssr": "^0.x.x",
  "@supabase/supabase-js": "^2.x.x"
}
```

### 6.2 Additional Packages (If Needed)
```bash
# None - we already have Supabase installed
```

---

## ✅ Phase 7: Implementation Checklist

### Database Setup
- [ ] Run migration SQL in Supabase SQL Editor
- [ ] Verify tables created correctly
- [ ] Test RLS policies
- [ ] Create indexes

### Auth Configuration
- [ ] Enable Google OAuth in Supabase
- [ ] Enable GitHub OAuth in Supabase
- [ ] Configure redirect URLs
- [ ] Test OAuth flows

### Frontend - Auth UI
- [ ] Create `AuthProvider.tsx`
- [ ] Create `LandingPage.tsx`
- [ ] Create `AuthForm.tsx`
- [ ] Create `ProtectedRoute.tsx`
- [ ] Update `app/page.tsx`
- [ ] Create `app/whiteboard/page.tsx`
- [ ] Update layout.tsx to wrap with AuthProvider

### Frontend - Sync Logic
- [ ] Create `syncManager.ts`
- [ ] Create `supabase/queries.ts`
- [ ] Update `WhiteboardContext.tsx` for sync
- [ ] Add sync status indicator UI
- [ ] Test debounced save
- [ ] Test background fetch

### Routing & Middleware
- [ ] Update `middleware.ts` for route protection
- [ ] Create OAuth callback handler
- [ ] Test authenticated/unauthenticated flows

### Testing
- [ ] Test signup flow (email)
- [ ] Test login flow (email)
- [ ] Test Google OAuth
- [ ] Test GitHub OAuth
- [ ] Test logout
- [ ] Test data persistence after refresh
- [ ] Test sync when offline/online
- [ ] Test multi-device sync
- [ ] Test dark mode with auth UI

### Polish
- [ ] Add loading states
- [ ] Add error messages
- [ ] Add success messages
- [ ] Add "Syncing..." indicator
- [ ] Add "Synced ✓" indicator
- [ ] Smooth transitions
- [ ] Mobile responsive auth UI

---

## 🎯 Implementation Order

1. **Database** (15 min)
   - Run migration SQL
   - Configure OAuth providers

2. **Auth UI** (45 min)
   - AuthProvider
   - LandingPage
   - AuthForm components

3. **Routing** (20 min)
   - Update page.tsx
   - Create whiteboard/page.tsx
   - Update middleware

4. **Sync Logic** (40 min)
   - syncManager.ts
   - queries.ts
   - Update WhiteboardContext

5. **Testing & Polish** (30 min)
   - Test all flows
   - Add loading states
   - Fix bugs
   - UI polish

**Total Estimated Time: ~2.5 hours**

---

## 🚨 Potential Issues & Solutions

### Issue 1: User has old localStorage data
**Solution**: Clear localStorage on first auth, start fresh

### Issue 2: Sync conflicts
**Solution**: localStorage always wins, overwrite DB

### Issue 3: Slow initial load
**Solution**: Show whiteboard immediately from localStorage, fetch DB in background

### Issue 4: OAuth redirect issues
**Solution**: Ensure redirect URLs configured correctly in Supabase dashboard

### Issue 5: RLS policies blocking queries
**Solution**: Test policies with Supabase SQL Editor, ensure auth.uid() works

---

## 🎨 Design Specs

### Landing Page
```
- Background: Dotted grid (match whiteboard)
- Center card: Glassmorphism effect
- Colors: Match existing design system
- Font: Match existing (likely Inter or similar)
- Animations: Fade in, smooth hover effects
- Mobile: Stack form, full width buttons
```

### Auth Form
```
- Tab switcher: Login / Sign Up
- Input fields: Email, Password
- Buttons:
  - Primary: "Continue with Email"
  - Social: "Continue with Google" (Google colors)
  - Social: "Continue with GitHub" (GitHub colors)
- Error messages: Red text below inputs
- Loading: Disabled state + spinner
```

### Sync Indicator
```
- Position: Top right or bottom right
- States:
  - "Syncing..." (animated dots)
  - "Synced ✓" (green checkmark)
  - "Sync failed ⚠" (yellow warning)
- Auto-hide after 2s when synced
```

---

## 📝 Notes

- Keep auth UI minimal - users want to get to the whiteboard ASAP
- Prioritize UX: instant load from localStorage, background sync
- Don't block user interactions while syncing
- Handle network errors gracefully
- Clear error messages for auth failures
- Add logout button in Navigation component
- Consider adding user profile menu later

---

---

**Ready to implement! 🚀**

## Scope Limits (NOT Building)
- ❌ Multiple whiteboards per user
- ❌ Sharing whiteboards
- ❌ Real-time collaboration
- ❌ Export to PDF
- ❌ Templates
- ❌ Email verification
- ❌ Password reset
- ❌ User profiles

**We're building ONLY:** Auth + Database backup of localStorage
