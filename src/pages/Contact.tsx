import React, { useState } from 'react';
import StaticLayout from '../components/Layout/StaticLayout';
import { contactAPI } from '../api/contact';
import styles from './StaticPage.module.css';

const Contact: React.FC = () => {
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('sending');
    try {
      await contactAPI.submit(form);
      setStatus('sent');
      setForm({ name: '', email: '', message: '' });
    } catch {
      setStatus('error');
    }
  };

  return (
    <StaticLayout>
      <h1>Contact Us</h1>
      <p>Questions, feedback, or a partnership idea — we read every message.</p>
      <p>Email us directly at <a href="mailto:customercare.qrlin@gmail.com">customercare.qrlin@gmail.com</a>, or use the form below.</p>

      {status === 'sent' ? (
        <p style={{ color: '#16a34a', fontWeight: 600 }}>Thanks — we'll get back to you soon.</p>
      ) : (
        <form className={styles.contactForm} onSubmit={handleSubmit}>
          <input
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            required
          />
          <input
            type="email"
            placeholder="Your email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            required
          />
          <textarea
            placeholder="Your message"
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            required
          />
          <button type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Sending...' : 'Send Message'}
          </button>
          {status === 'error' && <p style={{ color: '#c53030' }}>Could not send — try emailing us directly.</p>}
        </form>
      )}
    </StaticLayout>
  );
};

export default Contact;
