import { describe, expect, it } from 'vitest';

import {
  buzzBlockedReason,
  canBuzz,
  computeStandings,
  countdownSeconds,
  isDisputable,
  shadeColor
} from '@/utils/buzzed';
import type { BuzzedAttempt, BuzzedGame, BuzzedQuestion } from '@/types/buzzed';

const NOW = 100_000;

const attempt = (overrides: Partial<BuzzedAttempt> = {}): BuzzedAttempt => ({
  userId: 'alice',
  lockedAt: 1_800,
  buzzMs: 800,
  correct: true,
  resolvedAt: NOW - 1_000,
  ...overrides
});

const question = (overrides: Partial<BuzzedQuestion> = {}): BuzzedQuestion => ({
  index: 3,
  state: 'armed',
  armedAt: 1_000,
  rearmedAt: 1_000,
  lockedOutUserIds: [],
  attempts: [],
  ...overrides
});

const game = (overrides: Partial<BuzzedGame> = {}): BuzzedGame => ({
  id: 'g1',
  ownerUserId: 'host',
  participantUserIds: ['host', 'alice', 'bob'],
  joinCode: 'ABC12',
  name: 'Game',
  status: 'active',
  target: 'host',
  players: [
    { userId: 'host', displayName: 'Host' },
    { userId: 'alice', displayName: 'Alice' },
    { userId: 'bob', displayName: 'Bob' }
  ],
  scores: { host: 0, alice: 0, bob: 0 },
  settings: { wrongPenalty: 0, resumeDelayMs: 5_000, disputeWindowMs: 20_000 },
  playback: { playing: true, positionSec: 42, updatedAt: 1_000 },
  currentQuestion: question(),
  history: [],
  createdAt: 1_000,
  ...overrides
});

describe('canBuzz', () => {
  it('lets an eligible player ring in on a live question', () => {
    expect(canBuzz(game(), 'alice', NOW)).toBe(true);
  });

  it('stays dark during the resume countdown — the countdown is a real lockout', () => {
    const g = game({ currentQuestion: question({ rearmedAt: NOW + 3_000 }) });
    expect(canBuzz(g, 'alice', NOW)).toBe(false);
    expect(buzzBlockedReason(g, 'alice', NOW)).toBe('Get ready…');
  });

  it('locks out a player who already answered this question wrong', () => {
    const g = game({ currentQuestion: question({ lockedOutUserIds: ['alice'] }) });
    expect(canBuzz(g, 'alice', NOW)).toBe(false);
    expect(canBuzz(g, 'bob', NOW)).toBe(true);
    expect(buzzBlockedReason(g, 'alice', NOW)).toBe('You’re out on this one');
  });

  it('closes once someone has rung in', () => {
    const g = game({ currentQuestion: question({ state: 'locked', lockedBy: 'bob' }) });
    expect(canBuzz(g, 'alice', NOW)).toBe(false);
    expect(buzzBlockedReason(g, 'alice', NOW)).toBe('Bob rang in');
    expect(buzzBlockedReason(g, 'bob', NOW)).toBe('You rang in!');
  });

  it('is closed when the game is not running', () => {
    expect(canBuzz(game({ status: 'lobby' }), 'alice', NOW)).toBe(false);
    expect(canBuzz(game({ status: 'completed' }), 'alice', NOW)).toBe(false);
  });

  it('refuses a non-participant', () => {
    expect(canBuzz(game(), 'stranger', NOW)).toBe(false);
  });
});

describe('countdownSeconds', () => {
  it('rounds up so the last tick still reads 1', () => {
    expect(countdownSeconds(NOW + 4_200, NOW)).toBe(5);
    expect(countdownSeconds(NOW + 200, NOW)).toBe(1);
  });

  it('is 0 with no countdown or a lapsed one', () => {
    expect(countdownSeconds(undefined, NOW)).toBe(0);
    expect(countdownSeconds(NOW - 1, NOW)).toBe(0);
  });
});

describe('isDisputable', () => {
  const resolved = (overrides: Partial<BuzzedQuestion> = {}): BuzzedQuestion =>
    question({
      state: 'resolved',
      correct: true,
      resolvedBy: 'alice',
      resolvedAt: NOW - 1_000,
      attempts: [attempt()],
      ...overrides
    });

  const disputable = (overrides: Partial<BuzzedGame> = {}) =>
    game({ history: [resolved()], currentQuestion: question({ index: 4 }), ...overrides });

  it('lets another player dispute a fresh win', () => {
    expect(isDisputable(disputable(), 'bob', NOW)).toBe(true);
  });

  it('will not let the winner dispute themselves', () => {
    expect(isDisputable(disputable(), 'alice', NOW)).toBe(false);
  });

  it('closes after the dispute window', () => {
    const g = disputable({ history: [resolved({ resolvedAt: NOW - 30_000 })] });
    expect(isDisputable(g, 'bob', NOW)).toBe(false);
  });

  it('closes once someone rings in on the next question', () => {
    const g = disputable({ currentQuestion: question({ index: 4, state: 'locked', lockedBy: 'bob' }) });
    expect(isDisputable(g, 'bob', NOW)).toBe(false);
  });

  it('has nothing to dispute on a skipped question', () => {
    const g = disputable({ history: [resolved({ state: 'skipped', correct: undefined })] });
    expect(isDisputable(g, 'bob', NOW)).toBe(false);
  });
});

describe('shadeColor', () => {
  it('darkens a hex colour toward black', () => {
    expect(shadeColor('#dc2626', 0.6)).toBe('#841717');
  });

  it('expands 3-char hex', () => {
    expect(shadeColor('#fff', 0.5)).toBe('#808080');
  });

  it('clamps rather than overflowing past white', () => {
    expect(shadeColor('#ffffff', 2)).toBe('#ffffff');
  });

  it('returns garbage input untouched instead of emitting a broken colour', () => {
    expect(shadeColor('not-a-color', 0.6)).toBe('not-a-color');
  });
});

describe('computeStandings', () => {
  it('ranks by score, and counts an overturned win as a miss', () => {
    const g = game({
      scores: { host: 0, alice: 1, bob: 2 },
      history: [
        question({
          index: 0,
          state: 'resolved',
          attempts: [
            attempt({ userId: 'bob', correct: true, buzzMs: 500 }),
            attempt({ userId: 'alice', correct: true, overturned: true, buzzMs: 300 })
          ]
        })
      ],
      currentQuestion: null
    });

    const standings = computeStandings(g);

    expect(standings.map(s => s.userId)).toEqual(['bob', 'alice', 'host']);
    expect(standings[0]).toMatchObject({ userId: 'bob', score: 2, correct: 1, wrong: 0, rank: 1 });
    expect(standings[1]).toMatchObject({ userId: 'alice', score: 1, correct: 0, wrong: 1, rank: 2 });
  });

  it('counts the live question too, so the board never lags a question behind', () => {
    const g = game({
      scores: { host: 0, alice: 1, bob: 0 },
      currentQuestion: question({ attempts: [attempt({ userId: 'alice', correct: true, buzzMs: 900 })] })
    });

    expect(computeStandings(g).find(s => s.userId === 'alice')).toMatchObject({ correct: 1, avgBuzzMs: 900 });
  });

  it('breaks a score tie on correct answers, then on buzz speed', () => {
    const g = game({
      scores: { host: 1, alice: 1, bob: 1 },
      history: [
        question({
          state: 'resolved',
          attempts: [
            attempt({ userId: 'host', correct: true, buzzMs: 2_000 }),
            attempt({ userId: 'alice', correct: true, buzzMs: 400 }),
            attempt({ userId: 'bob', correct: true, buzzMs: 1_000 })
          ]
        })
      ],
      currentQuestion: null
    });

    expect(computeStandings(g).map(s => s.userId)).toEqual(['alice', 'bob', 'host']);
  });

  it('gives a genuine tie the same rank', () => {
    const g = game({ scores: { host: 0, alice: 0, bob: 0 }, currentQuestion: null });
    expect(computeStandings(g).map(s => s.rank)).toEqual([1, 1, 1]);
  });

  it('reports no buzz time for a player who never rang in', () => {
    expect(computeStandings(game()).every(s => s.avgBuzzMs === null)).toBe(true);
  });
});
