'use client';

import type { StreamingOption, StreamingOptionType } from 'types/watch';
import { Modal } from 'components/peapod/Modal';

interface MoreOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  options: StreamingOption[];
}

const TYPE_LABELS: Record<StreamingOptionType, string> = {
  subscription: 'Subscription',
  free: 'Free',
  rent: 'Rent',
  buy: 'Buy',
  addon: 'Add-on'
};

export const MoreOptionsModal = ({ isOpen, onClose, title, options }: MoreOptionsModalProps) => (
  <Modal isOpen={isOpen} onClose={onClose}>
    <div className="w-full max-w-md rounded-lg border border-neutral-700 bg-neutral-900 p-5">
      <div className="flex items-start justify-between gap-3">
        <h3 className="font-semibold text-white">Where to watch{title ? ` — ${title}` : ''}</h3>
        <button type="button" onClick={onClose} aria-label="Close" className="text-lg leading-none text-neutral-500 hover:text-white">
          ×
        </button>
      </div>

      {options.length === 0 ? (
        <p className="mt-3 text-sm text-neutral-400">No other options available.</p>
      ) : (
        <ul className="mt-3 max-h-80 space-y-1.5 overflow-y-auto">
          {options.map((option, index) => (
            <li key={`${option.service.id}-${option.type}-${index}`}>
              <a
                href={option.link}
                target="_blank"
                rel="noreferrer"
                className="flex items-center justify-between gap-3 rounded bg-neutral-800/60 px-3 py-2 transition-colors hover:bg-neutral-800"
              >
                <span className="text-sm text-white">{option.service.name}</span>
                <span className="text-xs text-neutral-400">
                  {option.type === 'addon' && option.addon ? `Add-on · ${option.addon.name}` : TYPE_LABELS[option.type]}
                  {option.price ? ` · ${option.price.formatted}` : ''}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </div>
  </Modal>
);
