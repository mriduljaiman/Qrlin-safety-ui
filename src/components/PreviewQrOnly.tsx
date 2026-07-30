import React, { useEffect, useState } from 'react';
import { tagsAPI, SafeTagStatus } from '../api/tags';
import styles from './PreviewQrOnly.module.css';

interface PreviewQrOnlyProps {
  tagId: number;
}

const STATUS_LABELS: Record<SafeTagStatus['status'], string> = {
  NONE: 'Not yet issued',
  PENDING_PRINT: 'Being prepared for print',
  PRINTED: 'Printed',
  PACKED: 'Packed',
  SHIPPED: 'Shipped',
  ACTIVE: 'Active',
  LOST: 'Reported lost',
  REISSUED: 'Replaced',
  DISABLED: 'Disabled',
  DESTROYED: 'Destroyed',
};

// Replaces QrCustomizer for owners (Phase 5 lockdown) - the real, scannable QR is now a
// physically printed SafeTag managed entirely by admin. This deliberately never renders an
// actual QR code or exposes SafeTag.qrId: an owner can see *where their physical tag is* in its
// lifecycle, nothing that could be used to view, download, or reconstruct it themselves.
const PreviewQrOnly: React.FC<PreviewQrOnlyProps> = ({ tagId }) => {
  const [status, setStatus] = useState<SafeTagStatus | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    tagsAPI.getSafeTagStatus(tagId)
      .then(setStatus)
      .catch(() => setStatus(null))
      .finally(() => setLoading(false));
  }, [tagId]);

  if (loading) {
    return <div className={styles.wrapper}><div className={styles.subtitle}>Loading SafeTag status...</div></div>;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.icon}>🛡️</div>
      <div className={styles.title}>Your SafeTag</div>
      <p className={styles.subtitle}>
        This tag's QR code is professionally printed and managed by Qrlin - it's no longer
        customizable or downloadable from your account.
      </p>

      {status && (
        <>
          <span className={styles.badge}>{STATUS_LABELS[status.status]}</span>
          {status.tagNumber && <div className={styles.detailRow}>Tag number: {status.tagNumber}</div>}
          {status.status === 'SHIPPED' && (status.courierName || status.trackingNumber) && (
            <div className={styles.detailRow}>
              {status.courierName} {status.trackingNumber && `· ${status.trackingNumber}`}
            </div>
          )}
          {status.status === 'NONE' && (
            <div className={styles.detailRow}>No physical SafeTag has been issued for this tag yet - contact support to request one.</div>
          )}
        </>
      )}
    </div>
  );
};

export default PreviewQrOnly;
