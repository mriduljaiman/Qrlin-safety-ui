import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './Home.module.css';

const Home: React.FC = () => {
  return (
    <div className={styles.homeContainer}>
      <nav className={styles.nav}>
        <div className={styles.logo}>SafeTag</div>
        <div className={styles.navLinks}>
          <Link to="/login" className={styles.navLink}>Sign In</Link>
          <Link to="/register" className={styles.navButton}>Get Started</Link>
        </div>
      </nav>

      <motion.section 
        className={styles.hero}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className={styles.heroTitle}>
          Protect What Matters Most<br />with Smart QR Tags
        </h1>
        <p className={styles.heroSubtitle}>
          Lost pets, wandering loved ones, misplaced items.<br />
          One scan brings them home.
        </p>
        <div className={styles.heroButtons}>
          <Link to="/register" className={styles.primaryButton}>
            Start Free Trial
          </Link>
          <a href="#features" className={styles.secondaryButton}>
            Learn More
          </a>
        </div>
      </motion.section>

      <section id="features" className={styles.features}>
        <h2 className={styles.sectionTitle}>How It Works</h2>
        
        <div className={styles.featureGrid}>
          <motion.div 
            className={styles.featureCard}
            whileHover={{ scale: 1.05 }}
          >
            <div className={styles.featureIcon}>🐾</div>
            <h3>For Pets</h3>
            <p>Instant contact if your pet gets lost. Vaccination records and vet info at finder's fingertips.</p>
          </motion.div>

          <motion.div 
            className={styles.featureCard}
            whileHover={{ scale: 1.05 }}
          >
            <div className={styles.featureIcon}>👶</div>
            <h3>For Children</h3>
            <p>Emergency contact and medical info protected by encryption. Peace of mind for parents.</p>
          </motion.div>

          <motion.div 
            className={styles.featureCard}
            whileHover={{ scale: 1.05 }}
          >
            <div className={styles.featureIcon}>👴</div>
            <h3>For Elderly</h3>
            <p>Help seniors find their way home. Medical conditions and emergency contacts readily available.</p>
          </motion.div>

          <motion.div 
            className={styles.featureCard}
            whileHover={{ scale: 1.05 }}
          >
            <div className={styles.featureIcon}>🎒</div>
            <h3>For Items</h3>
            <p>Lost backpacks, keys, laptops. Get them back fast with instant owner notification.</p>
          </motion.div>
        </div>
      </section>

      <section className={styles.cta}>
        <h2>Ready to Get Started?</h2>
        <p>Join thousands protecting what they love</p>
        <Link to="/register" className={styles.ctaButton}>
          Create Free Account
        </Link>
      </section>

      <footer className={styles.footer}>
        <p>&copy; 2025 SafeTag. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;