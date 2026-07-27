import React from 'react';
import styles from './QRDisplay.module.css';

interface QRDisplayProps {
  qrCode: string;
  qrImage?: string;
}

const QRDisplay: React.FC<QRDisplayProps> = ({ qrCode, qrImage }) => {
  const qrUrl = `${window.location.origin}/qr/${qrCode}`;

  const handleDownload = () => {
    if (qrImage) {
      const link = document.createElement('a');
      link.href = `data:image/png;base64,${qrImage}`;
      link.download = `qr-${qrCode}.png`;
      link.click();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(qrUrl);
    alert('QR URL copied to clipboard!');
  };

  return (
    <div className={styles.container}>
      {qrImage && (
        <img
          src={`data:image/png;base64,${qrImage}`}
          alt="QR Code"
          className={styles.qrImage}
        />
      )}
      
      <div className={styles.info}>
        <p className={styles.code}>Code: {qrCode}</p>
        <p className={styles.url}>{qrUrl}</p>
      </div>

      <div className={styles.actions}>
        <button onClick={handleCopy} className={styles.button}>
          📋 Copy URL
        </button>
        <button onClick={handleDownload} className={styles.button}>
          ⬇️ Download
        </button>
      </div>
    </div>
  );
};

export default QRDisplay;