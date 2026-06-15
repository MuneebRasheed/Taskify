# 🚨 IMMEDIATE ACTION REQUIRED - Fix Push Token Permission

## The Issue
Your app is getting push tokens successfully, but **cannot save them to Supabase** due to permission error `42501`.

## The Cause
Your Supabase database's Row Level Security (RLS) policies need to be updated to allow authenticated users to update their push tokens.

## ✅ THE FIX (Follow These Steps)

### Step 1: Open Supabase Dashboard
1. Go to: https://app.supabase.com
2. Sign in to your account
3. Select your **Taskify project**

### Step 2: Open SQL Editor
1. Click **SQL Editor** in the left sidebar
2. Click **+ New query** button

### Step 3: Run This SQL Script

**Copy this ENTIRE script and paste it into the SQL editor:**

```sql
-- Fix RLS policies for profiles table to allow expo_push_token updates

drop policy if exists "Users can read own profile" on public.profiles;
drop policy if exists "Users can insert own profile" on public.profiles;
drop policy if exists "Users can update own profile" on public.profiles;

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

alter table public.profiles enable row level security;

grant select, insert, update on public.profiles to authenticated;

create index if not exists idx_profiles_expo_push_token on public.profiles(expo_push_token);
```

### Step 4: Click "RUN" Button
- The script should execute successfully
- You should see "Success. No rows returned"

### Step 5: Verify Policies Were Created
1. Go to **Database** → **Tables** in the left sidebar
2. Find and click on **profiles** table
3. Click the **Policies** tab
4. You should see 3 policies:
   - ✅ "Users can read own profile" (SELECT)
   - ✅ "Users can insert own profile" (INSERT)  
   - ✅ "Users can update own profile" (UPDATE)

### Step 6: Test in Your App
1. **Close and restart your app** completely
2. **Sign in** to your account
3. **Check the console logs** - you should now see:
   ```
   LOG [Push Notifications] ✅ Token obtained: ExponentPushToken[...]
   LOG [Push Notifications] ✅ Token successfully saved to database for user: [your-id]
   ```
4. **No more errors!** ❌ → ✅

### Step 7: Verify in Database
1. Go to **Table Editor** → **profiles** in Supabase
2. Find your user row (search by email)
3. Check the `expo_push_token` column
4. It should contain: `ExponentPushToken[...]`

---

## 📊 Before vs After

### Before (Current State) ❌
```
LOG  [Push Notifications] ✅ Token obtained: ExponentPushToken[OQodr0EyN9pBuRMTa5Pfji]
ERROR [Push Notifications] ❌ Failed to save token to database: permission denied
```

Database:
```
expo_push_token: NULL ❌
```

### After (Expected State) ✅
```
LOG  [Push Notifications] ✅ Token obtained: ExponentPushToken[OQodr0EyN9pBuRMTa5Pfji]
LOG  [Push Notifications] ✅ Token successfully saved to database for user: abc-123
```

Database:
```
expo_push_token: ExponentPushToken[OQodr0EyN9pBuRMTa5Pfji] ✅
```

---

## 🔍 Why This Happened

The migration file `005_profiles_auth_schema.sql` contains the correct policies, but:
1. It may not have been run on your Supabase database yet
2. Or the policies were modified/deleted at some point
3. Or there's a permission grant missing

Running the SQL script above will ensure everything is properly configured.

---

## ⚡ Quick Checklist

- [ ] Opened Supabase dashboard
- [ ] Navigated to SQL Editor
- [ ] Pasted and ran the SQL script
- [ ] Verified 3 policies exist on profiles table
- [ ] Restarted the app
- [ ] Signed in and checked console
- [ ] Confirmed success message in logs
- [ ] Verified token in database

---

## 📞 If It Still Doesn't Work

If you still see the permission error after running the SQL:

1. **Check you're using the correct Supabase project**
2. **Verify you're signed in as the project owner/admin**
3. **Check the SQL ran without errors**
4. **Try signing out and signing in again in the app**
5. **Check if the user's profile row exists:**
   ```sql
   SELECT * FROM profiles WHERE id = auth.uid();
   ```

---

## 🎯 Summary

**Action:** Run the SQL script in Supabase SQL Editor
**Time:** 2 minutes
**Result:** Push tokens will save successfully to database
**Status:** ⏳ Waiting for you to run the SQL migration

Once you run the SQL script and restart your app, everything should work! 🚀
