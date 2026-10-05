import { describe, it, expect } from 'vitest';
import { addonMonogram, formatDownloads } from './addons';

describe('formatDownloads', () => {
  it('uses the singular for one download', () => {
    expect(formatDownloads(1)).toBe('1 download');
  });

  it('keeps small counts exact', () => {
    expect(formatDownloads(7)).toBe('7 downloads');
  });

  it('compacts thousands', () => {
    expect(formatDownloads(5811)).toBe('5.8K downloads');
  });

  it('treats bad input as zero', () => {
    expect(formatDownloads(Number.NaN)).toBe('0 downloads');
    expect(formatDownloads(-3)).toBe('0 downloads');
  });
});

describe('addonMonogram', () => {
  it('takes the first letters of the first two words', () => {
    expect(addonMonogram('Charter Forever')).toBe('CF');
    expect(addonMonogram('lay of the land')).toBe('LO');
  });

  it('handles a single word and extra spaces', () => {
    expect(addonMonogram('  hush ')).toBe('H');
  });
});
