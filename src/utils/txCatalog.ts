import { ref } from 'vue';
import { api } from 'src/boot/axios';

export interface CatalogCategory {
  id: number;
  name: string;
  icon: string | null;
  jar_slug: string | null;
  active: number | boolean;
  user_id: number | null;
  type: string | null;
  parent_id: number | null;
}

export interface JarRef {
  id: number;
  name: string;
  color?: string;
  icon?: string;
  percent?: number;
}

// Maps jar_slug → canonical display name (used to find user's jar by name)
export const JAR_SLUG_NAMES: Record<string, string> = {
  necesidades: 'Necesidades básicas',
  diversion:   'Diversión',
  ahorro:      'Ahorro',
  educacion:   'Educación',
  reservas:    'Reservas',
};

const _categories = ref<CatalogCategory[]>([]);
const _loaded = ref(false);

export async function loadCategoriesWithJars(): Promise<CatalogCategory[]> {
  if (_loaded.value) return _categories.value;
  try {
    const res = await api.get<{ data: CatalogCategory[] }>('/categories');
    const raw = res.data?.data ?? (res.data as unknown as CatalogCategory[]) ?? [];
    _categories.value = Array.isArray(raw) ? raw : [];
    _loaded.value = true;
  } catch {
    // silent — caller handles empty
  }
  return _categories.value;
}

export function getCachedCategories(): CatalogCategory[] {
  return _categories.value;
}

/**
 * Returns the jar_slug for a given category id, or null.
 * Call loadCategoriesWithJars() first.
 */
export function jarSlugForCategory(categoryId: number | null | undefined): string | null {
  if (!categoryId) return null;
  return _categories.value.find(c => c.id === categoryId)?.jar_slug ?? null;
}

/**
 * Returns the canonical jar name for a slug.
 * Pass the user's jar list to get the actual JarRef with color/icon/percent.
 */
export function jarNameForSlug(slug: string | null | undefined): string | null {
  if (!slug) return null;
  return JAR_SLUG_NAMES[slug] ?? null;
}

/**
 * Find the user's actual jar from their jar list by matching jar_slug.
 * userJars: array of { id, name, color, icon, percent } from auth store or jars store.
 */
export function jarForCategory(
  categoryId: number | null | undefined,
  userJars: JarRef[],
): JarRef | null {
  const slug = jarSlugForCategory(categoryId);
  if (!slug) return null;
  const canonicalName = JAR_SLUG_NAMES[slug];
  if (!canonicalName) return null;
  return userJars.find(j => j.name === canonicalName) ?? null;
}

// ── User jars cache ──────────────────────────────────────────────────────────

const _jars = ref<JarRef[]>([]);
const _jarsLoaded = ref(false);

export async function loadUserJars(): Promise<JarRef[]> {
  if (_jarsLoaded.value) return _jars.value;
  try {
    const res = await api.get<{ data: unknown[] }>('/jars', { params: { per_page: 100 } });
    const raw = res.data?.data ?? (res.data as unknown as unknown[]) ?? [];
    _jars.value = (Array.isArray(raw) ? raw : []).map((j: unknown): JarRef => {
      const jar = j as Record<string, unknown>;
      const result: JarRef = { id: Number(jar['id']), name: String(jar['name'] ?? '') };
      if (jar['color']) result.color = String(jar['color']);
      if (jar['icon'])  result.icon  = String(jar['icon']);
      if (jar['percent'] != null) result.percent = Number(jar['percent']);
      return result;
    });
    _jarsLoaded.value = true;
  } catch {
    // silent
  }
  return _jars.value;
}

export function getCachedJars(): JarRef[] {
  return _jars.value;
}

/** Reset cache (e.g. on logout) */
export function resetTxCatalog() {
  _categories.value = [];
  _loaded.value = false;
  _jars.value = [];
  _jarsLoaded.value = false;
}
