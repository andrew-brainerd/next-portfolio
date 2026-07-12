import type { BuzzedGame, BuzzedQuestion, BuzzedStanding } from '@/types/buzzed';

// Deliberately mirrors the server's atomic filter in services/buzzed.ts. The server is still the only
// authority — this just stops us lighting up a buzzer the server would reject anyway.
export const canBuzz = (game: BuzzedGame, userId: string, now: number): boolean => {
  if (game.status !== 'active') return false;
  if (!game.participantUserIds.includes(userId)) return false;

  const question = game.currentQuestion;
  if (!question || question.state !== 'armed') return false;
  // The resume countdown is a real lockout, not a cosmetic one.
  if (now < question.rearmedAt) return false;
  if (question.lockedOutUserIds.includes(userId)) return false;

  return true;
};

// Why the buzzer is dark, in the order the player would care about.
export const buzzBlockedReason = (game: BuzzedGame, userId: string, now: number): string | null => {
  if (canBuzz(game, userId, now)) return null;
  if (game.status !== 'active') return 'The game isn’t running';

  const question = game.currentQuestion;
  if (!question) return 'No question in play';
  if (question.state === 'locked') {
    const who = game.players.find(p => p.userId === question.lockedBy);
    return question.lockedBy === userId ? 'You rang in!' : `${who?.displayName ?? 'Someone'} rang in`;
  }
  if (now < question.rearmedAt) return 'Get ready…';
  if (question.lockedOutUserIds.includes(userId)) return 'You’re out on this one';

  return 'Not your turn';
};

// Whole seconds left on the resume countdown; 0 when there isn't one.
export const countdownSeconds = (resumeAt: number | undefined, now: number): number => {
  if (!resumeAt || resumeAt <= now) return 0;
  return Math.ceil((resumeAt - now) / 1000);
};

// BZ-12 — mirrors the server's overturn guards. You can't dispute your own claim, a skipped question,
// a stale one, or anything once the next window has been rung in on.
export const isDisputable = (game: BuzzedGame, userId: string, now: number): boolean => {
  const last = game.history[game.history.length - 1];
  if (!last || last.state !== 'resolved' || !last.correct || !last.resolvedBy) return false;
  if (last.resolvedBy === userId) return false;
  if (now - (last.resolvedAt ?? 0) > game.settings.disputeWindowMs) return false;
  if (game.currentQuestion && game.currentQuestion.state !== 'armed') return false;

  return true;
};

// Every ring-in across the game — the live question included, so the scoreboard doesn't lag a question
// behind. An overturned "correct" counts as a miss, which is the whole point of the dispute.
const allAttempts = (game: BuzzedGame) => {
  const questions: BuzzedQuestion[] = [...game.history];
  if (game.currentQuestion) questions.push(game.currentQuestion);
  return questions.flatMap(q => q.attempts ?? []);
};

export const computeStandings = (game: BuzzedGame): BuzzedStanding[] => {
  const attempts = allAttempts(game);

  const rows = game.players.map(player => {
    const mine = attempts.filter(a => a.userId === player.userId);
    const hits = mine.filter(a => a.correct && !a.overturned);
    const misses = mine.filter(a => !a.correct || a.overturned);
    const buzzTimes = mine.map(a => a.buzzMs);

    return {
      userId: player.userId,
      displayName: player.displayName,
      photoURL: player.photoURL,
      color: player.color,
      score: game.scores[player.userId] ?? 0,
      correct: hits.length,
      wrong: misses.length,
      avgBuzzMs: buzzTimes.length
        ? Math.round(buzzTimes.reduce((sum, ms) => sum + ms, 0) / buzzTimes.length)
        : null,
      rank: 0
    };
  });

  // Score, then who actually got more right, then who was faster on the buzzer.
  rows.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.correct !== a.correct) return b.correct - a.correct;
    if (a.avgBuzzMs === null) return b.avgBuzzMs === null ? 0 : 1;
    if (b.avgBuzzMs === null) return -1;
    return a.avgBuzzMs - b.avgBuzzMs;
  });

  // Genuine ties share a rank.
  let rank = 0;
  let lastKey = '';
  rows.forEach((row, i) => {
    const key = `${row.score}|${row.correct}|${row.avgBuzzMs}`;
    if (key !== lastKey) {
      rank = i + 1;
      lastKey = key;
    }
    row.rank = rank;
  });

  return rows;
};

export const formatBuzzMs = (ms: number | null): string => (ms === null ? '—' : `${(ms / 1000).toFixed(2)}s`);

export const medalForRank = (rank: number): string => (['🥇', '🥈', '🥉'][rank - 1] ?? '');
