import React from 'react';
import StaticLayout from '../components/Layout/StaticLayout';
import styles from './StaticPage.module.css';

const Terms: React.FC = () => (
  <StaticLayout>
    <h1>Terms &amp; Conditions</h1>
    <p className={styles.updated}>Draft — last updated 27 July 2026. Not yet reviewed by legal counsel.</p>

    <h2>1. Who we are</h2>
    <p>Qrlin Safety ("we", "us") operates a QR-tag based lost-and-found and safety identification service, accessible via our mobile and web apps and the physical tags you purchase from us.</p>

    <h2>2. Your account</h2>
    <p>You must provide accurate registration information and keep your credentials secure. You're responsible for activity under your account. Accounts must be verified by email OTP or Google Sign-In before use.</p>

    <h2>3. Tags and content you add</h2>
    <p>You may register tags for any lawful item or purpose and choose what information is shown on the public scan page. You're responsible for the accuracy and legality of content you add, including photos, descriptions, and any optional safety information.</p>

    <h2>4. Acceptable use</h2>
    <p>You agree not to use Qrlin Safety to harass, defraud, or endanger others; to misrepresent tag ownership; or to attempt to access accounts or data that aren't yours.</p>

    <h2>5. Subscriptions and payments</h2>
    <p>Tags are sold on a one-time payment basis. Optional add-on features (such as masked calling) may require a separate subscription, billed as described at time of purchase.</p>

    <h2>6. Availability</h2>
    <p>We aim for high availability but don't guarantee uninterrupted service. Features described as "coming soon" are not yet available.</p>

    <h2>7. Termination</h2>
    <p>You may close your account at any time. We may suspend accounts that violate these terms.</p>

    <h2>8. Changes</h2>
    <p>We may update these terms; continued use after changes take effect constitutes acceptance.</p>

    <h2>9. Contact</h2>
    <p>Questions about these terms: <a href="mailto:customercare.qrlin@gmail.com">customercare.qrlin@gmail.com</a></p>
  </StaticLayout>
);

export default Terms;
