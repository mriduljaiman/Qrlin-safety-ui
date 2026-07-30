import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { adminSafeTagsAPI } from '../../api/adminSafeTags';
import { PrintBatchSummary } from '../../types/safeTag';
import styles from './AdminSafeTagsQueue.module.css';

// Phase 7 traceability: every printBatchId that's actually been used, with enough attribution
// (security template, printer calibration, pattern version) to trace a physical print run back
// to exactly what produced it - the other half of the loop that starts with the filename on a
// downloaded artifact (see printExport.ts's buildPrintArtifactFilename).
const AdminPrintBatches: React.FC = () => {
  const [batches, setBatches] = useState<PrintBatchSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    adminSafeTagsAPI.listRecentBatches()
      .then(setBatches)
      .catch((err) => setError(err.response?.data?.error || 'Could not load print batches'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <div className={styles.headerRow}>
          <h1>Recent Print Batches</h1>
          <Link to="/admin/safetags" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 14 }}>
            View SafeTags Queue →
          </Link>
        </div>

        {error && (
          <div style={{ background: '#fee', color: '#c33', padding: 12, borderRadius: 8, marginBottom: 16 }}>{error}</div>
        )}

        <div className={styles.section}>
          {loading ? (
            <div className={styles.empty}>Loading...</div>
          ) : batches.length === 0 ? (
            <div className={styles.empty}>No SafeTags have a Print Batch ID set yet.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Print Batch ID</th>
                  <th>SafeTags</th>
                  <th>Security Template(s)</th>
                  <th>Printer Calibration(s)</th>
                  <th>Pattern Version(s)</th>
                  <th>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {batches.map((b) => (
                  <tr key={b.printBatchId} style={{ cursor: 'default' }}>
                    <td style={{ fontFamily: 'monospace' }}>{b.printBatchId}</td>
                    <td>{b.safeTagCount}</td>
                    <td>{b.securityTemplateIds.join(', ') || '—'}</td>
                    <td>{b.printerCalibrationIds.join(', ') || '—'}</td>
                    <td>{b.securityPatternVersions.join(', ') || '—'}</td>
                    <td>{b.lastUpdatedAt ? new Date(b.lastUpdatedAt).toLocaleString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPrintBatches;
