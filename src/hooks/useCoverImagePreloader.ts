import { useEffect } from 'react';
import { Image } from 'react-native';
import { useGoalStore } from '../../store/goalStore';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const COVER_BUCKET = 'covers';
const DEFAULT_COVER_FILE_NAMES = [
  'cover1.png',
  'cover2.png',
  'cover3.png',
  'cover4.png',
  'cover5.png',
  'cover6.png',
  'cover7.png',
];

export const COVER_IMAGE_SOURCES = SUPABASE_URL
  ? DEFAULT_COVER_FILE_NAMES.map((fileName) => ({
      uri: `${SUPABASE_URL}/storage/v1/object/public/${COVER_BUCKET}/${encodeURIComponent(fileName)}`,
    }))
  : [];

/**
 * Hook to preload cover images into cache on app startup
 * This ensures instant loading when navigating to SelectCoverImageScreen
 */
export const useCoverImagePreloader = () => {
  const cachedCoverImages = useGoalStore((s) => s.cachedCoverImages);
  const setCachedCoverImages = useGoalStore((s) => s.setCachedCoverImages);
  const coverImagesLoading = useGoalStore((s) => s.coverImagesLoading);
  const setCoverImagesLoading = useGoalStore((s) => s.setCoverImagesLoading);

  useEffect(() => {
    const preloadImages = async () => {
      // Skip if already cached or loading
      if (cachedCoverImages.length > 0 || coverImagesLoading) {
        return;
      }

      setCoverImagesLoading(true);

      try {
        const sources = COVER_IMAGE_SOURCES;

        // Preload all images in parallel
        const preloadPromises = sources.map((source) => {
          return new Promise<void>((resolve) => {
            if (typeof source === 'object' && 'uri' in source) {
              Image.prefetch(source.uri as string)
                .then(() => {
                  console.log(`✓ Preloaded cover image: ${source.uri}`);
                  resolve();
                })
                .catch((error) => {
                  console.warn(`✗ Failed to preload cover image: ${source.uri}`, error);
                  resolve(); // Resolve anyway to not block other images
                });
            } else {
              resolve();
            }
          });
        });

        await Promise.all(preloadPromises);

        // Store in cache
        setCachedCoverImages(sources);
        console.log(`✓ Successfully cached ${sources.length} cover images`);
      } catch (error) {
        console.error('Error preloading cover images:', error);
        // Cache sources anyway so they can be used
        setCachedCoverImages(COVER_IMAGE_SOURCES);
      } finally {
        setCoverImagesLoading(false);
      }
    };

    preloadImages();
  }, [cachedCoverImages.length, coverImagesLoading, setCachedCoverImages, setCoverImagesLoading]);
};
