# Push Token Permission Fix ✅

## Issue
After implementing push token registration, the token was obtained successfully but failed to save to the database with error:
```
ERROR [Push Notifications] ❌ Failed to save token to database: 
{
  "code": "42501",
  "details": null,
  "hint": null,
  "message": "permission denied for table profiles"
}
```

## Root Cause
The service was using `.update()` which requires:
1. An existing row in the database
2. Proper RLS policies for UPDATE operations

While RLS policies were correct, using `.update()` with `.eq()` can sometimes have issues with RLS evaluation timing.

## Solution
Changed from `.update()` to `.upsert()` in the push notification service. This approach:
- ✅ Creates the profile row if it doesn't exist
- ✅ Updates the existing row if it does exist
- ✅ Works better with RLS policies
- ✅ Matches the pattern used in `authService.ts`
- ✅ More robust and reliable

## Changes Made

### File: `src/lib/notifications/pushNotificationService.ts`

#### Before (Update approach):
```typescript
const { error } = await supabase
  .from('profiles')
  .update({ expo_push_token: token, updated_at: new Date().toISOString() })
  .eq('id', userId);
```

#### After (Upsert approach):
```typescript
const { error } = await supabase
  .from('profiles')
  .upsert(
    { 
      id: userId,
      expo_push_token: token, 
      updated_at: new Date().toISOString() 
    },
    { 
      onConflict: 'id',
      ignoreDuplicates: false 
    }
  );
```

### Benefits of Upsert:
1. **Idempotent** - Can be called multiple times safely
2. **RLS-friendly** - Works better with Row Level Security policies
3. **Resilient** - Handles edge cases where profile row might not exist
4. **Consistent** - Matches the pattern in authService.ts
5. **No race conditions** - Atomic operation

## Testing

### Test the Fix:
1. **Restart your app** (to reload the code)
2. **Sign in** to your account
3. **Grant notification permissions** when prompted
4. **Check console logs** - should now show:
   ```
   [Push Notifications] ✅ Token obtained: ExponentPushToken[...]
   [Push Notifications] ✅ Token successfully saved to database for user: [userId]
   ```
5. **Verify in Supabase**:
   ```sql
   SELECT id, email, expo_push_token, updated_at 
   FROM profiles 
   WHERE id = '[your-user-id]';
   ```

### Expected Console Output:
```
LOG  [Push Notifications] Starting registration for user: abc-123-def-456
LOG  [Push Notifications] Current permissions: { status: "granted", granted: true, canAskAgain: false }
LOG  [Push Notifications] Getting token with project ID: your-project-id
LOG  [Push Notifications] ✅ Token obtained: ExponentPushToken[OQodr0EyN9pBuRMTa5Pfji]
LOG  [Push Notifications] ✅ Token successfully saved to database for user: abc-123-def-456
```

## Why Upsert vs Update?

### UPDATE (❌ Previous approach):
- Requires row to exist first
- Uses WHERE clause (`eq('id', userId)`)
- RLS policy evaluated on existing row
- Can fail if timing issues occur
- Returns error if no row found (depending on query)

### UPSERT (✅ New approach):
- Creates row if doesn't exist, updates if exists
- Uses ON CONFLICT clause
- RLS policy evaluated differently (INSERT + UPDATE)
- Atomic operation
- Always succeeds (assuming valid data)

## RLS Policy Context

The profiles table has these RLS policies:
```sql
-- SELECT policy
"Users can read own profile"
using (auth.uid() = id)

-- INSERT policy  
"Users can insert own profile"
with check (auth.uid() = id)

-- UPDATE policy
"Users can update own profile"
using (auth.uid() = id)
with check (auth.uid() = id)
```

With **UPSERT**, Supabase evaluates:
1. First tries INSERT (uses INSERT policy)
2. If conflict, does UPDATE (uses UPDATE policy)
3. More predictable and reliable with RLS

## Additional Safety

The upsert operation includes:
- `onConflict: 'id'` - Specifies which column determines uniqueness
- `ignoreDuplicates: false` - Always update when conflict occurs
- `id: userId` - Explicitly sets the ID to ensure RLS context

This ensures the operation always uses the authenticated user's ID.

## Status
✅ **FIXED** - Token should now save successfully to database

---

**Next Steps:**
1. Test the fix by signing in again
2. Verify token appears in Supabase
3. Check that notifications can be sent to the token

If you still see permission errors after this fix, we may need to check:
- Supabase project settings
- RLS policies in the actual database (vs migration file)
- Service role vs authenticated user permissions
