<template>
  <q-dialog
    :model-value="modelValue"
    @update:model-value="emit('update:modelValue', $event)"
    @before-hide="resetForm"
  >
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
            <span class="info-label">Balance actual:</span>
            <span class="info-value" :class="currentBalanceClass">
              {{ formatCurrency(currentBalance) }}
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
          <!-- Monto input -->
          <q-input
            v-model.number="form.monto"
            type="number"
            label="Monto a ajustar"
            hint="Positivo para agregar, negativo para restar"
            outlined
            dense
            step="0.01"
            :rules="[
              (v) => (v !== null && v !== undefined) || 'Requerido',
              (v) => v !== 0 || 'No puede ser cero',
              (v) => validateAmount(v) || 'Fondos insuficientes',
            ]"
            @keyup.enter="handleSave"
          >
            <template #prepend>
              <q-icon name="attach_money" />
            </template>
          </q-input>

          <!-- Descripción (opcional) -->
          <q-input
            v-model="form.descripcion"
            label="Descripción (opcional)"
            hint="Ej: 'Transferencia desde otra cuenta'"
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
            <div class="text-caption text-grey-7 q-mb-xs">Nuevo balance:</div>
            <div class="text-h6" :class="previewBalanceClass">
              {{ formatCurrency(previewBalance) }}
            </div>
            <div v-if="previewChange" class="text-caption text-grey-6 q-mt-xs">
              <span :class="previewChange > 0 ? 'text-positive' : 'text-negative'">
                {{ previewChange > 0 ? '+' : '' }}{{ formatCurrency(previewChange) }}
              </span>
            </div>
          </div>

          <!-- Tipo de ajuste (información) -->
          <div class="adjustment-type q-pa-md rounded-borders bg-blue-1">
            <div class="text-subtitle2 text-blue-9">
              {{ adjustmentType === 'addition' ? '➕ Agregar' : '➖ Restar' }}
            </div>
            <div class="text-caption text-blue-8">
              {{ adjustmentTypeDescription }}
            </div>
          </div>

          <!-- Validación de fondos insuficientes -->
          <div
            v-if="!isValidAmount && (form.monto ?? 0) < 0"
            class="q-pa-md rounded-borders bg-negative text-white"
          >
            <div class="text-body2">⚠️ Fondos insuficientes</div>
            <div class="text-caption q-mt-xs">
              Puedes restar máximo {{ formatCurrency(Math.abs(maxSubtraction)) }}
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator />

      <!-- Actions -->
      <q-card-actions align="right" class="q-pa-md">
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
  previousAdjustment?: number;
}

interface Emits {
  'update:modelValue': [value: boolean];
  save: [data: { monto: number; descripcion?: string }];
}

defineOptions({
  name: 'AdjustmentModal',
});

const props = withDefaults(defineProps<Props>(), {
  previousAdjustment: 0,
});

const emit = defineEmits<Emits>();

const $q = useQuasar();

// Form state
const form = ref({
  monto: null as number | null,
  descripcion: '',
});

const saving = ref(false);

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
 * Valida que el monto no exceda fondos disponibles
 */
function validateAmount(amount: number | null): boolean {
  if (amount === null || Number.isNaN(amount)) return false;

  // Si es positivo, siempre es válido
  if (amount > 0) return true;

  // Si es negativo, no puede exceder balance actual
  const newBalance = props.currentBalance + amount;
  return newBalance >= 0;
}

/**
 * Checa si es suma o resta
 */
const adjustmentType = computed(() => {
  if (!form.value.monto) return null;
  return form.value.monto > 0 ? 'addition' : 'subtraction';
});

/**
 * Descripción del tipo de ajuste
 */
const adjustmentTypeDescription = computed(() => {
  switch (adjustmentType.value) {
    case 'addition':
      return 'Estás agregando dinero al balance de este cántaro';
    case 'subtraction':
      return 'Estás restando dinero del balance de este cántaro';
    default:
      return '';
  }
});

/**
 * Monto máximo que se puede restar
 */
const maxSubtraction = computed(() => props.currentBalance);

/**
 * Checa si el monto es válido
 */
const isValidAmount = computed(() => {
  if (form.value.monto === null || Number.isNaN(form.value.monto)) return false;
  return validateAmount(form.value.monto);
});

/**
 * Checa si el formulario está completo y válido
 */
const isValidForm = computed(() => {
  return form.value.monto !== null && form.value.monto !== 0 && isValidAmount.value;
});

/**
 * Calcula el nuevo balance después del ajuste
 */
const previewBalance = computed(() => {
  if (!form.value.monto) return props.currentBalance;
  return props.currentBalance + form.value.monto;
});

/**
 * Cambio respecto al balance actual
 */
const previewChange = computed(() => {
  if (!form.value.monto) return 0;
  return form.value.monto;
});

/**
 * Clase CSS para el balance actual
 */
const currentBalanceClass = computed(() => {
  if (props.currentBalance < 0) return 'text-negative';
  if (props.currentBalance === 0) return 'text-warning';
  return 'text-positive';
});

/**
 * Clase CSS para el preview balance
 */
const previewBalanceClass = computed(() => {
  const preview = previewBalance.value;
  if (preview < 0) return 'text-negative';
  if (preview === 0) return 'text-warning';
  return 'text-positive';
});

/**
 * Maneja el guardado del ajuste
 */
async function handleSave() {
  if (!isValidForm.value) return;

  if (form.value.monto === null) return;

  // Confirmación para operaciones grandes
  if (Math.abs(form.value.monto) > 1000) {
    const confirm = await new Promise((resolve) => {
      $q.dialog({
        title: 'Confirmar ajuste grande',
        message: `¿Estás seguro de ajustar ${formatCurrency(form.value.monto || 0)}?`,
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
    const payload: { monto: number; descripcion?: string } = {
      monto: form.value.monto || 0,
    };
    if (form.value.descripcion) {
      payload.descripcion = form.value.descripcion;
    }
    emit('save', payload);
  } finally {
    saving.value = false;
  }
}

/**
 * Resetea el formulario
 */
function resetForm() {
  form.value = {
    monto: null,
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
    }
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
