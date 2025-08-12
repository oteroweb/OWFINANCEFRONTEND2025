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
              option-value="id"
              option-label="name"
              emit-value
              map-options
              label="Proveedor"
              filled
              dense
              class="q-mt-sm"
              use-input
              clearable
              input-debounce="300"
            >
              <template v-slot:append>
                <q-btn flat dense icon="add" @click.stop="showAddProviderDialog = true" />
              </template>
            </q-select>
            <q-input v-model="form.name" label="Concepto" filled dense class="q-mt-sm" />
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
            <q-input
              v-model.number="form.amount"
              label="Importe"
              type="number"
              filled
              dense
              class="q-mt-sm"
            />
            <q-checkbox v-model="form.amount_tax" label="Incluir Impuesto" class="q-mt-sm" />
            <q-select
              v-model="form.account_id"
              :options="accountOptions"
              option-value="id"
              option-label="name"
              label="Cuenta"
              filled
              dense
              class="q-mt-sm"
            />
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
import { ref, onMounted } from 'vue';
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
  date: string;
  time: string;
  provider_id: number | null;
  account_id: number | null;
  url_file: string;
}
const initialForm = (): TransactionForm => ({
  name: '',
  amount: null,
  amount_tax: false,
  date: new Date().toISOString().slice(0, 10),
  time: new Date().toTimeString().slice(0, 5),
  provider_id: null,
  account_id: null,
  url_file: '',
});
const form = ref<TransactionForm>(initialForm());

// New provider name
const newProviderName = ref('');
const newProviderAddress = ref('');

// Options
const providerOptions = ref<Array<{ id: number; name: string; user_id?: number | null }>>([]);
const accountOptions = ref<{ id: number; name: string }[]>([]);

// Function to load providers and accounts
async function loadOptions() {
  const [pRes, aRes] = await Promise.all([api.get('/providers'), api.get('/accounts')]);
  type Provider = { id: number; name: string; user_id?: number | null };
  const allProviders = (pRes.data.data || pRes.data) as Provider[];
  providerOptions.value = allProviders.filter((p) => p.user_id === auth.user?.id);
  accountOptions.value = aRes.data.data || aRes.data;
}

// On mount, load options
onMounted(loadOptions);

function saveTransaction() {
  // Aquí agregamos la transacción
  const payload = { ...form.value, date: form.value.date + ' ' + form.value.time + ':00' };
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
    await loadOptions();
    return newProv;
  } catch {
    $q.notify({ type: 'negative', message: 'Error al crear proveedor' });
  } finally {
    showAddProviderDialog.value = false;
    newProviderName.value = '';
    newProviderAddress.value = '';
  }
}
</script>

<!-- contenido original de UserHome -->
