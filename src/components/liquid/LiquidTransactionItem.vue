<template>
  <div class="liquid-transaction-item row items-center q-pa-lg q-mb-sm">
    <div class="row items-center q-gutter-x-md col">
      <div class="icon-container flex flex-center" :class="{ 'is-income': isIncome }">
        <q-icon :name="icon" size="24px" />
      </div>
      <div class="column">
        <span class="text-subtitle1 text-pure text-editorial font-bold leading-tight">
          {{ label }}
        </span>
        <span class="text-caption text-soft">
          {{ date }} • {{ category }}
        </span>
      </div>
    </div>
    <div class="column items-end">
      <span class="text-h6 text-editorial font-bold" :class="isIncome ? 'text-income' : 'text-pure'">
        {{ isIncome ? '+' : '-' }}{{ currency }}{{ amount }}
      </span>
      <span class="text-caption text-soft" v-if="account">
        {{ account }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  label: string;
  amount: string | number;
  date: string;
  category: string;
  isIncome?: boolean;
  currency?: string;
  icon?: string;
  account?: string;
}

withDefaults(defineProps<Props>(), {
  isIncome: false,
  currency: '$',
  icon: 'solar:card-2-bold-duotone'
});
</script>

<style lang="scss" scoped>
.liquid-transaction-item {
  border-radius: 24px;
  background: var(--surface-container-low);
  transition: all 0.3s ease;

  &:active {
    background: var(--surface-container);
    transform: scale(0.98);
  }
}

.icon-container {
  width: 48px;
  height: 48px;
  border-radius: 16px;
  background: var(--surface-container-highest);
  color: var(--text-soft);

  &.is-income {
    background: rgba(78, 222, 163, 0.1);
    color: #4edea3;
  }
}

.text-editorial { font-family: 'Manrope', sans-serif !important; }
.font-bold { font-weight: 700; }
.text-pure { color: var(--text-pure); }
.text-soft { color: var(--text-soft); }
.text-income { color: #4edea3; }
.leading-tight { line-height: 1.2; }
</style>
