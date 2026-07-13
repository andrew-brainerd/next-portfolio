import type { Viewport } from 'next';

// Scoped to /buzzed rather than the root layout — the rest of the site is a normal document people should
// be able to pinch-zoom. A buzzer is not: it is tapped hard and fast, and an accidental zoom mid-round is
// a lost ring-in.
export const viewport: Viewport = {
  themeColor: '#191919',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover'
};

export default function BuzzedLayout({ children }: { children: React.ReactNode }) {
  // `touch-manipulation` is the one that actually matters: it kills double-tap-to-zoom (which rapid
  // buzzer tapping triggers constantly) without disabling pinch, and drops the legacy 300ms tap delay.
  // `overscroll-none` stops a downward swipe from firing pull-to-refresh and reloading mid-game.
  return <div className="touch-manipulation overscroll-none">{children}</div>;
}
