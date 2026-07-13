import type { BuzzedGame, BuzzedQuestion, BuzzedStanding } from '@/types/buzzed';

const YOUTUBE_ID = /^[\w-]{11}$/;
const YOUTUBE_HOSTS = ['youtube.com', 'www.youtube.com', 'm.youtube.com', 'music.youtube.com'];

// Accepts anything a host might realistically paste: a watch link, a youtu.be share link, an embed or
// shorts URL, a link with a timestamp or playlist hanging off it, or a bare 11-character id.
export const parseYouTubeVideoId = (input: string): string | null => {
  const trimmed = input.trim();
  if (!trimmed) return null;
  if (YOUTUBE_ID.test(trimmed)) return trimmed;

  let url: URL;
  try {
    url = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
  } catch {
    return null;
  }

  const host = url.hostname.toLowerCase();

  if (host === 'youtu.be') {
    const id = url.pathname.split('/')[1];
    return id && YOUTUBE_ID.test(id) ? id : null;
  }

  if (!YOUTUBE_HOSTS.includes(host)) return null;

  const param = url.searchParams.get('v');
  if (param && YOUTUBE_ID.test(param)) return param;

  const [, prefix, id] = url.pathname.split('/');
  if (['embed', 'shorts', 'live', 'v'].includes(prefix) && id && YOUTUBE_ID.test(id)) return id;

  return null;
};

// Fire-and-forget save of where the video actually is. Used both for the periodic heartbeat and for the
// moment the page goes away — sendBeacon survives unload, an ordinary fetch does not.
export const saveBuzzedPosition = (gameId: string, positionSec: number): void => {
  const url = `/api/buzzed/${gameId}/position`;
  const body = JSON.stringify({ positionSec });

  if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
    navigator.sendBeacon(url, new Blob([body], { type: 'application/json' }));
    return;
  }

  void fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body,
    keepalive: true
  }).catch(() => undefined);
};

export const youTubeThumbnail = (videoId: string) => `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

export const youTubeWatchUrl = (videoId: string) => `https://www.youtube.com/watch?v=${videoId}`;

export const isOnRoster = (game: BuzzedGame, userId: string): boolean =>
  game.players.some(p => p.userId === userId);

// Mirrors the server's atomic filter, so the button is never lit when the server would reject the buzz.
export const canBuzz = (game: BuzzedGame, userId: string, now: number): boolean => {
  if (game.status !== 'active') return false;
  if (!isOnRoster(game, userId)) return false;

  const question = game.currentQuestion;
  if (!question || question.state !== 'armed') return false;
  if (now < question.rearmedAt) return false;
  if (question.lockedOutUserIds.includes(userId)) return false;

  return true;
};

export const buzzBlockedReason = (game: BuzzedGame, userId: string, now: number): string | null => {
  if (canBuzz(game, userId, now)) return null;
  if (!isOnRoster(game, userId)) return 'You’re not playing';
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

export const countdownSeconds = (resumeAt: number | undefined, now: number): number => {
  if (!resumeAt || resumeAt <= now) return 0;
  return Math.ceil((resumeAt - now) / 1000);
};

export const isDisputable = (game: BuzzedGame, userId: string, now: number): boolean => {
  const last = game.history[game.history.length - 1];
  if (!last || last.state !== 'resolved' || !last.correct || !last.resolvedBy) return false;
  if (last.resolvedBy === userId) return false;
  if (now - (last.resolvedAt ?? 0) > game.settings.disputeWindowMs) return false;
  if (game.currentQuestion && game.currentQuestion.state !== 'armed') return false;

  return true;
};

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

  rows.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (b.correct !== a.correct) return b.correct - a.correct;
    if (a.avgBuzzMs === null) return b.avgBuzzMs === null ? 0 : 1;
    if (b.avgBuzzMs === null) return -1;
    return a.avgBuzzMs - b.avgBuzzMs;
  });

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

export const shadeColor = (hex: string, amount: number): string => {
  const raw = hex.replace('#', '');
  const full =
    raw.length === 3
      ? raw
          .split('')
          .map(c => c + c)
          .join('')
      : raw;

  if (full.length !== 6 || !/^[0-9a-fA-F]{6}$/.test(full)) return hex;

  const channels = [0, 2, 4].map(i => {
    const value = Math.round(parseInt(full.slice(i, i + 2), 16) * amount);
    return Math.min(255, Math.max(0, value))
      .toString(16)
      .padStart(2, '0');
  });

  return `#${channels.join('')}`;
};

export const medalForRank = (rank: number): string => (['🥇', '🥈', '🥉'][rank - 1] ?? '');
