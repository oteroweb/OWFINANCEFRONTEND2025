import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Router navigation — DOM integrity', () => {
  test.beforeEach(async ({ page }) => {
    if (!process.env.PLAYWRIGHT_TEST_EMAIL) {
      test.skip(true, 'Set PLAYWRIGHT_TEST_EMAIL + PLAYWRIGHT_TEST_PASSWORD to run auth-required tests');
    }
    await login(page);
  });

  test('NavPill clicks preserve layout DOM', async ({ page }) => {
    await expect(page).toHaveURL(/\/user\/home/);

    const navPill = page.locator('.lite-nav');
    await expect(navPill).toBeVisible();

    const header = page.locator('.lite-header');
    await expect(header).toBeVisible();

    await page.locator('.lite-nav__item', { hasText: 'Movs' }).click();
    await expect(page).toHaveURL(/\/user\/transactions/);
    await expect(navPill).toBeVisible();
    await expect(header).toBeVisible();

    await page.locator('.lite-nav__item', { hasText: 'Cántaros' }).click();
    await expect(page).toHaveURL(/\/user\/jars/);
    await expect(navPill).toBeVisible();
    await expect(header).toBeVisible();

    await page.locator('.lite-nav__item', { hasText: 'Ajustes' }).click();
    await expect(page).toHaveURL(/\/user\/config/);
    await expect(navPill).toBeVisible();
    await expect(header).toBeVisible();

    await page.locator('.lite-nav__item', { hasText: 'Inicio' }).click();
    await expect(page).toHaveURL(/\/user\/home/);
    await expect(navPill).toBeVisible();
    await expect(header).toBeVisible();
  });

  test('ExpandedMenu navigation preserves layout DOM', async ({ page }) => {
    await expect(page).toHaveURL(/\/user\/home/);

    const navPill = page.locator('.lite-nav');
    const header = page.locator('.lite-header');

    await header.locator('[aria-label="Menú"], .lite-header__avatar, .lite-header__menu-btn').first().click();

    const menu = page.locator('.expanded-menu');
    await expect(menu).toBeVisible();

    await menu.locator('button', { hasText: 'Ajustes de app' }).click();
    await expect(page).toHaveURL(/\/user\/config/);
    await expect(navPill).toBeVisible();
    await expect(header).toBeVisible();
  });

  test('Direct URL navigation to child routes renders page content', async ({ page }) => {
    const routes = [
      '/user/transactions',
      '/user/jars',
      '/user/config',
      '/user/expense-analysis',
      '/user/dreams',
      '/user/debts',
    ];

    for (const route of routes) {
      await page.goto(route);
      await expect(page).toHaveURL(new RegExp(route.replace('/', '\\/')));
      const body = page.locator('body');
      await expect(body).toBeVisible();
      const navPill = page.locator('.lite-nav');
      await expect(navPill).toBeVisible({ timeout: 5000 });
    }
  });

  test('Browser back/forward preserves layout DOM', async ({ page }) => {
    await expect(page).toHaveURL(/\/user\/home/);

    await page.locator('.lite-nav__item', { hasText: 'Movs' }).click();
    await expect(page).toHaveURL(/\/user\/transactions/);

    await page.locator('.lite-nav__item', { hasText: 'Cántaros' }).click();
    await expect(page).toHaveURL(/\/user\/jars/);

    await page.goBack();
    await expect(page).toHaveURL(/\/user\/transactions/);
    await expect(page.locator('.lite-nav')).toBeVisible();

    await page.goForward();
    await expect(page).toHaveURL(/\/user\/jars/);
    await expect(page.locator('.lite-nav')).toBeVisible();
  });
});
