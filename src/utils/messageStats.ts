import type { HeatmapCell, MonthPoint } from '@/types/us';

/** Human-readable reply latency: seconds under a minute, then minutes, then hours. */
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) return `${Math.round(seconds)} sec`;
  if (seconds < 3600) return `${(seconds / 60).toFixed(seconds < 600 ? 1 : 0)} min`;
  return `${(seconds / 3600).toFixed(1)} hr`;
};

/** Whole-percent share of `value` within `value + other`. */
export const shareOf = (value: number, other: number): number => {
  const total = value + other;
  return total === 0 ? 0 : Math.round((value / total) * 100);
};

/**
 * Axis ticks land on 1/2/5×10ⁿ so the labels read as round numbers rather than
 * arbitrary fractions of the data maximum.
 */
export const niceAxis = (rawMax: number, tickCount = 4): { step: number; max: number } => {
  if (rawMax <= 0 || !Number.isFinite(rawMax)) return { step: 1, max: 1 };
  const magnitude = Math.pow(10, Math.floor(Math.log10(rawMax / tickCount)));
  const normalized = rawMax / tickCount / magnitude;
  const step = (normalized <= 1 ? 1 : normalized <= 2 ? 2 : normalized <= 5 ? 5 : 10) * magnitude;
  return { step, max: Math.ceil(rawMax / step) * step };
};

/**
 * Heatmap bucket index for a cell. Square-rooted so the busy middle of the day
 * doesn't flatten every quieter hour into the lightest step.
 */
export const heatStep = (count: number, max: number, steps: number): number => {
  if (count === 0 || max <= 0) return -1;
  return Math.min(steps - 1, Math.floor(Math.sqrt(count / max) * steps));
};

/** "2025-03" → "Mar 25", for compact month axes. */
export const formatMonth = (month: string): string => {
  const [year, monthNumber] = month.split('-');
  const date = new Date(Number(year), Number(monthNumber) - 1, 1);
  if (Number.isNaN(date.getTime())) return month;
  return date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
};

/** Reads an "N×" rate difference; large multiples round to the nearest ten. */
export const formatRatio = (ratio: number): string => {
  if (!Number.isFinite(ratio) || ratio <= 0) return '—';
  if (ratio >= 100) return `${Math.round(ratio / 10) * 10}×`;
  return `${ratio.toFixed(ratio < 10 ? 1 : 0)}×`;
};

/** Largest single value across both series, used to scale grouped bars. */
export const seriesMax = (points: MonthPoint[]): number =>
  points.reduce((max, point) => Math.max(max, point.me, point.her), 0);

/** Collapses the flat cell list into [weekday][hour] for grid rendering. */
export const heatmapGrid = (cells: HeatmapCell[]): number[][] => {
  const grid: number[][] = Array.from({ length: 7 }, () => Array.from({ length: 24 }, () => 0));
  cells.forEach(({ weekday, hour, count }) => {
    if (grid[weekday] !== undefined && grid[weekday][hour] !== undefined) {
      grid[weekday][hour] = count;
    }
  });
  return grid;
};

/** "3pm", "12am" — hour labels for the heatmap and peak-hours chart. */
export const formatHour = (hour: number): string => `${hour % 12 || 12}${hour < 12 ? 'am' : 'pm'}`;
