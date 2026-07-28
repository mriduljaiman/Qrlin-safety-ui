import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Modal from './Common/Modal';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import { profileAPI } from '../api/profile';
import { Preferences } from '../types/profile';
import { playNotificationSound } from '../utils/notificationSounds';

interface ScanEvent {
  type: string;
  qrCode: string;
  category?: string;
  tagName?: string;
  timestamp: string;
  latitude?: string;
  longitude?: string;
  lostMode?: boolean;
}

async function reverseGeocode(lat: string, lng: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.display_name || null;
  } catch {
    return null;
  }
}

const ScanNotificationPopup: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const { subscribeToScans, connected } = useWebSocket();
  const navigate = useNavigate();
  const [event, setEvent] = useState<ScanEvent | null>(null);
  const [address, setAddress] = useState<string | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const [prefs, setPrefs] = useState<Preferences | null>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    profileAPI.getPreferences().then(setPrefs).catch(() => {});
  }, [isAuthenticated]);

  useEffect(() => {
    if (!isAuthenticated || !user || !connected) return;

    const unsubscribe = subscribeToScans(user.id, (message: ScanEvent) => {
      setEvent(message);
      setAddress(null);

      if (!prefs?.notificationMuted) {
        playNotificationSound(prefs?.notificationSound || 'chime');
      }

      if (message.latitude && message.longitude && message.latitude !== 'null') {
        setLoadingAddress(true);
        reverseGeocode(message.latitude, message.longitude)
          .then((a) => setAddress(a))
          .finally(() => setLoadingAddress(false));
      }
    });

    return () => unsubscribe?.();
  }, [isAuthenticated, user, connected, subscribeToScans, prefs]);

  if (!event) return null;

  const scanTime = new Date(event.timestamp).toLocaleString();
  const textStyle: React.CSSProperties = {
    fontSize: `${prefs?.notificationFontSize || '16'}px`,
    fontFamily: prefs?.notificationFontFamily || 'system-ui',
  };

  return (
    <Modal isOpen={!!event} onClose={() => setEvent(null)} title="🔔 Your tag was scanned">
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, ...textStyle }}>
        <p style={{ margin: 0 }}>
          <strong>{event.tagName || 'A tag'}</strong>
          {event.category && <span style={{ color: 'var(--gray-500)' }}> ({event.category})</span>} was just scanned.
        </p>
        <p style={{ margin: 0, fontSize: 14, color: 'var(--gray-500)' }}>{scanTime}</p>

        <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: 12, fontSize: 14 }}>
          <strong>Scanner's location</strong>
          <div style={{ marginTop: 4 }}>
            {loadingAddress && 'Looking up address...'}
            {!loadingAddress && address && address}
            {!loadingAddress && !address && event.latitude && (
              <span>Approx. {event.latitude}, {event.longitude}</span>
            )}
            {!loadingAddress && !address && !event.latitude && 'Location not shared by the finder\'s browser.'}
          </div>

          {event.latitude && event.longitude && (
            <div style={{ marginTop: 10 }}>
              <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--gray-200)' }}>
                <iframe
                  title="Scanner's exact location"
                  width="100%"
                  height="180"
                  style={{ border: 0, display: 'block' }}
                  loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(event.longitude) - 0.006}%2C${Number(event.latitude) - 0.004}%2C${Number(event.longitude) + 0.006}%2C${Number(event.latitude) + 0.004}&layer=mapnik&marker=${event.latitude}%2C${event.longitude}`}
                />
              </div>
              <a
                href={`https://www.google.com/maps?q=${event.latitude},${event.longitude}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ fontSize: 12, color: 'var(--primary)', display: 'inline-block', marginTop: 6 }}
              >
                Open exact pin in Google Maps ↗
              </a>
            </div>
          )}
        </div>

        {event.lostMode && (
          <div style={{ background: '#fed7d7', color: '#c53030', padding: 10, borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
            This tag is currently marked as lost.
          </div>
        )}

        <button
          onClick={() => {
            navigate('/dashboard');
            setEvent(null);
          }}
          style={{
            marginTop: 8,
            padding: '10px 16px',
            background: prefs?.notificationColor || 'var(--primary)',
            color: 'white',
            border: 'none',
            borderRadius: 8,
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          View My Tags
        </button>
      </div>
    </Modal>
  );
};

export default ScanNotificationPopup;
