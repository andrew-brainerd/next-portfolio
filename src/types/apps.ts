export type AppPlatform = 'macos' | 'windows';

/** A native desktop app listed on /apps. */
export interface NativeApp {
  slug: string;
  name: string;
  tagline: string;
  /** One- or two-sentence summary for the /apps index card. */
  summary: string;
  /** Internal route to the product page (e.g. APPS_CONDENSATE_ROUTE). */
  route: string;
  /** Public source repo, if any (shown when set). */
  repoUrl?: string;
  platforms: AppPlatform[];
  /** false → listed but no download yet (renders a "coming soon" card). */
  available: boolean;
}

/** A product-page screenshot. `src` is a path under /public. */
export interface AppScreenshot {
  src: string;
  alt: string;
  caption: string;
}

/** One downloadable installer for a given platform. */
export interface ReleaseDownload {
  platform: AppPlatform;
  /** Human label, e.g. "macOS — Apple Silicon & Intel". */
  label: string;
  url: string;
  sizeBytes?: number;
}

/**
 * Normalized release info for a native app. Sourced at request time from the
 * app's `latest.json` manifest in the S3 bucket — see
 * `utils/apps.ts#normalizeReleaseManifest` for the accepted raw shape.
 */
export interface ReleaseManifest {
  version: string;
  /** ISO date (YYYY-MM-DD) the build was published, if provided. */
  releasedAt?: string;
  /** Short release notes or a changelog URL, if provided. */
  notes?: string;
  downloads: ReleaseDownload[];
}
