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

  const start = (e: React.PointerEvent) => {
    e.preventDefault();
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

  const label = sent ? '🚨 Alert sent to owner' : error ? 'Failed — try again' : 'HOLD 2s FOR SOS ALERT';

  return (
    <button
      type="button"
      onPointerDown={start}
      onPointerUp={cancel}
      onPointerLeave={cancel}
      onPointerCancel={cancel}
      onContextMenu={(e) => e.preventDefault()}
      style={{
        position: 'relative',
        width: '100%',
        padding: '16px 20px',
        borderRadius: 10,
        border: '2px solid #e53e3e',
        cursor: 'pointer',
        background: `linear-gradient(to right, #742a2a ${progress * 100}%, #fff5f5 ${progress * 100}%)`,
        color: progress > 0.5 ? 'white' : '#c53030',
        fontWeight: 700,
        fontSize: 14,
        letterSpacing: 0.5,
        userSelect: 'none',
        WebkitUserSelect: 'none',
        WebkitTouchCallout: 'none',
        WebkitTapHighlightColor: 'transparent',
        touchAction: 'none',
        overflow: 'hidden',
        transition: 'color 0.1s linear',
      }}
      title="Hold for 2 seconds to send an urgent alert to the owner"
    >
      {label}
    </button>
  );
};

export default SosButton;
