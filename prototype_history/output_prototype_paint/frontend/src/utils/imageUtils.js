/**
 * Convert a canvas element to a base64 PNG data URL.
 * @param {HTMLCanvasElement} canvas
 * @returns {string} base64 data URL
 */
export function canvasToBase64(canvas) {
  return canvas.toDataURL('image/png');
}

/**
 * Convert a base64 data URL to a Blob.
 * @param {string} dataUrl
 * @returns {Blob}
 */
export function dataUrlToBlob(dataUrl) {
  const [header, data] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(data);
  const array = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i);
  }
  return new Blob([array], { type: mime });
}

/**
 * Trigger a PNG download from a canvas element.
 * @param {HTMLCanvasElement} canvas
 * @param {string} filename
 */
export function downloadCanvasAsPng(canvas, filename = 'drawing.png') {
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvasToBase64(canvas);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

/**
 * Load an image URL into a canvas context, scaled to fit.
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLCanvasElement} canvas
 * @param {string} url
 * @returns {Promise<void>}
 */
export function loadImageOntoCanvas(ctx, canvas, url) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve();
    };
    img.onerror = reject;
    img.src = url;
  });
}