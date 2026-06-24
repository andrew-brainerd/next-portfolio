import { defineConfig, devices } from '@playwright/test';

/**
 * E2E config for the frisbee golf scorebook feature.
 *
 * Runs against the real stack: the Next.js dev server (HTTPS, self-signed) and
 * the brainerd-api backend. Auth is a real Firebase login performed once in
 * auth.setup.ts, persisted to storageState (including the Firebase IndexedDB
 * session, which server-gated cookies alone don't cover).
 *
 * Credentials come from env (.env.e2e — gitignored). See .env.e2e.example.
 */

import { existsSync, readFileSync } from 'node:fs';

// Minimal .env.e2e loader — keeps test creds out of the repo without adding a dep.
const envPath = '.env.e2e';
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)\s*$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.replace(/^['"]|['"]$/g, '');
  }
}

export const BASE_URL = process.env.E2E_BASE_URL || 'https://local.brainerd.dev:3001';
export const STORAGE_STATE = 'e2e/.auth/user.json';

export default defineConfig({
  testDir: './e2e',
  // Round lifecycle hits a real backend over the network — give actions room.
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  // Real-stack mutations against a shared backend aren't safe to parallelize.
  workers: 1,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: BASE_URL,
    ignoreHTTPSErrors: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    {
      name: 'unauthenticated',
      testMatch: /.*\.unauth\.spec\.ts/,
      use: { ...devices['Desktop Chrome'] }
    },
    {
      name: 'authenticated',
      testMatch: /frisbee-golf\.spec\.ts/,
      dependencies: ['setup'],
      use: { ...devices['Desktop Chrome'], storageState: STORAGE_STATE }
    }
  ],
  webServer: {
    command: 'pnpm dev',
    url: BASE_URL,
    reuseExistingServer: true,
    ignoreHTTPSErrors: true,
    timeout: 120_000
  }
});
