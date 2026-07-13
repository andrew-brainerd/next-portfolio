import { BUZZED_POINTS_BY_RANK } from '@/constants/buzzed';
import type {
  BuzzedGame,
  BuzzedQuestion,
  BuzzedStanding,
  GradedPayload,
  RangInPayload,
  WindowClosedPayload
} from '@/types/buzzed';

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
  if (['embed', 'shorts', 'live', 'v'].includes(prefix ?? '') && id && YOUTUBE_ID.test(id)) return id;

  return null;
};

export const youTubeThumbnail = (videoId: string) => `https://i.ytimg.com/vi/${videoId}/mqdefault.jpg`;

export const youTubeWatchUrl = (videoId: string) => `https://www.youtube.com/watch?v=${videoId}`;

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

export const isOnRoster = (game: BuzzedGame, userId: string): boolean =>
  game.players.some(p => p.userId === userId);

export const hasRungIn = (question: BuzzedQuestion | null, userId: string): boolean =>
  !!question?.ringIns.some(r => r.userId === userId);

export const ringInPosition = (question: BuzzedQuestion | null, userId: string): number | null => {
  const index = question?.ringIns.findIndex(r => r.userId === userId) ?? -1;
  return index < 0 ? null : index + 1;
};

// Mirrors the server's atomic filter, so the button is never lit when the server would reject the ring-in.
// Note you can ring in during the ANSWERING window too — that's the whole point of the new flow.
export const canBuzz = (game: BuzzedGame, userId: string, now: number): boolean => {
  if (game.status !== 'active') return false;
  if (!isOnRoster(game, userId)) return false;

  const question = game.currentQuestion;
  if (!question) return false;
  if (question.state !== 'armed' && question.state !== 'answering') return false;
  if (now < question.rearmedAt) return false;
  // One ring-in each.
  if (hasRungIn(question, userId)) return false;
  // The window closed but nobody has advanced it yet.
  if (question.answerCloseAt != null && now >= question.answerCloseAt) return false;

  return true;
};

export const buzzBlockedReason = (game: BuzzedGame, userId: string, now: number): string | null => {
  if (canBuzz(game, userId, now)) return null;
  if (!isOnRoster(game, userId)) return 'You’re not playing';
  if (game.status !== 'active') return 'The game isn’t running';

  const question = game.currentQuestion;
  if (!question) return 'No question in play';

  const position = ringInPosition(question, userId);
  if (position) return position === 1 ? 'You rang in first!' : `You rang in #${position}`;
  if (question.answerCloseAt != null && now >= question.answerCloseAt) return 'Time’s up';

  return 'Waiting…';
};

// Seconds left in the answering window.
export const answerSecondsLeft = (game: BuzzedGame, now: number): number => {
  const closeAt = game.currentQuestion?.answerCloseAt;
  if (!closeAt || closeAt <= now) return 0;
  return Math.ceil((closeAt - now) / 1000);
};

// True once the window has elapsed but nobody has closed it yet. Whichever client notices calls /advance;
// it's idempotent, so a race is harmless.
export const needsAdvance = (game: BuzzedGame, now: number): boolean => {
  const question = game.currentQuestion;
  return (
    game.status === 'active' &&
    question?.state === 'answering' &&
    question.answerCloseAt != null &&
    now >= question.answerCloseAt
  );
};

// The ONE question this player still owes a thumb on — never a stack of them. Grading happens on an
// ARCHIVED question, in parallel with a new one already being live, so prompts would otherwise pile up:
// miss a grade, ring in on the next intro, and you'd be staring at two "Did you get it right?" cards with
// no way to tell which is which. So only the most recent ungraded question is offered, and ringing in on
// the current question retires it — by then the answer is long off screen and it's too late to score.
export const pendingGrade = (game: BuzzedGame, userId: string): BuzzedQuestion | undefined => {
  if (hasRungIn(game.currentQuestion, userId)) return undefined;

  return game.history
    .filter(q => q.ringIns.some(r => r.userId === userId && r.grade === undefined))
    .at(-1);
};

export const scoreQuestion = (question: BuzzedQuestion): number[] => {
  let rank = 0;
  return question.ringIns.map(ringIn => {
    if (ringIn.grade !== 'correct') return 0;
    const points = BUZZED_POINTS_BY_RANK[rank] ?? 0;
    rank += 1;
    return points;
  });
};

export const computeStandings = (game: BuzzedGame): BuzzedStanding[] => {
  const rows = game.players.map(player => {
    const mine = game.history.flatMap(q => q.ringIns.filter(r => r.userId === player.userId));
    const buzzTimes = mine.map(r => r.buzzMs);

    return {
      userId: player.userId,
      displayName: player.displayName,
      color: player.color,
      score: game.scores[player.userId] ?? 0,
      correct: mine.filter(r => r.grade === 'correct').length,
      ringIns: mine.length,
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

export const medalForRank = (rank: number): string => (['🥇', '🥈', '🥉'][rank - 1] ?? '');

// Shifts a hex colour toward black (amount < 1) or white (amount > 1).
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

// The Pusher payloads carry everything needed to react instantly; the refetch behind them reconciles.
export const applyRangIn = (game: BuzzedGame, payload: RangInPayload): BuzzedGame => {
  const question = game.currentQuestion;
  if (!question || question.index !== payload.questionIndex) return game;
  // Idempotent: a duplicate event mustn't append a second ring-in.
  if (question.ringIns.some(r => r.userId === payload.userId)) return game;

  return {
    ...game,
    currentQuestion: {
      ...question,
      state: 'answering',
      // The window is fixed from the FIRST ring-in — never extend it here.
      answerCloseAt: question.answerCloseAt ?? payload.answerCloseAt,
      ringIns: [...question.ringIns, { userId: payload.userId, ringAt: Date.now(), buzzMs: 0 }]
    },
    playback: { ...game.playback, playing: false, resumeAt: undefined }
  };
};

export const applyWindowClosed = (game: BuzzedGame, payload: WindowClosedPayload): BuzzedGame => {
  const question = game.currentQuestion;
  if (!question || question.state !== 'answering') return game;

  return {
    ...game,
    history: [...game.history, { ...question, state: 'grading', closedAt: Date.now() }],
    currentQuestion: {
      index: payload.nextQuestionIndex ?? question.index + 1,
      state: 'armed',
      videoId: game.videoId,
      armedAt: Date.now(),
      rearmedAt: payload.rearmedAt ?? Date.now(),
      ringIns: []
    },
    playback: { ...game.playback, playing: true, resumeAt: undefined }
  };
};

export const applyGraded = (game: BuzzedGame, payload: GradedPayload): BuzzedGame => ({
  ...game,
  scores: payload.scores ?? game.scores,
  history: game.history.map(q =>
    q.index === payload.questionIndex
      ? {
          ...q,
          ringIns: q.ringIns.map(r =>
            r.userId === payload.userId ? { ...r, grade: payload.grade, gradedAt: Date.now() } : r
          )
        }
      : q
  )
});
