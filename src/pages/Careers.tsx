import React from 'react';
import StaticLayout from '../components/Layout/StaticLayout';
import styles from './StaticPage.module.css';

const OPEN_ROLES = [
  { title: 'Full-Stack Engineer', location: 'Remote / India', type: 'Full-time' },
  { title: 'Mobile Engineer (Flutter)', location: 'Remote / India', type: 'Full-time' },
  { title: 'Product Designer', location: 'Remote / India', type: 'Contract' },
];

const Careers: React.FC = () => (
  <StaticLayout>
    <h1>Careers</h1>
    <p>We're a small team building a product we actually want to use. If that sounds interesting, we'd like to hear from you.</p>

    <h2>Open Roles</h2>
    {OPEN_ROLES.map((role) => (
      <div key={role.title} className={styles.jobCard}>
        <strong>{role.title}</strong>
        <div style={{ color: 'var(--gray-500)', fontSize: 14, marginTop: 4 }}>{role.location} · {role.type}</div>
      </div>
    ))}

    <p style={{ marginTop: 32 }}>
      Don't see a fit but want to work with us anyway? Email your resume and a note to{' '}
      <a href="mailto:customercare.qrlin@gmail.com">customercare.qrlin@gmail.com</a>.
    </p>
  </StaticLayout>
);

export default Careers;
