import { test, expect } from '@playwright/test';

// Helper: wait for Vue SPA to render (domcontentloaded fires before Vue hydrates)
async function waitForSpa(page: import('@playwright/test').Page) {
  await page.waitForFunction(() => {
    const app = document.querySelector('#q-app');
    return app && app.children.length > 0;
  }, null, { timeout: 10000 });
}

test.describe('Direct URL access — blank page debug', () => {
  test('/funciones direct load renders content', async ({ page }) => {
    await page.goto('/funciones');
    await waitForSpa(page);
    const url = page.url();
    const qApp = await page.locator('#q-app').innerHTML().catch(() => '');
    console.log(`[DIRECT /funciones] url=${url} qApp=${qApp.length}`);
    expect(qApp.length).toBeGreaterThan(50);
  });

  test('/planes direct load renders content', async ({ page }) => {
    await page.goto('/planes');
    await waitForSpa(page);
    const url = page.url();
    const qApp = await page.locator('#q-app').innerHTML().catch(() => '');
    console.log(`[DIRECT /planes] url=${url} qApp=${qApp.length}`);
    expect(qApp.length).toBeGreaterThan(50);
  });

  test('Click from landing to funciones then back', async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width < 768, 'Nav links may be hidden in mobile hamburger');
    await page.goto('/');
    await waitForSpa(page);

    await page.click('a[href="/funciones"], a:has-text("Funciones")');
    await page.waitForLoadState('domcontentloaded');
    let url = page.url();
    let qApp = await page.locator('#q-app').innerHTML().catch(() => '');
    console.log(`[CLICK Landing→Funciones] url=${url} qApp=${qApp.length}`);
    expect(qApp.length).toBeGreaterThan(50);

    await page.click('a[href="/planes"], a:has-text("Planes")');
    await page.waitForLoadState('domcontentloaded');
    url = page.url();
    qApp = await page.locator('#q-app').innerHTML().catch(() => '');
    console.log(`[CLICK Funciones→Planes] url=${url} qApp=${qApp.length}`);
    expect(qApp.length).toBeGreaterThan(50);
  });

  test('Console errors check on /funciones', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') errors.push(msg.text()); });
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/funciones');
    await page.waitForLoadState('domcontentloaded');

    if (errors.length > 0) {
      console.log('[CONSOLE ERRORS]', errors.join('\n'));
    } else {
      console.log('[CONSOLE] No errors');
    }
    // Only fail on page errors (JS exceptions), not console errors
    const pageErrors = errors.filter(e => e.startsWith('[PAGE_ERROR]') || !e.includes('['));
    expect(pageErrors.length, `JS errors found: ${pageErrors.join('; ')}`).toBe(0);
  });
});
