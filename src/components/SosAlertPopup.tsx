import React, { useEffect, useRef, useState } from 'react';
import Modal from './Common/Modal';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import { playNotificationSound } from '../utils/notificationSounds';

interface SosEvent {
  type: string;
  tagName?: string;
  timestamp: string;
  latitude?: string;
  longitude?: string;
}

const SosAlertPopup: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { subscribeToScans, connected } = useWebSocket();
  const [event, setEvent] = useState<SosEvent | null>(null);
  const ringIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isAuthenticated || !user || !connected) return;
    const unsubscribe = subscribeToScans(user.id, (message: SosEvent) => {
      if (message.type === 'SOS_ALERT') {
        setEvent(message);
      }
    });
    return () => unsubscribe?.();
  }, [isAuthenticated, user, connected, subscribeToScans]);

  useEffect(() => {
    if (event) {
      playNotificationSound('alert');
      ringIntervalRef.current = setInterval(() => playNotificationSound('alert'), 2000);
    }
    return () => {
      if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
    };
  }, [event]);

  if (!event) return null;

  return (
    <Modal isOpen title="🚨 Urgent Alert" onClose={() => setEvent(null)}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div
          style={{
            background: '#fed7d7', color: '#742a2a', padding: 14, borderRadius: 8,
            fontWeight: 700, fontSize: 15,
          }}
        >
          Someone who scanned <strong>{event.tagName || 'your tag'}</strong> just sent an urgent SOS alert.
        </div>
        <p style={{ margin: 0, fontSize: 13, color: 'var(--gray-500)' }}>
          {new Date(event.timestamp).toLocaleString()}
        </p>
        <button
          onClick={() => setEvent(null)}
          style={{
            padding: '10px 16px', background: '#e53e3e', color: 'white',
            border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
          }}
        >
          Acknowledge
        </button>
      </div>
    </Modal>
  );
};

export default SosAlertPopup;
