/**
 * OWF-370 Fase 2 — contexto contable activo ('personal' | id de empresa).
 *
 * Vive en un módulo plano (sin Pinia) para que el interceptor de axios lo lea
 * sin dependencias circulares con las stores. La store `business` es la única
 * que lo escribe (setActiveBusinessId) y lo persiste en localStorage.
 */

export const BUSINESS_CONTEXT_STORAGE_KEY = 'owf-active-context';

export type ActiveContext = 'personal' | number;

export function readStoredContext(): ActiveContext {
  try {
    const raw = localStorage.getItem(BUSINESS_CONTEXT_STORAGE_KEY);
    if (raw && raw !== 'personal') {
      const n = Number(raw);
      if (Number.isInteger(n) && n > 0) return n;
    }
  } catch {
    // localStorage no disponible: contabilidad personal
  }
  return 'personal';
}

export function writeStoredContext(ctx: ActiveContext): void {
  try {
    localStorage.setItem(BUSINESS_CONTEXT_STORAGE_KEY, String(ctx));
  } catch {
    // ignore
  }
}

let activeBusinessId: number | null = (() => {
  const c = readStoredContext();
  return c === 'personal' ? null : c;
})();

export function setActiveBusinessId(id: number | null): void {
  activeBusinessId = id;
}

export function getActiveBusinessId(): number | null {
  return activeBusinessId;
}

/** Endpoints GET que aceptan ?business_id= (match exacto de ruta, sin id ni subrutas extra). */
const GET_ROUTES = new Set([
  'accounts',
  'accounts/active',
  'accounts/tree',
  'accounts/summary/global-balance',
  'transactions',
  'transactions/active',
  'categories',
  'categories/tree',
]);

/** Endpoints POST que llevan business_id en el body. */
const POST_ROUTES = new Set(['accounts', 'categories']);

function normalizePath(url: string | undefined): string {
  if (!url) return '';
  const noQuery = url.split('?')[0] ?? '';
  // Si viniera absoluta, quedarse con lo posterior a /api/v1/
  const idx = noQuery.indexOf('/api/v1/');
  const rel = idx >= 0 ? noQuery.slice(idx + '/api/v1/'.length) : noQuery;
  return rel.replace(/^\/+/, '').replace(/\/+$/, '');
}

/** Devuelve la config con business_id aplicado si corresponde (lista explícita de rutas). */
export function applyBusinessContext<
  T extends { url?: string; method?: string; params?: unknown; data?: unknown },
>(config: T): T {
  const bid = activeBusinessId;
  if (bid === null) return config;
  const path = normalizePath(config.url);
  const method = (config.method ?? 'get').toLowerCase();

  if (method === 'get' && GET_ROUTES.has(path)) {
    const params = (config.params ?? {}) as Record<string, unknown>;
    if (params.business_id === undefined) config.params = { ...params, business_id: bid };
  } else if (method === 'post' && POST_ROUTES.has(path)) {
    let data = config.data;
    if (typeof data === 'string') {
      try {
        data = JSON.parse(data) as unknown;
      } catch {
        return config;
      }
    }
    if (data === undefined || data === null) data = {};
    if (typeof data === 'object' && !(data instanceof FormData)) {
      const body = data as Record<string, unknown>;
      if (body.business_id === undefined) config.data = { ...body, business_id: bid };
    }
  }
  return config;
}
