import { describe, expect, it } from 'vitest';

import type { BoardWeather } from '@/types/board';
import { formatWeatherLines, wmoToLabel } from './weather';

describe('weather', () => {
  it('maps known WMO codes and falls back for unknown', () => {
    expect(wmoToLabel(0)).toBe('CLEAR');
    expect(wmoToLabel(2)).toBe('PARTLY CLOUDY');
    expect(wmoToLabel(95)).toBe('THUNDERSTORM');
    expect(wmoToLabel(1234)).toBe('UNKNOWN');
  });

  it('formats weather lines with rounded values', () => {
    const weather: BoardWeather = {
      label: 'DETROIT',
      temp: 57.6,
      unit: 'F',
      condition: 'PARTLY CLOUDY',
      high: 62.1,
      low: 50.9,
      windSpeed: 8.4,
      windUnit: 'MPH'
    };
    expect(formatWeatherLines(weather)).toEqual([
      'DETROIT',
      '',
      '58° PARTLY CLOUDY',
      'HI 62  LO 51',
      'WIND 8 MPH'
    ]);
  });
});
