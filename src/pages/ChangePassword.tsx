import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import styles from '../components/Auth/Auth.module.css';

// Reached two ways: forced (user.mustChangePassword true, MustChangePasswordRoute in App.tsx
// redirects here before any other private route can render - PasswordChangeGateFilter enforces
// the same thing server-side) or voluntary (a link from Settings' Security tab). The forced case
// skips the current-password field, matching the backend's rule that a temp password's
// delivery-by-email plus a successful login with it already proves possession once.
const ChangePassword: React.FC = () => {
  const { user, clearMustChangePassword } = useAuth();
  const forced = !!user?.mustChangePassword;
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError("New passwords don't match");
      return;
    }
    setLoading(true);
    try {
      await authAPI.changePassword(newPassword, forced ? undefined : currentPassword);
      clearMustChangePassword();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not change password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>{forced ? 'Set a New Password' : 'Change Password'}</h1>
        <p className={styles.authSubtitle}>
          {forced
            ? "You're signing in with a temporary password - choose a new one to continue."
            : 'Enter your current password and a new one'}
        </p>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          {error && <div className={styles.error}>{error}</div>}

          {!forced && (
            <div className={styles.formGroup}>
              <label htmlFor="currentPassword">Current Password</label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                placeholder="••••••••"
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              minLength={8}
              placeholder="••••••••"
            />
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Saving...' : 'Save New Password'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
