import { normalizeReleaseManifest, releaseManifestUrl } from '@/utils/apps';
import type { ReleaseManifest } from '@/types/apps';

/**
 * Server-side fetch of an app's release manifest from S3. Returns null on any
 * failure (not uploaded yet, network error, malformed JSON) so callers render
 * a graceful "not yet published" state rather than crashing the page.
 * Revalidated hourly so a new release surfaces without a redeploy.
 */
export async function getReleaseManifest(slug: string): Promise<ReleaseManifest | null> {
  try {
    const response = await fetch(releaseManifestUrl(slug), {
      next: { revalidate: 3600 }
    });
    if (!response.ok) return null;
    const raw: unknown = await response.json();
    return normalizeReleaseManifest(raw);
  } catch {
    return null;
  }
}
