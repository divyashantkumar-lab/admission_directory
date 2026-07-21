import { useEffect } from 'react';

/**
 * Hook to preload images before they become visible
 * Improves perceived image loading speed
 */
export function useImagePreload(imageUrls) {
  useEffect(() => {
    if (!imageUrls || imageUrls.length === 0) return;

    // Preload images using Image API (low priority)
    imageUrls.forEach(url => {
      if (url) {
        // Use requestIdleCallback for non-blocking preload
        if ('requestIdleCallback' in window) {
          requestIdleCallback(() => {
            const img = new Image();
            img.src = url;
          }, { timeout: 2000 });
        } else {
          // Fallback for browsers without requestIdleCallback
          setTimeout(() => {
            const img = new Image();
            img.src = url;
          }, 100);
        }
      }
    });
  }, [imageUrls]);
}

/**
 * Hook to generate blur placeholder from image URL
 * Creates a very low quality version for loading state
 */
export function useBlurHash(url, size = 20) {
  // Generate a minimal blur hash placeholder
  // We'll use a data URI with a solid color as placeholder
  const getPlaceholderColor = (str) => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    const hue = Math.abs(hash) % 360;
    return `hsl(${hue}, 70%, 80%)`;
  };

  return getPlaceholderColor(url || 'default');
}

export default useImagePreload;
