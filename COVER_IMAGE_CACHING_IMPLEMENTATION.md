# Cover Image Caching Implementation

## Problem
The SelectCoverImageScreen was experiencing slow loading times because cover images were being fetched from Supabase URLs every time the screen was navigated to, causing delays and poor user experience.

## Solution
Implemented a Zustand-based caching system that preloads and stores cover images in memory, ensuring instant loading when navigating to the cover image selection screen.

## Changes Made

### 1. Enhanced Goal Store (`store/goalStore.ts`)
Added three new state properties to cache cover images:
- `cachedCoverImages`: Array to store preloaded image sources
- `setCachedCoverImages`: Action to update cached images
- `coverImagesLoading`: Boolean flag to track loading state
- `setCoverImagesLoading`: Action to update loading state

### 2. Created Cover Image Preloader Hook (`src/hooks/useCoverImagePreloader.ts`)
- New custom hook that preloads all cover images on app startup
- Uses `Image.prefetch()` to download and cache images in React Native's image cache
- Stores image sources in Zustand store for instant access
- Handles errors gracefully - continues even if individual images fail to load
- Includes console logging for debugging

### 3. Updated SelectCoverImageScreen (`src/screens/SelectCoverImageScreen.tsx`)
- Now uses cached images from Zustand store instead of creating new sources each time
- Shows loading indicator while images are being preloaded (first time only)
- Falls back to direct URLs if cache is not yet populated
- Moved `COVER_IMAGE_SOURCES` definition to the preloader hook for centralization
- Re-exports `COVER_IMAGE_SOURCES` for backward compatibility with other screens

### 4. Integrated Preloader in App (`App.js`)
- Added `useCoverImagePreloader()` hook call in the main App component
- Images start preloading as soon as the app launches
- By the time user navigates to cover selection, images are already cached

## How It Works

1. **App Startup**: When the app launches, `useCoverImagePreloader()` hook runs
2. **Preloading**: All cover images are prefetched in parallel using `Image.prefetch()`
3. **Caching**: Image sources are stored in Zustand store once preloading completes
4. **Instant Access**: When user navigates to SelectCoverImageScreen, images load instantly from cache
5. **Persistence**: Cache remains in memory throughout the app session

## Benefits

✅ **Instant Loading**: Cover images appear immediately when navigating to the screen
✅ **Better UX**: No more waiting or blank screens while images load
✅ **Efficient**: Images are only preloaded once per app session
✅ **Resilient**: Gracefully handles network errors and missing images
✅ **Backward Compatible**: Existing screens continue to work without changes

## Technical Details

- Uses React Native's built-in `Image.prefetch()` for optimal caching
- Zustand store provides global state management without prop drilling
- Preloading happens asynchronously without blocking app startup
- Loading state prevents duplicate preload attempts
- All 7 cover images are preloaded in parallel for speed

## Testing Recommendations

1. Test on slow network to verify instant loading after preload
2. Test with airplane mode to ensure cached images work offline
3. Test app restart to verify preloading happens correctly
4. Monitor console logs to confirm successful image preloading
5. Test navigation to SelectCoverImageScreen multiple times to verify instant loading

## Future Enhancements

- Consider persisting cache to AsyncStorage for offline-first experience
- Add cache invalidation strategy for when images are updated
- Implement progressive loading with low-res placeholders
- Add retry logic for failed image preloads
