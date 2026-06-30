import { describe, it, expect } from 'vitest';
import { getUserInitials } from '@/utils/userInitials';

describe('getUserInitials', () => {
  it('uses the first letters of the first two name parts', () => {
    expect(getUserInitials('Andrew Brainerd')).toBe('AB');
  });

  it('uses the first two letters of a single-word name', () => {
    expect(getUserInitials('Andrew')).toBe('AN');
  });

  it('ignores extra whitespace between names', () => {
    expect(getUserInitials('  Andrew   James  Brainerd ')).toBe('AJ');
  });

  it('falls back to the email local-part when there is no name', () => {
    expect(getUserInitials(null, 'drwb333@gmail.com')).toBe('DR');
    expect(getUserInitials('', 'a@b.com')).toBe('A');
  });

  it('prefers the name over the email', () => {
    expect(getUserInitials('Demo User', 'someone@example.com')).toBe('DU');
  });

  it('returns an empty string when nothing is provided', () => {
    expect(getUserInitials()).toBe('');
    expect(getUserInitials(null, null)).toBe('');
  });
});
