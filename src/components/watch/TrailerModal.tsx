'use client';

import type { Trailer } from 'types/watch';
import { Modal } from 'components/peapod/Modal';

interface TrailerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  trailer: Trailer | null | undefined;
}

export const TrailerModal = ({ isOpen, onClose, title, trailer }: TrailerModalProps) => (
  <Modal isOpen={isOpen && !!trailer} onClose={onClose}>
    <div className="w-full max-w-2xl rounded-lg border border-neutral-700 bg-neutral-900 p-4">
      <div className="mb-2 flex items-center justify-between gap-3">
        <h3 className="truncate font-semibold text-white">{title ? `${title} — Trailer` : 'Trailer'}</h3>
        <button type="button" onClick={onClose} aria-label="Close" className="text-lg leading-none text-neutral-500 hover:text-white">
          ×
        </button>
      </div>

      {trailer && (
        <div className="relative w-full overflow-hidden rounded bg-black" style={{ aspectRatio: '16 / 9' }}>
          <iframe
            src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
            title={`${title} trailer`}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
            allowFullScreen
          />
        </div>
      )}
    </div>
  </Modal>
);
