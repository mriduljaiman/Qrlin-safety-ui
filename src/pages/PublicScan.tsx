import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { publicScanAPI } from '../api/tags';
import { useGeolocation } from '../hooks/useGeolocation';
import { PublicTag } from '../types/tag';
import styles from './PublicScan.module.css';

const PublicScan: React.FC = () => {
  const { code } = useParams<{ code: string }>();
  const [tag, setTag] = useState<PublicTag | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const location = useGeolocation();

  useEffect(() => {
    if (!code) return;
    (async () => {
      try {
        const data = await publicScanAPI.scan(code, location.latitude || undefined, location.longitude || undefined);
        setTag(data);
      } catch (error) {
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  if (loading) {
    return (
      <div className={styles.publicContainer}>
        <p className={styles.loading}>Loading...</p>
      </div>
    );
  }

  if (notFound || !tag) {
    return (
      <div className={styles.publicContainer}>
        <p className={styles.error}>This tag isn't active or doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className={styles.publicContainer}>
      {tag.lostMode && (
        <motion.div
          className={styles.lostBanner}
          animate={{ opacity: [1, 0.7, 1] }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        >
          This item has been reported lost
        </motion.div>
      )}

      <div className={styles.profileCard}>
        {tag.photoUrl && <img src={tag.photoUrl} alt={tag.tagName} className={styles.profileImage} />}

        <span className={styles.categoryBadge}>{tag.category}</span>
        <h1 className={styles.tagName}>{tag.tagName}</h1>

        {tag.description && <p className={styles.description}>{tag.description}</p>}

        {tag.publicMessage && (
          <div className={styles.publicMessage}>{tag.publicMessage}</div>
        )}

        <div className={styles.contactSection}>
          {tag.maskedContact ? (
            <p className={styles.maskedContact}>Owner contact: {tag.maskedContact}</p>
          ) : (
            <p className={styles.maskedContact}>No contact info shared for this tag.</p>
          )}
          <p className={styles.comingSoon}>In-app messaging and masked calling are coming soon.</p>
        </div>
      </div>
    </div>
  );
};

export default PublicScan;
