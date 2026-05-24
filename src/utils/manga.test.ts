import { describe, it, expect } from 'vitest';
import { formatChapterName } from './manga';

describe('formatChapterName', () => {
  it('extracts the chapter number from a slug-style link', () => {
    expect(formatChapterName('/series/one-piece/chapter-1100')).toBe('Chapter 1100');
  });

  it('joins multi-part chapter numbers with a period', () => {
    expect(formatChapterName('/series/foo/chapter-12-5')).toBe('Chapter 12.5');
  });

  it('handles links without leading path segments', () => {
    expect(formatChapterName('chapter-7')).toBe('Chapter 7');
  });

  it('returns "Chapter " when the link has no number after the prefix', () => {
    expect(formatChapterName('/series/foo/chapter')).toBe('Chapter ');
  });
});
