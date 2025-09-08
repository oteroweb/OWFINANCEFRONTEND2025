<template>
  <q-dialog v-model="ui.showDialogNewTransaction" @hide="resetForm">
    <q-card style="min-width: 430px; max-width: 860px" class="q-pa-sm">
      <q-card-section class="q-pt-none">
        <div class="row items-center">
          <div class="col">
            <div class="text-h6">Nueva Transacción</div>
            <div class="text-caption text-grey-7">Registra ingresos, egresos o transferencias</div>
          </div>
          <div class="col-auto">
            <q-btn dense round flat icon="close" v-close-popup />
          </div>
        </div>
      </q-card-section>
      <q-separator class="q-my-xs" />
      <q-card-section class="q-pt-none">
        <q-form @submit.prevent="saveTransaction">
          <!-- Tipo -->
          <q-option-group
            v-model="form.transaction_type_id"
            :options="ttOptions"
            type="radio"
            inline
          />

          <!-- Proveedor -->
          <q-select
            v-model="form.provider_id"
            :options="providerOptions"
            :onFilter="onProviderFilter"
            option-value="id"
            :option-label="providerLabel"
            emit-value
            map-options
            label="Proveedor"
            filled
            dense
            use-input
            clearable
            input-debounce="300"
            class="q-mt-sm"
            @focus="ensureProvidersLoaded"
          >
            <template #append>
              <q-btn flat dense icon="add" @click.stop="showAddProviderDialog = true" />
            </template>
            <template #no-option="scope">
              <q-item clickable @click="triggerAddProviderDialog(scope.inputValue)">
                <q-item-section>Crear nuevo "{{ scope.inputValue }}"</q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Concepto y fecha -->
          <div class="row q-col-gutter-sm q-mt-sm">
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

          <!-- Cuentas (no transfer) -->
          <div v-if="!isTransfer" class="q-mt-sm">
            <q-select
              v-model="form.account_id"
              :options="accountOptions"
              :onFilter="onAccountFilter"
              option-value="id"
              :option-label="accountLabel"
              emit-value
              map-options
              filled
              dense
              use-input
              clearable
              input-debounce="300"
              label="Cuenta"
              @focus="ensureAccountsLoaded"
            >
              <template #append>
                <q-btn flat dense icon="add" @click.stop="showAddAccountDialog = true" />
              </template>
              <template #no-option="scope">
                <q-item clickable @click="triggerAddAccountDialog(scope.inputValue)">
                  <q-item-section>Crear nueva "{{ scope.inputValue }}"</q-item-section>
                </q-item>
              </template>
            </q-select>
            <div
              v-if="form.account_id"
              class="row items-center q-pt-xs q-pl-xs q-pr-xs text-caption"
            >
              <div class="col">
                Saldo actual: {{ currencySymbol }}{{ Number(currentBalance).toFixed(2) }}
              </div>
              <div class="col text-right">
                <template v-if="needsRateForAccountBalance">Saldo después: requiere tasa</template>
                <template v-else
                  >Saldo después: {{ currencySymbol }}{{ Number(newBalance).toFixed(2) }}</template
                >
              </div>
            </div>
          </div>

          <!-- Cuentas (transfer) -->
          <div v-else class="q-mt-sm">
            <div class="row q-col-gutter-sm">
              <div class="col-12 col-sm-6">
                <q-select
                  v-model="form.account_from_id"
                  :options="accountOptions"
                  :onFilter="onAccountFilter"
                  option-value="id"
                  :option-label="accountLabel"
                  emit-value
                  map-options
                  filled
                  dense
                  use-input
                  clearable
                  input-debounce="300"
                  label="Cuenta Origen"
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
                  filled
                  dense
                  use-input
                  clearable
                  input-debounce="300"
                  label="Cuenta Destino"
                  @focus="ensureAccountsLoaded"
                />
              </div>
            </div>
            <div
              v-if="form.account_from_id"
              class="row items-center q-pt-xs q-pl-xs q-pr-xs text-caption"
            >
              <div class="col">
                Origen — Saldo actual: {{ originCurrencySymbol
                }}{{ Number(currentBalance).toFixed(2) }}
              </div>
              <div class="col text-right">
                <template v-if="needsRateForAccountBalance"
                  >Origen — después: requiere tasa</template
                >
                <template v-else
                  >Origen — después: {{ originCurrencySymbol
                  }}{{ Number(newBalance).toFixed(2) }}</template
                >
              </div>
            </div>
            <div
              v-if="form.account_to_id"
              class="row items-center q-pt-xs q-pl-xs q-pr-xs text-caption"
            >
              <div class="col">
                Destino — Saldo actual: {{ destCurrencySymbol
                }}{{ Number(destCurrentBalance).toFixed(2) }}
              </div>
              <div class="col text-right">
                <template v-if="needsRateForDestBalance">Destino — después: requiere tasa</template>
                <template v-else
                  >Destino — después: {{ destCurrencySymbol
                  }}{{ Number(destNewBalance).toFixed(2) }}</template
                >
              </div>
            </div>
            <div
              v-if="form.account_from_id && form.account_to_id && form.amount != null"
              class="q-mt-xs q-pr-xs text-right text-caption text-grey-7"
            >
              <div>
                Importe: {{ originCurrencySymbol }}{{ Number(form.amount).toFixed(2) }}
              </div>
              <div>
                De: {{ originAccount?.name || '—' }} ({{ originAccount?.currencyCode || '—' }}) →
                A: {{ destAccount?.name || '—' }} ({{ destAccount?.currencyCode || '—' }})
              </div>
              <div>
                <span v-if="!isCrossCurrency">Destino = actual + importe</span>
                <span v-else>
                  <span v-if="form.rate && Number(form.rate) > 0"
                    >Destino = actual + (importe × tasa)</span
                  >
                  <span v-else>(falta tasa para calcular)</span>
                </span>
              </div>
            </div>
          </div>

          <!-- Monto / Tasa -->
          <div class="row q-col-gutter-sm q-mt-sm">
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
            <div v-if="showRateInput" class="col-12 col-sm-4">
              <q-input
                v-model.number="form.rate"
                :label="rateLabel"
                type="number"
                step="0.0001"
                filled
                dense
              />
            </div>
            <div class="col-12 col-sm-4 flex items-center text-caption">
              <div>
                <div class="text-bold">Resultado</div>
                <div>{{ resultCurrencySymbol }}{{ Number(resultTotal).toFixed(2) }}</div>
              </div>
            </div>
          </div>

          <!-- Impuesto y archivo URL -->
          <div class="row q-col-gutter-sm q-mt-sm">
            <div class="col-12 col-sm-4">
              <q-checkbox v-model="form.amount_tax" label="Incluir Impuesto" dense />
            </div>
            <div class="col-12 col-sm-8">
              <q-input v-model="form.url_file" label="Archivo (URL)" dense filled />
            </div>
          </div>

          <!-- Avanzado (detalle factura) -->
          <div class="row items-center q-mt-sm">
            <div class="col-auto">
              <q-toggle v-model="isAdvancedAmount" label="Detalle (factura)" dense />
            </div>
            <div class="col text-caption text-grey-7" v-if="isAdvancedAmount">
              El monto se calcula desde las líneas
            </div>
          </div>
          <div v-if="isAdvancedAmount" class="q-mt-xs">
            <q-markup-table dense flat bordered class="invoice-table">
              <thead>
                <tr class="text-caption">
                  <th style="width: 45%">Item</th>
                  <th style="width: 15%">Cant</th>
                  <th style="width: 20%">Precio</th>
                  <th style="width: 15%">Total</th>
                  <th style="width: 5%"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in invoiceItems" :key="i" class="text-caption">
                  <td><q-input v-model="row.item" dense filled /></td>
                  <td><q-input v-model.number="row.quantity" type="number" dense filled /></td>
                  <td>
                    <q-input
                      v-model.number="row.unitPrice"
                      type="number"
                      step="0.01"
                      dense
                      filled
                    />
                  </td>
                  <td class="text-right">{{ lineTotal(row).toFixed(2) }}</td>
                  <td>
                    <q-btn
                      flat
                      dense
                      round
                      icon="close"
                      color="negative"
                      @click="removeInvoiceRow(i)"
                    />
                  </td>
                </tr>
              </tbody>
            </q-markup-table>
            <div class="row items-center q-mt-xs">
              <div class="col-auto">
                <q-btn dense flat icon="add" label="Agregar línea" @click="addInvoiceRow" />
              </div>
              <div class="col text-right text-caption">
                Subtotal: {{ Number(invoiceSubtotal).toFixed(2) }}
              </div>
            </div>
            <div class="row items-center q-mt-xs text-caption">
              <div class="col text-right">
                Resultado total
                <span v-if="applyRateToTotal" class="text-grey-7">(aplicando tasa)</span>:
                {{ resultCurrencySymbol }}{{ Number(resultTotal).toFixed(2) }}
              </div>
            </div>
          </div>

          <!-- Acciones -->
          <div class="row justify-end q-gutter-sm q-mt-md">
            <q-btn flat label="Cancelar" v-close-popup />
            <q-btn color="primary" label="Guardar" type="submit" />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>

  <!-- Dialog nuevo proveedor -->
  <q-dialog v-model="showAddProviderDialog">
    <q-card style="min-width: 320px">
      <q-card-section class="text-h6">Nuevo Proveedor</q-card-section>
      <q-card-section class="q-pt-none">
        <q-input v-model="newProviderName" label="Nombre" dense filled class="q-mb-sm" />
        <q-input v-model="newProviderAddress" label="Dirección" dense filled />
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn color="primary" label="Guardar" @click="addProvider" />
      </q-card-actions>
    </q-card>
  </q-dialog>

  <!-- Dialog nueva cuenta -->
  <q-dialog v-model="showAddAccountDialog">
    <q-card style="min-width: 340px">
      <q-card-section class="text-h6">Nueva Cuenta</q-card-section>
      <q-card-section class="q-pt-none">
        <q-input v-model="newAccountName" label="Nombre" dense filled class="q-mb-sm" />
        <q-input
          v-model.number="newAccountInitial"
          label="Saldo inicial"
          type="number"
          dense
          filled
          class="q-mb-sm"
        />
        <q-select
          v-model="newAccountCurrency"
          :options="currencyOptions"
          :onFilter="onCurrencyFilter"
          option-value="id"
          option-label="nameLabel"
          emit-value
          map-options
          filled
          dense
          use-input
          clearable
          input-debounce="300"
          label="Moneda"
          class="q-mb-sm"
          @focus="ensureCurrenciesLoaded"
        />
        <q-select
          v-model="newAccountType"
          :options="accountTypeOptions"
          :onFilter="onAccountTypeFilter"
          option-value="id"
          option-label="name"
          emit-value
          map-options
          filled
          dense
          use-input
          clearable
          input-debounce="300"
          label="Tipo de Cuenta"
          @focus="ensureAccountTypesLoaded"
        />
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn flat label="Cancelar" v-close-popup />
        <q-btn color="primary" label="Crear" @click="addAccountInline" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter, type LocationQuery } from 'vue-router';
import { useUiStore } from 'stores/ui';
import { useAuthStore } from 'stores/auth';
import { useTransactionsStore } from 'stores/transactions';
import { useTransactionTypesStore, type TransactionType } from 'stores/transactionTypes';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
defineOptions({ name: 'TransactionCreateDialog' });

const ui = useUiStore();
const auth = useAuthStore();
const tsStore = useTransactionsStore();
const ttypes = useTransactionTypesStore();
const $q = useQuasar();
const route = useRoute();
const router = useRouter();

// ----- Form -----
interface TransactionForm {
  id?: number;
  name: string;
  amount: number | null;
  amount_tax: boolean;
  datetime: string;
  provider_id: number | null;
  account_id: number | null;
  rate?: number | null;
  transaction_type_id?: string | null;
  account_from_id?: number | null;
  account_to_id?: number | null;
  url_file: string;
}
const initialForm = (): TransactionForm => ({
  name: '',
  amount: null,
  amount_tax: false,
  datetime: new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16),
  provider_id: null,
  account_id: null,
  rate: null,
  transaction_type_id: null,
  account_from_id: null,
  account_to_id: null,
  url_file: '',
});
const form = ref<TransactionForm>(initialForm());

// ----- Transaction Types -----
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
    console.error(e);
  }
}
void loadTransactionTypes();

// ----- Providers -----
interface ProviderOption {
  id: number;
  name: string;
  address?: string;
}
const providerOptions = ref<ProviderOption[]>([]);
const allProviders = ref<ProviderOption[]>([]);
const showAddProviderDialog = ref(false);
const newProviderName = ref('');
const newProviderAddress = ref('');
let providersLoaded = false;
function providerLabel(p: { name?: string; address?: string }) {
  if (!p) return '';
  return p.address ? `${p.name} (${p.address})` : p.name || '';
}
function onProviderFilter(val: string, done: (cb: () => void) => void) {
  const needle = (val || '').toLowerCase();
  done(() => {
    providerOptions.value = !needle
      ? allProviders.value
      : allProviders.value.filter((p) => (p.name || '').toLowerCase().includes(needle));
  });
}
async function ensureProvidersLoaded() {
  if (providersLoaded) return;
  try {
    const r = await api.get('/providers', { params: { user_id: auth.user?.id } });
    const list = (r.data.data || r.data) as ProviderOption[];
    allProviders.value = list || [];
    providerOptions.value = list || [];
    providersLoaded = true;
  } catch {
    $q.notify({ type: 'negative', message: 'Error cargando proveedores' });
    providersLoaded = false;
  }
}
function triggerAddProviderDialog(val: string) {
  newProviderName.value = val;
  newProviderAddress.value = '';
  showAddProviderDialog.value = true;
}
async function addProvider() {
  try {
    const resp = await api.post('/providers', {
      name: newProviderName.value,
      address: newProviderAddress.value,
      user_id: auth.user?.id,
    });
    const p = resp.data?.data || resp.data;
    form.value.provider_id = p.id;
    providersLoaded = false;
    await ensureProvidersLoaded();
  } catch {
    $q.notify({ type: 'negative', message: 'Error al crear proveedor' });
  } finally {
    showAddProviderDialog.value = false;
    newProviderName.value = '';
    newProviderAddress.value = '';
  }
}

// ----- Accounts / Types / Currencies -----
interface AccountOption {
  id: number;
  name: string;
  balance?: number;
  currencyId?: number | null;
  currencyCode?: string;
  currencySymbol?: string;
}
const allAccounts = ref<AccountOption[]>([]);
const accountOptions = ref<AccountOption[]>([]);
const showAddAccountDialog = ref(false);
const newAccountName = ref('');
const newAccountInitial = ref<number | null>(null);
const newAccountType = ref<number | null>(null);
const newAccountCurrency = ref<number | null>(null);
const lastAccountName = ref('');
let accountsLoaded = false;
let accountTypesLoaded = false;
let currenciesLoaded = false;
type BasicOption = { id: number; name: string };
// Allow symbol/code explicitly to be string | undefined to satisfy exactOptionalPropertyTypes
type CurrencyOption = {
  id: number;
  name: string;
  symbol?: string | undefined;
  code?: string | undefined;
  nameLabel: string;
};
const accountTypeOptions = ref<BasicOption[]>([]);
const allAccountTypes = ref<BasicOption[]>([]);
const currencyOptions = ref<CurrencyOption[]>([]);
const allCurrencies = ref<CurrencyOption[]>([]);

async function ensureAccountsLoaded() {
  if (accountsLoaded) return;
  try {
    const res = await api.get('/accounts', { params: { user_id: auth.user?.id } });
    interface ApiAccount {
      id: number;
      name: string;
      initial?: number;
      currency: { id?: number; code: string; symbol: string };
    }
    const fetched = (res.data.data || res.data) as ApiAccount[];
    const mapped = fetched.map((a) => ({
      id: a.id,
      name: a.name,
      balance: Number(a.initial || 0),
      currencyId: a.currency?.id || null,
      currencyCode: a.currency.code,
      currencySymbol: a.currency.symbol,
    }));
    allAccounts.value = mapped;
    accountOptions.value = mapped;
    accountsLoaded = true;
  } catch {
    $q.notify({ type: 'negative', message: 'Error cargando cuentas' });
    accountsLoaded = false;
    allAccounts.value = [];
    accountOptions.value = [];
  }
}
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
      ? allAccounts.value
      : allAccounts.value.filter((a) => (a.name || '').toLowerCase().includes(needle));
  });
}
async function addAccountInline() {
  try {
    if (!newAccountCurrency.value || !newAccountType.value) {
      $q.notify({ type: 'warning', message: 'Selecciona moneda y tipo' });
      return;
    }
    const resp = await api.post('/accounts', {
      name: newAccountName.value.trim() || lastAccountName.value || 'Cuenta',
      initial: newAccountInitial.value || 0,
      user_id: auth.user?.id,
      currency_id: newAccountCurrency.value,
      account_type_id: newAccountType.value,
    });
    const acc = resp.data?.data || resp.data;
    form.value.account_id = acc.id;
    accountsLoaded = false;
    await ensureAccountsLoaded();
    $q.notify({ type: 'positive', message: 'Cuenta creada' });
  } catch {
    $q.notify({ type: 'negative', message: 'Error al crear cuenta' });
  } finally {
    showAddAccountDialog.value = false;
    newAccountName.value = '';
    newAccountInitial.value = null;
    newAccountCurrency.value = null;
    newAccountType.value = null;
    lastAccountName.value = '';
  }
}
function triggerAddAccountDialog(val: string) {
  lastAccountName.value = val || '';
  newAccountName.value = val || '';
  showAddAccountDialog.value = true;
}
function onAccountTypeFilter(val: string, done: (cb: () => void) => void) {
  const needle = (val || '').toLowerCase();
  done(() => {
    accountTypeOptions.value = !needle
      ? allAccountTypes.value
      : allAccountTypes.value.filter((o) => (o.name || '').toLowerCase().includes(needle));
  });
}
function onCurrencyFilter(val: string, done: (cb: () => void) => void) {
  const needle = (val || '').toLowerCase();
  done(() => {
    currencyOptions.value = !needle
      ? allCurrencies.value
      : allCurrencies.value.filter((o) => {
          const name = (o.name || '').toLowerCase();
          const code = (o.code || '').toLowerCase();
          const sym = (o.symbol || '').toLowerCase();
          return name.includes(needle) || code.includes(needle) || sym.includes(needle);
        });
  });
}
async function ensureAccountTypesLoaded() {
  if (accountTypesLoaded) return;
  try {
    const res = await api.get('/account_types', { params: { order_by: 'name', order_dir: 'asc' } });
    const data = (res.data.data || res.data) as BasicOption[];
    allAccountTypes.value = data;
    accountTypeOptions.value = data;
    accountTypesLoaded = true;
  } catch {
    $q.notify({ type: 'negative', message: 'Error cargando tipos de cuenta' });
    accountTypesLoaded = false;
  }
}
async function ensureCurrenciesLoaded() {
  if (currenciesLoaded) return;
  try {
    const res = await api.get('/currencies', { params: { order_by: 'name', order_dir: 'asc' } });
    const raw = (res.data.data || res.data) as Array<{
      id: number;
      name: string;
      symbol?: string;
      code?: string;
    }>;
    const mapped: CurrencyOption[] = (raw || []).map((c) => ({
      id: c.id,
      name: c.name,
      symbol: c.symbol,
      code: c.code,
      nameLabel: c.symbol ? `${c.name} (${c.symbol})` : c.name,
    }));
    allCurrencies.value = mapped;
    currencyOptions.value = mapped;
    currenciesLoaded = true;
  } catch {
    $q.notify({ type: 'negative', message: 'Error cargando monedas' });
    currenciesLoaded = false;
  }
}
watch(
  () => showAddAccountDialog.value,
  async (open) => {
    if (open) {
      await Promise.allSettled([ensureCurrenciesLoaded(), ensureAccountTypesLoaded()]);
    }
  }
);

// ----- User currency for non-transfer conversion -----
function safeObj(v: unknown) {
  return v && typeof v === 'object' ? (v as Record<string, unknown>) : null;
}
function getStoredUser() {
  try {
    const raw = localStorage.getItem('user');
    return raw ? safeObj(JSON.parse(raw)) : null;
  } catch {
    return null;
  }
}
const userCurrencyId = computed<number | null>(() => {
  const u = safeObj(auth.user as unknown);
  const cur = safeObj(u?.currency);
  if (cur && typeof cur.id === 'number') return cur.id;
  const su = getStoredUser();
  const suCur = safeObj(su?.currency);
  if (suCur && typeof suCur.id === 'number') return suCur.id;
  return null;
});
const userCurrencyCode = computed<string | null>(() => {
  const u = safeObj(auth.user as unknown);
  const cur = safeObj(u?.currency);
  if (cur && typeof cur.code === 'string') return cur.code;
  const su = getStoredUser();
  const suCur = safeObj(su?.currency);
  if (suCur && typeof suCur.code === 'string') return suCur.code;
  return null;
});
const currencyAlertShown = ref(false);
watch(
  () => userCurrencyId.value,
  (v) => {
    if (!v && !currencyAlertShown.value) {
      $q.dialog({
        title: 'Moneda requerida',
        message: 'Configura una moneda predeterminada para conversiones correctas.',
      });
      currencyAlertShown.value = true;
    }
  },
  { immediate: true }
);

// ----- Invoice (advanced amount) -----
type InvoiceRow = { item: string; quantity: number; unitPrice: number; categoryId?: number | null };
const isAdvancedAmount = ref(false);
const invoiceItems = ref<InvoiceRow[]>([{ item: '', quantity: 1, unitPrice: 0 }]);
function addInvoiceRow() {
  invoiceItems.value.push({ item: '', quantity: 1, unitPrice: 0 });
}
function removeInvoiceRow(i: number) {
  invoiceItems.value.splice(i, 1);
  if (!invoiceItems.value.length) invoiceItems.value.push({ item: '', quantity: 1, unitPrice: 0 });
}
function lineTotal(r: InvoiceRow) {
  const q = Number(r.quantity || 0),
    u = Number(r.unitPrice || 0);
  return Number.isFinite(q) && Number.isFinite(u) ? q * u : 0;
}
const invoiceSubtotal = computed(() => invoiceItems.value.reduce((s, r) => s + lineTotal(r), 0));
watch(
  () => invoiceSubtotal.value,
  (sub) => {
    if (isAdvancedAmount.value) {
      syncAmountWithInvoice(sub);
    }
  }
);
watch(
  () => isAdvancedAmount.value,
  (on) => {
    if (on) syncAmountWithInvoice(invoiceSubtotal.value);
  }
);
function syncAmountWithInvoice(sub: number) {
  const ty = ttypes.types.find((t: TransactionType) => t.id === form.value.transaction_type_id);
  const slug = (ty?.slug || '').toLowerCase();
  if (slug === 'expense') form.value.amount = sub > 0 ? -Math.abs(sub) : 0;
  else form.value.amount = Math.abs(sub);
}

// ----- Transfer & currency logic -----
const originAccount = computed(() =>
  allAccounts.value.find((a: AccountOption) => a.id === form.value.account_from_id!)
);
const destAccount = computed(() =>
  allAccounts.value.find((a: AccountOption) => a.id === form.value.account_to_id!)
);
const selectedAccount = computed(() =>
  allAccounts.value.find((a: AccountOption) => a.id === form.value.account_id!)
);
const isTransfer = computed(() => {
  const id = form.value.transaction_type_id;
  if (!id) return false;
  const ty = ttypes.types.find((t: TransactionType) => t.id === id);
  const slug = (ty?.slug || '').toLowerCase();
  const name = (ty?.name || '').toLowerCase();
  return slug === 'transfer' || name.includes('transfer');
});
const isCrossCurrency = computed(() => {
  if (!isTransfer.value) return false;
  const from = originAccount.value?.currencyId;
  const to = destAccount.value?.currencyId;
  if (from && to) return from !== to;
  const fromCode = originAccount.value?.currencyCode;
  const toCode = destAccount.value?.currencyCode;
  if (fromCode && toCode) return fromCode !== toCode;
  return false;
});
const selectedAccountCurrencyId = computed(() => selectedAccount.value?.currencyId ?? null);
const selectedAccountCurrencyCode = computed(() => selectedAccount.value?.currencyCode ?? null);
const showRateInput = computed(() => {
  if (isTransfer.value) return isCrossCurrency.value;
  const uid = userCurrencyId.value,
    aid = selectedAccountCurrencyId.value;
  if (uid && aid) return uid !== aid;
  const ucode = userCurrencyCode.value,
    acode = selectedAccountCurrencyCode.value;
  if (ucode && acode) return ucode !== acode;
  return false;
});
const rateLabel = computed(() => {
  if (isTransfer.value) {
    return `Tasa (${originAccount.value?.currencyCode || 'Origen'}→${
      destAccount.value?.currencyCode || 'Destino'
    })`;
  }
  return `Tasa (${userCurrencyCode.value || 'Usuario'}→${
    selectedAccountCurrencyCode.value || 'Cuenta'
  })`;
});

// Balances
const currentBalance = computed(() => {
  const accId = isTransfer.value ? form.value.account_from_id : form.value.account_id;
  const acc = allAccounts.value.find((a) => a.id === accId);
  return acc?.balance ?? 0;
});
const currencySymbol = computed(() => {
  const accId = isTransfer.value ? form.value.account_from_id : form.value.account_id;
  const acc = allAccounts.value.find((a) => a.id === accId);
  return acc?.currencySymbol || '';
});
const originCurrencySymbol = computed(() => originAccount.value?.currencySymbol || '');
const destCurrencySymbol = computed(() => destAccount.value?.currencySymbol || '');
const destCurrentBalance = computed(() => destAccount.value?.balance ?? 0);
const applyRateToTotal = computed(
  () => showRateInput.value && !!form.value.rate && Number(form.value.rate) > 0
);
const amountForAccountCurrency = computed(() => {
  if (isTransfer.value) return Number(form.value.amount || 0);
  const base = Number(form.value.amount || 0);
  if (showRateInput.value) {
    const r = Number(form.value.rate || 0);
    if (Number.isFinite(r) && r > 0) return base * r;
  }
  return base;
});
const newBalance = computed(() => {
  const base = Number(currentBalance.value) || 0;
  if (isTransfer.value) return base - (Number(form.value.amount || 0) || 0);
  const ty = ttypes.types.find((t: TransactionType) => t.id === form.value.transaction_type_id);
  const slug = (ty?.slug || '').toLowerCase();
  const amt = Number(amountForAccountCurrency.value) || 0;
  if (slug === 'expense') return base - Math.abs(amt);
  if (slug === 'income') return base + Math.abs(amt);
  return base + amt;
});
const destNewBalance = computed(() => {
  if (!isTransfer.value) return Number(destCurrentBalance.value) || 0;
  const amtRaw = form.value.amount;
  const amt = typeof amtRaw === 'number' ? amtRaw : Number(amtRaw || 0);
  const base = Number(destCurrentBalance.value) || 0;
  const amount = Number.isFinite(amt) ? Math.abs(amt) : 0;
  if (!isCrossCurrency.value) return base + amount;
  const r = Number(form.value.rate || 0);
  if (Number.isFinite(r) && r > 0) return base + amount * r;
  return base;
});
const needsRateForAccountBalance = computed(
  () => !isTransfer.value && showRateInput.value && !(Number(form.value.rate || 0) > 0)
);
const needsRateForDestBalance = computed(
  () => isTransfer.value && isCrossCurrency.value && !(Number(form.value.rate || 0) > 0)
);
const resultCurrencySymbol = computed(() =>
  isTransfer.value
    ? destCurrencySymbol.value || currencySymbol.value || ''
    : currencySymbol.value || ''
);
const resultTotal = computed(() => {
  const base = Math.abs(form.value.amount || 0);
  if (!applyRateToTotal.value) return base;
  const r = Number(form.value.rate || 0);
  if (!Number.isFinite(r) || r <= 0) return base;
  return base * r;
});

// Watchers (sign & type)
watch(
  () => form.value.amount,
  (val) => {
    if (val == null) return;
    const current = ttypes.types.find(
      (t: TransactionType) => t.id === form.value.transaction_type_id
    );
    const cSlug = (current?.slug || '').toLowerCase();
    if (cSlug === 'transfer') {
      if (val < 0) form.value.amount = Math.abs(val);
      return;
    }
    const findIncome =
      ttypes.types.find((t: TransactionType) => (t.slug || '').toLowerCase() === 'income') ||
      ttypes.types.find((t: TransactionType) => t.name.toLowerCase().includes('ingreso'));
    const findExpense =
      ttypes.types.find((t: TransactionType) => (t.slug || '').toLowerCase() === 'expense') ||
      ttypes.types.find((t: TransactionType) => t.name.toLowerCase().includes('egreso'));
    if (val < 0 && findExpense && form.value.transaction_type_id !== findExpense.id)
      form.value.transaction_type_id = findExpense.id;
    else if (val > 0 && findIncome && form.value.transaction_type_id !== findIncome.id)
      form.value.transaction_type_id = findIncome.id;
  }
);
watch(
  () => form.value.transaction_type_id,
  (id) => {
    if (!id) return;
    const ty = ttypes.types.find((t: TransactionType) => t.id === id);
    const slug = (ty?.slug || '').toLowerCase();
    if (slug === 'transfer') {
      if (form.value.amount != null && form.value.amount < 0)
        form.value.amount = Math.abs(form.value.amount);
      return;
    }
    if (form.value.amount == null) return;
    if (slug === 'expense' && form.value.amount > 0)
      form.value.amount = -Math.abs(form.value.amount);
    else if (slug === 'income' && form.value.amount < 0)
      form.value.amount = Math.abs(form.value.amount);
  }
);
watch(
  () => showRateInput.value,
  (need) => {
    if (!need) form.value.rate = null;
  }
);

// Open by query (?new)
function openIfNewFlag() {
  if (route.query.new != null) {
    ui.openNewTransactionDialog();
    const next: LocationQuery = { ...route.query };
    if ('new' in next) delete next.new;
    void router.replace({ query: next });
  }
}
onMounted(() => openIfNewFlag());
watch(
  () => route.query.new,
  () => openIfNewFlag()
);

// Save
function saveTransaction() {
  const ty = ttypes.types.find((t: TransactionType) => t.id === form.value.transaction_type_id);
  const slug = (ty?.slug || '').toLowerCase();
  if (slug === 'expense' && form.value.amount && form.value.amount > 0)
    form.value.amount = -Math.abs(form.value.amount);
  else if (slug === 'income' && form.value.amount && form.value.amount < 0)
    form.value.amount = Math.abs(form.value.amount);
  if (slug === 'transfer') {
    if (!form.value.account_from_id || !form.value.account_to_id) {
      $q.notify({ type: 'warning', message: 'Selecciona cuenta origen y destino' });
      return;
    }
    if (!form.value.amount || form.value.amount <= 0) {
      $q.notify({ type: 'warning', message: 'El importe debe ser positivo' });
      return;
    }
    if (isCrossCurrency.value && (!form.value.rate || Number(form.value.rate) <= 0)) {
      $q.notify({ type: 'warning', message: 'Ingresa la tasa Origen→Destino' });
      return;
    }
  } else if ((slug === 'income' || slug === 'expense') && !form.value.account_id) {
    $q.notify({ type: 'warning', message: 'Selecciona una cuenta' });
    return;
  }
  if (showRateInput.value && (!form.value.rate || Number(form.value.rate) <= 0)) {
    $q.notify({ type: 'warning', message: 'Ingresa la tasa de cambio' });
    return;
  }
  let dateStr = form.value.datetime;
  if (dateStr.includes('T')) dateStr = dateStr.replace('T', ' ');
  if (dateStr.length === 16) dateStr += ':00';
  const isTrans = slug === 'transfer';
  let payload: Record<string, unknown>;
  if (!isTrans) {
    type ItemPayload = { name: string; amount: number; category_id?: number | null };
    let items: ItemPayload[] = [];
    if (isAdvancedAmount.value) {
      const valid = invoiceItems.value
        .map((r) => ({
          name: r.item || 'Item',
          qty: Number(r.quantity || 0),
          price: Number(r.unitPrice || 0),
          category_id: r.categoryId ?? null,
        }))
        .filter((r) => r.qty > 0 && r.price >= 0);
      if (!valid.length) {
        $q.notify({ type: 'warning', message: 'Agrega al menos una línea válida' });
        return;
      }
      items = valid.map((r) => ({
        name: r.name,
        amount: r.qty * r.price,
        category_id: r.category_id,
      }));
    } else {
      const amtAbs = Math.abs(Number(form.value.amount || 0));
      items = [{ name: form.value.name || 'Item', amount: amtAbs, category_id: null }];
    }
    payload = {
      name: form.value.name,
      amount: form.value.amount ?? 0,
      amount_tax: Number(form.value.amount_tax ? 1 : 0),
      date: dateStr,
      provider_id: form.value.provider_id,
      account_id: form.value.account_id,
      transaction_type_id: form.value.transaction_type_id,
      url_file: form.value.url_file || null,
      rate: showRateInput.value ? form.value.rate : null,
      items,
    };
  } else {
    payload = {
      name: form.value.name,
      amount: form.value.amount ?? 0,
      amount_tax: Number(form.value.amount_tax ? 1 : 0),
      date: dateStr,
      provider_id: form.value.provider_id,
      account_from_id: form.value.account_from_id,
      account_to_id: form.value.account_to_id,
      transaction_type_id: form.value.transaction_type_id,
      url_file: form.value.url_file || null,
      rate: form.value.rate ?? null,
    };
  }
  tsStore
    .addTransaction(payload)
    .then(() => {
      $q.notify({ type: 'positive', message: 'Transacción creada' });
      ui.closeNewTransactionDialog();
      resetForm();
    })
    .catch((err: unknown) => {
      let message = 'Error al crear transacción';
      try {
        const e = err as {
          isApiError?: boolean;
          api?: { message?: string; errors?: Record<string, string[]> };
          response?: { data?: any };
        };
        if (e?.isApiError && e.api) {
          if (e.api.message) message = e.api.message;
          const fieldErrors = e.api.errors || {};
          const list: string[] = [];
          Object.keys(fieldErrors).forEach((k) => {
            const arr = fieldErrors[k];
            if (Array.isArray(arr)) arr.forEach((m) => list.push(`${k}: ${m}`));
          });
          if (list.length) message = `${message}. ${list.join(' | ')}`;
        } else if (e?.response?.data) {
          const data = e.response.data;
            if (data.message) message = data.message;
            if (data.errors && typeof data.errors === 'object') {
              const list: string[] = [];
              Object.keys(data.errors).forEach((k) => {
                const arr = data.errors[k];
                if (Array.isArray(arr)) arr.forEach((m: string) => list.push(`${k}: ${m}`));
              });
              if (list.length) message = `${message}. ${list.join(' | ')}`;
            }
        }
      } catch (_) {
        /* ignore parse error */
      }
      console.error(err);
      $q.notify({ type: 'negative', message });
    });
}

function resetForm() {
  form.value = initialForm();
  isAdvancedAmount.value = false;
  invoiceItems.value = [{ item: '', quantity: 1, unitPrice: 0 }];
}
</script>

<script lang="ts">
import { defineComponent } from 'vue';
const Comp = defineComponent({ name: 'TransactionCreateDialog' });
export default Comp;
export const TransactionCreateDialog = Comp;
</script>

<style scoped>
.invoice-table thead th {
  font-weight: 600;
}
</style>
