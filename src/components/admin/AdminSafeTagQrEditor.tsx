import React, { useEffect, useRef, useState } from 'react';
import { adminSafeTagsAPI } from '../../api/adminSafeTags';
import { SafeTag } from '../../types/safeTag';
import { QR_STYLES, QrStyleId, colorsAreTooClose, renderCustomQr, renderPrintableQr } from '../../utils/customQrRenderer';
import styles from '../QrCustomizer.module.css';

const PRINT_DPI = 300;
const CM_TO_INCH = 1 / 2.54;

interface AdminSafeTagQrEditorProps {
  safeTag: SafeTag;
  onSaved: (updated: SafeTag) => void;
}

// Admin-side counterpart to QrCustomizer: same canvas rendering and print-export logic (reused
// from customQrRenderer, not duplicated), but the scan URL is built from SafeTag.qrId - the
// physical-product identity - and saves go through adminSafeTagsAPI against the SafeTag record,
// never the owner-facing Tag endpoints.
const AdminSafeTagQrEditor: React.FC<AdminSafeTagQrEditorProps> = ({ safeTag, onSaved }) => {
  const [fgColor, setFgColor] = useState(safeTag.qrColor || '#000000');
  const [bgColor, setBgColor] = useState(safeTag.qrBackgroundColor || '#FFFFFF');
  const [style, setStyle] = useState<QrStyleId>((safeTag.qrStyle as QrStyleId) || 'square');
  const [titleAbove, setTitleAbove] = useState(safeTag.qrTitleAbove || 'SCAN ME 🙂');
  const [titleBelow, setTitleBelow] = useState(safeTag.qrTitleBelow || '');
  const [centerText, setCenterText] = useState(safeTag.qrCenterText || '');
  const [widthCm, setWidthCm] = useState(6);
  const [heightCm, setHeightCm] = useState(6);
  const [saving, setSaving] = useState(false);
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

  const handleDownload = () => {
    if (tooClose) {
      setError('QR color and background color are too similar — please pick different colors.');
      return;
    }
    const w = Math.max(1, widthCm);
    const h = Math.max(1, heightCm);
    const widthPx = Math.round(w * CM_TO_INCH * PRINT_DPI);
    const heightPx = Math.round(h * CM_TO_INCH * PRINT_DPI);

    const printCanvas = document.createElement('canvas');
    renderPrintableQr(printCanvas, scanUrl, {
      fgColor, bgColor, style, centerText, titleAbove, titleBelow, widthPx, heightPx,
    });

    const link = document.createElement('a');
    const batchPart = safeTag.printBatchId ? `-batch-${safeTag.printBatchId}` : '';
    link.download = `safetag-${safeTag.tagNumber || safeTag.qrId}${batchPart}-${w}x${h}cm.png`;
    link.href = printCanvas.toDataURL('image/png');
    link.click();
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
          <label>Print/export size</label>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <input type="number" min={1} step={0.5} value={widthCm}
              onChange={(e) => setWidthCm(Math.max(0.5, Number(e.target.value) || 0))} style={{ width: 70 }} />
            <span style={{ color: 'var(--gray-500)' }}>×</span>
            <input type="number" min={1} step={0.5} value={heightCm}
              onChange={(e) => setHeightCm(Math.max(0.5, Number(e.target.value) || 0))} style={{ width: 70 }} />
            <span style={{ color: 'var(--gray-500)', fontSize: 13 }}>cm (L × W)</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button type="button" className={styles.saveButton} onClick={handleSave} disabled={saving || tooClose} style={{ flex: 1 }}>
            {saving ? 'Saving...' : 'Save QR Design'}
          </button>
          <button
            type="button"
            className={styles.saveButton}
            onClick={handleDownload}
            disabled={tooClose}
            style={{ flex: 1, background: 'var(--surface)', color: 'var(--primary)', border: '2px solid var(--primary)' }}
          >
            ⬇️ Download print artifact
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSafeTagQrEditor;
