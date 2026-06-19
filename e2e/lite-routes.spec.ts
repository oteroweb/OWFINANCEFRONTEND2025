import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Lite Routes — DS-20..25', () => {
  test.beforeEach(async ({ page }) => {
    if (!process.env.PLAYWRIGHT_TEST_EMAIL) {
      test.skip(true, 'Set PLAYWRIGHT_TEST_EMAIL + PLAYWRIGHT_TEST_PASSWORD to run auth-required tests');
    }
    await login(page);
  });

  test('Home loads with correct DS tokens (navy primary)', async ({ page }) => {
    await expect(page).toHaveURL(/\/user\/home/);
    // Verify navy primary is applied via CSS var
    const primary = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim()
    );
    expect(primary).toBe('#1e3a8a');
  });

  test('Transactions route loads', async ({ page }) => {
    await page.goto('http://localhost:3000/app/user/transactions');
    await expect(page).toHaveURL(/\/user\/transactions/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Jars route loads', async ({ page }) => {
    await page.goto('http://localhost:3000/app/user/jars');
    await expect(page).toHaveURL(/\/user\/jars/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Config route loads', async ({ page }) => {
    await page.goto('http://localhost:3000/app/user/config');
    await expect(page).toHaveURL(/\/user\/config/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Expense analysis route loads', async ({ page }) => {
    await page.goto('http://localhost:3000/app/user/expense-analysis');
    await expect(page).toHaveURL(/\/user\/expense-analysis/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Dreams route loads', async ({ page }) => {
    await page.goto('http://localhost:3000/app/user/dreams');
    await expect(page).toHaveURL(/\/user\/dreams/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('Debts route loads', async ({ page }) => {
    await page.goto('http://localhost:3000/app/user/debts');
    await expect(page).toHaveURL(/\/user\/debts/);
    await expect(page.locator('body')).toBeVisible();
  });
});
