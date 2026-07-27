import React from 'react';
import StaticLayout from '../components/Layout/StaticLayout';
import styles from './StaticPage.module.css';

const Privacy: React.FC = () => (
  <StaticLayout>
    <h1>Privacy Policy</h1>
    <p className={styles.updated}>Draft — last updated 27 July 2026. Not yet reviewed by legal counsel.</p>

    <h2>What we collect</h2>
    <p>Account details (name, email, phone), tag information you add (category, name, description, photos), optional safety information (blood group, medical conditions, emergency contacts), and scan events (time, approximate location) when your tags are scanned.</p>

    <h2>How we protect it</h2>
    <p>Passwords are hashed, never stored in plain text. Phone numbers, WhatsApp numbers, emergency contacts, and medical information are encrypted at rest. Your contact details are never shown directly to a finder — only a masked version.</p>

    <h2>What a finder sees</h2>
    <p>Only what you choose to make public on a tag: category, name, photo, description, and any public safety message you write. Your real phone number, email, and address are never exposed to a finder.</p>

    <h2>Anonymous community features</h2>
    <p>Chat and masked calling (where available) are designed so neither party ever sees the other's real contact details.</p>

    <h2>Third parties</h2>
    <p>We use third-party services for email delivery, hosting, and (for masked calling, once live) telephony routing. These providers only receive the minimum data needed to perform their function.</p>

    <h2>Your rights</h2>
    <p>You can view and update your profile at any time, deactivate any tag, and delete safety information you've added. To request full account deletion, contact us.</p>

    <h2>Contact</h2>
    <p>Privacy questions: <a href="mailto:customercare.qrlin@gmail.com">customercare.qrlin@gmail.com</a></p>
  </StaticLayout>
);

export default Privacy;
