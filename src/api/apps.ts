import { betaManifestUrl, normalizeReleaseManifest, releaseManifestUrl } from '@/utils/apps';
import type { ReleaseManifest } from '@/types/apps';

/**
 * Server-side fetch of an app's release manifest from S3. Returns null on any
 * failure (not uploaded yet, network error, malformed JSON) so callers render
 * a graceful "not yet published" state rather than crashing the page.
 * Revalidated hourly so a new release surfaces without a redeploy.
 */
export function getReleaseManifest(slug: string): Promise<ReleaseManifest | null> {
  return fetchManifest(releaseManifestUrl(slug), 3600);
}

/** Newest beta build's manifest. Revalidated every 5 minutes since betas ship per push. */
export function getBetaManifest(slug: string): Promise<ReleaseManifest | null> {
  return fetchManifest(betaManifestUrl(slug), 300);
}

async function fetchManifest(url: string, revalidate: number): Promise<ReleaseManifest | null> {
  try {
    const response = await fetch(url, { next: { revalidate } });
    if (!response.ok) return null;
    const raw: unknown = await response.json();
    return normalizeReleaseManifest(raw);
  } catch {
    return null;
  }
}
