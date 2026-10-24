import type { CondensateDevice } from 'types/condensateDevice';

const PLATFORM_NAMES = { windows: 'Windows', linux: 'Linux', macos: 'macOS' } as const;

const DAY_MS = 24 * 60 * 60 * 1000;

export const lastUsedLabel = (device: CondensateDevice, now: number): string => {
  const at = device.lastUsedAt ?? device.createdAt;
  const days = Math.floor((now - at) / DAY_MS);
  const when = days <= 0 ? 'today' : days === 1 ? 'yesterday' : `${days} days ago`;
  return `${device.lastUsedAt ? 'Last used' : 'Signed in'} ${when}`;
};

export const deviceTitle = (device: CondensateDevice): string => {
  const platform = device.platform ? PLATFORM_NAMES[device.platform] : undefined;
  if (device.name && platform) return `${device.name} (${platform})`;
  return device.name || (platform ? `${platform} device` : 'Condensate device');
};
