<template>
  <div ref="rootRef" class="cat-sel">
    <!-- Trigger button -->
    <button
      type="button"
      class="cat-sel__trigger"
      :class="{ 'cat-sel__trigger--open': open }"
      @click="toggleOpen"
    >
      <span v-if="selectedCat" class="material-icons cat-sel__trigger-icon"
        :style="{ color: selectedJarColor }">{{ selectedCat.icon || 'sell' }}</span>
      <span v-else class="material-icons cat-sel__trigger-icon" style="color:var(--fg-3)">sell</span>

      <span class="cat-sel__trigger-label"
        :class="{ 'cat-sel__trigger-label--placeholder': !selectedCat }">
        {{ selectedCat ? selectedCat.name : placeholder }}
      </span>

      <span class="material-icons cat-sel__trigger-arrow">{{ open ? 'expand_less' : 'expand_more' }}</span>
    </button>

    <!-- Popover -->
    <Teleport to="body">
      <div v-if="open" class="cat-sel__popover" :style="popoverStyle">
        <!-- Search always visible -->
        <div class="cat-sel__search-wrap">
          <div class="cat-sel__search-inner">
            <span class="material-icons cat-sel__search-icon">search</span>
            <input
              ref="searchRef"
              v-model="query"
              class="cat-sel__search-input"
              placeholder="Escribe para buscar…"
              @keydown.escape="close"
            />
            <span v-if="query" class="material-icons cat-sel__search-clear" @click="query = ''">close</span>
          </div>
        </div>

        <!-- Content list -->
        <div class="cat-sel__list">
          <!-- allowNull option -->
          <button v-if="allowNull && !query" type="button" class="cat-sel__null-opt"
            @click="pick(null)">
            <span class="material-icons" style="font-size:17px;color:var(--fg-3)">block</span>
            Sin categoría
          </button>

          <!-- COLD: grouped by jar -->
          <template v-if="!query">
            <div v-for="group in groupedCats" :key="group.jarSlug" class="cat-sel__group">
              <div class="cat-sel__group-head">
                <span class="cat-sel__group-dot" :style="{ background: group.color }" />
                <span class="cat-sel__group-name" :style="{ color: group.color }">{{ group.label.toUpperCase() }}</span>
                <span class="cat-sel__group-pct">{{ group.percent }}%</span>
                <div class="cat-sel__group-line" />
              </div>
              <div class="cat-sel__group-pills">
                <button
                  v-for="cat in group.cats"
                  :key="cat.id"
                  type="button"
                  class="cat-sel__pill"
                  :class="{ 'cat-sel__pill--active': modelValue === cat.id }"
                  :style="pillStyle(group.color, modelValue === cat.id)"
                  @click="pick(cat.id)"
                >
                  <span class="material-icons" :style="{ fontSize: '15px', color: modelValue === cat.id ? '#fff' : group.color }">{{ cat.icon || 'sell' }}</span>
                  {{ cat.name }}
                </button>
              </div>
            </div>
            <!-- Ungrouped (no jar) -->
            <div v-if="ungroupedCats.length" class="cat-sel__group">
              <div class="cat-sel__group-head">
                <span class="cat-sel__group-dot" style="background:var(--fg-3)" />
                <span class="cat-sel__group-name" style="color:var(--fg-3)">SIN CÁNTARO</span>
                <div class="cat-sel__group-line" />
              </div>
              <div class="cat-sel__group-pills">
                <button
                  v-for="cat in ungroupedCats"
                  :key="cat.id"
                  type="button"
                  class="cat-sel__pill"
                  :class="{ 'cat-sel__pill--active': modelValue === cat.id }"
                  :style="pillStyle('var(--fg-3)', modelValue === cat.id)"
                  @click="pick(cat.id)"
                >
                  <span class="material-icons" style="font-size:15px">{{ cat.icon || 'sell' }}</span>
                  {{ cat.name }}
                </button>
              </div>
            </div>
          </template>

          <!-- HOT: flat filtered list -->
          <template v-else>
            <button
              v-for="cat in filteredCats"
              :key="cat.id"
              type="button"
              class="cat-sel__flat-row"
              :class="{ 'cat-sel__flat-row--active': modelValue === cat.id }"
              @click="pick(cat.id)"
            >
              <span class="cat-sel__flat-icon"
                :style="{ background: tint(jarColorForCat(cat), 16) }">
                <span class="material-icons"
                  :style="{ fontSize: '17px', color: jarColorForCat(cat) }">{{ cat.icon || 'sell' }}</span>
              </span>
              <span class="cat-sel__flat-name">{{ cat.name }}</span>
              <span v-if="jarLabelForCat(cat)" class="cat-sel__flat-jar"
                :style="{ background: tint(jarColorForCat(cat), 14) }">
                <span class="cat-sel__flat-jar-dot"
                  :style="{ background: jarColorForCat(cat) }" />
                {{ jarLabelForCat(cat) }}
              </span>
            </button>
            <div v-if="!filteredCats.length" class="cat-sel__empty">
              Sin resultados para "{{ query }}"
            </div>
          </template>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue';
import {
  loadCategoriesWithJars, loadUserJars,
  getCachedCategories,
  type CatalogCategory, type JarRef,
  JAR_SLUG_NAMES,
} from 'src/utils/txCatalog';

// reactive jar cache so computed properties re-run when jars load
const _cachedJars = ref<JarRef[]>([]);

// ── props / emits ────────────────────────────────────────────────────────────
const props = withDefaults(defineProps<{
  modelValue: number | null | undefined;
  placeholder?: string;
  allowNull?: boolean;
}>(), {
  placeholder: 'Elige una categoría',
  allowNull: false,
});
const emit = defineEmits<{ (e: 'update:modelValue', v: number | null): void }>();

// ── state ────────────────────────────────────────────────────────────────────
const open      = ref(false);
const query     = ref('');
const rootRef   = ref<HTMLElement | null>(null);
const searchRef = ref<HTMLInputElement | null>(null);
const popoverStyle = ref<Record<string, string>>({});

// ── data ─────────────────────────────────────────────────────────────────────
onMounted(async () => {
  const [, jars] = await Promise.all([loadCategoriesWithJars(), loadUserJars()]);
  _cachedJars.value = jars;
  document.addEventListener('mousedown', onOutsideClick);
});
onBeforeUnmount(() => document.removeEventListener('mousedown', onOutsideClick));

// ── jar color/label helpers — use real jar data, fall back to legacy slug map ──
const FALLBACK_SLUG_COLORS: Record<string, string> = {
  necesidades: '#2d4da6',
  diversion:   '#f59e0b',
  ahorro:      '#10b981',
  educacion:   '#8b5cf6',
  reservas:    '#64748b',
};

function jarForCat(cat: CatalogCategory): JarRef | null {
  const jars = _cachedJars.value;
  if (cat.assigned_jar_id != null) {
    return jars.find(j => j.id === cat.assigned_jar_id) ?? null;
  }
  if (cat.jar_slug) {
    const canonicalName = JAR_SLUG_NAMES[cat.jar_slug];
    if (canonicalName) return jars.find(j => j.name === canonicalName) ?? null;
  }
  return null;
}

function jarColorForCat(cat: CatalogCategory): string {
  const jar = jarForCat(cat);
  if (jar?.color) return jar.color;
  if (cat.jar_slug && FALLBACK_SLUG_COLORS[cat.jar_slug]) return FALLBACK_SLUG_COLORS[cat.jar_slug]!;
  return 'var(--fg-3)';
}
function jarLabelForCat(cat: CatalogCategory): string | null {
  const jar = jarForCat(cat);
  if (jar) return jar.name;
  return cat.jar_slug ? (JAR_SLUG_NAMES[cat.jar_slug] ?? null) : null;
}
function tint(color: string, pct: number): string {
  return `color-mix(in srgb, ${color} ${pct}%, var(--surface-1))`;
}
function pillStyle(color: string, active: boolean) {
  return {
    background: active ? color : tint(color, 12),
    border: `1px solid ${active ? color : tint(color, 28)}`,
    color: active ? '#fff' : 'var(--fg-1)',
  };
}

// ── computed ─────────────────────────────────────────────────────────────────
const allCats = computed<CatalogCategory[]>(() =>
  getCachedCategories().filter(c => c.active)
);

const selectedCat = computed(() =>
  props.modelValue != null ? allCats.value.find(c => c.id === props.modelValue) ?? null : null
);

const selectedJarColor = computed(() =>
  selectedCat.value ? jarColorForCat(selectedCat.value) : 'var(--fg-3)'
);
// re-trigger color when jars load
watch(_cachedJars, () => { /* triggers recompute of selectedJarColor */ });

interface JarGroup {
  jarSlug: string;
  label: string;
  color: string;
  percent: number;
  cats: CatalogCategory[];
}

const groupedCats = computed<JarGroup[]>(() => {
  const jars = _cachedJars.value;
  const groups: JarGroup[] = [];

  for (const jar of jars) {
    // Categories assigned to this jar (by id = authoritative, or by slug fallback)
    const cats = allCats.value.filter(c => {
      if (c.assigned_jar_id != null) return c.assigned_jar_id === jar.id;
      // Slug fallback: canonical jar name matches
      if (c.jar_slug) {
        const canonicalName = JAR_SLUG_NAMES[c.jar_slug];
        return canonicalName === jar.name;
      }
      return false;
    });
    if (!cats.length) continue;
    groups.push({
      jarSlug: String(jar.id),
      label: jar.name,
      color: jar.color ?? FALLBACK_SLUG_COLORS[
        Object.entries(JAR_SLUG_NAMES).find(([, n]) => n === jar.name)?.[0] ?? ''
      ] ?? 'var(--fg-3)',
      percent: jar.percent ?? 0,
      cats,
    });
  }
  return groups;
});

// Categories not matched to any jar
const ungroupedCats = computed(() => {
  const jars = _cachedJars.value;
  return allCats.value.filter(c => {
    if (c.assigned_jar_id != null) return !jars.some(j => j.id === c.assigned_jar_id);
    if (c.jar_slug) {
      const canonicalName = JAR_SLUG_NAMES[c.jar_slug];
      return !jars.some(j => j.name === canonicalName);
    }
    return true;
  });
});

const filteredCats = computed(() => {
  const q = query.value.trim().toLowerCase();
  if (!q) return allCats.value;
  return allCats.value.filter(c => c.name.toLowerCase().includes(q));
});

// ── interactions ──────────────────────────────────────────────────────────────
function toggleOpen() {
  if (open.value) { close(); return; }
  open.value = true;
  void nextTick(() => {
    positionPopover();
    searchRef.value?.focus();
  });
}

function close() {
  open.value = false;
  query.value = '';
}

function pick(id: number | null) {
  emit('update:modelValue', id);
  close();
}

function positionPopover() {
  if (!rootRef.value) return;
  const rect = rootRef.value.getBoundingClientRect();
  const spaceBelow = window.innerHeight - rect.bottom;
  const top = spaceBelow > 320 ? `${rect.bottom + 8 + window.scrollY}px` : `${rect.top + window.scrollY - 8}px`;
  popoverStyle.value = {
    position: 'absolute',
    top,
    left: `${rect.left + window.scrollX}px`,
    width: `${Math.max(rect.width, 320)}px`,
    zIndex: '9999',
    transform: spaceBelow > 320 ? 'none' : 'translateY(-100%)',
  };
}

function onOutsideClick(e: MouseEvent) {
  if (!open.value) return;
  const target = e.target as Node;
  if (rootRef.value && !rootRef.value.contains(target)) {
    // Check if click is inside the teleported popover
    const popovers = document.querySelectorAll('.cat-sel__popover');
    for (const p of popovers) {
      if (p.contains(target)) return;
    }
    close();
  }
}

watch(open, (v) => { if (v) void nextTick(positionPopover); });
</script>

<style lang="scss" scoped>
.cat-sel {
  position: relative;

  &__trigger {
    width: 100%;
    display: flex;
    align-items: center;
    gap: 9px;
    cursor: pointer;
    border: 1px solid var(--border-hairline, #e2e8f0);
    border-radius: var(--radius-sm, 8px);
    padding: 11px 13px;
    background: var(--surface-2, #f8fafc);
    text-align: left;
    transition: border-color 150ms, background 150ms;
    box-sizing: border-box;

    &--open {
      border-color: var(--brand-primary, #2d4da6);
      background: var(--surface-1, #fff);
    }

    &:hover:not(&--open) { border-color: var(--fg-3, #94a3b8); }

    &-icon { font-size: 18px !important; flex-shrink: 0; }
    &-arrow { font-size: 20px !important; color: var(--fg-3, #94a3b8); flex-shrink: 0; }
    &-label {
      flex: 1; min-width: 0;
      font-family: var(--font-body, sans-serif);
      font-size: 14px; font-weight: 600;
      color: var(--fg-1, #0f172a);
      white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
      &--placeholder { font-weight: 400; color: var(--fg-3, #94a3b8); }
    }
  }
}

/* Popover — rendered via Teleport into body */
.cat-sel__popover {
  background: var(--surface-1, #fff);
  border: 1px solid var(--border-hairline, #e2e8f0);
  border-radius: var(--radius-lg, 16px);
  box-shadow: 0 22px 60px rgba(0, 0, 0, .28);
  overflow: hidden;
  min-width: 320px;
}

.cat-sel__search-wrap {
  padding: 12px;
  border-bottom: 1px solid var(--border-hairline, #e2e8f0);
}
.cat-sel__search-inner {
  display: flex;
  align-items: center;
  gap: 9px;
  background: var(--surface-2, #f8fafc);
  border: 1px solid var(--border-hairline, #e2e8f0);
  border-radius: var(--radius-sm, 8px);
  padding: 9px 12px;
}
.cat-sel__search-icon { font-size: 18px !important; color: var(--fg-3, #94a3b8); flex-shrink: 0; }
.cat-sel__search-input {
  flex: 1; min-width: 0;
  border: 0; outline: none; background: transparent;
  font-family: var(--font-body, sans-serif);
  font-size: 13.5px; color: var(--fg-1, #0f172a);
}
.cat-sel__search-clear {
  font-size: 17px !important; color: var(--fg-3, #94a3b8);
  cursor: pointer; flex-shrink: 0;
}

.cat-sel__list {
  max-height: 340px;
  overflow-y: auto;
  padding: 12px;
  scrollbar-width: thin;
}

.cat-sel__null-opt {
  width: 100%;
  display: flex; align-items: center; gap: 9px;
  padding: 8px 10px; margin-bottom: 10px;
  border: 0; border-radius: var(--radius-sm, 8px);
  cursor: pointer; background: transparent;
  font-family: var(--font-body, sans-serif);
  font-size: 13px; color: var(--fg-2, #64748b);
  &:hover { background: var(--surface-2, #f8fafc); }
}

.cat-sel__group { margin-bottom: 14px; }
.cat-sel__group-head {
  display: flex; align-items: center; gap: 8px;
  margin-bottom: 8px;
}
.cat-sel__group-dot {
  width: 9px; height: 9px;
  border-radius: 3px; flex-shrink: 0;
}
.cat-sel__group-name {
  font-family: var(--font-body, sans-serif);
  font-size: 11px; font-weight: 700; letter-spacing: .04em;
}
.cat-sel__group-pct {
  font-family: var(--font-money, monospace);
  font-size: 10.5px; color: var(--fg-3, #94a3b8);
}
.cat-sel__group-line { flex: 1; height: 1px; background: var(--border-hairline, #e2e8f0); }

.cat-sel__group-pills {
  display: flex; flex-wrap: wrap; gap: 7px;
}
.cat-sel__pill {
  display: inline-flex; align-items: center; gap: 7px;
  padding: 8px 11px; border-radius: 999px; cursor: pointer;
  font-family: var(--font-body, sans-serif);
  font-size: 12.5px; font-weight: 500;
  transition: all 140ms;
  &:hover { opacity: .85; }
}

/* Flat list (when searching) */
.cat-sel__flat-row {
  width: 100%;
  display: flex; align-items: center; gap: 11px;
  padding: 10px 11px; border: 0; border-radius: var(--radius-sm, 8px);
  cursor: pointer; background: transparent; margin-bottom: 2px;
  font-family: var(--font-body, sans-serif);
  transition: background 120ms;
  &:hover, &--active { background: var(--surface-2, #f8fafc); }
}
.cat-sel__flat-icon {
  width: 30px; height: 30px; border-radius: 8px; flex-shrink: 0;
  display: inline-flex; align-items: center; justify-content: center;
}
.cat-sel__flat-name {
  flex: 1; text-align: left;
  font-size: 13.5px; font-weight: 500; color: var(--fg-1, #0f172a);
}
.cat-sel__flat-jar {
  display: inline-flex; align-items: center; gap: 5px;
  padding: 3px 9px; border-radius: 999px;
  font-family: var(--font-body, sans-serif);
  font-size: 11px; font-weight: 600; color: var(--fg-2, #64748b);
}
.cat-sel__flat-jar-dot {
  width: 7px; height: 7px; border-radius: 2px; flex-shrink: 0;
}
.cat-sel__empty {
  padding: 20px 8px; text-align: center;
  font-family: var(--font-body, sans-serif);
  font-size: 13px; color: var(--fg-3, #94a3b8);
}
</style>
