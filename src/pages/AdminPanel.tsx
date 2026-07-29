import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Layout/Header';
import Button from '../components/Common/Button';
import Input from '../components/Common/Input';
import { adminAPI } from '../api/admin';
import styles from './AdminPanel.module.css';

type AdminTab = 'accounts' | 'legacy-qr' | 'safetags';

const AdminPanel: React.FC = () => {
  const [tab, setTab] = useState<AdminTab>('accounts');
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

        <div className={styles.tabs}>
          <button className={`${styles.tab} ${tab === 'accounts' ? styles.tabActive : ''}`} onClick={() => setTab('accounts')}>
            Accounts
          </button>
          <button className={`${styles.tab} ${tab === 'legacy-qr' ? styles.tabActive : ''}`} onClick={() => setTab('legacy-qr')}>
            Legacy QR Codes
          </button>
          <button className={`${styles.tab} ${tab === 'safetags' ? styles.tabActive : ''}`} onClick={() => setTab('safetags')}>
            SafeTags
          </button>
        </div>

        {tab === 'accounts' && (
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
        )}

        {tab === 'legacy-qr' && (
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
        )}

        {tab === 'safetags' && (
          <div className={styles.section}>
            <h2>SafeTags (physical product lifecycle)</h2>
            <p style={{ color: 'var(--gray-500)' }}>
              Create, track, and reissue physical SafeTags - from print through shipping to activation.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <Link to="/admin/safetags">
                <Button>Open SafeTags Queue →</Button>
              </Link>
              <Link to="/admin/safetag-requests">
                <Button variant="secondary">Open Intake Requests →</Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;