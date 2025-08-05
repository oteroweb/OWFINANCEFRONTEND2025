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
            :options="providerOptions"
            option-value="id"
            option-label="name"
            dense
            filled
          />
        </div>
        <div class="col-4">
          <div class="text-caption q-mb-xs">Usuario</div>
          <q-select
            class="full-width"
            v-model="userFilter"
            :options="userOptions"
            option-value="id"
            option-label="name"
            dense
            filled
          />
        </div>
      </div>
      <div class="row q-col-gutter-md q-mt-sm items-start">
        <div class="col-4">
          <div class="text-caption q-mb-xs">Cuenta</div>
          <q-select
            class="full-width"
            v-model="accountFilter"
            :options="accountOptions"
            option-value="id"
            option-label="name"
            dense
            filled
          />
        </div>
        <div class="col-8 row items-center q-gutter-sm justify-end">
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
      :sort-method="customSort"
      selection="multiple"
      v-model:selected="selected"
      @request="onRequest"
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

    <q-dialog v-model="showDialog" persistent>
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
            <q-date v-model="form.date" label="Fecha" filled dense class="q-mt-sm" />
            <q-checkbox v-model="form.active" label="Activo" class="q-mt-sm" />
            <q-select
              v-model="form.provider_id"
              :options="providerOptions"
              option-value="id"
              option-label="name"
              label="Proveedor"
              use-input
              fill-input
              new-value-mode="add"
              @new-value="addProvider"
              class="q-mt-sm"
              dense
            />
            <q-select
              v-model="form.rate_id"
              :options="rateOptions"
              option-value="id"
              option-label="name"
              label="Tarifa"
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
import type { Transaction } from 'stores/transactions';
import type { QTableColumn } from 'quasar';
import { useRouter, useRoute } from 'vue-router';

// Filter values
const providerFilter = ref<number | null>(null);
const userFilter = ref<number | null>(null);
const accountFilter = ref<number | null>(null);
const rateFilter = ref<number | null>(null);

// Router for syncing search query
const router = useRouter();
const route = useRoute();

const $q = useQuasar();

const filter = ref(''); // search term

// Initialize filter from URL query
filter.value = (route.query.search as string) || '';

const showDialog = ref(false);
const editing = ref(false);
const form = ref<Partial<Transaction>>({});
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  sortBy: 'date',
  descending: true,
  rowsNumber: 0, // total records from server
});
const selected = ref([]);
const columnSelection = ref([
  'name',
  'provider',
  'rate',
  'transaction_type',
  'amount',
  'amount_tax',
  'date',
  'active',
  'user',
  'account',
]);

// Transactions store
const tsStore = useTransactionsStore();
const transactions = computed(() => tsStore.transactions);
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
const userOptions = ref<{ id: number; name: string }[]>([]);
const accountOptions = ref<{ id: number; name: string }[]>([]);
const rateOptions = ref<{ id: number; name: string }[]>([
  { id: 1, name: 'Tarifa A' },
  { id: 2, name: 'Tarifa B' },
]);

const columns: QTableColumn<Transaction>[] = [
  { name: 'name', label: 'Nombre', field: 'name', align: 'left', sortable: true },
  { name: 'amount', label: 'Cantidad', field: 'amount', align: 'right', sortable: true },
  { name: 'amount_tax', label: 'Impuesto', field: 'amount_tax', align: 'right', sortable: true },
  { name: 'date', label: 'Fecha', field: 'date', align: 'left', sortable: true },
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
    const valA = a[key];
    const valB = b[key];
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
      // rowsNumber remains set by watch
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
  form.value = {};
  showDialog.value = true;
}

function edit(row: Transaction) {
  editing.value = true;
  form.value = { ...row };
  showDialog.value = true;
}

async function remove(row: Transaction) {
  await tsStore.deleteTransaction(row.id);
  $q.notify({ type: 'negative', message: 'Transacción eliminada' });
}

async function save() {
  const data = { ...form.value } as Transaction;
  if (editing.value && data.id) {
    await tsStore.updateTransaction(data);
    $q.notify({ type: 'positive', message: 'Transacción actualizada' });
  } else {
    await tsStore.addTransaction(data);
    $q.notify({ type: 'positive', message: 'Transacción creada' });
  }
  showDialog.value = false;
}

function addProvider(val: string) {
  const newId = providerOptions.value.length + 1;
  const newProv = { id: newId, name: val };
  providerOptions.value.push(newProv);
  form.value.provider_id = newId;
}
// Fetch on mount
onMounted(async () => {
  // fetch transactions and filter lists
  await tsStore.fetchTransactions();
  try {
    const [pRes, uRes, aRes] = await Promise.all([
      api.get('/providers'),
      api.get('/users'),
      api.get('/accounts'),
    ]);
    providerOptions.value = pRes.data.data || pRes.data;
    userOptions.value = uRes.data.data || uRes.data;
    accountOptions.value = aRes.data.data || aRes.data;
  } catch (e) {
    console.error('Error fetching filter lists', e);
  }
});
// Watch filters and trigger server request on change
// Watch filters including rateFilter and trigger server request on change
watch([filter, providerFilter, rateFilter, userFilter, accountFilter], () => {
  pagination.value.page = 1;
  onRequest({ pagination: pagination.value });
});

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

