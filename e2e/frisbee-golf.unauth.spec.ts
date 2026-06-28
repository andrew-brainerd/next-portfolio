import { test, expect } from '@playwright/test';

import {
  LOGIN_ROUTE,
  SCOREBOOK_FRISBEE_GOLF_NEW_ROUTE,
  SCOREBOOK_FRISBEE_GOLF_ROUTE
} from './support/routes';

/**
 * No storageState on this project, so the context is unauthenticated. The
 * server components gate on the brainerd-token cookie and should redirect to
 * the login page (with a `from` param so the user returns after signing in)
 * instead of rendering the feature.
 */
test.describe('frisbee golf — unauthenticated gating', () => {
  test('rounds list redirects unauthenticated users to login', async ({ page }) => {
    await page.goto(SCOREBOOK_FRISBEE_GOLF_ROUTE);

    await expect(page).toHaveURL(
      `${LOGIN_ROUTE}?from=${encodeURIComponent(SCOREBOOK_FRISBEE_GOLF_ROUTE)}`
    );

    // The authenticated heading must NOT be present.
    await expect(page.getByRole('heading', { name: 'Frisbee Golf' })).toHaveCount(0);
  });

  test('new round page redirects unauthenticated users to login', async ({ page }) => {
    await page.goto(SCOREBOOK_FRISBEE_GOLF_NEW_ROUTE);

    await expect(page).toHaveURL(
      `${LOGIN_ROUTE}?from=${encodeURIComponent(SCOREBOOK_FRISBEE_GOLF_NEW_ROUTE)}`
    );
    await expect(page.getByRole('heading', { name: 'New round' })).toHaveCount(0);
  });
});
