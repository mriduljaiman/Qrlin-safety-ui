import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { tagsAPI } from '../api/tags';
import { profileAPI } from '../api/profile';
import { Tag } from '../types/tag';
import { Preferences } from '../types/profile';
import { useTheme } from '../hooks/useTheme';
import { THEMES } from '../context/ThemeContext';
import { SOUND_OPTIONS, playNotificationSound } from '../utils/notificationSounds';
import Header from '../components/Layout/Header';
import Loading from '../components/Common/Loading';
import styles from './Tags.module.css';

const FONT_SIZE_OPTIONS = ['12', '14', '16', '18', '20', '24', '28'];
const FONT_FAMILY_OPTIONS = [
  { value: 'system-ui', label: 'System Default' },
  { value: 'Arial, sans-serif', label: 'Arial' },
  { value: 'Georgia, serif', label: 'Georgia' },
  { value: '"Times New Roman", serif', label: 'Times New Roman' },
  { value: '"Courier New", monospace', label: 'Courier New' },
  { value: 'Verdana, sans-serif', label: 'Verdana' },
  { value: '"Trebuchet MS", sans-serif', label: 'Trebuchet MS' },
  { value: '"Comic Sans MS", cursive', label: 'Comic Sans MS' },
];
const COLOR_OPTIONS = ['#667eea', '#0ea5e9', '#f97316', '#16a34a', '#f43f5e', '#a855f7', '#1a202c'];

type Tab = 'tags' | 'notifications' | 'themes';

const defaultPrefs: Preferences = {
  theme: 'default',
  notificationSound: 'chime',
  notificationFontSize: '16',
  notificationFontFamily: 'system-ui',
  notificationColor: '#667eea',
  notificationMuted: false,
};

const Settings: React.FC = () => {
  const [tab, setTab] = useState<Tab>('tags');
  const [tags, setTags] = useState<Tag[]>([]);
  const [prefs, setPrefs] = useState<Preferences>(defaultPrefs);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    (async () => {
      try {
        const [tagList, preferences] = await Promise.all([tagsAPI.listAll(), profileAPI.getPreferences()]);
        setTags(tagList);
        setPrefs({ ...defaultPrefs, ...preferences });
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

  const handleSoundChange = (sound: string) => {
    savePreferences({ notificationSound: sound });
    if (!prefs.notificationMuted) {
      playNotificationSound(sound);
    }
  };

  const handleToggleMute = () => {
    const nowMuted = !prefs.notificationMuted;
    savePreferences({ notificationMuted: nowMuted });
    if (!nowMuted) {
      playNotificationSound(prefs.notificationSound);
    }
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
              Click a tag to edit its name, contact phone, and address visibility.
            </p>
            {tags.length === 0 ? (
              <p>No tags yet.</p>
            ) : (
              tags.map((t) => (
                <div key={t.id} className={styles.toggleRow}>
                  <Link to={`/tags/${t.id}`} style={{ textDecoration: 'none', color: 'inherit', flex: 1 }}>
                    <strong>{t.tagName}</strong>
                    <div style={{ fontSize: 13, color: 'var(--gray-500)' }}>{t.category}</div>
                  </Link>
                  <label className={styles.switch} onClick={(e) => e.stopPropagation()}>
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
              <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                <select
                  value={prefs.notificationSound}
                  onChange={(e) => handleSoundChange(e.target.value)}
                  style={{ padding: '12px 16px', border: '2px solid var(--gray-200)', borderRadius: 8, flex: 1, background: 'var(--surface)', color: 'var(--gray-800)' }}
                >
                  {SOUND_OPTIONS.map((s) => (
                    <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => playNotificationSound(prefs.notificationSound)}
                  disabled={prefs.notificationSound === 'none'}
                  title="Preview sound"
                  style={{ padding: '10px 14px', border: '2px solid var(--gray-200)', borderRadius: 8, background: 'var(--surface)', cursor: 'pointer' }}
                >
                  ▶️
                </button>
                <button
                  type="button"
                  onClick={handleToggleMute}
                  title={prefs.notificationMuted ? 'Unmute notifications' : 'Mute notifications'}
                  style={{ padding: '10px 14px', border: '2px solid var(--gray-200)', borderRadius: 8, background: prefs.notificationMuted ? '#fed7d7' : 'var(--surface)', cursor: 'pointer' }}
                >
                  {prefs.notificationMuted ? '🔇' : '🔊'}
                </button>
              </div>
              <span className={styles.hint}>
                {prefs.notificationMuted ? 'Muted — notification popups will be silent.' : 'Unmuted (default) — changing the sound plays a preview.'}
              </span>
            </div>

            <div className={styles.formGroup}>
              <label>Font size (px)</label>
              <select
                value={prefs.notificationFontSize}
                onChange={(e) => savePreferences({ notificationFontSize: e.target.value })}
                style={{ padding: '12px 16px', border: '2px solid var(--gray-200)', borderRadius: 8, background: 'var(--surface)', color: 'var(--gray-800)' }}
              >
                {FONT_SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}px</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>Font style</label>
              <select
                value={prefs.notificationFontFamily}
                onChange={(e) => savePreferences({ notificationFontFamily: e.target.value })}
                style={{ padding: '12px 16px', border: '2px solid var(--gray-200)', borderRadius: 8, background: 'var(--surface)', color: 'var(--gray-800)' }}
              >
                {FONT_FAMILY_OPTIONS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
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
                fontSize: `${prefs.notificationFontSize}px`,
                fontFamily: prefs.notificationFontFamily,
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
