import { test, expect } from '@playwright/test';
import { login } from './helpers/auth';

test.describe('Design System tokens — DS-01..04', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('navy primary token is applied', async ({ page }) => {
    const primary = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--brand-primary').trim()
    );
    expect(primary).toBe('#1e3a8a');
  });

  test('DM Sans body font is loaded', async ({ page }) => {
    const fontBody = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--font-body').trim()
    );
    expect(fontBody).toContain('DM Sans');
  });

  test('Satoshi display font token is set', async ({ page }) => {
    const fontDisplay = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--font-display').trim()
    );
    expect(fontDisplay).toContain('Satoshi');
  });

  test('surface tokens exist', async ({ page }) => {
    const surface1 = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--surface-1').trim()
    );
    expect(surface1).toBeTruthy();
  });

  test('spacing tokens exist', async ({ page }) => {
    const space4 = await page.evaluate(() =>
      getComputedStyle(document.documentElement).getPropertyValue('--space-4').trim()
    );
    expect(space4).toBeTruthy();
  });

  test('no glassmorphism on main layout (Lite desktop)', async ({ page }) => {
    // body background should be flat (no gradient)
    const bodyBg = await page.evaluate(() =>
      getComputedStyle(document.body).backgroundImage
    );
    expect(bodyBg).toBe('none');
  });
});
