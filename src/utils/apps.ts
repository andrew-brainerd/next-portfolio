import dayjs from 'dayjs';
import { APPS_S3_BASE } from '@/constants/apps';
import type { AppPlatform, ReleaseDownload, ReleaseManifest } from '@/types/apps';

/** URL of an app's release manifest in the S3 bucket. */
export const releaseManifestUrl = (slug: string): string => `${APPS_S3_BASE}/${slug}/latest.json`;

const PLATFORMS: AppPlatform[] = ['macos', 'windows'];

const PLATFORM_LABELS: Record<AppPlatform, string> = {
  macos: 'macOS',
  windows: 'Windows'
};

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null;

const isPlatform = (value: unknown): value is AppPlatform =>
  typeof value === 'string' && (PLATFORMS as string[]).includes(value);

function normalizeDownload(raw: unknown): ReleaseDownload | null {
  if (!isRecord(raw)) return null;
  if (!isPlatform(raw.platform)) return null;
  if (typeof raw.url !== 'string' || raw.url.length === 0) return null;

  const label =
    typeof raw.label === 'string' && raw.label.trim().length > 0
      ? raw.label.trim()
      : PLATFORM_LABELS[raw.platform];
  const sizeBytes =
    typeof raw.sizeBytes === 'number' && raw.sizeBytes > 0 ? raw.sizeBytes : undefined;

  return { platform: raw.platform, label, url: raw.url, sizeBytes };
}

/**
 * Validate + normalize a raw `latest.json` payload into a ReleaseManifest.
 * Returns null when the payload is missing or unusable so the product page can
 * fall back to a "not yet published" state instead of rendering dead links.
 *
 * Accepted raw shape:
 * {
 *   "version": "0.4.1",
 *   "releasedAt": "2026-05-18",          // optional ISO date
 *   "notes": "…short notes / URL…",      // optional
 *   "downloads": [
 *     { "platform": "macos", "label": "…", "url": "https://…", "sizeBytes": 123 },
 *     { "platform": "windows", "url": "https://…" }
 *   ]
 * }
 */
export function normalizeReleaseManifest(raw: unknown): ReleaseManifest | null {
  if (!isRecord(raw)) return null;
  if (typeof raw.version !== 'string' || raw.version.trim().length === 0) return null;

  const downloadsRaw = Array.isArray(raw.downloads) ? raw.downloads : [];
  const downloads = downloadsRaw
    .map(normalizeDownload)
    .filter((download): download is ReleaseDownload => download !== null);

  if (downloads.length === 0) return null;

  const releasedAt =
    typeof raw.releasedAt === 'string' && dayjs(raw.releasedAt).isValid()
      ? raw.releasedAt
      : undefined;
  const notes =
    typeof raw.notes === 'string' && raw.notes.trim().length > 0 ? raw.notes.trim() : undefined;

  return { version: raw.version.trim(), releasedAt, notes, downloads };
}

export function downloadFor(
  manifest: ReleaseManifest,
  platform: AppPlatform
): ReleaseDownload | undefined {
  return manifest.downloads.find(download => download.platform === platform);
}

export function formatBytes(bytes: number): string {
  if (!Number.isFinite(bytes) || bytes <= 0) return '';
  const units = ['B', 'KB', 'MB', 'GB'];
  let value = bytes;
  let unit = 0;
  while (value >= 1024 && unit < units.length - 1) {
    value /= 1024;
    unit += 1;
  }
  const rounded = value >= 10 || unit === 0 ? Math.round(value) : Math.round(value * 10) / 10;
  return `${rounded} ${units[unit]}`;
}

export function formatReleaseDate(iso?: string): string | null {
  if (!iso) return null;
  const date = dayjs(iso);
  return date.isValid() ? date.format('MMMM D, YYYY') : null;
}
