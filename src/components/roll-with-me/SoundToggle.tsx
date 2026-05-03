'use client';

import { useEffect } from 'react';
import { useSoundStore } from '@/hooks/useSoundStore';
import { SpeakerOnIcon } from './icons/SpeakerOnIcon';
import { SpeakerOffIcon } from './icons/SpeakerOffIcon';

interface SoundToggleProps {
  className?: string;
}

export const SoundToggle = ({ className }: SoundToggleProps) => {
  const muted = useSoundStore(s => s.muted);
  const toggleMuted = useSoundStore(s => s.toggleMuted);
  const hydrate = useSoundStore(s => s.hydrate);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  return (
    <button
      type="button"
      onClick={toggleMuted}
      aria-label={muted ? 'Unmute sound effects' : 'Mute sound effects'}
      aria-pressed={!muted}
      className={[
        'inline-flex items-center justify-center w-9 h-9 rounded-md text-neutral-400 hover:text-brand-300 hover:bg-neutral-800/60 cursor-pointer transition-colors',
        className ?? ''
      ].join(' ')}
    >
      {muted ? <SpeakerOffIcon className="w-5 h-5" /> : <SpeakerOnIcon className="w-5 h-5" />}
    </button>
  );
};
