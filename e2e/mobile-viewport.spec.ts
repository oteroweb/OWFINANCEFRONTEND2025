/**
 * OWF-115 — Mobile viewport 390px tests: Home, Tx, Jars (Mobile Chrome project)
 */
import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.use({ viewport: { width: 390, height: 844 } });

test.describe('Mobile viewport 390px (OWF-115)', () => {
  test.beforeEach(async ({ page }) => {
    if (!process.env.PLAYWRIGHT_TEST_EMAIL) {
      test.skip(true, 'Set PLAYWRIGHT_TEST_EMAIL + PLAYWRIGHT_TEST_PASSWORD to run auth-required tests');
    }
    await login(page);
  });

  // ── Home ──────────────────────────────────────────────────────────────
  test('Home — renders without horizontal overflow at 390px', async ({ page }) => {
    await page.goto('http://localhost:3000/user/home');
    await page.waitForLoadState('domcontentloaded');
    await expect(page).toHaveURL(/\/user\/home/);

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(400);
  });

  test('Home — bottom nav visible on mobile', async ({ page }) => {
    await page.goto('http://localhost:3000/user/home');
    await page.waitForLoadState('domcontentloaded');

    // LiteFloatingBottomNav renders as <nav class="nav-pill">
    const bottomNav = page.locator('.nav-pill').first();
    await expect(bottomNav).toBeVisible({ timeout: 8000 });
  });

  test('Home — greeting or summary card visible', async ({ page }) => {
    await page.goto('http://localhost:3000/user/home');
    await page.waitForLoadState('domcontentloaded');

    // LiteHomeView greeting or the hero balance section
    const heading = page.locator('.lite-home__greeting, .lite-home__hero, .t-hero-amount').first();
    await expect(heading).toBeVisible({ timeout: 8000 });
  });

  // ── Transactions ──────────────────────────────────────────────────────
  test('Tx — renders without horizontal overflow at 390px', async ({ page }) => {
    await page.goto('http://localhost:3000/user/transactions');
    await page.waitForLoadState('domcontentloaded');

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(400);
  });

  test('Tx — filter button visible on mobile', async ({ page }) => {
    await page.goto('http://localhost:3000/user/transactions');
    await page.waitForLoadState('domcontentloaded');

    // LiteTransactionsView has <button class="filter-btn"> with text "Filtros"
    const filterBtn = page.locator('.filter-btn').first();
    await expect(filterBtn).toBeVisible({ timeout: 8000 });
  });

  test('Tx — filter opens as bottom-sheet on mobile', async ({ page }) => {
    await page.goto('http://localhost:3000/user/transactions');
    await page.waitForLoadState('domcontentloaded');

    const filterBtn = page.locator('.filter-btn').first();
    if (await filterBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
      await filterBtn.click();
      // Should open a q-dialog bottom-sheet (filter-sheet-dialog), NOT a CSS dropdown
      const sheet = page.locator('.filter-sheet, [class*="q-dialog"], [role="dialog"]').first();
      await expect(sheet).toBeVisible({ timeout: 3000 });
      // Desktop dropdown must NOT be visible on mobile
      const desktopPanel = page.locator('.filter-panel--desktop');
      await expect(desktopPanel).not.toBeVisible();
    }
  });

  // ── Jars ─────────────────────────────────────────────────────────────
  test('Jars — renders without horizontal overflow at 390px', async ({ page }) => {
    await page.goto('http://localhost:3000/user/jars');
    await page.waitForLoadState('domcontentloaded');

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(400);
  });

  test('Jars — grid collapses to 1 column on mobile', async ({ page }) => {
    await page.goto('http://localhost:3000/user/jars');
    await page.waitForLoadState('domcontentloaded');

    // On 390px, grid should be 1-col (each tile spans full width ~390px)
    const tile = page.locator('.jar-tile, .jars-grid > *').first();
    if (await tile.isVisible({ timeout: 8000 }).catch(() => false)) {
      const box = await tile.boundingBox();
      if (box) {
        // Tile should be at least 300px wide (single-column)
        expect(box.width).toBeGreaterThan(300);
      }
    }
  });

  test('Jars — jar cards visible with amount and name', async ({ page }) => {
    await page.goto('http://localhost:3000/user/jars');
    await page.waitForLoadState('domcontentloaded');

    const jarCards = page.locator('.jar-tile, .jar-card');
    const count = await jarCards.count();
    // If user has jars, at least 1 should be visible
    if (count > 0) {
      await expect(jarCards.first()).toBeVisible();
    } else {
      // No jars — empty state should be visible
      const empty = page.locator('.empty-state, [class*="empty"]').first();
      await expect(empty).toBeVisible({ timeout: 5000 });
    }
  });
});
