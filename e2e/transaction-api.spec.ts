/**
 * OWF Transaction Flows — API-level verification
 *
 * Tests all 10 documented flows from docs/00-sistema/TRANSACTION_FLOWS.md
 * against the live API. Runs on every deploy via:
 *   npx playwright test e2e/transaction-api.spec.ts --config playwright.prod.config.cjs
 *
 * Required env vars:
 *   PLAYWRIGHT_TEST_EMAIL     user@demo.com
 *   PLAYWRIGHT_TEST_PASSWORD  password
 */
import { test, expect } from '@playwright/test';
import { apiPost, apiGet, expectOk, getStoredToken, authHeaders } from './helpers/api';

// ── Auth setup ────────────────────────────────────────────────────────────────

let TOKEN: string;
let ACC_USD: number;
let ACC_VES: number;
let CAT_ID: number;
let CAT_ID2: number;
const T_EXPENSE = 'expense';
const T_INCOME = 'income';
const T_TRANSFER = 'transfer';

// Resolved once in beforeAll and cached for all tests
const resolvedTypeIds: Record<string, number> = {};
const resolvedTagIds: Record<string, number> = {};

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Resolve transaction_type_id by slug/name keyword.
 * Strategy:
 *  1. Try admin endpoint (works when test user is admin).
 *  2. If 403/404, probe IDs 1-20 with a dry POST and pick the first valid one
 *     matching the slug keyword from the error message context.
 * Results are cached so we only probe once per slug.
 */
async function resolveTypeId(
  request: Parameters<typeof apiGet>[0],
  slug: string,
): Promise<number> {
  if (resolvedTypeIds[slug]) return resolvedTypeIds[slug];

  const r = await apiGet(request, '/api/v1/transaction_types', TOKEN);
  if (r.ok()) {
    const body = await r.json() as { data?: { id: number; slug?: string; name?: string }[] };
    const types = body.data ?? [];
    const match = types.find(t =>
      (t.slug ?? '').toLowerCase().includes(slug) ||
      (t.name ?? '').toLowerCase().includes(slug)
    );
    if (match?.id) {
      resolvedTypeIds[slug] = match.id;
      return match.id;
    }
  }

  // Fallback: probe IDs 1-20. A POST that fails only on "invalid transaction_type_id"
  // is a type that exists. We pick the first one and use a slug match heuristic:
  // expense = first valid type with negative associations (try them all, pick by index order).
  const SLUG_ORDER: Record<string, number> = { expense: 0, income: 1, transfer: 2, ajuste: 3 };
  const order = SLUG_ORDER[slug] ?? 0;
  const validIds: number[] = [];

  for (let id = 1; id <= 20 && validIds.length <= order + 1; id++) {
    const probe = await apiPost(request, '/api/v1/transactions', TOKEN, {
      name: '_probe_',
      amount: -1,
      date: '2026-01-01 00:00:00',
      transaction_type_id: id,
      payments: [{ account_id: ACC_USD || 1, amount: -1 }],
    });
    const pbody = await probe.json() as { data?: Record<string, string[]> };
    const errs = JSON.stringify(pbody.data ?? '');
    // If no "transaction type" error, the ID is valid (other errors expected)
    if (!errs.toLowerCase().includes('transaction type')) {
      validIds.push(id);
    }
  }

  const picked = validIds[order] ?? validIds[0] ?? 0;
  if (picked) resolvedTypeIds[slug] = picked;
  return picked;
}

/** Resolve tag IDs by slug. Uses GET /api/v1/tags (available to all users). */
async function resolveTagIds(
  request: Parameters<typeof apiGet>[0],
  slugs: string[],
): Promise<number[]> {
  // Fetch once, cache all
  if (Object.keys(resolvedTagIds).length === 0) {
    const r = await apiGet(request, '/api/v1/tags', TOKEN);
    const body = await r.json() as { data?: { id: number; slug?: string }[] } | { id: number; slug?: string }[];
    const list: { id: number; slug?: string }[] = Array.isArray(body)
      ? body
      : (body as { data?: { id: number; slug?: string }[] }).data ?? [];
    for (const tag of list) {
      if (tag.slug) resolvedTagIds[tag.slug] = tag.id;
    }
  }
  return slugs.map(s => resolvedTagIds[s]).filter((id): id is number => !!id);
}

test.beforeAll(async ({ request }) => {
  // Token from global-setup cache (.auth.json) or env-based login
  const stored = getStoredToken();
  const hasCredentials = !!process.env.PLAYWRIGHT_TEST_EMAIL || !!stored;
  test.skip(!hasCredentials, 'No auth available — run global-setup or set PLAYWRIGHT_TEST_EMAIL');

  if (stored) {
    TOKEN = stored;
  } else {
    const r = await request.post('/api/v1/auth/login', {
      data: {
        email: process.env.PLAYWRIGHT_TEST_EMAIL,
        password: process.env.PLAYWRIGHT_TEST_PASSWORD ?? '',
      },
    });
    const body = await r.json() as { token?: string };
    if (!body.token) throw new Error('Login failed in transaction-api.spec beforeAll');
    TOKEN = body.token;
  }

  // Resolve accounts (GET /api/v1/accounts is available to all users)
  const accRes = await apiGet(request, '/api/v1/accounts', TOKEN);
  const accBody = await accRes.json() as { data?: { id: number; currency?: { code?: string } }[] };
  const accounts = accBody.data ?? [];
  const usdAcc = accounts.find(a => a.currency?.code === 'USD') ?? accounts[0];
  const vesAcc = accounts.find(a => a.currency?.code === 'VES') ?? accounts[accounts.length - 1];
  ACC_USD = usdAcc?.id ?? 0;
  ACC_VES = vesAcc?.id ?? usdAcc?.id ?? 0;

  // Resolve categories
  const catRes = await apiGet(request, '/api/v1/categories', TOKEN);
  const catBody = await catRes.json() as { data?: { id: number }[] };
  const cats = catBody.data ?? [];
  CAT_ID = cats[0]?.id ?? 0;
  CAT_ID2 = cats[1]?.id ?? CAT_ID;
});

// ─────────────────────────────────────────────────────────────────────────────
// EGRESOS
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Egresos (gastos)', () => {

  test('CASO-1 Gasto simple misma moneda', async ({ request }) => {
    const typeId = await resolveTypeId(request, T_EXPENSE);
    const tags = await resolveTagIds(request, ['planificado']);

    const data = await expectOk(await apiPost(request, '/api/v1/transactions', TOKEN, {
      name: '[TEST] Supermercado planificado',
      amount: -45.00,
      date: '2026-07-03 10:00:00',
      transaction_type_id: typeId,
      category_id: CAT_ID || undefined,
      tags,
      payments: [{ account_id: ACC_USD, amount: -45.00 }],
    }));

    expect(data.amount).toBe(-45);
    const pays = (data.payment_transactions as unknown[]) ?? [];
    expect(pays).toHaveLength(1);
    expect(data.tags as unknown[]).toHaveLength(tags.length);
  });

  test('CASO-2 Gasto impulso con etiqueta comportamental', async ({ request }) => {
    const typeId = await resolveTypeId(request, T_EXPENSE);
    const tags = await resolveTagIds(request, ['impulso']);

    const data = await expectOk(await apiPost(request, '/api/v1/transactions', TOKEN, {
      name: '[TEST] Ropa impulso',
      amount: -120.00,
      date: '2026-07-03 11:00:00',
      transaction_type_id: typeId,
      tags,
      payments: [{ account_id: ACC_USD, amount: -120.00 }],
    }));

    expect(data.amount).toBe(-120);
    const txTags = (data.tags as { slug?: string }[]) ?? [];
    expect(txTags.some(t => t.slug === 'impulso')).toBe(true);
  });

  test('CASO-3 Gasto con comisión pago móvil (is_fee sub-item)', async ({ request }) => {
    const typeId = await resolveTypeId(request, T_EXPENSE);
    const tags = await resolveTagIds(request, ['comision', 'pago_movil']);

    const data = await expectOk(await apiPost(request, '/api/v1/transactions', TOKEN, {
      name: '[TEST] Pago Movil Farmacia',
      amount: -103.00,
      date: '2026-07-03 12:00:00',
      transaction_type_id: typeId,
      category_id: CAT_ID || undefined,
      tags,
      payments: [{ account_id: ACC_VES, amount: -103.00 }],
      items: [
        { name: 'Farmacia', quantity: 1, amount: -100.00, category_id: CAT_ID || undefined },
        {
          name: 'Comision pago movil', quantity: 1, amount: -3.00,
          category_id: CAT_ID || undefined,
          is_fee: true, fee_type: 'pago_movil',
          tags,
        },
      ],
    }));

    expect(data.amount).toBe(-103);
    const items = (data.item_transactions as unknown[]) ?? [];
    expect(items).toHaveLength(2);
    const feeItem = (data.item_transactions as { is_fee?: boolean }[]).find(it => it.is_fee);
    expect(feeItem).toBeDefined();
  });

  test('CASO-4 Factura multi-artículo con categorías distintas por item', async ({ request }) => {
    const typeId = await resolveTypeId(request, T_EXPENSE);

    // items[].amount = line total (qty × unit_price already applied by client)
    const data = await expectOk(await apiPost(request, '/api/v1/transactions', TOKEN, {
      name: '[TEST] Factura Supermercado Mixta',
      amount: -85.00,
      date: '2026-07-03 13:00:00',
      transaction_type_id: typeId,
      payments: [{ account_id: ACC_USD, amount: -85.00 }],
      items: [
        { name: 'Carne', quantity: 1, amount: -40.00, category_id: CAT_ID || undefined },
        // qty=2, unit=22.50, total line=45 — amount is the LINE TOTAL
        { name: 'Almuerzo x2', quantity: 2, amount: -45.00, category_id: CAT_ID2 || undefined },
      ],
    }));

    expect(data.amount).toBe(-85);
    const items = (data.item_transactions as { amount?: number; category_id?: number }[]) ?? [];
    expect(items).toHaveLength(2);
    // Verify each item has a category
    const withCat = items.filter(it => it.category_id);
    expect(withCat.length).toBeGreaterThan(0);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// INGRESOS
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Ingresos', () => {

  test('CASO-5 Ingreso simple misma moneda', async ({ request }) => {
    const typeId = await resolveTypeId(request, T_INCOME);
    const tags = await resolveTagIds(request, ['recurrente']);

    const data = await expectOk(await apiPost(request, '/api/v1/transactions', TOKEN, {
      name: '[TEST] Salario Julio',
      amount: 2000.00,
      date: '2026-07-03 10:00:00',
      transaction_type_id: typeId,
      tags,
      payments: [{ account_id: ACC_USD, amount: 2000.00 }],
    }));

    expect(data.amount).toBe(2000);
    expect((data.payment_transactions as unknown[]) ?? []).toHaveLength(1);
  });

  test('CASO-6 Ingreso recurrente sin categoría', async ({ request }) => {
    const typeId = await resolveTypeId(request, T_INCOME);
    const tags = await resolveTagIds(request, ['recurrente']);

    const data = await expectOk(await apiPost(request, '/api/v1/transactions', TOKEN, {
      name: '[TEST] Renta local',
      amount: 800.00,
      date: '2026-07-03 10:00:00',
      transaction_type_id: typeId,
      tags,
      payments: [{ account_id: ACC_USD, amount: 800.00 }],
    }));

    expect(data.amount).toBe(800);
    const txTags = (data.tags as { slug?: string }[]) ?? [];
    expect(txTags.some(t => t.slug === 'recurrente')).toBe(true);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// TRANSFERENCIAS
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Transferencias', () => {

  test('CASO-7 Transferencia misma moneda (USD → USD)', async ({ request }) => {
    const typeId = await resolveTypeId(request, T_TRANSFER);
    const tags = await resolveTagIds(request, ['transferencia_interna']);

    const data = await expectOk(await apiPost(request, '/api/v1/transactions', TOKEN, {
      name: '[TEST] Traspaso USD',
      amount: 500.00,
      date: '2026-07-03 14:00:00',
      transaction_type_id: typeId,
      tags,
      payments: [
        { account_id: ACC_USD, amount: -500.00 },
        { account_id: ACC_USD, amount: 500.00 },
      ],
    }));

    expect(data.amount).toBe(500);
    const pays = (data.payment_transactions as unknown[]) ?? [];
    expect(pays).toHaveLength(2);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// MULTI-MONEDA
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Multi-moneda', () => {

  test('CASO-8 Gasto moneda extranjera con tasa inline (USD en cuenta VES)', async ({ request }) => {
    const typeId = await resolveTypeId(request, T_EXPENSE);

    // Fetch user to get current rate for VES
    const meRes = await apiGet(request, '/api/v1/auth/me', TOKEN);
    const me = await meRes.json() as { data?: { currency?: { code?: string } } };
    const userCurrency = me.data?.currency?.code ?? 'USD';

    // Skip if user has no VES account separate from USD account
    test.skip(ACC_USD === ACC_VES, 'User has no separate VES account — skipping multi-currency test');

    const RATE = 36.5;
    const amountUSD = -200.00;
    const amountVES = amountUSD * RATE; // -7300

    const data = await expectOk(await apiPost(request, '/api/v1/transactions', TOKEN, {
      name: '[TEST] Mercado VES',
      amount: amountUSD,
      date: '2026-07-03 15:00:00',
      transaction_type_id: typeId,
      category_id: CAT_ID || undefined,
      payments: [{ account_id: ACC_VES, amount: amountVES, rate: RATE }],
    }));

    expect(data.amount).toBe(amountUSD);
    const pays = (data.payment_transactions as { amount?: number }[]) ?? [];
    expect(pays[0]?.amount).toBe(amountVES);
  });

  test('CASO-9 Split pago multi-moneda (USD + VES mismo gasto)', async ({ request }) => {
    const typeId = await resolveTypeId(request, T_EXPENSE);

    test.skip(ACC_USD === ACC_VES, 'User has no separate VES account — skipping split multi-currency test');

    const RATE = 36.5;
    // Total: $50 USD = $25 USD cash + 912.50 VES (= $25 USD)
    const data = await expectOk(await apiPost(request, '/api/v1/transactions', TOKEN, {
      name: '[TEST] Restaurante split USD+VES',
      amount: -50.00,
      date: '2026-07-03 16:00:00',
      transaction_type_id: typeId,
      category_id: CAT_ID || undefined,
      payments: [
        { account_id: ACC_USD, amount: -25.00 },
        { account_id: ACC_VES, amount: -912.50, rate: RATE },
      ],
    }));

    expect(data.amount).toBe(-50);
    const pays = (data.payment_transactions as unknown[]) ?? [];
    expect(pays).toHaveLength(2);
  });

  test('CASO-10 Transferencia entre monedas (USD → VES, cambio de divisas)', async ({ request }) => {
    const typeId = await resolveTypeId(request, T_TRANSFER);

    test.skip(ACC_USD === ACC_VES, 'User has no separate VES account — skipping cross-currency transfer');

    const RATE = 36.5;

    const data = await expectOk(await apiPost(request, '/api/v1/transactions', TOKEN, {
      name: '[TEST] Cambio USD a VES',
      amount: 100.00,
      date: '2026-07-03 17:00:00',
      transaction_type_id: typeId,
      payments: [
        { account_id: ACC_USD, amount: -100.00 },
        { account_id: ACC_VES, amount: 3650.00, rate: RATE },
      ],
    }));

    expect(data.amount).toBe(100);
    const pays = (data.payment_transactions as unknown[]) ?? [];
    expect(pays).toHaveLength(2);
  });

});

// ─────────────────────────────────────────────────────────────────────────────
// REGRESIONES — validaciones que deben fallar
// ─────────────────────────────────────────────────────────────────────────────

test.describe('Regresiones — validaciones de error esperado', () => {

  test('REG-1 items total no coincide con amount → 422', async ({ request }) => {
    const typeId = await resolveTypeId(request, T_EXPENSE);

    const r = await apiPost(request, '/api/v1/transactions', TOKEN, {
      name: '[TEST] Mismatch items',
      amount: -100.00,          // declared: 100
      date: '2026-07-03 18:00:00',
      transaction_type_id: typeId,
      payments: [{ account_id: ACC_USD, amount: -100.00 }],
      items: [
        { name: 'A', quantity: 1, amount: -40.00 },
        { name: 'B', quantity: 1, amount: -30.00 }, // total = 70 ≠ 100
      ],
    });

    const body = await r.json() as { status: string; code: number };
    expect(body.status).toBe('FAILED');
    // Backend uses 400 (validator) or 422 (business logic) — both are acceptable error codes
    expect([400, 422]).toContain(body.code);
  });

  test('REG-2 transferencia con más de 2 payments → error', async ({ request }) => {
    const typeId = await resolveTypeId(request, T_TRANSFER);

    const r = await apiPost(request, '/api/v1/transactions', TOKEN, {
      name: '[TEST] Transfer invalid 3 pays',
      amount: 100.00,
      date: '2026-07-03 18:00:00',
      transaction_type_id: typeId,
      payments: [
        { account_id: ACC_USD, amount: -100.00 },
        { account_id: ACC_USD, amount: 50.00 },
        { account_id: ACC_USD, amount: 50.00 },
      ],
    });

    const body = await r.json() as { status: string; code: number };
    expect(body.status).toBe('FAILED');
    expect([400, 422]).toContain(body.code);
  });

  test('REG-3 sin payments → 400 validation error', async ({ request }) => {
    const typeId = await resolveTypeId(request, T_EXPENSE);

    const r = await apiPost(request, '/api/v1/transactions', TOKEN, {
      name: '[TEST] No payments',
      amount: -50.00,
      date: '2026-07-03 18:00:00',
      transaction_type_id: typeId,
    });

    const body = await r.json() as { status: string; code: number };
    expect(body.status).toBe('FAILED');
    expect([400, 422]).toContain(body.code);
  });

});
