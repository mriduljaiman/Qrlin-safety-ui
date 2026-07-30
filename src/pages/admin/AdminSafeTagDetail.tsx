import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import Loading from '../../components/Common/Loading';
import AdminSafeTagQrEditor from '../../components/admin/AdminSafeTagQrEditor';
import { adminSafeTagsAPI } from '../../api/adminSafeTags';
import { SafeTag, SAFETAG_TRANSITIONS } from '../../types/safeTag';
import { SECURITY_TEMPLATES, SecurityTemplateId } from '../../utils/printSecurity';
import styles from './AdminSafeTagDetail.module.css';

const AdminSafeTagDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [safeTag, setSafeTag] = useState<SafeTag | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [transitioning, setTransitioning] = useState(false);

  const [tagSerial, setTagSerial] = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [courierName, setCourierName] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [savingDetails, setSavingDetails] = useState(false);

  const [securityTemplateId, setSecurityTemplateId] = useState<SecurityTemplateId>('NONE');
  const [printBatchId, setPrintBatchId] = useState('');
  const [printerCalibrationId, setPrinterCalibrationId] = useState('');
  const [securityPatternVersion, setSecurityPatternVersion] = useState('');
  const [savingSecurity, setSavingSecurity] = useState(false);

  const load = async (safeTagId: number) => {
    try {
      const data = await adminSafeTagsAPI.get(safeTagId);
      setSafeTag(data);
      setTagSerial(data.tagSerial || '');
      setTrackingNumber(data.trackingNumber || '');
      setCourierName(data.courierName || '');
      setShippingAddress(data.shippingAddress || '');
      setAdminNotes(data.adminNotes || '');
      setSecurityTemplateId((data.securityTemplateId as SecurityTemplateId) || 'NONE');
      setPrintBatchId(data.printBatchId || '');
      setPrinterCalibrationId(data.printerCalibrationId || '');
      setSecurityPatternVersion(data.securityPatternVersion || '');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not load SafeTag');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) load(Number(id));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleTransition = async (newStatus: string) => {
    if (!safeTag) return;
    if (newStatus === 'DESTROYED' && !window.confirm('This is a terminal state and cannot be reversed. Continue?')) return;
    setTransitioning(true);
    try {
      const updated = await adminSafeTagsAPI.transitionStatus(
        safeTag.id, newStatus,
        newStatus === 'SHIPPED' ? trackingNumber || undefined : undefined,
        newStatus === 'SHIPPED' ? courierName || undefined : undefined,
      );
      setSafeTag(updated);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Could not update status');
    } finally {
      setTransitioning(false);
    }
  };

  const handleSaveDetails = async () => {
    if (!safeTag) return;
    setSavingDetails(true);
    try {
      const updated = await adminSafeTagsAPI.update(safeTag.id, {
        tagSerial, trackingNumber, courierName, shippingAddress, adminNotes,
      });
      setSafeTag(updated);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Could not save details');
    } finally {
      setSavingDetails(false);
    }
  };

  const handleSaveSecurity = async () => {
    if (!safeTag) return;
    setSavingSecurity(true);
    try {
      const updated = await adminSafeTagsAPI.update(safeTag.id, {
        securityTemplateId, printBatchId, printerCalibrationId, securityPatternVersion,
      });
      setSafeTag(updated);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Could not save print security settings');
    } finally {
      setSavingSecurity(false);
    }
  };

  const handleGenerateBatchId = () => {
    const now = new Date();
    const stamp = now.toISOString().slice(0, 10).replace(/-/g, '');
    setPrintBatchId(`PB-${stamp}-${Math.floor(Math.random() * 9000 + 1000)}`);
  };

  const handleReissue = async () => {
    if (!safeTag) return;
    if (!window.confirm('This marks the current SafeTag as REISSUED and creates a new physical SafeTag pointing at the same Tag. Continue?')) return;
    try {
      const created = await adminSafeTagsAPI.reissue(safeTag.id);
      navigate(`/admin/safetags/${created.id}`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Could not reissue');
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <Loading fullScreen />
      </div>
    );
  }

  if (!safeTag) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.content}>
          <p style={{ color: '#c33' }}>{error || 'SafeTag not found'}</p>
        </div>
      </div>
    );
  }

  const nextStatuses = SAFETAG_TRANSITIONS[safeTag.status] || [];

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <Link to="/admin/safetags" className={styles.backLink}>← Back to SafeTags queue</Link>

        <div className={styles.headerRow}>
          <div>
            <h1>{safeTag.tagNumber || safeTag.qrId}</h1>
            <div style={{ color: 'var(--gray-500)', fontSize: 14 }}>
              {safeTag.tagName} ({safeTag.tagCategory}) — {safeTag.ownerEmail || 'No owner (pending intake)'}
            </div>
          </div>
          {safeTag.status !== 'REISSUED' && safeTag.status !== 'DESTROYED' && (
            <button
              onClick={handleReissue}
              style={{ padding: '10px 18px', borderRadius: 8, border: '2px solid #e53e3e', color: '#e53e3e', background: 'white', fontWeight: 600, cursor: 'pointer' }}
            >
              Reissue (replace physical tag)
            </button>
          )}
        </div>

        <div className={styles.card}>
          <h2>Status: {safeTag.status}</h2>
          {nextStatuses.length > 0 ? (
            <div className={styles.transitionRow}>
              {nextStatuses.map((s) => (
                <button key={s} className={styles.transitionButton} disabled={transitioning} onClick={() => handleTransition(s)}>
                  Move to {s}
                </button>
              ))}
            </div>
          ) : (
            <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>This is a terminal state - no further transitions.</p>
          )}
          <div className={styles.timeline}>
            {safeTag.printedAt && <div>Printed: {new Date(safeTag.printedAt).toLocaleString()}</div>}
            {safeTag.packedAt && <div>Packed: {new Date(safeTag.packedAt).toLocaleString()}</div>}
            {safeTag.shippedAt && <div>Shipped: {new Date(safeTag.shippedAt).toLocaleString()} {safeTag.courierName && `via ${safeTag.courierName}`} {safeTag.trackingNumber && `(${safeTag.trackingNumber})`}</div>}
            {safeTag.activatedAt && <div>Activated: {new Date(safeTag.activatedAt).toLocaleString()}</div>}
            {safeTag.disabledAt && <div>Disabled: {new Date(safeTag.disabledAt).toLocaleString()}</div>}
            {safeTag.reissuedFromId && <div>Reissued from SafeTag #{safeTag.reissuedFromId} (replacement #{safeTag.replacementCount})</div>}
          </div>
        </div>

        <div className={styles.grid}>
          <div className={styles.card}>
            <h2>QR Design & Print Artifact</h2>
            <AdminSafeTagQrEditor safeTag={safeTag} onSaved={setSafeTag} />
          </div>

          <div className={styles.card}>
            <h2>Print Security</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: 13, marginTop: -8 }}>
              Applies to the printable artifact exported from the QR Design card - deterministic and
              reproducible for the same template + batch + pattern version.
            </p>
            <div className={styles.field}>
              <label>Security template</label>
              <select
                value={securityTemplateId}
                onChange={(e) => setSecurityTemplateId(e.target.value as SecurityTemplateId)}
                style={{ width: '100%', padding: '8px 10px', border: '2px solid var(--gray-200)', borderRadius: 8, background: 'var(--surface)', color: 'var(--gray-800)' }}
              >
                {SECURITY_TEMPLATES.map((t) => (
                  <option key={t.id} value={t.id}>{t.label}</option>
                ))}
              </select>
              <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>
                {SECURITY_TEMPLATES.find((t) => t.id === securityTemplateId)?.description}
              </span>
            </div>
            <div className={styles.field}>
              <label>Print batch ID</label>
              <div style={{ display: 'flex', gap: 8 }}>
                <input value={printBatchId} onChange={(e) => setPrintBatchId(e.target.value)} style={{ flex: 1 }} />
                <button
                  type="button"
                  onClick={handleGenerateBatchId}
                  style={{ padding: '0 12px', borderRadius: 8, border: '2px solid var(--gray-200)', background: 'var(--surface)', color: 'var(--gray-700)', cursor: 'pointer', fontSize: 12 }}
                >
                  Generate
                </button>
              </div>
            </div>
            <div className={styles.field}>
              <label>Printer calibration ID</label>
              <input value={printerCalibrationId} onChange={(e) => setPrinterCalibrationId(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>Security pattern version</label>
              <input value={securityPatternVersion} onChange={(e) => setSecurityPatternVersion(e.target.value)} placeholder="1" />
            </div>
            <button
              onClick={handleSaveSecurity}
              disabled={savingSecurity}
              style={{ width: '100%', padding: '10px 16px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 600, cursor: 'pointer' }}
            >
              {savingSecurity ? 'Saving...' : 'Save Print Security Settings'}
            </button>
          </div>

          <div className={styles.card}>
            <h2>Fulfillment Details</h2>
            <div className={styles.field}>
              <label>Manufacturing serial</label>
              <input value={tagSerial} onChange={(e) => setTagSerial(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>Tracking number</label>
              <input value={trackingNumber} onChange={(e) => setTrackingNumber(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>Courier</label>
              <input value={courierName} onChange={(e) => setCourierName(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>Shipping address</label>
              <textarea rows={3} value={shippingAddress} onChange={(e) => setShippingAddress(e.target.value)} />
            </div>
            <div className={styles.field}>
              <label>Admin notes</label>
              <textarea rows={3} value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} />
            </div>
            <button
              onClick={handleSaveDetails}
              disabled={savingDetails}
              style={{ width: '100%', padding: '10px 16px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 600, cursor: 'pointer' }}
            >
              {savingDetails ? 'Saving...' : 'Save Fulfillment Details'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminSafeTagDetail;
