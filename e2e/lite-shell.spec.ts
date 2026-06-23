import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

/**
 * OW Finance — Lite Desktop Shell smoke tests
 * Validates header, nav pill, and basic navigation after auth.
 */

test.describe('Lite Desktop Shell', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/OwFinance/i);
    await expect(page.locator('body')).toContainText('Iniciar sesión');
  });

  test.describe('authenticated shell', () => {
    test.beforeEach(async ({ page }) => {
      if (!process.env.PLAYWRIGHT_TEST_EMAIL) {
        test.skip(true, 'Set PLAYWRIGHT_TEST_EMAIL + PLAYWRIGHT_TEST_PASSWORD to run auth-required tests');
      }
      await login(page);
    });

    test('shell renders after login', async ({ page }) => {
      await expect(page).toHaveURL(/\/user/);
      await expect(page.locator('body')).toBeVisible();
    });

    test('LiteHeader visible on desktop', async ({ page }) => {
      const header = page.locator('.lite-header, .owf-header, header').first();
      await expect(header).toBeVisible({ timeout: 8000 });
    });

    test('bottom nav visible at mobile viewport', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await page.goto('/user/home');
      await page.waitForLoadState('domcontentloaded');
      const nav = page.locator('.nav-pill').first();
      await expect(nav).toBeVisible({ timeout: 8000 });
    });

    test('can navigate to Transactions via URL', async ({ page }) => {
      await page.goto('/user/transactions');
      await expect(page).toHaveURL(/\/user\/transactions/);
      await expect(page.locator('body')).toBeVisible();
    });

    test('can navigate to Jars via URL', async ({ page }) => {
      await page.goto('/user/jars');
      await expect(page).toHaveURL(/\/user\/jars/);
      await expect(page.locator('body')).toBeVisible();
    });
  });
});
