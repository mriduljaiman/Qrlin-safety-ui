import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIconUrl from 'leaflet/dist/images/marker-icon.png?url';
import markerIcon2xUrl from 'leaflet/dist/images/marker-icon-2x.png?url';
import markerShadowUrl from 'leaflet/dist/images/marker-shadow.png?url';

const markerIcon = L.icon({
  iconUrl: markerIconUrl,
  iconRetinaUrl: markerIcon2xUrl,
  shadowUrl: markerShadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface ScanLocationMapProps {
  latitude?: string | null;
  longitude?: string | null;
}

async function reverseGeocode(lat: string, lng: string): Promise<string | null> {
  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
      { headers: { Accept: 'application/json' } }
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.display_name || null;
  } catch {
    return null;
  }
}

const ScanLocationMap: React.FC<ScanLocationMapProps> = ({ latitude, longitude }) => {
  const [address, setAddress] = useState<string | null>(null);
  const [loadingAddress, setLoadingAddress] = useState(false);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  useEffect(() => {
    setAddress(null);
    if (latitude && longitude && latitude !== 'null') {
      setLoadingAddress(true);
      reverseGeocode(latitude, longitude)
        .then((a) => setAddress(a))
        .finally(() => setLoadingAddress(false));
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (!latitude || !longitude || latitude === 'null' || !mapContainerRef.current) return;
    const lat = Number(latitude);
    const lng = Number(longitude);

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, { attributionControl: false }).setView([lat, lng], 15);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);
      L.control.attribution({ prefix: false })
        .addAttribution('© <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener noreferrer">OpenStreetMap contributors</a>')
        .addTo(map);
      markerRef.current = L.marker([lat, lng], { icon: markerIcon }).addTo(map);
      mapRef.current = map;
    } else {
      mapRef.current.setView([lat, lng], 15);
      markerRef.current?.setLatLng([lat, lng]);
    }

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
  }, [latitude, longitude]);

  return (
    <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: 12, fontSize: 14 }}>
      <strong>Scanner's location</strong>
      <div style={{ marginTop: 4 }}>
        {loadingAddress && 'Looking up address...'}
        {!loadingAddress && address && (
          <span>
            {address}
            <span style={{ color: 'var(--gray-400)', fontSize: 12 }}> (approximate)</span>
          </span>
        )}
        {!loadingAddress && !address && latitude && (
          <span>Approx. {latitude}, {longitude}</span>
        )}
        {!loadingAddress && !address && !latitude && 'Location not shared by the finder\'s browser.'}
      </div>

      {latitude && longitude && (
        <div style={{ marginTop: 10 }}>
          <div
            ref={mapContainerRef}
            style={{ height: 180, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--gray-200)' }}
          />
          <a
            href={`https://www.google.com/maps?q=${latitude},${longitude}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12, color: 'var(--primary)', display: 'inline-block', marginTop: 6 }}
          >
            Open exact pin in Google Maps ↗
          </a>
        </div>
      )}
    </div>
  );
};

export default ScanLocationMap;
