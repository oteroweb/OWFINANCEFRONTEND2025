import type { Page } from '@playwright/test';

export const TEST_USER = {
  email: process.env.PLAYWRIGHT_TEST_EMAIL ?? 'user@demo.com',
  password: process.env.PLAYWRIGHT_TEST_PASSWORD ?? 'S$ratoga.1990',
};

export async function login(page: Page, email = TEST_USER.email, password = TEST_USER.password) {
  await page.goto('/login');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/user\/home/, { timeout: 15000 });
}
