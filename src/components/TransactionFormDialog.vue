<template>
  <q-dialog
    v-model="modelValue"
    persistent
    :maximized="isUpdate"
    transition-show="jump-down"
    transition-hide="jump-up"
  >
    <q-card :class="isUpdate ? 'column fit' : ''" :style="!isUpdate ? cardStyle : undefined">
      <q-bar class="q-pa-sm bg-primary text-white">
        <div class="text-subtitle2">
          {{ isUpdate ? 'Editar Transacción' : 'Nueva Transacción' }}
        </div>
        <q-space />
        <q-btn dense flat icon="refresh" @click="reloadLists" :disable="saving" />
        <q-btn dense flat icon="close" @click="close" />
      </q-bar>
      <q-card-section class="q-gutter-md" :class="isUpdate ? 'scroll' : ''">
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
              label="Cuenta Origen"
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
          <div class="col-12">
            <q-input v-model="form.url_file" label="Archivo (URL)" outlined dense />
          </div>
          <div class="col-12 col-md-6">
            <div class="text-caption q-mb-xs text-grey-6">Categoría</div>
            <CategorySelector v-model="form.category_id" allow-null placeholder="Sin categoría" />
            <AnchoredJarChip :category-id="form.category_id" class="q-mt-sm" />
          </div>
        </div>
      </q-card-section>
      <q-separator />
      <q-card-actions align="right" class="q-pa-md">
        <q-btn flat label="Cancelar" color="primary" @click="close" />
        <q-btn
          unelevated
          :label="isUpdate ? 'Guardar' : 'Crear'"
          color="primary"
          :loading="saving"
          @click="persist"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useQuasar } from 'quasar';
import { useTransactionsStore, type Transaction } from 'stores/transactions';
import { useUiStore } from 'stores/ui';
import { useTransactionForm } from 'src/composables/useTransactionForm';
import AnchoredJarChip from 'src/components/AnchoredJarChip.vue';
import CategorySelector from 'src/components/CategorySelector.vue';
import { loadCategoriesWithJars, loadUserJars } from 'src/utils/txCatalog';

// v-model for visibility
const modelValue = defineModel<boolean>({ required: true });

// Optional id to switch to update mode
const props = defineProps<{ id?: number | null }>();

const $q = useQuasar();
const ui = useUiStore();
const txStore = useTransactionsStore();

const isUpdate = computed(() => typeof props.id === 'number' && Number.isFinite(props.id));

// Keep the same default size as the previous create dialog when not maximized
const cardStyle = computed(() => 'min-width: 430px; max-width: 860px');

const saving = ref(false);

const {
  form,
  includeInBalance,
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
  reset,
  saveCreate,
  saveUpdate,
} = useTransactionForm();



// Load data when opening
watch(
  () => modelValue.value,
  (open) => {
    if (!open) return;
    void loadTransactionTypes();
    void ensureProvidersLoaded();
    void ensureAccountsLoaded();
    void Promise.all([loadCategoriesWithJars(), loadUserJars()]);
    if (isUpdate.value && props.id) {
      const tx = txStore.transactions.find((t) => t.id === props.id) as Transaction | undefined;
      if (tx) loadFromTransaction(tx);
    } else {
      // reset form on create
      reset();
      includeInBalance.value = true;
    }
  },
  { immediate: true }
);

async function persist() {
  if (saving.value) return;
  saving.value = true;
  try {
    if (isUpdate.value) await saveUpdate();
    else await saveCreate();
    // Notificar a la app para refrescar vistas relacionadas
    const affected: Array<number | null | undefined> = [
      form.value.account_id,
      form.value.account_from_id,
      form.value.account_to_id,
    ];
    const ids = Array.from(new Set(affected.filter((v): v is number => typeof v === 'number')));
    if (ids.length) {
      window.dispatchEvent(
        new CustomEvent('ow:transactions:changed', {
          detail: { account_ids: ids, reason: isUpdate.value ? 'update' : 'create' },
        })
      );
    } else {
      window.dispatchEvent(
        new CustomEvent('ow:transactions:changed', {
          detail: { reason: isUpdate.value ? 'update' : 'create' },
        })
      );
    }
    $q.notify({
      type: 'positive',
      message: isUpdate.value ? 'Transacción actualizada' : 'Transacción creada',
    });
    close();
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error al guardar';
    $q.notify({ type: 'negative', message: msg });
  } finally {
    saving.value = false;
  }
}

function close() {
  modelValue.value = false;
  // Mantener compat con ui store por si estaba enlazado
  if (isUpdate.value) ui.showDialogEditTransaction = false;
  else ui.showDialogNewTransaction = false;
}

function reloadLists() {
  reloadProviders();
  reloadAccounts();
  void loadTransactionTypes();
}
</script>

<script lang="ts">
// Reutilizable para traducir errores simples cuando este diálogo se use para guardar.
export function translateSimpleTransactionError(raw: string): string {
  const map: Record<string, string> = { name: 'Concepto', amount: 'Monto' };
  let out = raw;
  Object.entries(map).forEach(([k, label]) => {
    const r = new RegExp(`\\b${k}\\b.*is required`, 'i');
    if (r.test(raw)) out = out.replace(r, `${label} es requerido`);
  });
  if (/incorrect params/i.test(raw)) {
    const already = /es requerido/.test(out);
    if (already) return out.replace(/incorrect params/i, 'Parámetros incorrectos');
    return `Parámetros incorrectos. ${out}`;
  }
  return out;
}

import { defineComponent } from 'vue';
export default defineComponent({ name: 'TransactionFormDialog' });
</script>
