import React, { useEffect, useState } from 'react';
import Header from '../components/Layout/Header';
import Loading from '../components/Common/Loading';
import ScanLocationMap from '../components/ScanLocationMap';
import { scansAPI } from '../api/scans';
import { LastScan as LastScanType } from '../types/scan';
import { useCountryTimezone } from '../hooks/useCountryTimezone';
import styles from './Tags.module.css';

const LastScanPage: React.FC = () => {
  const [scans, setScans] = useState<LastScanType[]>([]);
  const [loading, setLoading] = useState(true);
  const countryTz = useCountryTimezone();

  useEffect(() => {
    (async () => {
      try {
        const data = await scansAPI.getLastScans();
        setScans(data);
      } catch (err) {
        console.error('Failed to load last scans', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <Loading fullScreen />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <div className={styles.headerRow}>
          <h1 className={styles.pageTitle}>Last Scan</h1>
        </div>

        {scans.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>No scans yet</h2>
            <p>Once someone scans one of your tags, the location will show up here permanently.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {scans.map((scan) => (
              <div key={scan.tagId} className={styles.detailCard}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  {scan.photoUrl ? (
                    <img src={scan.photoUrl} alt={scan.tagName} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 48, height: 48, borderRadius: 8, background: 'var(--gray-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                      🏷️
                    </div>
                  )}
                  <div>
                    <div className={styles.tagName} style={{ marginBottom: 2 }}>{scan.tagName}</div>
                    <span className={styles.categoryBadge} style={{ marginBottom: 0 }}>{scan.category}</span>
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: 13, color: 'var(--gray-500)' }}>
                    {new Date(scan.scannedAt).toLocaleString(undefined, countryTz ? { timeZone: countryTz } : undefined)}
                  </div>
                </div>

                <ScanLocationMap latitude={scan.latitude} longitude={scan.longitude} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default LastScanPage;
