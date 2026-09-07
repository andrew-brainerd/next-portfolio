import { describe, expect, it } from 'vitest';

import {
  formatDuration,
  formatHour,
  formatMonth,
  formatRatio,
  heatmapGrid,
  heatStep,
  niceAxis,
  seriesMax,
  shareOf
} from '@/utils/messageStats';

describe('formatDuration', () => {
  it('renders sub-minute values in seconds', () => {
    expect(formatDuration(28)).toBe('28 sec');
    expect(formatDuration(59)).toBe('59 sec');
  });

  it('renders single-decimal minutes below ten minutes', () => {
    expect(formatDuration(90)).toBe('1.5 min');
  });

  it('drops the decimal past ten minutes', () => {
    expect(formatDuration(1200)).toBe('20 min');
  });

  it('switches to hours at an hour', () => {
    expect(formatDuration(3600)).toBe('1.0 hr');
    expect(formatDuration(9000)).toBe('2.5 hr');
  });
});

describe('shareOf', () => {
  it('computes a whole-percent share', () => {
    expect(shareOf(35769, 36570)).toBe(49);
    expect(shareOf(36570, 35769)).toBe(51);
  });

  it('returns zero rather than dividing by zero', () => {
    expect(shareOf(0, 0)).toBe(0);
  });
});

describe('niceAxis', () => {
  it('rounds the maximum up to a round step', () => {
    expect(niceAxis(3580)).toEqual({ step: 1000, max: 4000 });
  });

  it('handles small ranges', () => {
    expect(niceAxis(45)).toEqual({ step: 20, max: 60 });
  });

  it('guards against a non-positive maximum', () => {
    expect(niceAxis(0)).toEqual({ step: 1, max: 1 });
    expect(niceAxis(Number.NaN)).toEqual({ step: 1, max: 1 });
  });

  it('always produces a maximum at or above the data', () => {
    [7, 123, 999, 1001, 24680].forEach(value => {
      expect(niceAxis(value).max).toBeGreaterThanOrEqual(value);
    });
  });
});

describe('heatStep', () => {
  it('returns -1 for empty cells so they render as the surface', () => {
    expect(heatStep(0, 500, 7)).toBe(-1);
  });

  it('puts the maximum in the darkest bucket', () => {
    expect(heatStep(500, 500, 7)).toBe(6);
  });

  it('never exceeds the last bucket', () => {
    expect(heatStep(600, 500, 7)).toBe(6);
  });

  it('lifts small values off the floor via the square root', () => {
    expect(heatStep(20, 500, 7)).toBeGreaterThan(0);
  });
});

describe('formatMonth', () => {
  it('shortens an ISO month', () => {
    expect(formatMonth('2025-03')).toBe('Mar 25');
    expect(formatMonth('2026-12')).toBe('Dec 26');
  });

  it('passes through an unparseable value', () => {
    expect(formatMonth('nonsense')).toBe('nonsense');
  });
});

describe('formatRatio', () => {
  it('shows one decimal below ten', () => {
    expect(formatRatio(4.25)).toBe('4.3×');
  });

  it('drops the decimal between ten and a hundred', () => {
    expect(formatRatio(76.3)).toBe('76×');
  });

  it('rounds large multiples to the nearest ten', () => {
    expect(formatRatio(272.26)).toBe('270×');
  });

  it('handles a missing ratio', () => {
    expect(formatRatio(0)).toBe('—');
    expect(formatRatio(Number.POSITIVE_INFINITY)).toBe('—');
  });
});

describe('seriesMax', () => {
  it('takes the largest value across both series', () => {
    expect(seriesMax([{ month: '2025-01', me: 10, her: 40 }, { month: '2025-02', me: 55, her: 20 }])).toBe(55);
  });

  it('returns zero for no points', () => {
    expect(seriesMax([])).toBe(0);
  });
});

describe('heatmapGrid', () => {
  it('places cells at [weekday][hour]', () => {
    const grid = heatmapGrid([
      { weekday: 0, hour: 0, count: 5 },
      { weekday: 6, hour: 23, count: 9 }
    ]);
    expect(grid[0][0]).toBe(5);
    expect(grid[6][23]).toBe(9);
  });

  it('defaults every unlisted cell to zero', () => {
    const grid = heatmapGrid([]);
    expect(grid).toHaveLength(7);
    expect(grid[3]).toHaveLength(24);
    expect(grid[3][12]).toBe(0);
  });

  it('ignores out-of-range cells', () => {
    expect(() => heatmapGrid([{ weekday: 9, hour: 99, count: 1 }])).not.toThrow();
  });
});

describe('formatHour', () => {
  it('renders 12-hour labels', () => {
    expect(formatHour(0)).toBe('12am');
    expect(formatHour(9)).toBe('9am');
    expect(formatHour(12)).toBe('12pm');
    expect(formatHour(23)).toBe('11pm');
  });
});
