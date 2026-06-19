import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Authentication', () => {
  test('login page renders with correct branding', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('.auth-brand h2')).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });

  test('login with valid credentials redirects to home', async ({ page }) => {
    test.skip(!process.env.PLAYWRIGHT_TEST_EMAIL, 'Set PLAYWRIGHT_TEST_EMAIL + PLAYWRIGHT_TEST_PASSWORD to run');
    await login(page);
    await expect(page).toHaveURL(/\/user\/home/);
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[type="email"]', 'bad@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    await page.waitForTimeout(2500);
    await expect(page).not.toHaveURL(/\/user\/home/);
  });

  test('unauthenticated access to /user redirects to login', async ({ page }) => {
    await page.goto('/user/home');
    await expect(page).not.toHaveURL(/\/user\/home/);
  });

  test('forgot password page renders', async ({ page }) => {
    await page.goto('/forgot-password');
    await expect(page.locator('input[type="email"]')).toBeVisible();
  });
});
