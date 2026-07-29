import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import { adminSafeTagRequestAPI, PendingSafeTagRequest } from '../../api/safeTagRequests';
import styles from './AdminSafeTagsQueue.module.css';

const STATUS_OPTIONS = ['', 'PENDING', 'FULFILLED', 'REJECTED'];

const AdminSafeTagRequestsQueue: React.FC = () => {
  const navigate = useNavigate();
  const [requests, setRequests] = useState<PendingSafeTagRequest[]>([]);
  const [status, setStatus] = useState('PENDING');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busyId, setBusyId] = useState<number | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const result = await adminSafeTagRequestAPI.list(status || undefined);
      setRequests(result);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not load requests');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleFulfill = async (id: number) => {
    if (!window.confirm('Create a real SafeTag for this request?')) return;
    setBusyId(id);
    try {
      const safeTag = await adminSafeTagRequestAPI.fulfill(id);
      navigate(`/admin/safetags/${safeTag.id}`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Could not fulfill request');
    } finally {
      setBusyId(null);
    }
  };

  const handleReject = async (id: number) => {
    const reason = window.prompt('Reason for rejecting (optional):') || undefined;
    setBusyId(id);
    try {
      await adminSafeTagRequestAPI.reject(id, reason);
      load();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Could not reject request');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <div className={styles.headerRow}>
          <h1>SafeTag Requests (no-login intake)</h1>
          <Link to="/admin/safetags" style={{ color: 'var(--primary)', fontWeight: 600, fontSize: 14 }}>
            View SafeTags Queue →
          </Link>
        </div>

        {error && (
          <div style={{ background: '#fee', color: '#c33', padding: 12, borderRadius: 8, marginBottom: 16 }}>{error}</div>
        )}

        <div className={styles.toolbar}>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s || 'All statuses'}</option>
            ))}
          </select>
        </div>

        <div className={styles.section}>
          {loading ? (
            <div className={styles.empty}>Loading...</div>
          ) : requests.length === 0 ? (
            <div className={styles.empty}>No requests in this filter.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Requester</th>
                  <th>Item</th>
                  <th>Shipping Address</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {requests.map((r) => (
                  <tr key={r.id} style={{ cursor: 'default' }}>
                    <td>
                      <div>{r.requesterName}</div>
                      <div style={{ fontSize: 12, color: 'var(--gray-500)' }}>{r.requesterEmail}</div>
                    </td>
                    <td>{r.tagName} <span style={{ color: 'var(--gray-500)' }}>({r.category})</span></td>
                    <td style={{ maxWidth: 220, whiteSpace: 'pre-wrap' }}>{r.shippingAddress}</td>
                    <td><span className={styles.badge}>{r.status}</span></td>
                    <td>{new Date(r.createdAt).toLocaleDateString()}</td>
                    <td>
                      {r.status === 'PENDING' ? (
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button
                            onClick={() => handleFulfill(r.id)}
                            disabled={busyId === r.id}
                            style={{ padding: '6px 12px', borderRadius: 6, border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}
                          >
                            Fulfill
                          </button>
                          <button
                            onClick={() => handleReject(r.id)}
                            disabled={busyId === r.id}
                            style={{ padding: '6px 12px', borderRadius: 6, border: '1px solid #fed7d7', background: 'white', color: '#c33', fontWeight: 600, cursor: 'pointer', fontSize: 12 }}
                          >
                            Reject
                          </button>
                        </div>
                      ) : r.fulfilledSafeTagId ? (
                        <Link to={`/admin/safetags/${r.fulfilledSafeTagId}`} style={{ color: 'var(--primary)', fontSize: 12, fontWeight: 600 }}>
                          View SafeTag →
                        </Link>
                      ) : (
                        <span style={{ color: 'var(--gray-400)', fontSize: 12 }}>{r.adminNotes}</span>
                      )}
                    </td>
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

export default AdminSafeTagRequestsQueue;
