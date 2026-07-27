import React from 'react';
import { motion } from 'framer-motion';
import styles from './ProfileCard.module.css';

interface ProfileCardProps {
  type: string;
  name: string;
  details: string;
  photoUrl?: string;
  lostMode?: boolean;
  onClick?: () => void;
}

const ProfileCard: React.FC<ProfileCardProps> = ({
  type,
  name,
  details,
  photoUrl,
  lostMode,
  onClick,
}) => {
  const getTypeIcon = () => {
    switch (type) {
      case 'PET': return '🐾';
      case 'CHILD': return '👶';
      case 'ELDERLY': return '👴';
      case 'ITEM': return '🎒';
      default: return '📋';
    }
  };

  return (
    <motion.div
      className={`${styles.card} ${lostMode ? styles.lostMode : ''}`}
      whileHover={{ scale: 1.02 }}
      onClick={onClick}
    >
      {lostMode && <div className={styles.lostBadge}>🚨 LOST</div>}
      
      <div className={styles.header}>
        {photoUrl ? (
          <img src={photoUrl} alt={name} className={styles.photo} />
        ) : (
          <div className={styles.iconPlaceholder}>{getTypeIcon()}</div>
        )}
        <div className={styles.info}>
          <h3 className={styles.name}>{name}</h3>
          <p className={styles.type}>{type}</p>
        </div>
      </div>
      
      <p className={styles.details}>{details}</p>
    </motion.div>
  );
};

export default ProfileCard;