import React from 'react';
import styles from './QRPublicView.module.css';

interface QRPublicViewProps {
  profileData: any;
}

const QRPublicView: React.FC<QRPublicViewProps> = ({ profileData }) => {
  return (
    <div className={styles.container}>
      <h2>Public QR View Component</h2>
      <pre>{JSON.stringify(profileData, null, 2)}</pre>
    </div>
  );
};

export default QRPublicView;