import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: string | null;
  longitude: string | null;
  error: string | null;
  loading: boolean;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
    loading: true,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation({ latitude: null, longitude: null, error: 'Geolocation not supported', loading: false });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude.toString(),
          longitude: position.coords.longitude.toString(),
          error: null,
          loading: false,
        });
      },
      (error) => {
        // Permission denied, timed out, or unavailable - resolve "loading" either
        // way so callers waiting on this don't hang forever.
        setLocation({ latitude: null, longitude: null, error: error.message, loading: false });
      },
      { timeout: 5000, maximumAge: 0 }
    );
  }, []);

  return location;
};
