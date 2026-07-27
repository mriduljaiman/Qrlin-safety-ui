import React from 'react';
import styles from './ScanMap.module.css';

interface ScanMapProps {
  latitude?: string;
  longitude?: string;
}

const ScanMap: React.FC<ScanMapProps> = ({ latitude, longitude }) => {
  return (
    <div className={styles.container}>
      <div className={styles.placeholder}>
        <p>🗺️</p>
        <p>Map Placeholder</p>
        {latitude && longitude && (
          <p className={styles.coords}>
            Lat: {latitude}, Lng: {longitude}
          </p>
        )}
      </div>
    </div>
  );
};

export default ScanMap;