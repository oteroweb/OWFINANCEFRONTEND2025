# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: lite-shell.spec.ts >> Lite Desktop Shell >> can navigate between routes via nav pill
- Location: e2e/lite-shell.spec.ts:48:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[type="email"]')

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
  3  | /**
  4  |  * OW Finance — E2E Tests for Lite Desktop Shell
  5  |  * Tests the new Design System shell (header, nav pill, navigation)
  6  |  */
  7  | 
  8  | test.describe('Lite Desktop Shell', () => {
  9  |   test.beforeEach(async ({ page }) => {
  10 |     // Navigate to the app
  11 |     await page.goto('http://localhost:3000/app/');
  12 |   });
  13 | 
  14 |   test('login page loads', async ({ page }) => {
  15 |     await expect(page).toHaveTitle(/OwFinance/);
  16 |     await expect(page.locator('body')).toContainText('Iniciar sesión');
  17 |   });
  18 | 
  19 |   test('can login and see Lite shell', async ({ page }) => {
  20 |     // Fill login form (adjust selectors based on your login page)
  21 |     await page.fill('input[type="email"]', 'test@example.com');
  22 |     await page.fill('input[type="password"]', 'password');
  23 |     await page.click('button[type="submit"]');
  24 | 
  25 |     // Wait for navigation to home
  26 |     await page.waitForURL(/\/user\/home/);
  27 | 
  28 |     // Verify Lite shell elements are present
  29 |     await expect(page.locator('.lite-header')).toBeVisible();
  30 |     await expect(page.locator('.lite-nav')).toBeVisible();
  31 |   });
  32 | 
  33 |   test('nav pill has 7 items + quick add', async ({ page }) => {
  34 |     // Login first
  35 |     await page.fill('input[type="email"]', 'test@example.com');
  36 |     await page.fill('input[type="password"]', 'password');
  37 |     await page.click('button[type="submit"]');
  38 |     await page.waitForURL(/\/user\/home/);
  39 | 
  40 |     // Count nav items
  41 |     const navItems = page.locator('.lite-nav__item');
  42 |     await expect(navItems).toHaveCount(7);
  43 | 
  44 |     // Verify quick add button exists
  45 |     await expect(page.locator('.lite-nav__quick')).toBeVisible();
  46 |   });
  47 | 
  48 |   test('can navigate between routes via nav pill', async ({ page }) => {
> 49 |     await page.fill('input[type="email"]', 'test@example.com');
     |                ^ Error: page.fill: Test timeout of 30000ms exceeded.
  50 |     await page.fill('input[type="password"]', 'password');
  51 |     await page.click('button[type="submit"]');
  52 |     await page.waitForURL(/\/user\/home/);
  53 | 
  54 |     // Click on Transactions
  55 |     await page.click('.lite-nav__item:has-text("Movs")');
  56 |     await page.waitForURL(/\/user\/transactions/);
  57 | 
  58 |     // Click on Jars
  59 |     await page.click('.lite-nav__item:has-text("Cántaros")');
  60 |     await page.waitForURL(/\/user\/jars/);
  61 | 
  62 |     // Click on Config
  63 |     await page.click('.lite-nav__item:has-text("Ajustes")');
  64 |     await page.waitForURL(/\/user\/config/);
  65 |   });
  66 | 
  67 |   test('expanded menu opens from avatar', async ({ page }) => {
  68 |     await page.fill('input[type="email"]', 'test@example.com');
  69 |     await page.fill('input[type="password"]', 'password');
  70 |     await page.click('button[type="submit"]');
  71 |     await page.waitForURL(/\/user\/home/);
  72 | 
  73 |     // Click avatar
  74 |     await page.click('.lite-header__avatar');
  75 |     await expect(page.locator('.expanded-menu')).toBeVisible();
  76 |   });
  77 | });
  78 | 
  79 | test.describe('Redesign Static HTML', () => {
  80 |   test('Lite Desktop kit loads', async ({ page }) => {
  81 |     await page.goto('http://localhost:3000/Redesign/ui_kits/lite-desktop/index.html');
  82 |     await expect(page.locator('body')).toBeVisible();
  83 |   });
  84 | });
  85 | 
```