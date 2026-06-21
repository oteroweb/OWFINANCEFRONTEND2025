# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: debug-real-user.spec.ts >> Real user navigation debug >> Click to funciones then back to landing
- Location: e2e/debug-real-user.spec.ts:59:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('a:has-text("Funciones")')

```

# Page snapshot

```yaml
- generic [active]:
  - generic:
    - generic: v1.0.22
    - generic [ref=e2]:
      - generic [ref=e3]: "404"
      - generic [ref=e4]: Oops. Nothing here...
      - link "Go Home" [ref=e5] [cursor=pointer]:
        - /url: /
        - generic [ref=e7]: Go Home
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | const BASE = 'https://owfinances.com';
  4  | 
  5  | test.describe('Real user navigation debug', () => {
  6  |   test('Full flow: load landing → click Planes → check what happens', async ({ page }) => {
  7  |     const logs: string[] = [];
  8  |     page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  9  |     page.on('pageerror', err => logs.push(`[PAGE_ERROR] ${err.message}`));
  10 | 
  11 |     await page.goto(`${BASE}/app/`, { waitUntil: 'networkidle' });
  12 |     await page.waitForTimeout(2000);
  13 |     
  14 |     console.log('=== STEP 1: Landing loaded ===');
  15 |     console.log(`URL: ${page.url()}`);
  16 |     console.log(`Logs so far: ${logs.filter(l => l.includes('error') || l.includes('Error')).join('; ') || 'none'}`);
  17 | 
  18 |     const landingContent = await page.locator('#q-app').innerHTML().catch(() => 'EMPTY');
  19 |     console.log(`Landing #q-app length: ${landingContent.length}`);
  20 | 
  21 |     await page.click('a:has-text("Planes")');
  22 |     await page.waitForTimeout(3000);
  23 | 
  24 |     console.log('\n=== STEP 2: After clicking Planes ===');
  25 |     console.log(`URL: ${page.url()}`);
  26 |     
  27 |     const planesContent = await page.locator('#q-app').innerHTML().catch(() => 'EMPTY');
  28 |     console.log(`Planes #q-app length: ${planesContent.length}`);
  29 |     console.log(`Planes first 300 chars: ${planesContent.substring(0, 300)}`);
  30 | 
  31 |     const allErrors = logs.filter(l => l.includes('[error]') || l.includes('[PAGE_ERROR]'));
  32 |     console.log(`\nAll errors: ${allErrors.length > 0 ? allErrors.join('\n') : 'none'}`);
  33 | 
  34 |     expect(planesContent.length).toBeGreaterThan(50);
  35 |   });
  36 | 
  37 |   test('Direct load /app/planes with full logging', async ({ page }) => {
  38 |     const logs: string[] = [];
  39 |     page.on('console', msg => logs.push(`[${msg.type()}] ${msg.text()}`));
  40 |     page.on('pageerror', err => logs.push(`[PAGE_ERROR] ${err.message}`));
  41 | 
  42 |     await page.goto(`${BASE}/app/planes`, { waitUntil: 'networkidle' });
  43 |     await page.waitForTimeout(3000);
  44 | 
  45 |     console.log(`URL: ${page.url()}`);
  46 |     const content = await page.locator('#q-app').innerHTML().catch(() => 'EMPTY');
  47 |     console.log(`#q-app length: ${content.length}`);
  48 |     console.log(`#q-app first 500: ${content.substring(0, 500)}`);
  49 | 
  50 |     const errors = logs.filter(l => l.includes('[error]') || l.includes('[PAGE_ERROR]'));
  51 |     console.log(`Errors: ${errors.length > 0 ? errors.join('\n') : 'none'}`);
  52 | 
  53 |     const vueWarnings = logs.filter(l => l.includes('warn') || l.includes('[Vue]'));
  54 |     console.log(`Vue warnings: ${vueWarnings.length > 0 ? vueWarnings.join('\n') : 'none'}`);
  55 |     
  56 |     expect(content.length).toBeGreaterThan(50);
  57 |   });
  58 | 
  59 |   test('Click to funciones then back to landing', async ({ page }) => {
  60 |     const logs: string[] = [];
  61 |     page.on('pageerror', err => logs.push(err.message));
  62 | 
  63 |     await page.goto(`${BASE}/app/`, { waitUntil: 'networkidle' });
  64 |     await page.waitForTimeout(1500);
  65 |     
> 66 |     await page.click('a:has-text("Funciones")');
     |                ^ Error: page.click: Test timeout of 30000ms exceeded.
  67 |     await page.waitForTimeout(2000);
  68 |     const funcUrl = page.url();
  69 |     const funcContent = await page.locator('#q-app').innerHTML().catch(() => '');
  70 |     console.log(`Funciones: url=${funcUrl} content=${funcContent.length}`);
  71 | 
  72 |     await page.click('a:has-text("OW Finance")');
  73 |     await page.waitForTimeout(2000);
  74 |     const homeUrl = page.url();
  75 |     const homeContent = await page.locator('#q-app').innerHTML().catch(() => '');
  76 |     console.log(`Back home: url=${homeUrl} content=${homeContent.length}`);
  77 |     
  78 |     console.log(`Page errors: ${logs.length > 0 ? logs.join('; ') : 'none'}`);
  79 |     
  80 |     expect(funcContent.length).toBeGreaterThan(50);
  81 |     expect(homeContent.length).toBeGreaterThan(50);
  82 |   });
  83 | });
  84 | 
```