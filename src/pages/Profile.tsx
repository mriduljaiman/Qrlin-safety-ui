import React, { useEffect, useRef, useState } from 'react';
import { profileAPI } from '../api/profile';
import { uploadsAPI } from '../api/uploads';
import { compressImageToTarget } from '../utils/imageCompression';
import { UserProfile } from '../types/profile';
import Header from '../components/Layout/Header';
import Loading from '../components/Common/Loading';
import styles from './Tags.module.css';

const COUNTRIES = ['India', 'United States', 'United Kingdom', 'United Arab Emirates', 'Canada', 'Australia', 'Singapore', 'Other'];

const emptyProfile: UserProfile = {
  id: 0,
  email: '',
  fullName: '',
  photoUrl: '',
  phone: '',
  whatsappNumber: '',
  emergencyContactName: '',
  emergencyContactPhone: '',
  country: 'India',
  state: '',
  city: '',
  pincode: '',
};

const Profile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    (async () => {
      try {
        const data = await profileAPI.getMe();
        setProfile({ ...emptyProfile, ...data, country: data.country || 'India' });
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const updated = await profileAPI.updateMe({
        fullName: profile.fullName,
        photoUrl: profile.photoUrl || undefined,
        phone: profile.phone || undefined,
        whatsappNumber: profile.whatsappNumber || undefined,
        emergencyContactName: profile.emergencyContactName || undefined,
        emergencyContactPhone: profile.emergencyContactPhone || undefined,
        country: profile.country || undefined,
        state: profile.state || undefined,
        city: profile.city || undefined,
        pincode: profile.pincode || undefined,
      });
      setProfile({ ...emptyProfile, ...updated });
      setSuccess('Profile updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not save profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setError('Please choose an image file');
      return;
    }

    setUploadingPhoto(true);
    setError('');
    try {
      const compressed = await compressImageToTarget(file, 20 * 1024, 400);
      const { url } = await uploadsAPI.uploadPhoto(compressed);
      setProfile((prev) => ({ ...prev, photoUrl: url }));
      const updated = await profileAPI.updateMe({ photoUrl: url });
      setProfile((prev) => ({ ...prev, ...updated }));
      setSuccess('Photo updated');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not upload photo');
    } finally {
      setUploadingPhoto(false);
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

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.formCard} style={{ maxWidth: 640 }}>
        <h1 style={{ marginTop: 0 }}>My Profile</h1>

        {error && <div style={{ background: '#fee', color: '#c33', padding: 12, borderRadius: 8, marginBottom: 16 }}>{error}</div>}
        {success && <div style={{ background: '#efe', color: '#2a2', padding: 12, borderRadius: 8, marginBottom: 16 }}>{success}</div>}

        <form onSubmit={handleSave}>
          <div className={styles.qrWrapper} style={{ marginBottom: 24 }}>
            <div
              onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
              style={{ position: 'relative', cursor: uploadingPhoto ? 'default' : 'pointer', width: 100, height: 100 }}
              title="Click to change photo"
            >
              {profile.photoUrl ? (
                <img src={profile.photoUrl} alt="Profile" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: 100, height: 100, borderRadius: '50%', background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: 'var(--gray-400)' }}>
                  {profile.fullName?.[0]?.toUpperCase() || '?'}
                </div>
              )}
              {uploadingPhoto && (
                <div style={{ position: 'absolute', inset: 0, borderRadius: '50%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Loading size="sm" />
                </div>
              )}
              <div style={{ position: 'absolute', bottom: 0, right: 0, width: 30, height: 30, borderRadius: '50%', background: 'var(--primary)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, border: '2px solid var(--surface)' }}>
                📷
              </div>
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoSelect}
              style={{ display: 'none' }}
            />
            <span className={styles.hint}>Click the photo to upload — automatically compressed to ~20KB</span>
          </div>

          <div className={styles.formGroup}>
            <label>Name</label>
            <input value={profile.fullName} onChange={(e) => handleChange('fullName', e.target.value)} required />
          </div>

          <div className={styles.formGroup}>
            <label>Email</label>
            <input value={profile.email} disabled style={{ background: 'var(--gray-50)', color: 'var(--gray-400)' }} />
          </div>

          <div className={styles.formGroup}>
            <label>Phone</label>
            <input value={profile.phone || ''} onChange={(e) => handleChange('phone', e.target.value)} placeholder="+91..." />
          </div>

          <div className={styles.formGroup}>
            <label>WhatsApp number (optional)</label>
            <input value={profile.whatsappNumber || ''} onChange={(e) => handleChange('whatsappNumber', e.target.value)} placeholder="+91..." />
          </div>

          <div className={styles.formGroup}>
            <label>Emergency contact name</label>
            <input value={profile.emergencyContactName || ''} onChange={(e) => handleChange('emergencyContactName', e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label>Emergency contact phone</label>
            <input value={profile.emergencyContactPhone || ''} onChange={(e) => handleChange('emergencyContactPhone', e.target.value)} />
          </div>

          <div className={styles.formGroup}>
            <label>Country</label>
            <select
              value={profile.country || 'India'}
              onChange={(e) => handleChange('country', e.target.value)}
              style={{ padding: '12px 16px', border: '2px solid var(--gray-200)', borderRadius: 8, fontSize: 14, background: 'var(--surface)', color: 'var(--gray-800)' }}
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className={styles.formGroup}>
              <label>State</label>
              <input value={profile.state || ''} onChange={(e) => handleChange('state', e.target.value)} />
            </div>
            <div className={styles.formGroup}>
              <label>City</label>
              <input value={profile.city || ''} onChange={(e) => handleChange('city', e.target.value)} />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Pincode</label>
            <input value={profile.pincode || ''} onChange={(e) => handleChange('pincode', e.target.value)} />
          </div>

          <button type="submit" className={styles.addButton} disabled={saving} style={{ border: 'none', cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Profile;
