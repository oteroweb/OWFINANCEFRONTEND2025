/* eslint-disable */
<template>
  <q-page class="q-pa-md">
    <h2>Hola, {{ auth.user?.name }}</h2>
    <p>Esta es tu vista de usuario final</p>
    <!-- Floating action button to create new transaction -->
    <div class="fixed-bottom-right q-pa-md">
      <q-btn
        fab
        icon="add"
        color="primary"
        v-tooltip="'Crear nueva transacción'"
        @click="showDialog = true"
      />
    </div>
    <!-- Dialog for transaction form -->
    <q-dialog v-model="showDialog">
      <q-card style="min-width: 400px">
        <q-card-section>
          <div class="text-h6">Nueva Transacción</div>
        </q-card-section>
        <q-card-section>
          <q-form @submit.prevent="saveTransaction">
            <q-option-group
              v-model="form.transaction_type_id"
              :options="ttOptions"
              type="radio"
              inline
              class="q-mt-xs"
            />
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
              class="q-mt-sm"
              use-input
              clearable
              input-debounce="300"
              @focus="ensureProvidersLoaded"
            >
              <template v-slot:append>
                <q-btn flat dense icon="add" @click.stop="showAddProviderDialog = true" />
              </template>
              <template v-slot:no-option="scope">
                <q-item clickable @click="triggerAddProviderDialog(scope.inputValue)">
                  <q-item-section> Crear nuevo "{{ scope.inputValue }}" </q-item-section>
                </q-item>
              </template>
            </q-select>

            <q-input v-model="form.name" label="Concepto" filled dense class="q-mt-sm" />
            <q-input
              v-model="form.datetime"
              label="Fecha y hora"
              type="datetime-local"
              filled
              dense
              class="q-mt-sm"
            />
            <div v-if="!isTransfer">
              <q-select
                v-model="form.account_id"
                :options="accountOptions"
                :onFilter="onAccountFilter"
                option-value="id"
                :option-label="accountLabel"
                emit-value
                map-options
                label="Cuenta"
                filled
                dense
                class="q-mt-sm"
                use-input
                clearable
                input-debounce="300"
                @focus="ensureAccountsLoaded"
              >
                <template v-slot:append>
                  <q-btn flat dense icon="add" @click.stop="showAddAccountDialog = true" />
                </template>
                <template v-slot:no-option="scope">
                  <q-item clickable @click="triggerAddAccountDialog(scope.inputValue)">
                    <q-item-section> Crear nuevo "{{ scope.inputValue }}" </q-item-section>
                  </q-item>
                </template>
              </q-select>
              <div v-if="form.account_id" class="row items-center q-pt-xs q-pl-xs q-pr-xs">
                <div class="col">
                  Saldo actual: {{ currencySymbol }}{{ Number(currentBalance).toFixed(2) }}
                </div>
                <div class="col text-right">
                  Saldo después: {{ currencySymbol }}{{ Number(newBalance).toFixed(2) }}
                </div>
              </div>
            </div>
            <div v-else class="q-mt-sm">
              <q-select
                v-model="form.account_from_id"
                :options="accountOptions"
                :onFilter="onAccountFilter"
                option-value="id"
                :option-label="accountLabel"
                emit-value
                map-options
                label="Cuenta Origen"
                filled
                dense
                class="q-mb-sm"
                use-input
                clearable
                input-debounce="300"
                @focus="ensureAccountsLoaded"
              >
                <template v-slot:append>
                  <q-btn flat dense icon="add" @click.stop="showAddAccountDialog = true" />
                </template>
              </q-select>
              <div
                v-if="form.account_from_id"
                class="row items-center q-pt-xs q-pl-xs q-pr-xs q-mb-sm"
              >
                <div class="col">
                  Origen — Saldo actual: {{ originCurrencySymbol
                  }}{{ Number(currentBalance).toFixed(2) }}
                </div>
                <div class="col text-right">
                  Origen - Saldo después: {{ originCurrencySymbol
                  }}{{ Number(newBalance).toFixed(2) }}
                </div>
              </div>

              <q-select
                v-model="form.account_to_id"
                :options="accountOptions"
                :onFilter="onAccountFilter"
                option-value="id"
                :option-label="accountLabel"
                emit-value
                map-options
                label="Cuenta Destino"
                filled
                dense
                class="q-mt-sm"
                use-input
                clearable
                input-debounce="300"
                @focus="ensureAccountsLoaded"
              >
                <template v-slot:append>
                  <q-btn flat dense icon="add" @click.stop="showAddAccountDialog = true" />
                </template>
              </q-select>
              <div v-if="form.account_to_id" class="row items-center q-pt-xs q-pl-xs q-pr-xs">
                <div class="col">
                  Destino — Saldo actual: {{ destCurrencySymbol
                  }}{{ Number(destCurrentBalance).toFixed(2) }}
                </div>
                <div class="col text-right">
                  Destino - Saldo después: {{ destCurrencySymbol
                  }}{{ Number(destNewBalance).toFixed(2) }}
                </div>
              </div>
              <div v-if="form.account_to_id" class="text-right text-caption q-pr-xs text-grey-7">
                <span v-if="!isCrossCurrency">= actual + importe</span>
                <span v-else>
                  <span v-if="form.rate && Number(form.rate) > 0">= actual + (importe × tasa)</span>
                  <span v-else>(falta tasa para calcular)</span>
                </span>
              </div>
              <div
                v-if="form.account_from_id && form.account_to_id && form.amount != null"
                class="q-mt-xs q-pr-xs text-right text-caption text-grey-7"
              >
                <div>Importe: {{ originCurrencySymbol }}{{ Number(form.amount).toFixed(2) }}</div>
                <div>
                  De: {{ originAccount?.name || '—' }} ({{ originAccount?.currencyCode || '—' }}) →
                  A: {{ destAccount?.name || '—' }} ({{ destAccount?.currencyCode || '—' }})
                </div>
              </div>
            </div>

            <div class="row q-col-gutter-sm q-mt-sm">
              <div class="col-12 col-sm-6">
                <q-input v-model.number="form.amount" label="Importe" type="number" filled dense />
              </div>
              <div class="col-12 col-sm-6" v-if="showRateInput">
                <q-input
                  v-model.number="form.rate"
                  :label="rateLabel"
                  type="number"
                  step="0.0001"
                  filled
                  dense
                />
              </div>
            </div>

            <q-checkbox v-model="form.amount_tax" label="Incluir Impuesto" class="q-mt-sm" />
            <q-input v-model="form.url_file" label="Archivo (URL)" filled dense class="q-mt-sm" />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancelar"
            color="secondary"
            v-close-popup
            @click="showDialog = false"
          />
          <q-btn flat label="Guardar" color="primary" @click="saveTransaction" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog for adding new provider -->
    <q-dialog v-model="showAddProviderDialog">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Nuevo Proveedor</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="newProviderName" label="Nombre del Proveedor" filled dense />
          <q-input v-model="newProviderAddress" label="Dirección" filled dense class="q-mt-sm" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancelar"
            color="secondary"
            v-close-popup
            @click="showAddProviderDialog = false"
          />
          <q-btn flat label="Agregar" color="primary" @click="addProvider()" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Dialog for adding new account (inline) -->
    <q-dialog v-model="showAddAccountDialog">
      <q-card style="min-width: 300px">
        <q-card-section>
          <div class="text-h6">Nueva Cuenta</div>
        </q-card-section>
        <q-card-section>
          <q-input v-model="newAccountName" label="Nombre de la Cuenta" filled dense />
          <q-input
            v-model.number="newAccountInitial"
            label="Monto Inicial"
            type="number"
            filled
            dense
            class="q-mt-sm"
          />
          <q-select
            v-model="newAccountCurrency"
            :options="currencyOptions"
            :onFilter="onCurrencyFilter"
            option-value="id"
            option-label="nameLabel"
            emit-value
            map-options
            label="Moneda"
            filled
            dense
            use-input
            clearable
            input-debounce="300"
            class="q-mt-sm"
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
            label="Tipo de Cuenta"
            filled
            dense
            use-input
            clearable
            input-debounce="300"
            class="q-mt-sm"
            @focus="ensureAccountTypesLoaded"
          />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            flat
            label="Cancelar"
            color="secondary"
            v-close-popup
            @click="showAddAccountDialog = false"
          />
          <q-btn flat label="Agregar" color="primary" @click="addAccountInline()" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useAuthStore } from 'stores/auth';
import { useTransactionsStore } from 'stores/transactions';
import { useTransactionTypesStore } from 'stores/transactionTypes';
import type { Transaction } from 'stores/transactions';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
// inline account dialog instead of external component

const auth = useAuthStore();
const tsStore = useTransactionsStore();
const ttypes = useTransactionTypesStore();
const $q = useQuasar();
const showDialog = ref(false);
const showAddProviderDialog = ref(false);
// Diálogo de nueva cuenta
const showAddAccountDialog = ref(false);
// Opciones de tipos de cuenta y monedas (desde API)
type OptionBasic = { id: number; name: string };
type CurrencyOption = OptionBasic & {
  symbol?: string | undefined;
  code?: string | undefined;
  nameLabel: string;
};
const accountTypeOptions = ref<OptionBasic[]>([]);
const allAccountTypes = ref<OptionBasic[]>([]);
const currencyOptions = ref<CurrencyOption[]>([]);
const allCurrencies = ref<CurrencyOption[]>([]);
// Guardar el texto ingresado cuando no hay opción
const lastAccountName = ref('');
// Campos para el diálogo inline de cuenta
const newAccountName = ref('');
const newAccountInitial = ref<number | null>(null);
const newAccountType = ref<number | null>(null);
const newAccountCurrency = ref<number | null>(null);

// Transaction form state
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

// New provider name
const newProviderName = ref('');
const newProviderAddress = ref('');

// Filtro tipo CrudPage para el q-select de proveedores
function onProviderFilter(val: string, doneFn: (callback: () => void) => void) {
  const needle = String(val || '').toLowerCase();
  doneFn(() => {
    if (!needle) {
      providerOptions.value = allProviders.value;
    } else {
      providerOptions.value = allProviders.value.filter((p) =>
        (p.name || '').toLowerCase().includes(needle)
      );
    }
  });
}

// Opciones de proveedores y cuentas
type ProviderOption = { id: number; name: string; address?: string; user_id?: number | null };
const providerOptions = ref<ProviderOption[]>([]);
const allProviders = ref<ProviderOption[]>([]);

// Tipo para opciones de cuenta con balance
// Tipo para opciones de cuenta con balance, código y símbolo de moneda
type AccountOption = {
  id: number;
  name: string;
  balance?: number;
  user_id?: number | null;
  currencyId?: number | null;
  currencyCode?: string;
  currencySymbol?: string;
};
const allAccounts = ref<AccountOption[]>([]);
const accountOptions = ref<AccountOption[]>([]);

// Función para renderizar label de proveedor
function providerLabel(p: { name?: string; address?: string }) {
  if (!p) return '';
  if (p.name && p.address) return `${p.name} (${p.address})`;
  return p.name || '';
}

// Función para renderizar label de cuenta con balance
// Formatea el label de cuenta incluyendo balance y código de moneda
function accountLabel(a: AccountOption) {
  if (!a) return '';
  const bal = a.balance ?? 0;
  const code = a.currencyCode ? ` ${a.currencyCode}` : '';
  return `${a.name} (${bal}${code})`;
}

// Saldos y símbolos
const currentBalance = computed<number>(() => {
  const accId = isTransfer.value ? form.value.account_from_id! : form.value.account_id!;
  const acc = allAccounts.value.find((a) => a.id === accId);
  return acc?.balance ?? 0;
});
const newBalance = computed<number>(() => currentBalance.value - (form.value.amount || 0));
const currencySymbol = computed<string>(() => {
  const accId = isTransfer.value ? form.value.account_from_id! : form.value.account_id!;
  const acc = allAccounts.value.find((a) => a.id === accId);
  return acc?.currencySymbol ?? '';
});
// Origen (transfer)
const originAccount = computed(() =>
  allAccounts.value.find((a) => a.id === form.value.account_from_id!)
);
const originCurrencySymbol = computed<string>(() => originAccount.value?.currencySymbol ?? '');
// Destino (transfer)
const destAccount = computed(() =>
  allAccounts.value.find((a) => a.id === form.value.account_to_id!)
);
const destCurrentBalance = computed<number>(() => destAccount.value?.balance ?? 0);
const destCurrencySymbol = computed<string>(() => destAccount.value?.currencySymbol ?? '');
// ¿Transferencia entre monedas distintas?
const isCrossCurrency = computed<boolean>(() => {
  if (!isTransfer.value) return false;
  const fromId = originAccount.value?.currencyId ?? null;
  const toId = destAccount.value?.currencyId ?? null;
  if (fromId && toId) return fromId !== toId;
  const fromCode = originAccount.value?.currencyCode ?? null;
  const toCode = destAccount.value?.currencyCode ?? null;
  if (fromCode && toCode) return fromCode !== toCode;
  return false;
});

// Para saldo destino después: sumar importe o importe×tasa si hay cruce de monedas
const destNewBalance = computed<number>(() => {
  const amtRaw = form.value.amount;
  const amt = typeof amtRaw === 'number' ? amtRaw : Number(amtRaw || 0);
  if (!isTransfer.value) return Number(destCurrentBalance.value) || 0; // no aplica
  const baseNum = Number(destCurrentBalance.value);
  const base = Number.isFinite(baseNum) ? baseNum : 0;
  const amount = Number.isFinite(amt) ? amt : 0;
  if (!isCrossCurrency.value) return base + amount;
  const rateNum = Number(form.value.rate || 0);
  if (Number.isFinite(rateNum) && rateNum > 0) return base + amount * rateNum;
  return base; // falta tasa para calcular
});

// Moneda por defecto del usuario y moneda de la cuenta
function getStoredUser(): Record<string, unknown> | null {
  try {
    const raw = localStorage.getItem('user');
    if (!raw) return null;
    const obj = JSON.parse(raw) as unknown;
    return obj && typeof obj === 'object' ? (obj as Record<string, unknown>) : null;
  } catch {
    return null;
  }
}

const userCurrencyId = computed<number | null>(() => {
  const u = auth.user as unknown;
  if (u && typeof u === 'object') {
    const obj = u as Record<string, unknown>;
    const direct = obj['currency_id'];
    if (typeof direct === 'number') return direct;
    const cur = obj['currency'];
    if (cur && typeof cur === 'object') {
      const id = (cur as Record<string, unknown>)['id'];
      if (typeof id === 'number') return id;
    }
  }
  const su = getStoredUser();
  if (su) {
    const direct = su['currency_id'];
    if (typeof direct === 'number') return direct;
    const cur = su['currency'];
    if (cur && typeof cur === 'object') {
      const id = (cur as Record<string, unknown>)['id'];
      if (typeof id === 'number') return id;
    }
  }
  return null;
});
const userCurrencyCode = computed<string | null>(() => {
  const u = auth.user as unknown;
  if (u && typeof u === 'object') {
    const cur = (u as Record<string, unknown>)['currency'];
    if (cur && typeof cur === 'object') {
      const code = (cur as Record<string, unknown>)['code'];
      if (typeof code === 'string') return code;
    }
  }
  const su = getStoredUser();
  if (su) {
    const cur = su['currency'];
    if (cur && typeof cur === 'object') {
      const code = (cur as Record<string, unknown>)['code'];
      if (typeof code === 'string') return code;
    }
  }
  return null;
});
const selectedAccount = computed<AccountOption | undefined>(() =>
  allAccounts.value.find(
    (a) => a.id === (isTransfer.value ? form.value.account_from_id! : form.value.account_id!)
  )
);
const selectedAccountCurrencyId = computed<number | null>(
  () => selectedAccount.value?.currencyId ?? null
);
const selectedAccountCurrencyCode = computed<string | null>(
  () => selectedAccount.value?.currencyCode ?? null
);
// Para transferencias, la tasa depende de la conversión Origen→Destino; para no transfer, Usuario→Cuenta
const showRateInput = computed<boolean>(() => {
  if (isTransfer.value) {
    const fromId = originAccount.value?.currencyId ?? null;
    const toId = destAccount.value?.currencyId ?? null;
    const fromCode = originAccount.value?.currencyCode ?? null;
    const toCode = destAccount.value?.currencyCode ?? null;
    if (fromId && toId) return fromId !== toId;
    if (fromCode && toCode) return fromCode !== toCode;
    return false;
  }
  const uid = userCurrencyId.value;
  const aid = selectedAccountCurrencyId.value;
  if (uid && aid) return uid !== aid;
  const ucode = userCurrencyCode.value;
  const acode = selectedAccountCurrencyCode.value;
  if (ucode && acode) return ucode !== acode;
  return false;
});
const rateLabel = computed<string>(() => {
  if (isTransfer.value) {
    const from = originAccount.value?.currencyCode || 'Origen';
    const to = destAccount.value?.currencyCode || 'Destino';
    return `Tasa (${from}→${to})`;
  }
  const u = userCurrencyCode.value || 'Usuario';
  const a = selectedAccountCurrencyCode.value || 'Cuenta';
  return `Tasa (${u}→${a})`;
});

// Detectar si el tipo actual es Transfer
const isTransfer = computed<boolean>(() => {
  const id = form.value.transaction_type_id;
  if (!id) return false;
  // Resolver slug por id
  const ty = ttypes.types.find((t) => t.id === id);
  const slug = (ty?.slug || '').toLowerCase();
  const name = (ty?.name || '').toLowerCase();
  return slug === 'transfer' || name.includes('transfer');
});

// Filtro tipo CrudPage para el q-select de cuentas
function onAccountFilter(val: string, doneFn: (callback: () => void) => void) {
  const needle = String(val || '').toLowerCase();
  doneFn(() => {
    if (!needle) {
      accountOptions.value = allAccounts.value;
    } else {
      accountOptions.value = allAccounts.value.filter((a) =>
        (a.name || '').toLowerCase().includes(needle)
      );
    }
  });
}

// Flags y funciones para evitar recargas innecesarias
let providersLoaded = false;
let accountsLoaded = false;
let accountTypesLoaded = false;
let currenciesLoaded = false;

async function ensureProvidersLoaded() {
  if (!providersLoaded) {
    try {
      const pRes = await api.get('/providers', { params: { user_id: auth.user?.id } });
      type Provider = { id: number; name: string; address?: string; user_id?: number | null };
      const fetchedProviders = (pRes.data.data || pRes.data) as Provider[];
      allProviders.value = fetchedProviders || [];
      providerOptions.value = fetchedProviders || [];
      providersLoaded = true;
    } catch (err) {
      $q.notify({ type: 'negative', message: 'Error cargando proveedores' });
      allProviders.value = [];
      providerOptions.value = [];
      providersLoaded = false;
      console.error('loadProviderOptions error', err);
    }
  }
}

async function ensureAccountsLoaded() {
  if (!accountsLoaded) {
    try {
      const aRes = await api.get('/accounts', { params: { user_id: auth.user?.id } });
      // Mapear initial a balance para que aparezca en el label
      interface ApiAccount {
        id: number;
        name: string;
        initial?: number;
        user_id?: number | null;
        currency: { id?: number | undefined; code: string; symbol: string };
      }
      const fetched = (aRes.data.data || aRes.data) as ApiAccount[];
      const mapped = fetched.map((item) => ({
        id: item.id,
        name: item.name,
        balance: Number(item.initial ?? 0),
        // Garantizar que user_id sea number o null, no undefined
        user_id: item.user_id ?? null,
        currencyId: item.currency?.id ?? null,
        currencyCode: item.currency.code,
        currencySymbol: item.currency.symbol,
      }));
      allAccounts.value = mapped;
      accountOptions.value = mapped;
      accountsLoaded = true;
    } catch (err) {
      $q.notify({ type: 'negative', message: 'Error cargando cuentas' });
      allAccounts.value = [];
      accountOptions.value = [];
      accountsLoaded = false;
      console.error('loadAccountOptions error', err);
    }
  }
}

// Cargar tipos de cuenta desde API
async function ensureAccountTypesLoaded() {
  if (!accountTypesLoaded) {
    try {
      const res = await api.get('/account_types', {
        params: { order_by: 'name', order_dir: 'asc' },
      });
      const data = (res.data.data || res.data) as OptionBasic[];
      allAccountTypes.value = data || [];
      accountTypeOptions.value = data || [];
      accountTypesLoaded = true;
    } catch (err) {
      $q.notify({ type: 'negative', message: 'Error cargando tipos de cuenta' });
      allAccountTypes.value = [];
      accountTypeOptions.value = [];
      accountTypesLoaded = false;
      console.error('ensureAccountTypesLoaded error', err);
    }
  }
}

// Cargar monedas desde API
async function ensureCurrenciesLoaded() {
  if (!currenciesLoaded) {
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
    } catch (err) {
      $q.notify({ type: 'negative', message: 'Error cargando monedas' });
      allCurrencies.value = [] as CurrencyOption[];
      currencyOptions.value = [] as CurrencyOption[];
      currenciesLoaded = false;
      console.error('ensureCurrenciesLoaded error', err);
    }
  }
}

// Filtros para selects del diálogo de cuenta
function onAccountTypeFilter(val: string, doneFn: (cb: () => void) => void) {
  const needle = String(val || '').toLowerCase();
  doneFn(() => {
    if (!needle) accountTypeOptions.value = allAccountTypes.value;
    else
      accountTypeOptions.value = allAccountTypes.value.filter((o) =>
        (o.name || '').toLowerCase().includes(needle)
      );
  });
}
function onCurrencyFilter(val: string, doneFn: (cb: () => void) => void) {
  const needle = String(val || '').toLowerCase();
  doneFn(() => {
    if (!needle) currencyOptions.value = allCurrencies.value;
    else
      currencyOptions.value = allCurrencies.value.filter((o) => {
        const name = (o.name || '').toLowerCase();
        const symbol = (o.symbol || '').toLowerCase();
        const code = (o.code || '').toLowerCase();
        return name.includes(needle) || symbol.includes(needle) || code.includes(needle);
      });
  });
}

// Ya no se usa onShowDialog ni optionsLoaded, la carga es por focus en el select

function saveTransaction() {
  // Normalizar importe según tipo de transacción
  const ty = ttypes.types.find((t) => t.id === form.value.transaction_type_id);
  const slug = (ty?.slug || '').toLowerCase();
  if (slug === 'expense') {
    if (form.value.amount && form.value.amount > 0)
      form.value.amount = -Math.abs(form.value.amount);
  } else if (slug === 'income') {
    if (form.value.amount && form.value.amount < 0) form.value.amount = Math.abs(form.value.amount);
  }
  // Validar transferencias
  if (slug === 'transfer') {
    if (!form.value.account_from_id || !form.value.account_to_id) {
      $q.notify({ type: 'warning', message: 'Selecciona cuenta origen y destino' });
      return;
    }
    if (!form.value.amount || form.value.amount <= 0) {
      $q.notify({ type: 'warning', message: 'El importe de transferencia debe ser positivo' });
      return;
    }
    // Si las monedas difieren, exigir tasa
    const from =
      allAccounts.value.find((a) => a.id === form.value.account_from_id!)?.currencyId ?? null;
    const to =
      allAccounts.value.find((a) => a.id === form.value.account_to_id!)?.currencyId ?? null;
    if (from && to && from !== to) {
      if (!form.value.rate || Number(form.value.rate) <= 0) {
        $q.notify({ type: 'warning', message: 'Ingresa la tasa de cambio Origen→Destino' });
        return;
      }
    }
  }
  // Unificar datetime-local a formato backend: 'YYYY-MM-DD HH:mm:ss'
  const dt = form.value.datetime;
  let dateStr = dt;
  if (dt && dt.includes('T')) {
    dateStr = dt.replace('T', ' ');
  }
  // Si no tiene segundos, añadir ':00'
  if (dateStr && dateStr.length === 16) {
    dateStr += ':00';
  }
  // Validar tasa cuando las monedas difieren
  if (showRateInput.value && (!form.value.rate || Number(form.value.rate) <= 0)) {
    $q.notify({ type: 'warning', message: 'Ingresa la tasa de cambio para esta transacción' });
    return;
  }
  // Preparar payload sin la propiedad datetime
  // Extraer valores excepto datetime
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { datetime: _datetime, ...rest } = form.value;
  const payload = { ...rest, date: dateStr } as unknown as Omit<Transaction, 'id'>;
  tsStore
    .addTransaction(payload)
    .then(() => {
      $q.notify({ type: 'positive', message: 'Transacción creada' });
    })
    .catch(() => {
      $q.notify({ type: 'negative', message: 'Error al crear transacción' });
    });
  showDialog.value = false;
  form.value = initialForm();
}

// Create new provider on the fly
async function addProvider() {
  try {
    const resp = await api.post('/providers', {
      name: newProviderName.value,
      address: newProviderAddress.value,
      user_id: auth.user?.id,
    });
    const newProv = resp.data.data || resp.data;
    // set as selected
    form.value.provider_id = newProv.id;
    // reload options to include new provider persistently
    // Recargar lista de proveedores
    await ensureProvidersLoaded();
    return newProv;
  } catch {
    $q.notify({ type: 'negative', message: 'Error al crear proveedor' });
  } finally {
    showAddProviderDialog.value = false;
    newProviderName.value = '';
    newProviderAddress.value = '';
  }
}

// Trigger provider creation from q-select when entering new value
function triggerAddProviderDialog(val: string) {
  newProviderName.value = val;
  newProviderAddress.value = '';
  showAddProviderDialog.value = true;
}

// Abrir el diálogo de cuenta desde el no-option del select de cuentas
function triggerAddAccountDialog(val: string) {
  lastAccountName.value = val || '';
  newAccountName.value = val || '';
  showAddAccountDialog.value = true;
}

// Crear nueva cuenta desde el diálogo inline
async function addAccountInline() {
  try {
    if (!newAccountCurrency.value || !newAccountType.value) {
      $q.notify({ type: 'warning', message: 'Selecciona moneda y tipo de cuenta' });
      return;
    }
    const resp = await api.post('/accounts', {
      name: (newAccountName.value && newAccountName.value.trim()) || lastAccountName.value,
      initial: newAccountInitial.value ?? 0,
      user_id: auth.user?.id,
      currency_id: newAccountCurrency.value,
      account_type_id: newAccountType.value,
    });
    const newAcc = resp.data?.data ?? resp.data;
    form.value.account_id = newAcc.id;
    // Recargar opciones para incluir la cuenta nueva con saldo/moneda
    accountsLoaded = false;
    await ensureAccountsLoaded();
    $q.notify({ type: 'positive', message: 'Cuenta creada' });
  } catch (e) {
    $q.notify({ type: 'negative', message: 'Error al crear cuenta' });
    console.error('addAccountInline error', e);
  } finally {
    showAddAccountDialog.value = false;
    lastAccountName.value = '';
    newAccountName.value = '';
    newAccountInitial.value = null;
    newAccountType.value = null;
    newAccountCurrency.value = null;
  }
}

// (limpieza) fin de helpers de cuentas

// Pre-cargar listas cuando se abre el diálogo de cuenta
watch(
  () => showAddAccountDialog.value,
  async (open) => {
    if (open) {
      await Promise.allSettled([ensureCurrenciesLoaded(), ensureAccountTypesLoaded()]);
    }
  }
);

// Alertar si el usuario no tiene moneda por defecto (una sola vez)
const currencyAlertShown = ref(false);
watch(
  () => userCurrencyId.value,
  (val) => {
    if (!val && !currencyAlertShown.value) {
      $q.dialog({
        title: 'Moneda requerida',
        message: 'No tienes definida una moneda por defecto. Por favor, indica cuál es.',
        ok: 'Entendido',
      });
      currencyAlertShown.value = true;
    }
  },
  { immediate: true }
);

// Limpiar tasa si ya no se requiere
watch(
  () => showRateInput.value,
  (needed) => {
    if (!needed) form.value.rate = null;
  }
);

// Sincronizar importe y tipo (bidireccional)
watch(
  () => form.value.amount,
  (val) => {
    if (val == null) return;
    const current = ttypes.types.find((t) => t.id === form.value.transaction_type_id);
    const currentSlug = (current?.slug || '').toLowerCase();
    if (currentSlug === 'transfer') {
      // For transfers, keep amount positive
      if (val < 0) form.value.amount = Math.abs(val);
      return;
    }
    // If user already picked a type, enforce sign live
    if (currentSlug === 'expense' && val > 0) {
      form.value.amount = -Math.abs(val);
      return;
    }
    if (currentSlug === 'income' && val < 0) {
      form.value.amount = Math.abs(val);
      return;
    }
    if (val < 0) {
      const expense =
        ttypes.types.find((t) => (t.slug || '').toLowerCase() === 'expense') ||
        ttypes.types.find(
          (t) => t.name.toLowerCase().includes('egreso') || t.name.toLowerCase().includes('expense')
        );
      if (expense && form.value.transaction_type_id !== expense.id) {
        form.value.transaction_type_id = expense.id;
      }
    }
  }
);

watch(
  () => form.value.transaction_type_id,
  (id) => {
    if (!id || form.value.amount == null) return;
    const ty = ttypes.types.find((t) => t.id === id);
    const slug = (ty?.slug || '').toLowerCase();
    if (slug === 'expense' && form.value.amount > 0) {
      form.value.amount = -Math.abs(form.value.amount);
    }
    if (slug === 'income' && form.value.amount < 0) {
      form.value.amount = Math.abs(form.value.amount);
    }
  }
);

// Cargar tipos de transacción y preparar opciones radio (Ingreso, Egreso, Transferencia)
const ttOptions = ref<{ label: string; value: string }[]>([]);
// Cargar al montar el componente
void (async () => {
  try {
    await ttypes.fetchTransactionTypes();
    // Mapear a 3 opciones básicas según slugs definidos en backend
    const bySlug = (s: string) => ttypes.types.find((t) => (t.slug || '').toLowerCase() === s);
    const byName = (n: string) => ttypes.types.find((t) => t.name.toLowerCase().includes(n));
    const income = bySlug('income') || byName('income') || byName('ingreso');
    const expense = bySlug('expense') || byName('expense') || byName('egreso');
    const transfer = bySlug('transfer') || byName('transfer') || byName('transferencia');
    const opts: { label: string; value: string }[] = [];
    if (income) opts.push({ label: income.name, value: income.id });
    if (expense) opts.push({ label: expense.name, value: expense.id });
    if (transfer) opts.push({ label: transfer.name, value: transfer.id });
    ttOptions.value = opts;
    // Opcional: preseleccionar ingreso si existe y no hay selección
    if (!form.value.transaction_type_id && income) form.value.transaction_type_id = income.id;
  } catch (e) {
    console.error('Error cargando tipos de transacción', e);
  }
})();
</script>

<!-- contenido original de UserHome -->
