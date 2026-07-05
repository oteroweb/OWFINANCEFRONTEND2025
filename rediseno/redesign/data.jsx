/* global window */
/* ─── Datos de demo (redesign Transacciones Pro) ──────────────────────
 * Mismo modelo que ui_kits/.../sample-data.jsx pero con id estable por fila
 * para soportar la selección múltiple. accent Pro = var(--info).
 * ──────────────────────────────────────────────────────────────────── */

/* Cántaros canónicos: derivados de la fuente única (tx-catalog.js → OWF_JARS).
 * Fallback inline por si el catálogo aún no cargó. JAR_CANON añade pct + short
 * + orden para el pool de CATEGORÍAS agrupado por cántaro. */
const _OWF_JARS = (typeof window !== 'undefined' && window.OWF_JARS) || [
  { name: 'Necesidades básicas', percent: 55, icon: 'home',        color: '#1E3A8A' },
  { name: 'Diversión',           percent: 10, icon: 'celebration', color: '#F59E0B' },
  { name: 'Ahorro',              percent: 10, icon: 'savings',     color: '#10B981' },
  { name: 'Educación',           percent: 10, icon: 'school',      color: '#0EA5E9' },
  { name: 'Reservas',            percent: 10, icon: 'shield',      color: '#8B5CF6' },
];
const JAR_META = {}, JAR_CANON = {};
_OWF_JARS.forEach((j, i) => {
  JAR_META[j.name]  = { color: j.color, icon: j.icon };
  JAR_CANON[j.name] = { color: j.color, icon: j.icon, pct: j.percent, short: j.name.toUpperCase(), order: i };
});

const CAT_ICON = {
  'Ingresos': 'payments', 'Supermercado': 'shopping_cart', 'Transporte': 'directions_bus',
  'Entretenimiento': 'movie', 'Deuda': 'credit_card', 'Sueño': 'auto_awesome',
  'Cántaro': 'savings', 'Salud': 'medical_services', 'Vivienda': 'home_work',
  'Restaurantes': 'restaurant', 'Servicios': 'bolt',
};

const TX = [
  { id: 't1',  label: 'Sueldo · ACME Corp',          meta: 'Hoy · 26 May · 9:02',  amount:  3200.00, day: 'Hoy · lun 26 May', category: 'Ingresos',        jar: null },
  { id: 't2',  label: 'Whole Foods Market',          meta: 'Hoy · 26 May · 14:42', amount:   -84.12, day: 'Hoy · lun 26 May', category: 'Supermercado',    jar: 'Necesidades básicas' },
  { id: 't3',  label: 'Uber · al aeropuerto',        meta: 'Hoy · 26 May · 6:18',  amount:   -32.60, day: 'Hoy · lun 26 May', category: 'Transporte',      jar: 'Necesidades básicas' },
  { id: 't4',  label: 'Café Arábica',                meta: 'Hoy · 26 May · 8:10',  amount:    -4.80, day: 'Hoy · lun 26 May', category: 'Restaurantes',    jar: 'Diversión' },
  { id: 't5',  label: 'Netflix',                     meta: 'dom 25 May',           amount:   -16.99, day: 'dom 25 May',       category: 'Entretenimiento', jar: 'Diversión' },
  { id: 't6',  label: 'Cashea · Cuota 3/6 iPhone',   meta: 'dom 25 May',           amount:  -148.50, day: 'dom 25 May',       category: 'Deuda',           jar: 'Necesidades básicas' },
  { id: 't7',  label: 'Aporte → Sueño Casa propia',  meta: 'dom 25 May',           amount:  -500.00, day: 'dom 25 May',       category: 'Sueño',           jar: 'Ahorro' },
  { id: 't8',  label: 'Aporte → Cántaro Ahorro',     meta: 'dom 25 May',           amount:  -200.00, day: 'dom 25 May',       category: 'Cántaro',         jar: 'Ahorro' },
  { id: 't9',  label: 'Spotify Familiar',            meta: 'dom 25 May',           amount:   -10.99, day: 'dom 25 May',       category: 'Entretenimiento', jar: 'Diversión' },
  { id: 't10', label: 'Freelance · factura 042',     meta: 'sáb 24 May',           amount:   720.00, day: 'sáb 24 May',       category: 'Ingresos',        jar: null },
  { id: 't11', label: 'Farmatodo · mensual',         meta: 'sáb 24 May',           amount:  -116.00, day: 'sáb 24 May',       category: 'Salud',           jar: 'Necesidades básicas' },
  { id: 't12', label: 'CANTV · internet',            meta: 'sáb 24 May',           amount:   -35.00, day: 'sáb 24 May',       category: 'Servicios',       jar: 'Necesidades básicas' },
  { id: 't13', label: 'La Estancia · cena',          meta: 'sáb 24 May',           amount:   -62.40, day: 'sáb 24 May',       category: 'Restaurantes',    jar: 'Diversión' },
  { id: 't14', label: 'Alquiler · mayo',             meta: 'vie 23 May',           amount: -1450.00, day: 'vie 23 May',       category: 'Vivienda',        jar: 'Necesidades básicas' },
  { id: 't15', label: 'Mercado · verduras',          meta: 'vie 23 May',           amount:   -41.30, day: 'vie 23 May',       category: 'Supermercado',    jar: 'Necesidades básicas' },
  { id: 't16', label: 'Metro · recarga',             meta: 'vie 23 May',           amount:    -8.00, day: 'vie 23 May',       category: 'Transporte',      jar: 'Necesidades básicas' },
].map(tx => ({
  ...tx,
  jarColor: tx.jar ? JAR_META[tx.jar].color : null,
  catIcon: CAT_ICON[tx.category] || 'label',
}));

const fmtMoney = (v) => {
  const sign = v > 0 ? '+' : v < 0 ? '−' : '';
  return sign + '$' + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};
/* monto sin signo, siempre con símbolo y 2 decimales (pool agrupado) */
const fmtAbs = (v) => '$' + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

Object.assign(window, { TX, JAR_META, JAR_CANON, CAT_ICON, fmtMoney, fmtAbs });
