import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import StaticLayout from '../components/Layout/StaticLayout';
import CategoryCombobox from '../components/CategoryCombobox';
import { publicSafeTagRequestAPI } from '../api/safeTagRequests';
import styles from './Tags.module.css';

// No-login intake (Phase 4) - anyone can request a physical SafeTag before creating an account.
// Lands in the admin queue for fulfillment; see AdminSafeTagRequestsQueue on the admin side.
const RequestSafeTag: React.FC = () => {
  const [requesterName, setRequesterName] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [requesterPhone, setRequesterPhone] = useState('');
  const [category, setCategory] = useState('');
  const [tagName, setTagName] = useState('');
  const [description, setDescription] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await publicSafeTagRequestAPI.submit({
        requesterName, requesterEmail, requesterPhone: requesterPhone || undefined,
        category, tagName, description: description || undefined, shippingAddress,
      });
      setSubmitted(true);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not submit your request');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <StaticLayout>
        <div className={styles.formCard}>
          <h1 style={{ marginTop: 0 }}>Request received</h1>
          <p style={{ color: 'var(--gray-500)' }}>
            We've emailed you a confirmation at {requesterEmail}. Our team will review your request
            and be in touch once your SafeTag is on its way.
          </p>
          <Link to="/" style={{ color: 'var(--primary)', fontWeight: 600 }}>← Back to home</Link>
        </div>
      </StaticLayout>
    );
  }

  return (
    <StaticLayout>
      <div className={styles.formCard}>
          <h1 style={{ marginTop: 0 }}>Request a SafeTag</h1>
          <p style={{ color: 'var(--gray-500)', marginTop: -8 }}>
            No account needed - tell us what you'd like protected and where to send it.
          </p>

          {error && (
            <div style={{ background: '#fee', color: '#c33', padding: 12, borderRadius: 8, marginBottom: 16 }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="requesterName">Your name</label>
              <input id="requesterName" value={requesterName} onChange={(e) => setRequesterName(e.target.value)} required />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="requesterEmail">Your email</label>
              <input id="requesterEmail" type="email" value={requesterEmail} onChange={(e) => setRequesterEmail(e.target.value)} required />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="requesterPhone">Phone (optional)</label>
              <input id="requesterPhone" value={requesterPhone} onChange={(e) => setRequesterPhone(e.target.value)} />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="category">What are you protecting?</label>
              <CategoryCombobox id="category" value={category} onChange={setCategory} />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="tagName">Give it a name</label>
              <input id="tagName" value={tagName} onChange={(e) => setTagName(e.target.value)} placeholder="My AirPods" required />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="description">Description (optional)</label>
              <textarea id="description" value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="shippingAddress">Shipping address</label>
              <textarea
                id="shippingAddress"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                rows={3}
                placeholder="Where should we send the physical SafeTag?"
                required
              />
            </div>

            <button type="submit" className={styles.addButton} disabled={loading} style={{ width: '100%', justifyContent: 'center', border: 'none', cursor: 'pointer' }}>
              {loading ? 'Submitting...' : 'Submit Request'}
            </button>
          </form>
        </div>
    </StaticLayout>
  );
};

export default RequestSafeTag;
