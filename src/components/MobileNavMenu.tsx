'use client';

import { useEffect } from 'react';
import Link from 'next/link';

import { CloseIcon } from '@/components/icons/CloseIcon';
import type { NavLink } from '@/types/navigation';

interface MobileNavMenuProps {
  open: boolean;
  onClose: () => void;
  links: NavLink[];
}

// Full-screen mobile nav overlay. Stays mounted so CSS transitions drive both the
// enter and exit animations off the `open` prop (per-item transition-delay gives a
// staggered reveal). Only rendered below the `nav` breakpoint by the parent.
export const MobileNavMenu = ({ open, onClose, links }: MobileNavMenuProps) => {
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKeyDown);

    // Lock background scroll while the overlay is open
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Site navigation"
      aria-hidden={!open}
      className={`fixed inset-0 z-[60] transition-opacity duration-300 ease-out ${
        open ? 'opacity-100' : 'pointer-events-none opacity-0'
      }`}
    >
      <div className="absolute inset-0 bg-neutral-950/95 backdrop-blur-md" onClick={onClose} />

      <button
        type="button"
        onClick={onClose}
        aria-label="Close menu"
        className="absolute right-3 top-4 z-10 text-white transition-colors hover:text-brand-300"
      >
        <CloseIcon className="h-7 w-7" />
      </button>

      <nav className="relative flex h-full flex-col items-center justify-center gap-3 px-6">
        {links.map((link, index) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={onClose}
            style={{ transitionDelay: open ? `${120 + index * 60}ms` : '0ms' }}
            className={`flex w-full max-w-xs items-center gap-4 rounded-xl px-6 py-4 text-2xl font-semibold text-white transition-all duration-500 ease-out hover:bg-white/10 hover:text-brand-300 ${
              open ? 'translate-y-0 opacity-100' : 'translate-y-6 opacity-0'
            }`}
          >
            <link.Icon className="h-8 w-8 shrink-0" />
            {link.label}
          </Link>
        ))}
      </nav>
    </div>
  );
};
