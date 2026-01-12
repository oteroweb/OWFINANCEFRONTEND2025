<template>
  <div class="jar-card">
    <!-- Header: Nombre y porcentaje configurado -->
    <div class="jar-card__header">
      <div class="jar-card__title-col">
        <div class="jar-card__name">{{ jar.name }}</div>
        <div class="jar-card__type">
          {{ jar.type === 'percent' ? `${jar.percent}% de ingresos` : 'Monto fijo' }}
        </div>
      </div>
    </div>

    <!-- Porcentajes principales: basado en ingresos vs basado en gastos -->
    <div class="jar-card__percentages q-mt-md">
      <div class="percentage-box percentage-box--income">
        <div class="percentage-box__label">
          <q-icon name="account_balance_wallet" size="18px" />
          Basado en ingresos
        </div>
        <div class="percentage-box__value">{{ jar.percent || 0 }}%</div>
        <div class="percentage-box__amount">
          {{ formatCurrency(suggestedAmountExpected) }}
          <q-tooltip>
            {{ jar.percent }}% de tu ingreso esperado ({{ formatCurrency(expectedIncome) }})
          </q-tooltip>
        </div>
      </div>

      <div class="percentage-box percentage-box--spent">
        <div class="percentage-box__label">
          <q-icon name="trending_down" size="18px" />
          Basado en gastos
        </div>
        <div class="percentage-box__value" :class="`status-${statusBalance}`">
          {{ porcentajeUtilizado }}%
        </div>
        <div class="percentage-box__amount">
          {{ formatCurrency(balance?.gastado || 0) }}
          <q-tooltip> Has gastado {{ porcentajeUtilizado }}% de lo asignado </q-tooltip>
        </div>
      </div>
    </div>

    <!-- Sugerencia real si difiere del esperado -->
    <div
      v-if="showSuggestions && suggestedAmountReal !== suggestedAmountExpected"
      class="jar-card__real-suggestion q-mt-sm"
    >
      <q-icon name="monitoring" size="16px" class="q-mr-xs" />
      <span class="suggestion-label">Sugerido según ingresos reales:</span>
      <span class="suggestion-value text-info">
        {{ formatCurrency(suggestedAmountReal) }}
      </span>
      <q-tooltip>
        Basado en {{ jar.type === 'percent' ? jar.percent + '%' : 'monto fijo' }} de tus ingresos
        reales del mes ({{ formatCurrency(calculatedIncome) }})
      </q-tooltip>
    </div>

    <!-- Disponible destacado -->
    <div class="jar-card__available q-mt-md">
      <div class="available-label">Disponible</div>
      <div class="available-amount" :class="balanceClass">
        {{ formatCurrency(balance?.balance || 0) }}
      </div>
      <q-linear-progress
        :value="(porcentajeUtilizado ?? 0) / 100"
        :color="progressColor"
        size="8px"
        class="rounded-borders q-mt-xs"
      />
    </div>

    <!-- Desglose detallado (colapsable) -->
    <q-expansion-item
      dense
      class="jar-card__details q-mt-sm"
      label="Ver desglose"
      header-class="text-caption text-grey-7"
    >
      <div class="jar-card__breakdown">
        <div class="jar-card__row">
          <span class="jar-card__label">Asignado:</span>
          <span class="jar-card__value">{{ formatCurrency(balance?.asignado || 0) }}</span>
        </div>
        <div class="jar-card__row">
          <span class="jar-card__label">Gastado:</span>
          <span class="jar-card__value text-negative">
            {{ formatCurrency(balance?.gastado || 0) }}
          </span>
        </div>
        <div v-if="balance?.ajuste !== 0" class="jar-card__row">
          <span class="jar-card__label">Ajuste:</span>
          <span class="jar-card__value" :class="{ 'text-positive': (balance?.ajuste || 0) > 0 }">
            {{ formatCurrency(balance?.ajuste || 0) }}
          </span>
        </div>
      </div>
    </q-expansion-item>

    <!-- Botón de ajuste prominente -->
    <div class="jar-card__actions q-mt-md">
      <q-btn
        unelevated
        no-caps
        class="full-width"
        color="primary"
        icon="tune"
        label="Ajustar cántaro"
        :disable="loading ?? false"
        @click="emit('adjust')"
      />
      <q-btn
        v-if="balance?.ajuste !== 0"
        flat
        no-caps
        class="full-width q-mt-xs"
        color="accent"
        icon="refresh"
        label="Resetear ajuste"
        :disable="loading ?? false"
        @click="emit('reset')"
      />
    </div>

    <!-- Loading state -->
    <div v-if="loading" class="jar-card__loading">
      <q-spinner size="sm" color="primary" />
    </div>

    <!-- Error state -->
    <div v-if="error" class="jar-card__error q-mt-md">
      <q-banner class="bg-negative text-white" dense>
        {{ error }}
      </q-banner>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useCalculatedIncome } from 'src/composables/useCalculatedIncome';

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jar: Record<string, any>;
  balance?: {
    asignado: number;
    gastado: number;
    ajuste: number;
    balance: number;
    porcentaje_utilizado: number;
  } | null;
  loading?: boolean | null;
  error?: string | null;
  porcentajeUtilizado?: number | null;
  statusBalance?: 'low' | 'medium' | 'high' | 'full';
}

interface Emits {
  adjust: [];
  reset: [];
  refresh: [];
}

defineOptions({
  name: 'JarCard',
});

const props = withDefaults(defineProps<Props>(), {
  balance: null,
  loading: false,
  error: null,
  porcentajeUtilizado: 0,
  statusBalance: 'low',
});

const emit = defineEmits<Emits>();

const { expectedIncome, calculatedIncome } = useCalculatedIncome();

/**
 * Calcula la cantidad sugerida basada en ingreso esperado
 */
const suggestedAmountExpected = computed(() => {
  const income = expectedIncome.value;
  if (income === 0 || !props.jar.active) return 0;

  if (props.jar.type === 'percent') {
    return (income * (props.jar.percent || 0)) / 100;
  }

  // Para cántaros de monto fijo, retornar el monto fijo
  return props.jar.fixedAmount || 0;
});

/**
 * Calcula la cantidad sugerida basada en ingreso real
 */
const suggestedAmountReal = computed(() => {
  const income = calculatedIncome.value;
  if (income === 0 || !props.jar.active) return suggestedAmountExpected.value;

  if (props.jar.type === 'percent') {
    return (income * (props.jar.percent || 0)) / 100;
  }

  // Para cántaros de monto fijo, retornar el monto fijo
  return props.jar.fixedAmount || 0;
});

/**
 * Diferencia entre sugerencia real y esperada
 */
/**
 * Mostrar sugerencias si hay ingreso configurado y el cántaro está activo
 */
const showSuggestions = computed(() => {
  return (
    (expectedIncome.value > 0 || calculatedIncome.value > 0) &&
    props.jar.active &&
    props.jar.type === 'percent'
  );
});

/**
 * Formatea cantidad como moneda
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Color de progress bar según status
 */
const progressColor = computed(() => {
  switch (props.statusBalance) {
    case 'full':
      return 'negative';
    case 'high':
      return 'warning';
    case 'medium':
      return 'info';
    default:
      return 'positive';
  }
});

/**
 * Clase de texto para balance disponible
 */
const balanceClass = computed(() => {
  const balance = props.balance?.balance || 0;
  if (balance < 0) return 'text-negative';
  if (balance === 0) return 'text-warning';
  return 'text-positive';
});
</script>

<style scoped lang="scss">
.jar-card {
  position: relative;
  padding: 20px;
  border-radius: 12px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.98) 100%);
  border: 1px solid rgba(0, 0, 0, 0.1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  transition: all 200ms ease;

  &:hover {
    border-color: rgba(0, 0, 0, 0.15);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }
}

.jar-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.jar-card__title-col {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.jar-card__name {
  font-size: 16px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.87);
  line-height: 1.4;
  word-break: break-word;
}

.jar-card__type {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.54);
  font-weight: 500;
}

// Cajas de porcentajes principales
.jar-card__percentages {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

.percentage-box {
  padding: 12px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  border: 2px solid;
  transition: all 200ms ease;

  &--income {
    background: linear-gradient(135deg, rgba(76, 175, 80, 0.08) 0%, rgba(76, 175, 80, 0.12) 100%);
    border-color: rgba(76, 175, 80, 0.3);

    .percentage-box__value {
      color: #2e7d32;
    }
  }

  &--spent {
    background: linear-gradient(135deg, rgba(33, 150, 243, 0.08) 0%, rgba(33, 150, 243, 0.12) 100%);
    border-color: rgba(33, 150, 243, 0.3);

    .percentage-box__value {
      color: #1565c0;

      &.status-high {
        color: #e65100;
      }

      &.status-full {
        color: #c62828;
      }
    }
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
}

.percentage-box__label {
  font-size: 11px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.6);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.percentage-box__value {
  font-size: 28px;
  font-weight: 700;
  line-height: 1;
}

.percentage-box__amount {
  font-size: 13px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.7);
}

// Sugerencia real
.jar-card__real-suggestion {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 12px;
  background: rgba(33, 150, 243, 0.1);
  border-left: 3px solid rgba(33, 150, 243, 0.5);
  border-radius: 6px;
  font-size: 13px;

  .suggestion-label {
    color: rgba(33, 150, 243, 0.87);
    font-weight: 500;
    flex: 1;
  }

  .suggestion-value {
    font-weight: 700;
  }
}

// Disponible destacado
.jar-card__available {
  padding: 16px;
  background: linear-gradient(135deg, rgba(156, 39, 176, 0.08) 0%, rgba(156, 39, 176, 0.12) 100%);
  border: 2px solid rgba(156, 39, 176, 0.3);
  border-radius: 10px;
  text-align: center;
}

.available-label {
  font-size: 12px;
  font-weight: 600;
  color: rgba(156, 39, 176, 0.87);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.available-amount {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 8px;

  &.text-negative {
    color: #c62828;
  }

  &.text-positive {
    color: #2e7d32;
  }

  &.text-warning {
    color: #e65100;
  }
}

// Desglose detallado
.jar-card__details {
  :deep(.q-expansion-item__container) {
    border: none;
  }
}

.jar-card__breakdown {
  display: flex;
  flex-direction: column;
  gap: 8px;
  font-size: 13px;
  padding: 12px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 6px;
}

.jar-card__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.jar-card__label {
  color: rgba(0, 0, 0, 0.6);
  font-weight: 500;
}

.jar-card__value {
  color: rgba(0, 0, 0, 0.87);
  font-weight: 600;
  text-align: right;

  &.text-negative {
    color: #c62828;
  }

  &.text-positive {
    color: #2e7d32;
  }

  &.text-warning {
    color: #e65100;
  }
}

// Acciones
.jar-card__actions {
  display: flex;
  flex-direction: column;
  gap: 0;

  :deep(.q-btn) {
    font-weight: 600;
  }
}

.jar-card__loading {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.85);
  border-radius: 12px;
  backdrop-filter: blur(3px);
  z-index: 10;
}

.jar-card__error {
  :deep(.q-banner__content) {
    padding: 8px 12px;
    font-size: 12px;
  }
}

// Responsive
@media (max-width: 599px) {
  .jar-card__percentages {
    grid-template-columns: 1fr;
  }

  .percentage-box__value {
    font-size: 24px;
  }

  .available-amount {
    font-size: 28px;
  }
}
</style>
