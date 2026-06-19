/* ─── OW Finance Mobile — Data & Seeds ───────────────────────────────────
 * RN: Move to a dedicated /src/data/ folder or a mock API layer.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

/* Cada movimiento se imputa a una cuenta (acctId → MOBILE_ACCOUNTS) y a un
 * período (m: 0-11, y). En LITE el acctId se ignora (billetera única);
 * en PRO habilita el filtro por cuenta y la conversión multimoneda. */
const MOBILE_TX = [
  { id: 1, label: 'Nómina · Freelance',       amount:  3200.00, day: 'Hoy · Mar 14',  time: '09:02', category: 'Ingreso',       acctId: 1, m: 2, y: 2026 },
  { id: 2, label: 'Whole Foods Market',         amount:   -84.12, day: 'Hoy · Mar 14',  time: '14:42', category: 'Supermercado',  acctId: 1, m: 2, y: 2026 },
  { id: 3, label: 'Uber · viaje aeropuerto',    amount:   -32.60, day: 'Hoy · Mar 14',  time: '06:18', category: 'Transporte',    acctId: 4, m: 2, y: 2026, commission: { type: 'pagomovil', value: 0.30, amount: 0.10, currency: 'USD' } },
  { id: 4, label: 'Spotify Family',             amount:   -16.99, day: 'Ayer · Mar 13', time: '',      category: 'Suscripciones', acctId: 5, m: 2, y: 2026 },
  { id: 5, label: 'Transfer → Jar Vacaciones',  amount:  -200.00, day: 'Ayer · Mar 13', time: '',      category: 'Jar',           acctId: 2, m: 2, y: 2026, commission: { type: 'fija', value: 0.50, amount: 0.50, currency: 'USD' } },
  { id: 9, label: 'Cashea · Cuota 3/6 iPhone',  amount:  -148.50, day: 'Ayer · Mar 13', time: '',      category: 'Deuda',         acctId: 6, m: 2, y: 2026 },
  { id:10, label: 'Aporte → Sueño Casa propia', amount:  -500.00, day: 'Ayer · Mar 13', time: '',      category: 'Sueño',         acctId: 2, m: 2, y: 2026 },
  { id: 6, label: 'Factura freelance #042',     amount:   720.00, day: 'Dom · Mar 12',  time: '',      category: 'Ingreso',       acctId: 1, m: 2, y: 2026 },
  { id: 7, label: 'Costco · compra mensual',    amount:  -184.30, day: 'Sáb · Mar 11',  time: '',      category: 'Supermercado',  acctId: 1, m: 2, y: 2026 },
  { id: 8, label: 'Renta · Marzo',              amount: -1450.00, day: 'Vie · Mar 10',  time: '',      category: 'Vivienda',      acctId: 1, m: 2, y: 2026 },
  /* Febrero — para que la navegación por mes muestre datos reales */
  { id:11, label: 'Nómina · Freelance',         amount:  3200.00, day: 'Vie · Feb 14',  time: '09:00', category: 'Ingreso',       acctId: 1, m: 1, y: 2026 },
  { id:12, label: 'Mercado · Mercantil',        amount:  -68.40,  day: 'Mié · Feb 12',  time: '',      category: 'Supermercado',  acctId: 4, m: 1, y: 2026 },
  { id:13, label: 'Renta · Febrero',            amount: -1450.00, day: 'Lun · Feb 10',  time: '',      category: 'Vivienda',      acctId: 1, m: 1, y: 2026 },
];

/* ─── Cuentas (multimoneda) — solo PRO ────────────────────────────────
 * LITE usa una billetera implícita única (sin selector de cuentas).
 * group: carpeta mental del usuario para el filtro inteligente.
 * RN: GET /accounts → mapear a esta forma.
 * ──────────────────────────────────────────────────────────────────── */
const MOBILE_ACCOUNTS = [
  { id: 1, name: 'BofA · Corriente', type: 'bank',   currency: 'USD', balance:  3420.50, last4: '4521', color: '#1E3A8A', group: 'Mis cuentas' },
  { id: 2, name: 'BofA · Ahorros',   type: 'bank',   currency: 'USD', balance: 12480.00, last4: '8830', color: '#2D4DA6', group: 'Mis cuentas' },
  { id: 3, name: 'Efectivo USD',     type: 'cash',   currency: 'USD', balance:   340.00,                 color: '#10B981', group: 'Mis cuentas' },
  { id: 4, name: 'Mercantil',        type: 'bank',   currency: 'VES', balance: 48500.00, last4: '1290', color: '#F59E0B', group: 'Venezolanas' },
  { id: 5, name: 'Visa · Crédito',   type: 'card',   currency: 'USD', balance: -1240.20, last4: '0072', color: '#EF4444', group: 'Tarjetas y deudas' },
  { id: 6, name: 'Cashea',           type: 'cashea', currency: 'VES', balance:  -626.00,                 color: '#8B5CF6', group: 'Tarjetas y deudas' },
];
const MOBILE_ACCOUNT_GROUPS = ['Mis cuentas', 'Venezolanas', 'Tarjetas y deudas'];

/* Tasas de cambio del usuario — USD es la base. 1 USD = N <moneda>.
 * Editables desde el widget de Tasas (Pro). RN: persistir por usuario. */
const MOBILE_RATES = { USD: 1, EUR: 0.92, VES: 40.50, COP: 3950, CLP: 945 };

/* ─── Deudas / Planes de pago ─────────────────────────────────────────
 * Espejo de SAMPLE_DEBTS (lite-desktop). Forma idéntica para reusar lógica.
 * provider: 'cashea' | 'card' | 'loan' | 'personal'
 * status  : 'on-track' | 'due-soon' | 'late' | 'paid'
 * paid/total = cuotas pagadas/totales (null en tarjetas revolventes)
 * RN: GET /debts → mapear a esta forma.
 * ──────────────────────────────────────────────────────────────────── */
const MOBILE_DEBTS = [
  { id: 'd1', name: 'iPhone 15 · Cashea',   provider: 'cashea',   merchant: 'Apple Store VE', balance:  445.50, original:  891.00, paid: 3,    total: 6,    nextDueDate: '28 Mar', nextDueAmount: 148.50, rate: '0% interés', status: 'on-track' },
  { id: 'd2', name: 'Lavadora LG · Cashea', provider: 'cashea',   merchant: 'Megastore',      balance:  180.00, original:  720.00, paid: 4,    total: 5,    nextDueDate: '02 Abr', nextDueAmount: 180.00, rate: '0% interés', status: 'due-soon' },
  { id: 'd3', name: 'Tarjeta Visa BofA',    provider: 'card',     merchant: 'Bank of America',balance: 2340.20, original: 4500.00, paid: null, total: null, nextDueDate: '15 Abr', nextDueAmount: 220.00, rate: 'TEA 28%',    status: 'on-track' },
  { id: 'd4', name: 'Préstamo personal',    provider: 'loan',     merchant: 'Banesco',        balance: 3850.00, original: 6000.00, paid: 7,    total: 18,   nextDueDate: '20 Mar', nextDueAmount: 195.00, rate: 'TEA 14%',    status: 'late' },
  { id: 'd5', name: 'Préstamo · Carlos M.', provider: 'personal', merchant: 'Familia',        balance:  200.00, original:  500.00, paid: 3,    total: 5,    nextDueDate: '01 Abr', nextDueAmount: 100.00, rate: 'Sin interés', status: 'on-track' },
];

/* ─── Sueños ──────────────────────────────────────────────────────────
 * Metas aspiracionales de largo plazo — más grandes y emocionales que jars.
 * tone: 'dream-primary' (violeta) | 'dream-secondary' (rosa)
 * eta = fecha estimada · monthly = aporte mensual sugerido
 * RN: GET /dreams → mapear a esta forma.
 * ──────────────────────────────────────────────────────────────────── */
const MOBILE_DREAMS = [
  { id: 's1', name: 'Casa propia',       subtitle: 'Inicial 20% · Caracas', icon: 'home',            amount: 18500.00, goal: 45000.00, progress: 41, eta: 'Dic 2027', monthly: 850.00,  contributors: 2, tone: 'dream-primary'   },
  { id: 's2', name: 'Maestría en Europa',subtitle: 'IE Business School',     icon: 'school',          amount:  7200.00, goal: 22000.00, progress: 33, eta: 'Sep 2026', monthly: 1200.00, contributors: 1, tone: 'dream-secondary' },
  { id: 's3', name: 'Auto eléctrico',    subtitle: 'Tesla Model 3',          icon: 'directions_car',  amount:  3400.00, goal: 12000.00, progress: 28, eta: 'Mar 2028', monthly: 320.00,  contributors: 1, tone: 'dream-primary'   },
  { id: 's4', name: 'Año sabático',      subtitle: 'Sudeste asiático',       icon: 'flight_takeoff',  amount:  1800.00, goal:  8000.00, progress: 22, eta: 'Ene 2027', monthly: 240.00,  contributors: 1, tone: 'dream-secondary' },
];

const MOBILE_JARS = [
  { id: 1, name: 'Emergencia',  amount: 4200.00, goal: 6800.00, progress: 62, tone: 'brand',  sub: 'Seguridad' },
  { id: 2, name: 'Vacaciones',  amount: 1820.00, goal: 2000.00, progress: 91, tone: 'income', sub: 'Lisboa · Verano' },
  { id: 3, name: 'Laptop',      amount:  980.00, goal: 2000.00, progress: 49, tone: 'brand',  sub: 'Compra Q3' },
  { id: 4, name: 'Salud',       amount: 1240.00, goal: 1240.00, progress:100, tone: 'income', sub: 'Seguro + meds' },
  { id: 5, name: 'Inactivo',    amount:  540.20, goal: 2200.00, progress: 24, tone: 'warn',   sub: 'Sugerido mover' },
  { id: 6, name: 'Regalos',     amount:  180.00, goal:  500.00, progress: 36, tone: 'brand',  sub: 'Fiestas' },
];

// AI chat seed conversation (matches screenshots)
const AI_SEED = [
  {
    id: 1, role: 'ai', time: '14:22',
    parts: [
      { text: '¡Hola! He revisado tus finanzas.\nTasa de ahorro: ', plain: true },
      { text: '42%', color: '#10B981' },
      { text: '. Sugiero redirigir ', plain: true },
      { text: '$50', color: '#0EA5E9' },
      { text: ' al jar de emergencia.', plain: true },
    ],
    ctas: ['Asignar $50', 'Detalles'],
  },
  { id: 2, role: 'user', time: '14:25', parts: [{ text: '¿Cómo pago mi tarjeta más rápido?', plain: true }] },
  {
    id: 3, role: 'ai', time: '14:26',
    parts: [
      { text: 'Según tu perfil freelancer: Usa ', plain: true },
      { text: 'método Avalancha', color: '#F59E0B' },
      { text: '. Esto minimizará los intereses acumulados rápidamente.', plain: true },
    ],
    ctas: ['Crear plan de pago'],
  },
];

const QUICK_REPLIES = ['Analiza gastos', 'Consejos', 'Próximos pagos', '¿Cuánto ahorré?'];

/* ─── Comisiones (Venezuela) — fija / pago móvil / porcentaje ──────────
 * Espejo del modelo desktop (finance-data.jsx). Se aplica a transferencias
 * y pagos. pagomovil = 0,30% P2P, mín. Bs 2 (BCV Gaceta 43.231, 10/2025).
 * ──────────────────────────────────────────────────────────────────── */
const MOBILE_COMMISSION_TYPES = [
  { id: 'fija',       label: 'Comisión fija', icon: 'push_pin',  hint: 'Monto fijo por operación' },
  { id: 'pagomovil',  label: 'Pago móvil',    icon: 'smartphone', hint: '0,30% · mín. Bs 2 · P2P (BCV)' },
  { id: 'porcentaje', label: 'Porcentaje',    icon: 'percent',   hint: '% del monto' },
];
const MOBILE_PAGOMOVIL_PCT = 0.30;
function mobileComputeCommission(kind, value, base) {
  const b = Math.abs(Number(base) || 0);
  const v = Number(value) || 0;
  if (kind === 'fija')       return v;
  if (kind === 'porcentaje') return b * v / 100;
  if (kind === 'pagomovil')  return b * MOBILE_PAGOMOVIL_PCT / 100;
  return 0;
}

Object.assign(window, { MOBILE_TX, MOBILE_JARS, MOBILE_DEBTS, MOBILE_DREAMS, MOBILE_ACCOUNTS, MOBILE_ACCOUNT_GROUPS, MOBILE_RATES, AI_SEED, QUICK_REPLIES, MOBILE_COMMISSION_TYPES, MOBILE_PAGOMOVIL_PCT, mobileComputeCommission });
