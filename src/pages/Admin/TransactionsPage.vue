<template>
  <q-page class="q-pa-md">
    <div class="row items-center q-mb-md">
      <div class="col">
        <div class="text-h5">Transacciones</div>
      </div>
      <div class="col-auto">
        <q-btn label="Nueva Transacción" color="primary" @click="openDialog" />
      </div>
    </div>

    <!-- Heading above table -->
    <div class="text-h6 q-mb-md">Listado de Transacciones</div>
    <!-- Filters block full-width above table -->
    <div class="q-pa-xs q-mb-md">
      <div class="row q-col-gutter-md items-start">
        <div class="col-4">
          <div class="text-caption q-mb-xs">Buscar</div>
          <q-input
            class="full-width"
            debounce="300"
            v-model="filter"
            placeholder="Buscar..."
            dense
            filled
          >
            <template v-slot:append><q-icon name="search" /></template>
          </q-input>
        </div>
        <div class="col-4">
          <div class="text-caption q-mb-xs">Proveedor</div>
          <q-select
            class="full-width"
            v-model="providerFilter"
            :options="filteredProviderOptions"
            option-value="id"
            option-label="name"
            dense
            filled
            use-input
            clearable
            input-debounce="300"
            @filter="filterProvider"
          />
        </div>
        <div class="col-4">
          <div class="text-caption q-mb-xs">Usuario</div>
          <q-select
            class="full-width"
            v-model="userFilter"
            :options="filteredUserOptions"
            option-value="id"
            option-label="name"
            dense
            filled
            use-input
            clearable
            input-debounce="300"
            @filter="filterUser"
          />
        </div>
      </div>
      <div class="row q-col-gutter-md q-mt-sm items-start">
        <div class="col-4">
          <div class="text-caption q-mb-xs">Cuenta</div>
          <q-select
            class="full-width"
            v-model="accountFilter"
            :options="filteredAccountOptions"
            option-value="id"
            option-label="name"
            dense
            filled
            clearable
            use-input
            input-debounce="300"
            @filter="filterAccount"
          />
        </div>
        <div class="col-4">
          <div class="text-caption q-mb-xs">Tipo de Transacción</div>
          <q-select
            class="full-width"
            v-model="transactionTypeFilter"
            :options="filteredTransactionTypeOptions"
            option-value="name"
            option-label="name"
            emit-value
            map-options
            dense
            filled
            clearable
            use-input
            input-debounce="300"
            @filter="filterTransactionType"
          />
        </div>
        <div class="col-4 row items-center q-gutter-sm justify-end">
          <q-btn
            icon="brush"
            flat
            round
            @click="clearFilters"
            :disable="loading"
            title="Limpiar filtros"
          />
          <q-btn icon="refresh" flat round @click="refresh" :disable="loading" title="Refrescar" />
          <q-btn icon="download" flat round @click="exportCSV" title="Exportar CSV" />
        </div>
      </div>
      <div class="row q-mt-sm">
        <div class="col-12">
          <q-select
            v-model="columnSelection"
            :options="allColumnOptions"
            multiple
            emit-value
            map-options
            label="Columnas a mostrar"
            dense
          />
        </div>
      </div>
    </div>
    <!-- :sort-method="customSort" -->
    <q-table
      server
      :columns="visibleColumns"
      :rows="transactions"
      :loading="loading"
      row-key="id"
      flat
      bordered
      class="shadow-1"
      v-model:pagination="pagination"
      selection="multiple"
      :selected="selected"
      @update:selected="updateSelected"
      @request="onRequest"
      sort-desc-first
      :max-sort-rounds="2"
    >
      <template v-slot:body-cell-actions="props">
        <q-td align="right">
          <q-btn flat round icon="edit" color="primary" @click="edit(props.row)" />
          <q-btn flat round icon="delete" color="negative" @click="remove(props.row)" />
        </q-td>
      </template>
      <template v-slot:bottom-row>
        <q-tr>
          <q-td colspan="100%">
            <div class="text-right text-bold">
              Total Cantidad: {{ totalAmount }} | Total Impuesto: {{ totalTax }}
            </div>
          </q-td>
        </q-tr>
      </template>
    </q-table>
    <q-dialog v-model="showDialog" @keydown.escape="showDialog = false">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">{{ editing ? 'Editar' : 'Nueva' }} Transacción</div>
        </q-card-section>

        <q-card-section>
          <q-form @submit.prevent="save">
            <q-input v-model="form.name" label="Nombre" filled dense />
            <q-input
              v-model.number="form.amount"
              label="Cantidad"
              type="number"
              filled
              dense
              class="q-mt-sm"
            />
            <q-input
              v-model.number="form.amount_tax"
              label="Impuesto"
              type="number"
              filled
              dense
              class="q-mt-sm"
            />
            <q-input
              v-model="form.description"
              label="Descripción"
              type="textarea"
              filled
              dense
              class="q-mt-sm"
            />
            <div class="row q-col-gutter-md q-mt-sm">
              <div class="col-6">
                <q-date
                  v-model="form.date"
                  label="Fecha"
                  filled
                  dense
                  class="full-width"
                  mask="YYYY-MM-DD"
                />
              </div>
              <div class="col-auto q-ml-lg">
                <q-input
                  v-model="form.time"
                  label="Hora"
                  type="time"
                  filled
                  dense
                  style="max-width: 120px"
                />
              </div>
            </div>
            <q-checkbox v-model="form.active" label="Activo" class="q-mt-sm" />
            <!-- Usuario: cargar todos y preselección de sesión -->
            <q-select
              v-model="form.user_id"
              :options="filteredUserOptions"
              option-value="id"
              option-label="name"
              emit-value
              map-options
              label="Usuario"
              dense
              use-input
              clearable
              input-debounce="300"
              @filter="filterUser"
              class="q-mt-sm"
            />
            <q-select
              v-model="form.provider_id"
              :options="providerOptions"
              option-value="id"
              option-label="name"
              emit-value
              map-options
              label="Proveedor"
              use-input
              fill-input
              new-value-mode="add"
              class="q-mt-sm"
              dense
            />
            <q-select
              v-model="form.rate_id"
              :options="rateOptions"
              option-value="id"
              option-label="name"
              emit-value
              map-options
              label="Tarifa"
              class="q-mt-sm"
              dense
            />
            <q-select
              v-model="form.account_id"
              :options="accountOptions"
              option-value="id"
              option-label="name"
              emit-value
              map-options
              label="Cuenta"
              class="q-mt-sm"
              dense
            />
            <!-- <q-file v-model="form.file" label="Archivo" class="q-mt-sm" dense /> -->
            <q-input v-model="form.url_file" label="URL del Archivo" class="q-mt-sm" dense />
          </q-form>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="Cancelar" color="secondary" v-close-popup />
          <q-btn flat label="Guardar" color="primary" @click="save" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
/* eslint-disable */
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
import { useTransactionsStore } from 'stores/transactions';
import { useAuthStore } from 'stores/auth';
import type { Transaction } from 'stores/transactions';
import type { QTableColumn } from 'quasar';
import { useRouter, useRoute } from 'vue-router';

// Filter values
const providerFilter = ref<number | null>(null);
const userFilter = ref<number | null>(null);
const accountFilter = ref<number | null>(null);
const rateFilter = ref<number | null>(null);
const transactionTypeFilter = ref<string | null>(null);

// Router for syncing search query
const router = useRouter();
const route = useRoute();

const $q = useQuasar();

const filter = ref(''); // search term

// Initialize filter from URL query
filter.value = (route.query.search as string) || '';

const showDialog = ref(false);
const editing = ref(false);
// Mejor tipado para el formulario de transacción
interface TransactionForm {
  id?: number;
  name: string;
  amount: number | null;
  amount_tax: number | null;
  description: string;
  date: string;
  time: string;
  active: boolean;
  user_id: number | null;
  provider_id: number | null;
  rate_id: number | null;
  account_id: number | null;
  url_file: string;
}

// Declarar authStore antes de usarlo
const authStore = useAuthStore();

// Inicializar form después de authStore
const initialForm = (): TransactionForm => ({
  name: '',
  amount: null,
  amount_tax: null,
  description: '',
  // default to current date and time
  date: new Date().toISOString().slice(0, 10),
  time: new Date().toTimeString().slice(0, 5),
  active: true,
  user_id: authStore.user?.id ?? null,
  provider_id: null,
  rate_id: null,
  account_id: null,
  url_file: '',
});
const form = ref<TransactionForm>(initialForm());
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  sortBy: 'date',
  descending: true, // más reciente a más antigua por defecto
  rowsNumber: 0,
});
// Filas seleccionadas de la tabla
const selected = ref<Transaction[]>([]);
// Handle QTable selection updates (readonly to mutable)
function updateSelected(val: readonly Transaction[]) {
  selected.value = [...val];
}
// Rely on sort-desc-first prop to toggle ordering automatically

// Transactions store
const tsStore = useTransactionsStore();
const transactions = computed(() => tsStore.transactions);
// Transaction type filter refs deben inicializarse antes del watch
const transactionTypeOptions = ref<{ id: string; name: string }[]>([]);
const filteredTransactionTypeOptions = ref<{ id: string; name: string }[]>([]);
// Actualiza dinámicamente los tipos de transacción a partir de los datos cargados
watch(
  transactions,
  (list) => {
    const types = Array.from(
      new Set(list.map((t) => t.transaction_type).filter((v): v is string => !!v))
    );
    transactionTypeOptions.value = types.map((type) => ({ id: type, name: type }));
    filteredTransactionTypeOptions.value = transactionTypeOptions.value;
  },
  { immediate: true }
);
const loading = computed(() => tsStore.loading);
// update total records count for pagination
watch(
  () => tsStore.total,
  (total) => {
    pagination.value.rowsNumber = total;
  },
  { immediate: true }
);

const providerOptions = ref<{ id: number; name: string }[]>([]);
const filteredProviderOptions = ref<{ id: number; name: string }[]>([]);
const userOptions = ref<{ id: number; name: string }[]>([]);
const filteredUserOptions = ref<{ id: number; name: string }[]>([]);
const accountOptions = ref<{ id: number; name: string }[]>([]);
const filteredAccountOptions = ref<{ id: number; name: string }[]>([]);
const rateOptions = ref<{ id: number; name: string }[]>([
  { id: 1, name: 'Tarifa A' },
  { id: 2, name: 'Tarifa B' },
]);

const columns: QTableColumn<Transaction>[] = [
  { name: 'id', label: 'ID', field: 'id', align: 'left', sortable: true },
  { name: 'name', label: 'Nombre', field: 'name', align: 'left', sortable: true },
  { name: 'amount', label: 'Cantidad', field: 'amount', align: 'right', sortable: true },
  { name: 'amount_tax', label: 'Impuesto', field: 'amount_tax', align: 'right', sortable: true },
  {
    name: 'date',
    label: 'Fecha',
    field: 'date',
    align: 'left',
    sortable: true,
    format: (val: string) => {
      if (!val) return '';
      const d = new Date(val);
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      let hours = d.getHours();
      const minutes = String(d.getMinutes()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; // 0 => 12
      return `${day}/${month}/${year} ${hours}:${minutes} ${ampm}`;
    },
  },
  { name: 'active', label: 'Activo', field: 'active', align: 'center', sortable: true },
  {
    name: 'user',
    label: 'Usuario',
    field: (row: Transaction) => row.user?.name,
    align: 'left',
    sortable: true,
  },
  {
    name: 'provider',
    label: 'Proveedor',
    field: (row: Transaction) => row.provider?.name,
    align: 'left',
    sortable: true,
  },
  {
    name: 'rate',
    label: 'Tarifa',
    field: (row: Transaction) => row.rate?.value,
    align: 'left',
    sortable: true,
  },
  {
    name: 'transaction_type',
    label: 'Tipo',
    field: 'transaction_type',
    align: 'left',
    sortable: true,
  },
  {
    name: 'user',
    label: 'Usuario',
    field: (row: Transaction) => row.user?.name,
    align: 'left',
    sortable: true,
  },
  {
    name: 'account',
    label: 'Cuenta',
    field: (row: Transaction) => row.account?.name,
    align: 'left',
    sortable: true,
  },
  { name: 'actions', label: 'Acciones', field: () => undefined, align: 'center', sortable: false },
];

const allColumnOptions = columns
  .filter((c) => c.name !== 'actions')
  .map((c) => ({ label: c.label, value: c.name }));
// Column selection state for visibleColumns
const columnSelection = ref<string[]>(allColumnOptions.map((opt) => opt.value));
const visibleColumns = computed<QTableColumn<Transaction>[]>(() => {
  return columns.filter((c) => c.name === 'actions' || columnSelection.value.includes(c.name));
});

// Total amount and tax computed from transactions
const totalAmount = computed(() => transactions.value.reduce((sum, t) => sum + (t.amount || 0), 0));
const totalTax = computed(() =>
  transactions.value.reduce((sum, t) => sum + (t.amount_tax || 0), 0)
);
function customSort(
  rows: readonly Transaction[],
  sortBy: string,
  descending: boolean
): readonly Transaction[] {
  return [...rows].sort((a, b) => {
    const key = sortBy as keyof Transaction;
    let valA = a[key];
    let valB = b[key];
    // Si la columna es fecha, comparar como fecha
    if (sortBy === 'date') {
      const dateA = valA && typeof valA === 'string' ? new Date(valA) : new Date(0);
      const dateB = valB && typeof valB === 'string' ? new Date(valB) : new Date(0);
      // Si descending es true: más reciente a más antigua, si es false: más antigua a más reciente
      return descending ? dateB.getTime() - dateA.getTime() : dateA.getTime() - dateB.getTime();
    }
    // Determine comparable strings: primitives or related names
    const textA =
      typeof valA === 'string'
        ? valA
        : valA != null && typeof valA === 'object' && 'name' in valA
        ? (valA as { name: string }).name
        : '';
    const textB =
      typeof valB === 'string'
        ? valB
        : valB != null && typeof valB === 'object' && 'name' in valB
        ? (valB as { name: string }).name
        : '';
    const cmp = textA.localeCompare(textB, undefined, { numeric: true });
    return descending ? -cmp : cmp;
  });
}

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
function onRequest(props: QTableRequestProps) {
  if (props.pagination) {
    pagination.value = {
      ...pagination.value,
      page: props.pagination.page,
      rowsPerPage: props.pagination.rowsPerPage,
      sortBy: props.pagination.sortBy,
      descending: props.pagination.descending,
    };
  }
  // fetch from server with params
  const params: Record<string, unknown> = {
    page: pagination.value.page,
    per_page: pagination.value.rowsPerPage,
    sort_by: pagination.value.sortBy,
    descending: pagination.value.descending,
  };
  if (filter.value) params['search'] = filter.value;
  if (providerFilter.value != null) params['provider_id'] = providerFilter.value;
  if (rateFilter.value != null) params['rate_id'] = rateFilter.value;
  if (userFilter.value != null) params['user_id'] = userFilter.value;
  if (accountFilter.value != null) params['account_id'] = accountFilter.value;
  if (transactionTypeFilter.value) params['transaction_type'] = transactionTypeFilter.value;
  void tsStore.fetchTransactions(params);
}

function refresh() {
  void tsStore.fetchTransactions();
}
// Clear all filters and reload data
// Clear all filters and reload data
const clearFilters = () => {
  filter.value = '';
  providerFilter.value = null;
  rateFilter.value = null;
  userFilter.value = null;
  accountFilter.value = null;
  transactionTypeFilter.value = null;
  // reset to first page
  pagination.value.page = 1;
  onRequest({ pagination: pagination.value });
};

function exportCSV() {
  const rows = transactions.value;
  const header = visibleColumns.value.filter((c) => c.name !== 'actions').map((c) => c.label);
  const fields = visibleColumns.value
    .filter((c) => c.name !== 'actions')
    .map((c) => c.name as keyof Transaction);
  const csv = [header.join(',')]
    .concat(rows.map((row) => fields.map((f) => JSON.stringify(row[f] ?? '')).join(',')))
    .join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'transacciones.csv';
  a.click();
  URL.revokeObjectURL(url);
}

function openDialog() {
  editing.value = false;
  form.value = initialForm();
  showDialog.value = true;
}

function edit(row: Transaction) {
  editing.value = true;
  const parts = row.date.split(' ');
  const datePart = parts[0] || '';
  const timePart = parts[1];
  let time = '';
  if (timePart) {
    const [h, m] = timePart.split(':');
    let hour = parseInt(h ?? '0', 10);
    const minute = m ?? '00';
    if (hour === 0) hour = 12;
    else if (hour > 12) hour -= 12;
    time = `${hour.toString().padStart(2, '0')}:${minute}`;
  }
  form.value = {
    id: row.id,
    name: row.name,
    amount: row.amount,
    amount_tax: row.amount_tax,
    description: row.description || '',
    date: datePart,
    time,
    active: row.active,
    user_id: row.user_id ?? row.user?.id ?? null,
    provider_id: row.provider_id ?? null,
    rate_id: row.rate_id ?? null,
    account_id: row.account_id ?? null,
    url_file: row.url_file || '',
  };
  showDialog.value = true;
}

async function remove(row: Transaction) {
  await tsStore.deleteTransaction(row.id);
  $q.notify({ type: 'negative', message: 'Transacción eliminada' });
}

async function save() {
  // Validaciones
  if (!form.value.name) {
    $q.notify({ type: 'warning', message: 'Nombre es requerido.' });
    return;
  }
  if (form.value.amount === undefined) {
    $q.notify({ type: 'warning', message: 'Cantidad es requerida.' });
    return;
  }
  if (!form.value.date) {
    $q.notify({ type: 'warning', message: 'Fecha es requerida.' });
    return;
  }
  if (!form.value.time) {
    $q.notify({ type: 'warning', message: 'Hora es requerida.' });
    return;
  }
  // Unir fecha y hora para el backend
  const dateTime = `${form.value.date} ${form.value.time}:00`;

  // Preparar payload sin tipar para evitar conflictos de TS
  const payload = {
    ...form.value,
    date: dateTime,
    time: form.value.time,
  };
  let response;
  try {
    if (editing.value && form.value.id) {
      response = await tsStore.updateTransaction(payload as any);
    } else {
      response = await tsStore.addTransaction(payload as any);
    }
    if (response.status >= 200 && response.status < 300) {
      $q.notify({ type: 'positive', message: 'Transacción guardada correctamente.' });
      showDialog.value = false;
      form.value = initialForm();
      onRequest({ pagination: pagination.value });
    } else {
      $q.notify({ type: 'negative', message: 'Error al guardar la transacción.' });
    }
  } catch (error: any) {
    // manejar errores de validación u otros
    const msg = error?.response?.data?.message || 'No se pudo guardar la transacción.';
    $q.notify({ type: 'negative', message: msg });
  }
}

// Simple filter function for provider QSelect
const filterProvider = (val: string, update: (callback: () => void) => void) => {
  if (val === '') {
    update(() => {
      filteredProviderOptions.value = providerOptions.value;
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    filteredProviderOptions.value = providerOptions.value.filter(
      (v) => v.name.toLowerCase().indexOf(needle) > -1
    );
  });
};

// Simple filter for user QSelect
const filterUser = (val: string, update: (callback: () => void) => void) => {
  if (val === '') {
    update(() => {
      filteredUserOptions.value = userOptions.value;
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    filteredUserOptions.value = userOptions.value.filter(
      (v) => v.name.toLowerCase().indexOf(needle) > -1
    );
  });
};

// Simple filter for account QSelect
const filterAccount = (val: string, update: (callback: () => void) => void) => {
  if (val === '') {
    update(() => {
      filteredAccountOptions.value = accountOptions.value;
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    filteredAccountOptions.value = accountOptions.value.filter(
      (v) => v.name.toLowerCase().indexOf(needle) > -1
    );
  });
};

// Simple filter for transaction type QSelect
const filterTransactionType = (val: string, update: (callback: () => void) => void) => {
  if (val === '') {
    update(() => {
      filteredTransactionTypeOptions.value = transactionTypeOptions.value;
    });
    return;
  }
  update(() => {
    const needle = val.toLowerCase();
    filteredTransactionTypeOptions.value = transactionTypeOptions.value.filter(
      (v) => v.name.toLowerCase().indexOf(needle) > -1
    );
  });
};

onMounted(async () => {
  onRequest({ pagination: pagination.value });
  try {
    const [pRes, uRes, aRes] = await Promise.all([
      api.get('/providers'),
      api.get('/users'),
      api.get('/accounts'),
    ]);
    const allProviders = pRes.data.data || pRes.data;
    providerOptions.value = allProviders;
    filteredProviderOptions.value = allProviders;
    userOptions.value = uRes.data.data || uRes.data;
    filteredUserOptions.value = userOptions.value;
    accountOptions.value = aRes.data.data || aRes.data;
    filteredAccountOptions.value = accountOptions.value;
    // Initialize transaction type options from fetched transactions
    transactionTypeOptions.value = Array.from(
      new Set(tsStore.transactions.map((t) => t.transaction_type).filter((v): v is string => !!v))
    ).map((type) => ({ id: type, name: type }));
    filteredTransactionTypeOptions.value = transactionTypeOptions.value;
  } catch (e) {
    console.error('Error fetching filter lists', e);
  }
});
watch(
  [filter, providerFilter, rateFilter, userFilter, accountFilter, transactionTypeFilter],
  () => {
    pagination.value.page = 1;
    onRequest({ pagination: pagination.value });
  }
);

// Watch search filter to update URL
watch(filter, (val) => {
  const query = { ...route.query };
  if (val) {
    query.search = val;
  } else {
    delete query.search;
  }
  // Update URL without adding to history
  void router.replace({ query });
});
</script>

