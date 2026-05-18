import { APPS_CONDENSATE_ROUTE } from '@/constants/routes';
import type { NativeApp } from '@/types/apps';

/**
 * Public S3 bucket that hosts native-app installers and each app's
 * `latest.json` release manifest. Layout per app:
 *   `${APPS_S3_BASE}/<slug>/latest.json`         ← release manifest
 *   `${APPS_S3_BASE}/<slug>/<installer files>`   ← referenced by the manifest
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

/** Every native app surfaced on /apps. Add new apps here. */
export const NATIVE_APPS: NativeApp[] = [CONDENSATE];
