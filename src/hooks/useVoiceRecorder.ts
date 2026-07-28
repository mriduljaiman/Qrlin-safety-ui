import { useCallback, useRef, useState } from 'react';

const MAX_DURATION_SECONDS = 60;

export type RecorderState = 'idle' | 'recording' | 'recorded';

export const useVoiceRecorder = () => {
  const [state, setState] = useState<RecorderState>('idle');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [blob, setBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const startedAtRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const start = useCallback(async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    chunksRef.current = [];
    setBlob(null);

    const recorder = new MediaRecorder(stream);
    mediaRecorderRef.current = recorder;
    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      setBlob(new Blob(chunksRef.current, { type: recorder.mimeType || 'audio/webm' }));
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    };

    recorder.start();
    startedAtRef.current = Date.now();
    setDurationSeconds(0);
    setState('recording');

    timerRef.current = setInterval(() => {
      const elapsed = Math.floor((Date.now() - startedAtRef.current) / 1000);
      setDurationSeconds(elapsed);
      if (elapsed >= MAX_DURATION_SECONDS) {
        recorder.stop();
        stopTimer();
        setState('recorded');
      }
    }, 250);
  }, []);

  const stop = useCallback(() => {
    stopTimer();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setState('recorded');
  }, []);

  const reset = useCallback(() => {
    stopTimer();
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    mediaRecorderRef.current = null;
    chunksRef.current = [];
    setBlob(null);
    setDurationSeconds(0);
    setState('idle');
  }, []);

  return { state, durationSeconds, blob, start, stop, reset };
};
