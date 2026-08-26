/**
 * OWF-369 — Vocabulario único de niveles de permiso para cuentas compartidas
 * dentro de un grupo familiar (Fase 1 de "Grupo Familiar y Contabilidad Empresarial").
 *
 * Port 1:1 de `rediseno/ui_kits/lite-desktop/data/family-data.jsx`
 * (window.OWF_PERMISSIONS / owfPermission / owfPermTint) — misma fuente de verdad
 * para FamilyGroupPanel, AccountShareDialog y SharedAccountsSection.
 *
 * `owner` NO está en esta lista a propósito: es implícito del dueño real de la
 * cuenta, nunca una opción seleccionable (ver AccountShareDialog.vue).
 */

export type OwfPermissionId = 'none' | 'view_balance' | 'view_full' | 'manage';

export interface OwfPermissionDef {
  id: OwfPermissionId;
  label: string;
  badge: string;
  icon: string;
  weight: number;
  desc: string;
}

export const OWF_PERMISSIONS: OwfPermissionDef[] = [
  { id: 'none', label: 'Sin acceso', badge: '—', icon: 'block', weight: 0, desc: 'No ve esta cuenta.' },
  { id: 'view_balance', label: 'Solo ve el saldo', badge: 'Solo saldo', icon: 'lock', weight: 22, desc: 'Ve el saldo actual, no los movimientos ni el historial.' },
  { id: 'view_full', label: 'Puede ver todo', badge: 'Ver todo', icon: 'visibility', weight: 55, desc: 'Ve saldo y movimientos completos, sin poder editar.' },
  { id: 'manage', label: 'Puede gestionar', badge: 'Gestión', icon: 'edit', weight: 100, desc: 'Registra y edita movimientos como si la cuenta fuera suya. No puede compartirla ni borrarla.' },
];

export function owfPermission(id: string | null | undefined): OwfPermissionDef {
  return OWF_PERMISSIONS.find((p) => p.id === id) ?? OWF_PERMISSIONS[0]!;
}

/** Tinte del nivel: un solo hue (--brand-primary), distinta intensidad por peso. */
export function owfPermTint(weight: number, on: boolean): { background: string; color: string } {
  return {
    background: on ? `color-mix(in oklab, var(--brand-primary) ${Math.max(weight, 8)}%, var(--surface-1))` : 'var(--surface-2)',
    color: on ? (weight >= 70 ? 'var(--fg-on-brand)' : 'var(--brand-primary-fg-soft)') : 'var(--fg-2)',
  };
}
