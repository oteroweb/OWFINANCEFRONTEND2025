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

/* Accounts (accounts) — PRO only. LITE uses an implicit single wallet. */
const SAMPLE_ACCOUNTS = [
  { id: 1, name: 'BofA · Corriente', type: 'bank',   currency: 'USD', balance: 3420.50, last4: '4521', color: '#1E3A8A' },
  { id: 2, name: 'BofA · Ahorros',   type: 'bank',   currency: 'USD', balance: 12480.00, last4: '8830', color: '#2D4DA6' },
  { id: 3, name: 'Efectivo USD',     type: 'cash',   currency: 'USD', balance: 340.00,                  color: '#10B981' },
  { id: 4, name: 'Mercantil',        type: 'bank',   currency: 'VES', balance: 48500.00, last4: '1290', color: '#F59E0B' },
  { id: 5, name: 'Visa · Crédito',   type: 'card',   currency: 'USD', balance: -1240.20, last4: '0072', color: '#EF4444' },
  { id: 6, name: 'Cashea',           type: 'cashea', currency: 'VES', balance: -626.00,                 color: '#8B5CF6' },
];

/* LITE implicit wallet (hidden in UI; the only account in LITE) */
const LITE_WALLET = { id: 0, name: 'Billetera', type: 'cash', currency: 'USD', balance: 4280.50 };

/* Categories (categories) — operational classification for jars/budget */
const SAMPLE_CATEGORIES = [
  { id: 1,  name: 'Vivienda',       icon: 'home',            jarId: 'j1' },
  { id: 2,  name: 'Supermercado',   icon: 'shopping_cart',   jarId: 'j1' },
  { id: 3,  name: 'Servicios',      icon: 'bolt',            jarId: 'j1' },
  { id: 4,  name: 'Transporte',     icon: 'directions_car',  jarId: 'j1' },
  { id: 5,  name: 'Salud',          icon: 'favorite',        jarId: 'j1' },
  { id: 6,  name: 'Restaurantes',   icon: 'restaurant',      jarId: 'j2' },
  { id: 7,  name: 'Entretenimiento',icon: 'sports_esports',  jarId: 'j2' },
  { id: 8,  name: 'Educación',      icon: 'school',          jarId: 'j4' },
  { id: 9,  name: 'Ingresos',       icon: 'payments',        jarId: null },
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

Object.assign(window, {
  TX_TYPES, ACCOUNT_TYPES, CURRENCIES, DEFAULT_RATES,
  SAMPLE_ACCOUNTS, LITE_WALLET, SAMPLE_CATEGORIES, SAMPLE_TAXES, SAMPLE_PROVIDERS,
});
