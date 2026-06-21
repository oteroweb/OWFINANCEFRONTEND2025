import { test, expect } from '@playwright/test';

const BASE = 'https://owfinances.com';

test.describe('Public navigation — all links', () => {
  test('Landing page loads and has content', async ({ page }) => {
    await page.goto(`${BASE}/`);
    await page.waitForTimeout(1500);
    const qApp = await page.locator('#q-app').innerHTML();
    expect(qApp.length).toBeGreaterThan(100);
    console.log(`[LANDING] #q-app=${qApp.length} chars`);
  });

  // Nav-click tests skip on mobile: links are hidden behind hamburger on <768px viewports
  test('Nav: Cómo funciona scrolls to section from landing', async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width < 768, 'Nav links hidden in mobile hamburger');
    await page.goto(`${BASE}/`);
    await page.waitForTimeout(1000);
    await page.click('a:has-text("Cómo funciona")');
    await page.waitForTimeout(1000);
    const comoFunciona = page.locator('#como-funciona');
    await expect(comoFunciona).toBeInViewport();
    console.log('[NAV] Cómo funciona → scrolled OK');
  });

  test('Nav: Lite & Pro scrolls to #modos from landing', async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width < 768, 'Nav links hidden in mobile hamburger');
    await page.goto(`${BASE}/`);
    await page.waitForTimeout(1000);
    await page.click('a:has-text("Lite & Pro")');
    await page.waitForTimeout(1000);
    const modos = page.locator('#modos');
    await expect(modos).toBeInViewport();
    console.log('[NAV] Lite & Pro → scrolled OK');
  });

  test('Nav: Funciones navigates to /funciones', async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width < 768, 'Nav links hidden in mobile hamburger');
    await page.goto(`${BASE}/`);
    await page.waitForTimeout(1000);
    await page.click('a:has-text("Funciones")');
    await page.waitForURL(/\/funciones/, { timeout: 5000 });
    const content = await page.locator('#q-app').innerHTML();
    expect(content.length).toBeGreaterThan(100);
    console.log(`[NAV] Funciones → url=${page.url()} content=${content.length}`);
  });

  test('Nav: Planes navigates to /planes', async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width < 768, 'Nav links hidden in mobile hamburger');
    await page.goto(`${BASE}/`);
    await page.waitForTimeout(1000);
    await page.click('a:has-text("Planes")');
    await page.waitForURL(/\/planes/, { timeout: 5000 });
    const content = await page.locator('#q-app').innerHTML();
    expect(content.length).toBeGreaterThan(100);
    console.log(`[NAV] Planes → url=${page.url()} content=${content.length}`);
  });

  test('Nav: Cómo funciona works FROM /planes (cross-page)', async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width < 768, 'Nav links hidden in mobile hamburger');
    await page.goto(`${BASE}/planes`);
    await page.waitForTimeout(1000);
    await page.click('a:has-text("Cómo funciona")');
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/$/);
    const comoFunciona = page.locator('#como-funciona');
    await expect(comoFunciona).toBeInViewport();
    console.log(`[NAV] Planes → Cómo funciona → url=${page.url()} scrolled OK`);
  });

  test('Nav: Lite & Pro works FROM /funciones (cross-page)', async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width < 768, 'Nav links hidden in mobile hamburger');
    await page.goto(`${BASE}/funciones`);
    await page.waitForTimeout(1000);
    await page.click('a:has-text("Lite & Pro")');
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/$/);
    const modos = page.locator('#modos');
    await expect(modos).toBeInViewport();
    console.log(`[NAV] Funciones → Lite & Pro → url=${page.url()} scrolled OK`);
  });

  test('Direct URL /funciones renders', async ({ page }) => {
    await page.goto(`${BASE}/funciones`);
    await page.waitForTimeout(2000);
    const content = await page.locator('#q-app').innerHTML();
    expect(content.length).toBeGreaterThan(100);
    console.log(`[DIRECT] /funciones content=${content.length}`);
  });

  test('Direct URL /planes renders', async ({ page }) => {
    await page.goto(`${BASE}/planes`);
    await page.waitForTimeout(2000);
    const content = await page.locator('#q-app').innerHTML();
    expect(content.length).toBeGreaterThan(100);
    console.log(`[DIRECT] /planes content=${content.length}`);
  });

  test('Direct URL /matriz renders', async ({ page }) => {
    await page.goto(`${BASE}/matriz`);
    await page.waitForTimeout(2000);
    const content = await page.locator('#q-app').innerHTML();
    expect(content.length).toBeGreaterThan(100);
    console.log(`[DIRECT] /matriz content=${content.length}`);
  });

  test('Login page renders', async ({ page }) => {
    await page.goto(`${BASE}/login`);
    await page.waitForTimeout(1500);
    const email = page.locator('input[type="email"]');
    await expect(email).toBeVisible();
    console.log('[DIRECT] /login → form visible');
  });
});
