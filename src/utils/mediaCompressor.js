/**
 * Client-Side Media Compressor & Thumbnail Extractor
 * Healing78 Community - Standard Quality Media Processor
 */

const MAX_IMAGE_LONG_EDGE = 1280;
const IMAGE_QUALITY = 0.78;
const THUMB_SIZE = 360;
const THUMB_QUALITY = 0.65;
export const MAX_VIDEO_BYTES = 15 * 1024 * 1024; // 15MB
export const MAX_VIDEO_DURATION_SEC = 30; // 30s

/**
 * Reads a File into an HTMLImageElement
 */
function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(img);
    };
    img.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };
    img.src = objectUrl;
  });
}

/**
 * Resizes and compresses an image to standard quality (max long edge 1280px, quality 0.78)
 * and generates a square thumbnail (360x360, quality 0.65).
 */
export async function compressImage(file, maxLongEdge = MAX_IMAGE_LONG_EDGE, quality = IMAGE_QUALITY) {
  const img = await loadImageFromFile(file);
  let { width, height } = img;

  // 1. Calculate standard resized dimensions
  if (width > maxLongEdge || height > maxLongEdge) {
    if (width >= height) {
      height = Math.round((height * maxLongEdge) / width);
      width = maxLongEdge;
    } else {
      width = Math.round((width * maxLongEdge) / height);
      height = maxLongEdge;
    }
  }

  // Draw main standard compressed image
  const mainCanvas = document.createElement('canvas');
  mainCanvas.width = width;
  mainCanvas.height = height;
  const mainCtx = mainCanvas.getContext('2d');
  mainCtx.imageSmoothingEnabled = true;
  mainCtx.imageSmoothingQuality = 'high';
  mainCtx.drawImage(img, 0, 0, width, height);

  const format = file.type === 'image/webp' ? 'image/webp' : 'image/jpeg';
  const dataUrl = mainCanvas.toDataURL(format, quality);

  // 2. Generate square thumbnail (360x360) with center crop
  const thumbCanvas = document.createElement('canvas');
  thumbCanvas.width = THUMB_SIZE;
  thumbCanvas.height = THUMB_SIZE;
  const thumbCtx = thumbCanvas.getContext('2d');
  thumbCtx.imageSmoothingEnabled = true;
  thumbCtx.imageSmoothingQuality = 'medium';

  const minDim = Math.min(img.naturalWidth || width, img.naturalHeight || height);
  const sx = ((img.naturalWidth || width) - minDim) / 2;
  const sy = ((img.naturalHeight || height) - minDim) / 2;

  thumbCtx.drawImage(img, sx, sy, minDim, minDim, 0, 0, THUMB_SIZE, THUMB_SIZE);
  const thumbUrl = thumbCanvas.toDataURL('image/jpeg', THUMB_QUALITY);

  return {
    dataUrl,
    thumbUrl,
    width,
    height,
    mimeType: format
  };
}

/**
 * Extracts a cover frame at 1.0s and validates video duration & size.
 */
export function extractVideoThumbnail(file, targetSec = 1.0) {
  return new Promise((resolve, reject) => {
    if (file.size > MAX_VIDEO_BYTES) {
      reject(new Error(`동영상 용량이 15MB를 초과했습니다. (${(file.size / 1024 / 1024).toFixed(1)}MB)`));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.src = objectUrl;
    video.muted = true;
    video.playsInline = true;

    let seekDone = false;

    video.onloadedmetadata = () => {
      if (video.duration > MAX_VIDEO_DURATION_SEC) {
        URL.revokeObjectURL(objectUrl);
        reject(new Error(`동영상 길이가 30초를 초과했습니다. (${Math.round(video.duration)}초)`));
        return;
      }

      const seekTime = Math.min(targetSec, Math.max(0.1, video.duration / 2));
      video.currentTime = seekTime;
    };

    video.onseeked = () => {
      if (seekDone) return;
      seekDone = true;

      try {
        const vWidth = video.videoWidth || 640;
        const vHeight = video.videoHeight || 360;

        // Create square thumbnail
        const thumbCanvas = document.createElement('canvas');
        thumbCanvas.width = THUMB_SIZE;
        thumbCanvas.height = THUMB_SIZE;
        const ctx = thumbCanvas.getContext('2d');
        ctx.imageSmoothingEnabled = true;

        const minDim = Math.min(vWidth, vHeight);
        const sx = (vWidth - minDim) / 2;
        const sy = (vHeight - minDim) / 2;

        ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, THUMB_SIZE, THUMB_SIZE);
        const thumbUrl = thumbCanvas.toDataURL('image/jpeg', THUMB_QUALITY);

        const duration = Math.round(video.duration || 0);

        URL.revokeObjectURL(objectUrl);
        resolve({
          thumbUrl,
          duration,
          width: vWidth,
          height: vHeight
        });
      } catch (err) {
        URL.revokeObjectURL(objectUrl);
        reject(err);
      }
    };

    video.onerror = (err) => {
      URL.revokeObjectURL(objectUrl);
      reject(err);
    };
  });
}
