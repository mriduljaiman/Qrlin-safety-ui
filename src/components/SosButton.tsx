import React, { useRef, useState } from 'react';
import { sosAPI } from '../api/sos';

const HOLD_MS = 2000;

interface SosButtonProps {
  code: string;
  lat?: string;
  lng?: string;
}

const SosButton: React.FC<SosButtonProps> = ({ code, lat, lng }) => {
  const [progress, setProgress] = useState(0);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(false);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef(0);

  const cancel = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    setProgress(0);
  };

  const tick = () => {
    const elapsed = Date.now() - startRef.current;
    const pct = Math.min(elapsed / HOLD_MS, 1);
    setProgress(pct);
    if (pct >= 1) {
      cancel();
      fireSos();
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  };

  const start = () => {
    setError(false);
    startRef.current = Date.now();
    rafRef.current = requestAnimationFrame(tick);
  };

  const fireSos = async () => {
    try {
      await sosAPI.trigger(code, lat, lng);
      setSent(true);
      setTimeout(() => setSent(false), 4000);
    } catch {
      setError(true);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
      <button
        type="button"
        onPointerDown={start}
        onPointerUp={cancel}
        onPointerLeave={cancel}
        style={{
          position: 'relative',
          width: 64,
          height: 64,
          borderRadius: '50%',
          border: 'none',
          cursor: 'pointer',
          background: `conic-gradient(#742a2a ${progress * 360}deg, #e53e3e ${progress * 360}deg)`,
          color: 'white',
          fontWeight: 700,
          fontSize: 13,
          userSelect: 'none',
          touchAction: 'none',
        }}
        title="Hold for 2 seconds to send an urgent alert"
      >
        SOS
      </button>
      <span style={{ fontSize: 11, color: 'var(--gray-500)' }}>
        {sent ? '🚨 Alert sent to owner' : error ? 'Failed — try again' : 'Hold 2s for urgent alert'}
      </span>
    </div>
  );
};

export default SosButton;
