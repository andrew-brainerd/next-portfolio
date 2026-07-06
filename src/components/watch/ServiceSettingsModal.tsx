'use client';

import { useEffect, useState } from 'react';

import type { StreamingServiceRef } from 'types/watch';
import { getWatchServices, updateWatchSettings } from 'api/watch';
import { Modal } from 'components/peapod/Modal';

interface ServiceSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentServices: string[];
  onSaved: () => void | Promise<void>;
}

export const ServiceSettingsModal = ({ isOpen, onClose, currentServices, onSaved }: ServiceSettingsModalProps) => {
  const [services, setServices] = useState<StreamingServiceRef[]>([]);
  const [selected, setSelected] = useState<Set<string>>(new Set(currentServices));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setSelected(new Set(currentServices));
    setLoading(true);
    getWatchServices().then(res => {
      setServices(res ?? []);
      setLoading(false);
    });
  }, [isOpen, currentServices]);

  const toggle = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const save = async () => {
    setSaving(true);
    try {
      await updateWatchSettings({ services: [...selected] });
      await onSaved();
      onClose();
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="w-full max-w-md rounded-lg border border-neutral-700 bg-neutral-900 p-5">
        <h3 className="font-semibold text-white">My streaming services</h3>
        <p className="mt-1 text-xs text-neutral-400">
          Pick the services you subscribe to — we&apos;ll highlight what you can watch now.
        </p>

        {loading ? (
          <p className="mt-4 text-sm text-neutral-400">Loading services…</p>
        ) : (
          <div className="mt-4 grid max-h-72 grid-cols-2 gap-1.5 overflow-y-auto">
            {services.map(service => {
              const on = selected.has(service.id);
              return (
                <button
                  key={service.id}
                  type="button"
                  onClick={() => toggle(service.id)}
                  className={`flex items-center gap-2 rounded border px-2 py-1.5 text-left text-sm transition-colors ${
                    on
                      ? 'border-brand-500 bg-brand-600/20 text-white'
                      : 'border-neutral-700 bg-neutral-800/50 text-neutral-300 hover:border-neutral-500'
                  }`}
                >
                  <span
                    className={`h-3.5 w-3.5 shrink-0 rounded-sm border ${
                      on ? 'border-brand-400 bg-brand-500' : 'border-neutral-500'
                    }`}
                  />
                  <span className="truncate">{service.name}</span>
                </button>
              );
            })}
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded px-3 py-1.5 text-sm text-neutral-300 hover:text-white">
            Cancel
          </button>
          <button
            type="button"
            onClick={save}
            disabled={saving}
            className="rounded bg-brand-600 px-3 py-1.5 text-sm text-white transition-colors hover:bg-brand-700 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>
    </Modal>
  );
};
