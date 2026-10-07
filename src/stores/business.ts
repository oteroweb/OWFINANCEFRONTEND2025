import { defineStore } from 'pinia';
import { api } from 'boot/axios';
import { useAuthStore } from 'stores/auth';
import { useTransactionsStore } from 'stores/transactions';
import {
  readStoredContext,
  writeStoredContext,
  setActiveBusinessId,
  type ActiveContext,
} from 'src/utils/businessContext';

/**
 * OWF-370 — Fase 2 de "Grupo Familiar y Contabilidad Empresarial".
 * Store de empresas (contabilidad separada) + contexto contable activo.
 * Wrappea BusinessController (/businesses/...). El contexto activo se aplica a
 * los endpoints contables desde el interceptor de axios (utils/businessContext).
 */

export type BusinessRole = 'owner' | 'accountant' | 'viewer';
export type BusinessMode = 'lite' | 'pro';

/** Paleta cerrada D-009 (espejo de Business::PALETTE en backend). */
export const BUSINESS_PALETTE: Array<{ id: string; value: string; label: string }> = [
  { id: 'navy', value: '#3B5BDB', label: 'Azul de marca' },
  { id: 'sky', value: '#0EA5E9', label: 'Celeste' },
  { id: 'indigo', value: '#4338CA', label: 'Índigo' },
  { id: 'violet', value: '#8B5CF6', label: 'Violeta' },
  { id: 'purple', value: '#7E22CE', label: 'Púrpura' },
  { id: 'plum', value: '#A21CAF', label: 'Ciruela' },
  { id: 'slate', value: '#475569', label: 'Grafito' },
  { id: 'taupe', value: '#78716C', label: 'Topo' },
];

/** Color del contexto Personal (azul de marca, D-009). */
export const PERSONAL_COLOR = '#3B5BDB';

export const BUSINESS_ROLES: Array<{ id: BusinessRole; label: string; can: string }> = [
  { id: 'owner', label: 'Dueño', can: 'Todo: cuentas, categorías, cántaros, y dar acceso a otros.' },
  { id: 'accountant', label: 'Contador', can: 'Registra y edita movimientos. No cambia la estructura ni da acceso.' },
  { id: 'viewer', label: 'Solo lectura', can: 'Ve todo y exporta reportes. No registra nada.' },
];

export function businessRoleLabel(role: string | null | undefined): string {
  return BUSINESS_ROLES.find((r) => r.id === role)?.label ?? 'Solo lectura';
}

export interface BusinessMemberUser {
  id: number;
  name: string;
  email: string;
}

export interface BusinessMember {
  id: number;
  business_id: number;
  user_id: number;
  role: BusinessRole;
  status: 'invited' | 'active';
  invited_by?: number | null;
  user?: BusinessMemberUser | null;
}

export interface BusinessProfile {
  sector?: string | null;
  revenue?: string | null;
  staff?: string | null;
  seasonal?: boolean | null;
  goal?: string | null;
}

export interface Business {
  id: number;
  owner_user_id: number;
  name: string;
  tax_id: string | null;
  currency_id: number | null;
  mode: BusinessMode;
  color: string;
  profile: BusinessProfile | null;
  onboarded_at: string | null;
  active: boolean;
  members: BusinessMember[];
  my_role: BusinessRole | null;
  my_status: 'invited' | 'active' | null;
}

export interface CreateBusinessInput {
  name: string;
  tax_id?: string | null;
  currency_id?: number | null;
  mode?: BusinessMode;
  color?: string | null;
}

export type UpdateBusinessInput = Partial<Pick<Business, 'name' | 'tax_id' | 'currency_id' | 'mode' | 'color' | 'active'>>;

export const useBusinessStore = defineStore('business', {
  state: () => ({
    businesses: [] as Business[],
    activeContext: readStoredContext(),
    /** Se incrementa en cada cambio de contexto; AppShell lo usa como :key del router-view. */
    contextVersion: 0,
    loading: false,
    loaded: false,
  }),

  getters: {
    /** Empresas donde soy miembro activo. */
    activeBusinesses(state): Business[] {
      return state.businesses.filter((b) => b.my_status === 'active');
    },
    /** Invitaciones pendientes (my_status = 'invited'). */
    pendingInvites(state): Business[] {
      return state.businesses.filter((b) => b.my_status === 'invited');
    },
    activeBusiness(state): Business | null {
      if (state.activeContext === 'personal') return null;
      const id = state.activeContext;
      return state.businesses.find((b) => b.id === id && b.my_status === 'active') ?? null;
    },
    isBusinessContext(): boolean {
      return this.activeBusiness !== null;
    },
    myRole(): BusinessRole | null {
      return this.activeBusiness?.my_role ?? null;
    },
    /** En personal siempre se puede escribir; en empresa solo owner|accountant. */
    canWrite(): boolean {
      if (this.activeContext === 'personal') return true;
      const r = this.myRole;
      return r === 'owner' || r === 'accountant';
    },
    /** En personal soy "dueño" de mi estructura; en empresa solo el owner administra. */
    isOwner(): boolean {
      if (this.activeContext === 'personal') return true;
      return this.myRole === 'owner';
    },
    /** Color de acento del contexto activo (D-009). */
    accentColor(): string {
      return this.activeBusiness?.color ?? PERSONAL_COLOR;
    },
  },

  actions: {
    /** Cambia de contexto y fuerza la recarga de todo lo dependiente (ver AppShell). */
    setContext(ctx: ActiveContext) {
      const next: ActiveContext = ctx === 'personal' || !ctx ? 'personal' : ctx;
      if (next === this.activeContext) return;
      this.activeContext = next;
      setActiveBusinessId(next === 'personal' ? null : next);
      writeStoredContext(next);
      try {
        // Filtro de cuentas del sidebar pertenece al contexto anterior.
        useTransactionsStore().setSelectedAccountIds([]);
      } catch {
        // store no disponible: ignorar
      }
      this.contextVersion += 1;
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('owf:context-changed', { detail: { context: next } }));
      }
    },

    /** Limpia estado al cerrar sesión (no toca el contexto persistido del siguiente login). */
    reset() {
      this.businesses = [];
      this.loaded = false;
    },

    async fetchBusinesses() {
      this.loading = true;
      try {
        const res = await api.get('/businesses');
        const raw = res.data?.data ?? [];
        this.businesses = Array.isArray(raw) ? (raw as Business[]) : [];
        this.loaded = true;
        // Si la empresa activa ya no existe o perdí acceso, volver a personal.
        if (this.activeContext !== 'personal' && !this.activeBusiness) {
          this.setContext('personal');
        }
        return this.businesses;
      } finally {
        this.loading = false;
      }
    },

    upsertLocal(b: Business) {
      const i = this.businesses.findIndex((x) => x.id === b.id);
      if (i >= 0) this.businesses.splice(i, 1, b);
      else this.businesses.push(b);
    },

    async createBusiness(input: CreateBusinessInput) {
      const body: Record<string, unknown> = { name: input.name.trim() };
      if (input.tax_id && input.tax_id.trim()) body.tax_id = input.tax_id.trim();
      if (input.currency_id) body.currency_id = input.currency_id;
      if (input.mode) body.mode = input.mode;
      if (input.color) body.color = input.color;
      const res = await api.post('/businesses', body);
      const b = res.data?.data as Business;
      if (b?.id) this.upsertLocal(b);
      return b;
    },

    async updateBusiness(id: number, input: UpdateBusinessInput) {
      const res = await api.put(`/businesses/${id}`, input);
      const b = res.data?.data as Business;
      if (b?.id) this.upsertLocal(b);
      return b;
    },

    async removeBusiness(id: number) {
      await api.delete(`/businesses/${id}`);
      this.businesses = this.businesses.filter((b) => b.id !== id);
      if (this.activeContext === id) this.setContext('personal');
    },

    /**
     * D-011: respuestas del wizard. El backend lee los campos planos (sector, revenue,
     * staff, seasonal:boolean, goal) — no van anidados bajo "profile".
     */
    async saveOnboarding(id: number, profile: BusinessProfile) {
      const res = await api.post(`/businesses/${id}/onboarding`, profile);
      const b = res.data?.data as Business;
      if (b?.id) this.upsertLocal(b);
      return b;
    },

    async invite(id: number, email: string, role: BusinessRole) {
      const res = await api.post(`/businesses/${id}/invite`, { email: email.trim(), role });
      await this.fetchBusinesses();
      return res.data?.data;
    },

    async accept(id: number) {
      await api.post(`/businesses/${id}/accept`);
      await this.fetchBusinesses();
    },

    async decline(id: number) {
      await api.post(`/businesses/${id}/decline`);
      await this.fetchBusinesses();
    },

    async updateRole(id: number, userId: number, role: BusinessRole) {
      await api.patch(`/businesses/${id}/users/${userId}`, { role });
      await this.fetchBusinesses();
    },

    /** Revocar a otro (dueño) o salir uno mismo. Tras salir, vuelve a personal si era el contexto activo. */
    async removeUser(id: number, userId: number) {
      await api.delete(`/businesses/${id}/users/${userId}`);
      const me = useAuthStore().user?.id;
      if (me !== undefined && me === userId && this.activeContext === id) {
        this.businesses = this.businesses.filter((b) => b.id !== id);
        this.setContext('personal');
      }
      await this.fetchBusinesses();
    },
  },
});

/** Mensaje legible desde un error normalizado por el interceptor de axios. */
export function businessErrorMessage(e: unknown, fallback = 'No se pudo completar la acción.'): string {
  const err = e as { api?: { message?: string; errors?: unknown }; message?: string };
  const errors = err?.api?.errors;
  if (errors && typeof errors === 'object') {
    const first = Object.values(errors as Record<string, unknown>)[0];
    if (Array.isArray(first) && typeof first[0] === 'string') return first[0];
  }
  return err?.api?.message || err?.message || fallback;
}
