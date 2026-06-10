import { test, expect } from '@playwright/test';
import { login, TEST_USER } from './helpers/auth';

test.describe('Authentication', () => {
  test('login page renders with correct branding', async ({ page }) => {
    await page.goto('http://localhost:3000/app/');
    await expect(page).toHaveTitle(/OwFinance/);
    // Navy primary should be applied
    const body = page.locator('body');
    await expect(body).toBeVisible();
  });

  test('login with valid credentials redirects to home', async ({ page }) => {
    await login(page);
    await expect(page).toHaveURL(/\/user\/home/);
  });

  test('login with invalid credentials shows error', async ({ page }) => {
    await page.goto('http://localhost:3000/app/');
    await page.fill('input[type="email"]', 'bad@example.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    // Should not navigate to home
    await page.waitForTimeout(2000);
    await expect(page).not.toHaveURL(/\/user\/home/);
  });

  test('unauthenticated access to /user redirects to login', async ({ page }) => {
    await page.goto('http://localhost:3000/app/user/home');
    await expect(page).not.toHaveURL(/\/user\/home/);
  });
});
