import React from 'react';
import { Link } from 'react-router-dom';
import styles from '../../pages/StaticPage.module.css';

const StaticLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className={styles.container}>
      <div className={styles.nav}>
        <Link to="/">Qrlin Safety</Link>
      </div>
      <div className={styles.content}>{children}</div>
      <div className={styles.footerNav}>
        <Link to="/about">About Us</Link>
        <Link to="/contact">Contact Us</Link>
        <Link to="/careers">Careers</Link>
        <Link to="/privacy">Privacy Policy</Link>
        <Link to="/terms">Terms &amp; Conditions</Link>
      </div>
    </div>
  );
};

export default StaticLayout;
