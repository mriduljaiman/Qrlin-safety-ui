import React, { useState } from 'react';
import Header from '../components/Layout/Header';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import { adminAPI } from '../api/admin';
import styles from './AdminPanel.module.css';

const AdminPanel: React.FC = () => {
  const [qrCount, setQrCount] = useState('10');
  const [generatedQRs, setGeneratedQRs] = useState<any[]>([]);

  const handleGenerateQRs = async () => {
    try {
      const qrs = await adminAPI.generateQRCodes(parseInt(qrCount));
      setGeneratedQRs(qrs);
      alert(`Generated ${qrs.length} QR codes`);
    } catch (error) {
      alert('Failed to generate QR codes');
    }
  };

  return (
    <div className={styles.container}>
      <Header />
      
      <div className={styles.content}>
        <h1>Admin Panel</h1>

        <div className={styles.section}>
          <h2>Generate QR Codes</h2>
          <div className={styles.generateForm}>
            <Input
              label="Number of QR Codes"
              type="number"
              value={qrCount}
              onChange={(e) => setQrCount(e.target.value)}
            />
            <Button onClick={handleGenerateQRs}>Generate</Button>
          </div>

          {generatedQRs.length > 0 && (
            <div className={styles.qrList}>
              <h3>Generated QR Codes:</h3>
              {generatedQRs.map((qr) => (
                <div key={qr.id} className={styles.qrItem}>
                  {qr.qrCode}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;