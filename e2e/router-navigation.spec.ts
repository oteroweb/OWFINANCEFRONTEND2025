import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Router navigation — DOM integrity', () => {
  test.beforeEach(async ({ page }) => {
    if (!process.env.PLAYWRIGHT_TEST_EMAIL) {
      test.skip(true, 'Set PLAYWRIGHT_TEST_EMAIL + PLAYWRIGHT_TEST_PASSWORD to run auth-required tests');
    }
    await login(page);
  });

  test('direct route navigation preserves session — 6 routes', async ({ page }) => {
    const routes = [
      '/user/transactions',
      '/user/jars',
      '/user/config',
      '/user/expense-analysis',
      '/user/dreams',
      '/user/home',
    ];

    for (const route of routes) {
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');
      await expect(page).toHaveURL(new RegExp(route.replace(/\//g, '\\/')));
      const qApp = await page.locator('#q-app').innerHTML().then(h => h.length).catch(() => 0);
      expect(qApp, `#q-app empty at ${route}`).toBeGreaterThan(50);
    }
  });

  test('mobile nav-pill clicks navigate between routes', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/user/home');
    await page.waitForLoadState('domcontentloaded');

    const navPill = page.locator('.nav-pill').first();
    await expect(navPill).toBeVisible({ timeout: 8000 });

    // Click Movimientos (Transactions)
    const txLink = navPill.locator('a[href*="transactions"], a[href*="movimientos"]').first();
    if (await txLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await txLink.click();
      await expect(page).toHaveURL(/\/user\/transactions/, { timeout: 10000 });
      await expect(navPill).toBeVisible();
    }

    // Click Cántaros (Jars)
    const jarsLink = navPill.locator('a[href*="jars"], a[href*="cantaros"]').first();
    if (await jarsLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await jarsLink.click();
      await expect(page).toHaveURL(/\/user\/jars/, { timeout: 10000 });
      await expect(navPill).toBeVisible();
    }
  });

  test('browser back/forward maintains authenticated state', async ({ page }) => {
    await page.goto('/user/home');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/user\/home/);

    await page.goto('/user/transactions');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/user\/transactions/);

    await page.goBack();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/user\/home/);
    // Should still be authenticated (not redirected to login)
    await expect(page).not.toHaveURL(/\/login/);

    await page.goForward();
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/user\/transactions/);
    await expect(page).not.toHaveURL(/\/login/);
  });
});
