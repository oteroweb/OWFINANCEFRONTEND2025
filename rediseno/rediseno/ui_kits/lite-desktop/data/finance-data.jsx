/* ─── Finance domain data — modeled on OWFINANCE 2026 backend ────────────
 * Mirrors the real model: accounts (multi-currency), categories,
 * transaction types, taxes (IGTF / Pago Móvil / IVA), providers, and
 * user exchange rates (current/official).
 * Source of truth: docs/02-backend/endpoints/transaction-payloads.md,
 *                  docs/producto/CUENTAS_Y_TRANSACCIONES.md
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

/* Transaction types (transaction_types) */
const TX_TYPES = [
  { slug: 'income',   id: 1, label: 'Ingreso',       icon: 'arrow_downward', color: 'var(--income)',  sign: +1 },
  { slug: 'expense',  id: 2, label: 'Gasto',         icon: 'arrow_outward',  color: 'var(--expense)', sign: -1 },
  { slug: 'transfer', id: 3, label: 'Transferencia', icon: 'swap_horiz',     color: '#8B5CF6',        sign:  0 },
  { slug: 'ajuste',   id: 5, label: 'Ajuste',        icon: 'tune',           color: 'var(--warning)', sign:  0 },
];

/* Account types (account_types) */
const ACCOUNT_TYPES = {
  bank:   { label: 'Banco',    icon: 'account_balance' },
  card:   { label: 'Tarjeta',  icon: 'credit_card' },
  cash:   { label: 'Efectivo', icon: 'payments' },
  cashea: { label: 'Cashea',   icon: 'shopping_bag' },
};

/* Currencies */
const CURRENCIES = {
  USD: { code: 'USD', symbol: '$',   name: 'Dólar',  flag: '🇺🇸' },
  EUR: { code: 'EUR', symbol: '€',   name: 'Euro',   flag: '🇪🇺' },
  VES: { code: 'VES', symbol: 'Bs.', name: 'Bolívar',flag: '🇻🇪' },
};

/* User exchange rates — USD is the user's base currency.
 * current = la tasa "actual" del usuario; official = tasa oficial (BCV). */
const DEFAULT_RATES = {
  USD: { current: 1,    official: 1 },
  EUR: { current: 0.92, official: 0.93 },
  VES: { current: 40.50, official: 36.80 },
};

/* Accounts (accounts) — PRO only. LITE uses an implicit single wallet.
 * `group` clusters accounts into the user's mental folders (Mis cuentas,
 * Venezolanas, Tarjetas y deudas) for the account filter widget. */
const SAMPLE_ACCOUNTS = [
  { id: 1, name: 'BofA · Corriente', short: 'BofA', type: 'bank',   currency: 'USD', balance: 3420.50,  last4: '4521', color: '#1E3A8A', group: 'Mis cuentas' },
  { id: 2, name: 'BofA · Ahorros',   short: 'BofA', type: 'bank',   currency: 'USD', balance: 12480.00, last4: '8830', color: '#2D4DA6', group: 'Mis cuentas' },
  { id: 3, name: 'Efectivo USD',     short: 'EFE',  type: 'cash',   currency: 'USD', balance: 340.00,                  color: '#10B981', group: 'Mis cuentas' },
  { id: 4, name: 'Mercantil',        short: 'MER',  type: 'bank',   currency: 'VES', balance: 48500.00, last4: '1290', color: '#F59E0B', group: 'Venezolanas' },
  { id: 5, name: 'Visa · Crédito',   short: 'VISA', type: 'card',   currency: 'USD', balance: -1240.20, last4: '0072', color: '#EF4444', group: 'Tarjetas y deudas' },
  { id: 6, name: 'Cashea',           short: 'CSH',  type: 'cashea', currency: 'VES', balance: -626.00,                 color: '#8B5CF6', group: 'Tarjetas y deudas' },
];

/* Folder order for the account filter widget */
const ACCOUNT_GROUPS = ['Mis cuentas', 'Venezolanas', 'Tarjetas y deudas'];

/* Accounts grouped into folders, in ACCOUNT_GROUPS order */
const accountsByGroup = () => ACCOUNT_GROUPS
  .map(g => ({ group: g, accounts: SAMPLE_ACCOUNTS.filter(a => a.group === g) }))
  .filter(x => x.accounts.length);

/* LITE implicit wallet (hidden in UI; the only account in LITE) */
const LITE_WALLET = { id: 0, name: 'Billetera', type: 'cash', currency: 'USD', balance: 4280.50 };

/* Categories (categories) — clasificación común desde el catálogo único.
 * Fuente: tx-catalog.js (window.OWF_CATEGORIES). Cada categoría declara su
 * jarId; el cántaro entra anclado a la categoría (nunca se elige a mano). */
const SAMPLE_CATEGORIES = (typeof window !== 'undefined' && window.OWF_CATEGORIES) ? window.OWF_CATEGORIES : [
  { id: 1,  name: 'Vivienda',       icon: 'home',            jarId: 'j1' },
  { id: 2,  name: 'Supermercado',   icon: 'shopping_cart',   jarId: 'j1' },
  { id: 10, name: 'Otros',          icon: 'category',        jarId: 'j5' },
];

/* Taxes (taxes) — applies_to: item | payment | both */
const SAMPLE_TAXES = [
  { id: 10, name: 'IVA 16%',          rate: 16,   applies_to: 'item',    kind: 'percent' },
  { id: 11, name: 'IGTF 3%',          rate: 3,    applies_to: 'payment', kind: 'percent' },
  { id: 12, name: 'Comisión P. Móvil',rate: 0.30, applies_to: 'payment', kind: 'percent' },
];

/* Providers (providers) */
const SAMPLE_PROVIDERS = [
  { id: 1, name: 'Whole Foods Market' },
  { id: 2, name: 'Uber' },
  { id: 3, name: 'Netflix' },
  { id: 4, name: 'Farmatodo' },
  { id: 5, name: 'Cliente · ACME Corp' },
  { id: 6, name: 'Apple Store VE' },
  { id: 7, name: 'Megastore' },
];

/* ─── Comisiones (Venezuela) ──────────────────────────────────────────
 * Modelo de comisión que se aplica a una transacción (transferencia/pago).
 * Tres modos reales del mercado venezolano:
 *   fija       → monto fijo por operación (ej. Bs 8 por transferencia)
 *   pagomovil  → P2P: 0,30% del monto, mín. Bs 2 (BCV Gaceta 43.231, 10/2025)
 *   porcentaje → % del monto (ej. P2C hasta 1,5%, comercio 2%)
 * RN: persistir como { type, value, amount } dentro del payload.
 * ──────────────────────────────────────────────────────────────────── */
const COMMISSION_TYPES = [
  { id: 'fija',       label: 'Comisión fija', icon: 'push_pin',  hint: 'Monto fijo por operación' },
  { id: 'pagomovil',  label: 'Pago móvil',    icon: 'smartphone', hint: '0,30% · mín. Bs 2 · P2P (BCV)' },
  { id: 'porcentaje', label: 'Porcentaje',    icon: 'percent',   hint: '% del monto' },
];
const PAGOMOVIL_PCT = 0.30;        // % P2P aprobado (BCV)
const PAGOMOVIL_MIN_VES = 2;       // mínimo Bs por operación

/* Calcula el monto de comisión en la MISMA moneda que `base`. */
function computeCommission(kind, value, base) {
  const b = Math.abs(Number(base) || 0);
  const v = Number(value) || 0;
  if (kind === 'fija')       return v;
  if (kind === 'porcentaje') return b * v / 100;
  if (kind === 'pagomovil')  return b * PAGOMOVIL_PCT / 100;
  return 0;
}

Object.assign(window, {
  TX_TYPES, ACCOUNT_TYPES, CURRENCIES, DEFAULT_RATES,
  SAMPLE_ACCOUNTS, ACCOUNT_GROUPS, accountsByGroup,
  LITE_WALLET, SAMPLE_CATEGORIES, SAMPLE_TAXES, SAMPLE_PROVIDERS,
  COMMISSION_TYPES, PAGOMOVIL_PCT, PAGOMOVIL_MIN_VES, computeCommission,
});
