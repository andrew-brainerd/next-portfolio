import { describe, expect, it } from 'vitest';

import {
  answerSecondsLeft,
  applyGraded,
  applyRangIn,
  applyWindowClosed,
  buzzBlockedReason,
  canBuzz,
  computeStandings,
  defaultBuzzedGameName,
  isOnRoster,
  needsAdvance,
  parseYouTubeVideoId,
  pendingGrade,
  ringInPosition,
  scoreQuestion,
  shadeColor
} from '@/utils/buzzed';
import type { BuzzedGame, BuzzedQuestion, BuzzedRingIn } from '@/types/buzzed';

const NOW = 100_000;

const ringIn = (userId: string, grade?: 'correct' | 'missed'): BuzzedRingIn => ({
  userId,
  ringAt: 1_500,
  buzzMs: 500,
  ...(grade ? { grade } : {})
});

const question = (overrides: Partial<BuzzedQuestion> = {}): BuzzedQuestion => ({
  index: 3,
  state: 'armed',
  armedAt: 1_000,
  rearmedAt: 1_000,
  ringIns: [],
  ...overrides
});

const game = (overrides: Partial<BuzzedGame> = {}): BuzzedGame => ({
  id: 'g1',
  ownerUserId: 'host',
  participantUserIds: ['host', 'alice', 'bob', 'carol'],
  joinCode: 'ABC12',
  name: 'Game',
  status: 'active',
  target: 'host',
  players: [
    { userId: 'alice', displayName: 'Alice' },
    { userId: 'bob', displayName: 'Bob' },
    { userId: 'carol', displayName: 'Carol' }
  ],
  scores: { alice: 0, bob: 0, carol: 0 },
  settings: { answerWindowMs: 10_000 },
  playback: { playing: true, positionSec: 42, updatedAt: 1_000 },
  currentQuestion: question(),
  history: [],
  createdAt: 1_000,
  ...overrides
});

describe('scoreQuestion — points by position AMONG THE CORRECT', () => {
  it('awards 3/2/1 down the correct answers in ring-in order', () => {
    expect(
      scoreQuestion(question({ ringIns: [ringIn('alice', 'correct'), ringIn('bob', 'correct'), ringIn('carol', 'correct')] }))
    ).toEqual([3, 2, 1]);
  });

  it('does NOT let a wrong answer above you cost you a place', () => {
    // Alice rang in first and missed; Bob was second and got it — so Bob is the FIRST CORRECT and takes 3.
    expect(
      scoreQuestion(question({ ringIns: [ringIn('alice', 'missed'), ringIn('bob', 'correct')] }))
    ).toEqual([0, 3]);
  });

  it('gives nothing past third place', () => {
    expect(
      scoreQuestion(
        question({
          ringIns: [
            ringIn('alice', 'correct'),
            ringIn('bob', 'correct'),
            ringIn('carol', 'correct'),
            ringIn('dave', 'correct')
          ]
        })
      )
    ).toEqual([3, 2, 1, 0]);
  });

  it('treats an ungraded ring-in as holding no place — not as correct', () => {
    // The whole reason grade is a union and not `correct?: boolean`.
    expect(scoreQuestion(question({ ringIns: [ringIn('alice'), ringIn('bob', 'correct')] }))).toEqual([0, 3]);
  });
});

describe('canBuzz', () => {
  it('lets an eligible player ring in on a live question', () => {
    expect(canBuzz(game(), 'alice', NOW)).toBe(true);
  });

  it('still lets others ring in DURING the answering window — the point of the new flow', () => {
    const g = game({
      currentQuestion: question({
        state: 'answering',
        answerCloseAt: NOW + 5_000,
        ringIns: [ringIn('alice')]
      })
    });

    expect(canBuzz(g, 'bob', NOW)).toBe(true);
  });

  it('allows only one ring-in each', () => {
    const g = game({
      currentQuestion: question({ state: 'answering', answerCloseAt: NOW + 5_000, ringIns: [ringIn('alice')] })
    });

    expect(canBuzz(g, 'alice', NOW)).toBe(false);
    expect(buzzBlockedReason(g, 'alice', NOW)).toBe('You rang in first!');
  });

  it('closes once the window has elapsed, even before anyone advances it', () => {
    const g = game({
      currentQuestion: question({ state: 'answering', answerCloseAt: NOW - 1, ringIns: [ringIn('alice')] })
    });

    expect(canBuzz(g, 'bob', NOW)).toBe(false);
    expect(buzzBlockedReason(g, 'bob', NOW)).toBe('Time’s up');
  });

  it('gives no buzzer to a host who sat out', () => {
    expect(canBuzz(game(), 'host', NOW)).toBe(false);
    expect(buzzBlockedReason(game(), 'host', NOW)).toBe('You’re not playing');
  });
});

describe('ringInPosition + answerSecondsLeft + needsAdvance', () => {
  it('reports your 1-based place in the queue', () => {
    const q = question({ ringIns: [ringIn('alice'), ringIn('bob')] });

    expect(ringInPosition(q, 'alice')).toBe(1);
    expect(ringInPosition(q, 'bob')).toBe(2);
    expect(ringInPosition(q, 'carol')).toBeNull();
  });

  it('counts the window down and rounds up so the last tick reads 1', () => {
    const g = game({ currentQuestion: question({ state: 'answering', answerCloseAt: NOW + 4_200 }) });
    expect(answerSecondsLeft(g, NOW)).toBe(5);
  });

  it('flags a window that elapsed but nobody has closed', () => {
    const open = game({ currentQuestion: question({ state: 'answering', answerCloseAt: NOW + 1_000 }) });
    const done = game({ currentQuestion: question({ state: 'answering', answerCloseAt: NOW - 1 }) });

    expect(needsAdvance(open, NOW)).toBe(false);
    expect(needsAdvance(done, NOW)).toBe(true);
  });
});

describe('pendingGrade', () => {
  it('surfaces the archived question you rang in on but have not graded', () => {
    const g = game({
      history: [
        question({ index: 0, state: 'grading', ringIns: [ringIn('alice'), ringIn('bob', 'correct')] }),
        question({ index: 1, state: 'complete', ringIns: [ringIn('alice', 'missed')] })
      ]
    });

    expect(pendingGrade(g, 'alice')?.index).toBe(0);
    // Bob already graded question 0, and never rang in on 1.
    expect(pendingGrade(g, 'bob')).toBeUndefined();
    expect(pendingGrade(g, 'carol')).toBeUndefined();
  });

  it('offers only the MOST RECENT ungraded question, never a stack of them', () => {
    const g = game({
      history: [
        question({ index: 0, state: 'grading', ringIns: [ringIn('alice')] }),
        question({ index: 1, state: 'grading', ringIns: [ringIn('alice')] })
      ]
    });

    expect(pendingGrade(g, 'alice')?.index).toBe(1);
  });

  it('retires the prompt once you ring in on the current question — too late to score by then', () => {
    const g = game({
      history: [question({ index: 0, state: 'grading', ringIns: [ringIn('alice')] })],
      currentQuestion: question({ index: 1, state: 'answering', ringIns: [ringIn('alice')] })
    });

    expect(pendingGrade(g, 'alice')).toBeUndefined();
  });
});

describe('optimistic event appliers', () => {
  it('applyRangIn appends to the queue and pauses, without extending the window', () => {
    const g = game({
      currentQuestion: question({
        state: 'answering',
        answerCloseAt: NOW + 3_000,
        ringIns: [ringIn('alice')]
      })
    });

    const next = applyRangIn(g, {
      questionIndex: 3,
      userId: 'bob',
      displayName: 'Bob',
      position: 2,
      answerCloseAt: NOW + 10_000
    });

    expect(next.currentQuestion?.ringIns.map(r => r.userId)).toEqual(['alice', 'bob']);
    // The window is fixed from the FIRST ring-in — a latecomer must not reset the clock.
    expect(next.currentQuestion?.answerCloseAt).toBe(NOW + 3_000);
    expect(next.playback.playing).toBe(false);
  });

  it('applyRangIn ignores a duplicate event rather than double-appending', () => {
    const g = game({
      currentQuestion: question({ state: 'answering', ringIns: [ringIn('alice')] })
    });

    const next = applyRangIn(g, {
      questionIndex: 3,
      userId: 'alice',
      displayName: 'Alice',
      position: 1
    });

    expect(next.currentQuestion?.ringIns).toHaveLength(1);
  });

  it('applyWindowClosed archives for grading, resumes, and arms the next question', () => {
    const g = game({
      currentQuestion: question({ state: 'answering', ringIns: [ringIn('alice')] })
    });

    const next = applyWindowClosed(g, { nextQuestionIndex: 4, rearmedAt: NOW });

    expect(next.history[0]?.state).toBe('grading');
    expect(next.currentQuestion?.index).toBe(4);
    expect(next.currentQuestion?.ringIns).toEqual([]);
    // Buzzers live again immediately — grading happens in parallel on the archived question.
    expect(next.playback.playing).toBe(true);
  });

  it('applyGraded records the thumb and takes the recomputed scores', () => {
    const g = game({
      history: [question({ index: 0, state: 'grading', ringIns: [ringIn('alice')] })]
    });

    const next = applyGraded(g, {
      questionIndex: 0,
      userId: 'alice',
      grade: 'correct',
      scores: { alice: 3, bob: 0, carol: 0 }
    });

    expect(next.history[0]?.ringIns[0]?.grade).toBe('correct');
    expect(next.scores.alice).toBe(3);
  });
});

describe('computeStandings', () => {
  it('ranks by score and counts only graded-correct ring-ins', () => {
    const g = game({
      scores: { alice: 3, bob: 5, carol: 0 },
      history: [
        question({ index: 0, ringIns: [ringIn('alice', 'correct'), ringIn('bob', 'correct')] }),
        question({ index: 1, ringIns: [ringIn('bob', 'correct'), ringIn('alice', 'missed')] })
      ]
    });

    const standings = computeStandings(g);

    expect(standings.map(s => s.userId)).toEqual(['bob', 'alice', 'carol']);
    expect(standings[0]).toMatchObject({ userId: 'bob', score: 5, correct: 2, ringIns: 2 });
    expect(standings[1]).toMatchObject({ userId: 'alice', score: 3, correct: 1, ringIns: 2 });
  });

  it('gives a genuine tie the same rank', () => {
    expect(computeStandings(game()).map(s => s.rank)).toEqual([1, 1, 1]);
  });
});

describe('isOnRoster', () => {
  it('separates who can play from who merely has access', () => {
    const g = game();
    expect(isOnRoster(g, 'alice')).toBe(true);
    expect(isOnRoster(g, 'host')).toBe(false);
  });
});

describe('parseYouTubeVideoId', () => {
  it.each([
    ['https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://youtu.be/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['https://www.youtube.com/shorts/dQw4w9WgXcQ', 'dQw4w9WgXcQ'],
    ['dQw4w9WgXcQ', 'dQw4w9WgXcQ']
  ])('parses %s', (url, expected) => {
    expect(parseYouTubeVideoId(url)).toBe(expected);
  });

  it('ignores timestamps and playlists hanging off the link', () => {
    expect(parseYouTubeVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42s&list=PLabc')).toBe(
      'dQw4w9WgXcQ'
    );
  });

  it.each([
    ['', 'empty'],
    ['https://vimeo.com/12345', 'a non-YouTube host'],
    ['https://www.youtube.com/watch?v=tooshort', 'a malformed id']
  ])('rejects %s (%s)', input => {
    expect(parseYouTubeVideoId(input)).toBeNull();
  });
});

describe('shadeColor', () => {
  it('darkens a hex colour toward black', () => {
    expect(shadeColor('#dc2626', 0.6)).toBe('#841717');
  });

  it('returns garbage input untouched instead of emitting a broken colour', () => {
    expect(shadeColor('not-a-color', 0.6)).toBe('not-a-color');
  });
});

describe('defaultBuzzedGameName', () => {
  it('stamps the date so back-to-back quiz nights are told apart', () => {
    expect(defaultBuzzedGameName(new Date('2026-07-12T20:30:00Z'))).toBe('Anime Quiz 2026-07-12');
  });
});
