import React, { useEffect, useRef, useState } from 'react';
import { tagsAPI } from '../api/tags';
import { Tag } from '../types/tag';
import { QR_STYLES, QrStyleId, colorsAreTooClose, renderCustomQr } from '../utils/customQrRenderer';
import styles from './QrCustomizer.module.css';

const DEFAULT_TITLE_ABOVE = 'SCAN ME 🙂';

interface QrCustomizerProps {
  tag: Tag;
  onSaved: (updated: Tag) => void;
}

const QrCustomizer: React.FC<QrCustomizerProps> = ({ tag, onSaved }) => {
  const [expanded, setExpanded] = useState(false);
  const [fgColor, setFgColor] = useState(tag.qrColor || '#000000');
  const [bgColor, setBgColor] = useState(tag.qrBackgroundColor || '#FFFFFF');
  const [style, setStyle] = useState<QrStyleId>((tag.qrStyle as QrStyleId) || 'square');
  const [titleAbove, setTitleAbove] = useState(tag.qrTitleAbove || DEFAULT_TITLE_ABOVE);
  const [titleBelow, setTitleBelow] = useState(tag.qrTitleBelow || '');
  const [centerText, setCenterText] = useState(tag.qrCenterText || '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const scanUrl = `${window.location.origin}/scan/${tag.qrCode}`;
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
      const updated = await tagsAPI.update(tag.id, {
        category: tag.category,
        tagName: tag.tagName,
        qrColor: fgColor,
        qrBackgroundColor: bgColor,
        qrStyle: style,
        qrTitleAbove: titleAbove,
        qrTitleBelow: titleBelow,
        qrCenterText: centerText,
      });
      onSaved(updated);
      setExpanded(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not save QR customization');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.qrWrapper}>
      {titleAbove && <div className={styles.qrTitleText}>{titleAbove}</div>}
      <canvas ref={canvasRef} className={styles.qrCanvas} />
      {titleBelow && <div className={styles.qrTitleText}>{titleBelow}</div>}

      <p style={{ color: 'var(--gray-500)', fontSize: 13, textAlign: 'center', marginTop: 8 }}>
        Print this and stick it on your item. Anyone who scans it sees only what you've chosen to share.
      </p>

      <button type="button" className={styles.customizeToggle} onClick={() => setExpanded(!expanded)}>
        {expanded ? 'Close Customize QR' : 'Customize QR'}
      </button>

      {expanded && (
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
            <div className={styles.errorBanner}>
              Same background color and same QR color cannot be possible match, please try different color
            </div>
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
            <input
              value={titleAbove}
              onChange={(e) => setTitleAbove(e.target.value)}
              maxLength={60}
              placeholder="SCAN ME 🙂"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Title below QR</label>
            <input
              value={titleBelow}
              onChange={(e) => setTitleBelow(e.target.value)}
              maxLength={60}
              placeholder="Optional"
            />
          </div>

          <div className={styles.formGroup}>
            <label>Center text (max 4 characters)</label>
            <input
              value={centerText}
              onChange={(e) => setCenterText(e.target.value.toUpperCase().slice(0, 4))}
              maxLength={4}
              placeholder="e.g. RS"
            />
          </div>

          <button
            type="button"
            className={styles.saveButton}
            onClick={handleSave}
            disabled={saving || tooClose}
          >
            {saving ? 'Saving...' : 'Save QR Design'}
          </button>
        </div>
      )}
    </div>
  );
};

export default QrCustomizer;
