import { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { useAuth } from './useAuth';
import { CallBridge } from '../native/CallBridge';
import { devicesAPI } from '../api/devices';

// Registers this device's FCM token with the backend once logged in, so CallService/FcmService
// (backend) knows where to push CALL_INCOMING for this owner even when the app is backgrounded
// or killed. Unregisters on logout so a signed-out device stops ringing for whoever signs in
// next on it. Native-only - the web/PWA build has no FCM token to register.
export const useFcmTokenRegistration = () => {
  const { isAuthenticated } = useAuth();
  const registeredTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    if (isAuthenticated) {
      CallBridge.getCurrentToken()
        .then(({ token }) => {
          if (!token) return;
          registeredTokenRef.current = token;
          return devicesAPI.register(token, 'ANDROID');
        })
        .catch((err) => console.error('Failed to register FCM token', err));
    } else if (registeredTokenRef.current) {
      const token = registeredTokenRef.current;
      registeredTokenRef.current = null;
      devicesAPI.unregister(token).catch(() => {
        // Best-effort - a stale token left registered just means one extra (harmless, since the
        // owner is logged out) push attempt next time this device gets a call.
      });
    }
  }, [isAuthenticated]);
};
