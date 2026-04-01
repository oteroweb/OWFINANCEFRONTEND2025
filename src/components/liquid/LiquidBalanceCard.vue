<template>
  <div class="liquid-balance-card q-pa-xl column justify-between">
    <div class="row justify-between items-start">
      <div class="column">
        <span class="text-overline text-white opacity-60 tracking-widest uppercase">
          {{ label }}
        </span>
        <span class="text-h6 text-white text-editorial font-medium">
          {{ name }}
        </span>
      </div>
      <q-icon :name="icon" size="32px" class="text-white opacity-40" />
    </div>

    <div class="column q-mt-xl">
      <span class="text-h3 text-white text-editorial font-bold">
        {{ currency }}{{ formattedAmount }}
      </span>
      <div class="row items-center q-gutter-x-sm q-mt-xs">
        <div class="trend-pill row items-center q-px-sm q-py-xs" :class="trendClass">
          <q-icon :name="trendIcon" size="14px" />
          <span class="text-caption font-bold q-ml-xs">{{ trendValue }}%</span>
        </div>
        <span class="text-caption text-white opacity-40">vs last month</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  label?: string;
  name?: string;
  amount?: number | string;
  currency?: string;
  icon?: string;
  trendValue?: number;
}

const props = withDefaults(defineProps<Props>(), {
  label: 'Account Balance',
  name: 'Main Savings',
  amount: 0,
  currency: '$',
  icon: 'solar:wallet-bold-duotone',
  trendValue: 0
});

const formattedAmount = computed(() => {
  return Number(props.amount).toLocaleString(undefined, { minimumFractionDigits: 2 });
});

const trendClass = computed(() => {
  return props.trendValue >= 0 ? 'trend-up' : 'trend-down';
});

const trendIcon = computed(() => {
  return props.trendValue >= 0 ? 'arrow_upward' : 'arrow_downward';
});
</script>

<style lang="scss" scoped>
.liquid-balance-card {
  width: 100%;
  border-radius: 40px;
  background: linear-gradient(135deg, #0ea5e9 0%, #006591 100%);
  position: relative;
  overflow: hidden;
  box-shadow: 0 40px 80px rgba(14, 165, 233, 0.25);
  border: none !important;

  &::after {
    content: '';
    position: absolute;
    top: -50%;
    right: -20%;
    width: 200px;
    height: 200px;
    background: white;
    opacity: 0.1;
    filter: blur(80px);
    border-radius: 50%;
  }
}

.text-editorial {
  font-family: 'Manrope', sans-serif !important;
}

.font-medium { font-weight: 500; }
.font-bold { font-weight: 700; }
.opacity-60 { opacity: 0.6; }
.opacity-40 { opacity: 0.4; }
.tracking-widest { letter-spacing: 0.15em; }

.trend-pill {
  border-radius: 12px;
  &.trend-up {
    background: rgba(78, 222, 163, 0.2);
    color: #4edea3;
  }
  &.trend-down {
    background: rgba(255, 180, 171, 0.2);
    color: #ffb4ab;
  }
}
</style>
