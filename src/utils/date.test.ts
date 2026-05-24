import { describe, it, expect } from 'vitest';
import { getDateTime } from './date';

describe('getDateTime', () => {
  it('formats a unix timestamp (seconds since epoch) as M/DD/YYYY h:mm A', () => {
    // 2024-01-02 03:04:05 UTC = 1704164645s; formatted in local time.
    // Assert on shape rather than exact local time to avoid TZ flakiness.
    const result = getDateTime(1704164645);
    expect(result).toMatch(/^\d{1,2}\/\d{2}\/\d{4} \d{1,2}:\d{2} (AM|PM)$/);
  });

  it('formats an ISO date string as M/DD/YYYY h:mm A', () => {
    const result = getDateTime('2026-05-18T14:30:00Z');
    expect(result).toMatch(/^\d{1,2}\/\d{2}\/\d{4} \d{1,2}:\d{2} (AM|PM)$/);
  });

  it('treats numeric input as seconds, not milliseconds', () => {
    const asSeconds = getDateTime(1704067200);
    const asMillis = getDateTime('2024-01-01T00:00:00Z');
    expect(asSeconds).toBe(asMillis);
  });
});
