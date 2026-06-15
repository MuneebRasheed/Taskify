# Fix RLS Permission Issue for Push Tokens

## Problem
Getting error when trying to save push token:
```
ERROR [Push Notifications] ❌ Failed to save token to database: 
{"code": "42501", "details": null, "hint": null, "message": "permission denied for table profiles"}
```

## Root Cause
The Row Level Security (RLS) policies or table permissions in your actual Supabase database may not be properly configured for the `profiles` table.

## Solution: Run SQL Migration in Supabase

### Step 1: Open Supabase SQL Editor

1. Go to your **Supabase Dashboard**: https://app.supabase.com
2. Select your **Taskify project**
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run This SQL Script

Copy and paste this entire SQL script and run it:

```sql
-- Fix RLS policies for profiles table to allow expo_push_token updates
-- This ensures authenticated users can update their own push tokens

-- Drop existing policies to recreate them
drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

-- Recreate policies with explicit permissions
create policy "Users can read own profile"
on public.profiles
for select
to authenticated
using (auth.uid() = id);

create policy "Users can insert own profile"
on public.profiles
for insert
to authenticated
with check (auth.uid() = id);

create policy "Users can update own profile"
on public.profiles
for update
to authenticated
using (auth.uid() = id)
with check (auth.uid() = id);

-- Verify RLS is enabled
alter table public.profiles enable row level security;

-- Grant necessary permissions to authenticated users
grant select, insert, update on public.profiles to authenticated;

-- Verify the index exists for expo_push_token
create index if not exists idx_profiles_expo_push_token on public.profiles(expo_push_token);
```

### Step 3: Verify the Fix

After running the SQL:

1. **Check the policies exist:**
   - Go to **Database** → **Tables** → **profiles**
   - Click on **Policies** tab
   - You should see 3 policies:
     - "Users can read own profile" (SELECT)
     - "Users can insert own profile" (INSERT)
     - "Users can update own profile" (UPDATE)

2. **Test in your app:**
   - Restart your app
   - Sign in
   - Check console logs - should now show success:
     ```
     [Push Notifications] ✅ Token successfully saved to database
     ```

3. **Verify in database:**
   - Go to **Table Editor** → **profiles**
   - Find your user row
   - Check `expo_push_token` column has the token

## Alternative: Check Existing Policies

If you want to check what policies currently exist, run:

```sql
-- View all policies on profiles table
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';
```

## Alternative: Check Table Permissions

Check if authenticated role has permissions:

```sql
-- View table permissions
SELECT 
  grantee, 
  privilege_type 
FROM information_schema.role_table_grants 
WHERE table_name = 'profiles' 
  AND table_schema = 'public';
```

You should see:
- `authenticated` role with `SELECT`, `INSERT`, `UPDATE` privileges

## Common Issues

### Issue 1: Policies Don't Exist
**Solution:** Run the SQL script above

### Issue 2: RLS is Disabled
**Solution:** Run:
```sql
alter table public.profiles enable row level security;
```

### Issue 3: Missing Permissions
**Solution:** Run:
```sql
grant select, insert, update on public.profiles to authenticated;
```

### Issue 4: Profile Row Doesn't Exist
**Check:**
```sql
SELECT id, email, expo_push_token 
FROM profiles 
WHERE id = auth.uid();
```

If no row, the trigger should create it. If not, run:
```sql
insert into public.profiles (id, email, created_at, updated_at)
select id, email, now(), now()
from auth.users
where id = auth.uid()
on conflict (id) do nothing;
```

## Testing After Fix

### Test 1: Sign In and Check Logs
```
Expected console output:
✅ [Push Notifications] Starting registration for user: [user-id]
✅ [Push Notifications] Current permissions: { status: "granted", ... }
✅ [Push Notifications] Token obtained: ExponentPushToken[...]
✅ [Push Notifications] Token successfully saved to database for user: [user-id]
```

### Test 2: Query Database
```sql
-- Replace with your user ID
SELECT 
  id, 
  email, 
  expo_push_token, 
  updated_at 
FROM profiles 
WHERE id = '[your-user-id]';
```

Should return:
- `expo_push_token`: `ExponentPushToken[...]` (not null)
- `updated_at`: Recent timestamp

### Test 3: Sign Out and Sign In Again
Should update the token (or keep same if permissions already granted).

## Code Changes Already Made

The code has been updated to match the working pattern from `authService.ts`:

**Before:**
```typescript
.upsert({ ... }, { onConflict: 'id', ignoreDuplicates: false })
```

**After:**
```typescript
.upsert({ ... }, { onConflict: 'id' })
```

This matches the exact pattern used in auth service which works successfully.

## If Still Not Working

### Debug: Check User Session
Add this to the push notification service to verify the user is authenticated:

```typescript
// Add at the start of registerPushNotifications
const { data: { session } } = await supabase.auth.getSession();
console.log('[Push Notifications] Session:', {
  hasSession: !!session,
  userId: session?.user?.id,
  matchesProvidedId: session?.user?.id === userId
});
```

### Debug: Try Direct Update First
Before running upsert, check if row exists:

```typescript
// Check if profile exists
const { data: existingProfile } = await supabase
  .from('profiles')
  .select('id')
  .eq('id', userId)
  .single();

console.log('[Push Notifications] Profile exists:', !!existingProfile);
```

### Last Resort: Use Service Role (Not Recommended)
If you need to bypass RLS for testing (NOT for production):

1. Create separate Supabase client with service role key
2. Only use for admin operations
3. **DO NOT** expose service role key in mobile app

## Migration File Location

The fix has been saved to:
```
server/supabase-migrations/013_fix_profiles_rls_for_push_tokens.sql
```

You can run it in Supabase SQL Editor.

## Next Steps After Fix

1. ✅ Run the SQL migration in Supabase
2. ✅ Verify policies exist in Supabase UI
3. ✅ Restart your app
4. ✅ Sign in and check console
5. ✅ Verify token in database
6. ✅ Test sending a push notification

---

**Status:** Waiting for SQL migration to be run in Supabase dashboard.
