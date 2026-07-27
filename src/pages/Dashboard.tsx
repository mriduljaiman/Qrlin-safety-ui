import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tagsAPI } from '../api/tags';
import { Tag } from '../types/tag';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import Header from '../components/Layout/Header';
import Loading from '../components/Common/Loading';
import styles from './Tags.module.css';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { subscribeToScans } = useWebSocket();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [notification, setNotification] = useState<string | null>(null);

  const loadTags = async () => {
    try {
      const data = await tagsAPI.list();
      setTags(data);
    } catch (error) {
      console.error('Failed to load tags', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTags();

    if (user) {
      subscribeToScans(user.id, (message: any) => {
        setNotification(`Your "${message.tagName || 'tag'}" was just scanned`);
        setTimeout(() => setNotification(null), 5000);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  return (
    <div className={styles.container}>
      <Header />

      {notification && <div className={styles.notification}>{notification}</div>}

      <div className={styles.content}>
        <div className={styles.headerRow}>
          <h1 className={styles.pageTitle}>My Tags</h1>
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
          <div className={styles.grid}>
            {tags.map((tag) => (
              <Link to={`/tags/${tag.id}`} key={tag.id} className={styles.tagCard}>
                {tag.lostMode && <span className={styles.lostBadge}>LOST</span>}
                <span className={styles.categoryBadge}>{tag.category}</span>
                <h3 className={styles.tagName}>{tag.tagName}</h3>
                {tag.description && <p className={styles.tagDescription}>{tag.description}</p>}
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
