import React, { useEffect, useState } from 'react';
import Header from '../components/Layout/Header';
import ScanHistory from '../components/Scan/ScanHistory';
import styles from './ScanHistory.module.css';

const ScanHistoryPage: React.FC = () => {
  const [scans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadScans();
  }, []);

  const loadScans = async () => {
    try {
      // This would need QR ID - placeholder
      setLoading(false);
    } catch (error) {
      console.error('Failed to load scans', error);
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      
      <div className={styles.content}>
        <h1 className={styles.title}>Scan History</h1>
        
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ScanHistory scans={scans} />
        )}
      </div>
    </div>
  );
};

export default ScanHistoryPage;