import type { CurseForgeAddon } from '@/types/addons';
import { getRequest } from '@/api/client';

/** Published WoW addons with live CurseForge stats. brainerd-api holds the key and caches for 10 minutes. */
export const getAddons = (): Promise<CurseForgeAddon[] | undefined> => {
  return getRequest<CurseForgeAddon[]>('/curseforge/addons');
};
