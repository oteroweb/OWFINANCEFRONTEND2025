<template>
  <q-dialog v-model="model" @before-hide="resetForm">
    <q-card style="min-width: 400px; max-width: 500px">
      <!-- Header -->
      <q-toolbar>
        <q-toolbar-title class="text-h6" v-if="jar">
          Ajustar balance de {{ jar.name }}
        </q-toolbar-title>
        <q-btn flat round dense icon="close" v-close-popup />
      </q-toolbar>

      <q-separator />

      <!-- Content -->
      <q-card-section class="q-pa-md">
        <!-- Current balance info -->
        <div class="adjustment-info q-mb-lg">
          <div class="info-row">
            <span class="info-label">Disponible a gastar:</span>
            <span class="info-value" :class="currentBalanceClass">
              {{ formatCurrency(currentBalance) }}
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">Balance contable:</span>
            <span class="info-value" :class="accountingBalanceClass">
              {{ formatCurrency(accountingBalanceValue) }}
            </span>
          </div>
          <div v-if="excedidoAmount > 0" class="info-row">
            <span class="info-label">Excedido:</span>
            <span class="info-value text-negative">
              -{{ formatCurrency(excedidoAmount) }}
            </span>
          </div>
          <div class="info-row">
            <span class="info-label">Ajuste anterior:</span>
            <span class="info-value" :class="{ 'text-positive': (previousAdjustment ?? 0) > 0 }">
              {{ formatCurrency(previousAdjustment ?? 0) }}
            </span>
          </div>
        </div>

        <!-- Form -->
        <div class="adjustment-form q-gutter-md">
          <!-- Monto input - MODO ABSOLUTO -->
          <q-input
            v-model.number="form.valorObjetivo"
            type="number"
            label="Balance objetivo"
            hint="Ingresa el balance final que deseas"
            outlined
            dense
            step="0.01"
            :rules="[
              (v) => (v !== null && v !== undefined) || 'Requerido',
              (v) =>
                props.allowNegative
                  ? (props.negativeLimit == null
                      ? true
                      : v >= -Number(props.negativeLimit) ||
                        `No puede ser menor a -${formatCurrency(Number(props.negativeLimit))}`)
                  : v >= 0 || 'El balance no puede ser negativo',
            ]"
            @keyup.enter="handleSave"
          >
            <template #prepend>
              <q-icon name="account_balance" />
            </template>
          </q-input>

          <!-- Presupuesto dividido en usado/restante -->
          <div v-if="assignedAmountValue > 0" class="split-budget">
            <div class="text-caption text-grey-7 q-mb-xs">
              Presupuesto base: {{ formatCurrency(assignedAmountValue) }}
            </div>
            <div
              v-if="excedidoAmount > 0 && !props.allowNegative"
              class="text-caption text-negative q-mb-xs"
            >
              Te excediste por {{ formatCurrency(excedidoAmount) }}. Activa “Permitir negativo” en el cántaro
              para guardar este saldo.
            </div>
            <div class="row q-col-gutter-sm">
              <div class="col-6">
                <q-input
                  v-model.number="usedInput"
                  type="number"
                  label="Usado"
                  outlined
                  dense
                  step="0.01"
                  min="0"
                  @update:model-value="onUsedChange"
                >
                  <template #prepend>
                    <q-icon name="trending_up" />
                  </template>
                </q-input>
              </div>
              <div class="col-6">
                <q-input
                  v-model.number="remainingInput"
                  type="number"
                  label="Restante"
                  outlined
                  dense
                  step="0.01"
                  :min="props.allowNegative ? (props.negativeLimit == null ? undefined : -Number(props.negativeLimit)) : 0"
                  @update:model-value="onRemainingChange"
                >
                  <template #prepend>
                    <q-icon name="savings" />
                  </template>
                </q-input>
              </div>
            </div>
            <div class="text-caption text-grey-6 q-mt-xs">
              Al cambiar estos valores, se actualiza el balance objetivo.
            </div>
          </div>

          <!-- Descripción (opcional) -->
          <q-input
            v-model="form.descripcion"
            label="Descripción (opcional)"
            hint="Ej: 'Ajuste por transferencia externa'"
            outlined
            dense
            type="textarea"
            rows="2"
          >
            <template #prepend>
              <q-icon name="description" />
            </template>
          </q-input>

          <!-- Preview de nuevo balance -->
          <div class="balance-preview q-pa-md rounded-borders bg-grey-2">
            <div class="text-caption text-grey-7 q-mb-xs">Balance objetivo:</div>
            <div class="text-h6" :class="previewBalanceClass">
              {{ formatCurrency(form.valorObjetivo ?? currentBalance) }}
            </div>
            <div v-if="ajusteCalculado !== 0" class="text-caption text-grey-6 q-mt-xs">
              Diferencia:
              <span :class="ajusteCalculado > 0 ? 'text-positive' : 'text-negative'">
                {{ ajusteCalculado > 0 ? '+' : '' }}{{ formatCurrency(ajusteCalculado) }}
              </span>
            </div>
          </div>

          <!-- Tipo de ajuste (información) -->
          <div v-if="ajusteCalculado !== 0" class="adjustment-type q-pa-md rounded-borders bg-blue-1">
            <div class="text-subtitle2 text-blue-9">
              {{ ajusteCalculado > 0 ? '➕ Incrementar' : '➖ Reducir' }}
            </div>
            <div class="text-caption text-blue-8">
              {{ ajusteCalculado > 0
                ? `Se agregará ${formatCurrency(Math.abs(ajusteCalculado))} al balance actual`
                : `Se restará ${formatCurrency(Math.abs(ajusteCalculado))} del balance actual`
              }}
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Actions -->
      <q-card-actions align="right" class="q-pa-md">
        <q-btn
          outline
          color="negative"
          label="Borrar ajustes del mes"
          class="q-mr-auto"
          @click="emit('clear')"
        />
        <q-btn flat label="Cancelar" color="grey-7" @click="$emit('update:modelValue', false)" />
        <q-btn
          unelevated
          label="Guardar ajuste"
          color="primary"
          :loading="saving"
          :disable="!isValidForm"
          @click="handleSave"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useQuasar } from 'quasar';

interface Props {
  modelValue: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jar?: Record<string, any> | null;
  currentBalance: number;
  accountingBalance?: number;
  assignedAmount?: number;
  allowNegative?: boolean;
  negativeLimit?: number | null;
  previousAdjustment?: number;
}

interface Emits {
  'update:modelValue': [value: boolean];
  save: [data: { valorObjetivo: number; descripcion?: string }];
  clear: [];
}

defineOptions({
  name: 'AdjustmentModal',
});

const props = withDefaults(defineProps<Props>(), {
  previousAdjustment: 0,
});

const emit = defineEmits<Emits>();

// Proxy for v-model (modelValue) so dialog can use v-model="model"
const model = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
});

const $q = useQuasar();

// Form state
const form = ref({
  valorObjetivo: null as number | null,
  descripcion: '',
});

const saving = ref(false);
const usedInput = ref<number | null>(null);
const remainingInput = ref<number | null>(null);
const isSyncingSplit = ref(false);

/**
 * Calcula el ajuste necesario (diferencia entre objetivo y actual)
 */
const ajusteCalculado = computed(() => {
  if (form.value.valorObjetivo === null) return 0;
  return form.value.valorObjetivo - props.currentBalance;
});

/**
 * Round to 2 decimal places to avoid floating point noise
 */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Formatea número como moneda
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Checa si el formulario está completo y válido
 */
const isValidForm = computed(() => {
  if (form.value.valorObjetivo === null) return false;
  if (!props.allowNegative) return form.value.valorObjetivo >= 0;
  if (props.negativeLimit == null) return true;
  return form.value.valorObjetivo >= -Number(props.negativeLimit);
});

/**
 * Clase CSS para el balance actual
 */
const currentBalanceClass = computed(() => {
  if (props.currentBalance < 0) return 'text-negative';
  if (props.currentBalance === 0) return 'text-warning';
  return 'text-positive';
});

const accountingBalanceValue = computed(() => {
  return props.accountingBalance ?? props.currentBalance;
});

const assignedAmountValue = computed(() => props.assignedAmount ?? 0);
const excedidoAmount = computed(() => {
  if (assignedAmountValue.value <= 0) return 0;
  const used = usedInput.value ?? 0;
  const extra = used - assignedAmountValue.value;
  return extra > 0 ? extra : 0;
});

const accountingBalanceClass = computed(() => {
  const val = accountingBalanceValue.value;
  if (val < 0) return 'text-negative';
  if (val === 0) return 'text-warning';
  return 'text-positive';
});

/**
 * Clase CSS para el preview balance
 */
const previewBalanceClass = computed(() => {
  const val = form.value.valorObjetivo ?? props.currentBalance;
  if (val < 0) return 'text-negative';
  if (val === 0) return 'text-warning';
  return 'text-positive';
});

/**
 * Maneja el guardado del ajuste
 */
async function handleSave() {
  if (!isValidForm.value) return;

  // Si el ajuste reduce el balance, pedir confirmación
  if (ajusteCalculado.value < 0) {
    const confirm = await new Promise((resolve) => {
      $q.dialog({
        title: 'Confirmar reducción',
        message: `Estás reduciendo el balance de ${formatCurrency(
          props.currentBalance
        )} a ${formatCurrency(form.value.valorObjetivo ?? 0)}. ¿Continuar?`,
        cancel: true,
        persistent: true,
      })
        .onOk(() => resolve(true))
        .onCancel(() => resolve(false));
    });

    if (!confirm) return;
  }

  saving.value = true;

  try {
    // Enviar el valor objetivo directamente - el backend calcula la diferencia
    const payload: { valorObjetivo: number; descripcion?: string } = {
      valorObjetivo: form.value.valorObjetivo!,
    };
    if (form.value.descripcion) {
      payload.descripcion = form.value.descripcion;
    }
    emit('save', payload);
  } finally {
    saving.value = false;
  }
}

function clampUsed(val: number | null) {
  if (val == null || Number.isNaN(val)) return 0;
  return Math.max(0, val);
}

function clampRemaining(val: number | null) {
  if (val == null || Number.isNaN(val)) return 0;
  const n = val;
  if (!props.allowNegative) return Math.max(0, n);
  if (props.negativeLimit == null) return n;
  return Math.max(-Number(props.negativeLimit), n);
}

function syncSplitFromObjective() {
  if (assignedAmountValue.value <= 0) return;
  const remaining = clampRemaining(form.value.valorObjetivo ?? 0);
  remainingInput.value = round2(remaining);
  usedInput.value = round2(Math.max(0, assignedAmountValue.value - remaining));
}

function onRemainingChange() {
  if (isSyncingSplit.value) return;
  isSyncingSplit.value = true;
  const remaining = clampRemaining(remainingInput.value);
  const used = round2(Math.max(0, assignedAmountValue.value - remaining));
  usedInput.value = used;
  form.value.valorObjetivo = round2(remaining);
  isSyncingSplit.value = false;
}

function onUsedChange() {
  if (isSyncingSplit.value) return;
  isSyncingSplit.value = true;
  const used = clampUsed(usedInput.value);
  let remaining = assignedAmountValue.value - used;
  remaining = clampRemaining(remaining);
  remainingInput.value = round2(remaining);
  form.value.valorObjetivo = round2(remaining);
  isSyncingSplit.value = false;
}

/**
 * Resetea el formulario
 */
function resetForm() {
  form.value = {
    valorObjetivo: null,
    descripcion: '',
  };
}

/**
 * Watchers
 */
watch(
  () => props.modelValue,
  (val) => {
    if (!val) {
      resetForm();
    } else {
      // Inicializar con el balance actual
      form.value.valorObjetivo = round2(props.currentBalance);
      syncSplitFromObjective();
    }
  }
);

// Re-sync when currentBalance changes (e.g. async load completes after modal opened)
watch(
  () => props.currentBalance,
  (newBal) => {
    if (props.modelValue) {
      form.value.valorObjetivo = round2(newBal);
      syncSplitFromObjective();
    }
  }
);

watch(
  () => form.value.valorObjetivo,
  () => {
    if (isSyncingSplit.value) return;
    syncSplitFromObjective();
  }
);
</script>

<style scoped lang="scss">
.adjustment-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 12px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.02);
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
}

.info-label {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.6);
  font-weight: 500;
}

.info-value {
  font-size: 15px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.87);

  &.text-positive {
    color: #388e3c;
  }

  &.text-negative {
    color: #c62828;
  }

  &.text-warning {
    color: #e65100;
  }
}

.adjustment-form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.balance-preview {
  border: 1px solid rgba(0, 0, 0, 0.08);

  .text-h6 {
    margin: 0;
  }
}

.adjustment-type {
  border: 1px solid rgba(33, 150, 243, 0.2);

  .text-subtitle2 {
    margin: 0;
    font-weight: 600;
  }

  .text-caption {
    margin: 0;
  }
}

.rounded-borders {
  border-radius: 8px;
}

.bg-grey-2 {
  background-color: #eeeeee;
}

.bg-blue-1 {
  background-color: #e3f2fd;
}

.text-blue-9 {
  color: #0d47a1;
}

.text-blue-8 {
  color: #1565c0;
}

.text-positive {
  color: #388e3c;
}

.text-negative {
  color: #c62828;
}

.text-warning {
  color: #e65100;
}

.text-grey-6 {
  color: rgba(0, 0, 0, 0.54);
}

.text-grey-7 {
  color: rgba(0, 0, 0, 0.54);
}

.text-grey-8 {
  color: rgba(0, 0, 0, 0.38);
}

.text-caption {
  font-size: 12px;
  line-height: 1.4;
}

.text-body2 {
  font-size: 13px;
  line-height: 1.5;
}

.text-subtitle2 {
  font-size: 14px;
  font-weight: 500;
  line-height: 1.5;
}

.text-h6 {
  font-size: 20px;
  font-weight: 500;
  line-height: 1.3;
}
</style>
