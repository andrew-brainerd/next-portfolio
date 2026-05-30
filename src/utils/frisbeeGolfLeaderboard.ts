import type { FrisbeeGolfHole, FrisbeeGolfPlayer, FrisbeeGolfRound } from '@/types/scorebook';

export interface LeaderboardEntry {
  playerId: string;
  displayName: string;
  holesPlayed: number;
  total: number;
  parThrough: number;
  overUnder: number;
}

const sumHoles = (holes: FrisbeeGolfHole[], scoresByHole: Record<number, number> | undefined) => {
  if (!scoresByHole) return { total: 0, holesPlayed: 0, parThrough: 0 };
  let total = 0;
  let holesPlayed = 0;
  let parThrough = 0;
  for (const hole of holes) {
    const score = scoresByHole[hole.number];
    if (typeof score === 'number') {
      total += score;
      parThrough += hole.par;
      holesPlayed += 1;
    }
  }
  return { total, holesPlayed, parThrough };
};

export const computeLeaderboard = (round: Pick<FrisbeeGolfRound, 'holes' | 'players' | 'scores'>): LeaderboardEntry[] => {
  const entries: LeaderboardEntry[] = round.players.map((player: FrisbeeGolfPlayer) => {
    const { total, holesPlayed, parThrough } = sumHoles(round.holes, round.scores[player.id]);
    return {
      playerId: player.id,
      displayName: player.displayName,
      holesPlayed,
      total,
      parThrough,
      overUnder: total - parThrough
    };
  });

  return entries.sort((a, b) => {
    if (a.holesPlayed === 0 && b.holesPlayed === 0) return 0;
    if (a.holesPlayed === 0) return 1;
    if (b.holesPlayed === 0) return -1;
    if (a.overUnder !== b.overUnder) return a.overUnder - b.overUnder;
    return a.total - b.total;
  });
};

export const formatOverUnder = (value: number): string => {
  if (value === 0) return 'E';
  return value > 0 ? `+${value}` : `${value}`;
};
