'use client';

import { useState } from 'react';
import { WIN95_APPS } from '@/constants/win95Apps';
import { Win95AppIcon } from '@/components/win95/Win95Icons';

interface Win95DesktopProps {
  activeId?: string;
  onLaunch: (route: string) => void;
}

/**
 * Teal wallpaper with launchable shortcut icons, revealed when the app window is minimized.
 * Single click selects; double click (or Enter) launches and restores the window.
 */
export const Win95Desktop = ({ activeId, onLaunch }: Win95DesktopProps) => {
  const [selected, setSelected] = useState<string | undefined>(activeId);

  return (
    <div
      className="absolute inset-0 bottom-7 grid auto-rows-min grid-flow-col grid-rows-[repeat(6,auto)] content-start justify-start gap-1 p-2"
      onMouseDown={e => {
        if (e.target === e.currentTarget) setSelected(undefined);
      }}
    >
      {WIN95_APPS.map(app => (
        <button
          key={app.id}
          type="button"
          className={`win95-wallpaper-icon ${selected === app.id ? 'win95-wallpaper-icon-selected' : ''}`}
          onClick={() => setSelected(app.id)}
          onDoubleClick={() => onLaunch(app.route)}
          onKeyDown={e => {
            if (e.key === 'Enter') onLaunch(app.route);
          }}
        >
          <Win95AppIcon id={app.id} className="h-8 w-8" />
          <span className="win95-wallpaper-icon-label text-[11px] leading-tight">{app.label}</span>
        </button>
      ))}
    </div>
  );
};
