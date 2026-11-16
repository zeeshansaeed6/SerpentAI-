const MAX_SIDE = 1280;
const JPEG_QUALITY = 0.85;

// Downscale + re-encode as JPEG before upload (cuts upload time, Gemini cost and DB size)
// and bake in the night-boost filter, which was previously preview-only.
// Falls back to the original file if the browser can't process it.
export async function prepareImage(file, { brightness = 100, contrast = 100 } = {}) {
  try {
    const bitmap = await createImageBitmap(file);
    const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);

    const ctx = canvas.getContext('2d');
    ctx.filter = `brightness(${brightness}%) contrast(${contrast}%)`; // no-op on browsers without ctx.filter
    ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY));
    return blob ? new File([blob], 'snake.jpg', { type: 'image/jpeg' }) : file;
  } catch {
    return file;
  }
}
