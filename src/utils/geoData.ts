import { SearchableSelectOption } from '../components/Common/SearchableSelect';

export interface CountryOption extends SearchableSelectOption {
  phoneCode: string;
}

let cache: typeof import('country-state-city') | null = null;

async function loadModule() {
  if (!cache) {
    cache = await import('country-state-city');
  }
  return cache;
}

export async function loadCountries(): Promise<CountryOption[]> {
  const { Country } = await loadModule();
  return Country.getAllCountries()
    .map((c) => ({ value: c.isoCode, label: `${c.flag} ${c.name}`, phoneCode: `+${c.phonecode}` }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export async function loadPhoneCodes(): Promise<SearchableSelectOption[]> {
  const { Country } = await loadModule();
  const seen = new Set<string>();
  const options: SearchableSelectOption[] = [];
  for (const c of Country.getAllCountries()) {
    const code = `+${c.phonecode}`;
    if (!c.phonecode || seen.has(code)) continue;
    seen.add(code);
    options.push({ value: code, label: `${code} (${c.name})` });
  }
  return options.sort((a, b) => Number(a.value.replace('+', '')) - Number(b.value.replace('+', '')));
}

export async function loadStates(countryIsoCode: string): Promise<SearchableSelectOption[]> {
  const { State } = await loadModule();
  return State.getStatesOfCountry(countryIsoCode)
    .map((s) => ({ value: s.isoCode, label: s.name }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export async function loadCities(countryIsoCode: string, stateIsoCode: string): Promise<SearchableSelectOption[]> {
  const { City } = await loadModule();
  return City.getCitiesOfState(countryIsoCode, stateIsoCode)
    .map((c) => ({ value: c.name, label: c.name }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export async function findCountryByName(name: string): Promise<CountryOption | null> {
  const countries = await loadCountries();
  return countries.find((c) => c.label.toLowerCase().includes(name.toLowerCase())) || null;
}

export async function findStateByName(countryIsoCode: string, name: string): Promise<SearchableSelectOption | null> {
  const states = await loadStates(countryIsoCode);
  return states.find((s) => s.label.toLowerCase() === name.toLowerCase()) || null;
}
