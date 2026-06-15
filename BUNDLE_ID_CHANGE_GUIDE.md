# Bundle ID Change Complete - Next Steps

## ✅ Code Changes Completed

All code-level changes have been made to update:
- **App Name**: Project Blossom
- **Bundle ID**: `app.projectblossom.goalstracker`

### Files Updated:
1. ✅ `app.json` - Updated name, slug, iOS bundleIdentifier, Android package
2. ✅ `package.json` - Updated package name
3. ✅ `android/app/build.gradle` - Updated namespace and applicationId
4. ✅ `android/app/src/main/res/values/strings.xml` - Updated app_name
5. ✅ `ios/Taskify/Info.plist` - Updated CFBundleDisplayName and URL schemes
6. ✅ `ios/Taskify.xcodeproj/project.pbxproj` - Updated PRODUCT_BUNDLE_IDENTIFIER

---

## 🔄 Required: Rebuild Native Projects

After changing the bundle ID, you MUST rebuild the native projects:

```bash
# Clean and rebuild
npx expo prebuild --clean

# Or if you prefer to do it manually:
cd ios && pod install && cd ..
cd android && ./gradlew clean && cd ..
```

---

## ⚠️ CRITICAL: External Services Configuration

You now need to update these external services with your new bundle ID:

### 1. **Apple Developer Portal** (REQUIRED)
- Go to: https://developer.apple.com/account/resources/identifiers/list
- Create new App ID: `app.projectblossom.goalstracker`
- Enable capabilities:
  - ✅ Sign In with Apple
  - ✅ Push Notifications
  - ✅ In-App Purchase
- Update provisioning profiles in Xcode

### 2. **Google OAuth** (REQUIRED - You're using Google Sign-In)
- Go to: https://console.cloud.google.com/apis/credentials
- Create new OAuth 2.0 Client IDs:
  
  **iOS Client:**
  - Bundle ID: `app.projectblossom.goalstracker`
  - Copy the new iOS Client ID
  
  **Web Client:**
  - For web-based OAuth flows
  - Copy the new Web Client ID

- **Update your `.env` file** with new client IDs:
  ```
  EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=YOUR_NEW_WEB_CLIENT_ID
  EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=YOUR_NEW_IOS_CLIENT_ID
  ```

- **Update `app.json`** Google Sign-In plugin:
  ```json
  {
    "plugins": [
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.googleusercontent.apps.YOUR_NEW_REVERSED_CLIENT_ID"
        }
      ]
    ]
  }
  ```

### 3. **Apple Sign-In** (REQUIRED - You have usesAppleSignIn enabled)
- Already configured in Apple Developer Portal with new App ID
- No code changes needed (handled by Expo)

### 4. **Push Notifications**

**iOS (APNs):**
- Apple Developer Portal → Keys → Create new APNs Key
- Download and save the key file
- Update in your backend/notification service

**Android (FCM):**
- Go to: https://console.firebase.google.com
- Add new Android app with package: `app.projectblossom.goalstracker`
- Download `google-services.json`
- Place in: `android/app/google-services.json`
- Update FCM server key in your backend

### 5. **RevenueCat (In-App Purchases)** (REQUIRED - You have react-native-purchases)
- Go to: https://app.revenuecat.com
- Create new app project
- Configure:
  - iOS Bundle ID: `app.projectblossom.goalstracker`
  - Android Package: `app.projectblossom.goalstracker`
- Copy new API keys
- **Update your code** with new RevenueCat API keys (check where you initialize Purchases)

### 6. **Supabase** (REQUIRED - You're using Supabase auth)
- Go to: https://supabase.com/dashboard
- Navigate to: Authentication → URL Configuration
- Add redirect URLs:
  - `app.projectblossom.goalstracker://`
  - `app.projectblossom.goalstracker://**`
- Update OAuth provider settings (Google, Apple) with new bundle IDs

### 7. **App Store Connect** (You mentioned you created this)
- App ID: `app.projectblossom.goalstracker`
- App Name: Project Blossom
- Configure:
  - ✅ In-App Purchases (re-create all products)
  - ✅ Push Notifications
  - ✅ Sign In with Apple
  - ✅ App Store listing (screenshots, description, etc.)

### 8. **Google Play Console** (When ready)
- Create new app
- Package name: `app.projectblossom.goalstracker`
- Configure:
  - ✅ In-App Products (re-create all products)
  - ✅ OAuth consent screen
  - ✅ Store listing

---

## 🧪 Testing Checklist

Before submitting to stores, test:

- [ ] App launches successfully on iOS
- [ ] App launches successfully on Android
- [ ] Google Sign-In works
- [ ] Apple Sign-In works
- [ ] Push notifications are received
- [ ] In-app purchases work
- [ ] Deep links work (if applicable)
- [ ] All API calls work with new bundle ID

---

## 📝 Build Commands

### iOS Build:
```bash
# Development build
npx expo run:ios

# Production build for TestFlight
eas build --platform ios --profile production
```

### Android Build:
```bash
# Development build
npx expo run:android

# Production build for Play Store
eas build --platform android --profile production
```

---

## 🚨 Important Notes

1. **Cannot revert**: Once you submit to App Store with new bundle ID, it's a completely new app
2. **Users won't auto-update**: Existing users need to download the new app
3. **Data migration**: Plan how existing users will migrate their data
4. **Analytics**: All analytics will start fresh (new app = new tracking)
5. **Reviews**: You'll start with 0 reviews on the new app

---

## 📞 Need Help?

If you encounter issues:
1. Check Xcode build logs for iOS issues
2. Check Android Studio logcat for Android issues
3. Verify all bundle IDs match exactly across all platforms
4. Ensure all external services are configured with the new bundle ID

---

**Status**: Code changes complete ✅  
**Next Step**: Run `npx expo prebuild --clean` and configure external services
