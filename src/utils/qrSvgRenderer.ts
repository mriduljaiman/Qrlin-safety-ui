import QRCode from 'qrcode';
import { QrStyleId } from './customQrRenderer';
import { mulberry32, seedFor, SecurityContext, SecurityTemplateId } from './printSecurity';

function isFinderPattern(row: number, col: number, size: number): boolean {
  return (
    (row < 7 && col < 7) ||
    (row < 7 && col >= size - 7) ||
    (row >= size - 7 && col < 7)
  );
}

type SvgShapeFn = (cx: number, cy: number, cell: number) => string;

const n = (v: number) => Math.round(v * 1000) / 1000; // trim SVG float noise, keeps file size sane

const svgSquare: SvgShapeFn = (cx, cy, cell) =>
  `<rect x="${n(cx - cell / 2)}" y="${n(cy - cell / 2)}" width="${n(cell)}" height="${n(cell)}"/>`;

const svgRounded: SvgShapeFn = (cx, cy, cell) => {
  const r = cell * 0.3;
  return `<rect x="${n(cx - cell / 2)}" y="${n(cy - cell / 2)}" width="${n(cell)}" height="${n(cell)}" rx="${n(r)}" ry="${n(r)}"/>`;
};

const svgCircle: SvgShapeFn = (cx, cy, cell) => `<circle cx="${n(cx)}" cy="${n(cy)}" r="${n(cell * 0.45)}"/>`;

const svgDiamond: SvgShapeFn = (cx, cy, cell) => {
  const h = cell / 2;
  return `<path d="M${n(cx)},${n(cy - h)} L${n(cx + h)},${n(cy)} L${n(cx)},${n(cy + h)} L${n(cx - h)},${n(cy)} Z"/>`;
};

const svgTriangle: SvgShapeFn = (cx, cy, cell) => {
  const h = cell / 2;
  return `<path d="M${n(cx)},${n(cy - h)} L${n(cx + h)},${n(cy + h)} L${n(cx - h)},${n(cy + h)} Z"/>`;
};

const svgHexagon: SvgShapeFn = (cx, cy, cell) => {
  const r = cell * 0.5;
  const pts = Array.from({ length: 6 }, (_, i) => {
    const angle = (Math.PI / 3) * i;
    return `${n(cx + r * Math.cos(angle))},${n(cy + r * Math.sin(angle))}`;
  });
  return `<path d="M${pts.join(' L')} Z"/>`;
};

const svgStar: SvgShapeFn = (cx, cy, cell) => {
  const outerR = cell * 0.5;
  const innerR = outerR * 0.45;
  const pts: string[] = [];
  for (let i = 0; i < 10; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    pts.push(`${n(cx + r * Math.cos(angle))},${n(cy + r * Math.sin(angle))}`);
  }
  return `<path d="M${pts.join(' L')} Z"/>`;
};

const svgCross: SvgShapeFn = (cx, cy, cell) => {
  const arm = cell * 0.4;
  const t = cell * 0.34;
  return (
    `<rect x="${n(cx - t / 2)}" y="${n(cy - arm)}" width="${n(t)}" height="${n(arm * 2)}"/>` +
    `<rect x="${n(cx - arm)}" y="${n(cy - t / 2)}" width="${n(arm * 2)}" height="${n(t)}"/>`
  );
};

const svgPixel: SvgShapeFn = (cx, cy, cell) => {
  const s = cell * 0.55;
  return `<rect x="${n(cx - s / 2)}" y="${n(cy - s / 2)}" width="${n(s)}" height="${n(s)}"/>`;
};

const svgHeart: SvgShapeFn = (cx, cy, cell) => {
  const s = cell * 0.5;
  return `<path d="M${n(cx)},${n(cy + s * 0.6)} C${n(cx - s * 1.2)},${n(cy - s * 0.4)} ${n(cx - s * 0.4)},${n(cy - s * 1.2)} ${n(cx)},${n(cy - s * 0.3)} C${n(cx + s * 0.4)},${n(cy - s * 1.2)} ${n(cx + s * 1.2)},${n(cy - s * 0.4)} ${n(cx)},${n(cy + s * 0.6)} Z"/>`;
};

const svgLeaf: SvgShapeFn = (cx, cy, cell) => {
  // Same bezier leaf as the canvas renderer, rotated 45deg via a local transform on the element.
  const s = cell * 0.5;
  return `<path transform="rotate(45 ${n(cx)} ${n(cy)})" d="M${n(cx)},${n(cy - s)} C${n(cx + s)},${n(cy - s)} ${n(cx + s)},${n(cy + s)} ${n(cx)},${n(cy + s)} C${n(cx - s)},${n(cy + s)} ${n(cx - s)},${n(cy - s)} ${n(cx)},${n(cy - s)} Z"/>`;
};

const svgTeardrop: SvgShapeFn = (cx, cy, cell) => {
  const r = cell * 0.4;
  const startAngle = Math.PI * 0.15;
  const endAngle = Math.PI * 2 - Math.PI * 0.15;
  const sx = cx + r * Math.cos(startAngle);
  const sy = cy + r * 0.2 + r * Math.sin(startAngle);
  const ex = cx + r * Math.cos(endAngle);
  const ey = cy + r * 0.2 + r * Math.sin(endAngle);
  const tipX = cx;
  const tipY = cy - r * 1.3;
  return `<path d="M${n(sx)},${n(sy)} A${n(r)},${n(r)} 0 1 1 ${n(ex)},${n(ey)} L${n(tipX)},${n(tipY)} Z"/>`;
};

const SVG_SHAPE_FNS: Record<QrStyleId, SvgShapeFn> = {
  square: svgSquare,
  rounded: svgRounded,
  circle: svgCircle,
  diamond: svgDiamond,
  heart: svgHeart,
  star: svgStar,
  triangle: svgTriangle,
  hexagon: svgHexagon,
  cross: svgCross,
  leaf: svgLeaf,
  teardrop: svgTeardrop,
  pixel: svgPixel,
};

export interface QrSvgOptions {
  fgColor: string;
  bgColor: string;
  style: QrStyleId;
  centerText?: string;
  moduleJitter?: (row: number, col: number) => { dx: number; dy: number };
}

// Builds just the QR's own <g> (modules + optional center-text cutout), sized to a `size`-unit
// square starting at (0,0) - the caller positions/embeds it. Kept separate from the full-page
// composer below so it can be reused standalone (e.g. a future "QR-only" SVG export).
export function buildQrSvgGroup(text: string, size: number, options: QrSvgOptions): string {
  const { fgColor, bgColor, style, centerText, moduleJitter } = options;
  const qr = QRCode.create(text, { errorCorrectionLevel: 'H' });
  const moduleCount = qr.modules.size;
  const margin = 2;
  const cell = size / (moduleCount + margin * 2);
  const drawFn = SVG_SHAPE_FNS[style] || svgSquare;

  const trimmedCenterText = (centerText || '').trim().slice(0, 4).toUpperCase();
  const centerBoxSize = trimmedCenterText ? size * 0.18 : 0;
  const centerMin = (size - centerBoxSize) / 2;
  const centerMax = (size + centerBoxSize) / 2;

  let modules = '';
  for (let row = 0; row < moduleCount; row++) {
    for (let col = 0; col < moduleCount; col++) {
      const dark = qr.modules.data[row * moduleCount + col];
      if (!dark) continue;

      const cx = (col + margin + 0.5) * cell;
      const cy = (row + margin + 0.5) * cell;

      if (trimmedCenterText && cx > centerMin && cx < centerMax && cy > centerMin && cy < centerMax) {
        continue;
      }

      if (isFinderPattern(row, col, moduleCount)) {
        modules += svgSquare(cx, cy, cell);
      } else {
        const jitter = moduleJitter ? moduleJitter(row, col) : null;
        const jx = jitter ? cx + jitter.dx * cell : cx;
        const jy = jitter ? cy + jitter.dy * cell : cy;
        modules += drawFn(jx, jy, cell);
      }
    }
  }

  let centerLabel = '';
  if (trimmedCenterText) {
    const fontSize = centerBoxSize * (trimmedCenterText.length > 2 ? 0.32 : 0.45);
    centerLabel =
      `<rect x="${n(centerMin)}" y="${n(centerMin)}" width="${n(centerBoxSize)}" height="${n(centerBoxSize)}" rx="${n(centerBoxSize * 0.2)}" fill="${bgColor}"/>` +
      `<text x="${n(size / 2)}" y="${n(size / 2)}" text-anchor="middle" dominant-baseline="central" ` +
      `font-family="sans-serif" font-weight="bold" font-size="${n(fontSize)}" fill="${fgColor}">${escapeXml(trimmedCenterText)}</text>`;
  }

  return (
    `<rect x="0" y="0" width="${n(size)}" height="${n(size)}" fill="${bgColor}"/>` +
    `<g fill="${fgColor}">${modules}</g>` +
    centerLabel
  );
}

function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

export interface PrintableSvgOptions extends QrSvgOptions {
  titleAbove?: string;
  titleBelow?: string;
  widthMm: number;
  heightMm: number;
  securityTemplateId: SecurityTemplateId;
  context: SecurityContext;
}

// The full vector print artifact - resolution-independent by construction (viewBox in real-world
// millimeters), so "arbitrary DPI" isn't a rendering mode to choose, it's just what SVG already
// is; any DPI you rasterize it at afterward (see printExport.ts) traces back to this exact source.
export function generatePrintableSvg(text: string, options: PrintableSvgOptions): string {
  const { widthMm, heightMm, titleAbove, titleBelow, bgColor, fgColor, securityTemplateId, context } = options;
  const shortSide = Math.min(widthMm, heightMm);
  const padding = shortSide * 0.05;
  const fontSize = Math.max(2, shortSide * 0.09);

  let top = padding;
  let bottom = heightMm - padding;
  let titleMarkup = '';
  if (titleAbove) {
    titleMarkup += `<text x="${n(widthMm / 2)}" y="${n(top + fontSize)}" text-anchor="middle" font-family="sans-serif" font-weight="600" font-size="${n(fontSize)}" fill="${fgColor}">${escapeXml(titleAbove)}</text>`;
    top += fontSize * 1.5;
  }
  if (titleBelow) {
    titleMarkup += `<text x="${n(widthMm / 2)}" y="${n(bottom)}" text-anchor="middle" font-family="sans-serif" font-weight="600" font-size="${n(fontSize)}" fill="${fgColor}">${escapeXml(titleBelow)}</text>`;
    bottom -= fontSize * 1.5;
  }

  const availableWidth = widthMm - padding * 2;
  const availableHeight = bottom - top;
  const qrSize = Math.max(2, Math.min(availableWidth, availableHeight));
  const qrX = (widthMm - qrSize) / 2;
  const qrY = top + (availableHeight - qrSize) / 2;

  const moduleJitter = securityTemplateId === 'V1_STANDARD' ? makeSvgModuleJitter(context) : undefined;
  const qrGroup = buildQrSvgGroup(text, qrSize, { fgColor, bgColor, style: options.style, centerText: options.centerText, moduleJitter });

  let securityMarkup = '';
  if (securityTemplateId !== 'NONE') {
    securityMarkup += buildGuillocheSvg(widthMm, heightMm, { x: padding, y: padding, w: widthMm - padding * 2, h: heightMm - padding * 2 }, context, fgColor);
    securityMarkup += buildRegistrationMarksSvg(widthMm, heightMm, fgColor);
  }

  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${widthMm}mm" height="${heightMm}mm" ` +
    `viewBox="0 0 ${n(widthMm)} ${n(heightMm)}">` +
    `<rect x="0" y="0" width="${n(widthMm)}" height="${n(heightMm)}" fill="${bgColor}"/>` +
    `<g transform="translate(${n(qrX)}, ${n(qrY)})">${qrGroup}</g>` +
    titleMarkup +
    securityMarkup +
    `</svg>`
  );
}

// --- Print-security v1, ported to SVG (see printSecurity.ts for the canvas/PRNG originals -
// same seed derivation, same visual intent, different output format) ---

function makeSvgModuleJitter(context: SecurityContext) {
  // Shares seedFor/mulberry32 with printSecurity.ts's makeModuleJitter (same salt, same formula),
  // so a PNG and an SVG export of the same (qrId, printBatchId, securityPatternVersion) jitter
  // identically - not just "both jittered," pixel-for-pixel the same perturbation.
  const seed = seedFor(context, 'jitter');
  return (row: number, col: number) => {
    const rng = mulberry32((seed ^ Math.imul(row + 1, 73856093) ^ Math.imul(col + 1, 19349663)) >>> 0);
    return { dx: (rng() * 2 - 1) * 0.08, dy: (rng() * 2 - 1) * 0.08 };
  };
}

function buildGuillocheSvg(
  widthMm: number, heightMm: number,
  excludeRect: { x: number; y: number; w: number; h: number },
  context: SecurityContext, color: string,
): string {
  const rng = mulberry32(seedFor(context, 'guilloche'));
  const centerX = widthMm / 2;
  const centerY = heightMm / 2;
  const lineCount = 36;
  const strokeWidth = Math.max(0.05, Math.min(widthMm, heightMm) * 0.0015);
  let paths = '';

  for (let i = 0; i < lineCount; i++) {
    const radiusX = (widthMm / 2) * (0.55 + 0.45 * (i / lineCount));
    const radiusY = (heightMm / 2) * (0.55 + 0.45 * (i / lineCount));
    const phase = rng() * Math.PI * 2;
    const wobble = 6 + rng() * 10;
    const steps = 180;
    let d = '';
    for (let s = 0; s <= steps; s++) {
      const angle = (s / steps) * Math.PI * 2;
      const wave = Math.sin(angle * wobble + phase) * (Math.min(widthMm, heightMm) * 0.01);
      const x = centerX + (radiusX + wave) * Math.cos(angle);
      const y = centerY + (radiusY + wave) * Math.sin(angle);
      const inside = x > excludeRect.x && x < excludeRect.x + excludeRect.w && y > excludeRect.y && y < excludeRect.y + excludeRect.h;
      d += (s === 0 || inside ? 'M' : 'L') + `${n(x)},${n(y)} `;
    }
    paths += `<path d="${d.trim()}" fill="none" stroke="${color}" stroke-width="${n(strokeWidth)}" stroke-opacity="0.18"/>`;
  }
  return paths;
}

function buildRegistrationMarksSvg(widthMm: number, heightMm: number, color: string): string {
  const armLength = Math.max(1, Math.min(widthMm, heightMm) * 0.025);
  const inset = armLength * 0.6;
  const strokeWidth = Math.max(0.1, armLength * 0.08);
  const corners = [
    [inset, inset], [widthMm - inset, inset], [inset, heightMm - inset], [widthMm - inset, heightMm - inset],
  ];
  return corners.map(([x, y]) =>
    `<path d="M${n(x - armLength / 2)},${n(y)} L${n(x + armLength / 2)},${n(y)} M${n(x)},${n(y - armLength / 2)} L${n(x)},${n(y + armLength / 2)}" stroke="${color}" stroke-width="${n(strokeWidth)}"/>`
  ).join('');
}
