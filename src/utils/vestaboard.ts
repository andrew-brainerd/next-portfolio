// Vestaboard character model + text→grid layout helpers.
// The FLAP_SEQUENCE is the physical rotor order: advancing a cell always steps
// FORWARD through this array (wrapping at the end), exactly like a real split-flap.
// A "code" in this module is an index into FLAP_SEQUENCE.

export interface FlapGlyph {
  // The character to render, or ' ' for blank. null when the glyph is a color chip.
  char: string | null;
  // CSS color for the 6 Vestaboard color chips (undefined for normal glyphs).
  color?: string;
  // Human-readable name (used for a11y / debugging).
  name: string;
}

const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
const DIGITS = '1234567890'.split('');
const PUNCT = ['!', '@', '#', '$', '(', ')', '-', '+', '&', '=', ';', ':', "'", '"', '%', ',', '.', '/', '?', '°'];

// Vestaboard's 6 color chips (+ white). Approximate brand hues.
const COLOR_CHIPS: { name: string; color: string }[] = [
  { name: 'red', color: '#d3222a' },
  { name: 'orange', color: '#e5651f' },
  { name: 'yellow', color: '#f2b31c' },
  { name: 'green', color: '#3a9c46' },
  { name: 'blue', color: '#1160c4' },
  { name: 'violet', color: '#6f3aa0' },
  { name: 'white', color: '#eceadf' }
];

export const FLAP_SEQUENCE: readonly FlapGlyph[] = [
  { char: ' ', name: 'blank' },
  ...LETTERS.map(char => ({ char, name: char })),
  ...DIGITS.map(char => ({ char, name: char })),
  ...PUNCT.map(char => ({ char, name: char })),
  ...COLOR_CHIPS.map(chip => ({ char: null, color: chip.color, name: chip.name }))
];

export const SEQUENCE_LENGTH = FLAP_SEQUENCE.length;
export const BLANK_CODE = 0;

const CHAR_TO_CODE: Record<string, number> = {};
FLAP_SEQUENCE.forEach((glyph, code) => {
  if (glyph.char !== null && CHAR_TO_CODE[glyph.char] === undefined) {
    CHAR_TO_CODE[glyph.char] = code;
  }
});

const COLOR_CODE: Record<string, number> = {};
FLAP_SEQUENCE.forEach((glyph, code) => {
  if (glyph.color) COLOR_CODE[glyph.name] = code;
});

/** Index of a color chip by name (red/orange/yellow/green/blue/violet/white). */
export const colorCode = (name: string): number => COLOR_CODE[name] ?? BLANK_CODE;

/** All color-chip codes in order — handy for decorative rows. */
export const COLOR_CODES: number[] = COLOR_CHIPS.map(chip => COLOR_CODE[chip.name]);

/** Map a single character to its flap code (unknown → blank). */
export const charToCode = (ch: string): number => {
  if (!ch) return BLANK_CODE;
  const upper = ch.toUpperCase();
  return CHAR_TO_CODE[upper] ?? BLANK_CODE;
};

export const glyphForCode = (code: number): FlapGlyph =>
  FLAP_SEQUENCE[((code % SEQUENCE_LENGTH) + SEQUENCE_LENGTH) % SEQUENCE_LENGTH];

/** Advance one flap forward (wraps). This is the only direction a rotor turns. */
export const nextCode = (code: number): number => (code + 1) % SEQUENCE_LENGTH;

/** Number of forward flaps needed to get from one code to another. */
export const flapDistance = (from: number, to: number): number => (to - from + SEQUENCE_LENGTH) % SEQUENCE_LENGTH;

// Digits are a contiguous block in the sequence: '1'..'9' then '0'.
const DIGIT_MIN = charToCode('1');
const DIGIT_MAX = charToCode('0');

export const isDigitCode = (code: number): boolean => code >= DIGIT_MIN && code <= DIGIT_MAX;

/** Numeric value 0–9 of a digit code (0 sorts last in the sequence). */
export const digitValue = (code: number): number => (code === DIGIT_MAX ? 0 : code - DIGIT_MIN + 1);

/** Flap code for a numeric digit 0–9. */
export const codeForDigit = (n: number): number => (n === 0 ? DIGIT_MAX : DIGIT_MIN + n - 1);

/**
 * Next flap code stepping from `cur` toward `target`. Digit→digit transitions
 * step around a digit-only ring (0→1→…→9→0) so counters count up cleanly
 * instead of looping the whole rotor; everything else uses the full sequence.
 */
export const stepToward = (cur: number, target: number): number =>
  isDigitCode(cur) && isDigitCode(target) ? codeForDigit((digitValue(cur) + 1) % 10) : nextCode(cur);

/** Uppercase + strip anything the board can't display (→ space). */
export const normalizeToBoard = (text: string): string =>
  text
    .toUpperCase()
    .split('')
    .map(ch => (ch === ' ' || CHAR_TO_CODE[ch] !== undefined ? ch : ' '))
    .join('');

/** A rows×cols grid of blank codes. */
export const blankGrid = (rows: number, cols: number): number[][] =>
  Array.from({ length: rows }, () => Array.from({ length: cols }, () => BLANK_CODE));

/** Center a line within cols (truncates if too long). */
export const centerLine = (line: string, cols: number): string => {
  const normalized = normalizeToBoard(line);
  if (normalized.length >= cols) return normalized.slice(0, cols);
  const pad = cols - normalized.length;
  const left = Math.floor(pad / 2);
  return ' '.repeat(left) + normalized + ' '.repeat(pad - left);
};

/**
 * Lay out lines of text on a rows×cols grid: each line horizontally centered,
 * the whole block vertically centered. Overflow (rows or cols) is truncated.
 */
export const layoutText = (lines: string[], rows: number, cols: number): number[][] => {
  const grid = blankGrid(rows, cols);
  const visible = lines.slice(0, rows);
  const top = Math.floor((rows - visible.length) / 2);
  visible.forEach((line, i) => {
    const centered = centerLine(line, cols);
    const row = top + i;
    for (let c = 0; c < cols; c++) {
      grid[row][c] = charToCode(centered[c] ?? ' ');
    }
  });
  return grid;
};

/** Word-wrap text into lines no wider than `cols` (hard-splits over-long words). */
export const wrapText = (text: string, cols: number): string[] => {
  const words = normalizeToBoard(text).split(' ').filter(Boolean);
  const lines: string[] = [];
  let current = '';

  const push = () => {
    if (current) lines.push(current);
    current = '';
  };

  for (const word of words) {
    if (word.length > cols) {
      push();
      let rest = word;
      while (rest.length > cols) {
        lines.push(rest.slice(0, cols));
        rest = rest.slice(cols);
      }
      current = rest;
      continue;
    }
    if (!current) {
      current = word;
    } else if (current.length + 1 + word.length <= cols) {
      current += ` ${word}`;
    } else {
      push();
      current = word;
    }
  }
  push();

  return lines.length ? lines : [''];
};

/** Fill an entire grid row with a repeating set of codes (e.g. a color-chip border). */
export const fillRow = (grid: number[][], row: number, codes: number[]): void => {
  if (row < 0 || row >= grid.length || codes.length === 0) return;
  for (let c = 0; c < grid[row].length; c++) {
    grid[row][c] = codes[c % codes.length];
  }
};
