import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import styles from './Home.module.css';

const Home: React.FC = () => {
  return (
    <div className={styles.homeContainer}>
      <nav className={styles.nav}>
        <div className={styles.logo}>Qrlin Safety</div>
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
          One QR Tag.<br />Anything You Want to Protect.
        </h1>
        <p className={styles.heroSubtitle}>
          Earbuds, keys, a bag, your bike — you name the category, not us.<br />
          Anyone who finds it can notify you instantly, with your identity kept private.
        </p>
        <div className={styles.heroButtons}>
          <Link to="/register" className={styles.primaryButton}>
            Get Started
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
            <div className={styles.featureIcon}>🏷️</div>
            <h3>Tag Anything</h3>
            <p>No fixed categories. Type whatever it is — a bag, a bike, a medicine kit — and register it in seconds.</p>
          </motion.div>

          <motion.div
            className={styles.featureCard}
            whileHover={{ scale: 1.05 }}
          >
            <div className={styles.featureIcon}>🔔</div>
            <h3>Instant Notification</h3>
            <p>The moment someone scans your tag, you know — with location and time.</p>
          </motion.div>

          <motion.div
            className={styles.featureCard}
            whileHover={{ scale: 1.05 }}
          >
            <div className={styles.featureIcon}>🔒</div>
            <h3>Privacy First</h3>
            <p>Finders never see your real phone number. You control exactly what's shown on scan.</p>
          </motion.div>

          <motion.div
            className={styles.featureCard}
            whileHover={{ scale: 1.05 }}
          >
            <div className={styles.featureIcon}>🩺</div>
            <h3>Optional Safety Info</h3>
            <p>Attach medical or emergency info to any tag — useful for a child's bag, a parent's tag, or your own kit.</p>
          </motion.div>
        </div>
      </section>

      <section className={styles.cta}>
        <h2>Ready to Get Started?</h2>
        <p>₹499 one-time per tag. No subscription required.</p>
        <Link to="/register" className={styles.ctaButton}>
          Create Free Account
        </Link>
      </section>

      <footer className={styles.footer}>
        <p>&copy; 2026 Qrlin Safety. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
