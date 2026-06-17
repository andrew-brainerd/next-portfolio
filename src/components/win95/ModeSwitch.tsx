'use client';

import { useWin95Mode } from '@/hooks/useWin95Mode';

interface ModeSwitchProps {
  normal: React.ReactNode;
  win95: React.ReactNode;
}

/**
 * Picks a presentation based on Win95 mode without touching data fetching: server pages pass
 * both already-rendered subtrees and only the active one is mounted. Use direct store reads in
 * client pages instead.
 */
export const ModeSwitch = ({ normal, win95 }: ModeSwitchProps) => {
  const { enabled } = useWin95Mode();
  return <>{enabled ? win95 : normal}</>;
};
