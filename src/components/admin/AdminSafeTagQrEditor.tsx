import React, { useEffect, useRef, useState } from 'react';
import { adminSafeTagsAPI } from '../../api/adminSafeTags';
import { SafeTag } from '../../types/safeTag';
import { QR_STYLES, QrStyleId, colorsAreTooClose, renderCustomQr } from '../../utils/customQrRenderer';
import { SecurityTemplateId } from '../../utils/printSecurity';
import { generatePrintableSvg, PrintableSvgOptions } from '../../utils/qrSvgRenderer';
import { buildPrintArtifactFilename, downloadRasterAtDpi, downloadSvg } from '../../utils/printExport';
import styles from '../QrCustomizer.module.css';

const DPI_PRESETS = [300, 600, 1200];

interface AdminSafeTagQrEditorProps {
  safeTag: SafeTag;
  onSaved: (updated: SafeTag) => void;
}

// Admin-side counterpart to QrCustomizer: the live preview still uses the canvas renderer (same
// customQrRenderer, not duplicated), but the exported print artifact goes through the Phase 7
// vector pipeline (qrSvgRenderer/printExport) so it's resolution-independent and reproducible at
// whatever DPI a print shop asks for. Scan URL is built from SafeTag.qrId - the physical-product
// identity - and saves go through adminSafeTagsAPI against the SafeTag record, never the
// owner-facing Tag endpoints.
const AdminSafeTagQrEditor: React.FC<AdminSafeTagQrEditorProps> = ({ safeTag, onSaved }) => {
  const [fgColor, setFgColor] = useState(safeTag.qrColor || '#000000');
  const [bgColor, setBgColor] = useState(safeTag.qrBackgroundColor || '#FFFFFF');
  const [style, setStyle] = useState<QrStyleId>((safeTag.qrStyle as QrStyleId) || 'square');
  const [titleAbove, setTitleAbove] = useState(safeTag.qrTitleAbove || 'SCAN ME 🙂');
  const [titleBelow, setTitleBelow] = useState(safeTag.qrTitleBelow || '');
  const [centerText, setCenterText] = useState(safeTag.qrCenterText || '');
  const [widthMm, setWidthMm] = useState(60);
  const [heightMm, setHeightMm] = useState(60);
  const [dpi, setDpi] = useState(300);
  const [saving, setSaving] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const scanUrl = `${window.location.origin}/scan/${safeTag.qrId}`;
  const tooClose = colorsAreTooClose(fgColor, bgColor);

  useEffect(() => {
    if (!canvasRef.current) return;
    renderCustomQr(canvasRef.current, scanUrl, { fgColor, bgColor, style, centerText, size: 240 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [scanUrl, fgColor, bgColor, style, centerText]);

  const handleSave = async () => {
    if (tooClose) {
      setError('QR color and background color are too similar — please pick different colors.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      const updated = await adminSafeTagsAPI.update(safeTag.id, {
        qrColor: fgColor,
        qrBackgroundColor: bgColor,
        qrStyle: style,
        qrTitleAbove: titleAbove,
        qrTitleBelow: titleBelow,
        qrCenterText: centerText,
      });
      onSaved(updated);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not save QR design');
    } finally {
      setSaving(false);
    }
  };

  const buildSvgOptions = (): { options: PrintableSvgOptions; securityTemplateId: SecurityTemplateId } | null => {
    if (tooClose) {
      setError('QR color and background color are too similar — please pick different colors.');
      return null;
    }
    const securityTemplateId = (safeTag.securityTemplateId as SecurityTemplateId) || 'NONE';
    if (securityTemplateId !== 'NONE' && !safeTag.printBatchId) {
      setError('Set a Print Batch ID in the Print Security section before exporting a secured artifact - it seeds the jitter/guilloché pattern and makes this print reproducible/auditable.');
      return null;
    }
    setError('');
    return {
      securityTemplateId,
      options: {
        fgColor, bgColor, style, centerText, titleAbove, titleBelow,
        widthMm: Math.max(5, widthMm), heightMm: Math.max(5, heightMm),
        securityTemplateId,
        context: {
          qrId: safeTag.qrId,
          printBatchId: safeTag.printBatchId || '',
          securityPatternVersion: safeTag.securityPatternVersion || '1',
        },
      },
    };
  };

  const filenameFor = (extension: 'svg' | 'png', includeDpi: boolean) => buildPrintArtifactFilename({
    tagLabel: safeTag.tagNumber || safeTag.qrId,
    securityTemplateId: safeTag.securityTemplateId || 'NONE',
    printBatchId: safeTag.printBatchId || '',
    printerCalibrationId: safeTag.printerCalibrationId || '',
    widthMm: Math.max(5, widthMm),
    heightMm: Math.max(5, heightMm),
    dpi: includeDpi ? dpi : undefined,
    extension,
  });

  const handleExportSvg = () => {
    const built = buildSvgOptions();
    if (!built) return;
    const svg = generatePrintableSvg(scanUrl, built.options);
    downloadSvg(svg, filenameFor('svg', false));
  };

  const handleExportPng = async () => {
    const built = buildSvgOptions();
    if (!built) return;
    setExporting(true);
    try {
      await downloadRasterAtDpi(built.options, scanUrl, dpi, filenameFor('png', true));
    } catch (err: any) {
      setError(err.message || 'Could not export PNG');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className={styles.qrWrapper}>
      {titleAbove && <div className={styles.qrTitleText}>{titleAbove}</div>}
      <canvas ref={canvasRef} className={styles.qrCanvas} />
      {titleBelow && <div className={styles.qrTitleText}>{titleBelow}</div>}

      <div className={styles.panel}>
        {error && <div className={styles.errorBanner}>{error}</div>}

        <div className={styles.colorPickerRow}>
          <label className={styles.colorPickerField}>
            QR color
            <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} />
          </label>
          <label className={styles.colorPickerField}>
            Background color
            <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
          </label>
        </div>
        {tooClose && (
          <div className={styles.errorBanner}>QR color and background color are too close to print/scan reliably.</div>
        )}

        <div className={styles.formGroup}>
          <label>QR style</label>
          <div className={styles.styleGrid}>
            {QR_STYLES.map((s) => (
              <div
                key={s.id}
                className={`${styles.styleSwatch} ${style === s.id ? styles.styleSwatchSelected : ''}`}
                onClick={() => setStyle(s.id)}
              >
                {s.label}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Title above QR</label>
          <input value={titleAbove} onChange={(e) => setTitleAbove(e.target.value)} maxLength={60} />
        </div>
        <div className={styles.formGroup}>
          <label>Title below QR</label>
          <input value={titleBelow} onChange={(e) => setTitleBelow(e.target.value)} maxLength={60} />
        </div>
        <div className={styles.formGroup}>
          <label>Center text (max 4 characters)</label>
          <input
            value={centerText}
            onChange={(e) => setCenterText(e.target.value.toUpperCase().slice(0, 4))}
            maxLength={4}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Print/export size (millimeters)</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="number" min={5} step={1} value={widthMm}
              onChange={(e) => setWidthMm(Math.max(5, Number(e.target.value) || 0))} style={{ width: 70 }} />
            <span style={{ color: 'var(--gray-500)' }}>×</span>
            <input type="number" min={5} step={1} value={heightMm}
              onChange={(e) => setHeightMm(Math.max(5, Number(e.target.value) || 0))} style={{ width: 70 }} />
            <span style={{ color: 'var(--gray-500)', fontSize: 13 }}>mm (L × W)</span>
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Raster export DPI</label>
          <select
            value={dpi}
            onChange={(e) => setDpi(Number(e.target.value))}
            style={{ padding: '8px 10px', border: '2px solid var(--gray-200)', borderRadius: 8, background: 'var(--surface)', color: 'var(--gray-800)' }}
          >
            {DPI_PRESETS.map((preset) => (
              <option key={preset} value={preset}>{preset} DPI</option>
            ))}
          </select>
          <span style={{ marginLeft: 10, fontSize: 12, color: 'var(--gray-500)' }}>
            Only affects the PNG export - the SVG export is vector and DPI-independent.
          </span>
        </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <button type="button" className={styles.saveButton} onClick={handleSave} disabled={saving || tooClose} style={{ flex: 1 }}>
            {saving ? 'Saving...' : 'Save QR Design'}
          </button>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <button
            type="button"
            className={styles.saveButton}
            onClick={handleExportSvg}
            disabled={tooClose}
            style={{ flex: 1, background: 'var(--surface)', color: 'var(--primary)', border: '2px solid var(--primary)' }}
          >
            ⬇️ Export SVG (vector)
          </button>
          <button
            type="button"
            className={styles.saveButton}
            onClick={handleExportPng}
            disabled={tooClose || exporting}
            style={{ flex: 1, background: 'var(--surface)', color: 'var(--primary)', border: '2px solid var(--primary)' }}
          >
            {exporting ? 'Rendering...' : `⬇️ Export PNG @ ${dpi} DPI`}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSafeTagQrEditor;
