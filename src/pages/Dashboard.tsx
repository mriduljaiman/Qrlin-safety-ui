import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { profilesAPI } from '../api/profiles';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import Header from '../components/Layout/Header';
import styles from './Dashboard.module.css';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { subscribeToScans } = useWebSocket();
  const [stats, setStats] = useState({
    totalProfiles: 0,
    totalScans: 0,
    activeLostMode: 0,
  });
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
    
    if (user) {
      subscribeToScans(user.id, (message) => {
        setNotification(`New scan detected! Location: ${message.location}`);
        setTimeout(() => setNotification(null), 5000);
        loadDashboardData();
      });
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      const profiles = await profilesAPI.getMyProfiles();
      const totalProfiles = 
        profiles.pets.length + 
        profiles.children.length + 
        profiles.elderly.length + 
        profiles.items.length;
      
      setStats({
        totalProfiles,
        totalScans: 0,
        activeLostMode: profiles.qrCodes.filter((qr: any) => qr.lostMode).length,
      });
    } catch (error) {
      console.error('Failed to load dashboard data', error);
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <Header />
      
      {notification && (
        <motion.div 
          className={styles.notification}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {notification}
        </motion.div>
      )}

      <div className={styles.dashboardContent}>
        <h1 className={styles.pageTitle}>Dashboard</h1>
        
        <div className={styles.statsGrid}>
          <motion.div 
            className={styles.statCard}
            whileHover={{ scale: 1.02 }}
          >
            <div className={styles.statIcon}>📋</div>
            <div className={styles.statValue}>{stats.totalProfiles}</div>
            <div className={styles.statLabel}>Total Profiles</div>
          </motion.div>

          <motion.div 
            className={styles.statCard}
            whileHover={{ scale: 1.02 }}
          >
            <div className={styles.statIcon}>👁️</div>
            <div className={styles.statValue}>{stats.totalScans}</div>
            <div className={styles.statLabel}>Total Scans</div>
          </motion.div>

          <motion.div 
            className={styles.statCard}
            whileHover={{ scale: 1.02 }}
          >
            <div className={styles.statIcon}>🚨</div>
            <div className={styles.statValue}>{stats.activeLostMode}</div>
            <div className={styles.statLabel}>Lost Mode Active</div>
          </motion.div>
        </div>

        <div className={styles.quickActions}>
          <h2>Quick Actions</h2>
          <div className={styles.actionGrid}>
            <Link to="/profiles" className={styles.actionCard}>
              <span className={styles.actionIcon}>➕</span>
              <span>Create Profile</span>
            </Link>
            <Link to="/scans" className={styles.actionCard}>
              <span className={styles.actionIcon}>📊</span>
              <span>View Scans</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;