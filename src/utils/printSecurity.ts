import { PrintableQrOptions, renderPrintableQr } from './customQrRenderer';

export type SecurityTemplateId = 'NONE' | 'V1_STANDARD';

export const SECURITY_TEMPLATES: { id: SecurityTemplateId; label: string; description: string }[] = [
  { id: 'NONE', label: 'None (legacy)', description: 'Plain QR export - no anti-counterfeit features.' },
  {
    id: 'V1_STANDARD',
    label: 'V1 Standard',
    description: 'ECC-H + seeded micro-jitter + guilloché border + registration marks.',
  },
];

// cyrb53 - a small, fast, well-distributed non-cryptographic string hash. Security here isn't
// about being unguessable, it's about being a stable deterministic seed: the same
// (qrId, printBatchId, securityPatternVersion) triple must always reproduce pixel-identical
// jitter/guilloché output so a reprint or an audit can be verified against the original.
export function cyrb53(str: string, seed = 0): number {
  let h1 = 0xdeadbeef ^ seed;
  let h2 = 0x41c6ce57 ^ seed;
  for (let i = 0; i < str.length; i++) {
    const ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
}

// mulberry32 - deterministic PRNG from a 32-bit seed. Not cryptographic; we need reproducibility,
// not unpredictability.
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface SecurityContext {
  qrId: string;
  printBatchId: string;
  securityPatternVersion: string;
}

export function seedFor(context: SecurityContext, salt: string): number {
  return cyrb53(`${context.qrId}|${context.printBatchId}|${context.securityPatternVersion}|${salt}`) >>> 0;
}

// Deterministic per-module offset, independent of draw order: each module's jitter is derived
// from its own (row, col) hashed together with the seed, not from sequential PRNG draws - so it
// stays identical even if the QR's module count or draw order ever changes.
function makeModuleJitter(context: SecurityContext, maxCellFraction = 0.08) {
  const baseSeed = seedFor(context, 'jitter');
  return (row: number, col: number) => {
    const rng = mulberry32((baseSeed ^ Math.imul(row + 1, 73856093) ^ Math.imul(col + 1, 19349663)) >>> 0);
    return {
      dx: (rng() * 2 - 1) * maxCellFraction,
      dy: (rng() * 2 - 1) * maxCellFraction,
    };
  };
}

// A guilloché-style interference pattern - overlapping deterministic sine-modulated ellipses,
// classic anti-counterfeit engraving texture. Drawn only in the margin around the QR (never
// behind its modules) so it can't ever interfere with scan reliability.
function drawGuillocheBorder(
  ctx: CanvasRenderingContext2D,
  widthPx: number,
  heightPx: number,
  excludeRect: { x: number; y: number; w: number; h: number },
  context: SecurityContext,
  color: string,
): void {
  const rng = mulberry32(seedFor(context, 'guilloche'));
  const centerX = widthPx / 2;
  const centerY = heightPx / 2;
  const lineCount = 36;

  ctx.save();
  ctx.strokeStyle = color;
  ctx.globalAlpha = 0.18;
  ctx.lineWidth = Math.max(0.5, Math.min(widthPx, heightPx) * 0.0015);

  for (let i = 0; i < lineCount; i++) {
    const radiusX = (widthPx / 2) * (0.55 + 0.45 * (i / lineCount));
    const radiusY = (heightPx / 2) * (0.55 + 0.45 * (i / lineCount));
    const phase = rng() * Math.PI * 2;
    const wobble = 6 + rng() * 10;

    ctx.beginPath();
    const steps = 180;
    for (let s = 0; s <= steps; s++) {
      const angle = (s / steps) * Math.PI * 2;
      const wave = Math.sin(angle * wobble + phase) * (Math.min(widthPx, heightPx) * 0.01);
      const x = centerX + (radiusX + wave) * Math.cos(angle);
      const y = centerY + (radiusY + wave) * Math.sin(angle);
      // Skip the segment that would cross the QR/title composition itself.
      if (x > excludeRect.x && x < excludeRect.x + excludeRect.w && y > excludeRect.y && y < excludeRect.y + excludeRect.h) {
        ctx.moveTo(x, y);
      } else if (s === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    ctx.stroke();
  }
  ctx.restore();
}

// Corner crop/registration marks - small crosshair brackets a print shop uses to verify
// cut alignment and color-plate registration. Fixed size/position regardless of seed (these are
// a physical print-production convention, not a security feature that benefits from variation).
function drawRegistrationMarks(ctx: CanvasRenderingContext2D, widthPx: number, heightPx: number, color: string): void {
  const armLength = Math.max(8, Math.min(widthPx, heightPx) * 0.025);
  const inset = armLength * 0.6;
  const corners = [
    [inset, inset],
    [widthPx - inset, inset],
    [inset, heightPx - inset],
    [widthPx - inset, heightPx - inset],
  ];

  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1, armLength * 0.08);
  for (const [x, y] of corners) {
    ctx.beginPath();
    ctx.moveTo(x - armLength / 2, y);
    ctx.lineTo(x + armLength / 2, y);
    ctx.moveTo(x, y - armLength / 2);
    ctx.lineTo(x, y + armLength / 2);
    ctx.stroke();
  }
  ctx.restore();
}

export interface SecurePrintableQrOptions extends PrintableQrOptions {
  securityTemplateId: SecurityTemplateId;
  context: SecurityContext;
}

// The Phase 3 admin download flow's entry point - wraps renderPrintableQr with print-security v1
// (ECC-H is already the baseline in renderCustomQr; this layers jitter + guilloché + registration
// marks on top). NONE renders byte-identical to plain renderPrintableQr, so choosing it is a real,
// inspectable opt-out, not a silently-degraded default.
export function renderSecurePrintableQr(canvas: HTMLCanvasElement, text: string, options: SecurePrintableQrOptions): void {
  const { securityTemplateId, context, widthPx, heightPx, fgColor } = options;

  if (securityTemplateId === 'NONE') {
    renderPrintableQr(canvas, text, options);
    return;
  }

  renderPrintableQr(canvas, text, { ...options, moduleJitter: makeModuleJitter(context) });

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // The QR itself sits centered in the canvas after renderPrintableQr's own layout - approximate
  // its bounding box the same way renderPrintableQr computes it, so the guilloché texture never
  // gets drawn across it.
  const shortSide = Math.min(widthPx, heightPx);
  const padding = Math.round(shortSide * 0.05);
  const fontSize = Math.max(10, Math.round(shortSide * 0.09));
  const titleAllowance = (options.titleAbove ? fontSize * 1.5 : 0) + (options.titleBelow ? fontSize * 1.5 : 0);
  const excludeRect = {
    x: padding,
    y: padding,
    w: widthPx - padding * 2,
    h: heightPx - padding * 2 - titleAllowance,
  };

  drawGuillocheBorder(ctx, widthPx, heightPx, excludeRect, context, fgColor);
  drawRegistrationMarks(ctx, widthPx, heightPx, fgColor);
}
