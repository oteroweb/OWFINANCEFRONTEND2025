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
            
            <q-input
              v-model.number="form.amount"
              label="Importe"
              type="number"
              filled
              dense
              class="q-mt-sm"
            />
            <div class="row items-center q-pt-sm">
              <div class="col">
                Saldo actual: {{ currencySymbol }}{{ Number(currentBalance).toFixed(2) }}
              </div>
              <div class="col text-right">
                Saldo después: {{ currencySymbol }}{{ Number(newBalance).toFixed(2) }}
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
            v-model="newAccountType"
            :options="accountTypeOptions"
            label="Tipo de Cuenta"
            filled
            dense
            class="q-mt-sm"
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
import { ref, computed } from 'vue';
import { useAuthStore } from 'stores/auth';
import { useTransactionsStore } from 'stores/transactions';
import type { Transaction } from 'stores/transactions';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';
// inline account dialog instead of external component

const auth = useAuthStore();
const tsStore = useTransactionsStore();
const $q = useQuasar();
const showDialog = ref(false);
const showAddProviderDialog = ref(false);
// Diálogo de nueva cuenta
const showAddAccountDialog = ref(false);
const accountTypeOptions = ref([
  { label: 'Ahorro', value: 'savings' },
  { label: 'Corriente', value: 'checking' },
  { label: 'Inversión', value: 'investment' },
]);
// Guardar el texto ingresado cuando no hay opción
const lastAccountName = ref('');
// Campos para el diálogo inline de cuenta
const newAccountName = ref('');
const newAccountInitial = ref<number | null>(null);
const newAccountType = ref('');

// Transaction form state
interface TransactionForm {
  id?: number;
  name: string;
  amount: number | null;
  amount_tax: boolean;
  datetime: string;
  provider_id: number | null;
  account_id: number | null;
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

// Saldo actual y después de transacción (se resta monto)
const currentBalance = computed<number>(() => {
  const acc = allAccounts.value.find((a) => a.id === form.value.account_id!);
  return acc?.balance ?? 0;
});
const newBalance = computed<number>(() => currentBalance.value - (form.value.amount || 0));
// Símbolo de moneda actual para saldos
const currencySymbol = computed<string>(() => {
  const acc = allAccounts.value.find((a) => a.id === form.value.account_id!);
  return acc?.currencySymbol ?? '';
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
        currency: { code: string; symbol: string };
      }
      const fetched = (aRes.data.data || aRes.data) as ApiAccount[];
      const mapped = fetched.map((item) => ({
        id: item.id,
        name: item.name,
        balance: item.initial ?? 0,
        // Garantizar que user_id sea number o null, no undefined
        user_id: item.user_id ?? null,
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

// Ya no se usa onShowDialog ni optionsLoaded, la carga es por focus en el select

function saveTransaction() {
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
    const resp = await api.post('/accounts', {
      name: (newAccountName.value && newAccountName.value.trim()) || lastAccountName.value,
      initial: newAccountInitial.value ?? 0,
      user_id: auth.user?.id,
      // type: newAccountType.value, // habilitar si backend lo soporta
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
    newAccountType.value = '';
  }
}

// (limpieza) fin de helpers de cuentas
</script>

<!-- contenido original de UserHome -->
