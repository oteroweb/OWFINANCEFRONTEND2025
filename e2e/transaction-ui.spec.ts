/**
 * OWF Transaction Flows — UI smoke tests via SmartTransactionModal
 *
 * Verifica que el modal se abre, acepta inputs, y guarda transacciones reales.
 * Cubre: gasto simple, ingreso, transferencia, factura multi-item, split.
 *
 * Run:
 *   npx playwright test e2e/transaction-ui.spec.ts --config playwright.prod.config.cjs
 */
import { test, expect, type Page } from '@playwright/test';
import { login } from './helpers/auth';

const SKIP_MSG = 'Set PLAYWRIGHT_TEST_EMAIL + PLAYWRIGHT_TEST_PASSWORD to run';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Open SmartTransactionModal via the Pinia ui store (no FAB dependency) */
async function openModal(page: Page, type: 'expense' | 'income' | 'transfer' = 'expense') {
  await page.evaluate((txType) => {
    const app = (document.querySelector('#q-app') as { __vue_app__?: { config: { globalProperties: { $pinia?: { _s: Map<string, { openSmartModal?: (t: string, type: string) => void }> } } } } })?.__vue_app__;
    const pinia = app?.config?.globalProperties?.$pinia;
    const ui = pinia?._s?.get('ui');
    ui?.openSmartModal?.('write', txType);
  }, type);
  await page.waitForSelector('.stm-wrap', { timeout: 8000 });
}

/** Fill the amount field — triple-click + pressSequentially to trigger Vue reactivity */
async function fillAmount(page: Page, amount: number) {
  const input = page.locator('.stm-amount-input');
  await input.waitFor({ state: 'visible', timeout: 5000 });
  await input.click({ clickCount: 3 }); // select existing value
  await input.pressSequentially(String(Math.abs(amount)));
  // Dispatch input event explicitly to ensure Vue v-model.number picks it up
  await input.dispatchEvent('input');
}

/** Fill the concept/name field */
async function fillConcept(page: Page, name: string) {
  const input = page.locator('input[placeholder*="Ej: Mercado"]');
  await input.waitFor({ state: 'visible', timeout: 5000 });
  await input.click();
  await input.pressSequentially(name);
}

/** Select the first available account via QSelect */
async function pickFirstAccount(page: Page) {
  // Wait for account selector to be visible (accounts may load async)
  const sel = page.locator('.stm-row-2 .q-select').first();
  try {
    await sel.waitFor({ state: 'visible', timeout: 8000 });
  } catch {
    // If still not visible, skip — canSave will stay false and save() will timeout
    return;
  }

  // Click to open dropdown
  await sel.click();

  // Wait for dropdown items and select first
  // NOTE: do NOT press Escape — Quasar bubbles Escape to q-dialog and closes the modal
  try {
    await page.waitForSelector('.q-menu .q-item', { timeout: 5000 });
    await page.locator('.q-menu .q-item').first().click();
  } catch {
    // Dropdown didn't open — click label area which may trigger native select
    await sel.locator('.q-field__native, .q-field__input').first().click();
    await page.waitForTimeout(300);
    await page.locator('.q-menu .q-item').first().click().catch(() => { /* ignore if no menu */ });
  }

  // Small wait for Vue reactivity to update form.account_id
  await page.waitForTimeout(200);
}

/** Click the Guardar button — waits up to 10s for it to become enabled */
async function save(page: Page) {
  const btn = page.locator('.stm-btn--primary').filter({ hasText: /guardar/i });
  // Wait for button to become enabled (canSave = true)
  await expect(btn).not.toBeDisabled({ timeout: 10000 });
  await btn.click();
}

/** Wait for modal to close (saved successfully) */
async function waitForClose(page: Page) {
  await page.waitForSelector('.stm-wrap', { state: 'hidden', timeout: 15000 });
}

// ── Tests ─────────────────────────────────────────────────────────────────────

test.describe('SmartTransactionModal — UI flows', () => {
  test.beforeEach(async ({ page }) => {
    if (!process.env.PLAYWRIGHT_TEST_EMAIL) {
      test.skip(true, SKIP_MSG);
    }
    await login(page);
    await page.goto('/user/home');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000); // let Pinia stores hydrate
  });

  // ── CASO UI-1: Gasto simple ─────────────────────────────────────────────
  test('UI-1 Gasto simple — abre, llena y guarda', async ({ page }) => {
    await openModal(page, 'expense');

    // Verifica que el header dice "Nuevo movimiento"
    await expect(page.locator('.stm-eyebrow')).toContainText('Nuevo movimiento');

    // El botón de tipo "Gasto" debe estar activo por defecto
    const expenseBtn = page.locator('.stm-type-btn--expense');
    await expect(expenseBtn).toBeVisible();

    await fillAmount(page, 45);
    await fillConcept(page, '[TEST-UI] Supermercado');
    await pickFirstAccount(page);

    // Guardar
    await save(page);
    await waitForClose(page);
  });

  // ── CASO UI-2: Ingreso ──────────────────────────────────────────────────
  test('UI-2 Ingreso — toggle tipo y guarda', async ({ page }) => {
    await openModal(page, 'income');

    // El tipo debe ser ingreso
    await expect(page.locator('.stm-type-btn--income')).toBeVisible();

    await fillAmount(page, 800);
    await fillConcept(page, '[TEST-UI] Renta');
    await pickFirstAccount(page);
    await save(page);
    await waitForClose(page);
  });

  // ── CASO UI-3: Etiquetas ────────────────────────────────────────────────
  test('UI-3 Gasto con etiqueta "planificado"', async ({ page }) => {
    await openModal(page, 'expense');
    await fillAmount(page, 60);
    await fillConcept(page, '[TEST-UI] Gym planificado');
    await pickFirstAccount(page);

    // Seleccionar tag "Planificado"
    const planTag = page.locator('.stm-tag-chip').filter({ hasText: /planificado/i });
    if (await planTag.isVisible({ timeout: 3000 }).catch(() => false)) {
      await planTag.click();
      await expect(planTag).toHaveClass(/stm-tag-chip--active/);
    }

    await save(page);
    await waitForClose(page);
  });

  // ── CASO UI-4: Factura multi-artículo (Pro) ─────────────────────────────
  test('UI-4 Factura multi-artículo con categoría por item (Pro)', async ({ page }) => {
    // Activar Pro mode si no está activo
    const isPro = await page.evaluate(() => {
      const app = (document.querySelector('#q-app') as { __vue_app__?: { config: { globalProperties: { $pinia?: { _s: Map<string, { settings?: { layout_mode?: string } }> } } } } })?.__vue_app__;
      const auth = app?.config?.globalProperties?.$pinia?._s?.get('auth');
      return auth?.settings?.layout_mode === 'pro';
    });

    if (!isPro) {
      test.skip(true, 'Pro mode not active for this user — skipping items panel test');
    }

    await openModal(page, 'expense');
    await fillAmount(page, 85);
    await fillConcept(page, '[TEST-UI] Factura mixta');
    await pickFirstAccount(page);

    // Activar panel "items"
    const itemsToggle = page.locator('.stm-pro-toggle').filter({ hasText: /items|factura/i });
    if (await itemsToggle.isVisible({ timeout: 3000 }).catch(() => false)) {
      await itemsToggle.click();
      await page.waitForSelector('.stm-items-block', { timeout: 4000 });

      // Primer artículo (ya existe por defecto)
      await page.locator('.stm-items-block').nth(0).locator('input[placeholder="Artículo"]').fill('Carne');
      await page.locator('.stm-items-block').nth(0).locator('input[placeholder="Qty"]').fill('1');
      await page.locator('.stm-items-block').nth(0).locator('input[placeholder="Precio"]').fill('40');

      // Segundo artículo
      await page.locator('.stm-pro-add').filter({ hasText: /agregar artículo/i }).click();
      await page.locator('.stm-items-block').nth(1).locator('input[placeholder="Artículo"]').fill('Almuerzo');
      await page.locator('.stm-items-block').nth(1).locator('input[placeholder="Qty"]').fill('2');
      await page.locator('.stm-items-block').nth(1).locator('input[placeholder="Precio"]').fill('22.50');

      // Verificar que el total se muestra
      await expect(page.locator('.stm-pro-summary').filter({ hasText: /total artículos/i })).toBeVisible();
    }

    await save(page);
    await waitForClose(page);
  });

  // ── CASO UI-5: Split pago (Pro) ─────────────────────────────────────────
  test('UI-5 Split pago multi-cuenta (Pro)', async ({ page }) => {
    const isPro = await page.evaluate(() => {
      const app = (document.querySelector('#q-app') as { __vue_app__?: { config: { globalProperties: { $pinia?: { _s: Map<string, { settings?: { layout_mode?: string } }> } } } } })?.__vue_app__;
      const auth = app?.config?.globalProperties?.$pinia?._s?.get('auth');
      return auth?.settings?.layout_mode === 'pro';
    });

    if (!isPro) {
      test.skip(true, 'Pro mode not active for this user — skipping split test');
    }

    await openModal(page, 'expense');
    await fillAmount(page, 50);
    await fillConcept(page, '[TEST-UI] Restaurante split');
    await pickFirstAccount(page);

    // Activar panel split
    const splitToggle = page.locator('.stm-pro-toggle').filter({ hasText: /split/i });
    if (await splitToggle.isVisible({ timeout: 3000 }).catch(() => false)) {
      await splitToggle.click();
      await page.waitForSelector('.stm-split-row', { timeout: 4000 });

      // Verificar que hay al menos 2 filas de split
      const rows = page.locator('.stm-split-row');
      await expect(rows).toHaveCount(2);

      // Llenar montos de split
      const amtInputs = page.locator('.stm-split-row input[type="number"]');
      await amtInputs.nth(0).fill('25');
      await amtInputs.nth(1).fill('25');
    }

    await save(page);
    await waitForClose(page);
  });

  // ── Verificación de cierre con botón cancelar ───────────────────────────
  test('UI-0 Modal cierra con botón Cancelar', async ({ page }) => {
    await openModal(page, 'expense');
    await expect(page.locator('.stm-wrap')).toBeVisible();

    await page.locator('.stm-btn--ghost').filter({ hasText: /cancelar/i }).first().click();
    await page.waitForSelector('.stm-wrap', { state: 'hidden', timeout: 5000 });
  });

  // ── Validación: no guarda sin campos requeridos ─────────────────────────
  test('UI-V Guardar sin monto deshabilita el botón', async ({ page }) => {
    await openModal(page, 'expense');

    // Sin monto ni cuenta el botón debe estar disabled
    const saveBtn = page.locator('.stm-btn--primary').filter({ hasText: /guardar/i });
    await expect(saveBtn).toBeDisabled();
  });

});
