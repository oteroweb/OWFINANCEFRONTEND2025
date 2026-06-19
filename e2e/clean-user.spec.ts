import { test, expect } from '@playwright/test';

// Prod URL: PHP proxy at / serves app/index.html for all non-API routes.
// Vue Router base is '/', so / → LandingPage, /funciones → FeaturesPage, etc.
const BASE = 'https://owfinances.com';

test.describe('Clean user — no auth, no cache', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('Landing page renders (not blank)', async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const qApp = await page.locator('#q-app').innerHTML().catch(() => 'EMPTY');
    expect(qApp.length).toBeGreaterThan(50);
    // #modos section must exist in the landing
    await expect(page.locator('#modos')).toBeAttached({ timeout: 5000 });
  });

  test('/funciones loads (not blank)', async ({ page }) => {
    await page.goto(`${BASE}/funciones`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const qApp = await page.locator('#q-app').innerHTML().catch(() => 'EMPTY');
    expect(qApp.length).toBeGreaterThan(50);
  });

  test('/planes loads (not blank)', async ({ page }) => {
    await page.goto(`${BASE}/planes`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    const qApp = await page.locator('#q-app').innerHTML().catch(() => 'EMPTY');
    expect(qApp.length).toBeGreaterThan(50);
  });

  test('Landing Ver funciones CTA navigates', async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await page.click('a:has-text("Ver funciones")');
    await expect(page).toHaveURL(/\/funciones/);
  });
});
