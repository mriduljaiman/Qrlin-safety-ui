import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Hero3D from '../components/Hero3D/Hero3D';
import styles from './Home.module.css';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0 },
};

const STEPS = [
  { title: 'Tag it', desc: 'Register any item under a category you choose - no fixed list.' },
  { title: 'Someone finds it', desc: 'A finder scans the QR code, no app required.' },
  { title: 'You get notified', desc: 'Instantly, with the scan location - your number stays private.' },
  { title: 'You reconnect', desc: 'Chat safely in-app until you get your item back.' },
];

const Home: React.FC = () => {
  return (
    <div className={styles.homeContainer}>
      <nav className={styles.nav}>
        <div className={styles.logo}>Qrlin Safety</div>
        <div className={styles.navLinks}>
          <Link to="/about" className={styles.navLink}>About</Link>
          <Link to="/login" className={styles.navLink}>Sign In</Link>
          <Link to="/register" className={styles.navButton}>Get Started</Link>
        </div>
      </nav>

      <section className={styles.hero}>
        <motion.div
          className={styles.heroText}
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className={styles.heroTitle}>
            One QR Tag.<br />Anything You Want to Protect.
          </h1>
          <p className={styles.heroSubtitle}>
            Earbuds, keys, a bag, your bike — you name the category, not us.
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
          <p style={{ marginTop: 16 }}>
            <Link to="/request-safetag" style={{ color: 'var(--gray-500)', fontSize: 14, textDecoration: 'underline' }}>
              Just want a physical SafeTag mailed to you? Request one - no account needed →
            </Link>
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, delay: 0.2 }}
        >
          <Hero3D />
        </motion.div>
      </section>

      <section id="features" className={styles.features}>
        <motion.h2
          className={styles.sectionTitle}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          How It Works
        </motion.h2>

        <div className={styles.featureGrid}>
          {[
            { icon: '🏷️', title: 'Tag Anything', text: "No fixed categories. Type whatever it is — a bag, a bike, a medicine kit — and register it in seconds." },
            { icon: '🔔', title: 'Instant Notification', text: 'The moment someone scans your tag, you know — with location and time.' },
            { icon: '🔒', title: 'Privacy First', text: "Finders never see your real phone number. You control exactly what's shown on scan." },
            { icon: '🩺', title: 'Optional Safety Info', text: "Attach medical or emergency info to any tag — useful for a child's bag, a parent's tag, or your own kit." },
          ].map((f, i) => (
            <motion.div
              key={f.title}
              className={styles.featureCard}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ delay: i * 0.1 }}
              whileHover={{ scale: 1.03 }}
            >
              <div className={styles.featureIcon}>{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.text}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className={styles.howItWorks}>
        <motion.h2
          className={styles.sectionTitle}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={fadeUp}
        >
          Four Steps, Zero Hassle
        </motion.h2>
        <div className={styles.stepsRow}>
          {STEPS.map((s, i) => (
            <motion.div
              key={s.title}
              className={styles.step}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              variants={fadeUp}
              transition={{ delay: i * 0.15 }}
            >
              <div className={styles.stepNumber}>{i + 1}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section className={styles.cta}>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
          <h2>Ready to Get Started?</h2>
          <p>₹499 one-time per tag. No subscription required.</p>
          <Link to="/register" className={styles.ctaButton}>
            Create Free Account
          </Link>
        </motion.div>
      </section>

      <footer className={styles.footer}>
        <div className={styles.footerLinks}>
          <Link to="/about">About Us</Link>
          <Link to="/contact">Contact Us</Link>
          <Link to="/careers">Careers</Link>
          <Link to="/privacy">Privacy Policy</Link>
          <Link to="/terms">Terms &amp; Conditions</Link>
        </div>
        <p>&copy; 2026 Qrlin Safety. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Home;
