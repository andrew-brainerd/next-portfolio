export type SceneKind = 'clock' | 'weather' | 'calendar' | 'note';

export interface BoardGrid {
  rows: number;
  cols: number;
}

export type WeatherStatus = 'loading' | 'ready' | 'unavailable';

export interface BoardWeather {
  label: string; // city / location name
  temp: number; // current temperature, in `unit`
  unit: 'F' | 'C';
  condition: string; // short label, e.g. PARTLY CLOUDY
  high: number;
  low: number;
  windSpeed: number;
  windUnit: 'MPH' | 'KPH';
}

// --- Persisted board data (brainerd-api /board, stored in Firestore) ---

export interface BoardWeatherLocation {
  lat: number;
  lon: number;
  label: string;
  unit?: 'F' | 'C';
}

export interface BoardSettings {
  weather?: BoardWeatherLocation | null;
  grid?: BoardGrid;
}

export interface BoardNote {
  id: string;
  text: string;
  color: string | null; // Vestaboard color-chip name, or null
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface BoardNoteInput {
  text: string;
  color?: string | null;
  enabled?: boolean;
}

/** Live data handed to every scene's render fn. */
export interface SceneContext {
  now: Date;
  weather: BoardWeather | null;
  weatherStatus: WeatherStatus;
}

/**
 * A rotation scene. `render` composes a rows×cols grid of flap codes from the
 * current context — pure so it's easy to test and swap data sources.
 */
export interface BoardScene {
  id: string;
  kind: SceneKind;
  dwellMs: number;
  render: (ctx: SceneContext, rows: number, cols: number) => number[][];
}
