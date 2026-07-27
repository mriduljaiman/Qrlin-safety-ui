import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tagsAPI } from '../api/tags';
import Header from '../components/Layout/Header';
import styles from './Tags.module.css';

const AddTag: React.FC = () => {
  const navigate = useNavigate();
  const [category, setCategory] = useState('');
  const [tagName, setTagName] = useState('');
  const [description, setDescription] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
        <p style={{ color: '#718096', marginTop: -8 }}>
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
            <input
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Earbuds, Bike, Medicine Kit, anything..."
              required
            />
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
            <label htmlFor="photoUrl">Photo URL (optional)</label>
            <input
              id="photoUrl"
              value={photoUrl}
              onChange={(e) => setPhotoUrl(e.target.value)}
              placeholder="https://..."
            />
          </div>

          <button type="submit" className={styles.addButton} disabled={loading} style={{ width: '100%', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
            {loading ? 'Creating...' : 'Create Tag'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddTag;
