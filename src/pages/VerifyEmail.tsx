import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { authAPI } from '../api/auth';
import { useAuth } from '../hooks/useAuth';
import styles from '../components/Auth/Auth.module.css';

const VerifyEmail: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { login } = useAuth();
  const initialEmail = (location.state as { email?: string } | null)?.email || '';

  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setInfo('');
    setLoading(true);
    try {
      const response = await authAPI.verifyOtp({ email, otp });
      login(response);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setError('');
    setInfo('');
    setResending(true);
    try {
      await authAPI.resendOtp(email);
      setInfo('A new code has been sent to your email.');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Could not resend code');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authCard}>
        <h1 className={styles.authTitle}>Verify your email</h1>
        <p className={styles.authSubtitle}>Enter the 6-digit code we emailed you</p>

        <form onSubmit={handleVerify} className={styles.authForm}>
          {error && <div className={styles.error}>{error}</div>}
          {info && <div className={styles.error} style={{ background: '#efe', color: '#2a2' }}>{info}</div>}

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="your@email.com"
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="otp">Verification code</label>
            <input
              id="otp"
              type="text"
              inputMode="numeric"
              pattern="[0-9]{6}"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              required
              placeholder="123456"
            />
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading || otp.length !== 6}>
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>

        <p className={styles.authFooter}>
          Didn't get a code?{' '}
          <a href="#" onClick={(e) => { e.preventDefault(); if (!resending) handleResend(); }}>
            {resending ? 'Sending...' : 'Resend code'}
          </a>
        </p>
        <p className={styles.authFooter}>
          <Link to="/login">Back to sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default VerifyEmail;
