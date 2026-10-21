// A signed-in Condensate device (brainerd-api GET /condensate/devices).
export interface CondensateDevice {
  id: string;
  name?: string;
  platform?: 'windows' | 'linux' | 'macos';
  createdAt: number;
  lastUsedAt?: number;
}
