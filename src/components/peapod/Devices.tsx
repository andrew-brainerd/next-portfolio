'use client';

import type { SpotifyDevice } from '@/types/peapod';

interface DevicesProps {
  devices: SpotifyDevice[];
  onTransferPlayback: (deviceId: string) => void;
}

const deviceIcons: Record<string, string> = {
  Speaker: '🔊',
  TV: '📺',
  Computer: '💻',
  Smartphone: '📱',
  Tablet: '📱'
};

export default function Devices({ devices, onTransferPlayback }: DevicesProps) {
  return (
    <div className="flex flex-col m-6 max-w-xs w-[90%]">
      <div className="text-lg pb-1 relative underline">Available Devices</div>
      {(devices || []).map(device => {
        const { id, is_active: isActive, is_restricted: isRestricted, name, type } = device;

        return (
          !isRestricted && (
            <div
              key={id}
              className={`flex items-center border-b border-transparent p-2.5 transition-all duration-300 select-none ${
                isActive ? 'text-brand-400' : 'hover:bg-neutral-700 hover:cursor-pointer'
              }`}
              onClick={() => !isActive && onTransferPlayback(id)}
            >
              <div className="w-12 text-lg">{deviceIcons[type] || '🎧'}</div>
              {name}
            </div>
          )
        );
      })}
    </div>
  );
}
