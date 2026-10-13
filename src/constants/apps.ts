import { APPS_CONDENSATE_ROUTE, APPS_DOWNLOAD_ALL_ROUTE } from '@/constants/routes';
import type { NativeApp } from '@/types/apps';

/**
 * Public S3 bucket that hosts native-app installers and each app's
 * `latest.json` release manifest. Written by the app's release CI (for
 * Condensate, `.github/workflows/release.yml`, spec §16.4). Layout per app:
 *   `${APPS_S3_BASE}/apps/<slug>/latest.json`             ← stable manifest (newest stable)
 *   `${APPS_S3_BASE}/apps/<slug>/<version>/latest.json`   ← versioned copy
 *   `${APPS_S3_BASE}/apps/<slug>/<version>/<installers>`  ← files the manifest links to
 */
export const APPS_S3_BASE = 'https://brainerd.s3.us-east-1.amazonaws.com';

export const CONDENSATE: NativeApp = {
  slug: 'condensate',
  name: 'Condensate',
  tagline: 'Plan game night without the guesswork',
  summary:
    'A Steam companion for groups of friends. Compare libraries to find the games everyone owns, see what is already installed, and estimate how long a download will take before the session starts.',
  route: APPS_CONDENSATE_ROUTE,
  platforms: ['macos', 'windows'],
  available: true
};

export const DOWNLOAD_ALL: NativeApp = {
  slug: 'download-all',
  name: 'Download All for Steam',
  tagline: 'Start every pending game update with one click',
  summary:
    'Adds a Download All button to the Steam Downloads page that starts every scheduled and queued update at once, instead of clicking through them one game at a time.',
  route: APPS_DOWNLOAD_ALL_ROUTE,
  repoUrl: 'https://github.com/andrew-brainerd/steam-download-all',
  platforms: ['windows'],
  available: true,
  countDownloads: true
};

/** Every native app surfaced on /apps. Add new apps here. */
export const NATIVE_APPS: NativeApp[] = [CONDENSATE, DOWNLOAD_ALL];
