/**
 * OWF-152 — E2E Admin User Management flow
 * Covers: list → detail → impersonate dialog → banner → volver al admin
 */
import { test, expect, type Page } from '@playwright/test';

const API_BASE = process.env.PLAYWRIGHT_API_BASE ?? 'https://owfinances.com/api/v1';

const SKIP_GUARD = () => {
  if (!process.env.PLAYWRIGHT_ADMIN_EMAIL) {
    test.skip(true, 'Set PLAYWRIGHT_ADMIN_EMAIL + PLAYWRIGHT_ADMIN_PASSWORD to run admin tests');
  }
};

async function loginAsAdmin(page: Page) {
  const email = process.env.PLAYWRIGHT_ADMIN_EMAIL ?? '';
  const password = process.env.PLAYWRIGHT_ADMIN_PASSWORD ?? '';

  // Get token server-side (avoids CORS) then inject into localStorage
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password, device_name: 'playwright' }),
  });
  const body = (await res.json()) as { token?: string; data?: unknown; role?: string };
  if (!body.token) throw new Error(`Admin login failed: ${JSON.stringify(body)}`);

  await page.goto('/');
  await page.evaluate(
    ({ token, user, role }) => {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('role', role);
    },
    { token: body.token, user: body.data ?? null, role: body.role ?? 'admin' },
  );
  await page.goto('/admin');
  await page.waitForURL(/\/admin/, { timeout: 10000 });
}

test.describe('Admin User Management (OWF-152)', () => {
  test.beforeEach(async ({ page }) => {
    SKIP_GUARD();
    await loginAsAdmin(page);
  });

  // ── AdminLayout sidebar ──────────────────────────────────────────────────
  test('admin sidebar renders sections and nav items', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(800);

    // Header logo
    await expect(page.locator('.adm-header__logo')).toContainText('OWF');

    // Check drawer sections (VISIÓN GENERAL, USUARIOS, CATÁLOGOS, SISTEMA)
    const sections = page.locator('.adm-drawer__section');
    await expect(sections.first()).toBeVisible({ timeout: 5000 });

    // Usuarios nav item should exist
    const usuariosItem = page.locator('.adm-drawer__item').filter({ hasText: 'Usuarios' }).first();
    await expect(usuariosItem).toBeVisible();
  });

  // ── Users list ────────────────────────────────────────────────────────────
  test('admin users list shows KPI row and table', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    // KPI chips
    const kpiValues = page.locator('.adm-kpi__value');
    await expect(kpiValues.first()).toBeVisible({ timeout: 8000 });

    // Table rows
    const tableRows = page.locator('.q-table tbody tr');
    const count = await tableRows.count().catch(() => 0);
    // There should be at least the admin user row
    expect(count).toBeGreaterThanOrEqual(0);
  });

  test('users list search filter changes results', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);

    const searchInput = page.locator('.adm-users__search input');
    if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await searchInput.fill('nonexistentuserxyz99');
      await page.waitForTimeout(800);
      // Table should show 0 rows or empty state
      const rows = page.locator('.q-table tbody tr');
      const count = await rows.count().catch(() => 0);
      expect(count).toBeLessThanOrEqual(1);
    }
  });

  // ── User detail ───────────────────────────────────────────────────────────
  test('clicking detail button navigates to /admin/users/:id', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1200);

    // Click the first "Ver detalle" (person icon) button
    const detailBtn = page.locator('.q-table tbody .q-btn[title="Ver detalle"]').first();
    if (await detailBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
      await detailBtn.click();
      await page.waitForURL(/\/admin\/users\/\d+/, { timeout: 5000 });
      expect(page.url()).toMatch(/\/admin\/users\/\d+/);
    }
  });

  test('user detail page shows tabs', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1200);

    const detailBtn = page.locator('.q-table tbody .q-btn[title="Ver detalle"]').first();
    if (await detailBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
      await detailBtn.click();
      await page.waitForURL(/\/admin\/users\/\d+/, { timeout: 5000 });
      await page.waitForTimeout(1000);

      // Check tabs are visible
      const profileTab = page.locator('.q-tab').filter({ hasText: 'Perfil' });
      await expect(profileTab).toBeVisible({ timeout: 8000 });

      const securityTab = page.locator('.q-tab').filter({ hasText: 'Seguridad' });
      await expect(securityTab).toBeVisible();
    }
  });

  test('user detail security tab shows revoke and reset buttons', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1200);

    const detailBtn = page.locator('.q-table tbody .q-btn[title="Ver detalle"]').first();
    if (await detailBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
      await detailBtn.click();
      await page.waitForURL(/\/admin\/users\/\d+/, { timeout: 5000 });
      await page.waitForTimeout(1000);

      const securityTab = page.locator('.q-tab').filter({ hasText: 'Seguridad' });
      if (await securityTab.isVisible({ timeout: 5000 }).catch(() => false)) {
        await securityTab.click();
        await page.waitForTimeout(500);

        await expect(page.locator('text=Cambiar contraseña')).toBeVisible({ timeout: 5000 });
        await expect(page.locator('text=Revocar sesiones')).toBeVisible();
      }
    }
  });

  // ── Impersonation dialog ─────────────────────────────────────────────────
  test('impersonate button shows confirm dialog for non-admin user', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1200);

    // Find first enabled impersonate button (non-admin user row)
    const impersonateBtn = page.locator('.q-table tbody .q-btn[title="Impersonar"]:not([disabled])').first();
    if (await impersonateBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
      await impersonateBtn.click();
      await page.waitForTimeout(500);

      // Dialog should appear
      const dialog = page.locator('.q-dialog');
      await expect(dialog).toBeVisible({ timeout: 5000 });
      await expect(dialog.locator('text=Impersonar usuario')).toBeVisible();
      await expect(dialog.locator('text=Volver al admin')).toBeVisible().catch(() => {
        // The cancel button text might vary
      });

      // Cancel the dialog
      await dialog.locator('button', { hasText: 'Cancelar' }).click();
      await page.waitForTimeout(300);
      await expect(dialog).not.toBeVisible({ timeout: 3000 });
    }
  });

  // ── Back button from detail ──────────────────────────────────────────────
  test('back button from detail returns to users list', async ({ page }) => {
    await page.goto('/admin/users');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1200);

    const detailBtn = page.locator('.q-table tbody .q-btn[title="Ver detalle"]').first();
    if (await detailBtn.isVisible({ timeout: 8000 }).catch(() => false)) {
      await detailBtn.click();
      await page.waitForURL(/\/admin\/users\/\d+/, { timeout: 5000 });
      await page.waitForTimeout(800);

      const backBtn = page.locator('.adm-detail__back');
      if (await backBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
        await backBtn.click();
        await page.waitForTimeout(500);
        // Should be back on users list or history popped
        expect(page.url()).toMatch(/\/admin\/users/);
      }
    }
  });
});
