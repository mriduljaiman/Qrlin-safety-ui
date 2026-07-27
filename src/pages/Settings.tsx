import React, { useEffect, useState } from 'react';
import { tagsAPI } from '../api/tags';
import { profileAPI } from '../api/profile';
import { Tag } from '../types/tag';
import { Preferences } from '../types/profile';
import { useTheme } from '../hooks/useTheme';
import { THEMES } from '../context/ThemeContext';
import Header from '../components/Layout/Header';
import Loading from '../components/Common/Loading';
import styles from './Tags.module.css';

const SOUND_OPTIONS = ['chime', 'bell', 'ping', 'none'];
const FONT_SIZE_OPTIONS = ['small', 'medium', 'large'];
const COLOR_OPTIONS = ['#667eea', '#0ea5e9', '#f97316', '#16a34a', '#f43f5e', '#a855f7', '#1a202c'];

type Tab = 'tags' | 'notifications' | 'themes';

const Settings: React.FC = () => {
  const [tab, setTab] = useState<Tab>('tags');
  const [tags, setTags] = useState<Tag[]>([]);
  const [prefs, setPrefs] = useState<Preferences>({ theme: 'default', notificationSound: 'chime', notificationFontSize: 'medium', notificationColor: '#667eea' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    (async () => {
      try {
        const [tagList, preferences] = await Promise.all([tagsAPI.listAll(), profileAPI.getPreferences()]);
        setTags(tagList);
        setPrefs(preferences);
      } catch (err) {
        console.error('Failed to load settings', err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const handleToggleTag = async (tag: Tag) => {
    const newActive = !tag.active;
    setTags(tags.map((t) => (t.id === tag.id ? { ...t, active: newActive } : t)));
    try {
      await tagsAPI.setActive(tag.id, newActive);
    } catch (err) {
      setTags(tags.map((t) => (t.id === tag.id ? { ...t, active: !newActive } : t)));
    }
  };

  const savePreferences = async (updates: Partial<Preferences>) => {
    const merged = { ...prefs, ...updates };
    setPrefs(merged);
    setSaving(true);
    try {
      await profileAPI.updatePreferences(updates);
    } catch (err) {
      console.error('Failed to save preference', err);
    } finally {
      setSaving(false);
    }
  };

  const handleApplyTheme = (themeId: string) => {
    setTheme(themeId);
    savePreferences({ theme: themeId });
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <Header />
        <Loading fullScreen />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <Header />
      <div className={styles.content}>
        <h1 className={styles.pageTitle}>Settings</h1>

        <div className={styles.tabRow}>
          <button className={`${styles.tab} ${tab === 'tags' ? styles.tabActive : ''}`} onClick={() => setTab('tags')}>Manage Tags</button>
          <button className={`${styles.tab} ${tab === 'notifications' ? styles.tabActive : ''}`} onClick={() => setTab('notifications')}>Notifications</button>
          <button className={`${styles.tab} ${tab === 'themes' ? styles.tabActive : ''}`} onClick={() => setTab('themes')}>Themes</button>
        </div>

        {tab === 'tags' && (
          <div className={styles.detailCard}>
            <h2 style={{ marginTop: 0 }}>Manage Tags</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>
              Disabling a tag makes its public scan page stop resolving, without deleting it.
            </p>
            {tags.length === 0 ? (
              <p>No tags yet.</p>
            ) : (
              tags.map((t) => (
                <div key={t.id} className={styles.toggleRow}>
                  <div>
                    <strong>{t.tagName}</strong>
                    <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{t.category}</div>
                  </div>
                  <label className={styles.switch}>
                    <input type="checkbox" checked={t.active} onChange={() => handleToggleTag(t)} />
                    <span className={styles.switchSlider}></span>
                  </label>
                </div>
              ))
            )}
          </div>
        )}

        {tab === 'notifications' && (
          <div className={styles.detailCard}>
            <h2 style={{ marginTop: 0 }}>Notification Preferences</h2>

            <div className={styles.formGroup}>
              <label>Notification sound</label>
              <select
                value={prefs.notificationSound}
                onChange={(e) => savePreferences({ notificationSound: e.target.value })}
                style={{ padding: '12px 16px', border: '2px solid var(--gray-200)', borderRadius: 8 }}
              >
                {SOUND_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Font size</label>
              <select
                value={prefs.notificationFontSize}
                onChange={(e) => savePreferences({ notificationFontSize: e.target.value })}
                style={{ padding: '12px 16px', border: '2px solid var(--gray-200)', borderRadius: 8 }}
              >
                {FONT_SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Accent color</label>
              <div className={styles.colorSwatchRow}>
                {COLOR_OPTIONS.map((c) => (
                  <div
                    key={c}
                    className={`${styles.colorSwatch} ${prefs.notificationColor === c ? styles.colorSwatchSelected : ''}`}
                    style={{ background: c }}
                    onClick={() => savePreferences({ notificationColor: c })}
                  />
                ))}
              </div>
            </div>

            <div
              style={{
                marginTop: 20,
                padding: 16,
                borderRadius: 8,
                background: prefs.notificationColor,
                color: 'white',
                fontSize: prefs.notificationFontSize === 'small' ? 13 : prefs.notificationFontSize === 'large' ? 18 : 15,
              }}
            >
              Preview: "Your tag was just scanned" {saving && '(saving...)'}
            </div>
          </div>
        )}

        {tab === 'themes' && (
          <div className={styles.detailCard}>
            <h2 style={{ marginTop: 0 }}>Themes</h2>
            <p style={{ color: 'var(--gray-500)', fontSize: 14 }}>Pick a theme and hit Apply — it changes the whole app.</p>

            <div className={styles.themeGrid}>
              {THEMES.map((t) => (
                <div
                  key={t.id}
                  className={`${styles.themeSwatch} ${theme === t.id ? styles.themeSwatchSelected : ''}`}
                  onClick={() => setTheme(t.id, false)}
                  style={{ background: 'var(--gray-50)' }}
                >
                  <div className={styles.themeSwatchDot} style={{ background: `linear-gradient(135deg, ${t.primary}, ${t.secondary})` }} />
                  <div className={styles.themeSwatchLabel}>{t.label}</div>
                </div>
              ))}
            </div>

            <button
              className={styles.addButton}
              style={{ border: 'none', cursor: 'pointer' }}
              onClick={() => handleApplyTheme(theme)}
            >
              Apply Theme
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
