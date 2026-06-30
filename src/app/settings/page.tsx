'use client';

import { useWin95Mode } from 'hooks/useWin95Mode';
import { SettingsHub } from 'components/settings/SettingsHub';
import { Win95ControlPanel } from 'components/win95/apps/Win95ControlPanel';

export default function SettingsPage() {
  const win95 = useWin95Mode(state => state.enabled);

  if (win95) {
    return <Win95ControlPanel />;
  }

  return <SettingsHub />;
}
