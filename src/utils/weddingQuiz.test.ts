import { describe, expect, it } from 'vitest';

import type { StoredQuizResult } from '@/types/wedding';
import { getQuizView, isQuizClosed, isQuizCounting } from './weddingQuiz';

const quiz = { open: true, countsFrom: '2027-11-19T17:00:00-05:00', closesAt: '2027-11-19T21:00:00-05:00' };
const NOON = Date.parse('2027-11-19T12:00:00-05:00');
const SIX = Date.parse('2027-11-19T18:00:00-05:00');
const TEN = Date.parse('2027-11-19T22:00:00-05:00');

const practice: StoredQuizResult = { name: 'Jane', result: { score: 2, total: 3, practice: true, results: [] } };
const official: StoredQuizResult = { name: 'Jane', result: { score: 3, total: 3, results: [] } };

describe('quiz timing', () => {
  it('mirrors the server rules', () => {
    expect(isQuizCounting(quiz, NOON)).toBe(false);
    expect(isQuizCounting(quiz, SIX)).toBe(true);
    expect(isQuizClosed(quiz, SIX)).toBe(false);
    expect(isQuizClosed(quiz, TEN)).toBe(true);
    expect(isQuizClosed({ ...quiz, open: false }, SIX)).toBe(true);
  });
});

describe('getQuizView', () => {
  it('shows the form until the guest has an entry', () => {
    expect(getQuizView(quiz, undefined, NOON)).toBe('form');
    expect(getQuizView(quiz, undefined, SIX)).toBe('form');
    expect(getQuizView(quiz, undefined, TEN)).toBe('closed');
  });

  it('walks a practice run through to the official retake', () => {
    expect(getQuizView(quiz, practice, NOON)).toBe('practice');
    expect(getQuizView(quiz, practice, SIX)).toBe('retake');
    expect(getQuizView(quiz, practice, TEN)).toBe('practice-closed');
  });

  it('keeps an official entry final', () => {
    expect(getQuizView(quiz, official, SIX)).toBe('result');
    expect(getQuizView(quiz, official, TEN)).toBe('result');
  });
});
