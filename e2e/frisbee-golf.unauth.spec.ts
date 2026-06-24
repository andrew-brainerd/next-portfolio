import { test, expect } from '@playwright/test';

import {
  SCOREBOOK_FRISBEE_GOLF_NEW_ROUTE,
  SCOREBOOK_FRISBEE_GOLF_ROUTE
} from './support/routes';

/**
 * No storageState on this project, so the context is unauthenticated. The
 * server components gate on the brainerd-token cookie and should render the
 * "please log in" fallback instead of the feature.
 */
test.describe('frisbee golf — unauthenticated gating', () => {
  test('rounds list redirects unauthenticated users to a login prompt', async ({ page }) => {
    await page.goto(SCOREBOOK_FRISBEE_GOLF_ROUTE);

    await expect(page.getByText('Please log in to access Frisbee Golf.')).toBeVisible();
    const loginLink = page.getByRole('link', { name: 'Go to login' });
    await expect(loginLink).toBeVisible();
    await expect(loginLink).toHaveAttribute(
      'href',
      `/login?returnTo=${SCOREBOOK_FRISBEE_GOLF_ROUTE}`
    );

    // The authenticated heading must NOT be present.
    await expect(page.getByRole('heading', { name: 'Frisbee Golf' })).toHaveCount(0);
  });

  test('new round page is gated for unauthenticated users', async ({ page }) => {
    await page.goto(SCOREBOOK_FRISBEE_GOLF_NEW_ROUTE);

    await expect(page.getByText('Please log in to start a round.')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'New round' })).toHaveCount(0);
  });
});
