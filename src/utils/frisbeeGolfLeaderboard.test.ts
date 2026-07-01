import { describe, expect, it } from 'vitest';

import type { FrisbeeGolfRound } from '@/types/scorebook';
import { computeLeaderboard, formatOverUnder, medalForRank } from '@/utils/frisbeeGolfLeaderboard';

const buildRound = (overrides: Partial<FrisbeeGolfRound> = {}): FrisbeeGolfRound => ({
  id: 'r1',
  ownerUserId: 'owner',
  participantUserIds: ['owner'],
  joinCode: 'ABC12',
  name: 'Test',
  status: 'active',
  holes: [
    { number: 1, par: 3 },
    { number: 2, par: 4 },
    { number: 3, par: 3 }
  ],
  players: [
    { id: 'p1', kind: 'user', userId: 'owner', displayName: 'Alice' },
    { id: 'p2', kind: 'guest', displayName: 'Bob' }
  ],
  scores: {},
  createdAt: 0,
  ...overrides
});

describe('medalForRank', () => {
  it('awards medals to the top three only', () => {
    expect(medalForRank(0)).toBe('🥇');
    expect(medalForRank(1)).toBe('🥈');
    expect(medalForRank(2)).toBe('🥉');
    expect(medalForRank(3)).toBeNull();
  });
});

describe('computeLeaderboard', () => {
  it('returns zeroed entries when no scores recorded', () => {
    const board = computeLeaderboard(buildRound());
    expect(board).toHaveLength(2);
    expect(board.every(e => e.total === 0 && e.holesPlayed === 0 && e.overUnder === 0)).toBe(true);
  });

  it('sorts by over/under par ascending, then by total', () => {
    const round = buildRound({
      scores: {
        p1: { 1: 3, 2: 4, 3: 3 },
        p2: { 1: 4, 2: 4, 3: 3 }
      }
    });
    const board = computeLeaderboard(round);
    expect(board[0].displayName).toBe('Alice');
    expect(board[0].overUnder).toBe(0);
    expect(board[0].total).toBe(10);
    expect(board[1].displayName).toBe('Bob');
    expect(board[1].overUnder).toBe(1);
  });

  it('sorts players with zero holes played to the bottom', () => {
    const round = buildRound({
      scores: { p2: { 1: 4, 2: 5, 3: 4 } }
    });
    const board = computeLeaderboard(round);
    expect(board[0].displayName).toBe('Bob');
    expect(board[1].displayName).toBe('Alice');
    expect(board[1].holesPlayed).toBe(0);
  });

  it('carries userId, color, and photoURL through to entries', () => {
    const round = buildRound({
      players: [
        { id: 'p1', kind: 'user', userId: 'u1', displayName: 'Alice', color: '#fff', photoURL: 'http://x/a.jpg' },
        { id: 'p2', kind: 'guest', displayName: 'Bob', color: '#000' }
      ]
    });
    const board = computeLeaderboard(round);
    const alice = board.find(e => e.playerId === 'p1')!;
    expect(alice.userId).toBe('u1');
    expect(alice.color).toBe('#fff');
    expect(alice.photoURL).toBe('http://x/a.jpg');
    const bob = board.find(e => e.playerId === 'p2')!;
    expect(bob.userId).toBeUndefined();
    expect(bob.photoURL).toBeUndefined();
  });

  it('computes parThrough for partial rounds (over/under reflects holes played only)', () => {
    const round = buildRound({
      scores: { p1: { 1: 4 } }
    });
    const board = computeLeaderboard(round);
    const alice = board.find(e => e.displayName === 'Alice')!;
    expect(alice.holesPlayed).toBe(1);
    expect(alice.total).toBe(4);
    expect(alice.parThrough).toBe(3);
    expect(alice.overUnder).toBe(1);
  });
});

describe('formatOverUnder', () => {
  it('returns "E" for even par', () => {
    expect(formatOverUnder(0)).toBe('E');
  });
  it('prefixes positive scores with "+"', () => {
    expect(formatOverUnder(3)).toBe('+3');
  });
  it('keeps negative sign for under par', () => {
    expect(formatOverUnder(-2)).toBe('-2');
  });
});
