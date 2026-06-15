# Push Token Registration Flow - Visual Guide

## 🔄 Complete Registration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     USER SIGNS IN/UP                         │
│            (Email, Google, or Apple Sign-In)                 │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              authService.signIn/signUp()                     │
│  • Authenticates user with Supabase                          │
│  • Creates/updates profile (email only)                      │
│  • Returns user & session                                    │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                   AuthProvider.tsx                           │
│  • Detects user authentication                               │
│  • user.id is now available                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│         useEffect(() => {}, [user?.id]) TRIGGERS             │
│  • Automatically called when user.id changes                 │
│  • Calls registerPushNotifications(user.id)                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│      pushNotificationService.registerPushNotifications()     │
│                                                               │
│  Step 1: Check current notification permissions             │
│  Step 2: Request permissions if not granted                 │
│  Step 3: Get Expo push token from Expo servers              │
│  Step 4: Save token to Supabase profiles table              │
│                                                               │
│  UPDATE profiles                                             │
│  SET expo_push_token = 'ExponentPushToken[xxx...]'          │
│      updated_at = NOW()                                      │
│  WHERE id = user.id                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│                    ✅ SUCCESS!                               │
│  • Token stored in database                                  │
│  • User can receive push notifications                       │
│  • Logs show success in console                              │
└─────────────────────────────────────────────────────────────┘
```

## 📊 Database State

### Before Sign In
```sql
profiles table:
┌──────────────────────┬──────────────────┬──────────────────┐
│         id           │      email       │ expo_push_token  │
├──────────────────────┼──────────────────┼──────────────────┤
│                      │                  │                  │
│   (user not exist)   │                  │                  │
│                      │                  │                  │
└──────────────────────┴──────────────────┴──────────────────┘
```

### After Sign In (without push token implementation)
```sql
profiles table:
┌──────────────────────┬──────────────────┬──────────────────┐
│         id           │      email       │ expo_push_token  │
├──────────────────────┼──────────────────┼──────────────────┤
│ uuid-123-456         │ user@email.com   │      NULL ❌     │
└──────────────────────┴──────────────────┴──────────────────┘
```

### After Sign In (WITH our implementation)
```sql
profiles table:
┌──────────────────────┬──────────────────┬──────────────────────────────┐
│         id           │      email       │       expo_push_token        │
├──────────────────────┼──────────────────┼──────────────────────────────┤
│ uuid-123-456         │ user@email.com   │ ExponentPushToken[xxx...] ✅ │
└──────────────────────┴──────────────────┴──────────────────────────────┘
```

## 🎯 Permission Scenarios

### Scenario 1: Permissions Already Granted
```
User Signs In
    ↓
Check Permissions → ✅ Granted
    ↓
Get Token → ✅ Success
    ↓
Save to DB → ✅ Success
```

### Scenario 2: Permissions Not Granted (First Time)
```
User Signs In
    ↓
Check Permissions → ❌ Not Granted
    ↓
Request Permissions → 📱 Shows iOS/Android Dialog
    ↓
User Taps "Allow" → ✅ Granted
    ↓
Get Token → ✅ Success
    ↓
Save to DB → ✅ Success
```

### Scenario 3: User Denies Permissions
```
User Signs In
    ↓
Check Permissions → ❌ Not Granted
    ↓
Request Permissions → 📱 Shows iOS/Android Dialog
    ↓
User Taps "Don't Allow" → ❌ Denied
    ↓
Return null → Token not saved
    ↓
App continues normally (no crash)
```

### Scenario 4: User Grants Permissions Later
```
First Sign In (Denied)
    ↓
expo_push_token = NULL in DB
    ↓
User goes to Settings → Enables Notifications
    ↓
User Returns to App (App becomes active)
    ↓
AuthProvider.validateCurrentSession() runs
    ↓
registerPushNotifications() runs again
    ↓
Permissions now granted → ✅
    ↓
Get Token → ✅ Success
    ↓
Save to DB → ✅ Success (Token now saved!)
```

## 🔐 Sign Out Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    USER CLICKS SIGN OUT                      │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│              AuthProvider.signOut() called                   │
│  • Checks if user.id exists                                  │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│  pushNotificationService.unregisterPushNotifications()       │
│                                                               │
│  UPDATE profiles                                             │
│  SET expo_push_token = NULL                                  │
│      updated_at = NOW()                                      │
│  WHERE id = user.id                                          │
└────────────────────────┬────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────┐
│               logOutRevenueCat() & signOut()                 │
│  • Clear user session                                        │
│  • Return to login screen                                    │
└─────────────────────────────────────────────────────────────┘
```

## 📝 Console Logs Example

### Successful Registration:
```
[Push Notifications] Starting registration for user: abc-123-def-456
[Push Notifications] Current permissions: {
  status: "undetermined",
  granted: false,
  canAskAgain: true
}
[Push Notifications] Requesting permissions...
[Push Notifications] Permission request result: {
  status: "granted",
  granted: true
}
[Push Notifications] Getting token with project ID: your-project-id
[Push Notifications] ✅ Token obtained: ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]
[Push Notifications] ✅ Token successfully saved to database for user: abc-123-def-456
```

### Denied Permissions:
```
[Push Notifications] Starting registration for user: abc-123-def-456
[Push Notifications] Current permissions: {
  status: "undetermined",
  granted: false,
  canAskAgain: true
}
[Push Notifications] Requesting permissions...
[Push Notifications] Permission request result: {
  status: "denied",
  granted: false
}
[Push Notifications] ❌ Permissions not granted. Cannot get token.
```

## 🧪 Testing Guide

### Test 1: Fresh Install + Sign Up
```
1. Delete app from device
2. Reinstall app
3. Sign up with new account
4. Observe permission dialog
5. Grant permissions
6. Check console for token
7. Verify in Supabase:
   SELECT expo_push_token FROM profiles WHERE email = 'newuser@test.com';
```

### Test 2: Existing User + Sign In
```
1. Sign in with existing account
2. Check console for token registration
3. Verify token updated in Supabase
```

### Test 3: Permission Denial → Later Grant
```
1. Sign in to app
2. Deny notification permissions
3. Verify token is NULL in database
4. Go to iOS Settings → App → Enable Notifications
5. Return to app (bring to foreground)
6. Check console - should register token
7. Verify token now exists in database
```

### Test 4: Sign Out
```
1. Sign in (token saved)
2. Verify token in database
3. Sign out
4. Check database - token should be NULL
5. Check console for unregister logs
```

## 🚀 Sending Notifications (Backend)

### Step 1: Get User Token from Database
```typescript
// Get a specific user's token
const { data: profile } = await supabase
  .from('profiles')
  .select('expo_push_token')
  .eq('id', userId)
  .single();

const token = profile?.expo_push_token;
```

### Step 2: Send Notification via Expo API
```typescript
if (token) {
  await fetch('https://exp.host/--/api/v2/push/send', {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: token,
      sound: 'default',
      title: 'Goal Reminder',
      body: 'Time to complete your daily tasks!',
      data: { 
        type: 'goal_reminder',
        goalId: 'goal-123'
      },
    }),
  });
}
```

### Step 3: Send to Multiple Users
```typescript
// Get all users with tokens
const { data: profiles } = await supabase
  .from('profiles')
  .select('id, email, expo_push_token')
  .not('expo_push_token', 'is', null);

// Send to all
const messages = profiles.map(profile => ({
  to: profile.expo_push_token,
  sound: 'default',
  title: 'Weekly Report',
  body: 'Check your weekly progress!',
}));

await fetch('https://exp.host/--/api/v2/push/send', {
  method: 'POST',
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(messages),
});
```

---

**Implementation Complete! 🎉**
