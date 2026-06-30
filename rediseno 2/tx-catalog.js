/* ─── OW Finance · Catálogo común de Transacciones ──────────────────────
 * FUENTE ÚNICA compartida por TODOS los kits (lite-desktop + mobile, Lite + Pro).
 *
 * Principio de producto (no negociable):
 *   • El CÁNTARO es una entidad de orden superior. NUNCA se elige a mano.
 *   • La CATEGORÍA es la unidad común que el usuario elige; cada categoría
 *     declara a qué cántaro aporta (jarId). El cántaro entra anclado.
 *
 * Por eso este archivo define:
 *   OWF_JARS          → los cántaros canónicos (método 55/10/10/10/10).
 *   OWF_CATEGORIES    → categorías comunes, cada una con su jarId.
 *   owfJarForCategory(catRef)  → resuelve el cántaro desde id o nombre de categoría.
 *   owfCategory(catRef)        → resuelve la categoría desde id o nombre.
 *
 * Compatibilidad: los ids de cántaro j1..j5 coinciden con SAMPLE_JARS del kit
 * desktop, para no romper las pantallas de Cántaros/Análisis ya existentes.
 * ──────────────────────────────────────────────────────────────────────── */
(function () {
  /* Cántaros canónicos — método de los cántaros (Harv Eker 55/10/10/10/10).
   * Cada uno: id · name · percent · icon · color · tone(semántico). */
  var OWF_JARS = [
    { id: 'j1', name: 'Necesidades básicas', percent: 55, icon: 'home',        color: '#1E3A8A', tone: 'need' },
    { id: 'j2', name: 'Diversión',           percent: 10, icon: 'celebration', color: '#F59E0B', tone: 'want' },
    { id: 'j3', name: 'Ahorro',              percent: 10, icon: 'savings',     color: '#10B981', tone: 'save' },
    { id: 'j4', name: 'Educación',           percent: 10, icon: 'school',      color: '#0EA5E9', tone: 'grow' },
    { id: 'j5', name: 'Reservas',            percent: 10, icon: 'shield',      color: '#8B5CF6', tone: 'safe' },
  ];

  /* Categorías comunes — kit + las que faltaban del brief (Ropa, Suscripciones,
   * Inversión, Salario, Freelance). kind: 'expense' | 'income'.
   * jarId null = no aporta a ningún cántaro (típico de ingresos).
   * Los `name` coinciden con los usados en los datos demo para que las
   * transacciones existentes sigan resolviendo su cántaro. */
  var OWF_CATEGORIES = [
    /* ── Gastos · Necesidades (j1) ── */
    { id: 1,  name: 'Vivienda',        icon: 'home',           jarId: 'j1', kind: 'expense' },
    { id: 2,  name: 'Supermercado',    icon: 'shopping_cart',  jarId: 'j1', kind: 'expense' },
    { id: 3,  name: 'Servicios',       icon: 'bolt',           jarId: 'j1', kind: 'expense' },
    { id: 4,  name: 'Transporte',      icon: 'directions_car', jarId: 'j1', kind: 'expense' },
    { id: 5,  name: 'Salud',           icon: 'favorite',       jarId: 'j1', kind: 'expense' },
    /* ── Gastos · Diversión / Quiero (j2) ── */
    { id: 6,  name: 'Restaurantes',    icon: 'restaurant',     jarId: 'j2', kind: 'expense' },
    { id: 7,  name: 'Entretenimiento', icon: 'sports_esports', jarId: 'j2', kind: 'expense' },
    { id: 8,  name: 'Ropa',            icon: 'checkroom',      jarId: 'j2', kind: 'expense' },
    { id: 9,  name: 'Suscripciones',   icon: 'subscriptions',  jarId: 'j2', kind: 'expense' },
    /* ── Gastos · Educación (j4) e Inversión / Ahorro (j3) ── */
    { id: 10, name: 'Educación',       icon: 'school',         jarId: 'j4', kind: 'expense' },
    { id: 11, name: 'Inversión',       icon: 'trending_up',    jarId: 'j3', kind: 'expense' },
    /* ── Gastos · sin cántaro asignado → Reservas (j5) ── */
    { id: 12, name: 'Otros',           icon: 'category',       jarId: 'j5', kind: 'expense' },
    /* ── Ingresos · no aportan a cántaro ── */
    { id: 20, name: 'Salario',         icon: 'payments',       jarId: null, kind: 'income' },
    { id: 21, name: 'Freelance',       icon: 'work',           jarId: null, kind: 'income' },
    { id: 22, name: 'Ingresos',        icon: 'savings',        jarId: null, kind: 'income' },
  ];

  /* Agrupación visual del selector de categorías (2.1) — por cántaro.
   * Orden y rótulos de los grupos. */
  var OWF_CATEGORY_GROUPS = [
    { jarId: 'j1', label: 'Necesidades básicas' },
    { jarId: 'j2', label: 'Diversión' },
    { jarId: 'j3', label: 'Ahorro e inversión' },
    { jarId: 'j4', label: 'Educación' },
    { jarId: 'j5', label: 'Reservas y otros' },
    { jarId: null, label: 'Ingresos' },
  ];

  function _norm(s) { return (s == null ? '' : String(s)).trim().toLowerCase(); }

  /* Resuelve una categoría desde su id (número) o su nombre (string). */
  function owfCategory(ref) {
    if (ref == null) return null;
    if (typeof ref === 'number') return OWF_CATEGORIES.find(function (c) { return c.id === ref; }) || null;
    var n = _norm(ref);
    return OWF_CATEGORIES.find(function (c) { return _norm(c.name) === n || c.id === ref; }) || null;
  }

  /* Resuelve el cántaro derivado de una categoría (id o nombre). null si no aporta. */
  function owfJarForCategory(ref) {
    var cat = owfCategory(ref);
    if (!cat || !cat.jarId) return null;
    return OWF_JARS.find(function (j) { return j.id === cat.jarId; }) || null;
  }

  function owfJar(id) { return OWF_JARS.find(function (j) { return j.id === id; }) || null; }

  /* Opciones listas para un <Picker>: { value:id, label:name, icon, jarId, jar }. */
  function owfCategoryOptions(opts) {
    opts = opts || {};
    return OWF_CATEGORIES
      .filter(function (c) { return opts.kind ? c.kind === opts.kind : true; })
      .map(function (c) { return { value: c.id, label: c.name, icon: c.icon, jarId: c.jarId, jar: owfJar(c.jarId) }; });
  }

  var api = { OWF_JARS: OWF_JARS, OWF_CATEGORIES: OWF_CATEGORIES, OWF_CATEGORY_GROUPS: OWF_CATEGORY_GROUPS,
    owfCategory: owfCategory, owfJarForCategory: owfJarForCategory, owfJar: owfJar, owfCategoryOptions: owfCategoryOptions };
  if (typeof window !== 'undefined') Object.assign(window, api);
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})();
