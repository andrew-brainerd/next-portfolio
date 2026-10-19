import { describe, expect, it } from 'vitest';

import type { PlowedScoreEntry } from '@/types/plowed';
import { LEADERBOARD_SIZE, ordinal, qualifiesForLeaderboard, sanitizeInitials } from './plowedLeaderboard';

const board = (count: number, lowest: number): PlowedScoreEntry[] =>
  Array.from({ length: count }, (_, i) => ({
    initials: 'AAA',
    score: lowest + (count - 1 - i) * 10,
    level: 1,
    createdAt: '2026-10-18T00:00:00.000Z'
  }));

describe('qualifiesForLeaderboard', () => {
  it('takes any positive score while the board has room', () => {
    expect(qualifiesForLeaderboard(board(3, 1000), 10)).toBe(true);
    expect(qualifiesForLeaderboard([], 0)).toBe(false);
  });

  it('needs to beat the last place once the board is full', () => {
    const full = board(LEADERBOARD_SIZE, 500);
    expect(qualifiesForLeaderboard(full, 500)).toBe(false);
    expect(qualifiesForLeaderboard(full, 501)).toBe(true);
  });
});

describe('sanitizeInitials', () => {
  it('keeps up to three uppercase letters', () => {
    expect(sanitizeInitials('ab1c-d')).toBe('ABC');
    expect(sanitizeInitials('z')).toBe('Z');
  });
});

describe('ordinal', () => {
  it('formats ranks', () => {
    expect([1, 2, 3, 4, 11, 12, 13, 21, 22, 101, 111].map(ordinal)).toEqual([
      '1st',
      '2nd',
      '3rd',
      '4th',
      '11th',
      '12th',
      '13th',
      '21st',
      '22nd',
      '101st',
      '111th'
    ]);
  });
});
