import React, { useEffect, useState } from 'react';

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

  useEffect(() => {
    setAddress(null);
    if (latitude && longitude && latitude !== 'null') {
      setLoadingAddress(true);
      reverseGeocode(latitude, longitude)
        .then((a) => setAddress(a))
        .finally(() => setLoadingAddress(false));
    }
  }, [latitude, longitude]);

  return (
    <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: 12, fontSize: 14 }}>
      <strong>Scanner's location</strong>
      <div style={{ marginTop: 4 }}>
        {loadingAddress && 'Looking up address...'}
        {!loadingAddress && address && address}
        {!loadingAddress && !address && latitude && (
          <span>Approx. {latitude}, {longitude}</span>
        )}
        {!loadingAddress && !address && !latitude && 'Location not shared by the finder\'s browser.'}
      </div>

      {latitude && longitude && (
        <div style={{ marginTop: 10 }}>
          <div style={{ borderRadius: 8, overflow: 'hidden', border: '1px solid var(--gray-200)' }}>
            <iframe
              title="Scanner's exact location"
              width="100%"
              height="180"
              style={{ border: 0, display: 'block' }}
              loading="lazy"
              src={`https://www.openstreetmap.org/export/embed.html?bbox=${Number(longitude) - 0.006}%2C${Number(latitude) - 0.004}%2C${Number(longitude) + 0.006}%2C${Number(latitude) + 0.004}&layer=mapnik&marker=${latitude}%2C${longitude}`}
            />
          </div>
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
