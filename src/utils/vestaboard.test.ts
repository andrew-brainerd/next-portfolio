import { describe, expect, it } from 'vitest';

import {
  BLANK_CODE,
  SEQUENCE_LENGTH,
  centerLine,
  charToCode,
  colorCode,
  flapDistance,
  glyphForCode,
  isDigitCode,
  layoutText,
  nextCode,
  normalizeToBoard,
  stepToward,
  wrapText
} from './vestaboard';

describe('vestaboard', () => {
  it('maps letters and digits to codes and back', () => {
    expect(glyphForCode(charToCode('A')).char).toBe('A');
    expect(glyphForCode(charToCode('Z')).char).toBe('Z');
    expect(glyphForCode(charToCode('0')).char).toBe('0');
  });

  it('lowercases into the same code and unknown chars become blank', () => {
    expect(charToCode('a')).toBe(charToCode('A'));
    expect(charToCode('~')).toBe(BLANK_CODE);
    expect(charToCode(' ')).toBe(BLANK_CODE);
  });

  it('nextCode always steps forward and wraps at the end', () => {
    expect(nextCode(0)).toBe(1);
    expect(nextCode(SEQUENCE_LENGTH - 1)).toBe(0);
  });

  it('stepToward counts digit→digit up in a clean single-step ring', () => {
    const digit = (n: number) => charToCode(String(n));
    // 0→1 and 9→0 are each a single forward step (no full-rotor loop)
    expect(stepToward(digit(0), digit(1))).toBe(digit(1));
    expect(stepToward(digit(9), digit(0))).toBe(digit(0));
    expect(stepToward(digit(3), digit(7))).toBe(digit(4));
    // never overshoots into non-digits
    for (let n = 0; n <= 9; n++) {
      expect(isDigitCode(stepToward(digit(n), digit((n + 3) % 10)))).toBe(true);
    }
  });

  it('stepToward uses the full sequence when either side is not a digit', () => {
    expect(stepToward(charToCode('A'), charToCode('5'))).toBe(nextCode(charToCode('A')));
    expect(stepToward(charToCode('0'), charToCode('A'))).toBe(nextCode(charToCode('0')));
  });

  it('flapDistance counts forward flaps with wraparound', () => {
    expect(flapDistance(0, 3)).toBe(3);
    expect(flapDistance(3, 0)).toBe(SEQUENCE_LENGTH - 3);
    expect(flapDistance(5, 5)).toBe(0);
  });

  it('normalizes to the supported character set', () => {
    expect(normalizeToBoard('Hello, World!')).toBe('HELLO, WORLD!');
    expect(normalizeToBoard('a~b')).toBe('A B');
  });

  it('colorCode returns a valid chip code', () => {
    expect(glyphForCode(colorCode('red')).color).toBeDefined();
    expect(glyphForCode(colorCode('green')).name).toBe('green');
  });

  it('centerLine pads to width and truncates overflow', () => {
    expect(centerLine('HI', 6)).toBe('  HI  ');
    expect(centerLine('TOOLONG', 4)).toBe('TOOL');
  });

  it('wrapText word-wraps within the column width', () => {
    expect(wrapText('WELCOME HOME ANDREW', 12)).toEqual(['WELCOME HOME', 'ANDREW']);
    expect(wrapText('', 10)).toEqual(['']);
  });

  it('wrapText hard-splits words longer than the width', () => {
    expect(wrapText('SUPERCALIFRAGILISTIC', 8)).toEqual(['SUPERCAL', 'IFRAGILI', 'STIC']);
  });

  it('layoutText produces a rows×cols grid, vertically centered', () => {
    const grid = layoutText(['HI'], 6, 22);
    expect(grid).toHaveLength(6);
    expect(grid[0]).toHaveLength(22);
    // single centered line lands on the middle row (row 2 or 3 of 6)
    const nonBlankRows = grid.filter(row => row.some(code => code !== BLANK_CODE));
    expect(nonBlankRows).toHaveLength(1);
  });
});
