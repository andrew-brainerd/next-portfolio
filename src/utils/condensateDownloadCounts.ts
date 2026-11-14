import type { AppPlatform, CondensateDownloadCounts, DownloadSource } from '@/types/apps';

const SOURCES: DownloadSource[] = ['site', 'updater', 'direct'];
const PLATFORMS: AppPlatform[] = ['macos', 'windows', 'linux'];

const isCount = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value) && value >= 0;

export const normalizeDownloadCounts = (raw: unknown): CondensateDownloadCounts | null => {
  if (typeof raw !== 'object' || raw === null) return null;
  const { bySource, byVersion } = raw as { bySource?: Record<string, unknown>; byVersion?: unknown };
  if (typeof bySource !== 'object' || bySource === null || !Array.isArray(byVersion)) return null;
  return {
    bySource: Object.fromEntries(
      SOURCES.map(source => [source, isCount(bySource[source]) ? bySource[source] : 0])
    ) as Record<DownloadSource, number>,
    byVersion: byVersion.flatMap(row => {
      const { version, platform, source, count } = (row ?? {}) as Record<string, unknown>;
      return typeof version === 'string' &&
        PLATFORMS.includes(platform as AppPlatform) &&
        SOURCES.includes(source as DownloadSource) &&
        isCount(count)
        ? [{ version, platform: platform as AppPlatform, source: source as DownloadSource, count }]
        : [];
    })
  };
};

export interface VersionDownloads {
  version: string;
  site: number;
  updater: number;
  direct: number;
}

/** One row per version, platforms added together, in the order the API sent them (newest first). */
export const downloadsByVersion = (counts: CondensateDownloadCounts): VersionDownloads[] => {
  const rows = new Map<string, VersionDownloads>();
  for (const { version, source, count } of counts.byVersion) {
    const row = rows.get(version) ?? { version, site: 0, updater: 0, direct: 0 };
    row[source] += count;
    rows.set(version, row);
  }
  return [...rows.values()];
};
