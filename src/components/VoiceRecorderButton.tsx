import React, { useState } from 'react';
import { useVoiceRecorder } from '../hooks/useVoiceRecorder';

interface VoiceRecorderButtonProps {
  onSend: (blob: Blob, durationSeconds: number) => Promise<void> | void;
  primaryColor?: string;
}

const VoiceRecorderButton: React.FC<VoiceRecorderButtonProps> = ({ onSend, primaryColor = 'var(--primary)' }) => {
  const recorder = useVoiceRecorder();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStart = async () => {
    setError(null);
    try {
      await recorder.start();
    } catch {
      setError('Microphone access denied');
    }
  };

  const handleSend = async () => {
    if (!recorder.blob) return;
    setSending(true);
    try {
      await onSend(recorder.blob, recorder.durationSeconds);
      recorder.reset();
    } catch {
      setError('Failed to send voice note');
    } finally {
      setSending(false);
    }
  };

  if (recorder.state === 'idle') {
    return (
      <button
        type="button"
        onClick={handleStart}
        title="Record a voice message"
        style={{
          width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer',
          background: 'var(--gray-100, #f0f0f0)', fontSize: 16, flexShrink: 0,
        }}
      >
        🎤
        {error && <span style={{ display: 'none' }}>{error}</span>}
      </button>
    );
  }

  if (recorder.state === 'recording') {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <span style={{ fontSize: 12, color: '#e53e3e', fontWeight: 600 }}>● {recorder.durationSeconds}s</span>
        <button
          type="button"
          onClick={recorder.stop}
          style={{
            width: 40, height: 40, borderRadius: '50%', border: 'none', cursor: 'pointer',
            background: '#e53e3e', color: 'white', fontSize: 14, flexShrink: 0,
          }}
          title="Stop recording"
        >
          ⏹
        </button>
      </div>
    );
  }

  // recorded - preview / send / discard
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <span style={{ fontSize: 12, color: 'var(--gray-500)' }}>{recorder.durationSeconds}s</span>
      <button
        type="button"
        onClick={recorder.reset}
        disabled={sending}
        style={{ border: 'none', background: 'none', cursor: 'pointer', fontSize: 16 }}
        title="Discard"
      >
        🗑️
      </button>
      <button
        type="button"
        onClick={handleSend}
        disabled={sending}
        style={{
          padding: '8px 14px', background: primaryColor, color: 'white',
          border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13,
        }}
      >
        {sending ? 'Sending...' : 'Send'}
      </button>
      {error && <span style={{ fontSize: 11, color: '#e53e3e' }}>{error}</span>}
    </div>
  );
};

export default VoiceRecorderButton;
