<template>
  <q-page class="q-pa-md">
    <div class="row q-col-gutter-lg">
      <!-- Sidebar de cuentas (siempre visible) -->
      <div class="col-12 col-md-3 col-lg-3">
        <div class="sticky-sidebar">
          <AccountsSidebarWidget />
        </div>
      </div>

      <!-- Contenido principal: header + filtros + tabla -->
      <div class="col-12 col-md-9 col-lg-9">
        <!-- Encabezado -->
        <div class="row items-center q-mb-md">
          <div class="col">
            <div class="text-h5">{{ dictionary.title }}</div>
            <div class="text-caption text-grey-7">{{ dictionary.description }}</div>
          </div>
          <div class="col-auto">
            <div class="row items-center q-gutter-sm">
              <q-btn
                flat
                icon="tune"
                color="primary"
                @click="openAdjustTop"
                :disable="!singleAccountSelected"
              >
                <q-tooltip>Ajustar saldo (cuenta seleccionada)</q-tooltip>
              </q-btn>
              <q-btn
                flat
                icon="autorenew"
                color="secondary"
                @click="recalcSingleAccountTop"
                :disable="!singleAccountSelected"
              >
                <q-tooltip>Recalcular saldo (cuenta seleccionada)</q-tooltip>
              </q-btn>
              <q-btn
                flat
                icon="download"
                color="primary"
                @click="exportCSV"
                :disable="!rows.length"
              >
                <q-tooltip>Exportar CSV</q-tooltip>
              </q-btn>
              <q-btn flat icon="filter_alt_off" color="secondary" @click="clearFilters" />
              <q-btn :label="dictionary.buttonNewLabel" color="primary" @click="openNewFab" />
            </div>
          </div>
        </div>

        <!-- Búsqueda global -->
        <div class="row q-col-gutter-md items-start q-mb-md">
          <div class="col-12 col-sm-6 col-md-6">
            <div class="text-caption q-mb-xs">{{ dictionary.finderLabel }}</div>
            <q-input
              class="full-width"
              dense
              filled
              debounce="300"
              v-model="filters.search"
              :placeholder="dictionary.finderLabel + '...'"
            >
              <template v-slot:append><q-icon name="search" /></template>
            </q-input>
          </div>
        </div>

        <!-- Filtros dinámicos -->
        <div class="q-pa-xs q-mb-md">
          <div class="row q-col-gutter-md items-start">
            <div
              v-for="field in dictionary.forms_filter"
              :key="field.id"
              :class="`col-${field.col || 12}`"
            >
              <component
                :is="selectComponent(field.type)"
                class="full-width"
                v-model="filters[field.vmodel]"
                v-bind="fieldProps(field)"
              />
            </div>
          </div>
        </div>

        <!-- Tabla de datos -->
        <div v-if="showRunningBalanceColumn && singleAccountBalance != null" class="q-mb-sm">
          <q-banner class="bg-blue-1 text-primary q-pa-sm" rounded>
            <div class="row items-center no-wrap full-width">
              <div class="col-auto text-weight-medium">Saldo actual de la cuenta:</div>
              <div class="col-auto text-weight-bold">
                <template v-if="singleAccountBalanceLoading">
                  <q-spinner size="16px" class="q-mr-xs" />
                </template>
                <span v-else>{{ formatSingleAccountBalanceDisplay() }}</span>
              </div>
              <div
                class="col text-right text-caption text-grey-7"
                v-if="pagination.sortBy === 'date'"
              >
                (Columna Balance muestra saldo tras cada transacción)
              </div>
            </div>
          </q-banner>
        </div>
        <q-table
          :columns="columns"
          :rows="rows"
          :loading="loading"
          row-key="id"
          flat
          bordered
          class="shadow-1"
          v-model:pagination="pagination"
          @request="onRequest"
        >
          <template v-slot:body-cell-actions="props">
            <q-td align="right">
              <q-btn flat round icon="edit" color="primary" @click="edit(props.row)" />
              <q-btn flat round icon="delete" color="negative" @click="remove(props.row)" />
            </q-td>
          </template>
          <template
            v-for="col in manyToManyColumns"
            :key="col.key"
            v-slot:[`body-cell-${col.key}`]="props"
          >
            <q-td>
              <div>
                <template v-if="col.ownerKey && col.pivotKey">
                  <span
                    v-for="(item, idx) in getOwnedItems(props.row, col)"
                    :key="getItemKey(item, idx)"
                  >
                    {{ getItemLabel(item, col.labelKey) }}
                    <q-badge color="primary" class="q-ml-xs">Owner</q-badge>
                    <span v-if="idx < getOwnedItems(props.row, col).length - 1">, </span>
                  </span>
                </template>
                <template v-else>
                  <span
                    v-for="(item, idx) in props.row[col.key] || []"
                    :key="getItemKey(item, idx)"
                  >
                    {{ getItemLabel(item, col.labelKey) }}
                    <span v-if="idx < props.row[col.key]?.length - 1">, </span>
                  </span>
                </template>
              </div>
            </q-td>
          </template>
        </q-table>

        <!-- Resumen inferior -->
        <div class="q-mt-md">
          <q-separator class="q-mb-md" />
          <div class="row items-stretch no-wrap q-gutter-md summary-row">
            <div class="col summary-col">
              <q-card flat bordered class="q-pa-sm">
                <div class="text-caption text-grey-7">Nº Movimientos</div>
                <div class="text-h6 q-mt-xs">{{ summary.count }}</div>
                <div class="text-caption text-grey-7">
                  registros encontrados: {{ pagination.rowsNumber }}
                </div>
              </q-card>
            </div>
            <div class="col summary-col">
              <q-card flat bordered class="q-pa-sm">
                <div class="text-caption text-grey-7">Total Gastos</div>
                <div class="text-h6 text-negative q-mt-xs">{{ formatMoney(summary.gastos) }}</div>
              </q-card>
            </div>
            <div class="col summary-col">
              <q-card flat bordered class="q-pa-sm">
                <div class="text-caption text-grey-7">Total Ingresos</div>
                <div class="text-h6 text-positive q-mt-xs">{{ formatMoney(summary.ingresos) }}</div>
              </q-card>
            </div>
            <div class="col summary-col">
              <q-card flat bordered class="q-pa-sm">
                <div class="text-caption text-grey-7">Impuesto gastado</div>
                <div class="text-h6 q-mt-xs">{{ formatMoney(summary.impuestos) }}</div>
              </q-card>
            </div>
            <div class="col summary-col">
              <q-card flat bordered class="q-pa-sm">
                <div class="text-caption text-grey-7">Balance Total</div>
                <div
                  :class="[
                    'text-h6',
                    'q-mt-xs',
                    summary.balance >= 0 ? 'text-positive' : 'text-negative',
                  ]"
                >
                  {{ formatMoney(summary.balance) }}
                </div>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Diálogos: usar genérico solo para EDITAR; para NUEVA transacción se usa TransactionCreateDialog (en UserLayout) -->
    <TransactionFormDialog
      v-model="ui.showDialogEditTransaction"
      :id="ui.editTransactionId || undefined"
    />

    <!-- Botón flotante para crear transacción -->
    <q-page-sticky position="bottom-right" :offset="[18, 18]">
      <q-btn fab color="primary" icon="add" @click="openNewFab" />
    </q-page-sticky>

    <!-- Dialogo ajustar saldo desde transacciones -->
    <q-dialog v-model="showAdjustTop">
      <q-card style="min-width: 360px">
        <q-card-section class="text-h6">Ajustar saldo de la cuenta</q-card-section>
        <q-card-section>
          <div class="text-caption q-mb-xs">Cuenta seleccionada: {{ singleAccountId ?? '-' }}</div>
          <q-input
            v-model="adjustBalanceTop"
            label="Nuevo saldo"
            type="number"
            step="0.01"
            dense
            filled
          />
          <div class="q-mt-sm">
            <q-checkbox v-model="includeInBalanceTop" label="Generar transacción de ajuste" dense />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup :disable="adjustingTop" />
          <q-btn color="primary" label="Guardar" :loading="adjustingTop" @click="submitAdjustTop" />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <q-dialog v-model="showAdjustTop">
      <q-card style="min-width: 360px">
        <q-card-section class="text-h6">Ajustar saldo de la cuenta</q-card-section>
        <q-card-section>
          <div class="text-caption q-mb-xs">Cuenta seleccionada: {{ singleAccountId ?? '-' }}</div>
          <q-input
            v-model="adjustBalanceTop"
            label="Nuevo saldo"
            type="number"
            step="0.01"
            dense
            filled
          />
          <div class="q-mt-sm">
            <q-checkbox v-model="includeInBalanceTop" label="Generar transacción de ajuste" dense />
          </div>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn flat label="Cancelar" v-close-popup :disable="adjustingTop" />
          <q-btn color="primary" label="Guardar" :loading="adjustingTop" @click="submitAdjustTop" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
// --- Helpers and methods required by template ---
function toStringLabel(val: unknown): string {
  if (typeof val === 'string') return val;
  if (typeof val === 'number' || typeof val === 'boolean') return String(val);
  return '';
}

const selectOptionsAll = reactive<Record<string, Array<Record<string, unknown>>>>({});
const selectOptionsFiltered = reactive<Record<string, Array<Record<string, unknown>>>>({});
// Imports MUST precede any statements (ESM rule); previously defineOptions was before imports causing vue-tsc errors.
import { ref, reactive, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { useQuasar, QInput, QCheckbox } from 'quasar';
import { api } from 'boot/axios';
// import { useAuthStore } from 'stores/auth';
import { dictionary as dictionaryDef } from './dictionary';
import { AccountsSidebarWidget, TransactionFormDialog } from 'components';
import { useTransactionsStore } from 'stores/transactions';
import { usePeriodStore } from 'stores/period';
import { useUiStore } from 'stores/ui';
defineOptions({ name: 'user_transactions_page' });

const $q = useQuasar();
const route = useRoute();
// const authStore = useAuthStore(); // actualmente no usado
const txStore = useTransactionsStore();
const ui = useUiStore();
const periodStore = usePeriodStore();

// Tipos del diccionario para ayuda local
interface CrudField {
  id: number;
  col?: number;
  vmodel: string;
  vmodel_api?: string;
  vmodel_url?: string;
  type: string;
  label: string;
  placeholder?: string;
  value?: string | number | boolean;
  items?: ReadonlyArray<unknown>;
  select_label?: string;
  order_by?: string;
  order_dir?: 'asc' | 'desc';
}
interface CrudColumn {
  name: string;
  key: string;
  type?: string;
  items?: ReadonlyArray<unknown>;
  manyToMany?: boolean;
  pivotKey?: string;
  ownerKey?: string;
  labelKey?: string;
}

// Adaptar diccionario importado (readonly) a tipos locales flexibles
interface CrudDictionary {
  title: string;
  description: string;
  buttonNewLabel: string;
  finderLabel: string;
  url_api: string;
  url_apis: string;
  pagination_params?: {
    page: string;
    per_page: string;
    sort_by: string;
    descending: string;
    search: string;
  };
  forms_filter: ReadonlyArray<CrudField>;
  columns: ReadonlyArray<CrudColumn>;
  buttons: ReadonlyArray<{
    icon: string;
    type_button: string;
    tooltip: string;
    type_action: string;
    action: string;
  }>;
  window_save_title: string;
  button_save_label: string;
  save_description: string;
  forms_save: ReadonlyArray<CrudField>;
  window_update_title: string;
  button_update_label: string;
  update_description: string;
  forms_update: ReadonlyArray<CrudField>;
}

const dictionary = dictionaryDef as unknown as CrudDictionary;

// Estado filtros
type FilterValue = string | number | boolean | null | undefined;
type Filters = Record<string, FilterValue> & { search: string };
const filters = reactive<Filters>({ search: '' });

// Tabla
type Row = Record<string, unknown>;
const rows = ref<Row[]>([]);
const loading = ref(false);

function getByPath(obj: unknown, path: string): unknown {
  return path.split('.').reduce<unknown>((acc, k) => {
    if (acc && typeof acc === 'object' && k in (acc as Record<string, unknown>)) {
      return (acc as Record<string, unknown>)[k];
    }
    return undefined;
  }, obj);
}

const baseColumns = (dictionary.columns as CrudColumn[]).map((col) => ({
  name: col.key === 'actions' ? 'actions' : col.key,
  label: col.name,
  field: col.key.includes('.') ? (row: Row) => getByPath(row, col.key) : col.key,
  align: col.type === 'boolean' ? ('center' as const) : ('left' as const),
  sortable: col.key !== 'actions',
  ...(col.type === 'boolean'
    ? { format: (val: unknown) => (val === true || val === 1 ? 'Sí' : 'No') }
    : {}),
  ...(col.key === 'time'
    ? {
        format: (val: unknown) => {
          const s = typeof val === 'string' ? val : String(val);
          const parts = s.split(':');
          const h = parts[0] ?? '0';
          const m = parts[1] ?? '00';
          const hourNum = Number(h);
          const ampm = hourNum >= 12 ? 'PM' : 'AM';
          const hour12 = hourNum % 12 || 12;
          return `${hour12.toString().padStart(2, '0')}:${m.padStart(2, '0')} ${ampm}`;
        },
      }
    : {}),
  ...(col.key === 'date'
    ? {
        format: (val: unknown) => {
          const s = typeof val === 'string' ? val : String(val);
          const iso = s.includes('T') ? s : s.replace(' ', 'T');
          const dt = new Date(iso);
          return dt.toLocaleString(undefined, {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true,
          });
        },
      }
    : {}),
}));

// Running balance support
const runningBalanceMap = ref<Record<string | number, number>>({});
const singleAccountSelected = computed(
  () => Array.isArray(txStore.selectedAccountIds) && txStore.selectedAccountIds.length === 1
);
const singleAccountId = computed<number | null>(() => {
  if (!singleAccountSelected.value) return null;
  const raw = txStore.selectedAccountIds[0];
  const n = Number(raw);
  return Number.isFinite(n) ? n : null;
});
const singleAccountBalance = ref<number | null>(null);
const singleAccountBalanceLoading = ref(false);
// Moneda asociada a la cuenta seleccionada
const singleAccountCurrencySymbol = ref<string>('$');
const singleAccountCurrencyAlign = ref<'left' | 'right'>('left');
// Helper para convertir valores numéricos que llegan como string o number
function toNumeric(val: unknown): number | null {
  if (typeof val === 'number' && Number.isFinite(val)) return val;
  if (typeof val === 'string') {
    const s = val.trim();
    if (!s) return null;
    // El backend envía números como "351.40"; removemos separadores de miles comunes
    const normalized = s.replace(/\s+/g, '').replace(/,/g, '');
    const n = Number(normalized);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}
async function fetchSingleAccountBalance(): Promise<void> {
  const id = singleAccountId.value;
  if (!id) {
    singleAccountBalance.value = null;
    return;
  }
  try {
    singleAccountBalanceLoading.value = true;
    const resp = await api.get(`/accounts/${id}`);
    const data = (resp.data?.data ?? resp.data) as Record<string, unknown> | undefined;
    let bal: number | null = null;
    if (data && typeof data === 'object') {
      // Fuente principal: objeto raíz o data.account
      const source: Record<string, unknown> =
        data['account'] && typeof data['account'] === 'object'
          ? (data['account'] as Record<string, unknown>)
          : data;
      // Capturar moneda si existe
      if (source['currency'] && typeof source['currency'] === 'object') {
        const cur = source['currency'] as Record<string, unknown>;
        const sym = typeof cur['symbol'] === 'string' ? cur['symbol'] : '$';
        const alignRaw = typeof cur['align'] === 'string' ? cur['align'].toLowerCase() : 'left';
        singleAccountCurrencySymbol.value = sym || '$';
        singleAccountCurrencyAlign.value = alignRaw === 'right' ? 'right' : 'left';
      }
      const candidateKeys = [
        'balance_cached',
        'balance',
        'balance_calculado',
        'current_balance',
        'saldo',
        'initial',
      ];
      for (const k of candidateKeys) {
        if (bal != null) break;
        bal = toNumeric(source[k]);
      }
      // Si todavía no encontramos, intentamos sobre el objeto raíz completo con todas las keys
      if (bal == null && source !== data) {
        for (const k of candidateKeys) {
          if (bal != null) break;
          bal = toNumeric(data[k]);
        }
      }
    }
    singleAccountBalance.value = bal != null ? bal : 0;
  } catch {
    // si falla, no rompas la UI; deja último valor o null
    if (singleAccountBalance.value == null) singleAccountBalance.value = 0;
  } finally {
    singleAccountBalanceLoading.value = false;
  }
}
// Formato específico del saldo de la cuenta seleccionada: -400$
function formatSingleAccountBalanceDisplay(): string {
  const val = singleAccountBalance.value ?? 0;
  const sym = singleAccountCurrencySymbol.value || '$';
  const align = singleAccountCurrencyAlign.value;
  const absStr = Math.abs(val).toFixed(2).replace(/\.00$/, '');
  const sign = val < 0 ? '-' : '';
  // Requerimiento: símbolo al final (ej: -400$) independientemente del align, pero lo dejamos
  // preparado por si luego se quiere usar align para variar.
  if (align === 'left') return `${sign}${absStr}${sym}`;
  return `${sign}${absStr}${sym}`;
}
// reactivo a selección de cuenta
watch(
  () => singleAccountId.value,
  (id) => {
    if (id) void fetchSingleAccountBalance();
    else singleAccountBalance.value = null;
  },
  { immediate: true }
);
const showRunningBalanceColumn = computed(
  () => singleAccountSelected.value && pagination.value.sortBy === 'date'
);
function computeRunningBalances(): void {
  if (!showRunningBalanceColumn.value) {
    runningBalanceMap.value = {};
    return;
  }
  const currentBalance = singleAccountBalance.value;
  if (currentBalance == null) {
    runningBalanceMap.value = {};
    return;
  }
  const list = rows.value.slice();
  const amounts = list.map((r) => parseNumber((r as Record<string, unknown>)['amount']));
  const descending = pagination.value.descending;
  const sortBy = pagination.value.sortBy;
  if (sortBy !== 'date') {
    runningBalanceMap.value = {};
    return;
  }
  const map: Record<string | number, number> = {};
  if (descending) {
    let bal = currentBalance;
    for (let i = 0; i < list.length; i++) {
      const row = list[i] as Record<string, unknown>;
      const id = (row['id'] as string | number | undefined) ?? i;
      map[id] = bal;
      const amt = amounts[i] ?? 0;
      bal = bal - amt;
    }
  } else {
    const total = amounts.reduce((a, b) => a + b, 0);
    let bal = currentBalance - total;
    for (let i = 0; i < list.length; i++) {
      const row = list[i] as Record<string, unknown>;
      const id = (row['id'] as string | number | undefined) ?? i;
      const amt = amounts[i] ?? 0;
      bal = bal + amt;
      map[id] = bal;
    }
  }
  runningBalanceMap.value = map;
}
interface ColumnDef {
  name: string;
  label: string;
  field: string | ((row: Row) => unknown);
  align: 'left' | 'center' | 'right';
  sortable: boolean;
  format?: (val: unknown) => string;
}
const runningBalanceColumn: ColumnDef = {
  name: 'running_balance',
  label: 'Balance',
  field: (row: Row) => {
    const id = (row as Record<string, unknown>)['id'] as string | number | undefined;
    const key = id ?? rows.value.indexOf(row);
    const val = runningBalanceMap.value[key];
    if (val == null) return '';
    return formatMoney(val);
  },
  align: 'right' as const,
  sortable: false,
};
const columns = computed<ColumnDef[]>(() => {
  const base = baseColumns as unknown as ColumnDef[];
  if (!showRunningBalanceColumn.value) return base;
  const clone = [...base];
  const idx = clone.findIndex((c) => c.name === 'amount');
  if (idx >= 0 && !clone.find((c) => c.name === 'running_balance'))
    clone.splice(idx + 1, 0, runningBalanceColumn);
  else if (!clone.find((c) => c.name === 'running_balance')) clone.push(runningBalanceColumn);
  return clone;
});

// ===== Acciones de saldo (ajustar / recalcular) desde cabecera =====
const showAdjustTop = ref(false);
const adjustBalanceTop = ref<string>('');
const adjustingTop = ref(false);
const includeInBalanceTop = ref(true);
function openAdjustTop(): void {
  if (!singleAccountSelected.value) return;
  adjustBalanceTop.value =
    singleAccountBalance.value != null ? singleAccountBalance.value.toFixed(2) : '';
  showAdjustTop.value = true;
}
async function submitAdjustTop(): Promise<void> {
  const id = singleAccountId.value;
  if (!id) return;
  const n = Number(adjustBalanceTop.value);
  if (!Number.isFinite(n)) {
    $q.notify({ type: 'warning', message: 'Ingresa un saldo válido' });
    return;
  }
  try {
    adjustingTop.value = true;
    await api.post(`/accounts/${id}/adjust-balance`, {
      target_balance: n,
      include_in_balance: includeInBalanceTop.value,
    });
    await api.post(`/accounts/${id}/recalculate-account`);
    $q.notify({ type: 'positive', message: 'Saldo ajustado' });
    showAdjustTop.value = false;
    await runFetch(true);
    await fetchSingleAccountBalance();
    window.dispatchEvent(
      new CustomEvent('ow:transactions:changed', { detail: { account_id: id, reason: 'adjust' } })
    );
  } catch {
    $q.notify({ type: 'negative', message: 'Error ajustando saldo' });
  } finally {
    adjustingTop.value = false;
  }
}
async function recalcSingleAccountTop(): Promise<void> {
  const id = singleAccountId.value;
  if (!id) return;
  try {
    $q.loading.show({ message: 'Recalculando saldo...' });
    await api.post(`/accounts/${id}/recalculate-account`);
    $q.notify({ type: 'positive', message: 'Saldo recalculado' });
    await runFetch(true);
    await fetchSingleAccountBalance();
    window.dispatchEvent(
      new CustomEvent('ow:transactions:changed', { detail: { account_id: id, reason: 'recalc' } })
    );
  } catch {
    $q.notify({ type: 'negative', message: 'Error recalculando saldo' });
  } finally {
    $q.loading.hide();
  }
}

// Paginación
const defaultSortKey = dictionary.columns.find((c) => c.key === 'date')
  ? 'date'
  : dictionary.columns[0]?.key || 'id';
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  sortBy: defaultSortKey,
  descending: true,
  rowsNumber: 0,
});

// ...existing code...

// QTable server-side
type QTablePagination = {
  sortBy: string;
  descending: boolean;
  page: number;
  rowsPerPage: number;
  rowsNumber?: number;
};
type QTableRequestProps = {
  pagination?: QTablePagination;
  filter?: string;
};

function buildQueryParams(): Record<string, unknown> {
  const pmap = dictionary.pagination_params || {
    page: 'page',
    per_page: 'per_page',
    sort_by: 'sort_by',
    descending: 'descending',
    search: 'search',
  };
  const params: Record<string, unknown> = {
    [pmap.page]: pagination.value.page,
    [pmap.per_page]: pagination.value.rowsPerPage,
    [pmap.sort_by]: pagination.value.sortBy,
    [pmap.descending]: pagination.value.descending,
  };
  if (filters.search) params[pmap.search] = filters.search;
  // Parámetros de periodo (cuando aplique)
  const periodParams = periodStore.queryParams;
  Object.entries(periodParams).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== '') params[k] = v;
  });
  for (const f of dictionary.forms_filter as unknown as CrudField[]) {
    const val = (filters as Record<string, FilterValue>)[f.vmodel];
    if (val !== undefined && val !== null && val !== '') {
      params[f.vmodel_api || f.vmodel] = val;
    }
  }
  // Multi-cuenta: si hay más de una cuenta seleccionada en el sidebar, enviar account_ids (sin tocar la URL)
  if (Array.isArray(txStore.selectedAccountIds) && txStore.selectedAccountIds.length > 1) {
    const csv = txStore.selectedAccountIds
      .map((v: unknown) => {
        const n = Number(v);
        return Number.isFinite(n) ? String(n) : String(v);
      })
      .join(',');
    if (csv) params['account_ids'] = csv;
  }
  return params;
}

async function onRequest(props: QTableRequestProps): Promise<void> {
  if (props.pagination) {
    pagination.value = {
      ...pagination.value,
      page: props.pagination.page,
      rowsPerPage: props.pagination.rowsPerPage,
      sortBy: props.pagination.sortBy,
      descending: props.pagination.descending,
    };
  }
  await runFetch();
}

let currentAbort: AbortController | null = null;
async function fetchData(params?: Record<string, unknown>): Promise<void> {
  if (currentAbort) currentAbort.abort();
  const controller = new AbortController();
  currentAbort = controller;
  loading.value = true;
  try {
    const res = await api.get(`/${dictionary.url_apis}`, {
      params: params || { ...filters },
      signal: controller.signal,
    });
    const data: unknown = res.data;
    let arr: Row[] = [];
    if (Array.isArray(data)) {
      arr = data as Row[];
    } else if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>;
      if (Array.isArray(obj.data)) arr = obj.data as Row[];
      else if (Array.isArray(obj.items)) arr = obj.items as Row[];
      else if (Array.isArray(obj.results)) arr = obj.results as Row[];
      else if (Array.isArray(obj.rows)) arr = obj.rows as Row[];
      else if (Array.isArray(obj.records)) arr = obj.records as Row[];
      else if (Array.isArray(obj.transactions)) arr = obj.transactions as Row[];
      else if (obj.data && typeof obj.data === 'object') {
        const inner = obj.data as Record<string, unknown>;
        if (Array.isArray(inner.data)) arr = inner.data as Row[];
        else if (Array.isArray(inner.items)) arr = inner.items as Row[];
        else if (Array.isArray(inner.results)) arr = inner.results as Row[];
        else if (Array.isArray(inner.rows)) arr = inner.rows as Row[];
        else if (Array.isArray(inner.records)) arr = inner.records as Row[];
        else if (Array.isArray(inner.transactions)) arr = inner.transactions as Row[];
      }
    }
    rows.value = arr;
    let total = arr.length;
    if (data && typeof data === 'object') {
      const obj = data as Record<string, unknown>;
      const meta = (obj['meta'] as Record<string, unknown> | undefined) || undefined;
      const paginationObj = (obj['pagination'] as Record<string, unknown> | undefined) || undefined;
      let rawTotal =
        (meta ? meta['total'] : undefined) ||
        (paginationObj ? paginationObj['total'] : undefined) ||
        obj['total'];
      if (rawTotal === undefined && obj.data && typeof obj.data === 'object') {
        const inner = obj.data as Record<string, unknown>;
        rawTotal = inner['total'];
      }
      if (typeof rawTotal === 'number') total = rawTotal;
      else if (typeof rawTotal === 'string' && rawTotal.trim() !== '') {
        const n = Number(rawTotal);
        if (Number.isFinite(n)) total = n;
      }
    }
    pagination.value.rowsNumber = Number(total) || 0;
  } catch (err) {
    const e = err as { name?: string } | undefined;
    if ((e && e.name === 'CanceledError') || controller.signal.aborted) return;
    $q.notify({ type: 'negative', message: 'Error cargando datos' });
  } finally {
    loading.value = false;
  }
}

// Scheduler unificado
let fetchDebounceTimer: number | undefined;
let lastParamsSignature = '';
function stableSignature(obj: Record<string, unknown>): string {
  return JSON.stringify(Object.entries(obj).sort(([a], [b]) => a.localeCompare(b)));
}
function scheduleFetch(): void {
  if (fetchDebounceTimer) window.clearTimeout(fetchDebounceTimer);
  fetchDebounceTimer = window.setTimeout(() => {
    void runFetch();
  }, 300);
}
async function runFetch(force = false): Promise<void> {
  const params = buildQueryParams();
  const sig = stableSignature(params);
  if (!force && sig === lastParamsSignature) return;
  lastParamsSignature = sig;
  await fetchData(params);
  computeRunningBalances();
  if (singleAccountSelected.value) void fetchSingleAccountBalance();
}

// Montaje: cargar selects y datos
onMounted(async () => {
  const initialSearch = (route.query.search as string) || '';
  filters.search = initialSearch;
  for (const f of dictionary.forms_filter as unknown as CrudField[]) {
    (filters as Record<string, FilterValue>)[f.vmodel] = (f.value as FilterValue) ?? '';
  }
  for (const f of dictionary.forms_filter as unknown as CrudField[]) {
    const key = f.vmodel_api || f.vmodel;
    const raw = route.query[key];
    if (raw == null) continue;
    let v: FilterValue = Array.isArray(raw) ? raw[0] : raw;
    if (f.type === 'select') {
      const n = Number(v);
      v = Number.isFinite(n) ? n : (v as string);
    } else {
      v = v as string;
    }
    (filters as Record<string, FilterValue>)[f.vmodel] = v;
  }

  const setOptions = (field: CrudField, list: Array<Record<string, unknown>>) => {
    const labelKey = field.select_label || 'name';
    const sorted = [...list].sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
      const laStr = toStringLabel(a[labelKey]).toLowerCase();
      const lbStr = toStringLabel(b[labelKey]).toLowerCase();
      return laStr.localeCompare(lbStr, undefined, { numeric: true });
    });
    selectOptionsAll[field.vmodel] = sorted;
    selectOptionsFiltered[field.vmodel] = sorted;
  };

  const fieldsForSelects: CrudField[] = ([] as CrudField[]).concat(
    dictionary.forms_filter as unknown as CrudField[],
    dictionary.forms_save as unknown as CrudField[],
    dictionary.forms_update as unknown as CrudField[]
  );
  for (const field of fieldsForSelects) {
    if (field.type !== 'select') continue;
    try {
      if (field.vmodel_url) {
        const params: Record<string, unknown> = {};
        if (field.order_by) {
          params.order_by = field.order_by;
          params.order_dir = field.order_dir || 'asc';
        }
        const r = await api.get(`/${field.vmodel_url}`, { params });
        const list = (r.data?.data || r.data || []) as Array<Record<string, unknown>>;
        setOptions(field, Array.isArray(list) ? list : []);
      } else if (Array.isArray(field.items) && field.items.length) {
        setOptions(field, field.items as Array<Record<string, unknown>>);
      } else {
        setOptions(field, []);
      }
    } catch (e) {
      console.error('Error cargando opciones de', field.vmodel_url || field.vmodel, e);
      setOptions(field, []);
    }
  }

  await runFetch(true);

  // Listen to transaction changes to refresh single account balance/banner
  const handler = () => {
    if (singleAccountSelected.value) {
      // Refrescar datos y saldo actual de la cuenta
      void runFetch(true);
      void fetchSingleAccountBalance();
    }
  };
  window.addEventListener('ow:transactions:changed', handler);
});

// Sidebar de cuentas: si hay exactamente una cuenta seleccionada en el widget,
// aplicamos el filtro account_id; en caso contrario quitamos el filtro.
watch(
  () => txStore.selectedAccountIds.slice(),
  (ids) => {
    if (Array.isArray(ids) && ids.length === 1) {
      const raw = ids[0];
      const asNum = Number(raw);
      (filters as Record<string, FilterValue>)['account_id'] = Number.isFinite(asNum)
        ? asNum
        : (String(raw) as FilterValue);
    } else {
      (filters as Record<string, FilterValue>)['account_id'] = '';
    }
    pagination.value.page = 1;
    scheduleFetch();
  },
  { deep: false }
);

// Cuando se cierra el diálogo de nueva transacción (TransactionCreateDialog), refrescar la tabla
watch(
  () => ui.showDialogNewTransaction,
  (open, prev) => {
    if (prev === true && open === false) void runFetch(true);
  }
);

// Si el usuario usa el filtro de "Cuenta" del formulario, reflejamos en el sidebar.
watch(
  () => (filters as Record<string, FilterValue>)['account_id'],
  (val) => {
    const current = txStore.selectedAccountIds.map(String);
    const desired = val == null || val === '' ? [] : [String(val as unknown as string | number)];
    if (JSON.stringify(current) !== JSON.stringify(desired)) {
      txStore.setSelectedAccountIds(desired);
    }
  }
);

// Filtros internos: usar scheduler unificado
watch(
  () => ({ ...filters }),
  () => {
    pagination.value.page = 1;
    scheduleFetch();
  },
  { deep: true }
);

// Cambios de periodo => refetch
watch(
  () => periodStore.signature,
  () => {
    pagination.value.page = 1;
    scheduleFetch();
  }
);

// Nota multi-cuentas: para >1 cuenta se usa account_ids en CSV y se ignora account_id individual.

const manyToManyColumns = computed(() =>
  (dictionary.columns as unknown as CrudColumn[]).filter((col) => Boolean(col.manyToMany))
);

// Helpers de many-to-many
type AnyRecord = Record<string, unknown>;
function isRecord(v: unknown): v is AnyRecord {
  return !!v && typeof v === 'object';
}
function asArray(v: unknown): AnyRecord[] {
  return Array.isArray(v) ? (v as AnyRecord[]) : [];
}
function getItemLabel(item: AnyRecord, labelKey?: string): string {
  const key = labelKey || 'name';
  const val = isRecord(item) ? item[key] : undefined;
  return toStringLabel(val);
}
function getOwnedItems(row: Row, col: CrudColumn): AnyRecord[] {
  const list = asArray((row as AnyRecord)[col.key]);
  if (!col.pivotKey || !col.ownerKey) return list;
  const pk = col.pivotKey;
  const ok = col.ownerKey;
  return list.filter((u: AnyRecord) => {
    if (!isRecord(u)) return false;
    const pv = u[pk];
    if (!isRecord(pv)) return false;
    const piv = pv as Record<string, unknown>;
    return Boolean(piv[ok]);
  });
}
function getItemKey(item: AnyRecord, idx: number): string | number {
  const id = isRecord(item) ? item['id'] : undefined;
  if (typeof id === 'string' || typeof id === 'number') return id;
  return idx;
}

// ====== Resumen inferior (ingresos/gastos/impuestos) ======
function parseNumber(val: unknown): number {
  if (typeof val === 'number') return Number.isFinite(val) ? val : 0;
  if (typeof val === 'string') {
    const s = val.trim();
    if (!s) return 0;
    // Try standard parse
    const n1 = Number(s);
    if (Number.isFinite(n1)) return n1;
    // Try ES locale with comma decimals ("1.234,56")
    const normalized = s.replace(/\./g, '').replace(/,/g, '.');
    const n2 = Number(normalized);
    return Number.isFinite(n2) ? n2 : 0;
  }
  return 0;
}
function isTransferRow(row: Row): boolean {
  const tt = (row as AnyRecord)['transaction_type'] as AnyRecord | undefined;
  let rawName: unknown = '';
  if (tt && typeof tt === 'object') rawName = (tt as Record<string, unknown>)['name'];
  const name = typeof rawName === 'string' ? rawName : '';
  const low = name.toLowerCase();
  return low.includes('transfer') || low.includes('traspaso');
}
const summary = computed(() => {
  let gastos = 0;
  let ingresos = 0;
  let impuestos = 0;
  const count = rows.value.length;
  for (const r of rows.value) {
    const amt = parseNumber((r as AnyRecord)['amount']);
    const tax = parseNumber((r as AnyRecord)['amount_tax']);
    const transfer = isTransferRow(r);
    if (!transfer) {
      if (amt < 0) gastos += Math.abs(amt);
      else if (amt > 0) ingresos += amt;
    }
    // Sum taxes when present; if expense, consider absolute
    if (tax) impuestos += Math.abs(tax);
  }
  const balance = ingresos - gastos;
  return { count, gastos, ingresos, impuestos, balance };
});
function formatMoney(n: number): string {
  const val = Number(n || 0);
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: 'USD',
    currencyDisplay: 'narrowSymbol',
    minimumFractionDigits: 2,
  }).format(val);
}

function clearFilters(): void {
  filters.search = '';
  for (const f of dictionary.forms_filter) {
    (filters as Record<string, FilterValue>)[f.vmodel] = '';
  }
  pagination.value.page = 1;
  void runFetch();
}

// ===== Métodos faltantes referenciados en template =====
function openNewFab(): void {
  ui.openNewTransactionDialog();
}
// Selección de componente para filtros dinámicos (solo soportamos select/input/checkbox básicos)
function selectComponent(type: string) {
  switch (type) {
    case 'select':
      return 'q-select';
    case 'checkbox':
      return 'q-checkbox';
    case 'input':
    default:
      return 'q-input';
  }
}
function fieldProps(field: CrudField) {
  const base: Record<string, unknown> = {};
  if (field.type === 'select') {
    base.options = selectOptionsFiltered[field.vmodel] || [];
    base.optionValue = 'id';
    base.optionLabel = field.select_label || 'name';
    base.clearable = true;
    base.dense = true;
    base.filled = true;
    base.emitValue = true;
    base.mapOptions = true;
    base.useInput = true;
    base.inputDebounce = 0;
    base.onFilter = (val: string, done: (cb: () => void) => void) => {
      const list = selectOptionsAll[field.vmodel] || [];
      const needle = (val || '').toLowerCase();
      done(() => {
        selectOptionsFiltered[field.vmodel] = !needle
          ? list
          : list.filter((o) =>
              toStringLabel(o[field.select_label || 'name'])
                .toLowerCase()
                .includes(needle)
            );
      });
    };
  } else if (field.type === 'checkbox') {
    base.dense = true;
  } else {
    base.type = 'text';
    base.dense = true;
    base.filled = true;
    if (field.placeholder) base.placeholder = field.placeholder;
  }
  base.label = field.label;
  return base;
}
function edit(row: Record<string, unknown>) {
  const idRaw = row && row['id'];
  const id = Number(idRaw);
  if (!Number.isFinite(id)) return;
  ui.openEditTransactionDialog(id);
}
function remove(row: Record<string, unknown>) {
  const idRaw = row && row['id'];
  const id = Number(idRaw);
  if (!Number.isFinite(id)) return;
  $q.dialog({
    title: 'Confirmar',
    message: '¿Eliminar la transacción seleccionada?',
    cancel: true,
    persistent: true,
  }).onOk(() => {
    // Ejecutar asincrónicamente sin retornar promesa al manejador de onOk
    void (async () => {
      try {
        await txStore.deleteTransaction(id);
        $q.notify({ type: 'positive', message: 'Transacción eliminada' });
        void runFetch(true);
        if (singleAccountSelected.value) void fetchSingleAccountBalance();
      } catch {
        $q.notify({ type: 'negative', message: 'Error eliminando transacción' });
      }
    })();
  });
}

function exportCSV(): void {
  if (!rows.value?.length) return;
  const allCols = columns.value;
  const visibleCols = allCols.filter((c) => c.name !== 'actions');
  const header = visibleCols.map((c: ColumnDef) => c.label);
  const csv = [header.join(',')]
    .concat(
      rows.value.map((row) =>
        visibleCols
          .map((col: ColumnDef) => {
            let v: unknown;
            if (typeof col.field === 'function') {
              v = col.field(row);
            } else {
              v = row[col.field];
            }
            const val = typeof v === 'boolean' ? (v ? 'Sí' : 'No') : v ?? '';
            return JSON.stringify(val);
          })
          .join(',')
      )
    )
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${(dictionary.title || 'export').toLowerCase()}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
</script>



<style scoped>
.sticky-sidebar {
  position: sticky;
  top: 12px;
  z-index: 1;
}
.summary-row {
  overflow-x: auto;
}
.summary-col {
  min-width: 220px;
}
</style>
