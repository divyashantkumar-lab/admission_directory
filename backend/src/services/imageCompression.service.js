const axios = require('axios');
const sharp = require('sharp');

/**
 * Download and compress image from Google Drive
 * Returns base64 encoded compressed image or null if fails
 */
async function getCompressedImage(googleDriveUrl, width = 256) {
  if (!googleDriveUrl) return null;

  try {
    // Extract file ID from Google Drive URL
    const fileIdMatch = googleDriveUrl.match(/\/file\/d\/([^/&?#]+)/);
    const openMatch = googleDriveUrl.match(/[?&]id=([^&?#]+)/);
    const fileId = fileIdMatch?.[1] || openMatch?.[1];

    if (!fileId) return null;

    // Construct direct image URL from Google Drive
    const directUrl = `https://lh3.googleusercontent.com/d/${fileId}=s${width}-q65-rw-c`;

    // Download image with timeout
    const response = await axios.get(directUrl, {
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
      .webp({ quality: 65 })
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
 * Get compressed image URL (returns original URL for lazy loading)
 * Client can request this URL directly
 */
function getCompressedImageUrl(googleDriveUrl, width = 256) {
  if (!googleDriveUrl) return null;

  try {
    const fileIdMatch = googleDriveUrl.match(/\/file\/d\/([^/&?#]+)/);
    const openMatch = googleDriveUrl.match(/[?&]id=([^&?#]+)/);
    const fileId = fileIdMatch?.[1] || openMatch?.[1];

    if (!fileId) return null;

    // Return optimized Google Drive image URL
    return `https://lh3.googleusercontent.com/d/${fileId}=s${width}-q60-w${width}-rw-c`;
  } catch (error) {
    console.error(`Failed to get compressed image URL: ${error.message}`);
    return null;
  }
}

module.exports = {
  getCompressedImage,
  getCompressedImageUrl,
};
