<template>
  <div class="hero-card">
    <!-- Decorative rings -->
    <div class="hero-card__deco" aria-hidden="true">
      <svg fill="none" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
        <circle cx="200" cy="200" r="150" stroke="white" stroke-width="40" />
        <circle cx="200" cy="200" r="250" stroke="white" stroke-width="20" />
      </svg>
    </div>

    <div class="hero-card__content">
      <!-- Top row: balance + period tabs -->
      <div class="hero-card__top">
        <div>
          <p class="hero-card__label">Balance Total Disponible</p>
          <div class="hero-card__amount-row">
            <h2 class="hero-card__amount">
              <template v-if="isLoading"><span class="hero-card__skeleton">––––––</span></template>
              <template v-else-if="isHidden">{{ currency }}••••••</template>
              <template v-else>{{ currency }}{{ formattedBalance }}</template>
            </h2>
            <button
              class="hero-card__eye"
              @click="$emit('toggle-hidden')"
              :aria-label="isHidden ? 'Mostrar balance' : 'Ocultar balance'"
            >
              <q-icon :name="isHidden ? 'visibility_off' : 'visibility'" size="22px" />
            </button>
          </div>
        </div>

        <!-- Period Tabs -->
        <div class="hero-card__periods">
          <button
            v-for="p in periods"
            :key="p.id"
            class="hero-card__period-btn"
            :class="{ 'hero-card__period-btn--active': activePeriod === p.id }"
            @click="$emit('period-change', p.id)"
          >{{ p.label }}</button>
        </div>
      </div>

      <!-- Income / Expense pills -->
      <div class="hero-card__metrics">
        <div class="hero-card__metric">
          <div class="hero-card__metric-icon hero-card__metric-icon--income">
            <q-icon name="arrow_upward" size="18px" />
          </div>
          <div>
            <p class="hero-card__metric-label">Ingresos</p>
            <p class="hero-card__metric-val">
              <span v-if="isLoading || isHidden">–</span>
              <span v-else>{{ currency }}{{ formattedIncome }}</span>
            </p>
          </div>
        </div>

        <div class="hero-card__metric">
          <div class="hero-card__metric-icon hero-card__metric-icon--expense">
            <q-icon name="arrow_downward" size="18px" />
          </div>
          <div>
            <p class="hero-card__metric-label">Gastos</p>
            <p class="hero-card__metric-val">
              <span v-if="isLoading || isHidden">–</span>
              <span v-else>{{ currency }}{{ formattedExpense }}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  balance?: number;
  income?: number;
  expense?: number;
  currency?: string;
  isLoading?: boolean;
  isHidden?: boolean;
  activePeriod?: 'monthly' | 'weekly' | 'yearly';
}

const props = withDefaults(defineProps<Props>(), {
  balance: 0,
  income: 0,
  expense: 0,
  currency: '$',
  isLoading: false,
  isHidden: false,
  activePeriod: 'monthly',
});

defineEmits<{
  'period-change': [period: string];
  'toggle-hidden': [];
}>();

const periods = [
  { id: 'monthly', label: 'Mensual' },
  { id: 'weekly', label: 'Semanal' },
  { id: 'yearly', label: 'Anual' },
];

const fmt = (n: number) =>
  n.toLocaleString('es', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formattedBalance = computed(() => fmt(props.balance));
const formattedIncome = computed(() => fmt(props.income));
const formattedExpense = computed(() => fmt(props.expense));
</script>

<style lang="scss" scoped>
.hero-card {
  background: linear-gradient(135deg, #1e3a8a 0%, #0ea5e9 100%);
  border-radius: 40px;
  padding: 48px;
  color: white;
  position: relative;
  overflow: hidden;
  box-shadow: 0 24px 48px rgba(30, 58, 138, 0.2);

  @media (max-width: 767px) {
    padding: 28px 24px;
    border-radius: 28px;
  }

  &__deco {
    position: absolute;
    top: 0;
    right: 0;
    width: 33%;
    height: 100%;
    opacity: 0.08;
    pointer-events: none;

    svg {
      width: 100%;
      height: 100%;
      transform: translateX(25%) scale(1.5);
    }
  }

  &__content {
    position: relative;
    z-index: 1;
  }

  &__top {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 32px;
    gap: 16px;
    flex-wrap: wrap;

    @media (max-width: 600px) {
      flex-direction: column;
      gap: 20px;
      margin-bottom: 24px;
    }
  }

  &__label {
    font-size: 11px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.18em;
    opacity: 0.7;
    margin: 0 0 12px;
  }

  &__amount-row {
    display: flex;
    align-items: flex-end;
    gap: 12px;
  }

  &__amount {
    font-family: 'Manrope', 'DM Sans', sans-serif;
    font-size: clamp(2rem, 5vw, 3.5rem);
    font-weight: 800;
    line-height: 1;
    margin: 0;
  }

  &__skeleton {
    opacity: 0.35;
    font-size: 2.5rem;
    animation: pulse 1.5s ease-in-out infinite;
  }

  &__eye {
    background: transparent;
    border: none;
    color: white;
    opacity: 0.6;
    cursor: pointer;
    padding: 4px;
    margin-bottom: 4px;
    border-radius: 8px;
    transition: opacity 160ms;

    &:hover { opacity: 1; }
  }

  &__periods {
    display: flex;
    gap: 4px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(8px);
    -webkit-backdrop-filter: blur(8px);
    padding: 5px;
    border-radius: 18px;
    border: 1px solid rgba(255, 255, 255, 0.12);
    align-self: flex-start;
    flex-shrink: 0;
  }

  &__period-btn {
    padding: 8px 18px;
    border-radius: 13px;
    border: none;
    background: transparent;
    color: white;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    opacity: 0.65;
    transition: all 160ms cubic-bezier(0.23, 1, 0.32, 1);

    &:hover { opacity: 0.9; }
    &:active { transform: scale(0.97); }

    &--active {
      background: white;
      color: #1e3a8a;
      opacity: 1;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.15);
    }
  }

  &__metrics {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
  }

  &__metric {
    display: flex;
    align-items: center;
    gap: 14px;
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    padding: 14px 22px;
    border-radius: 28px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }

  &__metric-icon {
    width: 38px;
    height: 38px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;

    &--income {
      background: rgba(16, 185, 129, 0.2);
      color: #34d399;
    }

    &--expense {
      background: rgba(239, 68, 68, 0.2);
      color: #f87171;
    }
  }

  &__metric-label {
    font-size: 10px;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.12em;
    opacity: 0.6;
    margin: 0 0 3px;
  }

  &__metric-val {
    font-family: 'Manrope', sans-serif;
    font-size: 17px;
    font-weight: 700;
    margin: 0;
  }
}

@keyframes pulse {
  0%, 100% { opacity: 0.35; }
  50% { opacity: 0.6; }
}
</style>
