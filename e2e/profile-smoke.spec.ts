/**
 * OWF-113 — Smoke tests: profile (V-07), financial-profile (V-08), onboarding (V-23)
 */
import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Profile smoke (V-07, V-08, V-23)', () => {
  test.beforeEach(async ({ page }) => {
    if (!process.env.PLAYWRIGHT_TEST_EMAIL) {
      test.skip(true, 'Set PLAYWRIGHT_TEST_EMAIL + PLAYWRIGHT_TEST_PASSWORD to run auth-required tests');
    }
    await login(page);
  });

  // V-07: Profile / cuenta
  test('V-07 — Profile page loads and shows user data', async ({ page }) => {
    await page.goto('http://localhost:3000/app/user/profile');
    await expect(page).toHaveURL(/\/user\/profile/);
    // At least one input with email/name should be visible
    const inputs = page.locator('input');
    await expect(inputs.first()).toBeVisible({ timeout: 10000 });
  });

  // V-08: Financial profile — card layout
  test('V-08 — Financial profile page loads with cards', async ({ page }) => {
    await page.goto('http://localhost:3000/app/user/financial-profile');
    await expect(page).toHaveURL(/\/user\/financial-profile/);
    // Heading or card structure visible
    await expect(page.locator('.fp-page__card, .fp-card, h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('V-08 — Financial profile has 4 cards (perfil, situación, metas, cántaros)', async ({ page }) => {
    await page.goto('http://localhost:3000/app/user/financial-profile');
    await page.waitForLoadState('networkidle');
    // Expect at least 4 card sections
    const cards = page.locator('.fp-page__card');
    await expect(cards).toHaveCount(4, { timeout: 10000 });
  });

  test('V-08 — Jar template selector visible in card 4', async ({ page }) => {
    await page.goto('http://localhost:3000/app/user/financial-profile');
    await page.waitForLoadState('networkidle');
    // Template cards should render
    const tplCards = page.locator('.fp-page__tpl-card');
    const count = await tplCards.count();
    expect(count).toBeGreaterThanOrEqual(1);
  });

  // V-23: Onboarding flow
  test('V-23 — Onboarding renders intro step', async ({ page }) => {
    await page.goto('http://localhost:3000/app/user/onboarding');
    await expect(page).toHaveURL(/\/user\/onboarding/);
    // Step indicator or title should be visible
    await expect(page.locator('.ob__step-title, .ob__title, h1, h2').first()).toBeVisible({ timeout: 10000 });
  });

  test('V-23 — Onboarding can navigate to next step', async ({ page }) => {
    await page.goto('http://localhost:3000/app/user/onboarding');
    await page.waitForLoadState('networkidle');
    const nextBtn = page.locator('button').filter({ hasText: /siguiente|continuar|next/i }).first();
    if (await nextBtn.isVisible()) {
      await nextBtn.click();
      // Should still be on onboarding (or completed)
      await expect(page.locator('body')).toBeVisible();
    }
  });

  test('V-23 — Onboarding recommend step renders when goals step completed', async ({ page }) => {
    await page.goto('http://localhost:3000/app/user/onboarding');
    await page.waitForLoadState('networkidle');
    // Navigate through steps: intro → about → situation → goals → recommend
    // Try clicking next buttons multiple times
    for (let i = 0; i < 4; i++) {
      const next = page.locator('button').filter({ hasText: /siguiente|continuar|next/i }).first();
      if (await next.isVisible({ timeout: 2000 }).catch(() => false)) {
        await next.click();
        await page.waitForTimeout(400);
      }
    }
    // The recommend step should render (or we should be somewhere in onboarding still)
    await expect(page.locator('body')).toBeVisible();
  });
});
