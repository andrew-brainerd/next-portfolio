import type { PlowedScoreEntry } from '@/types/plowed';

export const LEADERBOARD_SIZE = 100;

export const qualifiesForLeaderboard = (scores: PlowedScoreEntry[], score: number) => {
  if (score <= 0) return false;
  if (scores.length < LEADERBOARD_SIZE) return true;
  return score > scores[LEADERBOARD_SIZE - 1].score;
};

export const sanitizeInitials = (raw: string) =>
  raw
    .toUpperCase()
    .replace(/[^A-Z]/g, '')
    .slice(0, 3);

export const ordinal = (n: number) => {
  const tens = n % 100;
  if (tens >= 11 && tens <= 13) return `${n}th`;
  return `${n}${['th', 'st', 'nd', 'rd'][n % 10] ?? 'th'}`;
};
