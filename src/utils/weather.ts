// Weather via Open-Meteo (free, no API key, CORS-friendly). Fetch + reverse
// geocode are side-effect wrappers; the WMO mapping + line formatting are pure
// and unit-tested. Spec calls for moving the fetch server-side (brainerd-api,
// cached) in Phase B-D — kept isolated here so that's an easy swap.

import type { BoardWeather } from '@/types/board';

// WMO weather interpretation codes → short board-friendly labels.
const WMO_LABELS: Record<number, string> = {
  0: 'CLEAR',
  1: 'MAINLY CLEAR',
  2: 'PARTLY CLOUDY',
  3: 'OVERCAST',
  45: 'FOG',
  48: 'RIME FOG',
  51: 'LIGHT DRIZZLE',
  53: 'DRIZZLE',
  55: 'HEAVY DRIZZLE',
  56: 'FRZ DRIZZLE',
  57: 'FRZ DRIZZLE',
  61: 'LIGHT RAIN',
  63: 'RAIN',
  65: 'HEAVY RAIN',
  66: 'FRZ RAIN',
  67: 'FRZ RAIN',
  71: 'LIGHT SNOW',
  73: 'SNOW',
  75: 'HEAVY SNOW',
  77: 'SNOW GRAINS',
  80: 'RAIN SHOWERS',
  81: 'RAIN SHOWERS',
  82: 'HEAVY SHOWERS',
  85: 'SNOW SHOWERS',
  86: 'SNOW SHOWERS',
  95: 'THUNDERSTORM',
  96: 'TSTORM HAIL',
  99: 'TSTORM HAIL'
};

export const wmoToLabel = (code: number): string => WMO_LABELS[code] ?? 'UNKNOWN';

/** Text lines for the weather scene (each centered later by layoutText). */
export const formatWeatherLines = (weather: BoardWeather): string[] => [
  weather.label,
  '',
  `${Math.round(weather.temp)}° ${weather.condition}`,
  `HI ${Math.round(weather.high)}  LO ${Math.round(weather.low)}`,
  `WIND ${Math.round(weather.windSpeed)} ${weather.windUnit}`
];

interface OpenMeteoResponse {
  current: { temperature_2m: number; weather_code: number; wind_speed_10m: number };
  daily: { temperature_2m_max: number[]; temperature_2m_min: number[] };
}

/** Fetch current conditions + today's hi/lo for a coordinate. */
export const fetchWeather = async (
  lat: number,
  lon: number,
  label: string,
  unit: 'F' | 'C' = 'F'
): Promise<BoardWeather> => {
  const temperatureUnit = unit === 'F' ? 'fahrenheit' : 'celsius';
  const windSpeedUnit = unit === 'F' ? 'mph' : 'kmh';
  const url =
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,weather_code,wind_speed_10m` +
    `&daily=temperature_2m_max,temperature_2m_min` +
    `&temperature_unit=${temperatureUnit}&wind_speed_unit=${windSpeedUnit}&timezone=auto&forecast_days=1`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`weather ${res.status}`);
  const data = (await res.json()) as OpenMeteoResponse;

  return {
    label,
    temp: data.current.temperature_2m,
    unit,
    condition: wmoToLabel(data.current.weather_code),
    high: data.daily.temperature_2m_max[0],
    low: data.daily.temperature_2m_min[0],
    windSpeed: data.current.wind_speed_10m,
    windUnit: unit === 'F' ? 'MPH' : 'KPH'
  };
};

interface ReverseGeocodeResponse {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
}

/** Best-effort coordinate → city name (keyless BigDataCloud client endpoint). */
export const reverseGeocode = async (lat: number, lon: number): Promise<string> => {
  try {
    const res = await fetch(
      `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${lat}&longitude=${lon}&localityLanguage=en`
    );
    if (!res.ok) return 'LOCAL WEATHER';
    const data = (await res.json()) as ReverseGeocodeResponse;
    return data.city || data.locality || data.principalSubdivision || 'LOCAL WEATHER';
  } catch {
    return 'LOCAL WEATHER';
  }
};
