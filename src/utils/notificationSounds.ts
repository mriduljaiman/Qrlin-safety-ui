/**
 * Notification sounds synthesized with the Web Audio API - no audio files to host,
 * no licensing to worry about. Each entry is a short envelope-shaped tone (or a few
 * of them in sequence) built from oscillators.
 */

export const SOUND_OPTIONS = [
  'none', 'chime', 'bell', 'ping', 'pop', 'ding', 'beep', 'alert',
  'soft', 'marimba', 'xylophone', 'classic', 'whistle', 'drop', 'sparkle',
] as const;

export type SoundName = (typeof SOUND_OPTIONS)[number];

let audioCtx: AudioContext | null = null;

function getContext(): AudioContext {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

function tone(
  ctx: AudioContext,
  startTime: number,
  freq: number,
  duration: number,
  type: OscillatorType = 'sine',
  peakGain = 0.25,
  freqEnd?: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, startTime);
  if (freqEnd !== undefined) {
    osc.frequency.linearRampToValueAtTime(freqEnd, startTime + duration);
  }

  gain.gain.setValueAtTime(0, startTime);
  gain.gain.linearRampToValueAtTime(peakGain, startTime + Math.min(0.02, duration / 4));
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.start(startTime);
  osc.stop(startTime + duration + 0.02);
}

export function playNotificationSound(sound: string) {
  if (sound === 'none') return;

  try {
    const ctx = getContext();
    const now = ctx.currentTime;

    switch (sound as SoundName) {
      case 'chime':
        tone(ctx, now, 784, 0.18, 'sine');
        tone(ctx, now + 0.12, 1047, 0.25, 'sine');
        break;
      case 'bell':
        tone(ctx, now, 880, 0.6, 'sine', 0.3);
        tone(ctx, now, 1760, 0.4, 'sine', 0.08);
        break;
      case 'ping':
        tone(ctx, now, 1800, 0.12, 'sine', 0.2);
        break;
      case 'pop':
        tone(ctx, now, 220, 0.1, 'sine', 0.3, 700);
        break;
      case 'ding':
        tone(ctx, now, 1046, 0.3, 'triangle', 0.25);
        break;
      case 'beep':
        tone(ctx, now, 440, 0.15, 'square', 0.12);
        break;
      case 'alert':
        tone(ctx, now, 600, 0.15, 'square', 0.15);
        tone(ctx, now + 0.2, 900, 0.15, 'square', 0.15);
        tone(ctx, now + 0.4, 600, 0.15, 'square', 0.15);
        break;
      case 'soft':
        tone(ctx, now, 330, 0.8, 'sine', 0.12);
        break;
      case 'marimba':
        tone(ctx, now, 400, 0.25, 'triangle', 0.25);
        break;
      case 'xylophone':
        tone(ctx, now, 1318, 0.2, 'triangle', 0.22);
        break;
      case 'classic':
        tone(ctx, now, 659, 0.12, 'sine', 0.2);
        tone(ctx, now + 0.1, 880, 0.18, 'sine', 0.2);
        break;
      case 'whistle':
        tone(ctx, now, 500, 0.5, 'sine', 0.18, 1600);
        break;
      case 'drop':
        tone(ctx, now, 1200, 0.4, 'sine', 0.2, 300);
        break;
      case 'sparkle':
        [1200, 1500, 1800, 2100, 2400].forEach((f, i) => {
          tone(ctx, now + i * 0.06, f, 0.08, 'sine', 0.12);
        });
        break;
      default:
        tone(ctx, now, 784, 0.18, 'sine');
        tone(ctx, now + 0.12, 1047, 0.25, 'sine');
    }
  } catch (err) {
    console.warn('Could not play notification sound', err);
  }
}
