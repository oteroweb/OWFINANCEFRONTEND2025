<template>
  <!-- Estado 1: sin categoría -->
  <div v-if="!categoryId" class="ajc ajc--empty">
    <span class="material-icons ajc__icon">savings</span>
    <span class="ajc__text">El cántaro entra con la categoría</span>
  </div>

  <!-- Estado 2: categoría sin jar (ni real ni por slug legado) -->
  <div v-else-if="!jar && !fallbackJarName" class="ajc ajc--none">
    <span class="material-icons ajc__icon">block</span>
    <span class="ajc__text">Esta categoría no aporta a ningún cántaro</span>
  </div>

  <!-- Estado 3: jar anclado (real o por fallback de slug legado) -->
  <div v-else class="ajc ajc--jar" :style="jarStyle">
    <span class="ajc__badge" :style="badgeStyle">
      <span class="material-icons ajc__badge-icon">{{ jar?.icon ?? 'savings' }}</span>
    </span>
    <span class="ajc__name">{{ jar?.name ?? fallbackJarName }}</span>
    <span v-if="jar?.percent" class="ajc__pct">{{ jar.percent }}%</span>
    <span class="material-icons ajc__lock">lock</span>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import {
  jarForCategory,
  loadCategoriesWithJars,
  loadUserJars,
  getCachedJars,
  getCachedCategories,
  JAR_SLUG_NAMES,
  type JarRef,
} from 'src/utils/txCatalog';

const props = defineProps<{
  categoryId: number | null | undefined;
}>();

const jar = computed<JarRef | null>(() => {
  if (!props.categoryId) return null;
  return jarForCategory(props.categoryId, getCachedJars());
});

// OWF: cuando la categoría no tiene un jar real asignado (assigned_jar_id null / sin
// cántaro con ese nombre en la cuenta) pero sí tiene un jar_slug legado, mostrar el mismo
// nombre+color que ya usa el picker de categorías (CategorySelector.vue `jarLabelForCat`/
// `jarColorForCat`) en vez de "no aporta a ningún cántaro" — antes el picker agrupaba la
// categoría bajo un cántaro pero este chip decía lo contrario para la misma categoría.
const FALLBACK_SLUG_COLORS: Record<string, string> = {
  necesidades: '#2d4da6',
  diversion:   '#f59e0b',
  ahorro:      '#10b981',
  educacion:   '#8b5cf6',
  reservas:    '#64748b',
};
const category = computed(() => {
  if (!props.categoryId) return null;
  return getCachedCategories().find(c => c.id === props.categoryId) ?? null;
});
const fallbackJarName = computed(() => {
  if (jar.value) return null;
  const slug = category.value?.jar_slug;
  return slug ? (JAR_SLUG_NAMES[slug] ?? null) : null;
});
const fallbackJarColor = computed(() => {
  const slug = category.value?.jar_slug;
  return slug ? (FALLBACK_SLUG_COLORS[slug] ?? null) : null;
});

const jarStyle = computed(() => {
  const color = jar.value?.color ?? fallbackJarColor.value;
  if (!color) return {};
  return {
    background: `color-mix(in srgb, ${color} 10%, var(--surface-1, #fff))`,
    border: `1px solid color-mix(in srgb, ${color} 28%, transparent)`,
  };
});

const badgeStyle = computed(() => ({
  background: jar.value?.color ?? fallbackJarColor.value ?? 'var(--brand-primary)',
}));

onMounted(async () => {
  await Promise.all([loadCategoriesWithJars(), loadUserJars()]);
});
</script>

<style scoped lang="scss">
.ajc {
  display: flex;
  align-items: center;
  gap: 9px;
  padding: 10px 13px;
  border-radius: var(--radius-sm, 8px);
  min-height: 44px;

  &--empty {
    background: var(--surface-2, #f8fafc);
    border: 1px dashed var(--border-hairline, #e2e8f0);
  }

  &--none {
    background: var(--surface-2, #f8fafc);
    border: 1px solid var(--border-hairline, #e2e8f0);
  }

  &--jar {
    border-radius: var(--radius-sm, 8px);
  }
}

.ajc__icon {
  font-size: 18px;
  color: var(--fg-3, #94a3b8);
}

.ajc__text {
  font-family: var(--font-body, sans-serif);
  font-size: 12.5px;
  color: var(--fg-3, #94a3b8);
}

.ajc__badge {
  width: 26px;
  height: 26px;
  border-radius: 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.ajc__badge-icon {
  font-size: 15px;
  color: #fff;
}

.ajc__name {
  flex: 1;
  min-width: 0;
  font-family: var(--font-body, sans-serif);
  font-size: 13px;
  font-weight: 600;
  color: var(--fg-1, #0f172a);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.ajc__pct {
  font-family: var(--font-body, sans-serif);
  font-size: 11px;
  color: var(--fg-2, #64748b);
  flex-shrink: 0;
}

.ajc__lock {
  font-size: 15px;
  color: var(--fg-3, #94a3b8);
  flex-shrink: 0;
}
</style>
