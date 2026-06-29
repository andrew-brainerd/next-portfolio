import { test, expect, type Page } from '@playwright/test';

import {
  SCOREBOOK_FRISBEE_GOLF_NEW_ROUTE,
  SCOREBOOK_FRISBEE_GOLF_ROUTE,
  SCOREBOOK_FRISBEE_GOLF_STATS_ROUTE
} from './support/routes';

const HOLE_COUNT = 3;

/** Set a MUI number field (rendered as role=spinbutton) to a value. */
async function setNumberField(page: Page, name: string, value: number) {
  const field = page.getByRole('spinbutton', { name });
  await field.fill(String(value));
}

/**
 * Score the hole currently shown in RoundActive: bump every player's score
 * once. Each click fires a server action that briefly disables that player's
 * buttons, so we wait for re-enable before moving on.
 */
async function scoreCurrentHole(page: Page) {
  const incButtons = page.getByRole('button', { name: 'Increase score' });
  const count = await incButtons.count();
  for (let i = 0; i < count; i++) {
    const button = incButtons.nth(i);
    await button.click();
    await expect(button).toBeEnabled();
  }
}

test.describe('frisbee golf — full round lifecycle', () => {
  // Missing-score completion uses window.confirm; auto-accept defensively.
  test.beforeEach(async ({ page }) => {
    page.on('dialog', dialog => dialog.accept());
  });

  test('create, set up, play, and complete a round, then see it in stats', async ({ page }) => {
    const roundName = `E2E round ${Date.now()}`;

    // --- Create ---
    await page.goto(SCOREBOOK_FRISBEE_GOLF_NEW_ROUTE);
    await expect(page.getByRole('heading', { name: 'New round' })).toBeVisible();

    await page.getByRole('textbox', { name: 'Round name (optional)' }).fill(roundName);
    await setNumberField(page, 'Holes', HOLE_COUNT);
    await page.getByRole('textbox', { name: 'Your nickname' }).fill('E2E Player');

    await page.getByRole('button', { name: 'Create round' }).click();

    // Redirects to the rounds list; the new round should be listed.
    await page.waitForURL(`**${SCOREBOOK_FRISBEE_GOLF_ROUTE}`);
    const roundCardHeading = page.getByRole('heading', { name: roundName });
    await expect(roundCardHeading).toBeVisible();

    // --- Setup ---
    await roundCardHeading.click();
    await expect(page.getByRole('heading', { name: roundName, level: 1 })).toBeVisible();
    await expect(page.getByText(`Status: setup · ${HOLE_COUNT} holes`)).toBeVisible();

    // The owner is the sole player; others would join via the invite link/code.
    await expect(page.getByText('E2E Player')).toBeVisible();

    // Start the round → server re-renders into the active view.
    await page.getByRole('button', { name: 'Start round' }).click();
    await expect(page.getByRole('heading', { name: 'Leaderboard' })).toBeVisible();

    // --- Play: score every hole for every player ---
    for (let hole = 1; hole <= HOLE_COUNT; hole++) {
      await expect(
        page.getByText(`Hole ${hole} of ${HOLE_COUNT}`)
      ).toBeVisible();
      await scoreCurrentHole(page);
      if (hole < HOLE_COUNT) {
        await page.getByRole('button', { name: 'Next hole' }).click();
      }
    }

    // All scores entered → owner can complete without the missing-score prompt.
    await expect(page.getByText('All scores entered. Ready to complete the round.')).toBeVisible();
    await page.getByRole('button', { name: 'Complete round' }).click();

    // --- Completed ---
    // handleComplete updates state but doesn't refresh; reload to get the
    // server-rendered completed view.
    await expect(async () => {
      await page.reload();
      await expect(page.getByRole('heading', { name: 'Final standings' })).toBeVisible();
    }).toPass();
    await expect(page.getByText(`Status: completed`)).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Scorecard' })).toBeVisible();
    await expect(page.getByText('Winner')).toBeVisible();
    // The owner appears in the final scorecard.
    await expect(page.getByText('E2E Player')).toBeVisible();

    // --- Stats reflects the completed round ---
    await page.goto(SCOREBOOK_FRISBEE_GOLF_STATS_ROUTE);
    await expect(page.getByText('Rounds played')).toBeVisible();
    const roundsPlayed = page.locator('div', { hasText: /^Rounds played$/ }).locator('xpath=following-sibling::div[1]');
    await expect(roundsPlayed).toHaveText(/^\d+$/);
  });
});
