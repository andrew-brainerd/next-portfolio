'use client';

import type { SpotifyDevice } from '@/types/peapod';
import { sortDevicesWithPeapodFirst } from '@/utils/peapod';
import Modal from './Modal';

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
  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="bg-neutral-800 rounded-xl p-6 max-w-sm w-[90%]">
        <div className="text-xl mb-4 text-center">Available Devices</div>
        {sortDevicesWithPeapodFirst((devices || []).filter(d => !d.is_restricted)).map(device => (
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
    </Modal>
  );
}
