export interface GolfTerm {
  term: string;
  emoji: string;
}

/** Maps a hole score (relative to par) to its disc/golf term and a celebratory emoji. */
export const golfTermForScore = (score: number, par: number): GolfTerm => {
  if (score === 1 && par > 1) return { term: 'Hole in one!', emoji: '🥏' };

  const diff = score - par;
  if (diff <= -3) return { term: 'Albatross', emoji: '🦅' };
  if (diff === -2) return { term: 'Eagle', emoji: '🦅' };
  if (diff === -1) return { term: 'Birdie', emoji: '🐦' };
  if (diff === 0) return { term: 'Par', emoji: '🟢' };
  if (diff === 1) return { term: 'Bogey', emoji: '😬' };
  if (diff === 2) return { term: 'Double bogey', emoji: '😣' };
  if (diff === 3) return { term: 'Triple bogey', emoji: '😖' };
  return { term: `+${diff}`, emoji: '🥵' };
};
