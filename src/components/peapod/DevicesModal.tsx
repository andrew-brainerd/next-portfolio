'use client';

import type { SpotifyDevice } from '@/types/peapod';

interface DevicesModalProps {
  isOpen: boolean;
  devices: SpotifyDevice[];
  onTransferPlayback: (deviceId: string) => void;
  onClose: () => void;
}

const deviceIcons: Record<string, string> = {
  Speaker: '🔊',
  TV: '📺',
  Computer: '💻',
  Smartphone: '📱',
  Tablet: '📱'
};

export default function DevicesModal({ isOpen, devices, onTransferPlayback, onClose }: DevicesModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-neutral-800 rounded-xl p-6 max-w-sm w-[90%]" onClick={e => e.stopPropagation()}>
        <div className="text-xl mb-4 text-center">Available Devices</div>
        {(devices || [])
          .filter(d => !d.is_restricted)
          .sort((a, b) => (a.name === 'Peapod Web Player' ? -1 : b.name === 'Peapod Web Player' ? 1 : 0))
          .map(device => (
            <div
              key={device.id}
              className={`flex items-center rounded-md p-3 transition-all duration-300 select-none ${
                device.is_active ? 'text-brand-400' : 'hover:bg-neutral-700 hover:cursor-pointer'
              }`}
              onClick={() => {
                if (!device.is_active) {
                  onTransferPlayback(device.id);
                  onClose();
                }
              }}
            >
              <div className="w-10 text-lg">{deviceIcons[device.type] || '🎧'}</div>
              <span>{device.name}</span>
              {device.is_active && <span className="ml-auto text-xs text-brand-400">Active</span>}
            </div>
          ))}
        {devices.filter(d => !d.is_restricted).length === 0 && (
          <div className="text-neutral-400 text-center py-4">No devices available</div>
        )}
      </div>
    </div>
  );
}
