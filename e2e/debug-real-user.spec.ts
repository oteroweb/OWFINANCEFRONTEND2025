import { test, expect } from '@playwright/test';

const BASE = 'https://owfinances.com';

test.describe('Real user navigation debug', () => {
  test('Full flow: load landing → click Planes → check what happens', async ({ page }) => {
    const logs: string[] = [];
    page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
    page.on('pageerror', err => logs.push(`[PAGE_ERROR] ${err.message}`));

    await page.goto(`${BASE}/app/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);
    
    console.log('=== STEP 1: Landing loaded ===');
    console.log(`URL: ${page.url()}`);
    console.log(`Logs so far: ${logs.filter(l => l.includes('error') || l.includes('Error')).join('; ') || 'none'}`);

    const landingContent = await page.locator('#q-app').innerHTML().catch(() => 'EMPTY');
    console.log(`Landing #q-app length: ${landingContent.length}`);

    await page.click('a:has-text("Planes")');
    await page.waitForTimeout(3000);

    console.log('\n=== STEP 2: After clicking Planes ===');
    console.log(`URL: ${page.url()}`);
    
    const planesContent = await page.locator('#q-app').innerHTML().catch(() => 'EMPTY');
    console.log(`Planes #q-app length: ${planesContent.length}`);
    console.log(`Planes first 300 chars: ${planesContent.substring(0, 300)}`);

    const allErrors = logs.filter(l => l.includes('[error]') || l.includes('[PAGE_ERROR]'));
    console.log(`\nAll errors: ${allErrors.length > 0 ? allErrors.join('\n') : 'none'}`);

    expect(planesContent.length).toBeGreaterThan(50);
  });

  test('Direct load /app/planes with full logging', async ({ page }) => {
    const logs: string[] = [];
    page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
    page.on('pageerror', err => logs.push(`[PAGE_ERROR] ${err.message}`));

    await page.goto(`${BASE}/app/planes`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(3000);

    console.log(`URL: ${page.url()}`);
    const content = await page.locator('#q-app').innerHTML().catch(() => 'EMPTY');
    console.log(`#q-app length: ${content.length}`);
    console.log(`#q-app first 500: ${content.substring(0, 500)}`);

    const errors = logs.filter(l => l.includes('[error]') || l.includes('[PAGE_ERROR]'));
    console.log(`Errors: ${errors.length > 0 ? errors.join('\n') : 'none'}`);

    const vueWarnings = logs.filter(l => l.includes('warn') || l.includes('[Vue]'));
    console.log(`Vue warnings: ${vueWarnings.length > 0 ? vueWarnings.join('\n') : 'none'}`);
    
    expect(content.length).toBeGreaterThan(50);
  });

  test('Click to funciones then back to landing', async ({ page }) => {
    const logs: string[] = [];
    page.on('pageerror', err => logs.push(err.message));

    await page.goto(`${BASE}/app/`, { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    
    await page.click('a:has-text("Funciones")');
    await page.waitForTimeout(2000);
    const funcUrl = page.url();
    const funcContent = await page.locator('#q-app').innerHTML().catch(() => '');
    console.log(`Funciones: url=${funcUrl} content=${funcContent.length}`);

    await page.click('a:has-text("OW Finance")');
    await page.waitForTimeout(2000);
    const homeUrl = page.url();
    const homeContent = await page.locator('#q-app').innerHTML().catch(() => '');
    console.log(`Back home: url=${homeUrl} content=${homeContent.length}`);
    
    console.log(`Page errors: ${logs.length > 0 ? logs.join('; ') : 'none'}`);
    
    expect(funcContent.length).toBeGreaterThan(50);
    expect(homeContent.length).toBeGreaterThan(50);
  });
});
