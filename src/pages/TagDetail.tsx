import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { tagsAPI } from '../api/tags';
import { profileAPI } from '../api/profile';
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
  address: '',
  showContactName: false,
  showContactPhone: false,
  showAddress: false,
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
  const [safetyError, setSafetyError] = useState('');

  useEffect(() => {
    if (!id) return;
    const tagId = Number(id);

    (async () => {
      try {
        const [tagData, safety, profile] = await Promise.all([
          tagsAPI.get(tagId),
          tagsAPI.getSafetyInfo(tagId).catch(() => null),
          profileAPI.getMe().catch(() => null),
        ]);
        setTag(tagData);
        if (safety) {
          setSafetyInfo(safety);
        } else if (profile) {
          // First time attaching safety info - prefill from the owner's profile,
          // still fully editable before saving.
          setSafetyInfo({
            ...emptySafetyInfo,
            emergencyContactName: profile.fullName || '',
            emergencyContactPhone: profile.phone || '',
          });
        }

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
    setSafetyError('');

    if (!safetyInfo.showContactPhone && !safetyInfo.showAddress) {
      setSafetyError('Enable at least one of Contact Phone or Address so a finder can reach you.');
      return;
    }

    setSavingSafety(true);
    try {
      const saved = await tagsAPI.upsertSafetyInfo(tag.id, safetyInfo);
      setSafetyInfo(saved);
      setTag({ ...tag, hasSafetyInfo: true });
    } catch (err: any) {
      setSafetyError(err.response?.data?.error || 'Could not save safety info');
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
      setSafetyError(err.response?.data?.error || 'Could not remove safety info');
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
              <p style={{ color: 'var(--gray-500)', fontSize: 13, textAlign: 'center' }}>
                Print this and stick it on your item. Anyone who scans it sees only what you've chosen to share.
              </p>
            </div>

            {tag.description && (
              <p style={{ marginTop: 16 }}>{tag.description}</p>
            )}

            <div className={styles.toggleRow} style={{ marginTop: 24 }}>
              <div>
                <strong>Lost mode {tag.lostMode && <span className={styles.lostBadge} style={{ position: 'static', marginLeft: 8 }}>ACTIVE</span>}</strong>
                <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>Flags this item as lost on the public scan page</div>
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
            <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>
              Shown on the public scan page for this tag only. Contact details start filled in from your
              profile — edit them here any time, and pick exactly what a finder gets to see.
            </p>

            {safetyError && (
              <div style={{ background: '#fee', color: '#c33', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                {safetyError}
              </div>
            )}

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

              <div className={styles.toggleRow}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-700)' }}>Contact name</label>
                  <input
                    value={safetyInfo.emergencyContactName || ''}
                    onChange={(e) => setSafetyInfo({ ...safetyInfo, emergencyContactName: e.target.value })}
                    style={{ marginTop: 6, padding: '10px 12px', border: '2px solid var(--gray-200)', borderRadius: 8, width: '100%', background: 'var(--surface)', color: 'var(--gray-800)' }}
                  />
                </div>
                <label className={styles.switch} style={{ marginLeft: 12, alignSelf: 'flex-end', marginBottom: 4 }} title="Show on public scan">
                  <input
                    type="checkbox"
                    checked={safetyInfo.showContactName}
                    onChange={(e) => setSafetyInfo({ ...safetyInfo, showContactName: e.target.checked })}
                  />
                  <span className={styles.switchSlider}></span>
                </label>
              </div>

              <div className={styles.toggleRow}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-700)' }}>Contact phone</label>
                  <input
                    value={safetyInfo.emergencyContactPhone || ''}
                    onChange={(e) => setSafetyInfo({ ...safetyInfo, emergencyContactPhone: e.target.value })}
                    style={{ marginTop: 6, padding: '10px 12px', border: '2px solid var(--gray-200)', borderRadius: 8, width: '100%', background: 'var(--surface)', color: 'var(--gray-800)' }}
                  />
                </div>
                <label className={styles.switch} style={{ marginLeft: 12, alignSelf: 'flex-end', marginBottom: 4 }} title="Show on public scan">
                  <input
                    type="checkbox"
                    checked={safetyInfo.showContactPhone}
                    onChange={(e) => setSafetyInfo({ ...safetyInfo, showContactPhone: e.target.checked })}
                  />
                  <span className={styles.switchSlider}></span>
                </label>
              </div>

              <div className={styles.toggleRow}>
                <div style={{ flex: 1 }}>
                  <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-700)' }}>Address</label>
                  <input
                    value={safetyInfo.address || ''}
                    onChange={(e) => setSafetyInfo({ ...safetyInfo, address: e.target.value })}
                    style={{ marginTop: 6, padding: '10px 12px', border: '2px solid var(--gray-200)', borderRadius: 8, width: '100%', background: 'var(--surface)', color: 'var(--gray-800)' }}
                  />
                </div>
                <label className={styles.switch} style={{ marginLeft: 12, alignSelf: 'flex-end', marginBottom: 4 }} title="Show on public scan">
                  <input
                    type="checkbox"
                    checked={safetyInfo.showAddress}
                    onChange={(e) => setSafetyInfo({ ...safetyInfo, showAddress: e.target.checked })}
                  />
                  <span className={styles.switchSlider}></span>
                </label>
              </div>

              <span className={styles.hint}>Toggle switches control what's public — at least one of phone or address must be on.</span>

              <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
                <button type="submit" className={styles.addButton} disabled={savingSafety} style={{ border: 'none', cursor: 'pointer', flex: 1, justifyContent: 'center' }}>
                  {savingSafety ? 'Saving...' : 'Save'}
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
