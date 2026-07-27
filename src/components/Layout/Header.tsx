import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import styles from '../Layout/Header.module.css';

const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.headerContent}>
        <Link to="/dashboard" className={styles.logo}>
          SafeTag
        </Link>

        <nav className={styles.nav}>
          <Link to="/dashboard" className={styles.navLink}>Dashboard</Link>
          <Link to="/profiles" className={styles.navLink}>Profiles</Link>
          <Link to="/scans" className={styles.navLink}>Scans</Link>
          {user?.role === 'ADMIN' && (
            <Link to="/admin" className={styles.navLink}>Admin</Link>
          )}
        </nav>

        <button onClick={handleLogout} className={styles.logoutButton}>
          Logout
        </button>
      </div>
    </header>
  );
};

export default Header;