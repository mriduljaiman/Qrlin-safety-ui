import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tagsAPI } from '../api/tags';
import { uploadsAPI } from '../api/uploads';
import { compressImageToTarget } from '../utils/imageCompression';
import Header from '../components/Layout/Header';
import Loading from '../components/Common/Loading';
import styles from './Tags.module.css';

const CATEGORY_OPTIONS = [
  'Mobile',
  'Earpods',
  'School Bag / Travel Bag',
  'Children Safety',
  'Person Safety',
  'Vehicle Safety',
  'Pet',
  'Jewellery',
];

const OTHER_VALUE = '__other__';

const AddTag: React.FC = () => {
  const navigate = useNavigate();
  const [categorySelect, setCategorySelect] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const category = categorySelect === OTHER_VALUE ? customCategory : categorySelect;
  const [tagName, setTagName] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
      setPhotoUrl(url);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not upload photo');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const tag = await tagsAPI.create({ category, tagName, description, photoUrl });
      navigate(`/tags/${tag.id}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not create tag');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.formCard}>
        <h1 style={{ marginTop: 0 }}>Add a Tag</h1>
        <p style={{ color: 'var(--gray-500)', marginTop: -8 }}>
          Type whatever this is — there's no fixed list.
        </p>

        {error && (
          <div style={{ background: '#fee', color: '#c33', padding: 12, borderRadius: 8, marginBottom: 16 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label htmlFor="category">Category</label>
            <select
              id="category"
              value={categorySelect}
              onChange={(e) => setCategorySelect(e.target.value)}
              required
              style={{ padding: '12px 16px', border: '2px solid var(--gray-200)', borderRadius: 8, fontSize: 14, background: 'var(--surface)', color: 'var(--gray-800)' }}
            >
              <option value="" disabled>Select a category</option>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
              <option value={OTHER_VALUE}>Other (type your own)</option>
            </select>

            {categorySelect === OTHER_VALUE && (
              <input
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Type your own category"
                required
                autoFocus
                style={{ marginTop: 8 }}
              />
            )}
            <span className={styles.hint}>Pick from the list or choose "Other" to type anything — nothing is fixed.</span>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="tagName">Name</label>
            <input
              id="tagName"
              value={tagName}
              onChange={(e) => setTagName(e.target.value)}
              placeholder="My AirPods"
              required
            />
            <span className={styles.hint}>Shown to anyone who scans this tag — keep it non-identifying if privacy matters.</span>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description (optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any details that help someone identify it"
              rows={3}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Photo (optional)</label>
            <div
              onClick={() => !uploadingPhoto && fileInputRef.current?.click()}
              style={{
                position: 'relative',
                cursor: uploadingPhoto ? 'default' : 'pointer',
                border: '2px dashed var(--gray-200)',
                borderRadius: 8,
                padding: photoUrl ? 0 : 24,
                textAlign: 'center',
                overflow: 'hidden',
              }}
            >
              {photoUrl ? (
                <img src={photoUrl} alt="Tag" style={{ width: '100%', height: 160, objectFit: 'cover', display: 'block' }} />
              ) : (
                <span style={{ color: 'var(--gray-400)', fontSize: 14 }}>
                  {uploadingPhoto ? 'Uploading...' : '📷 Click to select a photo'}
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
            {photoUrl && (
              <button
                type="button"
                onClick={() => setPhotoUrl('')}
                style={{ background: 'none', border: 'none', color: 'var(--gray-500)', fontSize: 13, cursor: 'pointer', textAlign: 'left', padding: 0 }}
              >
                Remove photo
              </button>
            )}
          </div>

          <button type="submit" className={styles.addButton} disabled={loading || uploadingPhoto} style={{ width: '100%', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
            {loading ? 'Creating...' : 'Create Tag'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTag;
