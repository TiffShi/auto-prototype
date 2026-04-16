/**
 * Flood fill algorithm using a queue-based BFS approach.
 * @param {CanvasRenderingContext2D} ctx
 * @param {HTMLCanvasElement} canvas
 * @param {number} startX
 * @param {number} startY
 * @param {string} fillColor - hex color string
 */
export function floodFill(ctx, canvas, startX, startY, fillColor) {
  const width = canvas.width;
  const height = canvas.height;
  const imageData = ctx.getImageData(0, 0, width, height);
  const data = imageData.data;

  const fillRgb = hexToRgb(fillColor);
  if (!fillRgb) return;

  const targetIdx = (startY * width + startX) * 4;
  const targetR = data[targetIdx];
  const targetG = data[targetIdx + 1];
  const targetB = data[targetIdx + 2];
  const targetA = data[targetIdx + 3];

  // Don't fill if already the same color
  if (
    targetR === fillRgb.r &&
    targetG === fillRgb.g &&
    targetB === fillRgb.b &&
    targetA === 255
  ) return;

  const tolerance = 30;

  function matchesTarget(idx) {
    return (
      Math.abs(data[idx] - targetR) <= tolerance &&
      Math.abs(data[idx + 1] - targetG) <= tolerance &&
      Math.abs(data[idx + 2] - targetB) <= tolerance &&
      Math.abs(data[idx + 3] - targetA) <= tolerance
    );
  }

  const visited = new Uint8Array(width * height);
  const queue = [[startX, startY]];
  visited[startY * width + startX] = 1;

  while (queue.length > 0) {
    const [x, y] = queue.shift();
    const idx = (y * width + x) * 4;

    data[idx] = fillRgb.r;
    data[idx + 1] = fillRgb.g;
    data[idx + 2] = fillRgb.b;
    data[idx + 3] = 255;

    const neighbors = [
      [x + 1, y], [x - 1, y],
      [x, y + 1], [x, y - 1]
    ];

    for (const [nx, ny] of neighbors) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const ni = ny * width + nx;
      if (visited[ni]) continue;
      visited[ni] = 1;
      const nIdx = ni * 4;
      if (matchesTarget(nIdx)) {
        queue.push([nx, ny]);
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
}

/**
 * Draw a shape on the canvas context.
 * @param {CanvasRenderingContext2D} ctx
 * @param {'rect'|'circle'|'line'} tool
 * @param {number} x1
 * @param {number} y1
 * @param {number} x2
 * @param {number} y2
 */
export function drawShape(ctx, tool, x1, y1, x2, y2) {
  ctx.beginPath();

  if (tool === 'rect') {
    ctx.strokeRect(x1, y1, x2 - x1, y2 - y1);
  } else if (tool === 'circle') {
    const rx = (x2 - x1) / 2;
    const ry = (y2 - y1) / 2;
    const cx = x1 + rx;
    const cy = y1 + ry;
    ctx.ellipse(cx, cy, Math.abs(rx), Math.abs(ry), 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (tool === 'line') {
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }
}

/**
 * Convert hex color string to RGB object.
 */
export function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      }
    : null;
}