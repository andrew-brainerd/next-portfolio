import type { Scoreboard, Slot } from '@/types/rollWithMe';

export const SLOTS: readonly Slot[] = [
  'ones',
  'twos',
  'threes',
  'fours',
  'fives',
  'sixes',
  'kind3',
  'kind4',
  'fullHouse',
  'smStraight',
  'lgStraight',
  'kind5',
  'chance'
];

export const NUMBER_SLOTS: readonly Slot[] = ['ones', 'twos', 'threes', 'fours', 'fives', 'sixes'];
export const SPECIAL_SLOTS: readonly Slot[] = [
  'kind3',
  'kind4',
  'fullHouse',
  'smStraight',
  'lgStraight',
  'kind5',
  'chance'
];

export type DiceRoll = [number, number, number, number, number];

export const emptyScoreboard = (): Scoreboard =>
  SLOTS.reduce((acc, slot) => ({ ...acc, [slot]: -1 }), {} as Scoreboard);

const rollDie = (): number => Math.floor(Math.random() * 6) + 1;

export const rollDice = (previousRoll: readonly number[] = [0, 0, 0, 0, 0], lockedDice: readonly number[] = []): DiceRoll => {
  const next: number[] = [];
  for (let i = 0; i < 5; i++) {
    next.push(lockedDice.includes(i) ? previousRoll[i] : rollDie());
  }
  return next as unknown as DiceRoll;
};

const countOccurrences = (roll: readonly number[], face: number): number =>
  roll.reduce((n, die) => (die === face ? n + 1 : n), 0);

const sumDice = (roll: readonly number[]): number => roll.reduce((sum, die) => sum + die, 0);

const calculateNumScore = (roll: readonly number[], face: number): number =>
  roll.reduce((sum, die) => (die === face ? sum + face : sum), 0);

const calculateKindScore = (roll: readonly number[], kindNum: number): number => {
  const uniqueFaces = Array.from(new Set(roll));
  const meets = uniqueFaces.some(face => countOccurrences(roll, face) >= kindNum);
  if (!meets) return 0;
  return kindNum < 5 ? sumDice(roll) : 50;
};

const calculateFullHouseScore = (roll: readonly number[]): number => {
  const uniqueFaces = Array.from(new Set(roll));
  if (uniqueFaces.length !== 2) return 0;
  const [a, b] = uniqueFaces;
  const aCount = countOccurrences(roll, a);
  const bCount = countOccurrences(roll, b);
  return aCount === 3 || bCount === 3 ? 25 : 0;
};

const containsSequence = (sortedUnique: readonly number[], sequence: readonly number[]): boolean =>
  sequence.every(face => sortedUnique.includes(face));

export const calculateSmallStraightScore = (roll: readonly number[]): number => {
  const sortedUnique = Array.from(new Set(roll)).sort((a, b) => a - b);
  const candidates = [
    [1, 2, 3, 4],
    [2, 3, 4, 5],
    [3, 4, 5, 6]
  ];
  return candidates.some(seq => containsSequence(sortedUnique, seq)) ? 30 : 0;
};

export const calculateLargeStraightScore = (roll: readonly number[]): number => {
  const sortedUnique = Array.from(new Set(roll)).sort((a, b) => a - b);
  if (sortedUnique.length !== 5) return 0;
  const candidates = [
    [1, 2, 3, 4, 5],
    [2, 3, 4, 5, 6]
  ];
  return candidates.some(seq => seq.every((face, i) => sortedUnique[i] === face)) ? 40 : 0;
};

export const calculateScores = (roll: readonly number[]): Scoreboard => ({
  ones: calculateNumScore(roll, 1),
  twos: calculateNumScore(roll, 2),
  threes: calculateNumScore(roll, 3),
  fours: calculateNumScore(roll, 4),
  fives: calculateNumScore(roll, 5),
  sixes: calculateNumScore(roll, 6),
  kind3: calculateKindScore(roll, 3),
  kind4: calculateKindScore(roll, 4),
  fullHouse: calculateFullHouseScore(roll),
  smStraight: calculateSmallStraightScore(roll),
  lgStraight: calculateLargeStraightScore(roll),
  kind5: calculateKindScore(roll, 5),
  chance: sumDice(roll)
});

const positiveOrZero = (n: number): number => (n < 0 ? 0 : n);

export const getNumberTotal = (scores: Scoreboard): number =>
  NUMBER_SLOTS.reduce((sum, slot) => sum + positiveOrZero(scores[slot] ?? -1), 0);

export const getLeftTotal = (scores: Scoreboard): number => {
  const numbersTotal = getNumberTotal(scores);
  return numbersTotal >= 63 ? numbersTotal + 35 : numbersTotal;
};

export const getSpecialTotal = (scores: Scoreboard): number =>
  SPECIAL_SLOTS.reduce((sum, slot) => sum + positiveOrZero(scores[slot] ?? -1), 0);

export const getTotal = (scores: Scoreboard): number => getLeftTotal(scores) + getSpecialTotal(scores);

export const isScoreboardComplete = (scores: Scoreboard): boolean =>
  SLOTS.every(slot => (scores[slot] ?? -1) >= 0);
