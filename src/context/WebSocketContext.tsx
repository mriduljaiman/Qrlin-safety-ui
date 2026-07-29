import React, { createContext, useEffect, useRef, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client, StompSubscription } from '@stomp/stompjs';
import { useAuth } from '../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface WebSocketContextType {
  connected: boolean;
  subscribeToScans: (userId: number, callback: (message: any) => void) => (() => void) | undefined;
  disconnect: () => void;
}

export const WebSocketContext = createContext<WebSocketContextType>({
  connected: false,
  subscribeToScans: () => undefined,
  disconnect: () => {},
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connected, setConnected] = useState(false);
  const clientRef = useRef<Client | null>(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_URL}/ws`),
      // The backend only trusts a STOMP session's identity if it presented a valid JWT at
      // CONNECT - without this, /topic/user/{id} subscriptions from this client get rejected
      // (see StompAuthChannelInterceptor), since /ws itself has no HTTP-level auth to fall back on.
      connectHeaders: { Authorization: `Bearer ${localStorage.getItem('token') || ''}` },
      reconnectDelay: 5000,
      onConnect: () => {
        clientRef.current = client;
        setConnected(true);
      },
      onDisconnect: () => setConnected(false),
      onWebSocketClose: () => setConnected(false),
      onStompError: (frame) => {
        console.error('WebSocket broker error', frame);
        setConnected(false);
      },
    });

    client.activate();

    return () => {
      setConnected(false);
      clientRef.current = null;
      client.deactivate();
    };
  }, [isAuthenticated, user]);

  // Returns an unsubscribe function so callers can clean up in their own effect -
  // if not connected yet, returns undefined; the caller should re-run once `connected` flips true.
  const subscribeToScans = (userId: number, callback: (message: any) => void) => {
    const client = clientRef.current;
    if (!client || !client.connected) return undefined;

    const subscription: StompSubscription = client.subscribe(`/topic/user/${userId}`, (message) => {
      callback(JSON.parse(message.body));
    });

    return () => subscription.unsubscribe();
  };

  const disconnect = () => {
    clientRef.current?.deactivate();
  };

  return (
    <WebSocketContext.Provider value={{ connected, subscribeToScans, disconnect }}>
      {children}
    </WebSocketContext.Provider>
  );
};
