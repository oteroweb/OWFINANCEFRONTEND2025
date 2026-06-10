<template>
  <q-page class="lite-page">
    <div class="lite-page__container">
      <!-- Header -->
      <div>
        <span class="t-eyebrow">Transacciones</span>
        <h1 class="t-h1" style="margin: 6px 0 0">{{ monthLabel }}</h1>
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

            <div v-if="panelOpen" class="filter-panel">
              <div class="filter-panel__header">
                <span class="filter-panel__title">Filtro inteligente</span>
                <button v-if="activeCount > 0" class="filter-panel__clear" @click="clearAll">Limpiar todo</button>
              </div>

              <div class="filter-panel__field">
                <span class="filter-panel__label">Tipo</span>
                <div class="type-toggle">
                  <button
                    v-for="t in typeOptions"
                    :key="t.id"
                    :class="{ active: type === t.id }"
                    @click="type = t.id"
                  >
                    {{ t.label }}
                  </button>
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
                <span class="filter-panel__label">Monto</span>
                <div class="amount-inputs">
                  <div class="amount-input">
                    <span>≥ $</span>
                    <input v-model="minAmount" type="number" placeholder="0" />
                  </div>
                  <div class="amount-input">
                    <span>≤ $</span>
                    <input v-model="maxAmount" type="number" placeholder="∞" />
                  </div>
                </div>
                <div class="amount-presets">
                  <button
                    v-for="p in amountPresets"
                    :key="p.id"
                    :class="{ active: minAmount === p.min && maxAmount === p.max }"
                    @click="applyPreset(p)"
                  >
                    {{ p.label }}
                  </button>
                </div>
              </div>
            </div>
          </div>
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

      <!-- Lista -->
      <div v-if="filtered.length === 0" class="lite-card" style="padding: 48px 20px; text-align: center;">
        <q-icon name="search_off" size="36px" color="var(--fg-3)" />
        <p class="t-body" style="color: var(--fg-2); margin-top: 10px;">Ningún movimiento coincide con estos filtros.</p>
      </div>

      <div v-else class="tx-list lite-card" style="padding: 0;">
        <div
          v-for="(tx, i) in filtered"
          :key="tx.id"
          class="tx-item"
          :class="{ 'tx-item--first': i === 0 }"
          @click="goToDetail()"
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
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { api } from 'src/boot/axios';
import { useUiStore } from 'stores/ui';
import TxDropdown from './TxDropdown.vue';

defineOptions({ name: 'LiteTransactionsView' });

const router = useRouter();
const ui = useUiStore();
const isHidden = computed(() => ui.hideValues);

// ─── State ──────────────────────────────────────────────────────────
const type = ref<'all' | 'income' | 'expense'>('all');
const jar = ref<string>('all');
const category = ref<string>('all');
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
  type: 'income' | 'expense';
  jarName?: string | undefined;
  jarColor?: string | undefined;
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

// ─── Filtering ──────────────────────────────────────────────────────
const filtered = computed(() => {
  return allTransactions.value.filter((t) => {
    if (type.value === 'income' && t.type !== 'income') return false;
    if (type.value === 'expense' && t.type !== 'expense') return false;
    if (jar.value === '__none' && t.jarName) return false;
    if (jar.value !== 'all' && jar.value !== '__none' && t.jarName !== jar.value) return false;
    if (category.value !== 'all' && t.category !== category.value) return false;
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
  if (type.value !== 'all') out.push({ key: 'type', label: typeOptions.find((x) => x.id === type.value)?.label || '', icon: 'swap_vert', clear: () => { type.value = 'all'; } });
  if (jar.value !== 'all') {
    const jarOpt = jarOptions.value.find((o) => o.id === jar.value);
    out.push({ key: 'jar', label: jar.value === '__none' ? 'Sin cántaro' : jar.value, dot: jar.value !== '__none' ? (jarOpt?.color ?? null) : null, icon: jar.value === '__none' ? 'block' : undefined, clear: () => { jar.value = 'all'; } });
  }
  if (category.value !== 'all') out.push({ key: 'cat', label: category.value, icon: 'label', clear: () => { category.value = 'all'; } });
  if (minAmount.value !== '' || maxAmount.value !== '') {
    const label = `${minAmount.value !== '' ? '≥ $' + minAmount.value : ''}${minAmount.value !== '' && maxAmount.value !== '' ? ' · ' : ''}${maxAmount.value !== '' ? '≤ $' + maxAmount.value : ''}`;
    out.push({ key: 'amt', label, icon: 'payments', clear: () => { minAmount.value = ''; maxAmount.value = ''; } });
  }
  if (query.value.trim()) out.push({ key: 'q', label: `"${query.value.trim()}"`, icon: 'search', clear: () => { query.value = ''; } });
  return out;
});

const activeCount = computed(() => chips.value.length);

function clearAll() {
  type.value = 'all';
  jar.value = 'all';
  category.value = 'all';
  minAmount.value = '';
  maxAmount.value = '';
  query.value = '';
}

function applyPreset(p: typeof amountPresets[0]) {
  minAmount.value = p.min;
  maxAmount.value = p.max;
}

function goToDetail() {
  void router.push('/user/transactions');
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

const monthLabel = computed(() => {
  const now = new Date();
  return now.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' });
});

// ─── Data loading ───────────────────────────────────────────────────
async function loadTransactions() {
  loading.value = true;
  try {
    const now = new Date();
    const params = {
      period: 'month',
      year: String(now.getFullYear()),
      month: String(now.getMonth() + 1),
      per_page: '500',
      page: '1',
      sort_by: 'date',
      descending: 'true',
    };
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

      return {
        id: Number(tx.id),
        name: typeof tx.name === 'string' ? tx.name : (typeof tx.description === 'string' ? tx.description : 'Transacción'),
        amount: Math.abs(amount),
        date: typeof tx.date === 'string' ? tx.date : new Date().toISOString(),
        category: ((tx.transaction_type as Record<string, unknown> | undefined)?.name as string | undefined) ?? 'General',
        type: txType,
        jarName: (typeof tx['jar_name'] === 'string' ? tx['jar_name'] : undefined) || (typeof tx['jar'] === 'object' && tx['jar'] ? (tx['jar'] as Record<string, unknown>)['name'] as string | undefined : undefined),
        jarColor: (typeof tx['jar_color'] === 'string' ? tx['jar_color'] : undefined) || (typeof tx['jar'] === 'object' && tx['jar'] ? (tx['jar'] as Record<string, unknown>)['color'] as string | undefined : undefined),
      };
    });
  } catch (err) {
    console.warn('[LiteTransactions] Load error:', err);
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  void loadTransactions();
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

  .filter-panel {
    right: auto;
    left: 0;
    width: calc(100vw - 32px);
  }
}
</style>
