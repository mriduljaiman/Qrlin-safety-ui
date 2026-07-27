import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { tagsAPI } from '../api/tags';
import { Tag } from '../types/tag';
import { useAuth } from '../hooks/useAuth';
import Header from '../components/Layout/Header';
import Loading from '../components/Common/Loading';
import styles from './Tags.module.css';

const CATEGORY_ICONS: Record<string, string> = {
  earbuds: '🎧',
  keys: '🔑',
  bag: '🎒',
  bike: '🚲',
  bicycle: '🚲',
  wallet: '👛',
  laptop: '💻',
  phone: '📱',
  mobile: '📱',
  pet: '🐾',
  car: '🚗',
};

function iconFor(category: string): string {
  const key = category.toLowerCase();
  for (const k of Object.keys(CATEGORY_ICONS)) {
    if (key.includes(k)) return CATEGORY_ICONS[k];
  }
  return '🏷️';
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06 } },
};

const cardVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await tagsAPI.list();
        setTags(data);
      } catch (error) {
        console.error('Failed to load tags', error);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const lostCount = tags.filter((t) => t.lostMode).length;

  return (
    <div className={styles.container}>
      <Header />

      <div className={styles.content}>
        <motion.div
          className={styles.welcomeBanner}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <h1>Welcome back{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : ''} 👋</h1>
          <p>Here's what's happening with your tags.</p>
        </motion.div>

        {!loading && tags.length > 0 && (
          <div className={styles.statsRow}>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{tags.length}</div>
              <div className={styles.statLabel}>Total Tags</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue}>{tags.filter((t) => t.active).length}</div>
              <div className={styles.statLabel}>Active</div>
            </div>
            <div className={styles.statCard}>
              <div className={styles.statValue} style={{ color: lostCount > 0 ? '#c53030' : undefined }}>{lostCount}</div>
              <div className={styles.statLabel}>Marked Lost</div>
            </div>
          </div>
        )}

        <div className={styles.headerRow}>
          <h2 className={styles.pageTitle} style={{ fontSize: 24 }}>My Tags</h2>
          <Link to="/tags/new" className={styles.addButton}>+ Add Tag</Link>
        </div>

        {loading ? (
          <Loading fullScreen={false} />
        ) : tags.length === 0 ? (
          <div className={styles.emptyState}>
            <h2>No tags yet</h2>
            <p>Add your first tag — earbuds, keys, a bag, anything.</p>
            <Link to="/tags/new" className={styles.addButton} style={{ marginTop: 16, display: 'inline-flex' }}>
              + Add Your First Tag
            </Link>
          </div>
        ) : (
          <motion.div className={styles.grid} initial="hidden" animate="visible" variants={containerVariants}>
            {tags.map((tag) => (
              <motion.div key={tag.id} variants={cardVariants} whileHover={{ y: -4 }}>
                <Link to={`/tags/${tag.id}`} className={styles.tagCard} style={{ display: 'block' }}>
                  {tag.lostMode && <span className={styles.lostBadge}>LOST</span>}
                  {tag.photoUrl ? (
                    <img src={tag.photoUrl} alt={tag.tagName} className={styles.tagThumb} />
                  ) : (
                    <div className={styles.tagThumbPlaceholder}>{iconFor(tag.category)}</div>
                  )}
                  <span className={styles.categoryBadge}>{tag.category}</span>
                  <h3 className={styles.tagName}>{tag.tagName}</h3>
                  {tag.description && <p className={styles.tagDescription}>{tag.description}</p>}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
