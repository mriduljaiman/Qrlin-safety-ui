import { useCallback, useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { IceServer } from '../types/tag';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export type CallState = 'idle' | 'connecting' | 'connected' | 'ended' | 'failed';

interface SignalPayload {
  senderId: string;
  kind: 'ready' | 'offer' | 'answer' | 'ice-candidate' | 'hangup';
  data?: unknown;
}

/**
 * Owns one WebRTC call session end-to-end: a dedicated anonymous STOMP connection scoped to
 * this call (separate from the authenticated WebSocketContext, so the finder side - never
 * authenticated - can use it too), signaling over /app/call/{sessionToken}/signal <->
 * /topic/call/{sessionToken}, and the RTCPeerConnection itself. Free, no telephony vendor -
 * media is peer-to-peer (or STUN/TURN-assisted), the backend only relays SDP/ICE.
 */
export const useCallSignaling = (
  sessionToken: string | null,
  iceServers: IceServer[],
  role: 'caller' | 'callee'
) => {
  const [state, setState] = useState<CallState>('idle');
  const [durationSeconds, setDurationSeconds] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const stompRef = useRef<Client | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const senderIdRef = useRef(Math.random().toString(36).slice(2));
  const connectedAtRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const offerSentRef = useRef(false);

  const send = useCallback(
    (payload: Omit<SignalPayload, 'senderId'>) => {
      if (!sessionToken || !stompRef.current?.connected) return;
      stompRef.current.publish({
        destination: `/app/call/${sessionToken}/signal`,
        body: JSON.stringify({ senderId: senderIdRef.current, ...payload }),
        headers: { 'content-type': 'application/json' },
      });
    },
    [sessionToken]
  );

  // Builds the RTCPeerConnection and grabs the mic. Deliberately synchronous with the caller -
  // don't defer this until a signaling message arrives async over the WebSocket, because by
  // then the original button-click's "user activation" has expired on several mobile browsers,
  // which then silently reject getUserMedia - the call would hang on "Connecting..." forever
  // with no visible error. Calling this eagerly, right when join() is invoked from the
  // Call/Answer button handler, keeps it tied to the user gesture and removes a network
  // round-trip from the connection setup critical path.
  const ensurePeerConnection = useCallback(async () => {
    if (pcRef.current) return pcRef.current;

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    localStreamRef.current = stream;

    const pc = new RTCPeerConnection({
      iceServers: iceServers.map((s) => ({ urls: s.urls, username: s.username, credential: s.credential })),
    });
    stream.getTracks().forEach((track) => pc.addTrack(track, stream));

    pc.onicecandidate = (e) => {
      if (e.candidate) send({ kind: 'ice-candidate', data: e.candidate.toJSON() });
    };

    pc.ontrack = (e) => {
      if (audioRef.current) {
        audioRef.current.srcObject = e.streams[0];
        audioRef.current.play().catch(() => {});
      }
    };

    pc.onconnectionstatechange = () => {
      if (pc.connectionState === 'connected') {
        connectedAtRef.current = Date.now();
        setState('connected');
        timerRef.current = setInterval(() => {
          setDurationSeconds(Math.floor((Date.now() - (connectedAtRef.current || Date.now())) / 1000));
        }, 1000);
      } else if (pc.connectionState === 'failed') {
        setState('failed');
      } else if (pc.connectionState === 'disconnected' || pc.connectionState === 'closed') {
        setState((prev) => (prev === 'connected' ? 'ended' : prev));
      }
    };

    pcRef.current = pc;
    return pc;
  }, [iceServers, send]);

  const join = useCallback(async () => {
    if (!sessionToken || stompRef.current) return;
    setState('connecting');

    try {
      await ensurePeerConnection();
    } catch (err) {
      console.error('Could not access microphone', err);
      setState('failed');
      return;
    }

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_URL}/ws`),
      reconnectDelay: 3000,
      onConnect: () => {
        client.subscribe(`/topic/call/${sessionToken}`, async (message) => {
          try {
            const payload: SignalPayload = JSON.parse(message.body);
            if (payload.senderId === senderIdRef.current) return;

            const pc = pcRef.current;
            if (!pc) return;

            if (payload.kind === 'ready' && role === 'caller' && !offerSentRef.current) {
              offerSentRef.current = true;
              const offer = await pc.createOffer();
              await pc.setLocalDescription(offer);
              send({ kind: 'offer', data: offer });
            } else if (payload.kind === 'offer' && role === 'callee') {
              await pc.setRemoteDescription(payload.data as RTCSessionDescriptionInit);
              const answer = await pc.createAnswer();
              await pc.setLocalDescription(answer);
              send({ kind: 'answer', data: answer });
            } else if (payload.kind === 'answer' && role === 'caller') {
              await pc.setRemoteDescription(payload.data as RTCSessionDescriptionInit);
            } else if (payload.kind === 'ice-candidate') {
              try {
                await pc.addIceCandidate(payload.data as RTCIceCandidateInit);
              } catch {
                // Candidate can arrive before remote description is set in rare races - safe to drop.
              }
            } else if (payload.kind === 'hangup') {
              setState('ended');
            }
          } catch (err) {
            console.error('Call signaling error', err);
            setState('failed');
          }
        });

        send({ kind: 'ready' });
      },
      onStompError: (frame) => {
        console.error('STOMP error during call signaling', frame.headers, frame.body);
        setState('failed');
      },
      onWebSocketError: (err) => {
        console.error('WebSocket error during call signaling', err);
        setState('failed');
      },
    });

    client.activate();
    stompRef.current = client;
  }, [sessionToken, role, ensurePeerConnection, send]);

  const hangup = useCallback(() => {
    send({ kind: 'hangup' });
    if (timerRef.current) clearInterval(timerRef.current);
    pcRef.current?.close();
    pcRef.current = null;
    localStreamRef.current?.getTracks().forEach((t) => t.stop());
    localStreamRef.current = null;
    stompRef.current?.deactivate();
    stompRef.current = null;
    setState('ended');
  }, [send]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      pcRef.current?.close();
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
      stompRef.current?.deactivate();
    };
  }, []);

  return { state, durationSeconds, audioRef, join, hangup };
};
