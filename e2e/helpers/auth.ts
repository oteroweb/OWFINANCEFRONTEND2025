import type { Page } from '@playwright/test';

export const TEST_USER = {
  email: 'user@demo.com',
  password: 'password',
};

export async function login(page: Page, email = TEST_USER.email, password = TEST_USER.password) {
  await page.goto('http://localhost:3000/app/');
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button[type="submit"]');
  await page.waitForURL(/\/user\/home/, { timeout: 10000 });
}
