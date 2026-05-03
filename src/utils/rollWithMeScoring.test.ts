import { describe, it, expect, vi, afterEach } from 'vitest';
import {
  SLOTS,
  emptyScoreboard,
  rollDice,
  calculateScores,
  calculateSmallStraightScore,
  calculateLargeStraightScore,
  getNumberTotal,
  getLeftTotal,
  getSpecialTotal,
  getTotal,
  isScoreboardComplete
} from './rollWithMeScoring';
import type { Scoreboard } from '@/types/rollWithMe';

const buildScoreboard = (overrides: Partial<Scoreboard> = {}): Scoreboard => ({
  ...emptyScoreboard(),
  ...overrides
});

describe('emptyScoreboard', () => {
  it('seeds every slot to -1', () => {
    const sb = emptyScoreboard();
    for (const slot of SLOTS) expect(sb[slot]).toBe(-1);
  });
});

describe('rollDice', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('rolls 5 dice each in 1..6 inclusive', () => {
    const sequence = [0.0, 0.2, 0.4, 0.6, 0.99];
    let i = 0;
    vi.spyOn(Math, 'random').mockImplementation(() => sequence[i++]);
    const roll = rollDice();
    expect(roll).toEqual([1, 2, 3, 4, 6]);
  });

  it('preserves locked dice from the previous roll', () => {
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // → 6 every roll
    const previous: [number, number, number, number, number] = [1, 2, 3, 4, 5];
    const next = rollDice(previous, [0, 2]);
    expect(next[0]).toBe(1);
    expect(next[2]).toBe(3);
    expect(next[1]).toBe(6);
    expect(next[3]).toBe(6);
    expect(next[4]).toBe(6);
  });
});

describe('calculateScores — number slots', () => {
  it('sums dice matching the slot face', () => {
    const scores = calculateScores([1, 1, 3, 4, 5]);
    expect(scores.ones).toBe(2);
    expect(scores.threes).toBe(3);
    expect(scores.fives).toBe(5);
    expect(scores.twos).toBe(0);
  });
});

describe('calculateScores — kinds', () => {
  it('3 of a kind = sum of all dice when at least 3 of any face', () => {
    const scores = calculateScores([4, 4, 4, 2, 1]);
    expect(scores.kind3).toBe(15);
    expect(scores.kind4).toBe(0);
  });

  it('4 of a kind = sum of all dice when at least 4 of any face', () => {
    const scores = calculateScores([5, 5, 5, 5, 1]);
    expect(scores.kind4).toBe(21);
    expect(scores.kind3).toBe(21);
    expect(scores.kind5).toBe(0);
  });

  it('Yahtzee (kind5) = flat 50 when all dice match', () => {
    const scores = calculateScores([6, 6, 6, 6, 6]);
    expect(scores.kind5).toBe(50);
    expect(scores.kind4).toBe(30);
    expect(scores.kind3).toBe(30);
  });
});

describe('calculateScores — full house', () => {
  it('25 for a true full house', () => {
    const scores = calculateScores([2, 2, 5, 5, 5]);
    expect(scores.fullHouse).toBe(25);
  });

  it('0 when not exactly two distinct faces', () => {
    const scores = calculateScores([2, 2, 5, 5, 6]);
    expect(scores.fullHouse).toBe(0);
  });

  it('0 for kind5 (must be 3-of and 2-of)', () => {
    const scores = calculateScores([4, 4, 4, 4, 4]);
    expect(scores.fullHouse).toBe(0);
  });
});

describe('calculateSmallStraightScore', () => {
  it('30 for any 4 consecutive faces present', () => {
    expect(calculateSmallStraightScore([1, 2, 3, 4, 6])).toBe(30);
    expect(calculateSmallStraightScore([2, 3, 4, 5, 5])).toBe(30);
    expect(calculateSmallStraightScore([3, 4, 5, 6, 1])).toBe(30);
  });

  it('0 when no 4-run present', () => {
    expect(calculateSmallStraightScore([1, 2, 3, 5, 6])).toBe(0);
    expect(calculateSmallStraightScore([1, 1, 1, 1, 1])).toBe(0);
  });
});

describe('calculateLargeStraightScore', () => {
  it('40 for 1..5 or 2..6', () => {
    expect(calculateLargeStraightScore([1, 2, 3, 4, 5])).toBe(40);
    expect(calculateLargeStraightScore([6, 5, 4, 3, 2])).toBe(40);
  });

  it('0 for any non-large-straight', () => {
    expect(calculateLargeStraightScore([1, 2, 3, 4, 6])).toBe(0);
    expect(calculateLargeStraightScore([1, 1, 2, 3, 4])).toBe(0);
  });
});

describe('chance', () => {
  it('always sums all dice', () => {
    expect(calculateScores([1, 2, 3, 4, 5]).chance).toBe(15);
    expect(calculateScores([6, 6, 6, 6, 6]).chance).toBe(30);
  });
});

describe('totals', () => {
  it('upper section bonus kicks in at 63', () => {
    const justUnder = buildScoreboard({
      ones: 3, twos: 6, threes: 9, fours: 12, fives: 15, sixes: 17
    });
    expect(getNumberTotal(justUnder)).toBe(62);
    expect(getLeftTotal(justUnder)).toBe(62);

    const atThreshold = buildScoreboard({
      ones: 3, twos: 6, threes: 9, fours: 12, fives: 15, sixes: 18
    });
    expect(getNumberTotal(atThreshold)).toBe(63);
    expect(getLeftTotal(atThreshold)).toBe(98);
  });

  it('treats unplayed slots (-1) as zero in totals', () => {
    const partial = buildScoreboard({ ones: 3 });
    expect(getNumberTotal(partial)).toBe(3);
    expect(getSpecialTotal(partial)).toBe(0);
    expect(getTotal(partial)).toBe(3);
  });

  it('total = left + special', () => {
    const sb = buildScoreboard({
      ones: 1, twos: 2, threes: 3, fours: 4, fives: 5, sixes: 6,
      kind3: 10, kind4: 15, fullHouse: 25, smStraight: 30, lgStraight: 40, kind5: 50, chance: 20
    });
    expect(getTotal(sb)).toBe(getLeftTotal(sb) + getSpecialTotal(sb));
    expect(getTotal(sb)).toBe(21 + 190);
  });
});

describe('isScoreboardComplete', () => {
  it('false when any slot is -1', () => {
    expect(isScoreboardComplete(emptyScoreboard())).toBe(false);
    const partial = buildScoreboard({ ones: 0 });
    expect(isScoreboardComplete(partial)).toBe(false);
  });

  it('true when every slot is >= 0', () => {
    const full = SLOTS.reduce((acc, s) => ({ ...acc, [s]: 0 }), {} as Scoreboard);
    expect(isScoreboardComplete(full)).toBe(true);
  });
});
