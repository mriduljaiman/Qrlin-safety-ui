import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { tagsAPI } from '../api/tags';
import { profileAPI } from '../api/profile';
import { uploadsAPI } from '../api/uploads';
import { compressImageToTarget } from '../utils/imageCompression';
import { Tag, SafetyInfo } from '../types/tag';
import Header from '../components/Layout/Header';
import Loading from '../components/Common/Loading';
import Modal from '../components/Common/Modal';
import ChatPanel from '../components/ChatPanel';
import PreviewQrOnly from '../components/PreviewQrOnly';
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
  whatsappNumber: '',
  showContactName: false,
  showContactPhone: false,
  showAddress: false,
  showWhatsapp: false,
  customFields: [],
};

const TagDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tag, setTag] = useState<Tag | null>(null);
  const [loading, setLoading] = useState(true);
  const [safetyInfo, setSafetyInfo] = useState<SafetyInfo>(emptySafetyInfo);
  const [savingSafety, setSavingSafety] = useState(false);
  const [error, setError] = useState('');
  const [safetyError, setSafetyError] = useState('');
  const [safetySuccess, setSafetySuccess] = useState('');
  const safetyCardRef = useRef<HTMLDivElement>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [editOpen, setEditOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);

  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldValue, setNewFieldValue] = useState('');

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
          setSafetyInfo({ ...safety, customFields: safety.customFields || [] });
        } else if (profile) {
          // First time attaching safety info - prefill from the owner's profile,
          // still fully editable before saving.
          setSafetyInfo({
            ...emptySafetyInfo,
            emergencyContactName: profile.fullName || '',
            emergencyContactPhone: profile.phone || '',
            whatsappNumber: profile.whatsappNumber || '',
          });
        }
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

  const openEdit = () => {
    if (!tag) return;
    setEditName(tag.tagName);
    setEditDescription(tag.description || '');
    setEditOpen(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tag) return;
    setSavingEdit(true);
    try {
      const updated = await tagsAPI.update(tag.id, {
        category: tag.category,
        tagName: editName,
        description: editDescription,
      });
      setTag(updated);
      setEditOpen(false);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not update tag');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeactivate = async () => {
    if (!tag) return;
    try {
      await tagsAPI.deactivate(tag.id);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not deactivate tag');
      setConfirmDeleteOpen(false);
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !tag) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file');
      return;
    }

    setUploadingPhoto(true);
    setError('');
    try {
      const compressed = await compressImageToTarget(file, 20 * 1024, 400);
      const { url } = await uploadsAPI.uploadPhoto(compressed);
      const updated = await tagsAPI.update(tag.id, { category: tag.category, tagName: tag.tagName, photoUrl: url });
      setTag(updated);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleAddCustomField = () => {
    if (!newFieldLabel.trim() || !newFieldValue.trim()) return;
    setSafetyInfo({
      ...safetyInfo,
      customFields: [...safetyInfo.customFields, { label: newFieldLabel.trim(), value: newFieldValue.trim() }],
    });
    setNewFieldLabel('');
    setNewFieldValue('');
  };

  const handleRemoveCustomField = (index: number) => {
    setSafetyInfo({
      ...safetyInfo,
      customFields: safetyInfo.customFields.filter((_, i) => i !== index),
    });
  };

  const handleSaveSafetyInfo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tag) return;
    setSafetyError('');
    setSafetySuccess('');

    if (!safetyInfo.showContactPhone && !safetyInfo.showAddress) {
      setSafetyError('Enable at least one of Contact Phone or Address so a finder can reach you.');
      safetyCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }

    setSavingSafety(true);
    try {
      const saved = await tagsAPI.upsertSafetyInfo(tag.id, safetyInfo);
      setSafetyInfo({ ...saved, customFields: saved.customFields || [] });
      setTag({ ...tag, hasSafetyInfo: true });
      setSafetySuccess('Safety info saved');
      setTimeout(() => setSafetySuccess(''), 4000);
    } catch (err: any) {
      setSafetyError(err.response?.data?.error || 'Could not save safety info');
      safetyCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
            <h1 className={styles.pageTitle} style={{ marginTop: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
              {tag.tagName}
              <button
                onClick={openEdit}
                title="Edit tag"
                style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: 'var(--gray-400)' }}
              >
                ✏️
              </button>
            </h1>
          </div>
        </div>

        {error && (
          <div style={{ background: '#fee', color: '#c33', padding: 12, borderRadius: 8, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <div className={styles.detailGrid}>
          <div className={styles.detailCard}>
            <PreviewQrOnly tagId={tag.id} />

            <div
              onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
              style={{
                position: 'relative',
                cursor: uploadingPhoto ? 'default' : 'pointer',
                border: '2px dashed var(--gray-200)',
                borderRadius: 8,
                padding: tag.photoUrl ? 0 : 20,
                textAlign: 'center',
                overflow: 'hidden',
                marginTop: 16,
              }}
            >
              {tag.photoUrl ? (
                <img src={tag.photoUrl} alt={tag.tagName} style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }} />
              ) : (
                <span style={{ color: 'var(--gray-400)', fontSize: 14 }}>
                  {uploadingPhoto ? 'Uploading...' : '📷 Click to add a photo'}
                </span>
              )}
              {uploadingPhoto && (
                <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Loading size="sm" />
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              style={{ display: 'none' }}
            />

            {tag.description && (
              <p style={{ marginTop: 16 }}>{tag.description}</p>
            )}

            <div className={styles.toggleRow} style={{ marginTop: 24 }}>
              <div>
                <strong>Lost mode {tag.lostMode && <span className={styles.lostBadge} style={{ position: 'static', marginLeft: 8 }}>ACTIVE</span>}</strong>
                <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>
                  When on, anyone who scans this tag sees a red "reported lost" banner on the public page —
                  useful for a lost bag or pet so a finder immediately knows to reach out.
                </div>
              </div>
              <button onClick={toggleLostMode} className={styles.addButton} style={{ border: 'none', cursor: 'pointer' }}>
                {tag.lostMode ? 'Remove Lost Mode' : 'Mark as Lost'}
              </button>
            </div>

            <button
              onClick={() => setConfirmDeleteOpen(true)}
              className={styles.dangerText}
              style={{ background: 'none', border: '1px solid #fed7d7', borderRadius: 8, padding: '10px 16px', cursor: 'pointer', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
            >
              🗑️ Deactivate Tag
            </button>
          </div>

          <div className={styles.detailCard} ref={safetyCardRef}>
            <h2 style={{ marginTop: 0 }}>Safety Info</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>
              Shown on the public scan page for this tag only. Contact details start filled in from your
              profile — edit them here any time, and pick exactly what a finder gets to see.
            </p>

            {safetyError && (
              <div style={{ background: '#fee', color: '#c33', padding: 12, borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>
                ⚠️ {safetyError}
              </div>
            )}
            {safetySuccess && (
              <div style={{ background: '#efe', color: '#2a2', padding: 12, borderRadius: 8, marginBottom: 16, fontWeight: 600 }}>
                ✓ {safetySuccess}
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
                  <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-700)' }}>WhatsApp number</label>
                  <input
                    value={safetyInfo.whatsappNumber || ''}
                    onChange={(e) => setSafetyInfo({ ...safetyInfo, whatsappNumber: e.target.value })}
                    placeholder="+91XXXXXXXXXX"
                    style={{ marginTop: 6, padding: '10px 12px', border: '2px solid var(--gray-200)', borderRadius: 8, width: '100%', background: 'var(--surface)', color: 'var(--gray-800)' }}
                  />
                </div>
                <label className={styles.switch} style={{ marginLeft: 12, alignSelf: 'flex-end', marginBottom: 4 }} title="Show on public scan">
                  <input
                    type="checkbox"
                    checked={safetyInfo.showWhatsapp}
                    onChange={(e) => setSafetyInfo({ ...safetyInfo, showWhatsapp: e.target.checked })}
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

              <div style={{ marginTop: 20 }}>
                <label style={{ fontSize: 14, fontWeight: 600, color: 'var(--gray-700)' }}>Anything else? (shown publicly)</label>
                <div style={{ fontSize: 12, color: 'var(--gray-500)', marginTop: 2, marginBottom: 10 }}>
                  Add extra fields — a reward amount, an alternate contact, anything you want a finder to see.
                </div>

                {safetyInfo.customFields.length > 0 && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
                    {safetyInfo.customFields.map((field, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'var(--gray-50)', borderRadius: 8, padding: '8px 12px' }}>
                        <div style={{ flex: 1, fontSize: 13 }}>
                          <strong>{field.label}:</strong> {field.value}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomField(i)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-400)', fontSize: 16 }}
                          title="Remove"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className={styles.customFieldRow}>
                  <input
                    value={newFieldLabel}
                    onChange={(e) => setNewFieldLabel(e.target.value)}
                    placeholder="Title (e.g. Reward)"
                    style={{ padding: '10px 12px', border: '2px solid var(--gray-200)', borderRadius: 8, background: 'var(--surface)', color: 'var(--gray-800)' }}
                  />
                  <input
                    value={newFieldValue}
                    onChange={(e) => setNewFieldValue(e.target.value)}
                    placeholder="Value (e.g. ₹500)"
                    style={{ padding: '10px 12px', border: '2px solid var(--gray-200)', borderRadius: 8, background: 'var(--surface)', color: 'var(--gray-800)' }}
                  />
                  <button
                    type="button"
                    onClick={handleAddCustomField}
                    disabled={!newFieldLabel.trim() || !newFieldValue.trim()}
                    className={styles.addButton}
                    style={{ border: 'none', cursor: 'pointer' }}
                  >
                    + Add
                  </button>
                </div>
              </div>

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
              {safetySuccess && <p style={{ textAlign: 'center', color: '#2a2', fontWeight: 600, marginTop: 12 }}>✓ {safetySuccess}</p>}
              {safetyError && <p style={{ textAlign: 'center', color: '#c33', fontWeight: 600, marginTop: 12 }}>⚠️ {safetyError}</p>}
            </form>
          </div>
        </div>

        <ChatPanel tagId={tag.id} />
      </div>

      <Modal isOpen={editOpen} onClose={() => setEditOpen(false)} title="Edit tag">
        <form onSubmit={handleSaveEdit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className={styles.formGroup} style={{ marginBottom: 0 }}>
            <label>Name</label>
            <input value={editName} onChange={(e) => setEditName(e.target.value)} required />
          </div>
          <div className={styles.formGroup} style={{ marginBottom: 0 }}>
            <label>Description</label>
            <textarea value={editDescription} onChange={(e) => setEditDescription(e.target.value)} rows={3} />
          </div>
          <button type="submit" className={styles.addButton} disabled={savingEdit} style={{ border: 'none', cursor: 'pointer', justifyContent: 'center' }}>
            {savingEdit ? 'Saving...' : 'Save'}
          </button>
        </form>
      </Modal>

      <Modal isOpen={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)} title="Deactivate this tag?">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <p style={{ margin: 0, color: 'var(--gray-600)' }}>
            This tag will stop resolving when scanned. Anyone scanning it afterward will see nothing.
            This can't be undone from here.
          </p>
          <div style={{ display: 'flex', gap: 12 }}>
            <button
              onClick={() => setConfirmDeleteOpen(false)}
              style={{ flex: 1, padding: '10px 16px', border: '2px solid var(--gray-200)', borderRadius: 8, background: 'var(--surface)', color: 'var(--gray-700)', cursor: 'pointer', fontWeight: 600 }}
            >
              Cancel
            </button>
            <button
              onClick={handleDeactivate}
              style={{ flex: 1, padding: '10px 16px', border: 'none', borderRadius: 8, background: '#e53e3e', color: 'white', cursor: 'pointer', fontWeight: 600 }}
            >
              Deactivate
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default TagDetail;
