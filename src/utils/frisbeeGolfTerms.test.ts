import { describe, expect, it } from 'vitest';

import { golfTermForScore } from '@/utils/frisbeeGolfTerms';

describe('golfTermForScore', () => {
  it('treats a 1 on a par-3+ hole as a hole in one', () => {
    expect(golfTermForScore(1, 3).term).toBe('Hole in one!');
    expect(golfTermForScore(1, 4).term).toBe('Hole in one!');
  });

  it('a 1 on a par-1 hole is just par, not an ace', () => {
    expect(golfTermForScore(1, 1).term).toBe('Par');
  });

  it('names scores relative to par', () => {
    expect(golfTermForScore(1, 3).term).toBe('Hole in one!');
    expect(golfTermForScore(2, 4).term).toBe('Eagle');
    expect(golfTermForScore(2, 3).term).toBe('Birdie');
    expect(golfTermForScore(3, 3).term).toBe('Par');
    expect(golfTermForScore(4, 3).term).toBe('Bogey');
    expect(golfTermForScore(5, 3).term).toBe('Double bogey');
    expect(golfTermForScore(6, 3).term).toBe('Triple bogey');
  });

  it('falls back to a +N label for big numbers', () => {
    expect(golfTermForScore(8, 3).term).toBe('+5');
  });

  it('uses albatross for 3-or-more under par', () => {
    expect(golfTermForScore(2, 5).term).toBe('Albatross');
  });
});
