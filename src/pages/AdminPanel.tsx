import React, { useState } from 'react';
import Header from '../components/Layout/Header';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import { adminAPI } from '../api/admin';
import styles from './AdminPanel.module.css';

const AdminPanel: React.FC = () => {
  const [qrCount, setQrCount] = useState('10');
  const [generatedQRs, setGeneratedQRs] = useState<any[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [creatingUser, setCreatingUser] = useState(false);

  const handleGenerateQRs = async () => {
    try {
      const qrs = await adminAPI.generateQRCodes(parseInt(qrCount));
      setGeneratedQRs(qrs);
      alert(`Generated ${qrs.length} QR codes`);
    } catch (error) {
      alert('Failed to generate QR codes');
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);
    try {
      await adminAPI.createUser({ email: newEmail, fullName: newFullName, phone: newPhone || undefined });
      alert(`Account created for ${newEmail} - temp password emailed`);
      setNewEmail('');
      setNewFullName('');
      setNewPhone('');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to create account');
    } finally {
      setCreatingUser(false);
    }
  };

  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.content}>
        <h1>Admin Panel</h1>

        <div className={styles.section}>
          <h2>Create Customer Account</h2>
          <form onSubmit={handleCreateUser} className={styles.generateForm}>
            <Input
              label="Email"
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              required
            />
            <Input
              label="Full Name"
              value={newFullName}
              onChange={(e) => setNewFullName(e.target.value)}
              required
            />
            <Input
              label="Phone (optional)"
              value={newPhone}
              onChange={(e) => setNewPhone(e.target.value)}
            />
            <Button type="submit" disabled={creatingUser}>
              {creatingUser ? 'Creating...' : 'Create Account'}
            </Button>
          </form>
        </div>

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