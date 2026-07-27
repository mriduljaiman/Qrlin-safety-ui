/**
 * Compresses an image file down to a target byte size by resizing and reducing
 * JPEG quality iteratively. Never guaranteed to hit the target exactly (a very
 * detailed photo shrunk to a few KB will look rough) but gets as close as
 * possible without leaving the UI hanging on a huge original upload.
 */

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
      'image/jpeg',
      quality
    );
  });
}

export async function compressImageToTarget(
  file: File,
  targetBytes = 20 * 1024,
  maxDim = 400
): Promise<Blob> {
  const img = await loadImage(file);
  let width = img.width;
  let height = img.height;

  const scale = Math.min(1, maxDim / Math.max(width, height));
  width = Math.max(1, Math.round(width * scale));
  height = Math.max(1, Math.round(height * scale));

  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d')!;

  const render = (w: number, h: number) => {
    canvas.width = w;
    canvas.height = h;
    ctx.clearRect(0, 0, w, h);
    ctx.drawImage(img, 0, 0, w, h);
  };

  render(width, height);

  let quality = 0.85;
  let blob = await canvasToBlob(canvas, quality);

  // Step 1: reduce quality first - cheaper than reducing dimensions.
  while (blob.size > targetBytes && quality > 0.15) {
    quality -= 0.1;
    blob = await canvasToBlob(canvas, quality);
  }

  // Step 2: still too big - shrink dimensions and try again at moderate quality.
  let guard = 0;
  while (blob.size > targetBytes && Math.max(width, height) > 40 && guard < 10) {
    width = Math.round(width * 0.85);
    height = Math.round(height * 0.85);
    render(width, height);
    blob = await canvasToBlob(canvas, 0.6);
    guard += 1;
  }

  URL.revokeObjectURL(img.src);
  return blob;
}
