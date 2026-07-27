import React, { useEffect, useState } from 'react';
import { profileAPI } from '../api/profile';
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
            {profile.photoUrl ? (
              <img src={profile.photoUrl} alt="Profile" style={{ width: 100, height: 100, borderRadius: '50%', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: 100, height: 100, borderRadius: '50%', background: '#edf2f7', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: '#a0aec0' }}>
                {profile.fullName?.[0]?.toUpperCase() || '?'}
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>Profile photo URL</label>
            <input value={profile.photoUrl || ''} onChange={(e) => handleChange('photoUrl', e.target.value)} placeholder="https://..." />
          </div>

          <div className={styles.formGroup}>
            <label>Name</label>
            <input value={profile.fullName} onChange={(e) => handleChange('fullName', e.target.value)} required />
          </div>

          <div className={styles.formGroup}>
            <label>Email</label>
            <input value={profile.email} disabled style={{ background: '#f7fafc', color: '#a0aec0' }} />
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
              style={{ padding: '12px 16px', border: '2px solid #e2e8f0', borderRadius: 8, fontSize: 14 }}
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
