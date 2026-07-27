import React, { createContext, useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { useAuth } from '../hooks/useAuth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

interface WebSocketContextType {
  subscribeToScans: (userId: number, callback: (message: any) => void) => void;
  disconnect: () => void;
}

export const WebSocketContext = createContext<WebSocketContextType>({
  subscribeToScans: () => {},
  disconnect: () => {},
});

export const WebSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [stompClient, setStompClient] = useState<Client | null>(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const client = new Client({
      webSocketFactory: () => new SockJS(`${API_URL}/ws`),
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
      onConnect: () => {
        console.log('✅ WebSocket connected');
        setStompClient(client);
      },
      onStompError: (frame) => {
        console.error('❌ Broker error', frame);
      },
    });

    client.activate();

    return () => {
      client.deactivate();
    };
  }, [isAuthenticated, user]);

  const subscribeToScans = (userId: number, callback: (message: any) => void) => {
    if (!stompClient || !stompClient.connected) return;

    stompClient.subscribe(`/topic/user/${userId}`, (message) => {
      callback(JSON.parse(message.body));
    });
  };

  const disconnect = () => {
    stompClient?.deactivate();
  };

  return (
    <WebSocketContext.Provider value={{ subscribeToScans, disconnect }}>
      {children}
    </WebSocketContext.Provider>
  );
};
