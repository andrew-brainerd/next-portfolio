'use client';

import { useRef, type KeyboardEvent } from 'react';
import { useRouter } from 'next/navigation';
import { WIN95_APPS } from '@/constants/win95Apps';
import { Win95AppIcon, IconLogOff } from '@/components/win95/Win95Icons';

interface StartMenuProps {
  activeId?: string;
  onNavigate: () => void;
  onLogOff: () => void;
  onClose: () => void;
}

export const StartMenu = ({ activeId, onNavigate, onLogOff, onClose }: StartMenuProps) => {
  const router = useRouter();
  const itemRefs = useRef<(HTMLButtonElement | null)[]>([]);

  // Flat, ordered list of focusable rows: the curated apps then the exit action.
  const items = [
    ...WIN95_APPS.map(app => ({
      key: app.id,
      label: app.label,
      bold: activeId === app.id,
      icon: <Win95AppIcon id={app.id} className="shrink-0" />,
      activate: () => {
        onNavigate();
        router.push(app.route);
      }
    })),
    {
      key: 'exit',
      label: 'Exit Windows 95...',
      bold: false,
      icon: <IconLogOff className="shrink-0" />,
      activate: onLogOff
    }
  ];

  const focusItem = (index: number) => {
    const count = items.length;
    const next = ((index % count) + count) % count;
    itemRefs.current[next]?.focus();
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        focusItem(index + 1);
        break;
      case 'ArrowUp':
        e.preventDefault();
        focusItem(index - 1);
        break;
      case 'Home':
        e.preventDefault();
        focusItem(0);
        break;
      case 'End':
        e.preventDefault();
        focusItem(items.length - 1);
        break;
      case 'Escape':
        e.preventDefault();
        onClose();
        break;
      default:
        break;
    }
  };

  return (
    <div
      role="menu"
      aria-label="Start menu"
      className="win95-raised absolute bottom-full left-0 mb-0.5 flex w-64 max-w-[90vw] select-none"
    >
      <div className="flex w-7 items-end justify-center bg-[#808080] py-2">
        <span className="rotate-180 text-[13px] font-bold tracking-wide text-white [writing-mode:vertical-rl]">
          Brainerd<span className="text-[#c0c0c0]">95</span>
        </span>
      </div>

      <div className="flex flex-1 flex-col py-1">
        {items.map((item, index) => (
          <div key={item.key}>
            {item.key === 'exit' && (
              <div className="mx-1 my-1 h-0.5 bg-[#808080] shadow-[0_1px_0_#ffffff]" />
            )}
            <button
              ref={node => {
                itemRefs.current[index] = node;
              }}
              type="button"
              role="menuitem"
              autoFocus={index === 0}
              onClick={item.activate}
              onKeyDown={e => handleKeyDown(e, index)}
              className={`win95-menuitem flex w-full items-center gap-3 px-2 py-1.5 text-left text-[11px] hover:bg-[#000080] hover:text-white ${
                item.bold ? 'font-bold' : ''
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
