import { useState, useEffect } from 'react';

interface GeolocationState {
  latitude: string | null;
  longitude: string | null;
  error: string | null;
}

export const useGeolocation = () => {
  const [location, setLocation] = useState<GeolocationState>({
    latitude: null,
    longitude: null,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation(prev => ({ ...prev, error: 'Geolocation not supported' }));
return;
}

navigator.geolocation.getCurrentPosition(
    (position) => {
      setLocation({
        latitude: position.coords.latitude.toString(),
        longitude: position.coords.longitude.toString(),
        error: null,
      });
    },
    (error) => {
      setLocation(prev => ({ ...prev, error: error.message }));
    }
  );
}, []);
return location;
};