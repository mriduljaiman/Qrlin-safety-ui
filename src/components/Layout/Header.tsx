import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from '../Layout/Header.module.css';

const NAV_LINKS = [
  { to: '/dashboard', label: 'My Tags' },
  { to: '/profile', label: 'Profile' },
  { to: '/last-scan', label: 'Last Scan' },
  { to: '/messages', label: 'Messages' },
  { to: '/settings', label: 'Settings' },
];

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const links = user?.role === 'ADMIN' ? [...NAV_LINKS, { to: '/admin', label: 'Admin' }] : NAV_LINKS;

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Link to="/dashboard" className={styles.logo}>
          Qrlin Safety
        </Link>

        <nav className={styles.nav}>
          {links.map((link) => (
            <Link key={link.to} to={link.to} className={styles.navLink}>{link.label}</Link>
          ))}
        </nav>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
          <button
            className={styles.hamburgerButton}
            onClick={() => setMenuOpen((o) => !o)}
            aria-label="Menu"
            aria-expanded={menuOpen}
          >
            <span className={styles.hamburgerBar} />
            <span className={styles.hamburgerBar} />
            <span className={styles.hamburgerBar} />
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className={styles.mobileNav}>
          {links.map((link) => (
            <Link key={link.to} to={link.to} className={styles.mobileNavLink} onClick={() => setMenuOpen(false)}>
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
};

export default Header;
