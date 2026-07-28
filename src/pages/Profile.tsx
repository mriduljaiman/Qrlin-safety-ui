import React, { useEffect, useRef, useState } from 'react';
import { profileAPI } from '../api/profile';
import { uploadsAPI } from '../api/uploads';
import { compressImageToTarget } from '../utils/imageCompression';
import { loadCountries, loadPhoneCodes, loadStates, loadCities, CountryOption } from '../utils/geoData';
import { SearchableSelectOption } from '../components/Common/SearchableSelect';
import SearchableSelect from '../components/Common/SearchableSelect';
import { UserProfile } from '../types/profile';
import Header from '../components/Layout/Header';
import Loading from '../components/Common/Loading';
import styles from './Tags.module.css';

const emptyProfile: UserProfile = {
  id: 0,
  email: '',
  fullName: '',
  photoUrl: '',
  phone: '',
  phoneCountryCode: '+91',
  whatsappNumber: '',
  whatsappCountryCode: '+91',
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

  const [geoLoading, setGeoLoading] = useState(true);
  const [countries, setCountries] = useState<CountryOption[]>([]);
  const [phoneCodes, setPhoneCodes] = useState<SearchableSelectOption[]>([]);
  const [states, setStates] = useState<SearchableSelectOption[]>([]);
  const [cities, setCities] = useState<SearchableSelectOption[]>([]);
  const [countryIso, setCountryIso] = useState('IN');
  const [stateIso, setStateIso] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [data, countryList, codeList] = await Promise.all([
          profileAPI.getMe(),
          loadCountries(),
          loadPhoneCodes(),
        ]);
        setCountries(countryList);
        setPhoneCodes(codeList);

        const merged: UserProfile = {
          ...emptyProfile,
          ...data,
          country: data.country || 'India',
          phoneCountryCode: data.phoneCountryCode || '+91',
          whatsappCountryCode: data.whatsappCountryCode || '+91',
        };
        setProfile(merged);

        const matchedCountry =
          countryList.find((c) => c.label.toLowerCase().includes(merged.country!.toLowerCase())) ||
          countryList.find((c) => c.value === 'IN');
        if (matchedCountry) {
          setCountryIso(matchedCountry.value);
          const stateList = await loadStates(matchedCountry.value);
          setStates(stateList);
          const matchedState = merged.state
            ? stateList.find((s) => s.label.toLowerCase() === merged.state!.toLowerCase())
            : null;
          if (matchedState) {
            setStateIso(matchedState.value);
            const cityList = await loadCities(matchedCountry.value, matchedState.value);
            setCities(cityList);
          }
        }
      } catch (err) {
        console.error('Failed to load profile', err);
      } finally {
        setLoading(false);
        setGeoLoading(false);
      }
    })();
  }, []);

  const handleChange = (field: keyof UserProfile, value: string) => {
    setProfile({ ...profile, [field]: value });
  };

  const handleCountryChange = async (iso: string) => {
    const country = countries.find((c) => c.value === iso);
    if (!country) return;
    setCountryIso(iso);
    setStateIso('');
    setCities([]);
    setProfile((prev) => ({
      ...prev,
      country: country.label.replace(/^\S+\s/, ''),
      state: '',
      city: '',
      phoneCountryCode: country.phoneCode,
      whatsappCountryCode: country.phoneCode,
    }));
    const stateList = await loadStates(iso);
    setStates(stateList);
  };

  const handleStateChange = async (iso: string) => {
    const state = states.find((s) => s.value === iso);
    if (!state) return;
    setStateIso(iso);
    setProfile((prev) => ({ ...prev, state: state.label, city: '' }));
    const cityList = await loadCities(countryIso, iso);
    setCities(cityList);
  };

  const handleCityChange = (name: string) => {
    setProfile((prev) => ({ ...prev, city: name }));
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
        phoneCountryCode: profile.phoneCountryCode || undefined,
        whatsappNumber: profile.whatsappNumber || undefined,
        whatsappCountryCode: profile.whatsappCountryCode || undefined,
        emergencyContactName: profile.emergencyContactName || undefined,
        emergencyContactPhone: profile.emergencyContactPhone || undefined,
        country: profile.country || undefined,
        state: profile.state || undefined,
        city: profile.city || undefined,
        pincode: profile.pincode || undefined,
      });
      setProfile((prev) => ({ ...prev, ...updated }));
      setSuccess('Profile updated');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setTimeout(() => setSuccess(''), 4000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not save profile');
      window.scrollTo({ top: 0, behavior: 'smooth' });
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
            <div className={styles.phoneRow}>
              <SearchableSelect
                value={profile.phoneCountryCode || '+91'}
                onChange={(v) => handleChange('phoneCountryCode', v)}
                options={phoneCodes}
                disabled={geoLoading}
                placeholder="+91"
              />
              <input
                value={profile.phone || ''}
                onChange={(e) => handleChange('phone', e.target.value)}
                placeholder="9876543210"
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>WhatsApp number (optional)</label>
            <div className={styles.phoneRow}>
              <SearchableSelect
                value={profile.whatsappCountryCode || '+91'}
                onChange={(v) => handleChange('whatsappCountryCode', v)}
                options={phoneCodes}
                disabled={geoLoading}
                placeholder="+91"
              />
              <input
                value={profile.whatsappNumber || ''}
                onChange={(e) => handleChange('whatsappNumber', e.target.value)}
                placeholder="9876543210"
              />
            </div>
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
            <SearchableSelect
              value={countryIso}
              onChange={handleCountryChange}
              options={countries}
              disabled={geoLoading}
              placeholder="Search country..."
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div className={styles.formGroup}>
              <label>State</label>
              <SearchableSelect
                value={stateIso}
                onChange={handleStateChange}
                options={states}
                disabled={geoLoading || states.length === 0}
                placeholder="Search state..."
              />
            </div>
            <div className={styles.formGroup}>
              <label>City</label>
              <SearchableSelect
                value={profile.city || ''}
                onChange={handleCityChange}
                options={cities}
                disabled={geoLoading || cities.length === 0}
                placeholder="Search city..."
              />
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>Pincode</label>
            <input value={profile.pincode || ''} onChange={(e) => handleChange('pincode', e.target.value)} />
          </div>

          <button type="submit" className={styles.addButton} disabled={saving} style={{ border: 'none', cursor: 'pointer', width: '100%', justifyContent: 'center' }}>
            {saving ? 'Saving...' : 'Save Profile'}
          </button>
          {success && <p style={{ textAlign: 'center', color: '#2a2', fontWeight: 600, marginTop: 12 }}>✓ {success}</p>}
          {error && <p style={{ textAlign: 'center', color: '#c33', fontWeight: 600, marginTop: 12 }}>{error}</p>}
        </form>
      </div>
    </div>
  );
};

export default Profile;
