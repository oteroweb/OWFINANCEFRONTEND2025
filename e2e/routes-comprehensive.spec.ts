import { test, expect } from '@playwright/test';

const BASE = 'https://owfinances.com';

const publicRoutes = [
  { path: '/', title: 'Inicio' },
  { path: '/funciones', title: 'Funciones' },
  { path: '/planes', title: 'Planes' },
  { path: '/matriz', title: 'Matriz' },
  { path: '/login', title: 'Login' },
];

const userRoutes = [
  '/user/home',
  '/user/transactions',
  '/user/jars',
  '/user/config',
  '/user/expense-analysis',
  '/user/dreams',
  '/user/debts',
  '/user/categories',
  '/user/accounts',
];

test.describe('Public routes — render check', () => {
  for (const route of publicRoutes) {
    test(`${route.path || '/'} renders content (not blank)`, async ({ page }) => {
      await page.goto(`${BASE}${route.path}`);
      await page.waitForTimeout(2000);

      const bodyHTML = await page.locator('body').innerHTML();
      const hasContent = bodyHTML.length > 200;
      const hasApp = await page.locator('#q-app').innerHTML().then(h => h.length > 50).catch(() => false);
      const hasBlankVue = await page.locator('#q-app:empty').count().then(c => c === 0);

      console.log(`[PUBLIC] ${route.path}: body=${bodyHTML.length} chars, #q-app has content=${hasApp}, not empty=${hasBlankVue}`);

      expect(hasContent, `Body should have content at ${route.path}`).toBe(true);
      expect(hasApp, `#q-app should have rendered content at ${route.path}`).toBe(true);
    });
  }
});

test.describe('User routes — redirect to login when not authed', () => {
  for (const route of userRoutes) {
    test(`${route} redirects to login for unauthenticated user`, async ({ page }) => {
      await page.goto(`${BASE}${route}`);
      await page.waitForTimeout(2000);
      const url = page.url();
      console.log(`[USER NO AUTH] ${route} → ${url}`);
      expect(url).toMatch(/\/login|\/app\/login/);
    });
  }
});

test.describe('User routes — render after login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.fill('input[type="email"]', 'user@demo.com');
    await page.fill('input[type="password"]', 'S$ratoga.1990');
    await page.click('button[type="submit"]');
    await page.waitForURL(/\/user/, { timeout: 15000 });
    await page.waitForTimeout(1000);
  });

  for (const route of userRoutes) {
    test(`${route} renders content after login`, async ({ page }) => {
      await page.goto(`${BASE}${route}`);
      await page.waitForTimeout(2000);

      const qApp = await page.locator('#q-app').innerHTML().then(h => h.length).catch(() => 0);
      const hasLayout = await page.locator('.lite-nav, .user-shell, .pro-layout').count().then(c => c > 0);

      console.log(`[USER AUTHED] ${route}: #q-app=${qApp} chars, hasLayout=${hasLayout}, url=${page.url()}`);

      expect(qApp, `#q-app should have content at ${route}`).toBeGreaterThan(50);
    });
  }
});
