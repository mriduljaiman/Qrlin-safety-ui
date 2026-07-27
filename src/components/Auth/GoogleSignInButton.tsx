import React, { useEffect, useRef } from 'react';

interface GoogleSignInButtonProps {
  onToken: (idToken: string) => void;
}

declare global {
  interface Window {
    google?: any;
  }
}

const GoogleSignInButton: React.FC<GoogleSignInButtonProps> = ({ onToken }) => {
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

export default GoogleSignInButton;
