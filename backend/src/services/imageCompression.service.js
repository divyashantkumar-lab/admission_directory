const axios = require('axios');
const sharp = require('sharp');

/**
 * Check if URL is from Google Cloud Storage (GCS)
 */
function isGcsUrl(url) {
  return url && url.includes('storage.googleapis.com');
}

/**
 * Check if URL is from Google Drive
 */
function isGoogleDriveUrl(url) {
  return url && (url.includes('drive.google.com') || url.includes('lh3.googleusercontent.com'));
}

/**
 * Download and compress image from any source
 * Returns base64 encoded compressed image or null if fails
 */
async function getCompressedImage(imageUrl, width = 256) {
  if (!imageUrl) return null;

  try {
    // Download image with timeout
    const response = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 5000,
    });

    if (!response.data) return null;

    // Compress using sharp
    const compressedBuffer = await sharp(response.data)
      .resize(width, width, {
        fit: 'cover',
        position: 'center',
      })
      .webp({ quality: 60 })
      .toBuffer();

    // Convert to base64 with WebP mime type
    const base64 = compressedBuffer.toString('base64');
    return `data:image/webp;base64,${base64}`;
  } catch (error) {
    console.error(`Failed to compress image: ${error.message}`);
    return null;
  }
}

/**
 * Get optimized image URL for different sources
 * For GCS: Add resize parameters
 * For Google Drive: Use optimized CDN URL
 * For others: Return as-is
 */
function getCompressedImageUrl(imageUrl, width = 256) {
  if (!imageUrl) return null;

  try {
    // GCS URLs - add quality parameters
    if (isGcsUrl(imageUrl)) {
      // For GCS, we can add query params for optimization
      // Add =h256 for height optimization
      const separator = imageUrl.includes('?') ? '&' : '=';
      return `${imageUrl}${separator}h${width}`;
    }

    // Google Drive URLs - extract file ID and use optimized CDN
    if (isGoogleDriveUrl(imageUrl)) {
      const fileIdMatch = imageUrl.match(/\/file\/d\/([^/&?#]+)/);
      const openMatch = imageUrl.match(/[?&]id=([^&?#]+)/);
      const fileId = fileIdMatch?.[1] || openMatch?.[1];

      if (!fileId) return imageUrl;

      // Return optimized Google Drive image URL
      return `https://lh3.googleusercontent.com/d/${fileId}=s${width}-q60-w${width}-rw-c`;
    }

    // For other URLs, return as-is
    return imageUrl;
  } catch (error) {
    console.error(`Failed to get compressed image URL: ${error.message}`);
    return imageUrl;
  }
}

/**
 * Optimize image URL based on source
 * This is the main function to use for image optimization
 */
function optimizeImageUrl(imageUrl, width = 256, quality = 60) {
  if (!imageUrl) return null;

  try {
    // GCS URLs - add optimization parameters
    if (isGcsUrl(imageUrl)) {
      // GCS supports dynamic resizing with =h, =w, =s parameters
      // Example: url=h256 for height, =w256 for width, =s256 for square
      const separator = imageUrl.includes('?') ? '&' : '=';
      return `${imageUrl}${separator}w${width}`;
    }

    // Google Drive URLs - use optimized CDN
    if (isGoogleDriveUrl(imageUrl)) {
      const fileIdMatch = imageUrl.match(/\/file\/d\/([^/&?#]+)/);
      const openMatch = imageUrl.match(/[?&]id=([^&?#]+)/);
      const fileId = fileIdMatch?.[1] || openMatch?.[1];

      if (!fileId) return imageUrl;

      // Return optimized Google Drive image URL with quality parameter
      return `https://lh3.googleusercontent.com/d/${fileId}=s${width}-q${quality}-w${width}-rw-c`;
    }

    // Other URLs - return as-is
    return imageUrl;
  } catch (error) {
    console.error(`Failed to optimize image URL: ${error.message}`);
    return imageUrl;
  }
}

module.exports = {
  getCompressedImage,
  getCompressedImageUrl,
  optimizeImageUrl,
  isGcsUrl,
  isGoogleDriveUrl,
};
