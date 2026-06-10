import { test, expect } from '@playwright/test';

const BASE = 'https://owfinances.com';

test.describe('Direct URL access — blank page debug', () => {
  test('/app/funciones direct load renders content', async ({ page }) => {
    await page.goto(`${BASE}/app/funciones`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    const url = page.url();
    const qApp = await page.locator('#q-app').innerHTML().catch(() => '');
    const bodyText = await page.locator('body').innerText().catch(() => '');
    console.log(`[DIRECT /app/funciones] url=${url} qApp=${qApp.length} bodyText=${bodyText.substring(0, 200)}`);
    expect(qApp.length).toBeGreaterThan(50);
  });

  test('/funciones direct load renders content', async ({ page }) => {
    await page.goto(`${BASE}/funciones`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    const url = page.url();
    const qApp = await page.locator('#q-app').innerHTML().catch(() => '');
    console.log(`[DIRECT /funciones] url=${url} qApp=${qApp.length}`);
    expect(qApp.length).toBeGreaterThan(50);
  });

  test('/app/planes direct load renders content', async ({ page }) => {
    await page.goto(`${BASE}/app/planes`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    const url = page.url();
    const qApp = await page.locator('#q-app').innerHTML().catch(() => '');
    console.log(`[DIRECT /app/planes] url=${url} qApp=${qApp.length}`);
    expect(qApp.length).toBeGreaterThan(50);
  });

  test('/planes direct load renders content', async ({ page }) => {
    await page.goto(`${BASE}/planes`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    const url = page.url();
    const qApp = await page.locator('#q-app').innerHTML().catch(() => '');
    console.log(`[DIRECT /planes] url=${url} qApp=${qApp.length}`);
    expect(qApp.length).toBeGreaterThan(50);
  });

  test('Click from landing to funciones then back', async ({ page }) => {
    await page.goto(`${BASE}/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1000);
    
    await page.click('a:has-text("Funciones")');
    await page.waitForTimeout(2000);
    let url = page.url();
    let qApp = await page.locator('#q-app').innerHTML().catch(() => '');
    console.log(`[CLICK Landing→Funciones] url=${url} qApp=${qApp.length}`);
    expect(qApp.length).toBeGreaterThan(50);

    await page.click('a:has-text("Planes")');
    await page.waitForTimeout(2000);
    url = page.url();
    qApp = await page.locator('#q-app').innerHTML().catch(() => '');
    console.log(`[CLICK Funciones→Planes] url=${url} qApp=${qApp.length}`);
    expect(qApp.length).toBeGreaterThan(50);
  });

  test('Console errors check on /app/funciones', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    page.on('pageerror', err => errors.push(err.message));

    await page.goto(`${BASE}/app/funciones`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    if (errors.length > 0) {
      console.log('[CONSOLE ERRORS]', errors.join('\n'));
    } else {
      console.log('[CONSOLE] No errors');
    }
  });
});
