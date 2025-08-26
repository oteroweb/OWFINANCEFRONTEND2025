<template>
  <q-page padding>
    <q-card flat bordered>
      <q-card-section class="row items-center justify-between">
        <div>
          <div class="text-h6">Mis Cántaros</div>
          <div class="text-caption text-grey-7">
            Distribuye y visualiza tus porcentajes por frascos
          </div>
        </div>
        <!-- acciones a la derecha -->
        <div class="row items-center q-gutter-sm">
          <q-btn color="primary" icon="add" label="Añadir cántaro" @click="createJar" />
          <q-btn
            class="apply-template-btn"
            color="accent"
            icon="layers"
            label="Aplicar plantilla"
            unelevated
            glossy
            @click="openTemplatesDialog"
          />
          <div
            class="text-subtitle2 q-ml-md"
            :class="{ 'text-negative': !hasFixedJar && totalPercentage > 100, 'text-warning': !hasFixedJar && totalPercentage < 100 }"
          >
            Total: {{ totalPercentage }}%
            <q-tooltip v-if="hasFixedJar">Hay cántaros fijos; la suma de % es informativa.</q-tooltip>
          </div>
        </div>
        <div class="row q-col-gutter-lg">
          <div class="col-12 col-lg-8">
            <Draggable
              v-if="jarElements.length > 0"
              v-model="jarElements"
              group="jars"
              item-key="uid"
              handle=".jar-drag-handle"
              class="row q-col-gutter-lg"
              :animation="180"
              :ghost-class="'drag-ghost'"
              :chosen-class="'drag-chosen'"
              :force-fallback="true"
            >
              <template #item="{ element: jar, index: idx }">
                <div class="col-12">
                  <q-card flat class="q-pa-md">
                    <div class="row items-start">
                      <div class="col-auto">
                        <!-- Jar visual -->
                        <div class="jar-visual jar-drag-handle" style="cursor: grab">
                          <div class="jar-cap" />
                          <div class="jar-body">
                            <div
                              class="jar-fill"
                              :style="{
                                height: (jar.type === 'percent' ? jar.percent || 0 : 0) + '%',
                                background: jarFillGradient(),
                              }"
                            />
                          </div>
                        </div>
                        <div class="jar-caption text-center q-mt-xs" style="max-width: 140px">
                          <div class="jar-title ellipsis-2-lines">{{ jar.name }}</div>
                          <div class="jar-type text-caption text-grey-7 ellipsis">
                            {{ jar.type === 'percent' ? 'Porcentaje' : 'Fijo' }}
                          </div>
                        </div>
                      </div>
                      <div class="col">
                        <div class="row items-center justify-between q-gutter-sm">
                          <q-input
                            v-model="jar.name"
                            dense
                            filled
                            placeholder="Nombre del cántaro"
                            :maxlength="60"
                            style="max-width: 280px"
                            @blur="() => onJarNameBlur(idx)"
                          />
                          <div class="row items-center q-gutter-sm">
                            <q-btn-toggle
                              v-model="jar.type"
                              :options="jarTypeOptions"
                              dense
                              unelevated
                              toggle-color="primary"
                              color="grey-4"
                              @update:model-value="() => onJarTypeChange(idx)"
                            />
                            <div class="text-caption text-grey-6">$ fijo / % porcentaje</div>
                            <div class="text-caption text-grey-7">
                              Asignadas: {{ jar.categories?.length || 0 }}
                            </div>
                            <q-btn
                              flat
                              dense
                              round
                              color="negative"
                              icon="delete"
                              @click="() => deleteJar(idx)"
                              :disable="(jar.categories?.length || 0) === 0 ? false : false"
                            >
                              <q-tooltip>Eliminar cántaro</q-tooltip>
                            </q-btn>
                          </div>
                        </div>
                        <div class="row items-center q-gutter-sm q-mt-xs">
                          <template v-if="jar.type === 'percent'">
                            <q-slider
                              v-model.number="jar.percent"
                              :min="0"
                              :max="100"
                              :step="1"
                              color="primary"
                              class="col"
                              @update:model-value="onPercentChange"
                            />
                            <q-input
                              v-model.number="jar.percent"
                              type="number"
                              dense
                              filled
                              style="width: 80px"
                              suffix="%"
                              @update:model-value="onPercentChange"
                            />
                          </template>
                          <template v-else>
                            <q-input
                              v-model.number="jar.fixedAmount"
                              type="number"
                              dense
                              filled
                              style="width: 140px"
                              prefix="$"
                              step="0.01"
                              min="0"
                              @update:model-value="onFixedAmountChange"
                            />
                          </template>
                        </div>
                        <!-- Zona de arrastre de categorías -->
                        <div
                          class="jar-dropzone q-mt-md"
                          :class="{ 'is-drop-target': jarDropOverIndex === idx }"
                          @dragover.prevent="() => onJarDragOver(idx)"
                          @dragleave="() => onJarDragLeave(idx)"
                          @drop.prevent="(ev) => onJarDrop(idx, ev)"
                        >
                          <div class="text-caption text-grey-7 q-mb-xs">
                            Arrastra categorías aquí
                          </div>
                          <div v-if="(jar.categories?.length || 0) === 0" class="text-grey-5">
                            Ninguna asignada
                          </div>
                          <div v-else class="q-gutter-xs">
                            <q-chip
                              v-for="c in jar.categories"
                              :key="c.id"
                              dense
                              v-bind="categoryChipBind(c.label)"
                              removable
                              @remove="() => removeCategoryFromJar(idx, c.id)"
                            >
                              {{ c.label }}
                            </q-chip>
                          </div>
                        </div>
                      </div>
                    </div>
                  </q-card>
                </div>
              </template>
            </Draggable>
            <div v-if="jarElements.length === 0" class="text-warning">
              No hay cántaros para mostrar.
            </div>
          </div>

          <!-- Columna: Árbol de categorías -->
          <div class="col-12 col-lg-4 sticky-categories">
            <q-card flat bordered class="sticky-categories-card">
              <q-card-section class="q-pb-none">
                <div class="text-subtitle2">Categorías</div>
                <div class="text-caption text-grey-7">Arrastra una categoría hacia un cántaro</div>
              </q-card-section>
              <q-separator />
              <q-card-section class="q-pt-sm">
                <CategoriesTree ref="categoriesTreeRef" :readonly="true" />
              </q-card-section>
            </q-card>
          </div>
        </div>
      </q-card-section>

      <q-separator />
      <q-card-actions align="right">
        <q-btn
          label="Guardar Cambios"
          color="primary"
          @click="saveChanges"
          :disable="!hasFixedJar && totalPercentage !== 100"
        />
      </q-card-actions>
    </q-card>
  </q-page>

  <!-- Selector grande de plantillas -->
  <q-dialog v-model="showTemplates" persistent maximized>
    <q-card class="column full-height">
      <q-toolbar>
        <q-toolbar-title>Seleccionar plantilla de cántaros</q-toolbar-title>
        <q-space />
        <q-btn flat round icon="close" v-close-popup />
      </q-toolbar>
      <q-separator />
      <q-card-section class="col q-pa-none">
        <q-scroll-area class="fit">
          <div class="q-pa-md row q-col-gutter-lg">
            <div class="col-12" v-if="loadingTemplates">
              <q-skeleton type="rect" height="120px" class="q-mb-md" v-for="n in 3" :key="n" />
            </div>
            <template v-else>
              <div
                v-for="tpl in templates"
                :key="tpl.slug || tpl.id || tpl.name"
                class="col-12 col-md-6 col-lg-4"
              >
                <q-card bordered class="q-pa-sm">
                  <q-card-section>
                    <div class="text-subtitle1">{{ tpl.name }}</div>
                    <div class="text-caption text-grey-7">{{ tpl.description }}</div>
                  </q-card-section>
                  <q-separator />
                  <q-card-section>
                    <div class="text-caption text-grey-8 q-mb-xs">Jarras</div>
                    <div class="col q-gutter-xs">
                      <q-chip
                        v-for="j in tpl.jars || []"
                        :key="(j.sort_order || 0) + '-' + (j.name || '')"
                        v-bind="jarChipBind(j)"
                        dense
                        class="q-mr-xs q-mb-xs"
                      >
                        {{ j.name }}
                        <span v-if="j.type === 'percent' && j.percent != null">
                          — {{ j.percent }}%</span
                        >
                        <span v-else-if="j.fixed_amount != null"> — fijo</span>
                      </q-chip>
                    </div>
                    <!-- Categorías sugeridas por jar (si existen) -->
                    <div
                      v-for="j in tpl.jars || []"
                      :key="'cats-' + (j.sort_order || 0) + '-' + (j.name || '')"
                    >
                      <div
                        v-if="Array.isArray(j.categories) && j.categories.length"
                        class="q-mt-sm"
                      >
                        <div class="text-caption text-grey-7 q-mb-xs">
                          Categorías para {{ j.name }}
                        </div>
                        <div class="col q-gutter-xs">
                          <q-chip
                            v-for="cat in j.categories"
                            :key="typeof cat === 'string' ? cat : cat.id ?? (cat.name || '')"
                            dense
                            v-bind="categoryChipBind(cat)"
                            class="q-mr-xs q-mb-xs"
                          >
                            {{ typeof cat === 'string' ? cat : cat.name || '' }}
                          </q-chip>
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                  <q-separator />
                  <q-card-actions align="right">
                    <q-btn
                      color="primary"
                      label="Aplicar"
                      @click="() => confirmApplyTemplate(tpl)"
                    />
                  </q-card-actions>
                </q-card>
              </div>
            </template>
          </div>
        </q-scroll-area>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from 'stores/auth';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import CategoriesTree from 'components/CategoriesTree.vue';
import Draggable from 'vuedraggable';

defineOptions({ name: 'JarsOverviewPage' });

type Jar = {
  uid: string;
  id?: number;
  name: string;
  // percent jars use percent; fixed jars use fixedAmount
  percent?: number | undefined;
  fixedAmount?: number | undefined;
  type: 'percent' | 'fixed';
  color?: string | undefined;
  categories?: Array<{ id: string; label: string }>;
};

// API response typing for jars
type JarAPI = {
  id?: number;
  name?: string;
  percent?: number;
  type?: string;
  fixed_amount?: number;
  amount?: number;
  categories?: Array<{ id: string | number; name?: string; label?: string }>;
};

type CatNodeInput = {
  id: string | number;
  label: string;
  type?: 'folder' | 'category';
  icon?: string | null;
  children?: CatNodeInput[];
};

const $q = useQuasar();
const auth = useAuthStore();
const jarElements = ref<Jar[]>([]);

// Drag state for per-jar dropzones
const jarDropOverIndex = ref<number | null>(null);

// Tree ref (typed with exposed API) and map of categories for quick lookup on drop
type CategoriesTreeExposed = {
  setTreeFlexible: (
    payload: CatNodeInput[] | { id: string | number; label?: string; children?: CatNodeInput[] }
  ) => void;
  removeNode: (id: string) => void;
  addCategoryToParent: (
    category: { id: string; label: string; type?: 'folder' | 'category'; icon?: string | null },
    parentId?: string | null
  ) => void;
};
const categoriesTreeRef = ref<CategoriesTreeExposed | null>(null);
type CatInfo = {
  id: string;
  label: string;
  type: 'folder' | 'category';
  children?: string[] | undefined;
  parent?: string | undefined;
};
const categoriesMap = ref<Record<string, CatInfo>>({});
// Carpeta visible en árbol (para no recrearla y perder hijos)
const visibleFolders = ref<Set<string>>(new Set());

// Generador de uid estable para draggable
function genUid(seed?: string | number) {
  const base = seed != null ? String(seed) : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  return `jar-${base}`;
}

function mkJar(name: string, percent: number, type: 'percent' | 'fixed', id?: number): Jar {
  const j: Jar = {
    uid: genUid(id ?? undefined),
    name,
    percent,
    type,
    color: undefined,
    categories: [],
  };
  if (id != null) j.id = id;
  return j;
}

// Plantillas
type TemplateJar = {
  id?: number;
  name: string;
  type: 'percent' | 'fixed';
  percent?: number | null;
  fixed_amount?: number | null;
  base_scope?: string | null;
  color?: string | null;
  sort_order?: number | null;
  // Optional: suggested categories to show in the template selector
  categories?: Array<
    | string
    | {
        id?: string | number;
        name?: string;
        color?: string | null;
      }
  >;
};
type JarTemplate = {
  id?: number;
  name: string;
  slug?: string;
  description?: string | null;
  active?: number | boolean;
  jars?: TemplateJar[];
};
const showTemplates = ref(false);
const loadingTemplates = ref(false);
const templates = ref<JarTemplate[]>([]);

// Helpers for category chip colors (stable per label)
function hashString(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}
function hslToHex(h: number, s: number, l: number): string {
  // h: 0-360, s,l: 0-100
  s /= 100;
  l /= 100;
  const k = (n: number) => (n + h / 30) % 12;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const toHex = (x: number) =>
    Math.round(255 * x)
      .toString(16)
      .padStart(2, '0');
  return `#${toHex(f(0))}${toHex(f(8))}${toHex(f(4))}`;
}
function autoColorForLabel(label: string): string {
  if (!label) return '#9CA3AF';
  const h = hashString(label) % 360;
  const s = 65; // saturation
  const l = 45; // lightness
  return hslToHex(h, s, l);
}
function luminance(hex: string): number {
  const m = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!m) return 0;
  const r = parseInt(m[1]!, 16) / 255;
  const g = parseInt(m[2]!, 16) / 255;
  const b = parseInt(m[3]!, 16) / 255;
  const arr = [r, g, b].map((v) => (v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)));
  const [rL, gL, bL] = arr as [number, number, number];
  return 0.2126 * rL + 0.7152 * gL + 0.0722 * bL;
}
function categoryBgColor(label: string): string {
  return autoColorForLabel(label);
}
//
function contrastTextColor(bgHex: string): 'black' | 'white' {
  return luminance(bgHex) > 0.5 ? 'black' : 'white';
}

// Prefer inline style when color is hex; otherwise use Quasar palette color prop
function isHexColor(val?: string | null): boolean {
  if (!val) return false;
  return /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(val.trim());
}
function jarChipBind(j: TemplateJar) {
  const bg = j.color || '';
  if (isHexColor(bg)) {
    const text = contrastTextColor(bg);
    return { style: { backgroundColor: bg, color: text } };
  }
  // palette token or empty
  return { color: bg || 'grey-6', textColor: 'white' } as const;
}
function categoryChipBind(
  cat: string | { id?: string | number; name?: string; color?: string | null }
) {
  const label = typeof cat === 'string' ? cat : cat.name || '';
  const bg = typeof cat === 'string' ? categoryBgColor(label) : cat.color || categoryBgColor(label);
  if (isHexColor(bg)) {
    const text = contrastTextColor(bg);
    return { style: { backgroundColor: bg, color: text } };
  }
  // unlikely path (palette token), but keep consistent
  return { color: bg, textColor: contrastTextColor('#777') } as const;
}

// Datos dummy de plantillas (hasta conectar backend)
const DUMMY_TEMPLATES: JarTemplate[] = [
  {
    name: 'Moderado',
    slug: 'moderado',
    description: 'Distribución equilibrada',
    active: 1,
    jars: [
      {
        name: 'Necesidades básicas',
        type: 'percent',
        percent: 55,
        color: '#6B7280',
        sort_order: 1,
        categories: [
          { name: 'Alquiler' },
          { name: 'Comida' },
          { name: 'Transporte' },
          { name: 'Servicios' },
        ],
      },
      {
        name: 'Diversión',
        type: 'percent',
        percent: 10,
        color: '#F59E0B',
        sort_order: 2,
        categories: ['Cine', 'Restaurantes', 'Eventos'],
      },
      {
        name: 'Ahorro',
        type: 'percent',
        percent: 10,
        color: '#10B981',
        sort_order: 3,
        categories: ['Fondo de emergencia'],
      },
      {
        name: 'Educación',
        type: 'percent',
        percent: 10,
        color: '#3B82F6',
        sort_order: 4,
        categories: ['Cursos', 'Libros'],
      },
      {
        name: 'Reservas',
        type: 'percent',
        percent: 10,
        color: '#8B5CF6',
        sort_order: 5,
        categories: ['Imprevistos'],
      },
      {
        name: 'Caridad y regalos',
        type: 'percent',
        percent: 5,
        color: '#EF4444',
        sort_order: 6,
        categories: ['Donaciones'],
      },
    ],
  },
  {
    name: 'Avanzado',
    slug: 'avanzado',
    description: 'Más categorías, coche 5% y reparto detallado',
    active: 1,
    jars: [
      {
        name: 'Necesidades básicas',
        type: 'percent',
        percent: 50,
        color: '#6B7280',
        sort_order: 1,
        categories: ['Comida', 'Alquiler', 'Luz', 'Agua'],
      },
      {
        name: 'Salud',
        type: 'percent',
        percent: 10,
        color: '#EF4444',
        sort_order: 2,
        categories: ['Seguro médico', 'Farmacia'],
      },
      {
        name: 'Educación',
        type: 'percent',
        percent: 10,
        color: '#3B82F6',
        sort_order: 3,
        categories: ['Cursos', 'Libros'],
      },
      {
        name: 'Empresa',
        type: 'percent',
        percent: 10,
        color: '#8B5CF6',
        sort_order: 4,
        categories: ['Herramientas', 'Licencias'],
      },
      {
        name: 'Coche / Auto y transporte',
        type: 'percent',
        percent: 5,
        color: '#F59E0B',
        sort_order: 5,
        categories: ['Gasolina', 'Mantenimiento'],
      },
      {
        name: 'Hogar cómodo',
        type: 'percent',
        percent: 5,
        color: '#10B981',
        sort_order: 6,
        categories: ['Muebles', 'Decoración'],
      },
      {
        name: 'Ocio / Diversión',
        type: 'percent',
        percent: 5,
        color: '#FCD34D',
        sort_order: 7,
        categories: ['Cine', 'Conciertos'],
      },
      {
        name: 'Viajes',
        type: 'percent',
        percent: 5,
        color: '#60A5FA',
        sort_order: 8,
        categories: ['Vuelos', 'Hoteles'],
      },
    ],
  },
  {
    name: 'Conservador',
    slug: 'conservador',
    description: 'Más peso a necesidades y ahorro',
    active: 1,
    jars: [
      {
        name: 'Necesidades básicas',
        type: 'percent',
        percent: 60,
        color: '#6B7280',
        sort_order: 1,
        categories: ['Comida', 'Transporte'],
      },
      {
        name: 'Ahorro',
        type: 'percent',
        percent: 15,
        color: '#10B981',
        sort_order: 2,
        categories: ['Fondo de emergencia'],
      },
      {
        name: 'Reservas',
        type: 'percent',
        percent: 10,
        color: '#8B5CF6',
        sort_order: 3,
        categories: ['Imprevistos'],
      },
      {
        name: 'Educación',
        type: 'percent',
        percent: 5,
        color: '#3B82F6',
        sort_order: 4,
        categories: ['Cursos'],
      },
      {
        name: 'Diversión',
        type: 'percent',
        percent: 5,
        color: '#F59E0B',
        sort_order: 5,
        categories: ['Cine'],
      },
      {
        name: 'Caridad y regalos',
        type: 'percent',
        percent: 5,
        color: '#EF4444',
        sort_order: 6,
        categories: ['Donaciones'],
      },
    ],
  },
  {
    name: 'Arriesgado',
    slug: 'arriesgado',
    description: 'Más ocio y metas',
    active: 1,
    jars: [
      {
        name: 'Necesidades básicas',
        type: 'percent',
        percent: 40,
        color: '#6B7280',
        sort_order: 1,
        categories: ['Alquiler', 'Comida'],
      },
      {
        name: 'Diversión',
        type: 'percent',
        percent: 20,
        color: '#F59E0B',
        sort_order: 2,
        categories: ['Restaurantes', 'Cine', 'Eventos'],
      },
      {
        name: 'Ahorro',
        type: 'percent',
        percent: 15,
        color: '#10B981',
        sort_order: 3,
        categories: ['Inversiones'],
      },
      {
        name: 'Educación',
        type: 'percent',
        percent: 10,
        color: '#3B82F6',
        sort_order: 4,
        categories: ['Cursos online'],
      },
      {
        name: 'Reservas',
        type: 'percent',
        percent: 10,
        color: '#8B5CF6',
        sort_order: 5,
        categories: ['Imprevistos'],
      },
      {
        name: 'Caridad y regalos',
        type: 'percent',
        percent: 5,
        color: '#EF4444',
        sort_order: 6,
        categories: ['Donaciones'],
      },
    ],
  },
];

const totalPercentage = computed(() => {
  const sum = (jarElements.value || [])
    .filter((j) => j.type === 'percent')
    .reduce((acc, j) => acc + (Number(j.percent) || 0), 0);
  return Math.round(sum * 100) / 100;
});
const hasFixedJar = computed(() => (jarElements.value || []).some((j) => j.type === 'fixed'));

function onPercentChange() {
  // Clamp between 0-100 and round to int for percent jars only
  jarElements.value = jarElements.value.map((j) =>
    j.type === 'percent'
      ? { ...j, percent: Math.max(0, Math.min(100, Math.round(Number(j.percent) || 0))) }
      : j
  );
}
function onFixedAmountChange() {
  // Ensure non-negative, 2 decimals for fixed jars
  jarElements.value = jarElements.value.map((j) =>
    j.type === 'fixed'
      ? { ...j, fixedAmount: Math.max(0, Number(Number(j.fixedAmount || 0).toFixed(2))) }
      : j
  );
}
const jarTypeOptions: Array<{ label: string; value: 'percent' | 'fixed' }> = [
  { label: '% Porcentaje', value: 'percent' },
  { label: '$ Monto Fijo', value: 'fixed' },
];

function onJarTypeChange(idx: number) {
  const j = jarElements.value[idx];
  if (!j) return;
  if (j.type === 'percent') {
    // initialize percent if missing
    j.percent = Math.max(0, Math.min(100, Math.round(Number(j.percent ?? 0))));
    j.fixedAmount = undefined;
  } else {
    // fixed
    j.fixedAmount = Math.max(0, Number(Number(j.fixedAmount ?? 0).toFixed(2)));
  }
}

function onJarNameBlur(idx: number) {
  const jar = jarElements.value[idx];
  if (!jar) return;
  jar.name = (jar.name || '').trim();
  if (!jar.name) {
    jar.name = `Cántaro ${idx + 1}`;
  }
}

function createJar() {
  const remaining = Math.max(0, 100 - totalPercentage.value);
  const nextIndex = jarElements.value.length + 1;
  jarElements.value.push({
    uid: genUid(),
    name: `Cántaro ${nextIndex}`,
    percent: remaining,
    type: 'percent',
    categories: [],
  });
}

function deleteJar(idx: number) {
  const jar = jarElements.value[idx];
  if (!jar) return;
  const hasCats = (jar.categories?.length || 0) > 0;
  const proceed = () => {
    // Devolver categorías al árbol antes de eliminar
    const cats = [...(jar.categories || [])];
    for (const c of cats) {
      removeCategoryFromJar(idx, c.id);
    }
    jarElements.value.splice(idx, 1);
    $q.notify({ type: 'positive', message: 'Cántaro eliminado' });
  };
  if (!hasCats) return proceed();
  $q.dialog({
    title: 'Eliminar cántaro',
    message:
      'Este cántaro tiene categorías asignadas. Se devolverán al árbol de categorías. ¿Deseas continuar?',
    cancel: true,
    persistent: true,
  }).onOk(proceed);
}

// Nota: función de plantilla por defecto eliminada por no usarse

function openTemplatesDialog() {
  showTemplates.value = true;
  if (templates.value.length === 0) void loadTemplates();
}

async function loadTemplates() {
  loadingTemplates.value = true;
  try {
    const res = await api.get('/jar-templates', { params: { active: 1, per_page: 100 } });
    const arr = (res.data?.data || res.data || []) as JarTemplate[];
    templates.value = Array.isArray(arr) && arr.length > 0 ? arr : DUMMY_TEMPLATES;
  } catch (e) {
    templates.value = DUMMY_TEMPLATES;
    $q.notify({ type: 'warning', message: 'No se pudieron cargar plantillas, usando demo' });
    console.warn('loadTemplates error', e);
  } finally {
    loadingTemplates.value = false;
  }
}

function confirmApplyTemplate(tpl: JarTemplate) {
  $q.dialog({
    title: 'Aplicar plantilla',
    message:
      'Esto eliminará la configuración actual de cántaros y aplicará la plantilla seleccionada. ¿Deseas continuar?',
    cancel: true,
    persistent: true,
  }).onOk(() => applyTemplate(tpl));
}

function applyTemplate(tpl: JarTemplate) {
  // Devolver categorías de todos los jars actuales al árbol
  for (let i = 0; i < jarElements.value.length; i++) {
    const jar = jarElements.value[i];
    if (!jar) continue;
    while (true) {
      const first = jar.categories?.[0];
      if (!first) break;
      removeCategoryFromJar(i, first.id);
    }
  }
  // Construir nuevos jars desde la plantilla
  const jars = (tpl.jars || []).slice().sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0));
  jarElements.value = jars.map((j) => {
    const t: 'percent' | 'fixed' = j.type === 'fixed' ? 'fixed' : 'percent';
    const percent = t === 'percent' && j.percent != null ? Number(j.percent) : 0;
    const jar = mkJar(j.name, percent, t);
    if (t === 'fixed') {
      jar.fixedAmount = Number(j.fixed_amount ?? 0);
    }
    jar.color = j.color || undefined;
    return jar;
  });
  showTemplates.value = false;
  $q.notify({ type: 'positive', message: `Plantilla "${tpl.name}" aplicada` });
}

function jarFillGradient(): string {
  // Azul consistente para mejorar la legibilidad del porcentaje dentro del frasco
  // Usa el primario si existe; fallback a un azul (#1976D2)
  return 'linear-gradient(180deg, rgba(25,118,210,0.95) 0%, rgba(25,118,210,0.9) 60%, rgba(25,118,210,0.75) 100%)';
}

async function loadJarData() {
  try {
    // Prefer backend if available
    const res = await api.get('/jars', { params: { user_id: auth.user?.id, per_page: 100 } });
  const raw = (res.data?.data || res.data || []) as JarAPI[];
  const mapped: Jar[] = (Array.isArray(raw) ? raw : []).map((r, i) => {
  const idVal = (r as { id?: number }).id;
  const t: 'percent' | 'fixed' = r.type === 'fixed' ? 'fixed' : 'percent';
      const j = mkJar(
        r.name || `Cántaro ${i + 1}`,
        Math.max(0, Math.min(100, Number(r.percent ?? 0))),
        t,
        idVal
      );
      if (t === 'fixed') j.fixedAmount = Number(r.fixed_amount ?? r.amount ?? 0);
      j.categories = Array.isArray(r.categories)
        ? r.categories.map((c) => ({
            id: String(c.id),
            label: String(c.label ?? c.name ?? 'Categoría'),
          }))
        : [];
      return j;
    });
    // Fallback demo if API returns empty
    jarElements.value = mapped.length
      ? mapped
      : [
          mkJar('Necesidades (55%)', 55, 'percent'),
          mkJar('Ahorro (10%)', 10, 'percent'),
          mkJar('Formación (10%)', 10, 'percent'),
          mkJar('Diversión (10%)', 10, 'percent'),
          mkJar('Donación (10%)', 10, 'percent'),
          mkJar('Libertad (5%)', 5, 'percent'),
        ];
  } catch (e) {
    // Fallback to demo and notify
    jarElements.value = [
      mkJar('Necesidades (55%)', 55, 'percent'),
      mkJar('Ahorro (10%)', 10, 'percent'),
      mkJar('Formación (10%)', 10, 'percent'),
      mkJar('Diversión (10%)', 10, 'percent'),
      mkJar('Donación (10%)', 10, 'percent'),
      mkJar('Libertad (5%)', 5, 'percent'),
    ];
    $q.notify({ type: 'warning', message: 'No se pudieron cargar los cántaros; usando muestra' });
    console.error('loadJarData error', e);
  }
}

async function loadCategoriesTree() {
  // Cargar árbol real de categorías del usuario (soporta varias formas de payload)
  try {
    type RemoteNode = {
      id: string | number;
      name?: string;
      label?: string;
      type?: 'folder' | 'category';
      icon?: string | null;
      children?: RemoteNode[];
    };
    const res = await api.get('/categories/tree', {
      params: { per_page: 1000, user_id: auth.user?.id },
    });
    const data = (res.data as { data?: unknown }).data;
    const raw: RemoteNode[] = Array.isArray(data)
      ? (data as RemoteNode[])
      : data && typeof data === 'object' && Array.isArray((data as { nodes?: unknown }).nodes)
      ? ((data as { nodes?: unknown }).nodes as RemoteNode[])
      : (res.data as RemoteNode[]) || [];
    const mapNodes = (nodes: RemoteNode[]): CatNodeInput[] =>
      nodes.map((n) => {
        const kids = n.children ? mapNodes(n.children) : [];
        const type: 'folder' | 'category' = n.type
          ? n.type
          : kids.length > 0
          ? 'folder'
          : 'category';
        return {
          id: n.id,
          label: String(n.label ?? n.name ?? ''),
          type,
          icon: n.icon || null,
          children: kids,
        };
      });
    setCategories(raw.length ? mapNodes(raw) : []);
  } catch (e) {
    $q.notify({ type: 'warning', message: 'No se pudieron cargar tus categorías; usando muestra' });
    const demo: CatNodeInput[] = [
      {
        id: 'gastos',
        label: 'Gastos',
        children: [
          { id: 'alquiler', label: 'Alquiler' },
          { id: 'comida', label: 'Comida' },
          { id: 'transporte', label: 'Transporte' },
        ],
      },
      {
        id: 'ingresos',
        label: 'Ingresos',
        children: [
          { id: 'sueldo', label: 'Sueldo' },
          { id: 'freelance', label: 'Freelance' },
        ],
      },
    ];
    setCategories(demo);
    console.warn('loadCategoriesTree fallback demo', e);
  }
}

function setCategories(nodes: CatNodeInput[]) {
  // Carga el árbol en el componente y construye un mapa rápido
  categoriesTreeRef.value?.setTreeFlexible(nodes);
  const map: Record<string, CatInfo> = {};
  const initialVisible = new Set<string>();
  const collectLeafIds = (arr: CatNodeInput[], acc: string[] = []) => {
    for (const n of arr) {
      const isFolder = !!(n.children && n.children.length);
      if (isFolder && n.children) collectLeafIds(n.children, acc);
      if (!isFolder) acc.push(String(n.id));
    }
    return acc;
  };
  const walk = (arr: CatNodeInput[], parentId?: string) => {
    for (const n of arr) {
      const type: 'folder' | 'category' = n.type
        ? n.type
        : n.children && n.children.length
        ? 'folder'
        : 'category';
      map[String(n.id)] = {
        id: String(n.id),
        label: String(n.label),
        type,
        children: type === 'folder' ? collectLeafIds(n.children || []) : undefined,
        parent: parentId,
      };
      if (type === 'folder') initialVisible.add(String(n.id));
      if (n.children?.length) walk(n.children, String(n.id));
    }
  };
  walk(nodes);
  categoriesMap.value = map;
  visibleFolders.value = initialVisible;
}

function onJarDragOver(idx: number) {
  jarDropOverIndex.value = idx;
}
function onJarDragLeave(idx: number) {
  if (jarDropOverIndex.value === idx) jarDropOverIndex.value = null;
}
function onJarDrop(idx: number, ev: DragEvent) {
  jarDropOverIndex.value = null;
  const id = ev.dataTransfer?.getData('text/plain');
  if (!id) return;
  const info = categoriesMap.value[id];
  if (!info) {
    $q.notify({ type: 'warning', message: 'Elemento no válido' });
    return;
  }
  const jar = jarElements.value[idx];
  if (!jar) return;
  jar.categories = jar.categories || [];

  const isAssignedAnywhere = (catId: string) =>
    jarElements.value.some((j) => (j.categories || []).some((c) => c.id === catId));

  const addCategoryToJar = (
    catId: string,
    label: string,
    { forceMove }: { forceMove: boolean }
  ) => {
    // Encontrar propietario actual
    let owner: Jar | null = null;
    for (const j of jarElements.value) {
      if ((j.categories || []).some((c) => c.id === catId)) {
        owner = j;
        break;
      }
    }
    if (owner && owner !== jar) {
      if (!forceMove) return; // no mover en drop de carpeta
      owner.categories = (owner.categories || []).filter((c) => c.id !== catId);
    }
    if (!(jar.categories || []).some((c) => c.id === catId)) {
      (jar.categories || (jar.categories = [])).push({ id: catId, label });
    }
    categoriesTreeRef.value?.removeNode(catId);
  };

  if (info.type === 'category') {
    addCategoryToJar(info.id, info.label, { forceMove: true });
  } else {
    // Carpeta: añadir todas las hojas (categorías) evitando duplicados
    const leafIds = info.children || [];
    if (leafIds.length === 0) return;
    leafIds.forEach((leafId) => {
      const leaf = categoriesMap.value[leafId];
      if (!leaf || leaf.type !== 'category') return;
      // Solo añadir si no está asignada en ningún cántaro
      if (!isAssignedAnywhere(leaf.id)) {
        addCategoryToJar(leaf.id, leaf.label, { forceMove: false });
      }
    });
    // Ocultar carpeta del árbol hasta que alguna categoría regrese
    categoriesTreeRef.value?.removeNode(info.id);
    visibleFolders.value.delete(info.id);
  }
}

function removeCategoryFromJar(idx: number, catId: string) {
  const jar = jarElements.value[idx];
  if (!jar) return;
  jar.categories = (jar.categories || []).filter((c) => c.id !== catId);
  // Reincorporar al árbol (bajo root) para que pueda ser usado en otro cántaro
  const catInfo = categoriesMap.value[catId];
  if (catInfo && catInfo.type === 'category') {
    // Asegurar que la carpeta original exista; si no, crearla una vez
    const parentId = catInfo.parent || 'root';
    if (catInfo.parent) {
      const parent = categoriesMap.value[catInfo.parent];
      if (parent && !visibleFolders.value.has(parent.id)) {
        categoriesTreeRef.value?.addCategoryToParent(
          { id: parent.id, label: parent.label, type: 'folder' },
          'root'
        );
        visibleFolders.value.add(parent.id);
      }
    }
    categoriesTreeRef.value?.addCategoryToParent(
      { id: catInfo.id, label: catInfo.label, type: 'category' },
      parentId
    );
  }
}

function saveChanges() {
  if (!hasFixedJar.value && totalPercentage.value !== 100) {
    $q.notify({ type: 'warning', message: 'El total debe sumar 100% antes de guardar' });
    return;
  }
  // TODO: enviar a backend (PUT /jars/bulk?) si existe endpoint
  // Incluye asignaciones de categorías por jar
  const payload = jarElements.value.map((j) => ({
    id: j.id,
    name: j.name,
    type: j.type,
    percent: j.type === 'percent' ? j.percent : undefined,
    fixed_amount: j.type === 'fixed' ? j.fixedAmount : undefined,
    categories: (j.categories || []).map((c) => c.id),
  }));
  console.debug('save jars payload', payload);
  $q.notify({ type: 'positive', message: 'Cambios guardados (local)' });
}

onMounted(() => {
  void Promise.all([loadJarData(), loadCategoriesTree()]).then(() => {
    // Oculta en el árbol las categorías ya asignadas a algún cántaro
    const assigned = new Set<string>();
    for (const j of jarElements.value) {
      for (const c of j.categories || []) assigned.add(c.id);
    }
    if (assigned.size > 0) {
      assigned.forEach((id) => categoriesTreeRef.value?.removeNode(id));
    }
    // También ocultar carpetas que están totalmente asignadas
    Object.values(categoriesMap.value).forEach((node) => {
      if (node.type === 'folder') {
        const kids = node.children || [];
        if (kids.length > 0 && kids.every((kid) => assigned.has(kid))) {
          categoriesTreeRef.value?.removeNode(node.id);
          visibleFolders.value.delete(node.id);
        }
      }
    });
  });
});
</script>

<style scoped>
/* Layout */
.template-box {
  min-height: 420px;
  border: 2px dashed var(--q-grey-4);
  border-radius: 8px;
}

/* Visual tipo jarra */
.jar-visual {
  width: 60px;
  height: 100px;
  position: relative;
  display: inline-block;
}
.jar-visual--sm {
  transform: scale(0.92);
  transform-origin: center;
}
.jar-cap {
  width: 34px;
  height: 10px;
  background: #333;
  border-radius: 4px;
  margin: 0 auto 2px auto;
}
.jar-body {
  position: relative;
  width: 60px;
  height: 88px;
  margin: 0 auto;
  border: 3px solid var(--q-grey-4);
  border-bottom-left-radius: 12px;
  border-bottom-right-radius: 12px;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
  overflow: hidden;
  background: rgba(0, 0, 0, 0.02);
}
.jar-fill {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  transition: height 200ms ease;
}
.jar-percent {
  position: absolute;
  bottom: 6px;
  left: 0;
  width: 100%;
  text-align: center;
  color: #fff;
  font-weight: 600;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.7);
  pointer-events: none;
}
.jar-caption {
  line-height: 1.1;
}
.jar-title {
  font-size: 13px;
}
.jar-type {
  font-size: 11px;
}

/* Dropzone categorías */
.jar-dropzone {
  min-height: 64px;
  border: 1px dashed rgba(0, 0, 0, 0.25);
  border-radius: 8px;
  padding: 8px;
}
.jar-dropzone.is-drop-target {
  background: rgba(76, 175, 80, 0.08);
  border-color: rgba(76, 175, 80, 0.8);
}

.apply-template-btn :deep(.q-btn__content) {
  font-weight: 600;
}

/* Sticky categories column on desktop */
@media (min-width: 1024px) {
  .sticky-categories {
    position: sticky;
    top: 16px;
    align-self: flex-start;
    height: calc(100vh - 32px);
    /* ensure the card fills and its content can scroll */
  }
  .sticky-categories-card {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
  .sticky-categories-card .q-card__section:last-child {
    overflow: auto;
    flex: 1 1 auto;
  }
}
</style>
