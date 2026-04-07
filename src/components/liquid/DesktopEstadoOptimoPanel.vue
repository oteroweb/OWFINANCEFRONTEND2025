<template>
  <transition name="optimo-fade">
    <div v-if="modelValue" class="optimo-backdrop" @click="emit('update:modelValue', false)" />
  </transition>

  <transition name="optimo-pop">
    <div v-if="modelValue" class="optimo-card" role="dialog" aria-label="Estado de Cántaros">
      <div class="optimo-card__header">
        <h4>Estado de Cántaros</h4>
        <button aria-label="Cerrar" @click="emit('update:modelValue', false)">
          <q-icon name="close" size="18px" />
        </button>
      </div>

      <p class="optimo-card__subtitle">
        Vista rápida de cómo va tu disponibilidad y el uso de tus cántaros.
      </p>

      <div class="optimo-card__list">
        <div class="optimo-item">
          <div class="optimo-item__left">
            <q-icon name="account_balance_wallet" size="20px" />
            <span>Disponibilidad</span>
          </div>
          <strong>{{ hiddenValue }}</strong>
        </div>

        <div class="optimo-item">
          <div class="optimo-item__left">
            <q-icon name="pie_chart" size="20px" />
            <span>% Disponible</span>
          </div>
          <strong>{{ fmtPercent(props.availabilityPercent) }}</strong>
        </div>

        <div class="optimo-item">
          <div class="optimo-item__left">
            <q-icon name="insights" size="20px" />
            <span>% Utilizado</span>
          </div>
          <strong>{{ fmtPercent(props.usedPercent) }}</strong>
        </div>
      </div>

      <button class="optimo-card__details" @click="emit('details')">Ver Detalles</button>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  modelValue?: boolean;
  totalAvailable?: number;
  availabilityPercent?: number;
  usedPercent?: number;
  currency?: string;
  isHidden?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  totalAvailable: 0,
  availabilityPercent: 0,
  usedPercent: 0,
  currency: '$',
  isHidden: false,
});

const emit = defineEmits<{
  'update:modelValue': [value: boolean];
  details: [];
}>();

function fmtPercent(value: number) {
  const safe = Math.max(0, Math.min(100, Number(value || 0)));
  return `${safe.toFixed(0)}%`;
}

const hiddenValue = computed(() => {
  if (props.isHidden) return `${props.currency}••••`;
  const amount = Number(props.totalAvailable || 0);
  return `${props.currency}${amount.toLocaleString('es', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
});
</script>

<style scoped lang="scss">
.optimo-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(15, 23, 42, 0.2);
  z-index: 69;
}

.optimo-card {
  position: fixed;
  left: 50%;
  bottom: 118px;
  transform: translateX(-50%);
  width: min(340px, calc(100vw - 24px));
  border-radius: 28px;
  padding: 18px;
  background: linear-gradient(145deg, #22c1c3 0%, #3b82f6 100%);
  color: #f8fafc;
  box-shadow: 0 18px 42px rgba(30, 58, 138, 0.25);
  z-index: 70;

  &__header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 12px;

    h4 {
      margin: 0;
      font-family: 'Manrope', 'DM Sans', sans-serif;
      font-size: 34px;
      line-height: 1;
      font-weight: 800;
    }

    button {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      border: none;
      background: rgba(255, 255, 255, 0.18);
      color: #e2e8f0;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
  }

  &__list {
    display: flex;
    flex-direction: column;
    gap: 10px;
    margin-bottom: 14px;
  }

  &__subtitle {
    margin: 0 0 12px;
    font-size: 13px;
    color: rgba(248, 250, 252, 0.84);
    line-height: 1.4;
  }

  &__details {
    width: 100%;
    height: 44px;
    border-radius: 9999px;
    border: 1px solid rgba(255, 255, 255, 0.45);
    background: rgba(255, 255, 255, 0.16);
    color: #f8fafc;
    font-weight: 700;
    font-size: 20px;
    cursor: pointer;
  }
}

.optimo-item {
  height: 64px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.18);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 14px;

  &__left {
    display: flex;
    align-items: center;
    gap: 10px;

    span {
      font-size: 20px;
      font-weight: 700;
    }
  }

  strong {
    font-size: 38px;
    line-height: 1;
    font-family: 'Manrope', 'DM Sans', sans-serif;
  }
}

.optimo-fade-enter-active,
.optimo-fade-leave-active {
  transition: opacity 180ms ease;
}

.optimo-fade-enter-from,
.optimo-fade-leave-to {
  opacity: 0;
}

.optimo-pop-enter-active,
.optimo-pop-leave-active {
  transition: transform 220ms cubic-bezier(0.23, 1, 0.32, 1), opacity 220ms ease;
}

.optimo-pop-enter-from,
.optimo-pop-leave-to {
  opacity: 0;
  transform: translateX(-50%) translateY(14px) scale(0.97);
}
</style>
