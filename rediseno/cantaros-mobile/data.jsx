/* ─── Cántaros Mobile — datos de ejemplo ────────────────────────────────
 * Modelo de un cántaro (jar):
 *   id, name, color, active
 *   mode:  'percent' | 'fixed'      → % del ingreso esperado o monto fijo
 *   carry: 'reset'   | 'accum'      → al cerrar el periodo: reinicia o acumula
 *   percent / fixed                 → valor según mode
 *   source                          → categoría de ingreso que lo apalanca
 *   categories[]                    → categorías de gasto que consumen el cántaro
 *   spent                           → gastado en el periodo actual
 *   carriedIn                       → remanente arrastrado del periodo anterior (accum)
 * ──────────────────────────────────────────────────────────────────────── */
/* global window */

const CM_EXPECTED_INCOME = 1200; // ingreso mensual esperado (US$)

const CM_JARS = [
  { id: 'j1', name: 'Necesidades básicas', color: '#1E3A8A', active: true,  mode: 'percent', carry: 'reset', percent: 45, fixed: 0,   source: 'salario',  categories: ['supermercado', 'proteina', 'servicios'], spent: 486.20, carriedIn: 0 },
  { id: 'j2', name: 'Coche / Auto y transporte', color: '#F97316', active: true, mode: 'percent', carry: 'accum', percent: 12, fixed: 0, source: 'salario', categories: ['combustible', 'mant_auto'], spent: 96.40, carriedIn: 31.80 },
  { id: 'j3', name: 'Ocio / Diversión', color: '#F59E0B', active: true,  mode: 'percent', carry: 'reset', percent: 8,  fixed: 0,   source: 'salario',  categories: ['streaming', 'salidas'], spent: 74.10, carriedIn: 0 },
  { id: 'j4', name: 'Ahorro', color: '#10B981', active: true,  mode: 'percent', carry: 'accum', percent: 15, fixed: 0,   source: 'salario',  categories: [], spent: 0, carriedIn: 540.00 },
  { id: 'j5', name: 'Educación', color: '#0EA5E9', active: true,  mode: 'percent', carry: 'reset', percent: 10, fixed: 0,   source: 'freelance', categories: ['cursos', 'libros'], spent: 60.00, carriedIn: 0 },
  { id: 'j6', name: 'Reservas', color: '#8B5CF6', active: false, mode: 'percent', carry: 'accum', percent: 5, fixed: 0,   source: 'salario',  categories: [], spent: 0, carriedIn: 210.00 },
  { id: 'j7', name: 'Donaciones', color: '#A855F7', active: true, mode: 'fixed', carry: 'reset', percent: 5, fixed: 30,   source: 'salario',  categories: ['donaciones'], spent: 12.00, carriedIn: 0 },
];

/* Árbol de categorías — Ingresos / Gastos → Carpetas → Categorías */
const CM_CATEGORY_TREE = [
  {
    id: 'ingresos', name: 'Ingresos', kind: 'income', icon: 'arrow_downward',
    children: [
      { id: 'salario',     name: 'Salario',                 icon: 'work' },
      { id: 'freelance',   name: 'Negocios / Freelance',    icon: 'business_center' },
      { id: 'inversiones', name: 'Inversiones',             icon: 'trending_up' },
      { id: 'rentas',      name: 'Rentas / Alquileres',     icon: 'home' },
      { id: 'venta',       name: 'Venta de bienes / serv.', icon: 'sell' },
      { id: 'reembolsos',  name: 'Reembolsos / Devol.',     icon: 'undo' },
      { id: 'otros_ing',   name: 'Otros ingresos',          icon: 'account_balance_wallet' },
    ],
  },
  {
    id: 'gastos', name: 'Gastos', kind: 'expense', icon: 'arrow_upward',
    children: [
      { id: 'f_hogar', name: 'Hogar', folder: true, children: [
        { id: 'alquiler',   name: 'Alquiler',   icon: 'home' },
        { id: 'hipoteca',   name: 'Hipoteca',   icon: 'account_balance' },
        { id: 'servicios',  name: 'Servicios',  icon: 'bolt' },
        { id: 'internet',   name: 'Internet / Teléfono', icon: 'wifi' },
      ]},
      { id: 'f_alim', name: 'Alimentación', folder: true, children: [
        { id: 'supermercado', name: 'Supermercado', icon: 'shopping_cart' },
        { id: 'proteina',     name: 'Proteína',     icon: 'restaurant' },
        { id: 'restaurantes', name: 'Restaurantes', icon: 'restaurant_menu' },
        { id: 'cafe',         name: 'Café',         icon: 'local_cafe' },
      ]},
      { id: 'f_trans', name: 'Transporte', folder: true, children: [
        { id: 'combustible',  name: 'Combustible',  icon: 'local_gas_station' },
        { id: 'mant_auto',    name: 'Mantenimiento auto', icon: 'build' },
        { id: 'transp_pub',   name: 'Transporte público', icon: 'directions_bus' },
        { id: 'taxis',        name: 'Taxis / Apps',  icon: 'local_taxi' },
      ]},
      { id: 'f_ocio', name: 'Ocio', folder: true, children: [
        { id: 'streaming', name: 'Streaming', icon: 'play_circle' },
        { id: 'salidas',   name: 'Salidas',   icon: 'celebration' },
        { id: 'viajes',    name: 'Viajes',    icon: 'flight' },
      ]},
      { id: 'f_edu', name: 'Educación', folder: true, children: [
        { id: 'cursos', name: 'Cursos', icon: 'school' },
        { id: 'libros', name: 'Libros', icon: 'menu_book' },
      ]},
      { id: 'f_otros', name: 'Otros', folder: true, children: [
        { id: 'salud',      name: 'Salud / Farmacia', icon: 'medical_services' },
        { id: 'regalos',    name: 'Regalos',          icon: 'card_giftcard' },
        { id: 'donaciones', name: 'Donaciones',       icon: 'volunteer_activism' },
      ]},
    ],
  },
];

/* Mapa plano id → { name, icon, kind } para resolver chips rápido */
const CM_CAT_INDEX = (() => {
  const idx = {};
  const walk = (nodes, kind) => nodes.forEach(n => {
    if (n.children) walk(n.children, n.kind || kind);
    else idx[n.id] = { id: n.id, name: n.name, icon: n.icon, kind };
  });
  CM_CATEGORY_TREE.forEach(root => walk(root.children, root.kind));
  return idx;
})();

const CM_PERIODS = ['Todo', 'Anual', 'Semestral', 'Trimestral', 'Mensual', 'Quincenal', 'Semanal', 'Diario'];

/* Plantillas (reusa las del kit si existen, si no un set local) */
const CM_TEMPLATES = (window.JAR_TEMPLATES || []).slice(0, 5);

Object.assign(window, { CM_EXPECTED_INCOME, CM_JARS, CM_CATEGORY_TREE, CM_CAT_INDEX, CM_PERIODS, CM_TEMPLATES });
