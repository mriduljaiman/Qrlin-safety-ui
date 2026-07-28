import QRCode from 'qrcode';

export type QrStyleId =
  | 'square'
  | 'rounded'
  | 'circle'
  | 'diamond'
  | 'heart'
  | 'star'
  | 'triangle'
  | 'hexagon'
  | 'cross'
  | 'leaf'
  | 'teardrop'
  | 'pixel';

export const QR_STYLES: { id: QrStyleId; label: string }[] = [
  { id: 'square', label: 'Square (Classic)' },
  { id: 'rounded', label: 'Rounded' },
  { id: 'circle', label: 'Circle' },
  { id: 'diamond', label: 'Diamond' },
  { id: 'heart', label: 'Heart' },
  { id: 'star', label: 'Star' },
  { id: 'triangle', label: 'Triangle' },
  { id: 'hexagon', label: 'Hexagon' },
  { id: 'cross', label: 'Cross' },
  { id: 'leaf', label: 'Leaf' },
  { id: 'teardrop', label: 'Teardrop' },
  { id: 'pixel', label: 'Pixel' },
];

export interface QrRenderOptions {
  fgColor: string;
  bgColor: string;
  style: QrStyleId;
  centerText?: string;
  size?: number;
}

// Relative luminance per WCAG, used to flag foreground/background colors that
// are identical or too close in contrast to reliably print/scan.
function relativeLuminance(hex: string): number {
  const clean = hex.replace('#', '');
  const full = clean.length === 3 ? clean.split('').map((c) => c + c).join('') : clean;
  const r = parseInt(full.substring(0, 2), 16) / 255;
  const g = parseInt(full.substring(2, 4), 16) / 255;
  const b = parseInt(full.substring(4, 6), 16) / 255;
  const toLinear = (c: number) => (c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function colorsAreTooClose(hex1: string, hex2: string): boolean {
  if (!hex1 || !hex2) return false;
  if (hex1.toLowerCase() === hex2.toLowerCase()) return true;
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  const contrastRatio = (lighter + 0.05) / (darker + 0.05);
  return contrastRatio < 1.5;
}

function isFinderPattern(row: number, col: number, size: number): boolean {
  return (
    (row < 7 && col < 7) ||
    (row < 7 && col >= size - 7) ||
    (row >= size - 7 && col < 7)
  );
}

type DrawFn = (ctx: CanvasRenderingContext2D, cx: number, cy: number, cell: number) => void;

const drawSquare: DrawFn = (ctx, cx, cy, cell) => {
  ctx.fillRect(cx - cell / 2, cy - cell / 2, cell, cell);
};

const drawRounded: DrawFn = (ctx, cx, cy, cell) => {
  const r = cell * 0.3;
  const half = cell / 2;
  ctx.beginPath();
  ctx.roundRect(cx - half, cy - half, cell, cell, r);
  ctx.fill();
};

const drawCircle: DrawFn = (ctx, cx, cy, cell) => {
  ctx.beginPath();
  ctx.arc(cx, cy, cell * 0.45, 0, Math.PI * 2);
  ctx.fill();
};

const drawDiamond: DrawFn = (ctx, cx, cy, cell) => {
  const half = cell / 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - half);
  ctx.lineTo(cx + half, cy);
  ctx.lineTo(cx, cy + half);
  ctx.lineTo(cx - half, cy);
  ctx.closePath();
  ctx.fill();
};

const drawHeart: DrawFn = (ctx, cx, cy, cell) => {
  const s = cell * 0.5;
  ctx.beginPath();
  ctx.moveTo(cx, cy + s * 0.6);
  ctx.bezierCurveTo(cx - s * 1.2, cy - s * 0.4, cx - s * 0.4, cy - s * 1.2, cx, cy - s * 0.3);
  ctx.bezierCurveTo(cx + s * 0.4, cy - s * 1.2, cx + s * 1.2, cy - s * 0.4, cx, cy + s * 0.6);
  ctx.closePath();
  ctx.fill();
};

const drawStar: DrawFn = (ctx, cx, cy, cell) => {
  const outerR = cell * 0.5;
  const innerR = outerR * 0.45;
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
};

const drawTriangle: DrawFn = (ctx, cx, cy, cell) => {
  const half = cell / 2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - half);
  ctx.lineTo(cx + half, cy + half);
  ctx.lineTo(cx - half, cy + half);
  ctx.closePath();
  ctx.fill();
};

const drawHexagon: DrawFn = (ctx, cx, cy, cell) => {
  const r = cell * 0.5;
  ctx.beginPath();
  for (let i = 0; i < 6; i++) {
    const angle = (Math.PI / 3) * i;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
};

const drawCross: DrawFn = (ctx, cx, cy, cell) => {
  const arm = cell * 0.4;
  const thickness = cell * 0.34;
  ctx.fillRect(cx - thickness / 2, cy - arm, thickness, arm * 2);
  ctx.fillRect(cx - arm, cy - thickness / 2, arm * 2, thickness);
};

const drawLeaf: DrawFn = (ctx, cx, cy, cell) => {
  const s = cell * 0.5;
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(Math.PI / 4);
  ctx.beginPath();
  ctx.moveTo(0, -s);
  ctx.bezierCurveTo(s, -s, s, s, 0, s);
  ctx.bezierCurveTo(-s, s, -s, -s, 0, -s);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
};

const drawTeardrop: DrawFn = (ctx, cx, cy, cell) => {
  const r = cell * 0.4;
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.2, r, Math.PI * 0.15, Math.PI * 2 - Math.PI * 0.15);
  ctx.lineTo(cx, cy - r * 1.3);
  ctx.closePath();
  ctx.fill();
};

const drawPixel: DrawFn = (ctx, cx, cy, cell) => {
  const s = cell * 0.55;
  ctx.fillRect(cx - s / 2, cy - s / 2, s, s);
};

const DRAW_FNS: Record<QrStyleId, DrawFn> = {
  square: drawSquare,
  rounded: drawRounded,
  circle: drawCircle,
  diamond: drawDiamond,
  heart: drawHeart,
  star: drawStar,
  triangle: drawTriangle,
  hexagon: drawHexagon,
  cross: drawCross,
  leaf: drawLeaf,
  teardrop: drawTeardrop,
  pixel: drawPixel,
};

export function renderCustomQr(canvas: HTMLCanvasElement, text: string, options: QrRenderOptions): void {
  const { fgColor, bgColor, style, centerText, size = 300 } = options;
  const qr = QRCode.create(text, { errorCorrectionLevel: 'H' });
  const moduleCount = qr.modules.size;
  const margin = 2;
  const cell = size / (moduleCount + margin * 2);

  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = fgColor;

  const trimmedCenterText = (centerText || '').trim().slice(0, 4).toUpperCase();
  // High error-correction (~30% recovery) safely absorbs a center cutout of
  // roughly this size, which is why the box is capped at 18% of the canvas.
  const centerBoxSize = trimmedCenterText ? size * 0.18 : 0;
  const centerMin = (size - centerBoxSize) / 2;
  const centerMax = (size + centerBoxSize) / 2;

  const drawFn = DRAW_FNS[style] || drawSquare;

  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const dark = qr.modules.data[row * moduleCount + col];
      if (!dark) continue;

      const cx = (col + margin + 0.5) * cell;
      const cy = (row + margin + 0.5) * cell;

      if (trimmedCenterText && cx > centerMin && cx < centerMax && cy > centerMin && cy < centerMax) {
        continue;
      }

      // Finder patterns (the 3 corner position-detection squares) must stay
      // plain squares regardless of style: scanners lock onto their fixed
      // 1:1:3:1:1 ratio, and fancy module shapes there break recognition.
      if (isFinderPattern(row, col, moduleCount)) {
        drawSquare(ctx, cx, cy, cell);
      } else {
        drawFn(ctx, cx, cy, cell);
      }
    }
  }

  if (trimmedCenterText) {
    ctx.fillStyle = bgColor;
    ctx.beginPath();
    ctx.roundRect(centerMin, centerMin, centerBoxSize, centerBoxSize, centerBoxSize * 0.2);
    ctx.fill();

    ctx.fillStyle = fgColor;
    ctx.font = `bold ${Math.round(centerBoxSize * (trimmedCenterText.length > 2 ? 0.32 : 0.45))}px sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(trimmedCenterText, size / 2, size / 2);
  }
}

export interface PrintableQrOptions extends QrRenderOptions {
  widthPx: number;
  heightPx: number;
  titleAbove?: string;
  titleBelow?: string;
}

// Composes the full printable sticker (title above + QR + title below) onto
// a canvas sized to the requested print dimensions, reusing renderCustomQr
// for the QR pattern itself.
export function renderPrintableQr(canvas: HTMLCanvasElement, text: string, options: PrintableQrOptions): void {
  const { widthPx, heightPx, titleAbove, titleBelow, bgColor, fgColor } = options;

  canvas.width = widthPx;
  canvas.height = heightPx;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.fillStyle = bgColor;
  ctx.fillRect(0, 0, widthPx, heightPx);

  const shortSide = Math.min(widthPx, heightPx);
  const padding = Math.round(shortSide * 0.05);
  const fontSize = Math.max(10, Math.round(shortSide * 0.09));

  let top = padding;
  let bottom = heightPx - padding;

  ctx.fillStyle = fgColor;
  ctx.textAlign = 'center';
  ctx.font = `600 ${fontSize}px sans-serif`;

  if (titleAbove) {
    ctx.textBaseline = 'top';
    ctx.fillText(titleAbove, widthPx / 2, top, widthPx - padding * 2);
    top += fontSize * 1.5;
  }
  if (titleBelow) {
    ctx.textBaseline = 'bottom';
    ctx.fillText(titleBelow, widthPx / 2, bottom, widthPx - padding * 2);
    bottom -= fontSize * 1.5;
  }

  const availableWidth = widthPx - padding * 2;
  const availableHeight = bottom - top;
  const qrSize = Math.max(10, Math.min(availableWidth, availableHeight));

  const qrCanvas = document.createElement('canvas');
  renderCustomQr(qrCanvas, text, { ...options, size: qrSize });

  const qrX = (widthPx - qrSize) / 2;
  const qrY = top + (availableHeight - qrSize) / 2;
  ctx.drawImage(qrCanvas, qrX, qrY);
}
