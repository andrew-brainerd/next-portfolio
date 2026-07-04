'use client';

import { useEffect } from 'react';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';

import { RoundControls } from '@/components/scorebook/RoundControls';
import type { FrisbeeGolfRound } from '@/types/scorebook';

interface RoundControlsModalProps {
  isOpen: boolean;
  onClose: () => void;
  round: FrisbeeGolfRound;
  isOwner: boolean;
  onRoundUpdate: (round: FrisbeeGolfRound) => void;
}

// Round-settings sheet: full-screen on mobile, a centered card on larger screens.
export const RoundControlsModal = ({ isOpen, onClose, round, isOwner, onRoundUpdate }: RoundControlsModalProps) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-stretch justify-center bg-black/60 sm:items-center sm:p-4"
      onClick={e => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Round settings"
    >
      <div className="flex h-full w-full flex-col bg-neutral-900 sm:h-auto sm:max-h-[85vh] sm:max-w-lg sm:rounded-xl sm:border sm:border-neutral-700">
        <header className="flex items-center justify-between border-b border-neutral-800 px-4 py-3">
          <h2 className="text-lg font-semibold text-white">Round settings</h2>
          <IconButton
            aria-label="Close settings"
            onClick={onClose}
            size="small"
            sx={{ color: 'var(--color-neutral-400)' }}
          >
            <CloseIcon />
          </IconButton>
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <RoundControls round={round} isOwner={isOwner} onRoundUpdate={onRoundUpdate} />
        </div>
      </div>
    </div>
  );
};
