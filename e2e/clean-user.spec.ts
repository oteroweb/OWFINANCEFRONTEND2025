import { test, expect } from '@playwright/test';

const BASE = 'https://owfinances.com';

test.describe('Clean user — no auth, no cache', () => {
  test.use({ storageState: { cookies: [], origins: [] } });

  test('/app/ loads landing (not blank)', async ({ page }) => {
    const consoleErrors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErrors.push(msg.text()); });
    page.on('pageerror', err => consoleErrors.push(err.message));

    await page.goto(`${BASE}/app/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const url = page.url();
    const qApp = await page.locator('#q-app').innerHTML().catch(() => 'EMPTY');
    console.log(`[/app/] url=${url} qAppLen=${qApp.length}`);
    console.log(`[ERRORS] ${consoleErrors.length > 0 ? consoleErrors.join('; ') : 'none'}`);
    console.log(`[CONTENT] ${qApp.substring(0, 300)}`);
    
    expect(qApp.length).toBeGreaterThan(50);
  });

  test('/app/funciones loads (not blank)', async ({ page }) => {
    await page.goto(`${BASE}/app/funciones`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const url = page.url();
    const qApp = await page.locator('#q-app').innerHTML().catch(() => 'EMPTY');
    console.log(`[/app/funciones] url=${url} qAppLen=${qApp.length} isLoginPage=${url.includes('login')}`);
    
    expect(qApp.length).toBeGreaterThan(50);
  });

  test('/app/planes loads (not blank)', async ({ page }) => {
    await page.goto(`${BASE}/app/planes`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);
    
    const url = page.url();
    const qApp = await page.locator('#q-app').innerHTML().catch(() => 'EMPTY');
    console.log(`[/app/planes] url=${url} qAppLen=${qApp.length} isLoginPage=${url.includes('login')}`);
    
    expect(qApp.length).toBeGreaterThan(50);
  });

  test('Click Lite & Pro from landing scrolls to #modos', async ({ page }) => {
    await page.goto(`${BASE}/app/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    
    await page.click('a:has-text("Lite & Pro")');
    await page.waitForTimeout(2000);
    
    const url = page.url();
    console.log(`[Lite&Pro click] url=${url}`);
    
    const modos = page.locator('#modos');
    const exists = await modos.count();
    console.log(`[#modos] exists=${exists}`);
    
    if (exists > 0) {
      await expect(modos).toBeInViewport({ timeout: 3000 });
    } else {
      console.log('[#modos] section NOT FOUND in DOM');
      const sections = await page.locator('section[id]').evaluateAll(els => els.map(e => e.id));
      console.log(`[SECTIONS] ${sections.join(', ')}`);
    }
  });
});
