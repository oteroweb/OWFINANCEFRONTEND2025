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
    <q-dialog v-model="showDialog" @update:model-value="onShowDialog">
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
              option-label="name"
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
            <!-- Dialog for adding new account -->
            <q-dialog v-model="showAddAccountDialog">
              <q-card style="min-width: 300px">
                <q-card-section>
                  <div class="text-h6">Nueva Cuenta</div>
                </q-card-section>
                <q-card-section>
                  <q-input v-model="newAccountName" label="Nombre de la Cuenta" filled dense />
                </q-card-section>
                <q-card-actions align="right">
                  <q-btn
                    flat
                    label="Cancelar"
                    color="secondary"
                    v-close-popup
                    @click="showAddAccountDialog = false"
                  />
                  <q-btn flat label="Agregar" color="primary" @click="addAccount()" />
                </q-card-actions>
              </q-card>
            </q-dialog>
            <q-input
              v-model.number="form.amount"
              label="Importe"
              type="number"
              filled
              dense
              class="q-mt-sm"
            />
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
  </q-page>
</template>

<script setup lang="ts">
function providerLabel(p: { name?: string; address?: string }) {
  if (!p) return '';
  if (p.name && p.address) return `${p.name} (${p.address})`;
  return p.name || '';
}
import { ref } from 'vue';
import { useAuthStore } from 'stores/auth';
import { useTransactionsStore } from 'stores/transactions';
import type { Transaction } from 'stores/transactions';
import { useQuasar } from 'quasar';
import { api } from 'boot/axios';

const auth = useAuthStore();
const tsStore = useTransactionsStore();
const $q = useQuasar();
const showDialog = ref(false);
const showAddProviderDialog = ref(false);

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

// Options
const providerOptions = ref<Array<{ id: number; name: string; user_id?: number | null }>>([]);
const allProviders = ref<typeof providerOptions.value>([]);
const accountOptions = ref<Array<{ id: number; name: string; user_id?: number | null }>>([]);
const allAccounts = ref<typeof accountOptions.value>([]);
// Lógica para agregar cuenta
const showAddAccountDialog = ref(false);
const newAccountName = ref('');
async function addAccount() {
  try {
    const resp = await api.post('/accounts', {
      name: newAccountName.value,
      user_id: auth.user?.id,
    });
    const newAcc = resp.data.data || resp.data;
    form.value.account_id = newAcc.id;
    accountsLoaded = false;
    await ensureAccountsLoaded();
    return newAcc;
  } catch {
    $q.notify({ type: 'negative', message: 'Error al crear cuenta' });
  } finally {
    showAddAccountDialog.value = false;
    newAccountName.value = '';
  }
}
function triggerAddAccountDialog(val: string) {
  newAccountName.value = val;
  showAddAccountDialog.value = true;
}

// Function to load providers and accounts
async function loadProviderOptions() {
  try {
    const [pRes] = await Promise.all([
      api.get('/providers', { params: { user_id: auth.user?.id } }),
    ]);
    type Provider = { id: number; name: string; user_id?: number | null };
    const fetchedProviders = (pRes.data.data || pRes.data) as Provider[];
    allProviders.value = fetchedProviders || [];
    providerOptions.value = fetchedProviders || [];
  } catch (err) {
    $q.notify({ type: 'negative', message: 'Error cargando proveedores o cuentas' });
    allProviders.value = [];
    providerOptions.value = [];
    allAccounts.value = [];
    accountOptions.value = [];
    console.error('loadProviderOptions error', err);
  }
}

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
      type Account = { id: number; name: string; user_id?: number | null };
      const fetched = (aRes.data.data || aRes.data) as Account[];
      allAccounts.value = fetched || [];
      accountOptions.value = fetched || [];
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
  const payload = { ...form.value, date: dateStr };
  delete payload.datetime;
  tsStore
    .addTransaction(payload as unknown as Omit<Transaction, 'id'>)
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
    await loadProviderOptions();
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
</script>

<!-- contenido original de UserHome -->
