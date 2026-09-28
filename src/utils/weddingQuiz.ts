import type { StoredQuizResult, WeddingQuizConfig } from '@/types/wedding';

type QuizTiming = Pick<WeddingQuizConfig, 'open' | 'countsFrom' | 'closesAt'>;

// Client-side mirror of the server's rules — the server stays the authority
export const isQuizClosed = (quiz: QuizTiming, now: number): boolean =>
  !quiz.open || (!!quiz.closesAt && now >= Date.parse(quiz.closesAt));

export const isQuizCounting = (quiz: QuizTiming, now: number): boolean =>
  !quiz.countsFrom || now >= Date.parse(quiz.countsFrom);

export type QuizView =
  | 'form' // no entry yet, quiz open (practice or official depending on the clock)
  | 'practice' // practice run done, official attempt not open yet
  | 'retake' // practice run done, official attempt now open
  | 'result' // official entry — final
  | 'practice-closed' // practice run done, closed before the official attempt
  | 'closed'; // no entry and closed

export const getQuizView = (quiz: QuizTiming, stored: StoredQuizResult | undefined, now: number): QuizView => {
  const closed = isQuizClosed(quiz, now);
  if (stored && !stored.result.practice) return 'result';
  if (stored) {
    if (closed) return 'practice-closed';
    return isQuizCounting(quiz, now) ? 'retake' : 'practice';
  }
  return closed ? 'closed' : 'form';
};
