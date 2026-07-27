import React from 'react';
import { ScanLog } from '../../types/scan';
import styles from './ScanHistory.module.css';

interface ScanHistoryProps {
  scans: ScanLog[];
}

const ScanHistory: React.FC<ScanHistoryProps> = ({ scans }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className={styles.container}>
      <h3 className={styles.title}>Scan History</h3>
      
      {scans.length === 0 ? (
        <p className={styles.empty}>No scans yet</p>
      ) : (
        <div className={styles.list}>
          {scans.map((scan) => (
            <div key={scan.id} className={styles.scanItem}>
              <div className={styles.scanHeader}>
                <span className={styles.date}>{formatDate(scan.scannedAt)}</span>
                <span className={styles.ip}>{scan.ipAddress}</span>
              </div>
              {(scan.city || scan.country) && (
                <div className={styles.location}>
                  📍 {scan.city}, {scan.country}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScanHistory;