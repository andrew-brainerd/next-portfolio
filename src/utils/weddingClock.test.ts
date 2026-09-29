import { describe, expect, it } from 'vitest';

import { parseMockOffset } from './weddingClock';

describe('parseMockOffset', () => {
  it('reads a positive offset in ms', () => {
    expect(parseMockOffset('86400000')).toBe(86_400_000);
  });

  it('falls back to 0 when absent or invalid', () => {
    expect(parseMockOffset(undefined)).toBe(0);
    expect(parseMockOffset('')).toBe(0);
    expect(parseMockOffset('-5000')).toBe(0);
    expect(parseMockOffset('1.5')).toBe(0);
    expect(parseMockOffset('soon')).toBe(0);
    expect(parseMockOffset('99999999999999999999')).toBe(0);
  });
});
