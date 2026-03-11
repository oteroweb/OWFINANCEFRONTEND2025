<template>
  <q-page class="expense-analysis-page q-pa-md">
    <div class="analysis-shell">
      <section class="hero-card">
        <div>
          <div class="text-overline text-primary">Analitica de gastos</div>
          <div class="text-h4 text-weight-bold">Navegador financiero por cantaro</div>
          <div class="text-body2 text-grey-7 hero-copy">
            Explora movimientos por cantaro, categoria, cuenta o tipo. Cada fila muestra el monto en tu moneda base y la tasa usada para esa transaccion.
          </div>
        </div>
        <div class="hero-actions">
          <q-btn color="primary" icon="add" label="Nueva transaccion" @click="ui.openNewTransactionDialog()" />
          <q-btn flat color="primary" icon="refresh" label="Recargar" :loading="loading" @click="loadData" />
        </div>
      </section>

      <section class="metric-grid">
        <q-card flat bordered class="metric-card">
          <q-card-section>
            <div class="metric-label">Transacciones visibles</div>
            <div class="metric-value">{{ filteredRows.length }}</div>
            <div class="metric-hint">Periodo actual: {{ periodStore.label }}</div>
          </q-card-section>
        </q-card>
        <q-card flat bordered class="metric-card">
          <q-card-section>
            <div class="metric-label">Gastos</div>
            <div class="metric-value text-negative">{{ formatMoney(summary.gastosBase) }}</div>
            <div class="metric-hint">Convertido a {{ baseCurrencyCode }}</div>
          </q-card-section>
        </q-card>
        <q-card flat bordered class="metric-card">
          <q-card-section>
            <div class="metric-label">Ingresos</div>
            <div class="metric-value text-positive">{{ formatMoney(summary.ingresosBase) }}</div>
            <div class="metric-hint">Convertido a {{ baseCurrencyCode }}</div>
          </q-card-section>
        </q-card>
        <q-card flat bordered class="metric-card">
          <q-card-section>
            <div class="metric-label">Balance</div>
            <div class="metric-value" :class="summary.balanceBase >= 0 ? 'text-positive' : 'text-negative'">
              {{ formatMoney(summary.balanceBase) }}
            </div>
            <div class="metric-hint">Resultado neto del conjunto filtrado</div>
          </q-card-section>
        </q-card>
      </section>

      <section class="content-grid">
        <aside class="filters-panel">
          <q-card flat bordered class="panel-card">
            <q-card-section>
              <div class="text-subtitle1 text-weight-bold">Vista</div>
              <div class="text-caption text-grey-7 q-mb-md">Agrupa y recorre el detalle como prefieras.</div>
              <q-select
                v-model="groupMode"
                :options="groupModeOptions"
                emit-value
                map-options
                outlined
                dense
                label="Agrupacion principal"
                class="q-mb-sm"
              />
              <q-input
                v-model="search"
                outlined
                dense
                clearable
                label="Buscar concepto, categoria o cuenta"
                class="q-mb-sm"
              >
                <template #append>
                  <q-icon name="search" />
                </template>
              </q-input>
              <q-select
                v-model="selectedJarId"
                :options="jarOptions"
                emit-value
                map-options
                outlined
                dense
                clearable
                label="Filtrar por cantaro"
                class="q-mb-sm"
              />
              <q-select
                v-model="selectedCategory"
                :options="categoryOptions"
                emit-value
                map-options
                outlined
                dense
                clearable
                label="Filtrar por categoria"
                class="q-mb-sm"
              />
              <q-select
                v-model="selectedAccount"
                :options="accountOptions"
                emit-value
                map-options
                outlined
                dense
                clearable
                label="Filtrar por cuenta"
                class="q-mb-sm"
              />
              <q-select
                v-model="selectedType"
                :options="typeOptions"
                emit-value
                map-options
                outlined
                dense
                clearable
                label="Filtrar por tipo"
              />
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div class="text-subtitle2 text-weight-medium q-mb-sm">Filtros activos</div>
              <div v-if="activeFilterChips.length" class="chip-stack">
                <q-chip
                  v-for="chip in activeFilterChips"
                  :key="chip.key"
                  removable
                  color="blue-1"
                  text-color="primary"
                  @remove="removeFilter(chip.key)"
                >
                  {{ chip.label }}
                </q-chip>
              </div>
              <div v-else class="text-caption text-grey-6">Sin filtros adicionales.</div>
              <q-btn flat dense color="primary" icon="filter_alt_off" label="Limpiar" class="q-mt-sm" @click="clearFilters" />
            </q-card-section>
          </q-card>
        </aside>

        <div class="analysis-main">
          <ExpenseDistributionChart
            :rows="chartRows"
            :currency-code="baseCurrencyCode"
            :hide-values="ui.hideValues"
            class="q-mb-md"
          />

          <q-card flat bordered class="panel-card">
            <q-card-section class="row items-center q-col-gutter-md">
              <div class="col">
                <div class="text-subtitle1 text-weight-bold">Detalle agrupado</div>
                <div class="text-caption text-grey-7">
                  Haz click en cualquier transaccion para abrir la edicion completa.
                </div>
              </div>
              <div class="col-auto text-caption text-grey-7">
                Moneda base: <strong>{{ baseCurrencyCode }}</strong>
              </div>
            </q-card-section>
            <q-separator />
            <q-card-section>
              <div v-if="loading" class="q-py-xl flex flex-center">
                <q-spinner color="primary" size="40px" />
              </div>
              <div v-else-if="!groupedRows.length" class="empty-state">
                <q-icon name="insights" size="42px" color="grey-5" />
                <div class="text-subtitle1 q-mt-sm">No hay movimientos para mostrar</div>
                <div class="text-caption text-grey-7">Ajusta filtros o cambia el periodo actual.</div>
              </div>
              <div v-else class="group-stack">
                <q-expansion-item
                  v-for="group in groupedRows"
                  :key="group.key"
                  default-opened
                  expand-separator
                  class="group-card"
                  header-class="group-card__header"
                >
                  <template #header>
                    <div class="group-head">
                      <div>
                        <div class="text-subtitle2 text-weight-bold">{{ group.label }}</div>
                        <div class="text-caption text-grey-6">{{ group.rows.length }} transacciones</div>
                      </div>
                      <div class="group-totals">
                        <div class="text-caption text-grey-7">Gastos {{ formatMoney(group.summary.gastosBase) }}</div>
                        <div class="text-caption text-grey-7">Ingresos {{ formatMoney(group.summary.ingresosBase) }}</div>
                        <div class="text-caption" :class="group.summary.balanceBase >= 0 ? 'text-positive' : 'text-negative'">
                          Balance {{ formatMoney(group.summary.balanceBase) }}
                        </div>
                      </div>
                    </div>
                  </template>

                  <div v-if="group.children?.length" class="subgroup-stack">
                    <q-expansion-item
                      v-for="child in group.children"
                      :key="child.key"
                      dense
                      default-opened
                      expand-separator
                      class="subgroup-card"
                    >
                      <template #header>
                        <div class="subgroup-head">
                          <div>
                            <div class="text-body2 text-weight-medium">{{ child.label }}</div>
                            <div class="text-caption text-grey-6">{{ child.rows.length }} transacciones</div>
                          </div>
                          <div class="text-caption text-grey-7">
                            {{ formatMoney(child.summary.balanceBase) }}
                          </div>
                        </div>
                      </template>
                      <div class="rows-list">
                        <button
                          v-for="row in child.rows"
                          :key="row.id"
                          type="button"
                          class="tx-row"
                          @click="openTransaction(row.id)"
                        >
                          <div class="tx-main">
                            <div class="tx-title-row">
                              <span class="text-body2 text-weight-medium">{{ row.name }}</span>
                              <q-badge outline color="primary">{{ row.typeName }}</q-badge>
                            </div>
                            <div class="text-caption text-grey-7">
                              {{ row.dateLabel }} · {{ row.accountLabel }} · {{ row.categoryName || 'Sin categoria' }}
                            </div>
                            <div class="text-caption text-grey-6 q-mt-xs">
                              {{ row.originalLabel }}
                              <span v-if="row.rateLabel">({{ row.rateLabel }})</span>
                            </div>
                          </div>
                          <div class="tx-amounts">
                            <div :class="row.amountBase >= 0 ? 'text-positive text-weight-bold' : 'text-negative text-weight-bold'">
                              {{ formatMoney(row.amountBase) }}
                            </div>
                            <div class="text-caption text-grey-7">{{ row.baseExplain }}</div>
                          </div>
                        </button>
                      </div>
                    </q-expansion-item>
                  </div>

                  <div v-else class="rows-list rows-list--root">
                    <button
                      v-for="row in group.rows"
                      :key="row.id"
                      type="button"
                      class="tx-row"
                      @click="openTransaction(row.id)"
                    >
                      <div class="tx-main">
                        <div class="tx-title-row">
                          <span class="text-body2 text-weight-medium">{{ row.name }}</span>
                          <q-badge outline color="primary">{{ row.typeName }}</q-badge>
                        </div>
                        <div class="text-caption text-grey-7">
                          {{ row.dateLabel }} · {{ row.accountLabel }} · {{ row.categoryName || 'Sin categoria' }}
                        </div>
                        <div class="text-caption text-grey-6 q-mt-xs">
                          {{ row.originalLabel }}
                          <span v-if="row.rateLabel">({{ row.rateLabel }})</span>
                        </div>
                      </div>
                      <div class="tx-amounts">
                        <div :class="row.amountBase >= 0 ? 'text-positive text-weight-bold' : 'text-negative text-weight-bold'">
                          {{ formatMoney(row.amountBase) }}
                        </div>
                        <div class="text-caption text-grey-7">{{ row.baseExplain }}</div>
                      </div>
                    </button>
                  </div>
                </q-expansion-item>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </section>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { api } from '../../../boot/axios';
import { ExpenseDistributionChart } from '../../../components';
import { useUserRates } from '../../../composables/useUserRates';
import { useUiStore } from '../../../stores/ui';
import { computed, onMounted, ref, watch } from 'vue';
import { usePeriodStore } from '../../../stores/period';
import { useRoute } from 'vue-router';

defineOptions({ name: 'user_expense_analysis_page' });

type JarRecord = {
  id: number;
  name: string;
  color: string;
  categories: Array<{ id: number; label: string }>;
};

type EnrichedTx = {
  id: number;
  name: string;
  amountUsd: number;
  amountBase: number;
  dateLabel: string;
  rawDate: string;
  typeName: string;
  categoryName: string;
  categoryId: number | null;
  jarId: number | null;
  jarName: string;
  jarColor: string;
  accountLabel: string;
  accountKey: string;
  originalLabel: string;
  rateLabel: string;
  baseExplain: string;
};

type Summary = {
  gastosBase: number;
  ingresosBase: number;
  balanceBase: number;
};

type GroupNode = {
  key: string;
  label: string;
  rows: EnrichedTx[];
  summary: Summary;
  children?: GroupNode[];
};

const route = useRoute();
const ui = useUiStore();
const periodStore = usePeriodStore();
const { defaultCurrencyCode, currentRates, toRateLabel } = useUserRates();

const loading = ref(false);
const rows = ref<EnrichedTx[]>([]);
const jars = ref<JarRecord[]>([]);

const groupMode = ref<'jar' | 'category' | 'account' | 'type'>('jar');
const search = ref('');
const selectedJarId = ref<number | null>(null);
const selectedCategory = ref<string | null>(null);
const selectedAccount = ref<string | null>(null);
const selectedType = ref<string | null>(null);

const groupModeOptions = [
  { label: 'Cantaro > Categoria > Transacciones', value: 'jar' },
  { label: 'Categoria > Transacciones', value: 'category' },
  { label: 'Cuenta > Transacciones', value: 'account' },
  { label: 'Tipo > Transacciones', value: 'type' },
];

const baseCurrencyCode = computed(() => defaultCurrencyCode.value || 'USD');

function getRatePerUsd(code: string): number {
  const normalized = (code || 'USD').toUpperCase();
  if (normalized === 'USD') return 1;
  const found = currentRates.value.find((rate) => rate.code.toUpperCase() === normalized);
  return found?.rate && found.rate > 0 ? found.rate : 1;
}

function convertUsdToBase(amountUsd: number): number {
  const code = baseCurrencyCode.value.toUpperCase();
  return code === 'USD' ? amountUsd : amountUsd * getRatePerUsd(code);
}

function formatMoney(amount: number): string {
  if (ui.hideValues) return '••••••';
  try {
    return new Intl.NumberFormat(undefined, {
      style: 'currency',
      currency: baseCurrencyCode.value,
      maximumFractionDigits: 2,
    }).format(Number(amount || 0));
  } catch {
    return `${Number(amount || 0).toFixed(2)} ${baseCurrencyCode.value}`;
  }
}

function formatRawDate(value: string): string {
  if (!value) return 'Sin fecha';
  const iso = value.includes('T') ? value : value.replace(' ', 'T');
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getPaymentList(rawTx: Record<string, unknown>): Array<Record<string, unknown>> {
  const raw = rawTx.payment_transactions;
  return Array.isArray(raw) ? (raw as Array<Record<string, unknown>>) : [];
}

function extractPaymentRate(payment: Record<string, unknown>): number | null {
  const directRate = payment.rate;
  if (typeof directRate === 'number' && Number.isFinite(directRate) && directRate > 0) return directRate;
  if (directRate && typeof directRate === 'object') {
    const nested = Number((directRate as Record<string, unknown>).value ?? (directRate as Record<string, unknown>).current_rate ?? 0);
    if (Number.isFinite(nested) && nested > 0) return nested;
  }
  const rateValue = Number(payment.rate_value ?? 0);
  if (Number.isFinite(rateValue) && rateValue > 0) return rateValue;
  const userCurrency = payment.user_currency;
  if (userCurrency && typeof userCurrency === 'object') {
    const currentRate = Number((userCurrency as Record<string, unknown>).current_rate ?? 0);
    if (Number.isFinite(currentRate) && currentRate > 0) return currentRate;
  }
  return null;
}

function extractAccountName(payment: Record<string, unknown>): string {
  if (typeof payment.account_name === 'string' && payment.account_name.trim()) return payment.account_name.trim();
  const account = payment.account;
  if (account && typeof account === 'object') {
    const name = (account as Record<string, unknown>).name;
    if (typeof name === 'string' && name.trim()) return name.trim();
  }
  return 'Cuenta';
}

function buildOriginalLabel(rawTx: Record<string, unknown>): { label: string; rateLabel: string } {
  const payments = getPaymentList(rawTx);
  if (!payments.length) {
    const amount = Number(rawTx.amount ?? 0);
    return {
      label: `Base USD ${amount.toFixed(2)}`,
      rateLabel: '',
    };
  }

  const parts = payments.map((payment) => {
    const accountName = extractAccountName(payment);
    const amount = Number(payment.amount ?? 0);
    return `${accountName}: ${amount.toFixed(2)}`;
  });

  const rates = payments
    .map((payment) => extractPaymentRate(payment))
    .filter((value): value is number => typeof value === 'number' && value > 0);

  const rateLabel = rates.length
    ? rates.length === 1
      ? `tasa ${toRateLabel(rates[0] as number)}`
      : `tasas ${rates.map((rate) => toRateLabel(rate)).join(' / ')}`
    : '';

  return {
    label: parts.join(' · '),
    rateLabel,
  };
}

function buildCategoryToJarMap(): Map<number, JarRecord> {
  const map = new Map<number, JarRecord>();
  jars.value.forEach((jar) => {
    jar.categories.forEach((category) => {
      map.set(category.id, jar);
    });
  });
  return map;
}

function enrichTransaction(rawTx: Record<string, unknown>, categoryToJarMap: Map<number, JarRecord>): EnrichedTx {
  const id = Number(rawTx.id ?? 0);
  const name = typeof rawTx.name === 'string' && rawTx.name.trim() ? rawTx.name.trim() : 'Sin concepto';
  const amountUsd = Number(rawTx.amount ?? 0);
  const amountBase = convertUsdToBase(amountUsd);
  const typeName = typeof (rawTx.transaction_type as Record<string, unknown> | undefined)?.name === 'string'
    ? String((rawTx.transaction_type as Record<string, unknown>).name)
    : 'Sin tipo';
  const categoryIdRaw = rawTx.category_id;
  const categoryId = typeof categoryIdRaw === 'number' ? categoryIdRaw : Number.isFinite(Number(categoryIdRaw)) ? Number(categoryIdRaw) : null;
  const categoryName = typeof (rawTx.category as Record<string, unknown> | undefined)?.name === 'string'
    ? String((rawTx.category as Record<string, unknown>).name)
    : 'Sin categoria';
  const jar = categoryId != null ? categoryToJarMap.get(categoryId) ?? null : null;
  const payments = getPaymentList(rawTx);
  const accountNames = payments.map((payment) => extractAccountName(payment)).filter(Boolean);
  const accountLabel = accountNames.length ? Array.from(new Set(accountNames)).join(' · ') : 'Sin cuenta';
  const original = buildOriginalLabel(rawTx);

  const rawDateValue = typeof rawTx.date === 'string' ? rawTx.date : '';

  return {
    id,
    name,
    amountUsd,
    amountBase,
    dateLabel: formatRawDate(rawDateValue),
    rawDate: rawDateValue,
    typeName,
    categoryName,
    categoryId,
    jarId: jar?.id ?? null,
    jarName: jar?.name ?? 'Sin cantaro',
    jarColor: jar?.color ?? '#94a3b8',
    accountLabel,
    accountKey: accountLabel,
    originalLabel: original.label,
    rateLabel: original.rateLabel,
    baseExplain: `${baseCurrencyCode.value} desde USD`,
  };
}

function computeSummary(items: EnrichedTx[]): Summary {
  const gastosBase = items.filter((row) => row.amountBase < 0).reduce((sum, row) => sum + Math.abs(row.amountBase), 0);
  const ingresosBase = items.filter((row) => row.amountBase > 0).reduce((sum, row) => sum + row.amountBase, 0);
  return {
    gastosBase,
    ingresosBase,
    balanceBase: ingresosBase - gastosBase,
  };
}

function buildGroupNodes(items: EnrichedTx[]): GroupNode[] {
  const groupBy = new Map<string, EnrichedTx[]>();

  const push = (key: string, row: EnrichedTx) => {
    const current = groupBy.get(key) || [];
    current.push(row);
    groupBy.set(key, current);
  };

  items.forEach((row) => {
    if (groupMode.value === 'jar') push(row.jarName || 'Sin cantaro', row);
    if (groupMode.value === 'category') push(row.categoryName || 'Sin categoria', row);
    if (groupMode.value === 'account') push(row.accountKey || 'Sin cuenta', row);
    if (groupMode.value === 'type') push(row.typeName || 'Sin tipo', row);
  });

  return Array.from(groupBy.entries())
    .map(([label, groupRows]) => {
      const sortedRows = [...groupRows].sort((a, b) => String(b.rawDate).localeCompare(String(a.rawDate)));
      if (groupMode.value === 'jar') {
        const categoryGroups = new Map<string, EnrichedTx[]>();
        sortedRows.forEach((row) => {
          const key = row.categoryName || 'Sin categoria';
          const current = categoryGroups.get(key) || [];
          current.push(row);
          categoryGroups.set(key, current);
        });
        const children = Array.from(categoryGroups.entries()).map(([childLabel, childRows]) => ({
          key: `${label}-${childLabel}`,
          label: childLabel,
          rows: childRows,
          summary: computeSummary(childRows),
        }));
        return {
          key: label,
          label,
          rows: sortedRows,
          summary: computeSummary(sortedRows),
          children,
        };
      }
      return {
        key: label,
        label,
        rows: sortedRows,
        summary: computeSummary(sortedRows),
      };
    })
    .sort((a, b) => Math.abs(b.summary.gastosBase) - Math.abs(a.summary.gastosBase));
}

const jarOptions = computed(() => [{ label: 'Todos', value: null }, ...jars.value.map((jar) => ({ label: jar.name, value: jar.id }))]);
const categoryOptions = computed(() => [{ label: 'Todas', value: null }, ...Array.from(new Set(rows.value.map((row) => row.categoryName))).filter(Boolean).sort().map((label) => ({ label, value: label }))]);
const accountOptions = computed(() => [{ label: 'Todas', value: null }, ...Array.from(new Set(rows.value.map((row) => row.accountKey))).filter(Boolean).sort().map((label) => ({ label, value: label }))]);
const typeOptions = computed(() => [{ label: 'Todos', value: null }, ...Array.from(new Set(rows.value.map((row) => row.typeName))).filter(Boolean).sort().map((label) => ({ label, value: label }))]);

const filteredRows = computed(() => {
  const needle = search.value.trim().toLowerCase();
  return rows.value.filter((row) => {
    if (selectedJarId.value != null && row.jarId !== selectedJarId.value) return false;
    if (selectedCategory.value && row.categoryName !== selectedCategory.value) return false;
    if (selectedAccount.value && row.accountKey !== selectedAccount.value) return false;
    if (selectedType.value && row.typeName !== selectedType.value) return false;
    if (!needle) return true;
    const haystack = [row.name, row.categoryName, row.accountLabel, row.typeName, row.jarName].join(' ').toLowerCase();
    return haystack.includes(needle);
  });
});

const summary = computed(() => computeSummary(filteredRows.value));
const groupedRows = computed(() => buildGroupNodes(filteredRows.value));

const chartRows = computed(() => {
  const byJar = new Map<string, { id: number; name: string; color: string; assignedExpected: number; spent: number; balance: number }>();
  filteredRows.value.forEach((row) => {
    const key = row.jarName || 'Sin cantaro';
    const current = byJar.get(key) || {
      id: row.jarId || 0,
      name: row.jarName || 'Sin cantaro',
      color: row.jarColor || '#94a3b8',
      assignedExpected: 0,
      spent: 0,
      balance: 0,
    };
    if (row.amountBase < 0) current.spent += Math.abs(row.amountBase);
    if (row.amountBase > 0) current.balance += row.amountBase;
    current.assignedExpected = current.spent + current.balance;
    byJar.set(key, current);
  });
  return Array.from(byJar.values());
});

const activeFilterChips = computed(() => {
  const chips: Array<{ key: string; label: string }> = [];
  if (search.value.trim()) chips.push({ key: 'search', label: `Buscar: ${search.value.trim()}` });
  if (selectedJarId.value != null) {
    const jar = jars.value.find((item) => item.id === selectedJarId.value);
    chips.push({ key: 'jar', label: `Cantaro: ${jar?.name || selectedJarId.value}` });
  }
  if (selectedCategory.value) chips.push({ key: 'category', label: `Categoria: ${selectedCategory.value}` });
  if (selectedAccount.value) chips.push({ key: 'account', label: `Cuenta: ${selectedAccount.value}` });
  if (selectedType.value) chips.push({ key: 'type', label: `Tipo: ${selectedType.value}` });
  return chips;
});

function removeFilter(key: string): void {
  if (key === 'search') search.value = '';
  if (key === 'jar') selectedJarId.value = null;
  if (key === 'category') selectedCategory.value = null;
  if (key === 'account') selectedAccount.value = null;
  if (key === 'type') selectedType.value = null;
}

function clearFilters(): void {
  search.value = '';
  selectedJarId.value = null;
  selectedCategory.value = null;
  selectedAccount.value = null;
  selectedType.value = null;
}

function openTransaction(id: number): void {
  ui.openEditTransactionDialog(id);
}

async function loadJars(): Promise<void> {
  const response = await api.get('/jars', { params: { per_page: 100 } });
  const payload = response.data?.data;
  const list = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
  jars.value = (list as Array<Record<string, unknown>>).map((jar) => ({
    id: Number(jar.id ?? 0),
    name: typeof jar.name === 'string' ? jar.name : 'Cántaro',
    color: typeof jar.color === 'string' && jar.color ? jar.color : '#94a3b8',
    categories: Array.isArray(jar.categories)
      ? (jar.categories as Array<Record<string, unknown>>).map((category) => ({
          id: Number(category.id ?? 0),
          label: typeof category.label === 'string'
            ? category.label
            : typeof category.name === 'string'
            ? category.name
            : 'Categoria',
        }))
      : [],
  }));
}

async function loadTransactions(): Promise<void> {
  const params: Record<string, unknown> = {
    per_page: 250,
    sort_by: 'date',
    descending: true,
  };
  Object.entries(periodStore.queryParams).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params[key] = value;
  });
  const response = await api.get('/transactions', { params });
  const payload = response.data?.data;
  const list = Array.isArray(payload) ? payload : Array.isArray(payload?.data) ? payload.data : [];
  const categoryToJarMap = buildCategoryToJarMap();
  rows.value = (list as Array<Record<string, unknown>>).map((tx) => enrichTransaction(tx, categoryToJarMap));
}

async function loadData(): Promise<void> {
  loading.value = true;
  try {
    await loadJars();
    await loadTransactions();
  } finally {
    loading.value = false;
  }
}

watch(
  () => periodStore.signature,
  () => {
    void loadData();
  }
);

watch(
  () => route.query.jar,
  (jarQuery) => {
    if (jarQuery == null || jarQuery === '') return;
    const jarId = Number(Array.isArray(jarQuery) ? jarQuery[0] : jarQuery);
    if (Number.isFinite(jarId)) selectedJarId.value = jarId;
  },
  { immediate: true }
);

onMounted(() => {
  void loadData();
});
</script>

<style scoped>
.expense-analysis-page {
  background:
    radial-gradient(circle at top left, rgba(56, 189, 248, 0.08), transparent 28%),
    radial-gradient(circle at top right, rgba(34, 197, 94, 0.06), transparent 24%),
    #f8fafc;
}

.analysis-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-card,
.panel-card,
.metric-card {
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 40px rgba(15, 23, 42, 0.06);
}

.hero-card {
  display: flex;
  justify-content: space-between;
  gap: 16px;
  align-items: flex-start;
  padding: 24px;
}

.hero-copy {
  max-width: 760px;
}

.hero-actions {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.metric-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
}

.metric-label {
  color: #64748b;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.06em;
}

.metric-value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1.1;
  margin-top: 8px;
}

.metric-hint {
  color: #64748b;
  font-size: 12px;
  margin-top: 6px;
}

.content-grid {
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  gap: 16px;
  align-items: start;
}

.filters-panel {
  position: sticky;
  top: 12px;
}

.chip-stack {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.analysis-main {
  min-width: 0;
}

.empty-state {
  min-height: 240px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 8px;
}

.group-stack,
.subgroup-stack,
.rows-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.group-card,
.subgroup-card {
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 16px;
  background: linear-gradient(180deg, rgba(248, 250, 252, 0.95), rgba(255, 255, 255, 0.96));
}

.group-card__header {
  padding: 12px 14px;
}

.group-head,
.subgroup-head {
  width: 100%;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
}

.group-totals {
  text-align: right;
}

.tx-row {
  width: 100%;
  border: 1px solid rgba(148, 163, 184, 0.16);
  background: white;
  border-radius: 14px;
  padding: 14px;
  display: flex;
  justify-content: space-between;
  gap: 14px;
  text-align: left;
  transition: transform 160ms ease, box-shadow 160ms ease, border-color 160ms ease;
}

.tx-row:hover {
  transform: translateY(-1px);
  border-color: rgba(56, 189, 248, 0.35);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.08);
}

.tx-main,
.tx-amounts {
  min-width: 0;
}

.tx-main {
  flex: 1 1 auto;
}

.tx-title-row {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 2px;
}

.tx-amounts {
  flex: 0 0 170px;
  text-align: right;
}

@media (max-width: 1100px) {
  .content-grid {
    grid-template-columns: 1fr;
  }

  .filters-panel {
    position: static;
  }
}

@media (max-width: 768px) {
  .hero-card,
  .tx-row,
  .group-head,
  .subgroup-head {
    flex-direction: column;
    align-items: stretch;
  }

  .tx-amounts,
  .group-totals {
    text-align: left;
  }
}
</style>