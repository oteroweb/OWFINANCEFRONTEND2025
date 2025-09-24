<template>
  <q-dialog
    v-model="modelValue"
    persistent
    maximized
    transition-show="jump-down"
    transition-hide="jump-up"
  >
    <q-card class="column fit">
      <q-bar class="q-pa-sm bg-primary text-white">
        <div class="text-subtitle2">Editar Transacción</div>
        <q-space />
        <q-btn dense flat icon="refresh" @click="reloadLists" :disable="saving" />
        <q-btn dense flat icon="close" @click="close" />
      </q-bar>
      <q-card-section class="q-gutter-md scroll">
        <div class="row q-col-gutter-md">
          <div class="col-12">
            <q-option-group
              v-model="form.transaction_type_id"
              :options="ttOptions"
              inline
              color="primary"
              label="Tipo"
            />
          </div>
          <div class="col-12 col-md-4">
            <q-input v-model="form.name" label="Nombre" outlined dense />
          </div>
          <div class="col-12 col-md-4">
            <q-input v-model.number="form.amount" type="number" label="Monto" outlined dense />
          </div>
          <div class="col-12 col-md-4">
            <q-input v-model="form.datetime" type="datetime-local" label="Fecha" outlined dense />
          </div>
          <div v-if="!isTransfer" class="col-12 col-md-6">
            <q-select
              v-model="form.account_id"
              :options="accountOptions"
              option-value="id"
              :option-label="accountLabel"
              use-input
              input-debounce="300"
              @filter="onAccountFilter"
              label="Cuenta"
              outlined
              dense
              emit-value
              map-options
            />
          </div>
          <div v-else class="col-12 col-md-6">
            <q-select
              v-model="form.account_from_id"
              :options="accountOptions"
              option-value="id"
              :option-label="accountLabel"
              use-input
              input-debounce="300"
              @filter="onAccountFilter"
              label="Cuentxa Origen"
              outlined
              dense
              emit-value
              map-options
            />
          </div>
          <div v-if="isTransfer" class="col-12 col-md-6">
            <q-select
              v-model="form.account_to_id"
              :options="accountOptions"
              option-value="id"
              :option-label="accountLabel"
              use-input
              input-debounce="300"
              @filter="onAccountFilter"
              label="Cuenta Destino"
              outlined
              dense
              emit-value
              map-options
            />
          </div>
          <div class="col-12 col-md-6">
            <q-select
              v-model="form.provider_id"
              :options="providerOptions"
              option-value="id"
              :option-label="providerLabel"
              use-input
              input-debounce="300"
              @filter="onProviderFilter"
              label="Proveedor"
              outlined
              dense
              emit-value
              map-options
            />
          </div>
          <div v-if="showRateInput" class="col-12 col-md-6">
            <q-input v-model.number="form.rate" type="number" :label="rateLabel" outlined dense />
          </div>
          <div class="col-12 col-md-6">
            <q-banner dense class="bg-grey-2 text-dark q-pa-sm">
              <div class="text-caption">Balance actual / después</div>
              <div class="text-body2">
                {{ previewBalance.currentDisplay }} ➜ {{ previewBalance.afterDisplay }}
              </div>
            </q-banner>
          </div>
          <div class="col-12">
            <q-toggle v-model="includeInBalance" label="Incluir en balance de cuentas" dense />
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" color="primary" @click="close" />
        <q-btn unelevated label="Guardar" color="primary" :loading="saving" @click="persist" />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useUiStore } from 'stores/ui';
import { useTransactionsStore } from 'stores/transactions';
import { useTransactionForm } from 'src/composables/useTransactionForm';

const ui = useUiStore();
const txStore = useTransactionsStore();

const modelValue = computed({
  get: () => ui.showDialogEditTransaction,
  set: (v: boolean) => (ui.showDialogEditTransaction = v),
});

const saving = ref(false);

const {
  form,
  ttOptions,
  loadTransactionTypes,
  providerOptions,
  providerLabel,
  onProviderFilter,
  ensureProvidersLoaded,
  reloadProviders,
  accountOptions,
  accountLabel,
  onAccountFilter,
  ensureAccountsLoaded,
  reloadAccounts,
  isTransfer,
  showRateInput,
  rateLabel,
  previewBalance,
  loadFromTransaction,
  saveUpdate,
  includeInBalance,
} = useTransactionForm();

watch(
  () => ui.editTransactionId,
  (id) => {
    if (!id) return;
    const tx = txStore.transactions.find((t) => t.id === id);
    if (tx) loadFromTransaction(tx as any);
  },
  { immediate: true }
);

async function persist() {
  if (saving.value) return;
  saving.value = true;
  try {
    await saveUpdate();
    close();
  } catch (e) {
    console.error(e);
  } finally {
    saving.value = false;
  }
}

function close() {
  modelValue.value = false;
}

function reloadLists() {
  reloadProviders();
  reloadAccounts();
  void loadTransactionTypes();
}

void loadTransactionTypes();
void ensureProvidersLoaded();
void ensureAccountsLoaded();
</script>
