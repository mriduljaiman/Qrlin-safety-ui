import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Layout/Header';
import Modal from '../../components/Common/Modal';
import { adminSafeTagsAPI } from '../../api/adminSafeTags';
import { AdminTagSummary, SafeTag, SafeTagStatus } from '../../types/safeTag';
import styles from './AdminSafeTagsQueue.module.css';

const STATUS_OPTIONS: (SafeTagStatus | '')[] = [
  '', 'PENDING_PRINT', 'PRINTED', 'PACKED', 'SHIPPED', 'ACTIVE', 'LOST', 'REISSUED', 'DISABLED', 'DESTROYED',
];

const STATUS_COLORS: Record<string, string> = {
  PENDING_PRINT: '#fef3c7',
  PRINTED: '#dbeafe',
  PACKED: '#e0e7ff',
  SHIPPED: '#cffafe',
  ACTIVE: '#dcfce7',
  LOST: '#fee2e2',
  REISSUED: '#f3e8ff',
  DISABLED: '#f3f4f6',
  DESTROYED: '#1f2937',
};

const AdminSafeTagsQueue: React.FC = () => {
  const navigate = useNavigate();
  const [safeTags, setSafeTags] = useState<SafeTag[]>([]);
  const [status, setStatus] = useState<SafeTagStatus | ''>('');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [createOpen, setCreateOpen] = useState(false);
  const [tagSearch, setTagSearch] = useState('');
  const [tagResults, setTagResults] = useState<AdminTagSummary[]>([]);
  const [creating, setCreating] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const result = await adminSafeTagsAPI.list(status || undefined, search || undefined);
      setSafeTags(result);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not load SafeTags');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const timeout = setTimeout(load, 300);
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, search]);

  const handleTagSearch = async (value: string) => {
    setTagSearch(value);
    if (value.trim().length < 2) {
      setTagResults([]);
      return;
    }
    try {
      const results = await adminSafeTagsAPI.searchEligibleTags(value.trim());
      setTagResults(results);
    } catch {
      setTagResults([]);
    }
  };

  const handleAttach = async (tag: AdminTagSummary) => {
    setCreating(true);
    try {
      const created = await adminSafeTagsAPI.create(tag.id);
      setCreateOpen(false);
      setTagSearch('');
      setTagResults([]);
      navigate(`/admin/safetags/${created.id}`);
    } catch (err: any) {
      alert(err.response?.data?.error || 'Could not create SafeTag');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <div className={styles.headerRow}>
          <h1>SafeTags Queue</h1>
          <button
            onClick={() => setCreateOpen(true)}
            style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 600, cursor: 'pointer' }}
          >
            + Create SafeTag
          </button>
        </div>

        {error && (
          <div style={{ background: '#fee', color: '#c33', padding: 12, borderRadius: 8, marginBottom: 16 }}>{error}</div>
        )}

        <div className={styles.toolbar}>
          <select value={status} onChange={(e) => setStatus(e.target.value as SafeTagStatus | '')}>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s || 'All statuses'}</option>
            ))}
          </select>
          <input
            placeholder="Search by qrId, tag number, tag name, or owner email"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ minWidth: 320 }}
          />
        </div>

        <div className={styles.section}>
          {loading ? (
            <div className={styles.empty}>Loading...</div>
          ) : safeTags.length === 0 ? (
            <div className={styles.empty}>No SafeTags match this filter.</div>
          ) : (
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Tag Number</th>
                  <th>Status</th>
                  <th>Tag</th>
                  <th>Owner</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {safeTags.map((s) => (
                  <tr key={s.id} onClick={() => navigate(`/admin/safetags/${s.id}`)}>
                    <td>{s.tagNumber || s.qrId.slice(0, 12)}</td>
                    <td>
                      <span className={styles.badge} style={{ background: STATUS_COLORS[s.status] || '#f3f4f6' }}>
                        {s.status}
                      </span>
                    </td>
                    <td>{s.tagName} <span style={{ color: 'var(--gray-500)' }}>({s.tagCategory})</span></td>
                    <td>{s.ownerEmail || <span style={{ color: 'var(--gray-400)' }}>No owner (pending intake)</span>}</td>
                    <td>{new Date(s.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      <Modal isOpen={createOpen} onClose={() => setCreateOpen(false)} title="Create a SafeTag">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <p style={{ margin: 0, color: 'var(--gray-600)', fontSize: 14 }}>
            Find the customer's existing Tag to attach a physical SafeTag to.
          </p>
          <input
            autoFocus
            placeholder="Search by tag name or owner email"
            value={tagSearch}
            onChange={(e) => handleTagSearch(e.target.value)}
            style={{ padding: '10px 12px', border: '2px solid var(--gray-200)', borderRadius: 8 }}
          />
          <div>
            {tagResults.map((tag) => (
              <div key={tag.id} className={styles.searchResult}>
                <div>
                  <strong>{tag.tagName}</strong> <span style={{ color: 'var(--gray-500)', fontSize: 13 }}>({tag.category})</span>
                  <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{tag.ownerEmail || 'No owner'}</div>
                </div>
                {tag.hasSafeTag ? (
                  <span style={{ fontSize: 12, color: 'var(--gray-400)' }}>Already has a SafeTag</span>
                ) : (
                  <button
                    onClick={() => handleAttach(tag)}
                    disabled={creating}
                    style={{ padding: '6px 14px', borderRadius: 6, border: 'none', background: 'var(--primary)', color: 'white', fontWeight: 600, cursor: 'pointer' }}
                  >
                    Attach
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AdminSafeTagsQueue;
