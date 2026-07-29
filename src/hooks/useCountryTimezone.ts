import { useEffect, useState } from 'react';
import { profileAPI } from '../api/profile';
import { COUNTRY_TIMEZONES, getTimezoneForCountry } from '../utils/countryTimezones';

// Resolves the current owner's profile Country into an IANA timezone, so
// timestamps display in their chosen country's time instead of whatever
// timezone the current device happens to be set to.
//
// Starts with India as the initial value (not undefined) so the correct
// timezone applies from the very first render, with no dependency on the
// profile fetch succeeding or finishing in time - it only ever upgrades
// away from India if the fetch resolves with a different saved country.
export function useCountryTimezone(): string | undefined {
  const [tz, setTz] = useState<string | undefined>(COUNTRY_TIMEZONES.India);

  useEffect(() => {
    profileAPI.getMe()
      .then((p) => setTz(getTimezoneForCountry(p.country)))
      .catch((err) => {
        console.error('Could not load profile country for timezone, staying on India default', err);
      });
  }, []);

  return tz;
}
