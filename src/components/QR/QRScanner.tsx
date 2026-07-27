import React from 'react';
import styles from './QRScanner.module.css';

const QRScanner: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.placeholder}>
        <p>📷</p>
        <p>QR Scanner Placeholder</p>
        <p className={styles.note}>
          Use device camera or upload QR image
        </p>
      </div>
    </div>
  );
};

export default QRScanner;