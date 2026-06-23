import { test, expect } from '@playwright/test';

/**
 * OW Finance — E2E Tests for Lite Desktop Shell
 * Tests the new Design System shell (header, nav pill, navigation)
 */

test.describe('Lite Desktop Shell', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('http://localhost:3000/');
  });

  test('login page loads', async ({ page }) => {
    await expect(page).toHaveTitle(/OwFinance/);
    await expect(page.locator('body')).toContainText('Iniciar sesión');
  });

  test('can login and see Lite shell', async ({ page }) => {
    // Fill login form (adjust selectors based on your login page)
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');

    // Wait for navigation to home
    await page.waitForURL(/\/user\/home/);

    // Verify Lite shell elements are present
    await expect(page.locator('.lite-header')).toBeVisible();
    await expect(page.locator('.lite-nav')).toBeVisible();
  });

  test('nav pill has 7 items + quick add', async ({ page }) => {
    // Login first
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/user\/home/);

    // Count nav items
    const navItems = page.locator('.lite-nav__item');
    await expect(navItems).toHaveCount(7);

    // Verify quick add button exists
    await expect(page.locator('.lite-nav__quick')).toBeVisible();
  });

  test('can navigate between routes via nav pill', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/user\/home/);

    // Click on Transactions
    await page.click('.lite-nav__item:has-text("Movs")');
    await page.waitForURL(/\/user\/transactions/);

    // Click on Jars
    await page.click('.lite-nav__item:has-text("Cántaros")');
    await page.waitForURL(/\/user\/jars/);

    // Click on Config
    await page.click('.lite-nav__item:has-text("Ajustes")');
    await page.waitForURL(/\/user\/config/);
  });

  test('expanded menu opens from avatar', async ({ page }) => {
    await page.fill('input[type="email"]', 'test@example.com');
    await page.fill('input[type="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/user\/home/);

    // Click avatar
    await page.click('.lite-header__avatar');
    await expect(page.locator('.expanded-menu')).toBeVisible();
  });
});

test.describe('Redesign Static HTML', () => {
  test('Lite Desktop kit loads', async ({ page }) => {
    await page.goto('http://localhost:3000/Redesign/ui_kits/lite-desktop/index.html');
    await expect(page.locator('body')).toBeVisible();
  });
});
