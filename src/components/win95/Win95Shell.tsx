'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useWin95Mode } from '@/hooks/useWin95Mode';
import { WIN95_APPS, WIN95_DEFAULT_TITLE } from '@/constants/win95Apps';
import { win95AppForPath } from '@/utils/win95';
import { Win95AppIcon, StartLogo } from '@/components/win95/Win95Icons';
import { StartMenu } from '@/components/win95/StartMenu';
import { Win95Clock } from '@/components/win95/Win95Clock';
import { Win95Boot } from '@/components/win95/Win95Boot';
import { Win95Desktop } from '@/components/win95/Win95Desktop';

interface Win95ShellProps {
  isLoggedIn: boolean;
  pathname: string;
  children: React.ReactNode;
}

const MENU_ITEMS = ['File', 'Edit', 'View', 'Help'];

export const Win95Shell = ({ pathname, children }: Win95ShellProps) => {
  const { disable } = useWin95Mode();
  const router = useRouter();
  const [startOpen, setStartOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const startRef = useRef<HTMLDivElement>(null);
  const startBtnRef = useRef<HTMLButtonElement>(null);

  const activeApp = win95AppForPath(pathname, WIN95_APPS);
  const title = activeApp?.label ?? WIN95_DEFAULT_TITLE;

  const closeStart = (returnFocus = false) => {
    setStartOpen(false);
    if (returnFocus) startBtnRef.current?.focus();
  };

  const launchFromDesktop = (route: string) => {
    router.push(route);
    setMinimized(false);
  };

  useEffect(() => {
    if (!startOpen) return;
    const onClick = (e: MouseEvent) => {
      if (startRef.current && !startRef.current.contains(e.target as Node)) setStartOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [startOpen]);

  return (
    <div className="absolute inset-0 flex flex-col bg-[#008080]">
      <Win95Boot />
      <Win95Desktop activeId={activeApp?.id} onLaunch={launchFromDesktop} />
      <div
        className={`win95-window relative z-10 m-1 min-h-0 flex-1 flex-col ${minimized ? 'hidden' : 'flex'}`}
      >
        <div className="win95-title-bar">
          <span className="win95-title-text">
            {activeApp && <Win95AppIcon id={activeApp.id} />}
            {title}
          </span>
          <span className="flex items-center gap-0.5">
            <button
              type="button"
              className="win95-control-btn win95-focusable"
              aria-label="Minimize"
              onClick={() => setMinimized(true)}
            >
              <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
                <rect x="1" y="6" width="5" height="1.5" fill="#000" />
              </svg>
            </button>
            <button type="button" className="win95-control-btn" aria-label="Maximize" tabIndex={-1}>
              <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
                <rect x="0.5" y="0.5" width="7" height="7" fill="none" stroke="#000" />
                <rect x="0.5" y="0.5" width="7" height="2" fill="#000" />
              </svg>
            </button>
            <button
              type="button"
              className="win95-control-btn win95-focusable"
              aria-label="Exit Windows 95 mode"
              onClick={disable}
            >
              <svg width="8" height="8" viewBox="0 0 8 8" aria-hidden="true">
                <path d="M1 1 L7 7 M7 1 L1 7" stroke="#000" strokeWidth="1.2" />
              </svg>
            </button>
          </span>
        </div>

        <div className="hidden gap-3 px-1 py-0.5 text-[11px] xs:flex">
          {MENU_ITEMS.map(item => (
            <span key={item}>
              <span className="underline">{item[0]}</span>
              {item.slice(1)}
            </span>
          ))}
        </div>

        <div className="win95-surface m-0.5 min-h-0 flex-1 overflow-auto text-black">{children}</div>

        <div className="win95-statusbar">
          <div className="win95-statusbar-field flex-1 truncate">{title}</div>
          <div className="win95-statusbar-field hidden w-28 shrink-0 xs:block">Ready</div>
        </div>
      </div>

      <div className="relative z-20 mt-auto flex h-7 shrink-0 items-center gap-1 bg-[#c0c0c0] px-0.5 shadow-[inset_0_1px_0_#fff]">
        <div className="relative" ref={startRef}>
          <button
            ref={startBtnRef}
            type="button"
            onClick={() => setStartOpen(open => !open)}
            aria-haspopup="menu"
            aria-expanded={startOpen}
            className={`win95-raised win95-focusable flex items-center gap-1 px-2 py-1 text-[11px] font-bold ${
              startOpen ? 'win95-pressed' : ''
            }`}
          >
            <StartLogo />
            Start
          </button>
          {startOpen && (
            <StartMenu
              activeId={activeApp?.id}
              onNavigate={() => {
                setStartOpen(false);
                setMinimized(false);
              }}
              onLogOff={disable}
              onClose={() => closeStart(true)}
            />
          )}
        </div>

        <div className="mx-0.5 h-5 w-px bg-[#808080] shadow-[1px_0_0_#fff]" />

        <button
          type="button"
          onClick={() => setMinimized(m => !m)}
          aria-label={`${title} window`}
          aria-pressed={!minimized}
          className={`win95-raised win95-focusable flex min-w-0 flex-1 items-center justify-start gap-1.5 px-2 py-1 text-[11px] ${
            minimized ? '' : 'win95-pressed'
          }`}
        >
          {activeApp && <Win95AppIcon id={activeApp.id} />}
          <span className="truncate">{title}</span>
        </button>

        <Win95Clock />
      </div>
    </div>
  );
};
