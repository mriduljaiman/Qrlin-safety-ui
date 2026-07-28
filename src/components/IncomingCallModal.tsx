import React, { useEffect, useRef, useState } from 'react';
import Modal from './Common/Modal';
import { useAuth } from '../hooks/useAuth';
import { useWebSocket } from '../hooks/useWebSocket';
import { callAPI } from '../api/calls';
import { useCallSignaling } from '../hooks/useCallSignaling';
import { playNotificationSound } from '../utils/notificationSounds';
import { IceServer } from '../types/tag';

interface IncomingCallEvent {
  type: string;
  qrCode: string;
  tagName?: string;
  sessionToken: string;
  iceServers: IceServer[];
}

const RING_TIMEOUT_MS = 30000;

// Empty until the CALL_INCOMING push arrives - it carries the same STUN/TURN config the
// backend handed the finder, so both sides always agree (no second hardcoded copy to drift).
const EMPTY_ICE_SERVERS: IceServer[] = [];

const IncomingCallModal: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { subscribeToScans, connected } = useWebSocket();
  const [call, setCall] = useState<IncomingCallEvent | null>(null);
  const [accepted, setAccepted] = useState(false);
  const ringIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ringTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { state, durationSeconds, audioRef, join, hangup } = useCallSignaling(
    accepted && call ? call.sessionToken : null,
    call?.iceServers && call.iceServers.length > 0 ? call.iceServers : EMPTY_ICE_SERVERS,
    'callee'
  );
  const joinedForRef = useRef<string | null>(null);
  const closedForRef = useRef<string | null>(null);

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

  // `join` closes over the sessionToken that was current when this render happened. Calling
  // it directly from the Answer button's onClick handler would use the closure from *before*
  // setAccepted(true) takes effect (React state updates aren't synchronous), so it would still
  // see sessionToken=null and no-op - the call would look "answered" but never actually connect.
  // Running it from an effect keyed off `accepted` guarantees it fires with the up-to-date join.
  useEffect(() => {
    if (accepted && call && joinedForRef.current !== call.sessionToken) {
      joinedForRef.current = call.sessionToken;
      join();
    }
  }, [accepted, call, join]);

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

  // Fires whether the owner hung up or the finder did - either way `state` lands here once
  // the call was actually joined, so this is the one place that reports the outcome and
  // dismisses the popup instead of duplicating that in the Hang Up button handler too.
  useEffect(() => {
    if (!call || !accepted) return;
    if ((state === 'ended' || state === 'failed') && closedForRef.current !== call.sessionToken) {
      closedForRef.current = call.sessionToken;
      (async () => {
        try {
          const status = state === 'failed' ? 'FAILED' : durationSeconds > 0 ? 'COMPLETED' : 'MISSED';
          await callAPI.reportEnd(call.qrCode, call.sessionToken, status, durationSeconds);
        } catch {
          // Best-effort.
        }
        setCall(null);
        setAccepted(false);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, accepted, call]);

  const handleAccept = () => {
    setAccepted(true);
  };

  const handleEnd = async () => {
    if (!call) return;
    if (accepted) {
      // Reported by the effect above once `state` reflects the hangup.
      hangup();
      return;
    }
    // Declining before ever answering - no signaling session to tear down.
    try {
      await callAPI.reportEnd(call.qrCode, call.sessionToken, 'MISSED', 0);
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
