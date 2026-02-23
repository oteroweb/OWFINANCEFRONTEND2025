<template>
  <div class="jar-card">
    <!-- 1. Header: Name + badges -->
    <div class="jar-card__header">
      <div class="jar-card__title-col">
        <div class="jar-card__name">{{ jar.name }}</div>
        <div class="jar-card__badges">
          <span class="jar-badge jar-badge--type">
            {{ jar.type === 'percent' ? `${jar.percent}%` : 'Fijo' }}
          </span>
          <span v-if="jar.type === 'percent' && activeIncome > 0" class="jar-badge jar-badge--income">
            {{ jar.percent }}% de {{ formatCurrency(activeIncome) }}
            <span class="jar-badge__src">{{ incomeSourceLabel }}</span>
            = {{ formatCurrency(previewAssigned) }}
          </span>
          <span
            v-if="jar.refresh_mode === 'accumulative' || balance?.modo_refresco === 'acumulativo'"
            class="jar-badge jar-badge--accum"
          >
            <q-icon name="autorenew" size="12px" /> Acumulativo
          </span>
          <span v-else class="jar-badge jar-badge--reset">
            <q-icon name="restart_alt" size="12px" /> Reinicio
          </span>
        </div>
      </div>
    </div>

    <!-- 2. Available balance (most important info — prominent) -->
    <div class="jar-card__available q-mt-sm">
      <div class="available-row">
        <div class="available-label">Disponible</div>
        <div class="available-amount" :class="balanceClass">
          {{ formatCurrency(balance?.balance || 0) }}
        </div>
      </div>
      <q-linear-progress
        :value="Math.min(effectiveUsedPct / 100, 1)"
        :color="progressColor"
        track-color="grey-3"
        size="10px"
        class="rounded-borders q-mt-xs"
      />
      <div class="available-meta">
        <span :class="{ 'text-negative': isOverBudget, 'text-weight-bold': isOverBudget }">
          {{ effectiveUsedPct }}% utilizado
          <template v-if="isOverBudget"> — excedido {{ formatCurrency(overBudgetAmount) }}</template>
        </span>
        <span>{{ formatCurrency(totalInflows) }} presupuesto</span>
      </div>
    </div>

    <!-- 3. Quick stats row (compact, at-a-glance) -->
    <div class="jar-card__stats q-mt-sm">
      <div v-if="isAccumulative && carryOverAmount !== 0" class="stat-chip" :class="carryOverAmount > 0 ? 'stat-chip--positive' : 'stat-chip--negative'">
        <q-icon :name="carryOverAmount > 0 ? 'trending_up' : 'trending_down'" size="14px" />
        <span class="stat-chip__amount">{{ carryOverAmount > 0 ? '+' : '' }}{{ formatCurrency(carryOverAmount) }}</span>
        <span class="stat-chip__label">{{ carryOverAmount > 0 ? 'superávit' : 'excedido' }}</span>
        <q-tooltip>Saldo arrastrado del mes anterior</q-tooltip>
      </div>
      <div class="stat-chip stat-chip--spent">
        <q-icon name="trending_down" size="14px" />
        <span class="stat-chip__amount">{{ formatCurrency(balance?.gastado || 0) }}</span>
        <span class="stat-chip__label">gastado</span>
      </div>
      <div v-if="(balance?.ajuste || 0) !== 0" class="stat-chip" :class="(balance?.ajuste || 0) > 0 ? 'stat-chip--positive' : 'stat-chip--negative'">
        <q-icon name="tune" size="14px" />
        <span class="stat-chip__amount">{{ (balance?.ajuste || 0) > 0 ? '+' : '' }}{{ formatCurrency(balance?.ajuste || 0) }}</span>
        <span class="stat-chip__label">ajuste</span>
      </div>
      <div v-if="(balance?.retiros || 0) !== 0" class="stat-chip stat-chip--negative">
        <q-icon name="money_off" size="14px" />
        <span class="stat-chip__amount">{{ formatCurrency(balance?.retiros || 0) }}</span>
        <span class="stat-chip__label">retiros</span>
      </div>
    </div>

    <!-- 4. Preview diff when % changed (live preview) -->
    <div
      v-if="hasAssignedDiff"
      class="jar-card__preview q-mt-sm"
    >
      <q-icon name="sync" size="14px" />
      <span>
        Preview: <strong>{{ formatCurrency(previewAssigned) }}</strong> asignado
        → balance <strong :class="previewBalance < 0 ? 'text-negative' : 'text-positive'">{{ formatCurrency(previewBalance) }}</strong>
      </span>
      <q-tooltip>
        Basado en {{ incomeSourceLabel }}: {{ formatCurrency(activeIncome) }}.
        Actual asignado: {{ formatCurrency(balance?.asignado || 0) }}.
        Diferencia: {{ formatCurrency(previewAssigned - (balance?.asignado || 0)) }}
      </q-tooltip>
    </div>

    <!-- 5. Income suggestion (contextual, only when relevant) -->
    <div
      v-if="showSuggestions && suggestedAmountReal !== suggestedAmountExpected"
      class="jar-card__suggestion q-mt-sm"
    >
      <q-icon name="monitoring" size="14px" />
      <span>Sugerido real: <strong>{{ formatCurrency(suggestedAmountReal) }}</strong></span>
      <q-tooltip>
        {{ jar.percent }}% de ingresos reales ({{ formatCurrency(calculatedIncome ?? 0) }})
        vs esperados ({{ formatCurrency(expectedIncome ?? 0) }})
      </q-tooltip>
    </div>

    <!-- 6. Detailed breakdown (expandable) -->
    <q-expansion-item
      dense
      class="jar-card__details q-mt-sm"
      label="Ver desglose completo"
      header-class="text-caption text-grey-7"
    >
      <div class="jar-card__breakdown">
        <div v-if="isAccumulative" class="jar-card__row" :class="{ 'jar-card__row--highlight': carryOverAmount !== 0 }">
          <span class="jar-card__label">
            <q-icon :name="carryOverAmount > 0 ? 'trending_up' : carryOverAmount < 0 ? 'trending_down' : 'remove'" size="14px" class="q-mr-xs" />
            Saldo mes anterior
            <span v-if="carryOverAmount > 0" class="text-caption text-positive q-ml-xs">(superávit)</span>
            <span v-else-if="carryOverAmount < 0" class="text-caption text-negative q-ml-xs">(excedido)</span>
          </span>
          <span class="jar-card__value" :class="{ 'text-positive': carryOverAmount > 0, 'text-negative': carryOverAmount < 0 }">
            {{ carryOverAmount > 0 ? '+' : '' }}{{ formatCurrency(carryOverAmount) }}
          </span>
        </div>
        <div class="jar-card__row">
          <span class="jar-card__label">
            <q-icon name="account_balance_wallet" size="14px" class="q-mr-xs" />
            Asignado
          </span>
          <span class="jar-card__value">{{ formatCurrency(balance?.asignado || 0) }}</span>
        </div>
        <div class="jar-card__row">
          <span class="jar-card__label">
            <q-icon name="trending_down" size="14px" class="q-mr-xs" />
            Gastado
          </span>
          <span class="jar-card__value text-negative">-{{ formatCurrency(balance?.gastado || 0) }}</span>
        </div>
        <div v-if="(balance?.retiros || 0) !== 0" class="jar-card__row">
          <span class="jar-card__label">
            <q-icon name="money_off" size="14px" class="q-mr-xs" />
            Retiros
          </span>
          <span class="jar-card__value text-negative">-{{ formatCurrency(balance?.retiros || 0) }}</span>
        </div>
        <div v-if="(balance?.ajuste || 0) !== 0" class="jar-card__row">
          <span class="jar-card__label">
            <q-icon name="tune" size="14px" class="q-mr-xs" />
            Ajuste manual
          </span>
          <span class="jar-card__value" :class="{ 'text-positive': (balance?.ajuste || 0) > 0, 'text-negative': (balance?.ajuste || 0) < 0 }">
            {{ (balance?.ajuste || 0) > 0 ? '+' : '' }}{{ formatCurrency(balance?.ajuste || 0) }}
          </span>
        </div>
        <div v-if="(balance?.transfers_in || 0) > 0" class="jar-card__row">
          <span class="jar-card__label">
            <q-icon name="call_received" size="14px" class="q-mr-xs" />
            Transferencias recibidas
          </span>
          <span class="jar-card__value text-positive">+{{ formatCurrency(balance?.transfers_in || 0) }}</span>
        </div>
        <div v-if="(balance?.transfers_out || 0) > 0" class="jar-card__row">
          <span class="jar-card__label">
            <q-icon name="call_made" size="14px" class="q-mr-xs" />
            Transferencias enviadas
          </span>
          <span class="jar-card__value text-negative">-{{ formatCurrency(balance?.transfers_out || 0) }}</span>
        </div>
        <div v-if="(balance?.leverage_in || 0) > 0" class="jar-card__row">
          <span class="jar-card__label">
            <q-icon name="swap_horiz" size="14px" class="q-mr-xs" />
            Apalancamiento recibido
          </span>
          <span class="jar-card__value text-info">+{{ formatCurrency(balance?.leverage_in || 0) }}</span>
        </div>
        <div v-if="(balance?.leverage_out || 0) > 0" class="jar-card__row">
          <span class="jar-card__label">
            <q-icon name="swap_horiz" size="14px" class="q-mr-xs" />
            Apalancamiento cedido
          </span>
          <span class="jar-card__value text-warning">-{{ formatCurrency(balance?.leverage_out || 0) }}</span>
        </div>
        <!-- Separator + total -->
        <div class="jar-card__row jar-card__row--total">
          <span class="jar-card__label"><strong>= Balance</strong></span>
          <span class="jar-card__value" :class="balanceClass">
            <strong>{{ formatCurrency(balance?.balance || 0) }}</strong>
          </span>
        </div>
      </div>
    </q-expansion-item>

    <!-- 7. Actions -->
    <div class="jar-card__actions q-mt-md">
      <div class="actions-row">
        <q-btn
          unelevated
          no-caps
          color="primary"
          icon="tune"
          label="Ajustar"
          :disable="loading ?? false"
          @click="emit('adjust')"
          class="action-btn"
        />
        <q-btn
          outline
          no-caps
          color="accent"
          icon="payments"
          label="Registrar uso"
          :disable="loading ?? false"
          @click="emit('withdraw')"
          class="action-btn"
        />
      </div>
      <div class="actions-row-secondary" v-if="showLeverage || (balance?.ajuste || 0) !== 0">
        <q-btn
          v-if="showLeverage"
          flat
          dense
          no-caps
          color="secondary"
          icon="swap_horiz"
          label="Apalancar"
          :disable="loading ?? false"
          @click="emit('leverage')"
          size="sm"
        />
        <q-btn
          v-if="(balance?.ajuste || 0) !== 0"
          flat
          dense
          no-caps
          color="grey-7"
          icon="refresh"
          label="Resetear ajuste"
          :disable="loading ?? false"
          @click="emit('reset')"
          size="sm"
        />
      </div>
    </div>

    <!-- Loading overlay -->
    <div v-if="loading" class="jar-card__loading">
      <q-spinner size="sm" color="primary" />
    </div>

    <!-- Error state -->
    <div v-if="error" class="jar-card__error q-mt-sm">
      <q-banner class="bg-negative text-white" dense>
        {{ error }}
      </q-banner>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  jar: Record<string, any>;
  balance?: {
    asignado: number;
    gastado: number;
    ajuste: number;
    retiros?: number;
    transfers_in?: number;
    transfers_out?: number;
    leverage_in?: number;
    leverage_out?: number;
    saldo_anterior?: number;
    balance: number;
    porcentaje_utilizado: number;
    modo_refresco?: 'acumulativo' | 'reinicio';
  } | null;
  loading?: boolean | null;
  error?: string | null;
  porcentajeUtilizado?: number | null;
  statusBalance?: 'low' | 'medium' | 'high' | 'full';
  /** Show leverage button */
  showLeverage?: boolean;
  /** Whether to use real income (true) or expected income (false) */
  useRealIncome?: boolean;
  /** Expected income (user-configured) */
  expectedIncome?: number;
  /** Calculated/real income (from transactions) */
  calculatedIncome?: number;
}

interface Emits {
  adjust: [];
  reset: [];
  refresh: [];
  withdraw: [];
  leverage: [];
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
  showLeverage: false,
  useRealIncome: false,
  expectedIncome: 0,
  calculatedIncome: 0,
});

const emit = defineEmits<Emits>();

/**
 * Whether this jar is accumulative
 */
const isAccumulative = computed(() =>
  props.jar.refresh_mode === 'accumulative' || props.balance?.modo_refresco === 'acumulativo'
);

/**
 * Carry-over amount from previous month (only relevant for accumulative)
 */
const carryOverAmount = computed(() =>
  isAccumulative.value ? (props.balance?.saldo_anterior ?? 0) : 0
);

/**
 * The active income being used for this jar (real or expected)
 */
const activeIncome = computed(() =>
  props.useRealIncome ? props.calculatedIncome : props.expectedIncome
);

/**
 * Label describing which income source is being used
 */
const incomeSourceLabel = computed(() =>
  props.useRealIncome ? 'ingreso real' : 'ingreso esperado'
);

/**
 * Preview: what the assigned amount would be given the current % and income
 */
const previewAssigned = computed(() => {
  if (!props.jar.active || activeIncome.value === 0) return 0;
  if (props.jar.type === 'percent') {
    return (activeIncome.value * (props.jar.percent || 0)) / 100;
  }
  return props.jar.fixedAmount || 0;
});

/**
 * Preview balance = previewAssigned - outflows (spent+adjust+retiros+transfers_out+leverage_out)
 */
const previewBalance = computed(() => {
  const b = props.balance;
  if (!b) return previewAssigned.value;
  const outflows = (b.gastado || 0)
    + (b.retiros ?? 0)
    + (b.transfers_out ?? 0)
    + (b.leverage_out ?? 0);
  const ajuste = b.ajuste ?? 0;
  const inExtra = (b.transfers_in ?? 0) + (b.leverage_in ?? 0) + (ajuste > 0 ? ajuste : 0);
  const outExtra = ajuste < 0 ? Math.abs(ajuste) : 0;
  return previewAssigned.value + inExtra - outflows - outExtra;
});

/**
 * Whether the preview assigned differs from the backend-stored assigned
 */
const hasAssignedDiff = computed(() => {
  if (!props.balance || props.jar.type !== 'percent') return false;
  return Math.abs(previewAssigned.value - (props.balance.asignado || 0)) > 0.01;
});

/**
 * Suggested amount based on expected income
 */
const suggestedAmountExpected = computed(() => {
  const income = props.expectedIncome;
  if (income === 0 || !props.jar.active) return 0;
  if (props.jar.type === 'percent') {
    return (income * (props.jar.percent || 0)) / 100;
  }
  return props.jar.fixedAmount || 0;
});

/**
 * Suggested amount based on real income
 */
const suggestedAmountReal = computed(() => {
  const income = props.calculatedIncome;
  if (income === 0 || !props.jar.active) return suggestedAmountExpected.value;
  if (props.jar.type === 'percent') {
    return (income * (props.jar.percent || 0)) / 100;
  }
  return props.jar.fixedAmount || 0;
});

/**
 * Show income suggestions when relevant
 */
const showSuggestions = computed(() => {
  return (
    (props.expectedIncome > 0 || props.calculatedIncome > 0) &&
    props.jar.active &&
    props.jar.type === 'percent'
  );
});

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(amount);
}

/**
 * Inflows = everything that adds to the budget
 * Outflows = everything that drains the budget (incl. negative adjustments)
 * % used = outflows / inflows — can exceed 100% when overdrawn
 */
const totalInflows = computed(() => {
  const b = props.balance;
  if (!b) return 0;
  let inflows = b.asignado || 0;
  const ajuste = b.ajuste ?? 0;
  if (ajuste > 0) inflows += ajuste;              // positive adjustment = more budget
  inflows += (b.transfers_in ?? 0) + (b.leverage_in ?? 0);
  return inflows;
});

const totalOutflows = computed(() => {
  const b = props.balance;
  if (!b) return 0;
  let outflows = (b.gastado || 0) + (b.retiros ?? 0);
  const ajuste = b.ajuste ?? 0;
  if (ajuste < 0) outflows += Math.abs(ajuste);    // negative adjustment = consumed budget
  outflows += (b.transfers_out ?? 0) + (b.leverage_out ?? 0);
  return outflows;
});

const isOverBudget = computed(() => (props.balance?.balance || 0) < 0);
const overBudgetAmount = computed(() => Math.abs(Math.min(props.balance?.balance || 0, 0)));

const effectiveUsedPct = computed(() => {
  const inflows = totalInflows.value;
  const outflows = totalOutflows.value;
  if (inflows <= 0) return outflows > 0 ? 100 : 0;
  return Math.round((outflows / inflows) * 100);   // NOT capped — can be >100
});

const progressColor = computed(() => {
  const pct = effectiveUsedPct.value;
  if (pct >= 90) return 'negative';
  if (pct >= 70) return 'warning';
  if (pct >= 30) return 'info';
  return 'positive';
});

const balanceClass = computed(() => {
  const balance = props.balance?.balance || 0;
  if (balance < 0) return 'text-negative';
  if (balance === 0) return 'text-warning';
  return 'text-positive';
});
</script>

<style scoped lang="scss">
/* ─────────────────────────────────────
   JarCard — optimized financial card
   Supports: light/dark mode, mobile/tablet/desktop
   ───────────────────────────────────── */

.jar-card {
  position: relative;
  padding: 16px;
  border-radius: 12px;
  background: var(--jar-card-bg, rgba(255, 255, 255, 0.97));
  border: 1px solid var(--jar-card-border, rgba(0, 0, 0, 0.08));
  box-shadow: 0 1px 8px var(--jar-card-shadow, rgba(0, 0, 0, 0.05));
  transition: box-shadow 200ms ease;
  -webkit-tap-highlight-color: transparent;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      box-shadow: 0 4px 16px var(--jar-card-shadow-hover, rgba(0, 0, 0, 0.1));
    }
  }
}

// ── Dark mode ──
.body--dark .jar-card {
  --jar-card-bg: rgba(30, 30, 30, 0.95);
  --jar-card-border: rgba(255, 255, 255, 0.08);
  --jar-card-shadow: rgba(0, 0, 0, 0.3);
  --jar-card-shadow-hover: rgba(0, 0, 0, 0.5);

  .jar-card__name { color: rgba(255, 255, 255, 0.92); }
  .jar-badge { background: rgba(255, 255, 255, 0.08); color: rgba(255, 255, 255, 0.7); }
  .jar-badge--accum { background: rgba(33, 150, 243, 0.15); color: #64b5f6; }
  .available-label { color: rgba(255, 255, 255, 0.5); }
  .available-meta { color: rgba(255, 255, 255, 0.45); }
  .available-amount {
    &.text-positive { color: #81c784; }
    &.text-negative { color: #ef5350; }
    &.text-warning { color: #ffa726; }
  }
  .stat-chip {
    background: rgba(255, 255, 255, 0.06);
    color: rgba(255, 255, 255, 0.7);
    &--spent { background: rgba(239, 83, 80, 0.12); color: #ef9a9a; }
    &--positive { background: rgba(76, 175, 80, 0.12); color: #a5d6a7; }
    &--negative { background: rgba(239, 83, 80, 0.12); color: #ef9a9a; }
  }
  .jar-card__label { color: rgba(255, 255, 255, 0.6); }
  .jar-card__value { color: rgba(255, 255, 255, 0.87); }
  .jar-card__breakdown { background: rgba(255, 255, 255, 0.04); }
  .jar-card__loading { background: rgba(30, 30, 30, 0.85); }
  .jar-card__suggestion {
    background: rgba(33, 150, 243, 0.1);
    color: rgba(255, 255, 255, 0.7);
  }
  .jar-card__preview {
    background: rgba(255, 152, 0, 0.1);
    border-color: rgba(255, 152, 0, 0.3);
    color: rgba(255, 255, 255, 0.7);
  }
  .jar-badge--income {
    background: rgba(33, 150, 243, 0.15);
    color: #64b5f6;
  }
}

// ── 1. Header ──
.jar-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 8px;
}

.jar-card__title-col {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-width: 0;
}

.jar-card__name {
  font-size: 15px;
  font-weight: 700;
  color: rgba(0, 0, 0, 0.87);
  line-height: 1.3;
  word-break: break-word;
}

.jar-card__badges {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.jar-badge {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  font-size: 11px;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 10px;
  background: rgba(0, 0, 0, 0.06);
  color: rgba(0, 0, 0, 0.6);
  white-space: nowrap;

  &--type {
    background: rgba(156, 39, 176, 0.1);
    color: #7b1fa2;
  }
  &--accum {
    background: rgba(33, 150, 243, 0.1);
    color: #1565c0;
  }
  &--reset {
    background: rgba(158, 158, 158, 0.1);
    color: rgba(0, 0, 0, 0.5);
  }
  &--income {
    background: rgba(33, 150, 243, 0.1);
    color: #1565c0;
    font-weight: 500;
  }
}

.jar-badge__src {
  font-size: 10px;
  font-weight: 400;
  opacity: 0.7;
  font-style: italic;
}

// ── 2. Available balance (hero section) ──
.jar-card__available {
  padding: 12px;
  background: linear-gradient(135deg, rgba(156, 39, 176, 0.06) 0%, rgba(103, 58, 183, 0.08) 100%);
  border: 1px solid rgba(156, 39, 176, 0.15);
  border-radius: 10px;
}

.available-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
}

.available-label {
  font-size: 11px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.45);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.available-amount {
  font-size: 24px;
  font-weight: 800;
  line-height: 1.1;
  font-variant-numeric: tabular-nums;

  &.text-negative { color: #c62828; }
  &.text-positive { color: #2e7d32; }
  &.text-warning { color: #e65100; }
}

.available-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 6px;
  font-size: 11px;
  color: rgba(0, 0, 0, 0.4);
  font-weight: 500;
}

// ── 3. Quick stats chips ──
.jar-card__stats {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.stat-chip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 8px;
  font-size: 12px;
  background: rgba(0, 0, 0, 0.04);
  color: rgba(0, 0, 0, 0.7);

  &--spent {
    background: rgba(211, 47, 47, 0.08);
    color: #c62828;
  }
  &--positive {
    background: rgba(46, 125, 50, 0.08);
    color: #2e7d32;
  }
  &--negative {
    background: rgba(211, 47, 47, 0.08);
    color: #c62828;
  }
}

.stat-chip__amount {
  font-weight: 700;
  font-variant-numeric: tabular-nums;
}

.stat-chip__label {
  font-weight: 500;
  opacity: 0.7;
}

// ── 4. Preview diff ──
.jar-card__preview {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: rgba(255, 152, 0, 0.08);
  border: 1px dashed rgba(255, 152, 0, 0.35);
  border-radius: 6px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.65);
  cursor: help;

  strong { font-weight: 700; }
}

// ── 5. Income suggestion ──
.jar-card__suggestion {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 10px;
  background: rgba(33, 150, 243, 0.07);
  border-radius: 6px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.6);

  strong { color: #1565c0; }
}

// ── 5. Breakdown detail ──
.jar-card__details {
  :deep(.q-expansion-item__container) {
    border: none;
  }
}

.jar-card__breakdown {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  padding: 10px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 8px;
}

.jar-card__row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: 3px 0;

  &:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  }

  &--total {
    margin-top: 4px;
    padding-top: 6px;
    border-top: 2px solid rgba(0, 0, 0, 0.1);
    border-bottom: none !important;
  }

  &--highlight {
    background: rgba(var(--q-primary-rgb, 25, 118, 210), 0.06);
    border-radius: 4px;
    padding: 4px 6px;
    margin: 2px -6px;
  }
}

.jar-card__label {
  color: rgba(0, 0, 0, 0.6);
  font-weight: 500;
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.jar-card__value {
  color: rgba(0, 0, 0, 0.87);
  font-weight: 600;
  text-align: right;
  font-variant-numeric: tabular-nums;

  &.text-negative { color: #c62828; }
  &.text-positive { color: #2e7d32; }
  &.text-warning { color: #e65100; }
  &.text-info { color: #1565c0; }
}

// ── 6. Actions ──
.jar-card__actions {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.actions-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;

  :deep(.q-btn) {
    font-weight: 600;
    font-size: 12px;
  }
}

.action-btn {
  min-width: 0;
}

.actions-row-secondary {
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
}

// ── Loading / Error ──
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
    padding: 6px 10px;
    font-size: 12px;
  }
}

// ── Responsive ──
@media (max-width: 599px) {
  .jar-card { padding: 12px; }
  .available-amount { font-size: 20px; }
  .actions-row { grid-template-columns: 1fr; }
}

@media (min-width: 600px) and (max-width: 1023px) {
  .available-amount { font-size: 22px; }
}

@supports (padding: env(safe-area-inset-bottom)) {
  .jar-card {
    padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
  }
}
</style>
