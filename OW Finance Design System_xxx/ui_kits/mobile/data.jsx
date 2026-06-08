/* ─── OW Finance Mobile — Data & Seeds ───────────────────────────────────
 * RN: Move to a dedicated /src/data/ folder or a mock API layer.
 * ──────────────────────────────────────────────────────────────────────── */
/* global React */

const MOBILE_TX = [
  { id: 1, label: 'Nómina · Freelance',       amount:  3200.00, day: 'Hoy · Mar 14',  time: '09:02', category: 'Ingreso' },
  { id: 2, label: 'Whole Foods Market',         amount:   -84.12, day: 'Hoy · Mar 14',  time: '14:42', category: 'Supermercado' },
  { id: 3, label: 'Uber · viaje aeropuerto',    amount:   -32.60, day: 'Hoy · Mar 14',  time: '06:18', category: 'Transporte' },
  { id: 4, label: 'Spotify Family',             amount:   -16.99, day: 'Ayer · Mar 13', time: '',      category: 'Suscripciones' },
  { id: 5, label: 'Transfer → Jar Vacaciones',  amount:  -200.00, day: 'Ayer · Mar 13', time: '',      category: 'Jar' },
  { id: 6, label: 'Factura freelance #042',     amount:   720.00, day: 'Dom · Mar 12',  time: '',      category: 'Ingreso' },
  { id: 7, label: 'Costco · compra mensual',    amount:  -184.30, day: 'Sáb · Mar 11',  time: '',      category: 'Supermercado' },
  { id: 8, label: 'Renta · Marzo',              amount: -1450.00, day: 'Vie · Mar 10',  time: '',      category: 'Vivienda' },
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

Object.assign(window, { MOBILE_TX, MOBILE_JARS, AI_SEED, QUICK_REPLIES });
