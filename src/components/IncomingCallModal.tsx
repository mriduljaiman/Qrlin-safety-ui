import React, { useEffect, useRef, useState } from 'react';
import Modal from './Common/Modal';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import { callAPI } from '../api/calls';
import { useCallSignaling } from '../hooks/useCallSignaling';
import { playNotificationSound } from '../utils/notificationSounds';

interface IncomingCallEvent {
  type: string;
  qrCode: string;
  tagName?: string;
  sessionToken: string;
}

const RING_TIMEOUT_MS = 30000;

// Google's public STUN - free, no vendor. Matches the finder-side config from the backend;
// hardcoded here too since the owner never calls POST /call and so never receives it.
// Defined outside the component so the array reference is stable across renders.
const DEFAULT_ICE_SERVERS = [{ urls: ['stun:stun.l.google.com:19302'] }];

const IncomingCallModal: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { subscribeToScans, connected } = useWebSocket();
  const [call, setCall] = useState<IncomingCallEvent | null>(null);
  const [accepted, setAccepted] = useState(false);
  const ringIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ringTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { state, durationSeconds, audioRef, join, hangup } = useCallSignaling(
    accepted && call ? call.sessionToken : null,
    DEFAULT_ICE_SERVERS,
    'callee'
  );

  useEffect(() => {
    if (!isAuthenticated || !user || !connected) return;
    const unsubscribe = subscribeToScans(user.id, (message: IncomingCallEvent) => {
      if (message.type === 'CALL_INCOMING') {
        setCall(message);
        setAccepted(false);
      }
    });
    return () => unsubscribe?.();
  }, [isAuthenticated, user, connected, subscribeToScans]);

  useEffect(() => {
    if (call && !accepted) {
      playNotificationSound('alert');
      ringIntervalRef.current = setInterval(() => playNotificationSound('alert'), 2500);
      ringTimeoutRef.current = setTimeout(() => setCall(null), RING_TIMEOUT_MS);
    }
    return () => {
      if (ringIntervalRef.current) clearInterval(ringIntervalRef.current);
      if (ringTimeoutRef.current) clearTimeout(ringTimeoutRef.current);
    };
  }, [call, accepted]);

  const handleAccept = () => {
    setAccepted(true);
    join();
  };

  const handleEnd = async () => {
    if (!call) return;
    const finalStatus = accepted && state === 'connected' ? 'COMPLETED' : 'MISSED';
    if (accepted) hangup();
    try {
      await callAPI.reportEnd(call.qrCode, call.sessionToken, finalStatus, durationSeconds);
    } catch {
      // Best-effort.
    }
    setCall(null);
    setAccepted(false);
  };

  if (!call) return null;

  return (
    <Modal isOpen title="📞 Incoming Call" onClose={handleEnd}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '12px 0' }}>
        <div style={{ fontSize: 40 }}>{accepted ? (state === 'connected' ? '🔊' : '📞') : '☎️'}</div>
        <p style={{ margin: 0, fontWeight: 600 }}>
          Someone who scanned <strong>{call.tagName || 'your tag'}</strong> is calling
        </p>
        {accepted && (
          <p style={{ margin: 0, fontSize: 12, color: 'var(--gray-500)' }}>
            {state === 'connecting' ? 'Connecting...' : state === 'connected' ? `${durationSeconds}s` : state}
          </p>
        )}
        <audio ref={audioRef} autoPlay />
        <div style={{ display: 'flex', gap: 12 }}>
          {!accepted && (
            <button
              onClick={handleAccept}
              style={{
                padding: '10px 24px', background: '#38a169', color: 'white',
                border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
              }}
            >
              Answer
            </button>
          )}
          <button
            onClick={handleEnd}
            style={{
              padding: '10px 24px', background: '#e53e3e', color: 'white',
              border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
            }}
          >
            {accepted ? 'Hang Up' : 'Decline'}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default IncomingCallModal;
