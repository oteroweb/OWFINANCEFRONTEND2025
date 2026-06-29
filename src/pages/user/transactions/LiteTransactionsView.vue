<template>
  <q-page class="lite-page">
    <div class="lite-page__container">
      <!-- Header + Period navigator -->
      <div>
        <span class="t-eyebrow">Transacciones</span>
        <h1 class="t-h1" style="margin: 6px 0 16px; text-transform: capitalize;">{{ period.label }}</h1>
        <PeriodNavigator :compact="true" />
      </div>

      <!-- Filtro inteligente -->
      <div class="lite-card" style="padding: 16px; display: flex; flex-direction: column; gap: 14px;">
        <div class="filter-bar">
          <!-- Búsqueda -->
          <div class="search-field">
            <q-icon name="search" size="18px" color="var(--fg-3)" />
            <input
              v-model="query"
              placeholder="Buscar en concepto, cántaro, categoría, monto…"
              class="search-input"
            />
            <q-icon
              v-if="query"
              name="close"
              size="17px"
              color="var(--fg-3)"
              class="search-clear"
              @click="query = ''"
            />
          </div>

          <!-- Botón panel de filtros -->
          <div ref="panelRef" class="filter-panel-wrap">
            <button class="filter-btn" :class="{ 'filter-btn--active': activeCount > 0 }" @click="panelOpen = !panelOpen">
              <q-icon name="tune" size="18px" />
              <span>Filtros</span>
              <span v-if="activeCount > 0" class="filter-badge">{{ activeCount }}</span>
            </button>

            <!-- Desktop dropdown -->
            <div v-if="panelOpen" class="filter-panel filter-panel--desktop">
              <div class="filter-panel__header">
                <span class="filter-panel__title">Filtro inteligente</span>
                <button v-if="activeCount > 0" class="filter-panel__clear" @click="clearAll">Limpiar todo</button>
              </div>
              <div class="filter-panel__field">
                <span class="filter-panel__label">Tipo</span>
                <div class="type-toggle">
                  <button v-for="t in typeOptions" :key="t.id" :class="{ active: type === t.id }" @click="type = t.id">{{ t.label }}</button>
                </div>
              </div>
              <div class="filter-panel__field">
                <span class="filter-panel__label">Cántaro</span>
                <TxDropdown icon="savings" label="Todos los cántaros" :value="jar" :options="jarOptions" full @change="(v: string) => jar = v" />
              </div>
              <div class="filter-panel__field">
                <span class="filter-panel__label">Categoría</span>
                <TxDropdown icon="sell" label="Todas las categorías" :value="category" :options="categoryOptions" full @change="(v: string) => category = v" />
              </div>
              <div class="filter-panel__field">
                <span class="filter-panel__label">Día</span>
                <TxDropdown icon="event" label="Cualquier día" :value="day" :options="dayOptions" full @change="(v: string) => day = v" />
              </div>
              <div class="filter-panel__field">
                <span class="filter-panel__label">Monto</span>
                <div class="amount-inputs">
                  <div class="amount-input"><span>≥ $</span><input v-model="minAmount" type="number" placeholder="0" /></div>
                  <div class="amount-input"><span>≤ $</span><input v-model="maxAmount" type="number" placeholder="∞" /></div>
                </div>
                <div class="amount-presets">
                  <button v-for="p in amountPresets" :key="p.id" :class="{ active: minAmount === p.min && maxAmount === p.max }" @click="applyPreset(p)">{{ p.label }}</button>
                </div>
              </div>
            </div>
          </div>

          <!-- Mobile filter bottom-sheet -->
          <q-dialog v-model="panelOpen" position="bottom" class="filter-sheet-dialog">
            <div class="filter-sheet">
              <div class="filter-sheet__handle" />
              <div class="filter-panel__header" style="padding: 0 0 12px">
                <span class="filter-panel__title">Filtro inteligente</span>
                <button v-if="activeCount > 0" class="filter-panel__clear" @click="clearAll">Limpiar todo</button>
              </div>
              <div class="filter-panel__field">
                <span class="filter-panel__label">Tipo</span>
                <div class="type-toggle">
                  <button v-for="t in typeOptions" :key="t.id" :class="{ active: type === t.id }" @click="type = t.id">{{ t.label }}</button>
                </div>
              </div>
              <div class="filter-panel__field">
                <span class="filter-panel__label">Cántaro</span>
                <TxDropdown icon="savings" label="Todos los cántaros" :value="jar" :options="jarOptions" full @change="(v: string) => jar = v" />
              </div>
              <div class="filter-panel__field">
                <span class="filter-panel__label">Categoría</span>
                <TxDropdown icon="sell" label="Todas las categorías" :value="category" :options="categoryOptions" full @change="(v: string) => category = v" />
              </div>
              <div class="filter-panel__field">
                <span class="filter-panel__label">Día</span>
                <TxDropdown icon="event" label="Cualquier día" :value="day" :options="dayOptions" full @change="(v: string) => day = v" />
              </div>
              <div class="filter-panel__field">
                <span class="filter-panel__label">Monto</span>
                <div class="amount-inputs">
                  <div class="amount-input"><span>≥ $</span><input v-model="minAmount" type="number" placeholder="0" /></div>
                  <div class="amount-input"><span>≤ $</span><input v-model="maxAmount" type="number" placeholder="∞" /></div>
                </div>
                <div class="amount-presets">
                  <button v-for="p in amountPresets" :key="p.id" :class="{ active: minAmount === p.min && maxAmount === p.max }" @click="applyPreset(p)">{{ p.label }}</button>
                </div>
              </div>
              <q-btn unelevated color="primary" label="Aplicar filtros" style="width:100%;margin-top:8px" @click="panelOpen = false" />
            </div>
          </q-dialog>
        </div>

        <!-- Chips activos -->
        <div v-if="activeCount > 0" class="active-chips">
          <span
            v-for="chip in chips"
            :key="chip.key"
            class="active-chip"
          >
            <span v-if="chip.dot" class="active-chip__dot" :style="{ background: chip.dot }" />
            <q-icon v-else-if="chip.icon" :name="chip.icon" size="14px" />
            <span>{{ chip.label }}</span>
            <q-icon name="close" size="15px" class="active-chip__close" @click="chip.clear" />
          </span>
        </div>

        <!-- Resultados + neto -->
        <div class="results-bar">
          <span class="results-text">
            <b>{{ filtered.length }}</b> {{ filtered.length === 1 ? 'movimiento' : 'movimientos' }}
            <span v-if="activeCount > 0" class="results-net">
              · neto
              <span :style="{ color: netTotal >= 0 ? 'var(--income-fg)' : 'var(--expense-fg)', fontWeight: 600 }">
                {{ netTotal >= 0 ? '+' : '' }}{{ formatMoney(netTotal) }}
              </span>
            </span>
          </span>
          <button v-if="activeCount > 0" class="clear-btn" @click="clearAll">
            <q-icon name="filter_alt_off" size="16px" />
            Limpiar ({{ activeCount }})
          </button>
        </div>
      </div>

      <!-- Lista: usuario nuevo sin datos -->
      <div v-if="!loading && allTransactions.length === 0" class="entry-gate">
        <q-icon name="receipt_long" size="48px" style="color: var(--brand-primary); opacity: 0.4;" />
        <h2>Aún no hay movimientos</h2>
        <p>Agrega tu primer ingreso o gasto para empezar.</p>
        <button class="entry-gate__btn" @click="ui.openSmartModal()">+ Primer movimiento</button>
      </div>

      <!-- Lista: filtro sin resultados -->
      <div v-else-if="filtered.length === 0" class="lite-card" style="padding: 48px 20px; text-align: center;">
        <q-icon name="search_off" size="36px" color="var(--fg-3)" />
        <p class="t-body" style="color: var(--fg-2); margin-top: 10px;">Ningún movimiento coincide con estos filtros.</p>
      </div>

      <div v-else class="tx-list lite-card" style="padding: 0;">
        <div
          v-for="(tx, i) in filtered"
          :key="tx.id"
          class="tx-item"
          :class="{ 'tx-item--first': i === 0 }"
          @click="openDetail(tx)"
        >
          <div class="tx-icon" :class="tx.type === 'income' ? 'tx-icon--income' : 'tx-icon--expense'">
            <q-icon :name="tx.type === 'income' ? 'arrow_downward' : 'arrow_outward'" size="16px" />
          </div>
          <div class="tx-info">
            <span class="tx-name">{{ tx.name }}</span>
            <span class="tx-meta">{{ tx.category }} · {{ formatDateShort(tx.date) }}</span>
          </div>
          <span class="tx-tag">{{ tx.jarName || 'General' }}</span>
          <span class="tx-amount" :style="{ color: tx.type === 'income' ? 'var(--income-fg)' : 'var(--expense-fg)' }">
            {{ tx.type === 'income' ? '+' : '-' }}{{ isHidden ? '••••••' : formatMoney(Math.abs(tx.amount)) }}
          </span>
        </div>
      </div>
    </div>

    <!-- Transaction detail bottom sheet -->
    <q-dialog v-model="showDetail" position="bottom" :maximized="false">
      <div v-if="detailTx" class="tx-detail-sheet">
        <div class="tx-detail-sheet__handle" />

        <!-- ── VIEW MODE ── -->
        <template v-if="!editMode">
          <!-- Hero -->
          <div class="tx-detail-sheet__hero">
            <div class="tx-detail-sheet__icon"
              :class="detailTx.type === 'income' ? 'tx-detail-sheet__icon--income' : 'tx-detail-sheet__icon--expense'">
              <q-icon :name="detailTx.type === 'income' ? 'arrow_downward' : 'arrow_outward'" size="26px" />
            </div>
            <div class="tx-detail-sheet__amount"
              :style="{ color: detailTx.type === 'income' ? 'var(--income-fg, #10b981)' : 'var(--expense-fg, #ef4444)' }">
              {{ isHidden ? '$ ••••••' : `${detailTx.type === 'income' ? '+' : '−'} ${formatMoney(Math.abs(detailTx.amount))}` }}
            </div>
            <div class="tx-detail-sheet__label">{{ detailTx.name }}</div>
          </div>

          <!-- Detail rows -->
          <div class="tx-detail-sheet__rows">
            <div class="tx-detail-row">
              <q-icon name="swap_vert" size="19px" class="tx-detail-row__icon" />
              <span class="tx-detail-row__key">Tipo</span>
              <span class="tx-detail-row__val" :style="{ color: detailTx.type === 'income' ? 'var(--income-fg)' : 'var(--expense-fg)' }">
                {{ detailTx.type === 'income' ? 'Ingreso' : 'Gasto' }}
              </span>
            </div>
            <div class="tx-detail-row">
              <q-icon name="label" size="19px" class="tx-detail-row__icon" />
              <span class="tx-detail-row__key">Categoría</span>
              <span class="tx-detail-row__val">{{ detailTx.category }}</span>
            </div>
            <!-- Cántaro anclado -->
            <div class="tx-detail-row tx-detail-row--chip">
              <q-icon name="savings" size="19px" class="tx-detail-row__icon" />
              <span class="tx-detail-row__key">Cántaro</span>
              <div class="tx-detail-row__val tx-detail-row__val--chip">
                <AnchoredJarChip :category-id="detailTx.category_id" />
              </div>
            </div>
            <div class="tx-detail-row">
              <q-icon name="calendar_today" size="19px" class="tx-detail-row__icon" />
              <span class="tx-detail-row__key">Fecha</span>
              <span class="tx-detail-row__val">{{ formatDateShort(detailTx.date) }}</span>
            </div>
          </div>

          <!-- Confirm eliminar inline -->
          <div v-if="confirmDelete" class="tx-detail-confirm">
            <span class="tx-detail-confirm__text">¿Eliminar esta transacción?</span>
            <button class="tx-detail-btn tx-detail-btn--danger" @click="void confirmDeleteNow()">Confirmar</button>
            <button class="tx-detail-btn tx-detail-btn--ghost" @click="confirmDelete = false">Cancelar</button>
          </div>

          <!-- Actions -->
          <div class="tx-detail-sheet__footer">
            <button class="tx-detail-btn tx-detail-btn--danger" @click="confirmDelete = true">
              <q-icon name="delete_outline" size="17px" /> Eliminar
            </button>
            <button class="tx-detail-btn tx-detail-btn--ghost" @click="void duplicateFromDetail()">
              <q-icon name="content_copy" size="17px" /> Duplicar
            </button>
            <div style="flex:1" />
            <button class="tx-detail-btn tx-detail-btn--ghost" @click="showDetail = false">Cerrar</button>
            <button class="tx-detail-btn tx-detail-btn--primary" @click="enterEditMode">
              <q-icon name="edit" size="17px" /> Editar
            </button>
          </div>
        </template>

        <!-- ── EDIT MODE ── -->
        <template v-else>
          <div class="tx-detail-sheet__edit-title">Editar transacción</div>

          <div class="tx-detail-edit__fields">
            <div class="tx-detail-edit__field">
              <label class="tx-detail-edit__label">Concepto</label>
              <input v-model="editForm.name" class="tx-detail-edit__input" placeholder="Concepto" />
            </div>
            <div class="tx-detail-edit__field">
              <label class="tx-detail-edit__label">Monto</label>
              <input v-model.number="editForm.amount" type="number" class="tx-detail-edit__input" placeholder="0.00" />
            </div>
            <div class="tx-detail-edit__field">
              <label class="tx-detail-edit__label">Fecha</label>
              <input v-model="editForm.date" type="datetime-local" class="tx-detail-edit__input" />
            </div>
            <div class="tx-detail-edit__field">
              <label class="tx-detail-edit__label">Categoría</label>
              <q-select v-model="editForm.category_id" :options="editCategoryOptions" emit-value map-options dense outlined
                clearable placeholder="Sin categoría" :loading="editCatLoading" />
              <AnchoredJarChip :category-id="editForm.category_id" class="tx-detail-edit__chip" />
            </div>
          </div>

          <div class="tx-detail-sheet__footer">
            <button class="tx-detail-btn tx-detail-btn--ghost" @click="exitEditMode">Cancelar</button>
            <div style="flex:1" />
            <button class="tx-detail-btn tx-detail-btn--primary" :disabled="editSaving" @click="void saveEdit()">
              <q-icon v-if="editSaving" name="hourglass_empty" size="17px" />
              <q-icon v-else name="check" size="17px" /> Guardar
            </button>
          </div>
        </template>
      </div>
    </q-dialog>

  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useQuasar } from 'quasar';
import { api } from 'src/boot/axios';
import { useUiStore } from 'stores/ui';
import { usePeriodStore } from 'stores/period';
import TxDropdown from './TxDropdown.vue';
import PeriodNavigator from 'components/PeriodNavigator.vue';
import AnchoredJarChip from 'src/components/AnchoredJarChip.vue';
import {
  loadCategoriesWithJars,
  loadUserJars,
  getCachedCategories,
  jarForCategory,
  getCachedJars,
} from 'src/utils/txCatalog';

defineOptions({ name: 'LiteTransactionsView' });

const $q = useQuasar();
const ui = useUiStore();
const period = usePeriodStore();
const isHidden = computed(() => ui.hideValues);

// ─── State ──────────────────────────────────────────────────────────
const type = ref<'all' | 'income' | 'expense'>('all');
const jar = ref<string>('all');
const category = ref<string>('all');
const day = ref<string>('all');
const minAmount = ref<string>('');
const maxAmount = ref<string>('');
const query = ref('');
const panelOpen = ref(false);
const panelRef = ref<HTMLElement | null>(null);

interface TxItem {
  id: number;
  name: string;
  amount: number;
  date: string;
  category: string;
  category_id?: number | null;
  type: 'income' | 'expense';
  jarName?: string | undefined;
  jarColor?: string | undefined;
  jar_slug?: string | null;
}

interface TxOption {
  id: string;
  label: string;
  icon?: string | undefined;
  color?: string | undefined;
  count?: number | undefined;
}

const allTransactions = ref<TxItem[]>([]);
const loading = ref(false);

// ─── Options ────────────────────────────────────────────────────────
const typeOptions = [
  { id: 'all' as const, label: 'Todas' },
  { id: 'income' as const, label: 'Ingresos' },
  { id: 'expense' as const, label: 'Gastos' },
];

const amountPresets = [
  { id: 'any', label: 'Cualquiera', min: '', max: '' },
  { id: 'lt50', label: '< $50', min: '', max: '50' },
  { id: '50-200', label: '$50 – $200', min: '50', max: '200' },
  { id: 'gt200', label: '> $200', min: '200', max: '' },
];

// ─── Derived options from data ──────────────────────────────────────
const jarOptions = computed<TxOption[]>(() => {
  const seen: Record<string, { color: string | undefined; count: number }> = {};
  for (const t of allTransactions.value) {
    if (t.jarName) {
      seen[t.jarName] = { color: t.jarColor, count: (seen[t.jarName]?.count ?? 0) + 1 };
    }
  }
  return [
    { id: 'all', label: 'Todos los cántaros', icon: 'savings' },
    { id: '__none', label: 'Sin cántaro', icon: 'block', count: allTransactions.value.filter((t) => !t.jarName).length },
    ...Object.keys(seen).map((n) => ({ id: n, label: n, color: seen[n]!.color, count: seen[n]!.count })),
  ];
});

const categoryOptions = computed<TxOption[]>(() => {
  const seen: Record<string, number> = {};
  for (const t of allTransactions.value) {
    seen[t.category] = (seen[t.category] ?? 0) + 1;
  }
  return [
    { id: 'all', label: 'Todas las categorías', icon: 'sell' },
    ...Object.keys(seen).map((n) => ({ id: n, label: n, icon: 'label', count: seen[n] })),
  ];
});

const dayOptions = computed<TxOption[]>(() => {
  const seen: Record<string, number> = {};
  for (const t of allTransactions.value) {
    const label = formatDateShort(t.date);
    seen[label] = (seen[label] ?? 0) + 1;
  }
  return [
    { id: 'all', label: 'Cualquier día', icon: 'event' },
    ...Object.keys(seen).map((n) => ({ id: n, label: n, icon: 'calendar_today', count: seen[n] })),
  ];
});

// ─── Filtering ──────────────────────────────────────────────────────
const filtered = computed(() => {
  return allTransactions.value.filter((t) => {
    if (type.value === 'income' && t.type !== 'income') return false;
    if (type.value === 'expense' && t.type !== 'expense') return false;
    if (jar.value === '__none' && t.jarName) return false;
    if (jar.value !== 'all' && jar.value !== '__none' && t.jarName !== jar.value) return false;
    if (category.value !== 'all' && t.category !== category.value) return false;
    if (day.value !== 'all' && formatDateShort(t.date) !== day.value) return false;
    const abs = Math.abs(t.amount);
    if (minAmount.value !== '' && abs < parseFloat(minAmount.value)) return false;
    if (maxAmount.value !== '' && abs > parseFloat(maxAmount.value)) return false;
    if (query.value.trim()) {
      const q = query.value.toLowerCase();
      const text = `${t.name} ${t.category} ${t.jarName || ''} ${Math.abs(t.amount)}`.toLowerCase();
      if (!text.includes(q)) return false;
    }
    return true;
  });
});

const netTotal = computed(() => filtered.value.reduce((s, t) => s + (t.type === 'income' ? t.amount : -t.amount), 0));

interface Chip { key: string; label: string; icon?: string | undefined; dot?: string | null | undefined; clear: () => void }
const chips = computed<Chip[]>(() => {
  const out: Chip[] = [];
  // type tiene sus propios chips visibles, no va en chips removibles
  if (jar.value !== 'all') {
    const jarOpt = jarOptions.value.find((o) => o.id === jar.value);
    out.push({ key: 'jar', label: jar.value === '__none' ? 'Sin cántaro' : jar.value, dot: jar.value !== '__none' ? (jarOpt?.color ?? null) : null, icon: jar.value === '__none' ? 'block' : undefined, clear: () => { jar.value = 'all'; } });
  }
  if (category.value !== 'all') out.push({ key: 'cat', label: category.value, icon: 'label', clear: () => { category.value = 'all'; } });
  if (day.value !== 'all') out.push({ key: 'day', label: day.value, icon: 'event', clear: () => { day.value = 'all'; } });
  if (minAmount.value !== '' || maxAmount.value !== '') {
    const label = `${minAmount.value !== '' ? '≥ $' + minAmount.value : ''}${minAmount.value !== '' && maxAmount.value !== '' ? ' · ' : ''}${maxAmount.value !== '' ? '≤ $' + maxAmount.value : ''}`;
    out.push({ key: 'amt', label, icon: 'payments', clear: () => { minAmount.value = ''; maxAmount.value = ''; } });
  }
  if (query.value.trim()) out.push({ key: 'q', label: `"${query.value.trim()}"`, icon: 'search', clear: () => { query.value = ''; } });
  return out;
});

const activeCount = computed(() => chips.value.length);

function clearAll() {
  jar.value = 'all';
  day.value = 'all';
  category.value = 'all';
  minAmount.value = '';
  maxAmount.value = '';
  query.value = '';
}

function applyPreset(p: typeof amountPresets[0]) {
  minAmount.value = p.min;
  maxAmount.value = p.max;
}

// ── Detail / Edit ────────────────────────────────────────────────────
const detailTx = ref<TxItem | null>(null);
const showDetail = ref(false);
const confirmDelete = ref(false);

// Edit mode state
const editMode = ref(false);
const editSaving = ref(false);
const editCatLoading = ref(false);
const editForm = ref({
  name: '',
  amount: 0,
  date: '',
  category_id: null as number | null,
});

const editCategoryOptions = computed(() =>
  getCachedCategories()
    .filter(c => c.type === 'category' && c.active)
    .map(c => ({ label: c.name, value: c.id }))
);

function openDetail(tx: TxItem) {
  detailTx.value = tx;
  confirmDelete.value = false;
  editMode.value = false;
  showDetail.value = true;
}

function enterEditMode() {
  if (!detailTx.value) return;
  editForm.value = {
    name: detailTx.value.name,
    amount: detailTx.value.amount,
    date: detailTx.value.date.slice(0, 16),
    category_id: detailTx.value.category_id ?? null,
  };
  editCatLoading.value = true;
  void Promise.all([loadCategoriesWithJars(), loadUserJars()]).finally(() => {
    editCatLoading.value = false;
  });
  editMode.value = true;
}

function exitEditMode() {
  editMode.value = false;
}

async function saveEdit() {
  if (!detailTx.value || editSaving.value) return;
  editSaving.value = true;
  try {
    const derivedJar = jarForCategory(editForm.value.category_id, getCachedJars());
    await api.patch(`/transactions/${detailTx.value.id}`, {
      name: editForm.value.name.trim(),
      amount: editForm.value.amount,
      date: editForm.value.date.replace('T', ' ') + ':00',
      category_id: editForm.value.category_id ?? null,
      jar_id: derivedJar?.id ?? null,
    });
    $q.notify({ type: 'positive', message: 'Transacción actualizada' });
    showDetail.value = false;
    void loadTransactions();
  } catch {
    $q.notify({ type: 'negative', message: 'Error al guardar' });
  } finally {
    editSaving.value = false;
  }
}

async function confirmDeleteNow() {
  if (!detailTx.value) return;
  try {
    await api.delete(`/transactions/${detailTx.value.id}`);
    showDetail.value = false;
    $q.notify({ type: 'positive', message: 'Transacción eliminada' });
    void loadTransactions();
  } catch {
    $q.notify({ type: 'negative', message: 'Error al eliminar' });
  }
}

async function duplicateFromDetail() {
  if (!detailTx.value) return;
  const tx = detailTx.value;
  try {
    const derivedJar = jarForCategory(tx.category_id, getCachedJars());
    await api.post('/transactions', {
      name: tx.name + ' (copia)',
      amount: tx.amount,
      date: tx.date.replace('T', ' ').slice(0, 19),
      category_id: tx.category_id ?? null,
      jar_id: derivedJar?.id ?? null,
      payments: [{ account_id: null, amount: tx.type === 'income' ? tx.amount : -tx.amount }],
    });
    $q.notify({ type: 'positive', message: 'Transacción duplicada' });
    showDetail.value = false;
    void loadTransactions();
  } catch {
    $q.notify({ type: 'negative', message: 'Error al duplicar' });
  }
}

// ─── Helpers ────────────────────────────────────────────────────────
function formatMoney(n: number): string {
  const abs = Math.abs(n);
  return `$ ${abs.toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDateShort(dateStr: string | Date): string {
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  const now = new Date();
  const diff = Math.floor((now.getTime() - d.getTime()) / 86_400_000);
  if (diff === 0) return 'Hoy';
  if (diff === 1) return 'Ayer';
  if (diff < 7) return `Hace ${diff} días`;
  return d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
}

// ─── Period → API params ────────────────────────────────────────────
function buildPeriodParams(): Record<string, string | number> {
  const s = period.state;
  const base = { per_page: '500', page: '1', sort_by: 'date', descending: 'true' } as Record<string, string | number>;
  if (s.type === 'all') return base;
  if (s.type === 'custom' && s.customFrom && s.customTo) {
    return { ...base, date_from: s.customFrom + ' 00:00:00', date_to: s.customTo + ' 23:59:59' };
  }
  const a = new Date(s.anchor + 'T00:00:00');
  const y = a.getFullYear();
  const m = a.getMonth() + 1;
  switch (s.type) {
    case 'year':
      return { ...base, period: 'year', year: String(y) };
    case 'quarter':
      return { ...base, period: 'quarter', year: String(y), quarter: String(Math.ceil(m / 3)) };
    case 'semester':
      return { ...base, period: 'semester', year: String(y), semester: String(m <= 6 ? 1 : 2) };
    case 'fortnight':
      return { ...base, period: 'fortnight', year: String(y), month: String(m), fortnight: String(a.getDate() <= 15 ? 1 : 2) };
    case 'week': {
      const mon = new Date(s.anchor + 'T00:00:00');
      const wd = (mon.getDay() + 6) % 7;
      mon.setDate(mon.getDate() - wd);
      const sun = new Date(mon); sun.setDate(sun.getDate() + 6);
      const fmt = (d: Date) => d.toISOString().slice(0, 10);
      return { ...base, date_from: fmt(mon) + ' 00:00:00', date_to: fmt(sun) + ' 23:59:59' };
    }
    case 'day':
      return { ...base, date_from: s.anchor + ' 00:00:00', date_to: s.anchor + ' 23:59:59' };
    default:
      return { ...base, period: 'month', year: String(y), month: String(m) };
  }
}

// ─── Data loading ───────────────────────────────────────────────────
async function loadTransactions() {
  loading.value = true;
  try {
    const params = buildPeriodParams();
    const res = await api.get('/transactions', { params });
    const data = res.data?.data;
    const list: Record<string, unknown>[] = Array.isArray(data) ? data : Array.isArray(data?.data) ? (data.data as Record<string, unknown>[]) : [];
    const sortedList = [...list].sort((a, b) => {
      const da = typeof a.date === 'string' ? a.date : '';
      const db = typeof b.date === 'string' ? b.date : '';
      return db.localeCompare(da);
    });

    allTransactions.value = sortedList.map((tx) => {
      const amount = Number(tx.amount ?? 0);
      const rawType = tx.transaction_type as Record<string, unknown> | undefined;
      const name = typeof rawType?.name === 'string' ? rawType.name.toLowerCase() : '';
      const slug = typeof rawType?.slug === 'string' ? rawType.slug.toLowerCase() : '';
      const id = Number(tx.transaction_type_id ?? rawType?.id ?? 0);
      const typeText = `${name} ${slug}`;
      let txType: 'income' | 'expense' = 'expense';
      if (id === 4 || typeText.includes('transfer') || typeText.includes('traspaso')) {
        // transfers treated as expense for this list
        txType = 'expense';
      } else if (typeText.includes('income') || typeText.includes('ingreso')) {
        txType = 'income';
      } else if (typeText.includes('expense') || typeText.includes('gasto')) {
        txType = 'expense';
      } else {
        txType = amount >= 0 ? 'income' : 'expense';
      }

      const catRel = typeof tx['category'] === 'object' && tx['category'] ? tx['category'] as Record<string, unknown> : null;
      const jarRel = typeof tx['jar'] === 'object' && tx['jar'] ? tx['jar'] as Record<string, unknown> : null;

      return {
        id: Number(tx.id),
        name: typeof tx.name === 'string' ? tx.name : (typeof tx.description === 'string' ? tx.description : 'Transacción'),
        amount: Math.abs(amount),
        date: typeof tx.date === 'string' ? tx.date : new Date().toISOString(),
        category: (catRel?.['name'] as string | undefined) ?? ((tx.transaction_type as Record<string, unknown> | undefined)?.name as string | undefined) ?? 'General',
        category_id: catRel ? Number(catRel['id']) : (tx['category_id'] ? Number(tx['category_id']) : null),
        type: txType,
        jar_slug: (catRel?.['jar_slug'] as string | null | undefined) ?? null,
        jarName: (typeof tx['jar_name'] === 'string' ? tx['jar_name'] : undefined) || (jarRel ? jarRel['name'] as string | undefined : undefined),
        jarColor: (typeof tx['jar_color'] === 'string' ? tx['jar_color'] : undefined) || (jarRel ? jarRel['color'] as string | undefined : undefined),
      };
    });
  } catch (err) {
    console.warn('[LiteTransactions] Load error:', err);
  } finally {
    loading.value = false;
  }
}

function onTxSaved() { void loadTransactions(); }

// Recargar cuando cambia el periodo
watch(() => period.signature, () => void loadTransactions());

onMounted(() => {
  void loadTransactions();
  window.addEventListener('owf:transaction-saved', onTxSaved);
});

onUnmounted(() => {
  window.removeEventListener('owf:transaction-saved', onTxSaved);
});
</script>

<style scoped lang="scss">
.lite-page {
  background: var(--bg-canvas);
  min-height: 100vh;

  &__container {
    max-width: var(--container-max);
    margin: 0 auto;
    padding: 24px 32px 140px;
    display: flex;
    flex-direction: column;
    gap: 24px;
  }
}

.lite-card {
  background: var(--surface-1);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
}

.filter-bar {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.search-field {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex: 1;
  min-width: 220px;
  padding: 9px 14px;
  background: var(--surface-2);
  border-radius: var(--radius-pill);
}

.search-input {
  border: 0;
  outline: none;
  background: transparent;
  flex: 1;
  min-width: 0;
  font-family: var(--font-body);
  font-size: 13px;
  color: var(--fg-1);
}

.search-clear {
  cursor: pointer;
}

.filter-panel-wrap {
  position: relative;
}

.filter-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 9px 16px;
  border-radius: var(--radius-pill);
  border: 0;
  background: var(--surface-2);
  color: var(--fg-1);
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 600;
  transition: background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out);

  &--active {
    background: var(--brand-primary);
    color: var(--fg-on-brand);
  }
}

.filter-badge {
  background: rgba(255, 255, 255, 0.25);
  border-radius: var(--radius-pill);
  min-width: 18px;
  height: 18px;
  display: inline-grid;
  place-items: center;
  font-size: 11px;
  font-family: var(--font-money);
  padding: 0 5px;
}

.filter-panel {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  z-index: 70;
  width: 340px;
  max-width: 88vw;
  background: var(--surface-1);
  border-radius: var(--radius-xl);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.22);
  border: 1px solid var(--border-hairline);
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }

  &__title {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 15px;
    color: var(--fg-1);
  }

  &__clear {
    border: 0;
    background: transparent;
    cursor: pointer;
    color: var(--brand-primary);
    font-family: var(--font-body);
    font-size: 12.5px;
    font-weight: 600;
  }

  &__field {
    display: flex;
    flex-direction: column;
    gap: 7px;
  }

  &__label {
    font-family: var(--font-body);
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--fg-3);
  }
}

.type-toggle {
  display: inline-flex;
  background: var(--surface-2);
  border-radius: var(--radius-pill);
  padding: 3px;
  gap: 2px;
  width: 100%;

  button {
    flex: 1;
    border: 0;
    cursor: pointer;
    padding: 7px 0;
    border-radius: var(--radius-pill);
    background: transparent;
    color: var(--fg-2);
    font-family: var(--font-body);
    font-size: 12.5px;
    font-weight: 500;
    transition: background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out);

    &.active {
      background: var(--brand-primary);
      color: var(--fg-on-brand);
      font-weight: 600;
    }
  }
}

.amount-inputs {
  display: flex;
  gap: 8px;
}

.amount-input {
  flex: 1;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--surface-2);
  border-radius: var(--radius-md);

  span {
    font-family: var(--font-money);
    font-size: 13px;
    color: var(--fg-3);
  }

  input {
    border: 0;
    outline: none;
    background: transparent;
    width: 100%;
    min-width: 0;
    font-family: var(--font-money);
    font-size: 13px;
    color: var(--fg-1);
  }
}

.amount-presets {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;

  button {
    border: 0;
    cursor: pointer;
    padding: 5px 11px;
    border-radius: var(--radius-pill);
    background: var(--surface-2);
    color: var(--fg-2);
    font-family: var(--font-body);
    font-size: 12px;
    font-weight: 500;
    transition: background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out);

    &.active {
      background: color-mix(in srgb, var(--brand-primary) 14%, var(--surface-1));
      color: var(--brand-primary);
      font-weight: 600;
    }
  }
}

.active-chips {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.active-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 8px 5px 11px;
  border-radius: var(--radius-pill);
  background: color-mix(in srgb, var(--brand-primary) 10%, var(--surface-1));
  color: var(--brand-primary);
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 600;

  &__dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__close {
    cursor: pointer;
    opacity: 0.7;
  }
}

.results-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  border-top: 1px solid var(--border-hairline);
  padding-top: 12px;
}

.results-text {
  font-family: var(--font-body);
  font-size: 12.5px;
  color: var(--fg-2);

  b {
    color: var(--fg-1);
    font-weight: 700;
  }
}

.results-net {
  color: var(--fg-3);
}

.clear-btn {
  margin-left: auto;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  border: 0;
  cursor: pointer;
  padding: 6px 12px;
  border-radius: var(--radius-pill);
  background: var(--surface-2);
  color: var(--fg-2);
  font-family: var(--font-body);
  font-size: 12.5px;
  font-weight: 600;
  transition: background var(--dur-base) var(--ease-out), color var(--dur-base) var(--ease-out);

  &:hover {
    background: var(--surface-3);
    color: var(--fg-1);
  }
}

.tx-list {
  overflow: hidden;
}

.tx-item {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 14px;
  align-items: center;
  padding: 11px 20px;
  border-top: 1px solid var(--border-hairline);
  cursor: pointer;
  transition: background var(--dur-base) var(--ease-out);

  &--first {
    border-top: none;
  }

  &:hover {
    background: var(--surface-2);
  }
}

.tx-icon {
  width: 34px;
  height: 34px;
  border-radius: 17px;
  display: flex;
  align-items: center;
  justify-content: center;

  &--income {
    background: var(--income-soft);
    color: var(--income-fg);
  }

  &--expense {
    background: var(--expense-soft);
    color: var(--expense-fg);
  }
}

.tx-info {
  display: flex;
  flex-direction: column;
  min-width: 0;
}

.tx-name {
  font-family: var(--font-body);
  font-size: 13px;
  font-weight: 500;
  color: var(--fg-1);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.tx-meta {
  font-family: var(--font-body);
  font-size: 11px;
  color: var(--fg-2);
}

.tx-tag {
  font-family: var(--font-body);
  font-size: 11px;
  font-weight: 500;
  padding: 3px 8px;
  border-radius: var(--radius-pill);
  background: var(--surface-2);
  color: var(--fg-2);
  white-space: nowrap;
}

.tx-amount {
  font-family: var(--font-money);
  font-size: 15px;
  font-weight: 500;
  white-space: nowrap;
}

@media (max-width: 768px) {
  .lite-page__container {
    padding: 16px 16px 120px;
    gap: 16px;
  }

  .tx-item {
    grid-template-columns: auto 1fr auto;
    gap: 10px;
    padding: 12px 16px;
  }

  .tx-tag {
    display: none;
  }

  // Desktop dropdown hidden on mobile — bottom-sheet used instead
  .filter-panel--desktop {
    display: none;
  }
}

// Desktop: bottom-sheet dialog hidden (uses dropdown)
@media (min-width: 769px) {
  .filter-sheet-dialog {
    display: none !important;
  }
}

// ── Mobile filter bottom-sheet ─────────────────────────────────────
.filter-sheet {
  background: var(--surface-1);
  border-radius: 22px 22px 0 0;
  padding: 16px 20px 28px;
  display: flex;
  flex-direction: column;
  gap: 0;
  min-width: min(100vw, 520px);
  max-height: 85vh;
  overflow-y: auto;

  &__handle {
    width: 40px; height: 4px;
    background: var(--surface-3);
    border-radius: 999px;
    margin: 0 auto 16px;
    flex-shrink: 0;
  }
}

// ── Entry gate (sin datos) ────────────────────────────────────────────
.entry-gate {
  background: var(--surface-1);
  border-radius: var(--radius-xl);
  padding: 48px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
  box-shadow: var(--shadow-card);

  h2 {
    font-family: var(--font-display);
    font-size: 1.25rem;
    font-weight: 600;
    margin: 0;
    color: var(--fg-1);
  }

  p {
    color: var(--fg-2);
    margin: 0;
    max-width: 280px;
    font-size: 14px;
    line-height: 1.5;
  }

  &__btn {
    display: inline-flex;
    align-items: center;
    gap: 7px;
    padding: 10px 20px;
    border: 0;
    cursor: pointer;
    border-radius: var(--radius-pill);
    background: var(--brand-primary);
    color: var(--fg-on-brand, #fff);
    font-family: var(--font-body);
    font-size: 14px;
    font-weight: 700;
    transition: opacity 140ms;
    &:hover { opacity: 0.9; }
  }
}

// ── Transaction detail sheet ──────────────────────────────────────────
.tx-detail-sheet {
  background: var(--surface-1, #fff);
  border-radius: 22px 22px 0 0;
  padding-bottom: env(safe-area-inset-bottom, 16px);
  min-width: min(520px, 100vw);
  display: flex;
  flex-direction: column;

  &__handle {
    width: 40px; height: 4px;
    background: var(--surface-3, #e2e8f0);
    border-radius: 999px;
    margin: 12px auto 0;
    flex-shrink: 0;
  }

  &__hero {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 10px;
    padding: 22px 24px 18px;
  }

  &__icon {
    width: 56px; height: 56px; border-radius: 28px;
    display: flex; align-items: center; justify-content: center;

    &--income  { background: rgba(16,185,129,.12); color: var(--income-fg, #10b981); }
    &--expense { background: rgba(239,68,68,.1);   color: var(--expense-fg, #ef4444); }
  }

  &__amount {
    font-family: var(--font-money, monospace);
    font-size: 34px;
    font-weight: 700;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    letter-spacing: -0.5px;
  }

  &__label {
    font-size: 15px;
    font-weight: 500;
    color: var(--fg-1, #0f172a);
    text-align: center;
  }

  &__rows {
    border-top: 1px solid var(--border-hairline, #e2e8f0);
    border-bottom: 1px solid var(--border-hairline, #e2e8f0);
    display: flex;
    flex-direction: column;
  }

  &__footer {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 14px 20px;
  }
}

.tx-detail-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 13px 20px;

  & + & { border-top: 1px solid var(--border-hairline, #f1f4f6); }

  &__icon { color: var(--fg-3, #94a3b8); flex-shrink: 0; }
  &__key  { flex: 1; font-size: 13px; color: var(--fg-2, #64748b); }
  &__val  { font-size: 13.5px; font-weight: 600; color: var(--fg-1, #0f172a); }
}

.tx-detail-btn {
  display: inline-flex; align-items: center; gap: 6px;
  border: none; border-radius: 999px;
  font-family: var(--font-body, sans-serif);
  font-size: 13.5px; font-weight: 700; cursor: pointer;
  padding: 9px 16px;
  transition: opacity 140ms;

  &--primary {
    background: var(--brand-primary, #2d4da6); color: #fff;
    box-shadow: 0 3px 10px rgba(45,77,166,.28);
    &:hover { opacity: .9; }
  }

  &--ghost {
    background: var(--surface-2, #f1f4f6); color: var(--fg-2);
    &:hover { background: var(--surface-3); }
  }

  &--danger {
    background: rgba(239,68,68,.1); color: #b91c1c;
    &:hover { background: rgba(239,68,68,.18); }
  }
}

// Chip row inside detail sheet
.tx-detail-row--chip {
  align-items: flex-start;
  padding-top: 10px;
  padding-bottom: 10px;
}
.tx-detail-row__val--chip {
  flex: 1;
}

// Confirm delete bar
.tx-detail-confirm {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  background: rgba(239,68,68,.06);
  border-top: 1px solid rgba(239,68,68,.15);
  border-bottom: 1px solid rgba(239,68,68,.15);
}
.tx-detail-confirm__text {
  flex: 1;
  font-size: 13px;
  color: #b91c1c;
  font-weight: 500;
}

// Edit mode
.tx-detail-sheet__edit-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--fg-1, #0f172a);
  padding: 16px 20px 8px;
}

.tx-detail-edit__fields {
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tx-detail-edit__field {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.tx-detail-edit__label {
  font-size: 11.5px;
  font-weight: 600;
  color: var(--fg-2, #64748b);
  text-transform: uppercase;
  letter-spacing: .04em;
}

.tx-detail-edit__input {
  width: 100%;
  border: 1.5px solid var(--border-hairline, #e2e8f0);
  border-radius: 8px;
  padding: 9px 12px;
  font-size: 14px;
  color: var(--fg-1, #0f172a);
  background: var(--surface-1, #fff);
  outline: none;
  &:focus { border-color: var(--brand-primary, #2d4da6); }
}

.tx-detail-edit__chip {
  margin-top: 4px;
}

</style>
