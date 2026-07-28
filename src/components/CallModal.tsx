import React, { useEffect, useRef } from 'react';
import Modal from './Common/Modal';
import { callAPI } from '../api/calls';
import { useCallSignaling } from '../hooks/useCallSignaling';
import { IceServer } from '../types/tag';

interface CallModalProps {
  code: string;
  sessionToken: string;
  iceServers: IceServer[];
  onClose: () => void;
}

const CallModal: React.FC<CallModalProps> = ({ code, sessionToken, iceServers, onClose }) => {
  const { state, durationSeconds, audioRef, join, hangup } = useCallSignaling(sessionToken, iceServers, 'caller');
  const joinedRef = useRef(false);

  useEffect(() => {
    if (!joinedRef.current) {
      joinedRef.current = true;
      join();
    }
  }, [join]);

  const handleClose = async () => {
    const finalStatus = state === 'connected' ? 'COMPLETED' : 'MISSED';
    hangup();
    try {
      await callAPI.reportEnd(code, sessionToken, finalStatus, durationSeconds);
    } catch {
      // Best-effort - the session is already ended client-side either way.
    }
    onClose();
  };

  const statusLabel =
    state === 'connecting' ? 'Calling owner...' :
    state === 'connected' ? `Connected — ${durationSeconds}s` :
    state === 'failed' ? 'Could not connect' :
    'Call ended';

  return (
    <Modal isOpen title="📞 Calling Owner" onClose={handleClose}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '12px 0' }}>
        <div style={{ fontSize: 40 }}>{state === 'connected' ? '🔊' : '📞'}</div>
        <p style={{ margin: 0, fontWeight: 600 }}>{statusLabel}</p>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--gray-500)' }}>
          Free, over the internet — no phone numbers are shared.
        </p>
        <audio ref={audioRef} autoPlay />
        <button
          onClick={handleClose}
          style={{
            marginTop: 8, padding: '10px 24px', background: '#e53e3e', color: 'white',
            border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600,
          }}
        >
          Hang Up
        </button>
      </div>
    </Modal>
  );
};

export default CallModal;
