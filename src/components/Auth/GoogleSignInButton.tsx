import React, { useEffect, useRef } from 'react';
import { Capacitor } from '@capacitor/core';
import { SocialLogin } from '@capgo/capacitor-social-login';

interface GoogleSignInButtonProps {
  onToken: (idToken: string) => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

let nativeInitPromise: Promise<void> | null = null;

// Google's own web Sign-In library (accounts.google.com/gsi/client) actively refuses to render
// inside an embedded WebView - it's a deliberate Google security policy, not something fixable
// from this side. The native platform instead goes through the device's real Google account
// picker via a Capacitor plugin, which Google does allow, then hands back an ID token with the
// same webClientId audience the backend already verifies against - no backend change needed.
const NativeGoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onToken }) => {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  const handlePress = async () => {
    if (!clientId) return;
    try {
      if (!nativeInitPromise) {
        nativeInitPromise = SocialLogin.initialize({ google: { webClientId: clientId } });
      }
      await nativeInitPromise;
      const { result } = await SocialLogin.login({ provider: 'google', options: {} });
      if (result.responseType === 'online' && result.idToken) {
        onToken(result.idToken);
      }
    } catch (err) {
      console.error('Native Google sign-in failed', err);
    }
  };

  if (!clientId) return null;

  return (
    <button
      type="button"
      onClick={handlePress}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
        width: '100%', maxWidth: 320, margin: '16px auto', padding: '10px 16px',
        border: '1px solid #dadce0', borderRadius: 4, background: 'white',
        color: '#3c4043', fontSize: 14, fontWeight: 500, cursor: 'pointer',
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18">
        <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
        <path fill="#FBBC05" d="M3.97 10.72A5.4 5.4 0 0 1 3.69 9c0-.6.1-1.18.28-1.72V4.95H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.05l3.01-2.33z" />
        <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
      </svg>
      Sign in with Google
    </button>
  );
};

const WebGoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onToken }) => {
  const buttonRef = useRef<HTMLDivElement>(null);
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!clientId) return;

    const scriptId = 'google-identity-services';
    const initialize = () => {
      if (!window.google || !buttonRef.current) return;
      window.google.accounts.id.initialize({
        client_id: clientId,
        callback: (response: { credential: string }) => onToken(response.credential),
      });
      window.google.accounts.id.renderButton(buttonRef.current, {
        theme: 'outline',
        size: 'large',
        width: 320,
      });
    };

    if (document.getElementById(scriptId)) {
      initialize();
      return;
    }

    const script = document.createElement('script');
    script.id = scriptId;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = initialize;
    document.body.appendChild(script);
  }, [clientId, onToken]);

  if (!clientId) {
    return null;
  }

  return <div ref={buttonRef} style={{ display: 'flex', justifyContent: 'center', margin: '16px 0' }} />;
};

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = (props) => {
  return Capacitor.isNativePlatform()
    ? <NativeGoogleSignInButton {...props} />
    : <WebGoogleSignInButton {...props} />;
};

export default GoogleSignInButton;
