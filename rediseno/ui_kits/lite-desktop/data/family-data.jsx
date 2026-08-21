/* ─── Data · Grupo familiar y cuentas compartidas (Fase 1) ───────────────
 * Fixtures PROPUESTOS — todavía no existen en data/sample-data.contract.js.
 * Shape exacta pedida por PROMPT_REDISENO_GRUPO_FAMILIAR_CUENTAS_COMPARTIDAS.md
 * (snake_case) para que el port a Vue no tenga que renombrar nada.
 * Fuente del modelo: ARQUITECTURA_GRUPO_FAMILIAR_EMPRESAS.md §01.
 * ──────────────────────────────────────────────────────────────────────── */

window.SAMPLE_FAMILY_GROUP = {
  id: 1,
  name: 'Familia Otero',
  members: [
    { user_id: 1, name: 'José Otero', email: 'jose@ejemplo.com', is_you: true, status: 'active' },
    { user_id: 2, name: 'Mariangela', email: 'mariangela@ejemplo.com', is_you: false, status: 'active' },
    { user_id: 3, name: 'Carmen Otero', email: 'carmen@ejemplo.com', is_you: false, status: 'invited' },
  ],
};

window.SAMPLE_ACCOUNT_SHARES = [
  {
    account_id: 12, account_name: 'Banesco Mariangela',
    owner_user_id: 2, owner_name: 'Mariangela', shared_with_user_id: 1,
    permission: 'manage', balance: 340.5, currency_symbol: '$',
  },
  {
    account_id: 14, account_name: 'Ahorro conjunto',
    owner_user_id: 2, owner_name: 'Mariangela', shared_with_user_id: 1,
    permission: 'view_full', balance: 1280.0, currency_symbol: '$',
  },
  {
    account_id: 17, account_name: 'Nómina Carmen',
    owner_user_id: 3, owner_name: 'Carmen Otero', shared_with_user_id: 1,
    permission: 'view_balance', balance: 96.75, currency_symbol: '$',
  },
];

/* Vocabulario único de permisos — misma palabra en las 3 pantallas.
 * `weight` es intensidad del MISMO --brand-primary (regla del prompt: no
 * inventar una paleta por nivel; son estados de un concepto, no categorías). */
window.OWF_PERMISSIONS = [
  { id: 'none',         label: 'Sin acceso',      badge: '—',           icon: 'block',           weight: 0,  desc: 'No ve esta cuenta.' },
  { id: 'view_balance', label: 'Solo ve el saldo', badge: 'Solo saldo',  icon: 'lock',            weight: 22, desc: 'Ve el saldo actual, no los movimientos ni el historial.' },
  { id: 'view_full',    label: 'Puede ver todo',   badge: 'Ver todo',    icon: 'visibility',      weight: 55, desc: 'Ve saldo y movimientos completos, sin poder editar.' },
  { id: 'manage',       label: 'Puede gestionar',  badge: 'Gestión',     icon: 'edit',            weight: 100, desc: 'Registra y edita movimientos como si la cuenta fuera suya. No puede compartirla ni borrarla.' },
];

window.owfPermission = (id) => window.OWF_PERMISSIONS.find(p => p.id === id) || window.OWF_PERMISSIONS[0];

/* Tinte del nivel: un solo hue, distinta intensidad. */
window.owfPermTint = (weight, on) => ({
  background: on ? `color-mix(in oklab, var(--brand-primary) ${Math.max(weight, 8)}%, var(--surface-1))` : 'var(--surface-2)',
  color: on ? (weight >= 70 ? 'var(--fg-on-brand)' : 'var(--brand-primary-fg-soft)') : 'var(--fg-2)',
});
