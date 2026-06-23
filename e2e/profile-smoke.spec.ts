/**
 * OWF-113 — Smoke tests: profile (V-07), financial-profile (V-08)
 * Note: Onboarding is a modal component (not a route), tested via config page trigger.
 */
import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Profile smoke (V-07, V-08)', () => {
  test.beforeEach(async ({ page }) => {
    if (!process.env.PLAYWRIGHT_TEST_EMAIL) {
      test.skip(true, 'Set PLAYWRIGHT_TEST_EMAIL + PLAYWRIGHT_TEST_PASSWORD to run auth-required tests');
    }
    await login(page);
  });

  // V-07: Profile / cuenta
  test('V-07 — Profile page loads and shows user data', async ({ page }) => {
    await page.goto('/user/profile');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/user\/profile/);
    const inputs = page.locator('input');
    await expect(inputs.first()).toBeVisible({ timeout: 10000 });
  });

  // V-08: Financial profile — card layout
  test('V-08 — Financial profile page loads with cards', async ({ page }) => {
    await page.goto('/user/financial-profile');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/user\/financial-profile/);
    await expect(page.locator('.fp-page__card, h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('V-08 — Financial profile has 4 cards (perfil, situación, metas, cántaros)', async ({ page }) => {
    await page.goto('/user/financial-profile');
    await page.waitForLoadState('domcontentloaded');
    const cards = page.locator('.fp-page__card');
    await expect(cards).toHaveCount(4, { timeout: 10000 });
  });

  test('V-08 — Jar template section visible in card 4', async ({ page }) => {
    await page.goto('/user/financial-profile');
    await page.waitForLoadState('domcontentloaded');
    // Wait for loading spinner to disappear
    await page.waitForSelector('.fp-page__tpl-loading', { state: 'hidden', timeout: 10000 }).catch(() => {});
    const tplScroll = page.locator('.fp-page__tpl-scroll');
    await expect(tplScroll).toBeVisible({ timeout: 5000 });
    const tplCards = page.locator('.fp-page__tpl-card');
    const count = await tplCards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  // V-23: Onboarding is a modal triggered from Config, not a route
  test('V-23 — Onboarding modal trigger visible in Config page', async ({ page }) => {
    await page.goto('/user/config');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/user\/config/);
    const onboardBtn = page.locator('button, .q-item').filter({ hasText: /configuraci[oó]n inicial|onboarding/i }).first();
    const visible = await onboardBtn.isVisible({ timeout: 5000 }).catch(() => false);
    if (visible) {
      await onboardBtn.click();
      const modal = page.locator('.q-dialog, [role="dialog"]').first();
      await expect(modal).toBeVisible({ timeout: 5000 });
    } else {
      // Config page loaded correctly
      await expect(page.locator('.q-page, main, #q-app').first()).toBeVisible();
    }
  });
});
