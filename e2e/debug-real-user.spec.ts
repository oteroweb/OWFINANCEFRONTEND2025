import { test, expect } from '@playwright/test';

// Wait for Vue SPA to render (domcontentloaded fires before Vue hydrates)
async function waitForSpa(page: import('@playwright/test').Page) {
  await page.waitForFunction(() => {
    const app = document.querySelector('#q-app');
    return app && app.children.length > 0;
  }, null, { timeout: 10000 });
}

test.describe('Real user navigation debug', () => {
  test('Full flow: load landing → click Planes → check what happens', async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width < 768, 'Desktop nav links hidden on mobile');
    const logs: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') logs.push(msg.text()); });
    page.on('pageerror', err => logs.push(`[PAGE_ERROR] ${err.message}`));

    await page.goto('/');
    await waitForSpa(page);

    console.log('=== STEP 1: Landing loaded ===');
    console.log(`URL: ${page.url()}`);
    console.log(`Logs so far: ${logs.join('; ') || 'none'}`);

    const landingContent = await page.locator('#q-app').innerHTML().catch(() => 'EMPTY');
    console.log(`Landing #q-app length: ${landingContent.length}`);

    await page.click('a[href="/planes"], a:has-text("Planes")');
    await waitForSpa(page);

    console.log(`URL after Planes: ${page.url()}`);
    const planesContent = await page.locator('#q-app').innerHTML().catch(() => 'EMPTY');
    console.log(`Planes #q-app length: ${planesContent.length}`);
    console.log(`Errors: ${logs.length > 0 ? logs.join('\n') : 'none'}`);

    expect(planesContent.length).toBeGreaterThan(50);
  });

  test('Direct load /planes with full logging', async ({ page }) => {
    const logs: string[] = [];
    page.on('console', msg => { if (msg.type() === 'error') logs.push(msg.text()); });
    page.on('pageerror', err => logs.push(`[PAGE_ERROR] ${err.message}`));

    await page.goto('/planes');
    await waitForSpa(page);

    console.log(`URL: ${page.url()}`);
    const content = await page.locator('#q-app').innerHTML().catch(() => 'EMPTY');
    console.log(`#q-app length: ${content.length}`);
    console.log(`Errors: ${logs.length > 0 ? logs.join('\n') : 'none'}`);

    expect(content.length).toBeGreaterThan(50);
  });

  test('Click to funciones then back to landing', async ({ page, viewport }) => {
    test.skip(!viewport || viewport.width < 768, 'Desktop nav links hidden on mobile');
    const logs: string[] = [];
    page.on('pageerror', err => logs.push(err.message));

    await page.goto('/');
    await waitForSpa(page);

    await page.click('a[href="/funciones"], a:has-text("Funciones")');
    await waitForSpa(page);
    const funcUrl = page.url();
    const funcContent = await page.locator('#q-app').innerHTML().catch(() => '');
    console.log(`Funciones: url=${funcUrl} content=${funcContent.length}`);

    // Go back to landing
    await page.goto('/');
    await waitForSpa(page);
    const homeContent = await page.locator('#q-app').innerHTML().catch(() => '');
    console.log(`Landing: content=${homeContent.length}`);
    console.log(`Page errors: ${logs.length > 0 ? logs.join('; ') : 'none'}`);

    expect(funcContent.length).toBeGreaterThan(50);
    expect(homeContent.length).toBeGreaterThan(50);
  });
});
