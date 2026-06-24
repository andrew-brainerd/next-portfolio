import { test as setup, expect } from '@playwright/test';

import { LOGIN_ROUTE, SCOREBOOK_FRISBEE_GOLF_ROUTE } from './support/routes';
import { STORAGE_STATE } from '../playwright.config';

/**
 * Performs a real Firebase email/password login through the actual UI, then
 * saves the authenticated state. We persist IndexedDB (indexedDB: true) because
 * the Firebase web SDK keeps its session there — the server-gated `brainerd-token`
 * cookie alone wouldn't give the client `firebaseAuth.currentUser` (needed by the
 * create-round form for the owner's uid).
 */
setup('authenticate via Firebase', async ({ page }) => {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;

  expect(
    email && password,
    'Set E2E_USER_EMAIL and E2E_USER_PASSWORD in .env.e2e (see .env.e2e.example)'
  ).toBeTruthy();

  // Surface the real Firebase auth error (the app collapses it to a generic
  // message). Only log failures — a successful body contains tokens.
  page.on('response', async response => {
    if (response.url().includes('identitytoolkit.googleapis.com') && !response.ok()) {
      const body = await response.text().catch(() => '');
      const code = body.match(/"message":\s*"([A-Z_]+)"/)?.[1] ?? '';
      console.log(`[firebase] ${response.status()} ${code}`);
    }
  });

  // returnTo lands us on the frisbee golf page after the hard redirect in SignIn.
  await page.goto(`${LOGIN_ROUTE}?returnTo=${SCOREBOOK_FRISBEE_GOLF_ROUTE}`);

  await page.getByTestId('emailInput').locator('input').fill(email!);
  await page.getByTestId('passwordInput').locator('input').fill(password!);
  await page.getByTestId('signInButton').click();

  // Either we navigate to the feature (success) or an error alert appears.
  await expect(
    page.getByRole('heading', { name: 'Frisbee Golf' }).or(page.getByRole('alert'))
  ).toBeVisible();

  // Confirm we're past the auth gate (not the "Please log in" fallback or an error).
  await expect(page.getByRole('heading', { name: 'Frisbee Golf' })).toBeVisible();

  await page.context().storageState({ path: STORAGE_STATE, indexedDB: true });
});
