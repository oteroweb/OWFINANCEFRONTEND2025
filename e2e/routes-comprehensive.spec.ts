import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

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

// Wait for Vue SPA to render (domcontentloaded fires before Vue hydrates)
async function waitForSpa(page: import('@playwright/test').Page) {
  await page.waitForFunction(() => {
    const app = document.querySelector('#q-app');
    return app && app.children.length > 0;
  }, null, { timeout: 10000 });
}

test.describe('Public routes — render check', () => {
  for (const route of publicRoutes) {
    test(`${route.path || '/'} renders content (not blank)`, async ({ page }) => {
      await page.goto(route.path);
      await waitForSpa(page);

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
      await page.goto(route);
      // Vue Router auth guard runs after SPA hydrates — wait for URL to settle
      await page.waitForURL(/\/login/, { timeout: 10000 }).catch(() => {});
      const url = page.url();
      console.log(`[USER NO AUTH] ${route} → ${url}`);
      expect(url).toMatch(/\/login/);
    });
  }
});

test.describe('User routes — render after login', () => {
  test.beforeEach(async ({ page }) => {
    if (!process.env.PLAYWRIGHT_TEST_EMAIL) {
      test.skip(true, 'Set PLAYWRIGHT_TEST_EMAIL + PLAYWRIGHT_TEST_PASSWORD to run auth-required tests');
    }
    await login(page);
  });

  for (const route of userRoutes) {
    test(`${route} renders content after login`, async ({ page }) => {
      await page.goto(route);
      await page.waitForLoadState('domcontentloaded');

      const qApp = await page.locator('#q-app').innerHTML().then(h => h.length).catch(() => 0);
      const url = page.url();

      console.log(`[USER AUTHED] ${route}: #q-app=${qApp} chars, url=${url}`);

      expect(qApp, `#q-app should have content at ${route}`).toBeGreaterThan(50);
    });
  }
});
