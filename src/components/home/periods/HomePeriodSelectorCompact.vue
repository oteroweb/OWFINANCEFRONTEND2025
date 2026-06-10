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
export type HomeIntervalKey = 'month' | 'week' | 'year';

interface Props {
  modelValue: HomeIntervalKey;
}

defineProps<Props>();

const emit = defineEmits<{
  'update:modelValue': [value: HomeIntervalKey];
  shift: [direction: -1 | 1];
}>();

const options: Array<{ label: string; value: HomeIntervalKey }> = [
  { label: 'Mensual', value: 'month' },
  { label: 'Semanal', value: 'week' },
  { label: 'Anual', value: 'year' },
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
