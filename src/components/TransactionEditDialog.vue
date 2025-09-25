<template>
  <q-dialog v-model="ui.showDialogEditTransaction" @hide="resetForm">
    <q-card class="q-pa-sm" style="min-width: 680px; max-width: 980px; width: 100%">
      <q-card-section class="q-pb-none">
        <div class="row items-center">
          <div class="col">
            <div class="text-h6">Editar Transacción</div>
            <div class="text-caption text-grey-7">Modifica la información existente</div>
          </div>
          <div class="col-auto">
            <q-btn dense round flat icon="close" v-close-popup />
          </div>
        </div>
      </q-card-section>
      <q-separator class="q-my-sm" />
      <q-card-section class="q-pt-none">
        <q-form @submit.prevent="onSubmit" class="q-gutter-sm">
          <!-- Tipo -->
          <q-option-group
            v-if="ttOptions.length"
            v-model="form.transaction_type_id"
            :options="ttOptions"
            type="radio"
            inline
          />

          <div class="row q-col-gutter-sm">
            <!-- Proveedor -->
            <div class="col-12 col-sm-6">
              <q-select
                v-model="form.provider_id"
                :options="providerOptions"
                :onFilter="onProviderFilter"
                option-value="id"
                :option-label="providerLabel"
                emit-value
                map-options
                use-input
                filled
                dense
                clearable
                input-debounce="300"
                label="Proveedor"
                @focus="ensureProvidersLoaded"
              >
                <template #append>
                  <q-btn flat dense icon="refresh" @click.stop="reloadProviders" />
                </template>
              </q-select>
            </div>
            <!-- Cuenta simple -->
            <div class="col-12 col-sm-6" v-if="!isTransfer">
              <q-select
                v-model="form.account_id"
                :options="accountOptions"
                :onFilter="onAccountFilter"
                option-value="id"
                :option-label="accountLabel"
                emit-value
                map-options
                use-input
                filled
                dense
                clearable
                input-debounce="300"
                label="Cuenta"
                @focus="ensureAccountsLoaded"
              >
                <template #append>
                  <q-btn flat dense icon="refresh" @click.stop="reloadAccounts" />
                </template>
              </q-select>
            </div>
          </div>

          <!-- Transferencia -->
          <div v-if="isTransfer" class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <q-select
                v-model="form.account_from_id"
                :options="accountOptions"
                :onFilter="onAccountFilter"
                option-value="id"
                :option-label="accountLabel"
                emit-value
                map-options
                use-input
                filled
                dense
                clearable
                input-debounce="300"
                label="Cuenta origen"
                @focus="ensureAccountsLoaded"
              />
            </div>
            <div class="col-12 col-sm-6">
              <q-select
                v-model="form.account_to_id"
                :options="accountOptions"
                :onFilter="onAccountFilter"
                option-value="id"
                :option-label="accountLabel"
                emit-value
                map-options
                use-input
                filled
                dense
                clearable
                input-debounce="300"
                label="Cuenta destino"
                @focus="ensureAccountsLoaded"
              />
            </div>
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-6">
              <q-input v-model="form.name" label="Concepto" filled dense />
            </div>
            <div class="col-12 col-sm-6">
              <q-input
                v-model="form.datetime"
                label="Fecha y hora"
                type="datetime-local"
                filled
                dense
              />
            </div>
          </div>

          <div class="row q-col-gutter-sm">
            <div class="col-12 col-sm-4">
              <q-input
                v-model.number="form.amount"
                label="Monto"
                type="number"
                step="0.01"
                filled
                dense
              />
            </div>
            <div class="col-12 col-sm-4" v-if="showRateInput">
              <q-input
                v-model.number="form.rate"
                :label="rateLabel"
                type="number"
                step="0.0001"
                filled
                dense
              />
            </div>
            <div class="col-12 col-sm-4 flex items-center">
              <div class="text-caption">
                <div><strong>Actual:</strong> {{ previewBalance.currentDisplay }}</div>
                <div><strong>Luego:</strong> {{ previewBalance.afterDisplay }}</div>
              </div>
            </div>
          </div>

          <div class="row items-center q-mt-sm">
            <div class="col-auto">
              <q-btn
                type="submit"
                color="primary"
                :label="'Guardar cambios'"
                :disable="disableSave"
                :loading="saving"
              />
            </div>
            <div class="col-auto">
              <q-btn flat color="secondary" label="Cancelar" @click="onCancel" />
            </div>
            <div class="col text-right text-negative text-caption" v-if="errorMsg">
              {{ errorMsg }}
            </div>
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed, onMounted } from 'vue';
import { useUiStore } from 'stores/ui';
import { useTransactionsStore } from 'stores/transactions';
import { useTransactionTypesStore, type TransactionType } from 'stores/transactionTypes';
import { api } from 'boot/axios';
import type { Transaction } from 'stores/transactions';

const ui = useUiStore();
const tsStore = useTransactionsStore();
const ttypes = useTransactionTypesStore();
// Tipar el formulario para evitar 'any'
interface TransactionFormType {
  id?: number;
  name: string;
  amount: number | null;
  datetime: string;
  provider_id: number | null;
  account_id: number | null;
  rate?: number | null;
  transaction_type_id?: string | null;
  account_from_id?: number | null;
  account_to_id?: number | null;
  url_file: string;
}
const form = ref<Partial<TransactionFormType>>({});

// ========== Data sources ==========
const ttOptions = ref<{ label: string; value: string }[]>([]);
async function loadTransactionTypes() {
  try {
    await ttypes.fetchTransactionTypes();
    const bySlug = (s: string) =>
      ttypes.types.find((t: TransactionType) => (t.slug || '').toLowerCase() === s);
    const byName = (n: string) =>
      ttypes.types.find((t: TransactionType) => t.name.toLowerCase().includes(n));
    const income = bySlug('income') || byName('ingreso');
    const expense = bySlug('expense') || byName('egreso');
    const transfer = bySlug('transfer') || byName('transfer') || byName('transferencia');
    const opts: { label: string; value: string }[] = [];
    if (income) opts.push({ label: income.name, value: income.id });
    if (expense) opts.push({ label: expense.name, value: expense.id });
    if (transfer) opts.push({ label: transfer.name, value: transfer.id });
    ttOptions.value = opts;
    if (!form.value.transaction_type_id && income) form.value.transaction_type_id = income.id;
  } catch (e) {
    console.warn('Error cargando tipos de transacción', e);
  }
}

interface ProviderOption {
  id: number;
  name: string;
  address?: string;
}
const providerOptions = ref<ProviderOption[]>([]);
let allProviders: ProviderOption[] = [];
let providersLoaded = false;
function providerLabel(p: { name?: string; address?: string }) {
  if (!p) return '';
  return p.address ? `${p.name} (${p.address})` : p.name || '';
}
function onProviderFilter(val: string, done: (cb: () => void) => void) {
  const needle = (val || '').toLowerCase();
  done(() => {
    providerOptions.value = !needle
      ? allProviders.slice()
      : allProviders.filter((p) => (p.name || '').toLowerCase().includes(needle));
  });
}
async function ensureProvidersLoaded() {
  if (providersLoaded) return;
  try {
    const r = await api.get('/providers');
    const list = (r.data?.data || r.data) as ProviderOption[];
    allProviders = Array.isArray(list) ? list : [];
    providerOptions.value = allProviders.slice();
    providersLoaded = true;
  } catch (e) {
    console.warn('Error cargando proveedores', e);
  }
}
function reloadProviders() {
  providersLoaded = false;
  void ensureProvidersLoaded();
}

interface AccountOption {
  id: number;
  name: string;
  balance?: number;
  currencySymbol?: string;
  currencyCode?: string;
  currencyId?: number | null;
}
const accountOptions = ref<AccountOption[]>([]);
let allAccounts: AccountOption[] = [];
let accountsLoaded = false;
function accountLabel(a: AccountOption) {
  if (!a) return '';
  const bal = a.balance ?? 0;
  const code = a.currencyCode ? ` ${a.currencyCode}` : '';
  return `${a.name} (${bal}${code})`;
}
function onAccountFilter(val: string, done: (cb: () => void) => void) {
  const needle = (val || '').toLowerCase();
  done(() => {
    accountOptions.value = !needle
      ? allAccounts.slice()
      : allAccounts.filter((a) => (a.name || '').toLowerCase().includes(needle));
  });
}
async function ensureAccountsLoaded() {
  if (accountsLoaded) return;
  try {
    const r = await api.get('/accounts');
    // Tipar respuesta mínima para evitar any
    interface RawAccount {
      id: number;
      name: string;
      balance?: number;
      balance_cached?: number;
      currency?: { id?: number; code?: string; symbol?: string };
      currency_symbol?: string;
      currency_code?: string;
      currency_id?: number;
    }
    const list = (r.data?.data || r.data) as RawAccount[];
    allAccounts = (Array.isArray(list) ? list : []).map((a: RawAccount) => ({
      id: a.id,
      name: a.name,
      balance: Number(a.balance ?? a.balance_cached ?? 0),
      currencySymbol: a.currency?.symbol || a.currency_symbol || '',
      currencyCode: a.currency?.code || a.currency_code || '',
      currencyId: a.currency?.id ?? a.currency_id ?? null,
    }));
    accountOptions.value = allAccounts.slice();
    accountsLoaded = true;
  } catch (e) {
    console.warn('Error cargando cuentas', e);
  }
}
function reloadAccounts() {
  accountsLoaded = false;
  void ensureAccountsLoaded();
}

// ===== Transfer detection =====
const isTransfer = computed(() => {
  const id = form.value.transaction_type_id;
  if (!id) return false;
  const ty = ttypes.types.find((t: TransactionType) => t.id === id);
  const slug = (ty?.slug || '').toLowerCase();
  const name = (ty?.name || '').toLowerCase();
  return slug === 'transfer' || name.includes('transfer');
});
function findAccount(id?: number | null) {
  return accountOptions.value.find((a) => a.id === id);
}
const showRateInput = computed(() => {
  if (!isTransfer.value) return false; // sólo transfer por ahora
  const from = findAccount(form.value.account_from_id);
  const to = findAccount(form.value.account_to_id);
  if (!from || !to) return false;
  return (from.currencyId || from.currencyCode) !== (to.currencyId || to.currencyCode);
});
const rateLabel = computed(() => 'Tasa (Origen→Destino)');

// ===== Balance preview =====
const previewBalance = computed(() => {
  const amt = Number(form.value.amount || 0);
  if (isTransfer.value) {
    const from = findAccount(form.value.account_from_id);
    const to = findAccount(form.value.account_to_id);
    const fromBal = Number(from?.balance || 0);
    const toBal = Number(to?.balance || 0);
    return {
      currentDisplay: `${from?.currencySymbol || ''}${fromBal.toFixed(2)} / ${
        to?.currencySymbol || ''
      }${toBal.toFixed(2)}`,
      afterDisplay: `${from?.currencySymbol || ''}${(fromBal - Math.abs(amt)).toFixed(2)} / ${
        to?.currencySymbol || ''
      }${(toBal + Math.abs(amt)).toFixed(2)}`,
    };
  }
  const acc = findAccount(form.value.account_id);
  const bal = Number(acc?.balance || 0);
  const after = bal + amt;
  return {
    currentDisplay: `${acc?.currencySymbol || ''}${bal.toFixed(2)}`,
    afterDisplay: `${acc?.currencySymbol || ''}${after.toFixed(2)}`,
  };
});

const disableSave = computed(() => !form.value.name || !form.value.amount || !form.value.datetime);
const saving = ref(false);
const errorMsg = ref<string | null>(null);

function mapTransactionToForm(tx: Transaction): Partial<TransactionFormType> {
  // Si la transacción es una transferencia, intentamos inferir cuentas desde relaciones si existieran (pending backend design)
  return {
    id: tx.id,
    name: tx.name,
    amount: tx.amount ?? null,
    datetime: (tx.date || '').replace(' ', 'T'),
    provider_id: tx.provider_id ?? null,
    account_id: tx.account_id ?? null,
    rate: tx.rate ? Number(tx.rate.value) : null,
    transaction_type_id: tx.transaction_type_id ?? null,
    account_from_id: null,
    account_to_id: null,
    url_file: tx.url_file || '',
  };
}

function loadTransaction(id: number) {
  const txn = tsStore.transactions.find((t) => t.id === id);
  if (txn) {
    const mapped = mapTransactionToForm(txn);
    form.value = mapped;
  }
}

// Ajustar tipo según signo (similar al create) una vez que tipos están cargados
watch(
  () => form.value.amount,
  (val) => {
    if (!ttOptions.value.length) return;
    const amt = Number(val);
    if (!Number.isFinite(amt) || amt === 0) return;
    const findByLabel = (frag: string) =>
      ttOptions.value.find((o) => o.label.toLowerCase().includes(frag));
    const income = findByLabel('ingreso') || findByLabel('income');
    const expense = findByLabel('egreso') || findByLabel('expense');
    if (amt > 0 && income && form.value.transaction_type_id !== income.value)
      form.value.transaction_type_id = income.value;
    else if (amt < 0 && expense && form.value.transaction_type_id !== expense.value)
      form.value.transaction_type_id = expense.value;
  }
);

function persist(updatedForm: Partial<TransactionFormType>) {
  if (!updatedForm.id) return;
  const existing = tsStore.transactions.find((t) => t.id === updatedForm.id);
  if (!existing) return;
  const payload: Transaction = { ...existing };
  if (updatedForm.name !== undefined) payload.name = updatedForm.name || '';
  if (updatedForm.amount !== undefined && updatedForm.amount !== null)
    payload.amount = Number(updatedForm.amount);
  if (updatedForm.datetime !== undefined) payload.date = updatedForm.datetime.replace('T', ' ');
  if (updatedForm.provider_id !== undefined) payload.provider_id = updatedForm.provider_id ?? 0;
  if (updatedForm.account_id !== undefined) payload.account_id = updatedForm.account_id ?? null;
  if (updatedForm.transaction_type_id !== undefined)
    payload.transaction_type_id = updatedForm.transaction_type_id ?? null;
  if (updatedForm.rate !== undefined && updatedForm.rate != null) {
    // Mapear a rate_id si se define posteriormente
  }
  if (updatedForm.url_file !== undefined) payload.url_file = updatedForm.url_file || null;
  void tsStore.updateTransaction(payload);
  ui.closeEditTransactionDialog();
}

function onSubmit() {
  errorMsg.value = null;
  if (!form.value.id) {
    errorMsg.value = 'Falta ID';
    return;
  }
  try {
    persist(form.value);
  } catch (e) {
    errorMsg.value = 'Error guardando';
  }
}
function onCancel() {
  ui.closeEditTransactionDialog();
}

function resetForm() {
  form.value = {};
  errorMsg.value = null;
}

// Observa el id de la transacción a editar
watch(
  () => ui.editTransactionId,
  async (id) => {
    if (id) {
      await Promise.all([loadTransactionTypes(), ensureProvidersLoaded(), ensureAccountsLoaded()]);
      loadTransaction(id);
    }
  },
  { immediate: true }
);
onMounted(() => {
  void loadTransactionTypes();
});
</script>

<script lang="ts">
import { defineComponent } from 'vue';
export default defineComponent({ name: 'TransactionEditDialog' });
</script>

<style scoped>
.text-caption strong {
  font-weight: 600;
}
</style>
