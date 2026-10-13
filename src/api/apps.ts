import { cookies } from 'next/headers';
import { TOKEN_COOKIE } from '@/constants/authentication';
import { normalizeReleaseManifest, releaseManifestUrl } from '@/utils/apps';
import type { AppDownloads, ReleaseManifest } from '@/types/apps';

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

/**
 * Condensate's stable and beta downloads from brainerd-api, which reads the
 * private repo's GitHub Releases. The session token is forwarded so a site
 * admin also gets the newest beta; everyone else gets `beta: null`.
 */
export async function getCondensateDownloads(): Promise<AppDownloads> {
  const token = (await cookies()).get(TOKEN_COOKIE)?.value;

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_BRAINERD_API_URL}/condensate/updates/downloads`,
      token
        ? { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
        : { next: { revalidate: 300 } }
    );
    if (!response.ok) return { stable: null, beta: null };
    const raw = (await response.json()) as { stable?: unknown; beta?: unknown };
    return {
      stable: normalizeReleaseManifest(raw.stable),
      beta: normalizeReleaseManifest(raw.beta)
    };
  } catch {
    return { stable: null, beta: null };
  }
}
