import { generatePrintableSvg, PrintableSvgOptions } from './qrSvgRenderer';

const MM_TO_INCH = 1 / 25.4;

// Every exported filename carries the full rendering combination back to itself - printBatchId,
// printerCalibrationId, securityTemplateId - per Phase 7's traceability requirement: a physical
// measurement of one printed artifact should be attributable without opening any admin screen.
export function buildPrintArtifactFilename(params: {
  tagLabel: string;
  securityTemplateId: string;
  printBatchId: string;
  printerCalibrationId: string;
  widthMm: number;
  heightMm: number;
  dpi?: number;
  extension: 'svg' | 'png';
}): string {
  const { tagLabel, securityTemplateId, printBatchId, printerCalibrationId, widthMm, heightMm, dpi, extension } = params;
  const safe = (s: string) => (s || 'unset').replace(/[^a-z0-9]+/gi, '-');
  const parts = [
    'safetag', safe(tagLabel),
    `tpl-${safe(securityTemplateId)}`,
    `batch-${safe(printBatchId)}`,
    `cal-${safe(printerCalibrationId)}`,
    `${widthMm}x${heightMm}mm`,
  ];
  if (dpi) parts.push(`${dpi}dpi`);
  return `${parts.join('_')}.${extension}`;
}

export function downloadSvg(svgMarkup: string, filename: string): void {
  const blob = new Blob([svgMarkup], { type: 'image/svg+xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.download = filename;
  link.href = url;
  link.click();
  URL.revokeObjectURL(url);
}

// Rasterizes the vector SVG at exactly the requested DPI - the SVG is the single source of
// truth, so a 300 DPI and a 1200 DPI export of the same artifact differ only in pixel dimensions,
// never in the underlying geometry (no separate "high-res" drawing code path to drift out of sync).
export function rasterizeSvgAtDpi(svgMarkup: string, widthMm: number, heightMm: number, dpi: number): Promise<HTMLCanvasElement> {
  return new Promise((resolve, reject) => {
    const widthPx = Math.round(widthMm * MM_TO_INCH * dpi);
    const heightPx = Math.round(heightMm * MM_TO_INCH * dpi);

    const img = new Image();
    const blob = new Blob([svgMarkup], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);

    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = widthPx;
      canvas.height = heightPx;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Canvas 2D context unavailable'));
        return;
      }
      ctx.drawImage(img, 0, 0, widthPx, heightPx);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Could not rasterize SVG'));
    };
    img.src = url;
  });
}

export async function downloadRasterAtDpi(options: PrintableSvgOptions, text: string, dpi: number, filename: string): Promise<void> {
  const svg = generatePrintableSvg(text, options);
  const canvas = await rasterizeSvgAtDpi(svg, options.widthMm, options.heightMm, dpi);
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
