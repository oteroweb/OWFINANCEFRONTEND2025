<template>
  <div class="period-chips">
    <button
      v-for="tab in tabs"
      :key="tab.value"
      class="period-chips__chip"
      :class="{ 'period-chips__chip--active': modelValue === tab.value }"
      @click="emit('update:modelValue', tab.value)"
    >
      {{ tab.label }}
    </button>
  </div>
</template>

<script setup lang="ts">
export type HomeIntervalKey = 'month' | 'week' | 'year';

interface Props {
  modelValue: HomeIntervalKey;
}

defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: HomeIntervalKey];
}>();

const tabs: Array<{ label: string; value: HomeIntervalKey }> = [
  { label: 'Mensual', value: 'month' },
  { label: 'Semanal', value: 'week' },
  { label: 'Anual', value: 'year' },
];
</script>

<style scoped lang="scss">
.period-chips {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 14px;
}

.period-chips__chip {
  border: none;
  border-radius: 9999px;
  background: #f1f4f6;
  color: #64748b;
  font-weight: 700;
  font-size: 12px;
  padding: 8px 14px;
  cursor: pointer;
  transition: all 160ms cubic-bezier(0.23, 1, 0.32, 1);

  .body--dark & {
    background: #222a3d;
    color: #94a3b8;
  }

  &:active {
    transform: scale(0.97);
  }
}

.period-chips__chip--active {
  background: #0ea5e9;
  color: #ffffff;
}
</style>
