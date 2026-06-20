<template>
  <div class="period-compact row items-center no-wrap q-gutter-sm">
    <q-btn dense flat round icon="chevron_left" @click="emit('shift', -1)" />

    <q-select
      :model-value="modelValue"
      :options="options"
      emit-value
      map-options
      dense
      outlined
      class="period-compact__select"
      @update:model-value="(val) => emit('update:modelValue', val)"
    />

    <q-btn dense flat round icon="chevron_right" @click="emit('shift', 1)" />
  </div>
</template>

<script setup lang="ts">
import type { PeriodType } from 'stores/period';

interface Props {
  modelValue: PeriodType;
}

defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: PeriodType];
  shift: [direction: -1 | 1];
}>();

const options: Array<{ label: string; value: PeriodType }> = [
  { label: 'Día', value: 'day' },
  { label: 'Semanal', value: 'week' },
  { label: 'Quincenal', value: 'fortnight' },
  { label: 'Mensual', value: 'month' },
  { label: 'Trimestral', value: 'quarter' },
  { label: 'Semestral', value: 'semester' },
  { label: 'Anual', value: 'year' },
  { label: 'Todo', value: 'all' },
];
</script>

<style scoped lang="scss">
.period-compact {
  margin-bottom: 14px;
}

.period-compact__select {
  min-width: 160px;
}
</style>
