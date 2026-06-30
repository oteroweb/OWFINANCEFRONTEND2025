/* global React */

/* ─── Cántaros (Jars) — plantilla real 55/10/10/10/10 ─────────────────
 * Método Harv Eker. El usuario reparte el 100% del ingreso.
 * type:'percent' → recibe % del ingreso · base all_income.
 * id se usa para imputar gastos/ítems a cántaros en el formulario.
 * ──────────────────────────────────────────────────────────────────── */
const SAMPLE_JARS = [
  { id: 'j1', name: 'Necesidades básicas', subtitle: '55% del ingreso', percent: 55, type: 'percent', icon: 'home',        color: '#1E3A8A', amount: 1815.00, progress: 68, goalText: '$ 2,668', statusText: '68% usado', tone: 'brand' },
  { id: 'j2', name: 'Diversión',           subtitle: '10% del ingreso', percent: 10, type: 'percent', icon: 'celebration', color: '#F59E0B', amount: 132.00,  progress: 73, goalText: '$ 485',   statusText: '73% usado', tone: 'warn' },
  { id: 'j3', name: 'Ahorro',              subtitle: '10% del ingreso', percent: 10, type: 'percent', icon: 'savings',     color: '#10B981', amount: 2940.00, progress: 100,goalText: '$ 5,000', statusText: 'Meta 59%',  tone: 'income' },
  { id: 'j4', name: 'Educación',           subtitle: '10% del ingreso', percent: 10, type: 'percent', icon: 'school',      color: '#0EA5E9', amount: 410.00,  progress: 42, goalText: '$ 485',   statusText: '42% usado', tone: 'brand' },
  { id: 'j5', name: 'Reservas',            subtitle: '10% del ingreso', percent: 10, type: 'percent', icon: 'shield',      color: '#8B5CF6', amount: 1260.00, progress: 31, goalText: '$ 485',   statusText: 'Acumula',   tone: 'brand' },
];

/* Cada transacción se imputa a un cántaro (jar) además de su categoría.
 * jar:null = sin cántaro (ingresos). jarColor refleja SAMPLE_JARS. */
const SAMPLE_TX = [
  { label: 'Sueldo · ACME Corp',         meta: 'Hoy · 26 May · 9:02',  amount:  3200.00, day: 'Hoy · lun 26 May',  category: 'Ingresos',        jar: null,                  jarColor: null,      acctId: 1 },
  { label: 'Whole Foods Market',         meta: 'Hoy · 26 May · 14:42', amount:   -84.12, day: 'Hoy · lun 26 May',  category: 'Supermercado',    jar: 'Necesidades básicas', jarColor: '#1E3A8A', acctId: 5 },
  { label: 'Uber · al aeropuerto',       meta: 'Hoy · 26 May · 6:18',  amount:   -32.60, day: 'Hoy · lun 26 May',  category: 'Transporte',      jar: 'Necesidades básicas', jarColor: '#1E3A8A', acctId: 3, commission: { type: 'pagomovil', value: 0.30, amount: 0.10, currency: 'USD' } },
  { label: 'Netflix',                    meta: 'dom 25 May',           amount:   -16.99, day: 'dom 25 May',        category: 'Entretenimiento', jar: 'Diversión',           jarColor: '#F59E0B', acctId: 5 },
  { label: 'Cashea · Cuota 3/6 iPhone',  meta: 'dom 25 May',           amount:  -148.50, day: 'dom 25 May',        category: 'Deuda',           jar: 'Necesidades básicas', jarColor: '#1E3A8A', acctId: 6 },
  { label: 'Aporte → Sueño Casa propia', meta: 'dom 25 May',           amount:  -500.00, day: 'dom 25 May',        category: 'Sueño',           jar: 'Ahorro',              jarColor: '#10B981', acctId: 2 },
  { label: 'Aporte → Cántaro Ahorro',    meta: 'dom 25 May',           amount:  -200.00, day: 'dom 25 May',        category: 'Cántaro',         jar: 'Ahorro',              jarColor: '#10B981', acctId: 2 },
  { label: 'Freelance · factura 042',    meta: 'sáb 24 May',           amount:   720.00, day: 'sáb 24 May',        category: 'Ingresos',        jar: null,                  jarColor: null,      acctId: 1 },
  { label: 'Farmatodo · mensual',        meta: 'sáb 24 May',           amount:  -116.00, day: 'sáb 24 May',        category: 'Salud',           jar: 'Necesidades básicas', jarColor: '#1E3A8A', acctId: 4, commission: { type: 'fija', value: 0.50, amount: 0.50, currency: 'USD' } },
  { label: 'Alquiler · mayo',            meta: 'vie 23 May',           amount: -1450.00, day: 'vie 23 May',        category: 'Vivienda',        jar: 'Necesidades básicas', jarColor: '#1E3A8A', acctId: 1 },
];

/* ─── Deudas / Planes de pago ─────────────────────────────────────────
 * provider: 'cashea' | 'card' | 'loan' | 'personal'
 * paid / total : cuotas pagadas / totales
 * nextDue : próxima cuota
 * status  : 'on-track' | 'due-soon' | 'late' | 'paid'
 * ──────────────────────────────────────────────────────────────────── */
const SAMPLE_DEBTS = [
  {
    id: 'd1',
    name: 'iPhone 15 · Cashea',
    provider: 'cashea',
    merchant: 'Apple Store VE',
    balance: 445.50,
    original: 891.00,
    paid: 3, total: 6,
    nextDueDate: '28 Mar',
    nextDueAmount: 148.50,
    rate: '0% interés',
    status: 'on-track',
  },
  {
    id: 'd2',
    name: 'Lavadora LG · Cashea',
    provider: 'cashea',
    merchant: 'Megastore',
    balance: 180.00,
    original: 720.00,
    paid: 4, total: 5,
    nextDueDate: '02 Abr',
    nextDueAmount: 180.00,
    rate: '0% interés',
    status: 'due-soon',
  },
  {
    id: 'd3',
    name: 'Tarjeta Visa BofA',
    provider: 'card',
    merchant: 'Bank of America',
    balance: 2340.20,
    original: 4500.00,
    paid: null, total: null,
    nextDueDate: '15 Abr',
    nextDueAmount: 220.00,
    rate: 'TEA 28%',
    status: 'on-track',
  },
  {
    id: 'd4',
    name: 'Préstamo personal',
    provider: 'loan',
    merchant: 'Banesco',
    balance: 3850.00,
    original: 6000.00,
    paid: 7, total: 18,
    nextDueDate: '20 Mar',
    nextDueAmount: 195.00,
    rate: 'TEA 14%',
    status: 'late',
  },
  {
    id: 'd5',
    name: 'Préstamo · Carlos M.',
    provider: 'personal',
    merchant: 'Familia',
    balance: 200.00,
    original: 500.00,
    paid: 3, total: 5,
    nextDueDate: '01 Abr',
    nextDueAmount: 100.00,
    rate: 'Sin interés',
    status: 'on-track',
  },
];

/* ─── Sueños ──────────────────────────────────────────────────────────
 * Aspirational long-term goals — bigger, more emotional than jars.
 * eta : "Sep 2027"
 * monthly : aporte mensual sugerido
 * ──────────────────────────────────────────────────────────────────── */
const SAMPLE_DREAMS = [
  {
    id: 's1',
    name: 'Casa propia',
    subtitle: 'Inicial 20% · Caracas',
    icon: 'home',
    amount: 18500.00,
    goal: 45000.00,
    progress: 41,
    eta: 'Dic 2027',
    monthly: 850.00,
    contributors: 2,
    tone: 'dream-primary',
  },
  {
    id: 's2',
    name: 'Maestría en Europa',
    subtitle: 'IE Business School',
    icon: 'school',
    amount: 7200.00,
    goal: 22000.00,
    progress: 33,
    eta: 'Sep 2026',
    monthly: 1200.00,
    contributors: 1,
    tone: 'dream-secondary',
  },
  {
    id: 's3',
    name: 'Auto eléctrico',
    subtitle: 'Tesla Model 3',
    icon: 'directions_car',
    amount: 3400.00,
    goal: 12000.00,
    progress: 28,
    eta: 'Mar 2028',
    monthly: 320.00,
    contributors: 1,
    tone: 'dream-primary',
  },
  {
    id: 's4',
    name: 'Año sabático',
    subtitle: 'Sudeste asiático',
    icon: 'flight_takeoff',
    amount: 1800.00,
    goal: 8000.00,
    progress: 22,
    eta: 'Ene 2027',
    monthly: 240.00,
    contributors: 1,
    tone: 'dream-secondary',
  },
];

/* ─── Usuario · perfil personal + perfil financiero ───────────────────
 * profile  → datos de identidad que el usuario rellena (onboarding/Perfil).
 * finance  → personalización financiera (cómo presupuesta, metas, alertas).
 *            budgetStyle define el reparto de cántaros (% por jar).
 * onboarding → estado de los pasos post-creación de cuenta.
 * ──────────────────────────────────────────────────────────────────── */
const SAMPLE_USER = {
  profile: {
    initial: 'J',
    firstName: 'José',
    lastName: 'Otero',
    email: 'jose@owfinance.com',
    emailVerified: true,
    phone: '+58 412 555 0142',
    country: 'VE',
    city: 'Caracas',
    birthdate: '1994-03-12',
    occupation: 'Diseñador de producto',
    avatarUrl: null,
  },
  finance: {
    baseCurrency: 'USD',
    locale: 'es',
    monthlyIncome: 3200,
    incomeStability: 'variable',     // fija | variable | estacional
    budgetStyle: 'eker',             // eker (55/10/10/10/10) | 50-30-20 | custom
    riskAppetite: 'balanced',        // conservador | balanced | agresivo
    savingsRate: 20,                 // % objetivo de ahorro
    payday: 1,                       // día de pago (1–28)
    primaryGoalId: 's1',             // sueño prioritario
    alerts: { idleMoney: true, overBudget: true, weeklyDigest: true, billsDue: true },
  },
  onboarding: {
    completed: false,
    steps: ['welcome', 'profile', 'currency', 'accounts', 'jars', 'finprofile', 'firstmove'],
  },
};

/* Países disponibles para el perfil (subset; VE primero por mercado) */
const COUNTRY_OPTS = [
  { value: 'VE', label: 'Venezuela',     flag: '🇻🇪' },
  { value: 'CO', label: 'Colombia',      flag: '🇨🇴' },
  { value: 'MX', label: 'México',        flag: '🇲🇽' },
  { value: 'AR', label: 'Argentina',     flag: '🇦🇷' },
  { value: 'US', label: 'Estados Unidos',flag: '🇺🇸' },
  { value: 'ES', label: 'España',        flag: '🇪🇸' },
];

/* Estilos de presupuesto → reparto de cántaros (%) */
const BUDGET_STYLES = [
  { id: 'eker',   name: 'Método de los cántaros', desc: '55 · 10 · 10 · 10 · 10', icon: 'savings',
    split: [{ jarId: 'j1', percent: 55 }, { jarId: 'j2', percent: 10 }, { jarId: 'j3', percent: 10 }, { jarId: 'j4', percent: 10 }, { jarId: 'j5', percent: 10 }] },
  { id: '50-30-20', name: '50 / 30 / 20', desc: 'Necesidades · Gustos · Ahorro', icon: 'pie_chart',
    split: [{ jarId: 'j1', percent: 50 }, { jarId: 'j2', percent: 30 }, { jarId: 'j3', percent: 20 }] },
  { id: 'custom', name: 'Personalizado', desc: 'Define tus propios %', icon: 'tune', split: null },
];

Object.assign(window, { SAMPLE_JARS, SAMPLE_TX, SAMPLE_DEBTS, SAMPLE_DREAMS, SAMPLE_USER, COUNTRY_OPTS, BUDGET_STYLES });
