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

    <q-table
      :columns="visibleColumns"
      :rows="paginatedRows"
      :loading="loading"
      row-key="id"
      flat
      bordered
      title="Listado de Transacciones"
      class="shadow-1"
      v-model:pagination="pagination"
      :filter="filter"
      :rows-per-page-options="[5, 10, 20, 50, 0]"
      :sort-method="customSort"
      selection="multiple"
      v-model:selected="selected"
      @request="onRequest"
    >
      <template v-slot:top-right>
        <div class="row items-center q-gutter-sm">
          <q-input
            debounce="300"
            v-model="filter"
            placeholder="Buscar en todas las columnas..."
            dense
            filled
          >
            <template v-slot:append>
              <q-icon name="search" />
            </template>
          </q-input>
          <q-btn icon="refresh" flat round @click="refresh" :disable="loading" />
          <q-btn icon="download" flat round @click="exportCSV" />
          <q-select
            v-model="columnSelection"
            :options="allColumnOptions"
            multiple
            emit-value
            map-options
            label="Columnas"
            dense
            style="min-width: 120px"
          />
        </div>
      </template>
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
import { ref, computed, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useTransactionsStore } from 'stores/transactions';
import type { Transaction } from 'stores/transactions';
import type { QTableColumn } from 'quasar';

const $q = useQuasar();

const filter = ref('');
const showDialog = ref(false);
const editing = ref(false);
const form = ref<Partial<Transaction>>({});
const pagination = ref({
  page: 1,
  rowsPerPage: 10,
  sortBy: 'date',
  descending: true,
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

const providerOptions = ref<{ id: number; name: string }[]>([
  { id: 1, name: 'Proveedor A' },
  { id: 2, name: 'Proveedor B' },
]);
const rateOptions = ref<{ id: number; name: string }[]>([
  { id: 1, name: 'Tarifa A' },
  { id: 2, name: 'Tarifa B' },
]);

const columns: QTableColumn<Transaction>[] = [
  { name: 'name', label: 'Nombre', field: 'name', sortable: true },
  { name: 'amount', label: 'Cantidad', field: 'amount', align: 'right', sortable: true },
  { name: 'amount_tax', label: 'Impuesto', field: 'amount_tax', align: 'right', sortable: true },
  { name: 'date', label: 'Fecha', field: 'date', sortable: true },
  { name: 'active', label: 'Activo', field: 'active', align: 'center', sortable: true },
  { name: 'user', label: 'Usuario', field: (row: Transaction) => row.user?.name, sortable: true },
  {
    name: 'provider',
    label: 'Proveedor',
    field: (row: Transaction) => row.provider?.name,
    sortable: true,
  },
  { name: 'rate', label: 'Tarifa', field: (row: Transaction) => row.rate?.value, sortable: true },
  { name: 'transaction_type', label: 'Tipo', field: 'transaction_type', sortable: true },
  { name: 'user', label: 'Usuario', field: (row: Transaction) => row.user?.name, sortable: true },
  {
    name: 'account',
    label: 'Cuenta',
    field: (row: Transaction) => row.account?.name,
    sortable: true,
  },
  { name: 'actions', label: 'Acciones', field: () => undefined, align: 'center', sortable: false },
];

const allColumnOptions = columns
  .filter((c) => c.name !== 'actions')
  .map((c) => ({ label: c.label, value: c.name }));
const visibleColumns = computed(() => {
  return columns.filter((c) => c.name === 'actions' || columnSelection.value.includes(c.name));
});

// Filter by primitive fields and related user/account names
const filteredTransactions = computed(() => {
  if (!filter.value) return transactions.value;
  const f = filter.value.toLowerCase();
  return transactions.value.filter((t) => {
    const fieldsToSearch = [
      t.name,
      t.description,
      t.transaction_type,
      t.user?.name,
      t.account?.name,
    ];
    return fieldsToSearch
      .filter((v): v is string => typeof v === 'string')
      .some((v) => v.toLowerCase().includes(f));
  });
});

const paginatedRows = computed(() => {
  const start = (pagination.value.page - 1) * pagination.value.rowsPerPage;
  const end = start + pagination.value.rowsPerPage;
  return pagination.value.rowsPerPage === 0
    ? filteredTransactions.value
    : filteredTransactions.value.slice(start, end);
});

const totalAmount = computed(() =>
  filteredTransactions.value.reduce((sum, t) => sum + (t.amount || 0), 0)
);
const totalTax = computed(() =>
  filteredTransactions.value.reduce((sum, t) => sum + (t.amount_tax || 0), 0)
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
    pagination.value = props.pagination;
  }
}

function refresh() {
  void tsStore.fetchTransactions();
}

function exportCSV() {
  const rows = filteredTransactions.value;
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
onMounted(() => {
  void tsStore.fetchTransactions();
});
</script>

