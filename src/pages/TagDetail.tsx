import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { tagsAPI } from '../api/tags';
import { Tag, SafetyInfo } from '../types/tag';
import Header from '../components/Layout/Header';
import Loading from '../components/Common/Loading';
import styles from './Tags.module.css';

const emptySafetyInfo: SafetyInfo = {
  bloodGroup: '',
  medicalConditions: '',
  allergies: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  doctorName: '',
  doctorPhone: '',
  publicMessage: '',
};

const TagDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tag, setTag] = useState<Tag | null>(null);
  const [qrImage, setQrImage] = useState('');
  const [loading, setLoading] = useState(true);
  const [safetyInfo, setSafetyInfo] = useState<SafetyInfo>(emptySafetyInfo);
  const [savingSafety, setSavingSafety] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    const tagId = Number(id);

    (async () => {
      try {
        const [tagData, safety] = await Promise.all([
          tagsAPI.get(tagId),
          tagsAPI.getSafetyInfo(tagId).catch(() => null),
        ]);
        setTag(tagData);
        if (safety) setSafetyInfo(safety);

        const scanUrl = `${window.location.origin}/scan/${tagData.qrCode}`;
        const dataUrl = await QRCode.toDataURL(scanUrl, { width: 240, margin: 2 });
        setQrImage(dataUrl);
      } catch (err) {
        console.error('Failed to load tag', err);
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);

  const toggleLostMode = async () => {
    if (!tag) return;
    try {
      await tagsAPI.toggleLostMode(tag.id, !tag.lostMode);
      setTag({ ...tag, lostMode: !tag.lostMode });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not update lost mode');
    }
  };

  const handleDeactivate = async () => {
    if (!tag) return;
    if (!window.confirm('Deactivate this tag? It will stop resolving when scanned.')) return;
    try {
      await tagsAPI.deactivate(tag.id);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not deactivate tag');
    }
  };

  const handleSaveSafetyInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tag) return;
    setSavingSafety(true);
    setError('');
    try {
      const saved = await tagsAPI.upsertSafetyInfo(tag.id, safetyInfo);
      setSafetyInfo(saved);
      setTag({ ...tag, hasSafetyInfo: true });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not save safety info');
    } finally {
      setSavingSafety(false);
    }
  };

  const handleRemoveSafetyInfo = async () => {
    if (!tag) return;
    if (!window.confirm('Remove safety info from this tag?')) return;
    try {
      await tagsAPI.deleteSafetyInfo(tag.id);
      setSafetyInfo(emptySafetyInfo);
      setTag({ ...tag, hasSafetyInfo: false });
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not remove safety info');
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

  if (!tag) {
    return (
      <div className={styles.container}>
        <Header />
        <div className={styles.emptyState}>
          <h2>Tag not found</h2>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <div className={styles.headerRow}>
          <div>
            <span className={styles.categoryBadge}>{tag.category}</span>
            <h1 className={styles.pageTitle} style={{ marginTop: 8 }}>{tag.tagName}</h1>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fee', color: '#c33', padding: 12, borderRadius: 8, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div className={styles.detailGrid}>
          <div className={styles.detailCard}>
            <div className={styles.qrWrapper}>
              {qrImage && <img src={qrImage} alt="QR code" />}
              <p style={{ color: '#718096', fontSize: 13, textAlign: 'center' }}>
                Print this and stick it on your item. Anyone who scans it sees only what you've chosen to share.
              </p>
            </div>

            {tag.description && (
              <p style={{ marginTop: 16 }}>{tag.description}</p>
            )}

            <div className={styles.toggleRow} style={{ marginTop: 24 }}>
              <div>
                <strong>Lost mode {tag.lostMode && <span className={styles.lostBadge} style={{ position: 'static', marginLeft: 8 }}>ACTIVE</span>}</strong>
                <div style={{ fontSize: 13, color: '#718096' }}>Flags this item as lost on the public scan page</div>
              </div>
              <button onClick={toggleLostMode} className={styles.addButton} style={{ border: 'none', cursor: 'pointer' }}>
                {tag.lostMode ? 'Remove Lost Mode' : 'Mark as Lost'}
              </button>
            </div>

            <button
              onClick={handleDeactivate}
              className={styles.dangerText}
              style={{ background: 'none', border: '1px solid #fed7d7', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', width: '100%' }}
            >
              Deactivate Tag
            </button>
          </div>

          <div className={styles.detailCard}>
            <h2 style={{ marginTop: 0 }}>Safety Info</h2>
            <p style={{ color: '#718096', fontSize: 14 }}>
              Optional. Attach emergency/medical info to this tag regardless of its category — encrypted at rest, only the public message below is ever shown to a finder.
            </p>

            <form onSubmit={handleSaveSafetyInfo}>
              <div className={styles.formGroup}>
                <label>Public message (shown on scan)</label>
                <textarea
                  value={safetyInfo.publicMessage || ''}
                  onChange={(e) => setSafetyInfo({ ...safetyInfo, publicMessage: e.target.value })}
                  rows={2}
                  placeholder="e.g. If found, please call the number below"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Blood group</label>
                <input
                  value={safetyInfo.bloodGroup || ''}
                  onChange={(e) => setSafetyInfo({ ...safetyInfo, bloodGroup: e.target.value })}
                  placeholder="O+"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Medical conditions</label>
                <input
                  value={safetyInfo.medicalConditions || ''}
                  onChange={(e) => setSafetyInfo({ ...safetyInfo, medicalConditions: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Allergies</label>
                <input
                  value={safetyInfo.allergies || ''}
                  onChange={(e) => setSafetyInfo({ ...safetyInfo, allergies: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Emergency contact name</label>
                <input
                  value={safetyInfo.emergencyContactName || ''}
                  onChange={(e) => setSafetyInfo({ ...safetyInfo, emergencyContactName: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Emergency contact phone</label>
                <input
                  value={safetyInfo.emergencyContactPhone || ''}
                  onChange={(e) => setSafetyInfo({ ...safetyInfo, emergencyContactPhone: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Doctor name</label>
                <input
                  value={safetyInfo.doctorName || ''}
                  onChange={(e) => setSafetyInfo({ ...safetyInfo, doctorName: e.target.value })}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Doctor phone</label>
                <input
                  value={safetyInfo.doctorPhone || ''}
                  onChange={(e) => setSafetyInfo({ ...safetyInfo, doctorPhone: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button type="submit" className={styles.addButton} disabled={savingSafety} style={{ border: 'none', cursor: 'pointer', flex: 1, justifyContent: 'center' }}>
                  {savingSafety ? 'Saving...' : 'Save Safety Info'}
                </button>
                {tag.hasSafetyInfo && (
                  <button type="button" onClick={handleRemoveSafetyInfo} className={styles.dangerText} style={{ background: 'none', border: '1px solid #fed7d7', borderRadius: 8, padding: '10px 16px', cursor: 'pointer' }}>
                    Remove
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TagDetail;
