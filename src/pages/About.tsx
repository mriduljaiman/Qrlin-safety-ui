import React from 'react';
import StaticLayout from '../components/Layout/StaticLayout';
import styles from './StaticPage.module.css';

const About: React.FC = () => (
  <StaticLayout>
    <h1>About Qrlin Safety</h1>
    <p>
      Qrlin Safety started from a simple idea: a lost item is only ever as findable as the
      information attached to it. Instead of a fixed catalog of "pet tags" or "luggage tags," we
      built one universal QR tag — you decide what it's for.
    </p>
    <p>
      Stick it on earbuds, a bike, a bag, a medicine kit — whatever matters to you. If it's found,
      the finder can notify you instantly and reach you without ever seeing your real phone
      number.
    </p>

    <h2>What we believe</h2>
    <div className={styles.teamGrid}>
      <div className={styles.valueCard}>
        <strong>Privacy first</strong>
        <p>Your contact details are never exposed. Not to finders, not to anyone.</p>
      </div>
      <div className={styles.valueCard}>
        <strong>No fixed categories</strong>
        <p>You define what a tag is for — we don't force you into a template.</p>
      </div>
      <div className={styles.valueCard}>
        <strong>Fair pricing</strong>
        <p>One-time payment for the core experience. No forced subscription.</p>
      </div>
    </div>

    <h2>Where we're based</h2>
    <p>Qrlin Safety is built and operated in India.</p>
  </StaticLayout>
);

export default About;
