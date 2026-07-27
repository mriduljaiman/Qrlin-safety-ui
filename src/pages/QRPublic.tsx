import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { qrAPI } from '../api/qr';
import { useGeolocation } from '../hooks/useGeolocation';
import { ProfileResponse } from '../types/qr';
import styles from './QRPublic.module.css';

const QRPublic: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactData, setContactData] = useState({
    type: 'CALL',
    message: '',
    phone: '',
    name: '',
  });
  const location = useGeolocation();

  useEffect(() => {
    if (code) {
      loadProfile();
    }
  }, [code]);

  const loadProfile = async () => {
    try {
      const data = await qrAPI.getPublicProfile(
        code!,
        location.latitude || undefined,
        location.longitude || undefined
      );
      setProfile(data);
    } catch (error) {
      console.error('Failed to load profile', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContact = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await qrAPI.contactOwner(code!, contactData);
      alert('Owner has been notified!');
      setShowContactForm(false);
    } catch (error) {
      alert('Failed to contact owner');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (!profile) {
    return <div className={styles.error}>Profile not found</div>;
  }

  return (
    <div className={styles.publicContainer}>
      {profile.lostMode && (
        <motion.div 
          className={styles.lostBanner}
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          🚨 LOST MODE ACTIVE 🚨
        </motion.div>
      )}

      <div className={styles.profileCard}>
        {profile.data.photoUrl && (
          <img 
            src={profile.data.photoUrl} 
            alt="Profile" 
            className={styles.profileImage}
          />
        )}

        <h1 className={styles.profileName}>
          {profile.data.name || 'Emergency Contact Required'}
        </h1>

        <div className={styles.profileDetails}>
          {profile.profileType === 'PET' && (
            <>
              <p><strong>Species:</strong> {profile.data.species}</p>
              <p><strong>Breed:</strong> {profile.data.breed}</p>
              <p><strong>Age:</strong> {profile.data.age} years</p>
              <p><strong>Gender:</strong> {profile.data.gender}</p>
              {profile.data.description && (
                <p><strong>Description:</strong> {profile.data.description}</p>
              )}
            </>
          )}

          {profile.profileType === 'CHILD' && (
            <>
              <p className={styles.emergencyText}>
                {profile.data.publicMessage || 'This child needs help returning home'}
              </p>
            </>
          )}

          {profile.profileType === 'ELDERLY' && (
            <>
              <p><strong>Age:</strong> {profile.data.age} years</p>
              {profile.data.helpMessage && (
                <p className={styles.helpMessage}>{profile.data.helpMessage}</p>
              )}
            </>
          )}

          {profile.profileType === 'ITEM' && (
            <>
              <p><strong>Type:</strong> {profile.data.itemType}</p>
              <p><strong>Description:</strong> {profile.data.description}</p>
              {profile.data.rewardMessage && (
                <p className={styles.rewardMessage}>🎁 {profile.data.rewardMessage}</p>
              )}
            </>
          )}
        </div>

        <div className={styles.contactSection}>
          <p className={styles.maskedContact}>
            Owner Contact: {profile.maskedContact}
          </p>
          
          <button 
            onClick={() => setShowContactForm(!showContactForm)}
            className={styles.contactButton}
          >
            Contact Owner
          </button>

          {showContactForm && (
            <motion.form 
              onSubmit={handleContact}
              className={styles.contactForm}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <div className={styles.formGroup}>
                <label>Your Name</label>
                <input
                  type="text"
                  value={contactData.name}
                  onChange={(e) => setContactData({ ...contactData, name: e.target.value })}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Your Phone</label>
                <input
                  type="tel"
                  value={contactData.phone}
                  onChange={(e) => setContactData({ ...contactData, phone: e.target.value })}
                  required
                  />
                  </div>
                  <div className={styles.formGroup}>
            <label>Message (Optional)</label>
            <textarea
              value={contactData.message}
              onChange={(e) => setContactData({ ...contactData, message: e.target.value })}
              rows={3}
            />
          </div>

          <button type="submit" className={styles.submitButton}>
            Send to Owner
          </button>
        </motion.form>
      )}
    </div>
  </div>
</div>
);
};
export default QRPublic;