import { useEffect, useState } from 'react';
import { profileAPI } from '../api/profile';
import { getTimezoneForCountry } from '../utils/countryTimezones';

// Resolves the current owner's profile Country into an IANA timezone, so
// timestamps display in their chosen country's time instead of whatever
// timezone the current device happens to be set to.
export function useCountryTimezone(): string | undefined {
  const [tz, setTz] = useState<string | undefined>(undefined);

  useEffect(() => {
    profileAPI.getMe()
      .then((p) => setTz(getTimezoneForCountry(p.country)))
      .catch(() => {});
  }, []);

  return tz;
}
