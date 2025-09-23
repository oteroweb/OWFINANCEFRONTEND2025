<template>
  <q-dialog v-model="ui.showDialogNewTransaction" @hide="resetForm">
    <q-card :style="cardStyle" class="q-pa-sm">
      <q-card-section class="q-pt-none">
        <div class="row items-center">
          <div class="col">
            <div class="text-h6"></div>
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

          <!-- Categoría de la transacción (simple: lista plana de todas las categorías) -->
          <div v-if="!isTransfer && !isAdvancedAmount" class="row q-col-gutter-sm q-mt-sm">
            <div class="col">
              <q-select
                v-model="simpleCategoryId"
                :options="txnCategoryOptions"
                :onFilter="onTxnCategoryFilter"
                option-value="id"
                option-label="name"
                emit-value
                map-options
                filled
                dense
                use-input
                clearable
                input-debounce="300"
                label="Categoría"
                @focus="ensureTxnCategoriesLoaded"
              />
            </div>
            <div class="col-auto">
              <q-btn dense outline color="primary" label="Ver todas" @click="openTxnCatsDialog" />
            </div>
          </div>

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
            <div class="row items-center">
              <div class="col">
                <q-toggle
                  v-model="isAdvancedPayment"
                  label="Pago avanzado (múltiples cuentas)"
                  dense
                />
              </div>
            </div>
            <div v-if="!isAdvancedPayment">
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
                  <q-spinner v-if="loadingCurrent" size="14px" class="q-mr-xs" />
                  Saldo actual: {{ currencySymbol }}{{ Number(currentBalance).toFixed(2) }}
                </div>
                <div class="col text-right">
                  <template v-if="needsRateForAccountBalance"
                    >Saldo después: requiere tasa</template
                  >
                  <template v-else
                    >Saldo después: {{ currencySymbol
                    }}{{ Number(newBalance).toFixed(2) }}</template
                  >
                </div>
              </div>
            </div>

            <!-- Advanced Payments -->
            <div v-else class="q-mt-sm">
              <q-markup-table dense flat bordered>
                <thead>
                  <tr class="text-caption">
                    <th style="width: 26%">Cuenta</th>
                    <th style="width: 16%">Monto</th>
                    <th style="width: 18%">Tasa</th>
                    <th style="width: 20%">Impuesto</th>
                    <th style="width: 12%">Resultado</th>
                    <th style="width: 8%"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(p, i) in payments" :key="i" class="text-caption">
                    <td>
                      <q-select
                        :key="'pay-acc-' + i + '-' + paymentsAccountsKey"
                        v-model="p.account_id"
                        :options="paymentRowOptions[i] || paymentAccountOptions(i)"
                        :onFilter="(val, done) => onPaymentAccountFilter(i, val, done)"
                        option-value="id"
                        :option-label="accountLabel"
                        emit-value
                        map-options
                        dense
                        filled
                        use-input
                        clearable
                        input-debounce="300"
                        label="Cuenta"
                        @focus="ensureAccountsLoaded"
                      />
                    </td>
                    <td>
                      <q-input v-model.number="p.amount" type="number" step="0.01" dense filled />
                    </td>
                    <td>
                      <div class="row items-center no-wrap">
                        <div class="col">
                          <q-input
                            v-model.number="p.rate"
                            type="number"
                            step="0.0001"
                            dense
                            filled
                            :label="rowRateLabel(p)"
                            :disable="!rowNeedsRate(p)"
                          />
                        </div>
                      </div>
                    </td>
                    <td>
                      <div class="row items-center q-col-gutter-xs">
                        <div class="col-auto">
                          <q-checkbox v-model="p.applyTax" dense />
                        </div>
                        <div class="col">
                          <q-select
                            v-model="p.tax_id"
                            :options="taxSelectOptions"
                            option-value="id"
                            option-label="name"
                            emit-value
                            map-options
                            dense
                            filled
                            clearable
                            :disable="!p.applyTax"
                            label="Impuesto"
                          />
                        </div>
                      </div>
                    </td>
                    <td class="text-right">
                      {{ Number(rowTotalBase(p)).toFixed(2) }}
                    </td>
                    <td>
                      <q-btn
                        flat
                        dense
                        round
                        icon="close"
                        color="negative"
                        @click="removePayment(i)"
                      />
                    </td>
                  </tr>
                </tbody>
              </q-markup-table>
              <div class="row items-center q-mt-xs">
                <div class="col-auto">
                  <q-btn dense flat icon="add" label="Agregar pago" @click="addPayment" />
                </div>
                <div class="col text-right text-caption">
                  <div>
                    Total pagos ({{ userCurrencyCode || 'Base' }}):
                    {{ Number(paymentsTotalBase).toFixed(2) }}
                  </div>
                  <div v-if="paymentsMismatch" class="text-negative">
                    Debe coincidir con el monto absoluto ({{
                      Math.abs(Number(form.amount || 0)).toFixed(2)
                    }})
                  </div>
                </div>
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
                <q-spinner v-if="loadingCurrent" size="14px" class="q-mr-xs" />
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
                <q-spinner v-if="loadingDest" size="14px" class="q-mr-xs" />
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
              <div>Importe: {{ originCurrencySymbol }}{{ Number(form.amount).toFixed(2) }}</div>
              <div>
                De: {{ originAccount?.name || '—' }} ({{ originAccount?.currencyCode || '—' }}) → A:
                {{ destAccount?.name || '—' }} ({{ destAccount?.currencyCode || '—' }})
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

          <!-- Incluir en balance -->
          <div class="row q-mt-xs">
            <div class="col">
              <q-toggle v-model="includeInBalance" label="Incluir en balance de cuentas" dense />
            </div>
          </div>

          <!-- Archivo URL -->
          <div class="row q-col-gutter-sm q-mt-sm">
            <div class="col-12">
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
                  <th style="width: 22%">Categoría</th>
                  <th style="width: 28%">Producto</th>
                  <th style="width: 10%">Cant</th>
                  <th style="width: 15%">Monto</th>
                  <th style="width: 10%">Exento</th>
                  <th style="width: 10%">Total</th>
                  <th style="width: 5%"></th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, i) in invoiceItems" :key="i" class="text-caption">
                  <td>
                    <q-select
                      v-model="row.categoryId"
                      :options="itemCategoryOptions"
                      :onFilter="onItemCategoryFilter"
                      option-value="id"
                      option-label="name"
                      emit-value
                      map-options
                      dense
                      filled
                      use-input
                      clearable
                      input-debounce="300"
                      label="Categoría"
                      @focus="ensureItemCategoriesLoaded"
                    />
                  </td>
                  <td><q-input v-model="row.item" dense filled label="Producto" /></td>
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
                  <td class="text-center">
                    <q-checkbox v-model="row.exempt" dense @update:model-value="onToggleExempt" />
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
                <div>Subtotal (sin IVA): {{ Number(invoiceBaseSubtotal).toFixed(2) }}</div>
                <div>
                  Impuesto
                  <span v-if="iva16">(IVA {{ Number(iva16.percent).toFixed(0) }}%)</span>:
                  {{ Number(invoiceTaxTotal).toFixed(2) }}
                </div>
                <div>Subtotal con IVA: {{ Number(invoiceSubtotal).toFixed(2) }}</div>
              </div>
            </div>
            <div class="row q-mt-xs">
              <div class="col text-right text-negative text-caption" v-if="advancedMismatch">
                El subtotal ({{ Number(invoiceSubtotal).toFixed(2) }}) no coincide con el monto ({{
                  Math.abs(Number(form.amount || 0)).toFixed(2)
                }}).
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
            <q-btn
              color="primary"
              label="Guardar"
              type="submit"
              :disable="isSaveDisabled || (isAdvancedPayment && paymentsMismatch)"
            />
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
        <q-input
          v-model="newProviderName"
          label="Nombre"
          dense
          filled
          class="q-mb-sm"
          :error="!!providerErrors.name"
          :error-message="providerErrors.name ? providerErrors.name.join(', ') : ''"
          :disable="providerSaving"
        />
        <q-input
          v-model="newProviderAddress"
          label="Dirección"
          dense
          filled
          :error="!!providerErrors.address"
          :error-message="providerErrors.address ? providerErrors.address.join(', ') : ''"
          :disable="providerSaving"
        />
      </q-card-section>
      <q-separator />
      <q-card-actions align="right">
        <q-btn
          flat
          label="Cancelar"
          v-close-popup
          @click="resetProviderDialog"
          :disable="providerSaving"
        />
        <q-btn
          color="primary"
          label="Guardar"
          @click="addProvider"
          :loading="providerSaving"
          :disable="providerSaving"
        />
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

  <!-- Dialog: seleccionar categoría desde árbol -->
  <q-dialog v-model="showTxnCatsDialog">
    <q-card
      style="
        min-width: 520px;
        max-width: 880px;
        width: 90vw;
        height: 70vh;
        display: flex;
        flex-direction: column;
      "
    >
      <q-card-section class="row items-center q-pb-none">
        <div class="col text-h6">Seleccionar categoría</div>
        <div class="col-auto">
          <q-btn dense round flat icon="close" v-close-popup />
        </div>
      </q-card-section>
      <q-card-section class="q-pt-sm" style="flex: 1 1 auto; min-height: 300px">
        <CategoriesTree
          :readonly="true"
          :nodes="categoriesTreeNodes"
          @select-node="onCatsTreeSelect"
        />
      </q-card-section>
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
import CategoriesTree from './CategoriesTree.vue';
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
  // taxes removed (amount_tax per-items later)
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
  // taxes removed
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
// Flag para excluir la transacción del balance agregado de cuentas
const includeInBalance = ref(true);

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

// ----- Taxes (fetch only) -----
type Tax = { id: number; name: string; percent: number; active?: boolean };
const availableTaxes = ref<Tax[]>([]);
async function fetchAvailableTaxes() {
  try {
    const res = await api.get('/taxes', { params: { user_id: auth.user?.id, active: 1 } });
    const list = (res.data?.data || res.data) as Array<{
      id: number;
      name: string;
      percent: string | number;
      active?: boolean;
    }>;
    availableTaxes.value = (list || []).map((t) => ({
      id: t.id,
      name: t.name,
      percent: Number(t.percent),
      ...(typeof t.active === 'boolean' ? { active: t.active } : {}),
    }));
    // Optional: small debug note
    // console.debug('Impuestos cargados:', availableTaxes.value);
  } catch {
    $q.notify({ type: 'negative', message: 'Error cargando impuestos' });
    availableTaxes.value = [];
  }
}

// taxes deferred: UI and logic removed

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
const providerErrors = ref<Record<string, string[]>>({});
const providerSaving = ref(false);
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
  providerErrors.value = {};
}
async function addProvider() {
  providerErrors.value = {};
  // Front-end quick validation
  const nameTrim = newProviderName.value.trim();
  const addrTrim = newProviderAddress.value.trim();
  if (!nameTrim) providerErrors.value.name = ['El nombre es requerido'];
  else if (nameTrim.length < 2) providerErrors.value.name = ['Mínimo 2 caracteres'];
  if (!addrTrim) providerErrors.value.address = ['La dirección es requerida'];
  else if (addrTrim.length < 3) providerErrors.value.address = ['Mínimo 3 caracteres'];
  if (Object.keys(providerErrors.value).length) {
    $q.notify({ type: 'warning', message: 'Completa los campos requeridos' });
    return;
  }
  providerSaving.value = true;
  try {
    const resp = await api.post('/providers', {
      name: newProviderName.value.trim(),
      address: newProviderAddress.value.trim(),
      user_id: auth.user?.id,
    });
    const p = resp.data?.data || resp.data;
    form.value.provider_id = p.id;
    providersLoaded = false;
    await ensureProvidersLoaded();
    $q.notify({ type: 'positive', message: 'Proveedor creado' });
    resetProviderDialog();
    showAddProviderDialog.value = false;
  } catch (err) {
    let message = 'Error al crear proveedor';
    try {
      type ApiErrorData = {
        message?: string;
        errors?: Record<string, string[]>;
        data?: Record<string, string[]>;
      };
      type AxiosLikeError = { response?: { data?: ApiErrorData | undefined } };
      const e = err as AxiosLikeError;
      const data = e.response?.data;
      if (data?.message) message = data.message;
      // Field errors may come in data.data or data.errors
      const fieldErrors: Record<string, string[]> = data?.data || data?.errors || {};
      if (fieldErrors && typeof fieldErrors === 'object') {
        providerErrors.value = fieldErrors;
        const flat: string[] = [];
        Object.keys(fieldErrors).forEach((k) => {
          const arr = fieldErrors[k];
          if (Array.isArray(arr)) arr.forEach((m) => flat.push(`${k}: ${m}`));
        });
        if (flat.length) message = `${message}. ${flat.join(' | ')}`;
      }
    } catch {
      /* ignore */
    }
    $q.notify({ type: 'negative', message });
  } finally {
    providerSaving.value = false;
  }
}
function resetProviderDialog() {
  newProviderName.value = '';
  newProviderAddress.value = '';
  providerErrors.value = {};
  providerSaving.value = false;
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
    type ApiCurrency = { id?: number; code?: string; symbol?: string };
    type ApiAccount = {
      id: number;
      name: string;
      initial?: number;
      balance?: number;
      current_balance?: number;
      saldo?: number;
      currency?: ApiCurrency;
    };
    const fetched = (res.data.data || res.data) as ApiAccount[];
    const mapped = (fetched || []).map((a) => {
      const rawBal =
        a.balance ??
        a.current_balance ??
        a.saldo ??
        (typeof a.initial === 'number' ? a.initial : 0);
      const cur: ApiCurrency = a.currency || {};
      return {
        id: a.id,
        name: a.name,
        balance: Number(rawBal || 0),
        currencyId: typeof cur.id === 'number' ? cur.id : null,
        currencyCode: cur.code || '',
        currencySymbol: cur.symbol || '',
      } as AccountOption;
    });
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
type InvoiceRow = {
  item: string;
  quantity: number;
  unitPrice: number;
  categoryId?: number | null;
  exempt?: boolean; // Exento de IVA
};
const isAdvancedAmount = ref(false);
const invoiceItems = ref<InvoiceRow[]>([{ item: '', quantity: 1, unitPrice: 0, exempt: false }]);
function addInvoiceRow() {
  invoiceItems.value.push({ item: '', quantity: 1, unitPrice: 0, exempt: false });
}
function removeInvoiceRow(i: number) {
  invoiceItems.value.splice(i, 1);
  if (!invoiceItems.value.length)
    invoiceItems.value.push({ item: '', quantity: 1, unitPrice: 0, exempt: false });
}
function lineTotal(r: InvoiceRow) {
  const q = Number(r.quantity || 0);
  const u = Number(r.unitPrice || 0);
  const base = Number.isFinite(q) && Number.isFinite(u) ? q * u : 0;
  // If item is not exempt and IVA 16% exists, add tax
  if (!r.exempt && iva16.value) {
    const pct = Number(iva16.value.percent || 0) / 100;
    if (pct > 0) return base + base * pct;
  }
  return base;
}
const invoiceBaseSubtotal = computed(() =>
  invoiceItems.value.reduce((s, r) => {
    const q = Number(r.quantity || 0);
    const u = Number(r.unitPrice || 0);
    return s + (Number.isFinite(q) && Number.isFinite(u) ? q * u : 0);
  }, 0)
);
const invoiceTaxTotal = computed(() => {
  const taxPct = iva16.value ? Number(iva16.value.percent || 0) / 100 : 0;
  if (taxPct <= 0) return 0;
  return invoiceItems.value.reduce((s, r) => {
    if (r.exempt) return s;
    const q = Number(r.quantity || 0);
    const u = Number(r.unitPrice || 0);
    const base = Number.isFinite(q) && Number.isFinite(u) ? q * u : 0;
    return s + base * taxPct;
  }, 0);
});
const invoiceSubtotal = computed(() => invoiceBaseSubtotal.value + invoiceTaxTotal.value);
// Advanced mode behavior: do NOT modify amount automatically. Require equality to enable save.
const advancedMismatch = computed(() => {
  if (!isAdvancedAmount.value) return false;
  const amtAbs = Math.abs(Number(form.value.amount || 0));
  const sub = Number(invoiceSubtotal.value) || 0;
  return Number(amtAbs.toFixed(2)) !== Number(sub.toFixed(2));
});
const isSaveDisabled = computed(() => {
  if (isAdvancedAmount.value && advancedMismatch.value) return true;
  return false;
});

// Dynamic card size: widen when advanced (placed after isAdvancedAmount is declared)
const cardStyle = computed(() =>
  isAdvancedAmount.value
    ? 'min-width: 640px; max-width: 1100px'
    : 'min-width: 430px; max-width: 860px'
);

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
  if (!isTransfer.value && isAdvancedPayment.value) return false; // rate per-row in advanced payments
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

// taxes UI/logic removed for now
const needsRateForAccountBalance = computed(
  () => !isTransfer.value && showRateInput.value && !(Number(form.value.rate || 0) > 0)
);
const needsRateForDestBalance = computed(
  () => isTransfer.value && isCrossCurrency.value && !(Number(form.value.rate || 0) > 0)
);
// ----- Live Account Balances (fetch actual current balance per account) -----
// Estrategia: cache en memoria por id; se refresca al seleccionar la cuenta o abrir el diálogo.
// Ventajas: una sola llamada por cuenta (TTL corto configurable); evita traer todas las transacciones.
// Fallback: si aún no se ha obtenido el balance real se usa el valor cargado inicialmente.
interface CachedBalance {
  value: number;
  ts: number;
}
const accountBalanceCache = ref<Record<number, CachedBalance>>({});
const accountBalanceLoading = ref<Set<number>>(new Set());
const BALANCE_TTL_MS = 30_000; // 30s: ajustar según necesidad.

function baseAccountBalance(id: number | null | undefined) {
  if (!id) return 0;
  const acc = allAccounts.value.find((a) => a.id === id);
  return acc?.balance ?? 0;
}
function getCachedBalance(id: number | null | undefined) {
  if (!id) return 0;
  const cached = accountBalanceCache.value[id];
  if (cached) return cached.value;
  return baseAccountBalance(id);
}
const loadingCurrent = ref(false);
const loadingDest = ref(false);
async function fetchAccountBalance(id: number) {
  if (!id || accountBalanceLoading.value.has(id)) return;
  // Skip if cache fresh
  const existing = accountBalanceCache.value[id];
  if (existing && Date.now() - existing.ts < BALANCE_TTL_MS) return;
  accountBalanceLoading.value.add(id);
  try {
    // Se asume endpoint GET /accounts/{id} devuelve { id, name, balance, currency { code, symbol } }
    if (form.value.account_from_id === id || form.value.account_id === id)
      loadingCurrent.value = true;
    if (form.value.account_to_id === id) loadingDest.value = true;
    const resp = await api.get(`/accounts/${id}`, { params: { user_id: auth.user?.id } });
    const data = resp.data?.data || resp.data;
    const value = Number(data?.balance ?? data?.current_balance ?? data?.saldo ?? 0);
    accountBalanceCache.value = {
      ...accountBalanceCache.value,
      [id]: { value, ts: Date.now() },
    };
    // También actualizamos el listado base si existe para mantener consistencia visual en selects
    const idx = allAccounts.value.findIndex((a) => a.id === id);
    if (idx >= 0) {
      const prev = allAccounts.value[idx];
      if (prev) {
        allAccounts.value[idx] = {
          id: prev.id,
          name: prev.name,
          balance: value,
          currencyId: typeof prev.currencyId === 'number' ? prev.currencyId : null,
          currencyCode: prev.currencyCode || '',
          currencySymbol: prev.currencySymbol || '',
        };
      }
    }
  } catch (e) {
    // Silencioso; fallback a valor base.
    console.warn('No se pudo obtener balance actual de la cuenta', id, e);
  } finally {
    accountBalanceLoading.value.delete(id);
    if (form.value.account_from_id === id || form.value.account_id === id)
      loadingCurrent.value = false;
    if (form.value.account_to_id === id) loadingDest.value = false;
  }
}

// Disparar fetch al cambiar cuentas seleccionadas (simple y transfer)
watch(
  () => form.value.account_id,
  (id) => {
    if (id) void fetchAccountBalance(id);
  }
);
watch(
  () => form.value.account_from_id,
  (id) => {
    if (id) void fetchAccountBalance(id);
  }
);
watch(
  () => form.value.account_to_id,
  (id) => {
    if (id) void fetchAccountBalance(id);
  }
);
// También al abrir el diálogo (si ya viene preseleccionada)
watch(
  () => ui.showDialogNewTransaction,
  (open) => {
    if (!open) return;
    const ids = [
      form.value.account_id,
      form.value.account_from_id,
      form.value.account_to_id,
    ].filter((v): v is number => typeof v === 'number');
    ids.forEach((id) => void fetchAccountBalance(id));
  }
);

const currentBalance = computed(() => {
  const accId = isTransfer.value ? form.value.account_from_id : form.value.account_id;
  return getCachedBalance(accId);
});
const currencySymbol = computed(() => {
  const accId = isTransfer.value ? form.value.account_from_id : form.value.account_id;
  const acc = allAccounts.value.find((a) => a.id === accId);
  return acc?.currencySymbol || '';
});
const originCurrencySymbol = computed(() => originAccount.value?.currencySymbol || '');
const destCurrencySymbol = computed(() => destAccount.value?.currencySymbol || '');
const destCurrentBalance = computed(() => getCachedBalance(form.value.account_to_id));
const applyRateToTotal = computed(
  () => showRateInput.value && !!form.value.rate && Number(form.value.rate) > 0
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

// Projected balances after transaction
const newBalance = computed(() => {
  const amt = Number(form.value.amount || 0);
  const bal = Number(currentBalance.value || 0);
  const ty = ttypes.types.find((t: TransactionType) => t.id === form.value.transaction_type_id);
  const slug = (ty?.slug || '').toLowerCase();
  if (!includeInBalance.value) return bal; // si no se incluye, no altera preview
  if (slug === 'transfer') return bal - Math.abs(amt);
  if (slug === 'income') return bal + Math.abs(amt);
  if (slug === 'expense') return bal - Math.abs(amt);
  return bal;
});
const destNewBalance = computed(() => {
  if (!(form.value.account_to_id && form.value.amount != null)) return destCurrentBalance.value;
  const curr = destCurrentBalance.value;
  if (!includeInBalance.value) return curr; // la exclusión aplica también a destino
  if (!isCrossCurrency.value) return curr + Math.abs(Number(form.value.amount || 0));
  const r = Number(form.value.rate || 0);
  if (!(r > 0)) return curr; // needs rate
  return curr + Math.abs(Number(form.value.amount || 0)) * r;
});

// ----- Advanced Payments (multiple accounts) -----
type PaymentRow = {
  account_id: number | null;
  amount: number | null; // in account currency
  rate: number | null; // to user base currency when needed
  applyTax: boolean;
  tax_id: number | null;
  note?: string | null;
};
const isAdvancedPayment = ref(false);
const payments = ref<PaymentRow[]>([
  { account_id: null, amount: null, rate: null, applyTax: false, tax_id: null, note: null },
]);
const taxSelectOptions = computed(() =>
  (availableTaxes.value || []).map((t) => ({
    id: t.id,
    name: `${t.name} (${t.percent}%)`,
    percent: t.percent,
  }))
);
function addPayment() {
  payments.value.push({
    account_id: null,
    amount: null,
    rate: null,
    applyTax: false,
    tax_id: null,
    note: null,
  });
}
function removePayment(i: number) {
  payments.value.splice(i, 1);
  if (!payments.value.length) addPayment();
}
// reactive cleanups
watch(
  () => payments.value.map((p) => p.account_id),
  () => {
    // when a payment no longer needs a rate, clear it
    payments.value.forEach((p) => {
      if (!p) return;
      if (!rowNeedsRate(p)) p.rate = null;
    });
  }
);
watch(
  () => payments.value.map((p) => p.applyTax),
  () => {
    payments.value.forEach((p) => {
      if (!p) return;
      if (!p.applyTax) p.tax_id = null;
    });
  }
);
function rowAccount(i: number | PaymentRow) {
  const accId = typeof i === 'number' ? payments.value[i]?.account_id : i.account_id;
  return allAccounts.value.find((a) => a.id === accId) || null;
}
function paymentAccountOptions(index: number) {
  const chosenIds = new Set<number>(
    payments.value
      .map((p, i) => (i === index ? null : p?.account_id))
      .filter((v): v is number => typeof v === 'number')
  );
  return allAccounts.value.filter((a) => !chosenIds.has(a.id));
}
function rowNeedsRate(p: PaymentRow) {
  const acc = rowAccount(p);
  const uid = userCurrencyId.value;
  const aid = acc?.currencyId ?? null;
  if (uid && aid) return uid !== aid;
  const ucode = userCurrencyCode.value;
  const acode = acc?.currencyCode;
  if (ucode && acode) return ucode !== acode;
  return false;
}
function rowRateLabel(p: PaymentRow) {
  const acc = rowAccount(p);
  const from = acc?.currencyCode || 'Cuenta';
  const to = userCurrencyCode.value || 'Usuario';
  return `Tasa (${from}→${to})`;
}
function rowTaxPercent(p: PaymentRow): number {
  if (!p.applyTax || !p.tax_id) return 0;
  const tax = availableTaxes.value.find((t) => t.id === p.tax_id);
  return tax ? Number(tax.percent || 0) : 0;
}
function rowTotalBase(p: PaymentRow): number {
  const amt = Math.abs(Number(p.amount || 0));
  if (!Number.isFinite(amt) || amt <= 0) return 0;
  const pct = rowTaxPercent(p);
  const withTax = amt * (1 + pct / 100);
  const needs = rowNeedsRate(p);
  const r = needs ? Number(p.rate || 0) : 1;
  if (needs && !(r > 0)) return 0;
  return withTax * r;
}
const paymentsTotalBase = computed(() => payments.value.reduce((s, p) => s + rowTotalBase(p), 0));
const paymentsMismatch = computed(() => {
  const target = Math.abs(Number(form.value.amount || 0));
  return Number(paymentsTotalBase.value.toFixed(2)) !== Number(target.toFixed(2));
});
// key to force per-row select refresh when selected accounts set changes
const paymentsAccountsKey = computed(() =>
  payments.value.map((p) => (typeof p?.account_id === 'number' ? p.account_id : 'n')).join('|')
);
// per-row options cache for filtering
const paymentRowOptions = ref<Record<number, AccountOption[]>>({});
function onPaymentAccountFilter(index: number, val: string, done: (cb: () => void) => void) {
  const needle = (val || '').toLowerCase();
  const base = paymentAccountOptions(index);
  const filtered = !needle
    ? base
    : base.filter((a) => {
        const name = (a.name || '').toLowerCase();
        const code = (a.currencyCode || '').toLowerCase();
        return name.includes(needle) || code.includes(needle);
      });
  done(() => {
    paymentRowOptions.value = { ...paymentRowOptions.value, [index]: filtered };
  });
}
watch(
  () => paymentsAccountsKey.value,
  () => {
    // clear caches so options recompute after account changes
    paymentRowOptions.value = {};
  }
);

// ----- Item categories (for invoice rows) -----
type ItemCategory = { id: number; name: string };
const itemCategoryOptions = ref<ItemCategory[]>([]);
const allItemCategories = ref<ItemCategory[]>([]);
let itemCategoriesLoaded = false;
const simpleCategoryId = ref<number | null>(null);
async function ensureItemCategoriesLoaded() {
  if (itemCategoriesLoaded) return;
  try {
    const res = await api.get('/item_categories', {
      params: { order_by: 'name', order_dir: 'asc' },
    });
    const data = (res.data?.data || res.data) as ItemCategory[];
    allItemCategories.value = data || [];
    itemCategoryOptions.value = data || [];
    itemCategoriesLoaded = true;
  } catch {
    $q.notify({ type: 'negative', message: 'Error cargando categorías de item' });
    itemCategoriesLoaded = false;
  }
}
function onItemCategoryFilter(val: string, done: (cb: () => void) => void) {
  const needle = (val || '').toLowerCase();
  done(() => {
    itemCategoryOptions.value = !needle
      ? allItemCategories.value
      : allItemCategories.value.filter((o) => (o.name || '').toLowerCase().includes(needle));
  });
}

// ----- Transaction categories (categories tree for simple selector) -----
type TxnCategoryNode = {
  id: number | string;
  name: string;
  type?: 'folder' | 'category';
  children?: TxnCategoryNode[];
};
type TxnCategoryOption = {
  id: number | string;
  name: string;
  rawName?: string;
};
const allTxnCategoriesTree = ref<TxnCategoryNode[] | null>(null);
const allTxnCategoriesFlat = ref<TxnCategoryOption[]>([]);
const txnCategoryOptions = ref<TxnCategoryOption[]>([]);

async function ensureTxnCategoriesLoaded() {
  if (allTxnCategoriesTree.value) return;
  try {
    // Use the categories tree with user_id and flatten as: "Nombre (Padre)"
    const res = await api.get('/categories/tree', { params: { user_id: auth.user?.id } });
    // Shape example from backend: { status, code, data: { nodes: [...] } }
    const pickNodes = (v: unknown): unknown => {
      const obj = safeObj(v);
      if (obj) {
        const data = safeObj((obj as { data?: unknown }).data);
        const dataNodes = data ? (data as { nodes?: unknown }).nodes : undefined;
        if (Array.isArray(dataNodes)) return dataNodes;
        const nodes = (obj as { nodes?: unknown }).nodes;
        if (Array.isArray(nodes)) return nodes;
      }
      return [];
    };
    const nodesUnknown = pickNodes(res.data);
    type UnknownNode = {
      id?: unknown;
      name?: unknown;
      label?: unknown;
      type?: unknown;
      children?: unknown;
    };
    const isUnknownNodeArray = (v: unknown): v is UnknownNode[] => Array.isArray(v);
    const toNodes = (arr: UnknownNode[]): TxnCategoryNode[] =>
      (arr || []).map((n) => {
        const id = typeof n.id === 'number' || typeof n.id === 'string' ? n.id : String(n.id);
        const nm =
          typeof n.name === 'string' ? n.name : typeof n.label === 'string' ? n.label : String(id);
        const childrenUnknown =
          n.children && Array.isArray(n.children) ? (n.children as UnknownNode[]) : [];
        const kids = toNodes(childrenUnknown);
        const inferredType: 'folder' | 'category' =
          typeof n.type === 'string' && (n.type === 'folder' || n.type === 'category')
            ? n.type
            : kids.length
            ? 'folder'
            : 'category';
        return { id, name: nm, type: inferredType, children: kids };
      });
    const rootChildren: TxnCategoryNode[] = isUnknownNodeArray(nodesUnknown)
      ? toNodes(nodesUnknown)
      : toNodes(
          typeof (nodesUnknown as Record<string, unknown> | null)?.children !== 'undefined' &&
            Array.isArray((nodesUnknown as Record<string, unknown>).children)
            ? (nodesUnknown as { children: UnknownNode[] }).children
            : []
        );
    allTxnCategoriesTree.value = rootChildren;
    flattenTxnCategories();
  } catch {
    $q.notify({ type: 'negative', message: 'Error cargando categorías de transacción' });
    allTxnCategoriesTree.value = [];
    allTxnCategoriesFlat.value = [];
    txnCategoryOptions.value = [];
  }
}

function flattenTxnCategories() {
  const flat: TxnCategoryOption[] = [];
  function walk(nodes: TxnCategoryNode[], parent: TxnCategoryNode | null) {
    for (const n of nodes) {
      const isFolder = (n.type || 'category') === 'folder';
      if (!isFolder) {
        const parentName = parent ? parent.name : null;
        const label = parentName ? `${n.name} (${parentName})` : n.name;
        const raw = parentName ? `${n.name} ${parentName}` : n.name;
        flat.push({ id: n.id, name: label, rawName: raw });
      }
      if (n.children?.length) walk(n.children, n);
    }
  }
  walk(allTxnCategoriesTree.value || [], null);
  allTxnCategoriesFlat.value = flat;
  txnCategoryOptions.value = flat.slice();
}

function onTxnCategoryFilter(val: string, done: (cb: () => void) => void) {
  const needle = (val || '').toLowerCase();
  const base = allTxnCategoriesFlat.value;
  const filtered = !needle
    ? base
    : base.filter((o) => (o.rawName || o.name).toLowerCase().includes(needle));
  done(() => {
    txnCategoryOptions.value = filtered;
  });
}

// Categories dialog integration
const showTxnCatsDialog = ref(false);
const categoriesTreeNodes = computed(() => {
  type TreeInput = {
    id: string | number;
    label: string;
    type?: 'folder' | 'category';
    icon?: string | null;
    children?: TreeInput[];
  };
  const mapNodes = (ns: TxnCategoryNode[] | null | undefined): TreeInput[] => {
    if (!ns || !ns.length) return [];
    return ns.map((n) => ({
      id: n.id,
      label: n.name,
      type: (n.type as 'folder' | 'category') || 'category',
      children: mapNodes(n.children || []),
    }));
  };
  return mapNodes(allTxnCategoriesTree.value);
});
function openTxnCatsDialog() {
  void ensureTxnCategoriesLoaded();
  showTxnCatsDialog.value = true;
}
function onCatsTreeSelect(payload: {
  id: string | number;
  label: string;
  type: 'folder' | 'category';
}) {
  if (payload && payload.type === 'category') {
    simpleCategoryId.value = Number(payload.id);
    showTxnCatsDialog.value = false;
  }
}

// ----- IVA anchoring (Exento toggle) -----
// If row.exempt is false (no exento) and we recognize an IVA 16% in availableTaxes, we could tag it here for a future per-item tax payload.
const iva16 = computed(() => {
  const list = availableTaxes.value || [];
  // heuristics: name includes 'iva' and percent == 16
  return (
    list.find((t) => (t.name || '').toLowerCase().includes('iva') && Number(t.percent) === 16) ||
    null
  );
});
function onToggleExempt() {
  // For now we only keep the flag at row level; per-item tax payload can be added later.
  // Touch computed to avoid unused warning and as future hook
  void iva16.value;
}

// Ensure required data when enabling advanced payments
watch(
  () => isAdvancedPayment.value,
  async (v) => {
    if (v) {
      await Promise.allSettled([ensureAccountsLoaded(), fetchAvailableTaxes()]);
    }
  }
);

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

// Preload categories and taxes when entering advanced mode
watch(
  () => isAdvancedAmount.value,
  async (on) => {
    if (on) {
      await Promise.allSettled([ensureItemCategoriesLoaded(), fetchAvailableTaxes()]);
    }
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

// Fetch available taxes whenever the dialog opens
watch(
  () => ui.showDialogNewTransaction,
  (open) => {
    if (open) void fetchAvailableTaxes();
  },
  { immediate: false }
);

// Prefill single selected account from sidebar when opening dialog (ensure accounts first)
watch(
  () => ui.showDialogNewTransaction,
  async (open) => {
    if (!open) return;
    try {
      await ensureAccountsLoaded();
      const ids = Array.isArray(tsStore.selectedAccountIds)
        ? tsStore.selectedAccountIds.filter((v) => v !== null && v !== undefined)
        : [];
      if (ids.length === 1) {
        const accIdNum = Number(ids[0]);
        if (Number.isFinite(accIdNum)) {
          const ty = ttypes.types.find((t) => t.id === form.value.transaction_type_id);
          const slug = (ty?.slug || '').toLowerCase();
          if (slug === 'transfer') {
            if (!form.value.account_from_id) form.value.account_from_id = accIdNum;
          } else if (!form.value.account_id) {
            form.value.account_id = accIdNum;
          }
        }
      }
    } catch (e) {
      console.warn('Prefill account failed', e);
    }
  },
  { immediate: false }
);

// When switching type, keep prefilled account coherent
watch(
  () => form.value.transaction_type_id,
  (newVal) => {
    if (!newVal) return;
    const ty = ttypes.types.find((t) => t.id === newVal);
    const slug = (ty?.slug || '').toLowerCase();
    if (slug === 'transfer') {
      // moving to transfer: use existing simple account as origin if set
      if (!form.value.account_from_id && form.value.account_id) {
        form.value.account_from_id = form.value.account_id;
        form.value.account_id = null;
      }
    } else {
      // leaving transfer: if no simple account but origin exists, reuse it
      if (!form.value.account_id && form.value.account_from_id) {
        form.value.account_id = form.value.account_from_id;
        form.value.account_from_id = null;
        form.value.account_to_id = null;
      }
    }
  }
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
  // Advanced payments validation for non-transfer
  if (slug !== 'transfer' && isAdvancedPayment.value) {
    // disallow duplicate accounts
    const seen = new Set<number>();
    for (const p of payments.value) {
      if (typeof p?.account_id === 'number') {
        if (seen.has(p.account_id)) {
          $q.notify({ type: 'warning', message: 'Cada pago debe usar una cuenta diferente.' });
          return;
        }
        seen.add(p.account_id);
      }
    }
    for (let i = 0; i < payments.value.length; i++) {
      const p = payments.value[i];
      if (!p) {
        $q.notify({ type: 'warning', message: `Pago #${i + 1}: fila inválida.` });
        return;
      }
      if (!p.account_id || !p.amount || !(Number(p.amount) > 0)) {
        $q.notify({ type: 'warning', message: `Pago #${i + 1}: cuenta y monto son requeridos.` });
        return;
      }
      if (rowNeedsRate(p as PaymentRow) && !(Number(p.rate || 0) > 0)) {
        $q.notify({
          type: 'warning',
          message: `Pago #${i + 1}: tasa requerida por moneda distinta.`,
        });
        return;
      }
    }
    if (paymentsMismatch.value) {
      $q.notify({ type: 'warning', message: 'La suma de pagos no coincide con el monto.' });
      return;
    }
  }
  if (showRateInput.value && (!form.value.rate || Number(form.value.rate) <= 0)) {
    $q.notify({ type: 'warning', message: 'Ingresa la tasa de cambio' });
    return;
  }
  // In advanced mode, enforce that amount equals subtotal (absolute)
  if (isAdvancedAmount.value) {
    const amtAbs = Math.abs(Number(form.value.amount || 0));
    const sub = Number(invoiceSubtotal.value) || 0;
    if (Number(amtAbs.toFixed(2)) !== Number(sub.toFixed(2))) {
      $q.notify({ type: 'warning', message: 'El subtotal no coincide con el monto.' });
      return;
    }
  }
  let dateStr = form.value.datetime;
  if (dateStr.includes('T')) dateStr = dateStr.replace('T', ' ');
  if (dateStr.length === 16) dateStr += ':00';
  const isTrans = slug === 'transfer';
  // Payload types
  type PaymentPayload = {
    account_id: number | null;
    amount: number; // in account currency
    rate: number | null; // to user base currency
    tax_id: number | null;
    note: string | null;
  };
  type TransactionPayload = {
    name: string;
    amount: number;
    amount_tax: number;
    date: string;
    provider_id: number | null;
    transaction_type_id?: string | null;
    url_file: string | null;
    rate: number | null;
    account_id?: number | null;
    account_from_id?: number | null;
    account_to_id?: number | null;
    items?: Array<{ name: string; amount: number; category_id?: number | null }>;
    payments?: PaymentPayload[];
    include_in_balance?: number; // 1 o 0
  };
  let payload: TransactionPayload;
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
      const currentType = ttypes.types.find((t: TransactionType) => t.id === form.value.transaction_type_id);
      const currentSlug = (currentType?.slug || '').toLowerCase();
      const isExpense = currentSlug === 'expense';
      items = valid.map((r) => {
        const base = r.qty * r.price;
        const addTax = (() => {
          if (invoiceItems.value.length) {
            const row = invoiceItems.value.find(
              (it) =>
                (it.item || 'Item') === r.name &&
                Number(it.quantity || 0) === r.qty &&
                Number(it.unitPrice || 0) === r.price
            );
            if (row && !row.exempt && iva16.value) {
              const pct = Number(iva16.value.percent || 0) / 100;
              return pct > 0 ? base * pct : 0;
            }
          }
          return 0;
        })();
        let totalLine = base + addTax;
        if (isExpense) totalLine = -Math.abs(totalLine); // respetar signo negativo en gastos
        return {
          name: r.name,
            amount: totalLine,
          category_id: r.category_id,
        } as ItemPayload;
      });
    } else {
      const currentType = ttypes.types.find((t: TransactionType) => t.id === form.value.transaction_type_id);
      const currentSlug = (currentType?.slug || '').toLowerCase();
      const isExpense = currentSlug === 'expense';
      const rawAmt = Number(form.value.amount || 0);
      const normalized = isExpense ? -Math.abs(rawAmt) : Math.abs(rawAmt);
      items = [
        {
          name: form.value.name || 'Item',
          amount: normalized,
          category_id: simpleCategoryId.value ?? null,
        },
      ];
    }
    payload = {
      name: form.value.name,
      amount: form.value.amount ?? 0,
      amount_tax: 0,
      date: dateStr,
      provider_id: form.value.provider_id,
      account_id: isAdvancedPayment.value ? null : form.value.account_id ?? null,
      transaction_type_id: form.value.transaction_type_id ?? null,
      url_file: form.value.url_file || null,
      rate: isAdvancedPayment.value ? null : showRateInput.value ? form.value.rate ?? null : null,
      // taxes removed for now
      items,
      include_in_balance: includeInBalance.value ? 1 : 0,
    };
    // Asegurar que el monto principal coincide exactamente con la suma de los items (evita error backend)
    if (isAdvancedAmount.value) {
      const itemsSum = items.reduce((s, it) => s + Number(it.amount || 0), 0);
      const norm = Number(itemsSum.toFixed(2));
  const current = Number(payload.amount || 0);
      if (Number(current.toFixed(2)) !== norm) payload.amount = norm;
    }
    if (isAdvancedPayment.value) {
      payload.payments = payments.value.map((p) => ({
        account_id: p.account_id,
        amount: Math.abs(Number(p.amount || 0)), // account currency
        rate: rowNeedsRate(p as PaymentRow) ? Number(p.rate || 0) : null,
        tax_id: p.applyTax ? p.tax_id : null,
        note: p.note || null,
      }));
    }
  } else {
    payload = {
      name: form.value.name,
      amount: form.value.amount ?? 0,
      amount_tax: 0,
      date: dateStr,
      provider_id: form.value.provider_id,
      account_from_id: form.value.account_from_id ?? null,
      account_to_id: form.value.account_to_id ?? null,
      transaction_type_id: form.value.transaction_type_id ?? null,
      url_file: form.value.url_file || null,
      rate: form.value.rate ?? null,
      // taxes removed for now
      include_in_balance: includeInBalance.value ? 1 : 0,
    };
  }
  tsStore
    .addTransaction(payload)
    .then(async () => {
      $q.notify({ type: 'positive', message: 'Transacción creada' });
      // Invalida cache de balances de cuentas afectadas y fuerza refetch
      const affected: number[] = [];
      if (form.value.account_id) affected.push(form.value.account_id);
      if (form.value.account_from_id) affected.push(form.value.account_from_id);
      if (form.value.account_to_id) affected.push(form.value.account_to_id);
      // En pagos avanzados, incluir todas las cuentas usadas
      if (!isTransfer.value && isAdvancedPayment.value) {
        payments.value.forEach((p) => {
          if (typeof p?.account_id === 'number') affected.push(p.account_id);
        });
      }
      const ids = Array.from(new Set(affected.filter((v): v is number => typeof v === 'number')));
      // Recalcular saldos de las cuentas afectadas
      try {
        if (ids.length) {
          await Promise.all(
            ids.map((id) =>
              api.post(`/accounts/${id}/recalculate-account`, { user_id: auth.user?.id })
            )
          );
        }
      } catch {
        // Silencioso: si falla el recálculo, continuamos con la UI
      }
      affected.forEach((id) => {
        if (id in accountBalanceCache.value) delete accountBalanceCache.value[id];
        void fetchAccountBalance(id);
      });
      // Notificar a la app para refrescar vistas relacionadas
      if (ids.length) {
        window.dispatchEvent(
          new CustomEvent('ow:transactions:changed', {
            detail: { account_ids: ids, reason: 'create' },
          })
        );
      }
      ui.closeNewTransactionDialog();
      resetForm();
    })
    .catch((err: unknown) => {
      let message = 'Error al crear transacción';
      let collectedFieldErrors: Record<string, string[]> | undefined;
      try {
        type ApiErrorData = {
          message?: string;
          errors?: Record<string, string[]>;
          data?: Record<string, string[]>;
        };
        const e = err as {
          isApiError?: boolean;
          api?: { message?: string; errors?: Record<string, string[]> };
          response?: { data?: ApiErrorData | undefined };
        };
        if (e?.isApiError && e.api) {
          if (e.api.message) message = e.api.message;
          const fieldErrors = e.api.errors || {};
          collectedFieldErrors = fieldErrors;
          const list: string[] = [];
          Object.keys(fieldErrors).forEach((k) => {
            const arr = fieldErrors[k];
            if (Array.isArray(arr)) arr.forEach((m) => list.push(`${k}: ${m}`));
          });
          if (list.length) message = `${message}. ${list.join(' | ')}`;
        } else if (e?.response?.data) {
          const data = e.response.data;
          if (data.message) message = data.message;
          const errs: Record<string, string[]> =
            (data?.errors as Record<string, string[]>) ?? (data?.data as Record<string, string[]>) ?? {};
          collectedFieldErrors = errs;
          const list: string[] = [];
          Object.keys(errs).forEach((k) => {
            const arr = errs[k];
            if (Array.isArray(arr)) arr.forEach((m: string) => list.push(`${k}: ${m}`));
          });
          if (list.length) message = `${message}. ${list.join(' | ')}`;
        }
      } catch {
        /* ignore parse error */
      }
      message = translateTransactionErrors(message, collectedFieldErrors);
      console.error(err);
      $q.notify({ type: 'negative', message });
    });
}

function resetForm() {
  form.value = initialForm();
  isAdvancedAmount.value = false;
  invoiceItems.value = [{ item: '', quantity: 1, unitPrice: 0 }];
  isAdvancedPayment.value = false;
  payments.value = [
    { account_id: null, amount: null, rate: null, applyTax: false, tax_id: null, note: null },
  ];
  simpleCategoryId.value = null;
  includeInBalance.value = true;
}

// Traduce mensajes de error de validación del backend a mensajes cortos en español usando
// el nombre amigable del campo.
function translateTransactionErrors(
  rawMessage: string,
  fieldErrors?: Record<string, string[]>
): string {
  const fieldMap: Record<string, string> = {
    name: 'Concepto',
    amount: 'Monto',
    amount_tax: 'Impuesto',
    account_id: 'Cuenta',
    account_from_id: 'Cuenta origen',
    account_to_id: 'Cuenta destino',
    provider_id: 'Proveedor',
    transaction_type_id: 'Tipo de transacción',
    rate: 'Tasa',
    date: 'Fecha',
    datetime: 'Fecha',
    url_file: 'Archivo',
  };
  const requiredPatterns = [
    /the (.+?) is required/i,
    /is required/i,
    /is mandatory/i,
    /required field/i,
  ];

  const spanishParts: string[] = [];
  if (fieldErrors && typeof fieldErrors === 'object') {
    Object.entries(fieldErrors).forEach(([field, msgs]) => {
      const base = fieldMap[field] || field;
      if (!Array.isArray(msgs) || !msgs.length) return;
      const anyRequired = msgs.some((m) => requiredPatterns.some((r) => r.test(m)));
      if (anyRequired) spanishParts.push(`${base} es requerido`);
      else spanishParts.push(`${base}: ${msgs[0]}`);
    });
  }

  // Si no hubo fieldErrors estructurados, intentar inferir desde el mensaje crudo
  if (!spanishParts.length) {
    Object.entries(fieldMap).forEach(([key, label]) => {
      const regex = new RegExp(`\\b${key}\\b.*is required`, 'i');
      if (regex.test(rawMessage)) spanishParts.push(`${label} es requerido`);
    });
  }

  if (!spanishParts.length) return rawMessage; // no cambios

  // Evitar duplicar si el mensaje original ya es traducido
  const baseMsg = spanishParts.join(' | ');
  if (rawMessage.toLowerCase().includes('incorrect')) {
    return `Parámetros incorrectos. ${baseMsg}`;
  }
  return baseMsg;
}
</script>

<style scoped>
.invoice-table thead th {
  font-weight: 600;
}
</style>
