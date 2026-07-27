import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './Sidebar.module.css';

const Sidebar: React.FC = () => {
  const location = useLocation();

  const navItems = [
    { path: '/dashboard', icon: '📊', label: 'Dashboard' },
    { path: '/profiles', icon: '👤', label: 'Profiles' },
    { path: '/scans', icon: '📱', label: 'Scans' },
    { path: '/admin', icon: '⚙️', label: 'Admin' },
  ];

  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`${styles.navItem} ${
              location.pathname === item.path ? styles.active : ''
            }`}
          >
            <span className={styles.icon}>{item.icon}</span>
            <span className={styles.label}>{item.label}</span>
            {location.pathname === item.path && (
              <motion.div
                className={styles.activeIndicator}
                layoutId="activeIndicator"
              />
            )}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default Sidebar;